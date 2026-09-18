import ast, hashlib, json, pathlib, re, shutil, sys, time
root = pathlib.Path('/opt/data/lila_game')
source = (root/'server.py').read_text()
original_hash = hashlib.sha256(source.encode()).hexdigest()
def change(old,new):
    global source
    assert source.count(old)==1, 'Unexpected server source: '+old[:65]
    source=source.replace(old,new,1)
change('from pydantic import BaseModel','from pydantic import BaseModel, Field\nimport time\nfrom lila_security import SecurityMiddleware')
change('from fastapi.responses import FileResponse, JSONResponse', 'from fastapi.responses import FileResponse, JSONResponse, RedirectResponse')
change('return FileResponse(os.path.join(tj_dir, "index.html"))', 'return RedirectResponse("https://tjadvaita.tech/", status_code=307)')
change('HOST = os.environ.get("LILA_HOST", "0.0.0.0")','HOST = "127.0.0.1"')
change('self.id = str(uuid.uuid4())[:8]','self.id = uuid.uuid4().hex\n        self.last_seen = time.monotonic()\n        self.busy = False')
change('app = FastAPI(title="Lila Game Server", version="1.0")','app = FastAPI(title="Lila Game Server", version="1.1", docs_url=None, redoc_url=None, openapi_url=None)\napp.add_middleware(SecurityMiddleware)')
change('    session_id: str = ""\n    message: str = ""','    session_id: str = Field(default="", max_length=32, pattern=r"^(?:[0-9a-f]{32})?$")\n    message: str = Field(default="", max_length=4000)')
change('async def chat(req: ChatRequest):','async def chat(req: ChatRequest):\n    if not req.message.strip():\n        raise HTTPException(400, "Enter a message")\n    now = time.monotonic()\n    for old_id, old_session in list(sessions.items()):\n        if not old_session.busy and now - old_session.last_seen > 7200:\n            del sessions[old_id]\n    if req.session_id and req.session_id not in sessions:\n        raise HTTPException(404, "This session has expired. Start a new game")\n    if not req.session_id and len(sessions) >= 500:\n        raise HTTPException(503, "The game is busy. Please try again later")')
change('    session = sessions[sid]\n    session.add_message','    session = sessions[sid]\n    if session.busy:\n        raise HTTPException(409, "Wait for the current reply")\n    session.last_seen = time.monotonic()\n    session.busy = True\n    session.add_message')
change('            data = resp.json()','            resp.raise_for_status()\n            data = resp.json()')
change('        reply = f"*The mirror clouds momentarily.* Error: {str(e)}"','        reply = "The connection is temporarily unavailable. Please try again shortly."\n    finally:\n        session.busy = False')
change('return JSONResponse({"status": "ok", "sessions": len(sessions)})','return JSONResponse({"status": "ok"})')
ast.parse(source)
html=(root/'static/index.html').read_text()
match=re.search(r'<script>\s*([\s\S]*?)</script>',html)
assert match, 'Missing game script'
script=match.group(1)
script=script.replace("    const data = await resp.json();", "    const data = await resp.json();\n    if (!resp.ok) throw new Error(typeof data.detail === 'string' ? data.detail : 'The request could not be completed.');")
script=script.replace("document.getElementById('chatInput').focus();", "document.getElementById('chatInput').focus();", 1)
script += "\ndocument.getElementById('resetBtn').addEventListener('click', resetGame);\ndocument.getElementById('sendBtn').addEventListener('click', sendMessage);\ndocument.getElementById('chatInput').addEventListener('keydown', event => { if(event.key === 'Enter') sendMessage(); });\n"
html=html[:match.start()]+'<script src="/lila/app.js?v=security-20260918" defer></script>'+html[match.end():]
html=html.replace('onclick="resetGame()"','id="resetBtn"').replace('onclick="sendMessage()"','').replace('onkeydown="if(event.key===\'Enter\')sendMessage()"','maxlength="4000"')
assert not re.search(r'\son(?:click|keydown)=',html)
csp="default-src 'self'; script-src 'self' https://static.cloudflareinsights.com; script-src-attr 'none'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://cloudflareinsights.com; object-src 'none'; base-uri 'none'; form-action 'none'; upgrade-insecure-requests"
html=html.replace('<meta charset="UTF-8">','<meta charset="UTF-8">\n<meta http-equiv="Content-Security-Policy" content="'+csp+'">\n<meta name="referrer" content="strict-origin-when-cross-origin">')
(root/'server_security_staged.py').write_text(source)
(root/'static/index_security_staged.html').write_text(html)
(root/'static/app_security_staged.js').write_text(script)
(root/'security-original-hash.txt').write_text(original_hash)
print('Staged backend and frontend hardening; current service unchanged')
