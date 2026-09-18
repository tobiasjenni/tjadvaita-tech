"""Bounded request handling for the public Lila application."""
import asyncio
import ipaddress
import json
import time
from collections import OrderedDict

class SecurityMiddleware:
    def __init__(self, app):
        self.app = app
        self.rates = OrderedDict()
        self.active = 0

    async def __call__(self, scope, receive, send):
        if scope['type'] != 'http':
            return await self.app(scope, receive, send)
        original_send = send
        async def secure_send(message):
            if message['type'] == 'http.response.start':
                extra = {
                    b'cache-control': b'no-store',
                    b'x-content-type-options': b'nosniff',
                    b'referrer-policy': b'strict-origin-when-cross-origin',
                    b'content-security-policy': b"default-src 'self'; script-src 'self' https://static.cloudflareinsights.com; script-src-attr 'none'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self' https://cloudflareinsights.com; object-src 'none'; base-uri 'none'; form-action 'none'; frame-ancestors 'self' https://tjadvaita.tech https://www.tjadvaita.tech"
                }
                message = dict(message, headers=[(k,v) for k,v in message.get('headers',[]) if k.lower() not in extra]+list(extra.items()))
            await original_send(message)
        send = secure_send
        headers = {k.lower(): v for k, v in scope.get('headers', [])}
        async def reject(status, message):
            body = json.dumps({'detail': message}).encode()
            await send({'type':'http.response.start','status':status,'headers':[(b'content-type',b'application/json'),(b'cache-control',b'no-store'),(b'x-content-type-options',b'nosniff')]})
            await send({'type':'http.response.body','body':body})
        path = scope.get('path', '')
        if path not in ('/api/chat', '/api/reset'):
            return await self.app(scope, receive, send)
        if scope['method'] != 'POST':
            return await reject(405, 'Method not allowed')
        origin = headers.get(b'origin', b'').decode('latin1')
        if origin and origin not in ('https://lila.tjadvaita.tech','https://tjadvaita.tech','https://www.tjadvaita.tech'):
            return await reject(403, 'Origin not allowed')
        if headers.get(b'content-type', b'').split(b';')[0].strip().lower() != b'application/json':
            return await reject(415, 'Use application/json')
        peer = (scope.get('client') or ('unknown', 0))[0]
        try:
            if ipaddress.ip_address(peer).is_loopback:
                peer = str(ipaddress.ip_address(headers.get(b'cf-connecting-ip', peer.encode()).decode()))
        except ValueError:
            pass
        now = time.monotonic()
        old = self.rates.pop(peer, [])
        recent = [stamp for stamp in old if now-stamp < 60]
        self.rates[peer] = recent
        while len(self.rates) > 4096:
            self.rates.popitem(last=False)
        if len(recent) >= 30:
            return await reject(429, 'Please wait before sending another message')
        recent.append(now)
        if self.active >= 4:
            return await reject(503, 'The game is busy. Please try again shortly')
        try:
            if int(headers.get(b'content-length', b'0')) > 32768:
                return await reject(413, 'Message too large')
        except ValueError:
            return await reject(400, 'Invalid content length')
        chunks = []
        size = 0
        self.active += 1
        try:
            while True:
                try:
                    message = await asyncio.wait_for(receive(), timeout=max(0.001, 10 - (time.monotonic() - now)))
                except asyncio.TimeoutError:
                    return await reject(408, 'Request timed out')
                if message['type'] == 'http.disconnect':
                    return
                chunk = message.get('body', b'')
                size += len(chunk)
                if size > 32768:
                    return await reject(413, 'Message too large')
                chunks.append(chunk)
                if not message.get('more_body', False):
                    break
            delivered = False
            async def replay():
                nonlocal delivered
                if not delivered:
                    delivered = True
                    return {'type':'http.request','body':b''.join(chunks),'more_body':False}
                return await receive()
            await self.app(scope, replay, send)
        finally:
            self.active -= 1
