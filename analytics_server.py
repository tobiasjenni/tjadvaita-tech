#!/usr/bin/env python3
"""
Analytics-enabled HTTP server for tjadvaita.tech
Logs all visits with geo lookup and serves an analytics dashboard.
"""
import http.server
import socketserver
import json
import os
import re
import time
import urllib.request
from datetime import datetime, timedelta
from pathlib import Path
from functools import lru_cache
from urllib.parse import urlparse, parse_qs

PORT = 8080
WEB_ROOT = "/opt/data/web"
LOG_DIR = Path("/opt/data/analytics")
LOG_DIR.mkdir(parents=True, exist_ok=True)

# Secret token for analytics dashboard access (set via env or generated)
ANALYTICS_TOKEN = os.environ.get("ANALYTICS_TOKEN", "tjadvaita-internal-2026")

# Rate limiting — simple in-memory per-IP limiter
import time as _time
from collections import defaultdict
RATE_LIMIT_WINDOW = 60       # seconds
RATE_LIMIT_MAX = 60          # max requests per window per IP
_rate_buckets = defaultdict(list)  # IP -> list of timestamps

def check_rate_limit(ip: str) -> bool:
    """Return True if request is allowed, False if rate limited."""
    now = _time.time()
    bucket = _rate_buckets[ip]
    # Expire old entries
    cutoff = now - RATE_LIMIT_WINDOW
    while bucket and bucket[0] < cutoff:
        bucket.pop(0)
    if len(bucket) >= RATE_LIMIT_MAX:
        return False
    bucket.append(now)
    return True

# GeoIP cache (IP -> country/city)
GEO_CACHE = {}


@lru_cache(maxsize=2000)
def geo_lookup(ip: str) -> dict:
    """Look up IP geolocation using ip-api.com (free, no key needed, 45 req/min)."""
    if ip in ("127.0.0.1", "::1", "localhost"):
        return {"country": "Local", "city": "Server", "region": ""}
    
    # Check cache on disk
    cache_file = LOG_DIR / f"geo_{ip.replace(':', '_')}.json"
    if cache_file.exists():
        try:
            return json.loads(cache_file.read_text())
        except Exception:
            pass
    
    try:
        url = f"http://ip-api.com/json/{ip}?fields=country,countryCode,city,region,regionName,timezone"
        req = urllib.request.Request(url, headers={"User-Agent": "TJAnalytics/1.0"})
        with urllib.request.urlopen(req, timeout=3) as resp:
            data = json.loads(resp.read())
            # Cache on disk
            cache_file.write_text(json.dumps(data))
            return data
    except Exception:
        return {"country": "Unknown", "city": "", "region": ""}


class AnalyticsHandler(http.server.SimpleHTTPRequestHandler):
    """HTTP handler with analytics logging."""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=WEB_ROOT, **kwargs)
    
    def log_visit(self):
        """Log a page visit with geo data."""
        ip = self.client_address[0]
        # Get real IP from Cloudflare headers
        cf_ip = self.headers.get("CF-Connecting-IP")
        if cf_ip:
            ip = cf_ip
        
        path = self.path.split("?")[0]
        referer = self.headers.get("Referer", "")
        user_agent = self.headers.get("User-Agent", "")[:200]
        country_header = self.headers.get("CF-IPCountry", "")  # Cloudflare geo header
        
        # Skip asset requests for cleaner logs
        if path.endswith((".css", ".js", ".png", ".jpg", ".svg", ".ico", ".woff2", ".woff")):
            return
        
        # Geo lookup (use Cloudflare header if available, else API)
        if country_header:
            geo = {"country": country_header, "city": "", "region": ""}
        else:
            geo = geo_lookup(ip)
        
        # Write to daily log
        today = datetime.utcnow().strftime("%Y-%m-%d")
        log_entry = {
            "timestamp": datetime.utcnow().isoformat(),
            "ip": ip[:15],  # Truncated for privacy
            "country": geo.get("country", "Unknown"),
            "city": geo.get("city", ""),
            "path": path,
            "referer": referer[:300],
            "user_agent_short": user_agent[:100],
        }
        
        log_file = LOG_DIR / f"visits_{today}.jsonl"
        with open(log_file, "a") as f:
            f.write(json.dumps(log_entry) + "\n")
    
    def check_token(self) -> bool:
        """Verify the analytics access token from query string."""
        parsed = urlparse(self.path)
        params = parse_qs(parsed.query)
        token = params.get("token", [""])[0]
        return token == ANALYTICS_TOKEN
    
    def do_GET(self):
        """Handle GET requests with analytics."""
        # Get client IP
        ip = self.client_address[0]
        cf_ip = self.headers.get("CF-Connecting-IP")
        if cf_ip:
            ip = cf_ip
        
        # Rate limit check
        if not check_rate_limit(ip):
            self.send_response(429)
            self.send_header("Content-Type", "text/plain")
            self.send_header("Retry-After", str(RATE_LIMIT_WINDOW))
            self.end_headers()
            self.wfile.write(b"429 Too Many Requests")
            return
        
        # Analytics dashboard endpoint (protected)
        if self.path.startswith("/analytics"):
            if not self.check_token():
                self.send_error(403, "Forbidden — access token required")
                return
            self.serve_analytics()
            return
        
        # API endpoint for analytics data (protected)
        if self.path.startswith("/api/analytics"):
            if not self.check_token():
                self.send_response(403)
                self.send_header("Content-Type", "application/json")
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Forbidden — access token required"}).encode())
                return
            self.serve_analytics_api()
            return
        
        # Log the visit
        self.log_visit()
        
        # Serve the file
        super().do_GET()
    
    def serve_analytics(self):
        """Serve the analytics dashboard page."""
        html = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Analytics — TJ Advaita</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:Inter,system-ui,sans-serif;background:#0a0a0f;color:#e0d8c8;padding:2rem}
h1{font-family:'Cormorant Garamond',serif;font-size:2.5rem;color:#d4a853;margin-bottom:0.5rem}
h2{font-family:'Cormorant Garamond',serif;font-size:1.4rem;color:#c9a84c;margin:1.5rem 0 0.8rem}
.sub{color:#888;font-size:0.9rem;margin-bottom:2rem}
.card{background:#14141f;border:1px solid #2a2a3a;border-radius:12px;padding:1.5rem;margin-bottom:1rem}
.stat{display:inline-block;margin-right:2rem;margin-bottom:1rem}
.stat .num{font-size:2.2rem;font-weight:700;color:#d4a853}
.stat .lbl{font-size:0.8rem;color:#888;text-transform:uppercase;letter-spacing:1px}
table{width:100%;border-collapse:collapse;margin-top:0.5rem}
th{text-align:left;color:#888;font-size:0.75rem;text-transform:uppercase;letter-spacing:1px;padding:0.5rem 0.8rem;border-bottom:1px solid #2a2a3a}
td{padding:0.5rem 0.8rem;border-bottom:1px solid #1a1a2a;font-size:0.9rem}
tr:hover{background:rgba(212,168,83,0.05)}
.bar{display:inline-block;height:4px;background:#d4a853;border-radius:2px;vertical-align:middle;margin-left:0.5rem}
.ref{max-width:400px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:inline-block}
.path{color:#c9a84c}
.country{font-weight:600}
@media(max-width:600px){body{padding:1rem}h1{font-size:1.8rem}.stat{margin-right:1rem}.stat .num{font-size:1.5rem}}
</style>
</head>
<body>
<h1>✦ TJ Advaita Analytics</h1>
<p class="sub">Privacy-first. No cookies. IPs truncated. Data stored locally.</p>

<div class="card" id="overview">
<h2>Overview</h2>
<div id="stats"></div>
</div>

<div class="card">
<h2>Top Countries</h2>
<table id="countries"><thead><tr><th>Country</th><th>Visits</th><th></th></tr></thead><tbody></tbody></table>
</div>

<div class="card">
<h2>Top Pages</h2>
<table id="pages"><thead><tr><th>Path</th><th>Visits</th></tr></thead><tbody></tbody></table>
</div>

<div class="card">
<h2>Recent Visitors</h2>
<table id="recent"><thead><tr><th>Time</th><th>Country</th><th>Page</th><th>Referrer</th></tr></thead><tbody></tbody></table>
</div>

<script>
async function load() {
    try {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token') || '';
        const r = await fetch('/api/analytics?days=7&token=' + encodeURIComponent(token));
        const d = await r.json();
        
        // Stats
        document.getElementById('stats').innerHTML = `
            <div class="stat"><div class="num">${d.total_visits}</div><div class="lbl">Visits (7d)</div></div>
            <div class="stat"><div class="num">${d.unique_ips}</div><div class="lbl">Unique Visitors</div></div>
            <div class="stat"><div class="num">${d.unique_countries}</div><div class="lbl">Countries</div></div>
            <div class="stat"><div class="num">${d.today_visits}</div><div class="lbl">Today</div></div>
        `;
        
        // Countries
        const maxC = Math.max(...d.countries.map(c => c.count), 1);
        document.querySelector('#countries tbody').innerHTML = d.countries.slice(0,15).map(c => 
            `<tr><td class="country">${c.country}</td><td>${c.count}</td><td><span class="bar" style="width:${(c.count/maxC)*200}px"></span></td></tr>`
        ).join('');
        
        // Pages
        const maxP = Math.max(...d.pages.map(p => p.count), 1);
        document.querySelector('#pages tbody').innerHTML = d.pages.slice(0,10).map(p => 
            `<tr><td class="path">${p.path || '/'}</td><td>${p.count}</td></tr>`
        ).join('');
        
        // Recent
        document.querySelector('#recent tbody').innerHTML = d.recent.map(v => 
            `<tr><td>${v.time}</td><td>${v.country}</td><td class="path">${v.path || '/'}</td><td class="ref" title="${v.referer || ''}">${v.referer || '-'}</td></tr>`
        ).join('');
        
    } catch(e) {
        document.getElementById('stats').innerHTML = '<p style="color:#888">Analytics data collecting... Check back after some visits.</p>';
    }
}
load();
</script>
</body>
</html>"""
        self.send_response(200)
        self.send_header("Content-Type", "text/html")
        self.send_header("Cache-Control", "no-cache")
        self.end_headers()
        self.wfile.write(html.encode())
    
    def serve_analytics_api(self):
        """API endpoint: returns analytics data as JSON."""
        parsed = urlparse(self.path)
        params = parse_qs(parsed.query)
        days = int(params.get("days", [7])[0])
        
        # Collect logs from the last N days
        cutoff = datetime.utcnow() - timedelta(days=days)
        visits = []
        
        for log_file in sorted(LOG_DIR.glob("visits_*.jsonl"), reverse=True):
            try:
                file_date = log_file.stem.replace("visits_", "")
                log_dt = datetime.strptime(file_date, "%Y-%m-%d")
                if log_dt < cutoff:
                    continue
            except Exception:
                pass
            
            try:
                for line in log_file.read_text().strip().split("\n"):
                    if line.strip():
                        visits.append(json.loads(line))
            except Exception:
                pass
        
        # Aggregate
        countries = {}
        pages = {}
        ips = set()
        today_count = 0
        today = datetime.utcnow().strftime("%Y-%m-%d")
        
        for v in visits:
            country = v.get("country", "Unknown")
            countries[country] = countries.get(country, 0) + 1
            path = v.get("path", "/")
            pages[path] = pages.get(path, 0) + 1
            ips.add(v.get("ip", ""))
            if v.get("timestamp", "").startswith(today):
                today_count += 1
        
        # Sort
        top_countries = sorted([{"country": k, "count": v} for k, v in countries.items()], 
                              key=lambda x: x["count"], reverse=True)
        top_pages = sorted([{"path": k, "count": v} for k, v in pages.items()], 
                          key=lambda x: x["count"], reverse=True)
        
        # Recent 30
        recent = []
        for v in sorted(visits, key=lambda x: x.get("timestamp", ""), reverse=True)[:30]:
            t = v.get("timestamp", "")[:16].replace("T", " ")
            recent.append({
                "time": t,
                "country": v.get("country", "?"),
                "path": v.get("path", "/"),
                "referer": v.get("referer", ""),
            })
        
        data = {
            "total_visits": len(visits),
            "unique_ips": len(ips),
            "unique_countries": len(countries),
            "today_visits": today_count,
            "countries": top_countries,
            "pages": top_pages,
            "recent": recent,
        }
        
        self.send_response(200)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Cache-Control", "no-cache")
        self.end_headers()
        self.wfile.write(json.dumps(data).encode())
    
    def log_message(self, format, *args):
        """Suppress default stderr logging."""
        pass  # We handle logging in log_visit()


if __name__ == "__main__":
    import sys
    print(f"TJ Advaita Analytics Server")
    print(f"Serving: {WEB_ROOT}")
    print(f"Port: {PORT}")
    print(f"Analytics: http://tjadvaita.tech/analytics")
    print(f"API: http://tjadvaita.tech/api/analytics?days=7")
    print(f"Logs: {LOG_DIR}")
    print()
    
    with socketserver.ThreadingTCPServer(("127.0.0.1", PORT), AnalyticsHandler) as httpd:
        httpd.serve_forever()
