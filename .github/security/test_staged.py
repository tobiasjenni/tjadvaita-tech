import asyncio, sys, time
sys.path.insert(0, '/opt/data/.python-packages')
sys.path.insert(0, '/opt/data/lila_game')
import httpx
import server_security_staged as s

async def main():
    transport=httpx.ASGITransport(app=s.app)
    async with httpx.AsyncClient(transport=transport,base_url='http://localhost') as c:
        async def post(path,payload,**kw):
            return await c.post(path,json=payload,**kw)
        assert (await c.get('/api/health',headers={'Host':'temporary.trycloudflare.com'})).status_code==421
        r=await post('/api/chat',{'message':'Security test: creative work'})
        assert r.status_code==200, r.text
        sid=r.json()['session_id']
        assert len(sid)==32 and int(sid,16)>=0
        assert r.headers['cache-control']=='no-store'
        assert "script-src-attr 'none'" in r.headers['content-security-policy']
        assert (await post('/api/chat',{'message':'x'*4001})).status_code==422
        assert (await post('/api/chat',{'session_id':'12345678','message':'x'})).status_code==422
        assert (await post('/api/chat',{'session_id':'a'*32,'message':'x'})).status_code==404
        assert (await post('/api/chat',{'message':' '})).status_code==400
        assert (await post('/api/chat',{'message':'x'},headers={'Origin':'https://untrusted.example'})).status_code==403
        assert (await c.post('/api/chat',content='x',headers={'Content-Type':'text/plain'})).status_code==415
        assert (await c.post('/api/chat',content=b'x'*32769,headers={'Content-Type':'application/json'})).status_code==413
        async def chunks():
            yield b'x'*16000
            yield b'x'*17000
        assert (await c.post('/api/chat',content=chunks(),headers={'Content-Type':'application/json'})).status_code==413
        s.sessions[sid].busy=True
        assert (await post('/api/chat',{'session_id':sid,'message':'x'})).status_code==409
        s.sessions[sid].busy=False
        s.sessions[sid].last_seen=time.monotonic()-7201
        assert (await post('/api/chat',{'session_id':sid,'message':'x'})).status_code==404
        assert not s.sessions
        for n in range(500):
            s.sessions[str(n)] = s.GameSession()
        assert (await post('/api/chat',{'message':'x'})).status_code==503
        s.sessions.clear()
        sid=(await post('/api/chat',{'message':'test'})).json()['session_id']
        assert (await post('/api/reset',{'session_id':sid})).status_code==200
        assert sid not in s.sessions
        assert (await c.get('/api/health')).json()=={'status':'ok'}
        assert (await c.get('/openapi.json')).status_code==404
        assert (await c.get('/')).status_code==307
        statuses=[]
        for _ in range(32):
            statuses.append((await post('/api/reset',{'session_id':''})).status_code)
        assert 429 in statuses
        s.sessions.clear()
    print('PASS: identifiers, validation, payload limits, origin checks, session expiry/capacity, concurrency, reset, headers, hidden schema, and rate limit')
asyncio.run(main())
