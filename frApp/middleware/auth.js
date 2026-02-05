export default function (context) {
  const { route, redirect, req, res } = context;
  const publicPaths = ['/', '/login', '/register', '/contact', '/inspire', '/index'];
  // allow public routes
  if (publicPaths.includes(route.path)) return;

  // Helper: decode JWT payload (works both server and client)
  function decodeJwt(token) {
    try {
      const parts = token.split('.');
      if (parts.length < 2) return null;
      const payload = parts[1];
      let json = '';
      if (process.server) {
        json = Buffer.from(payload, 'base64').toString('utf8');
      } else {
        // browser
        const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
        // handle utf8
        try { json = decodeURIComponent(escape(decoded)); } catch (e) { json = decoded; }
      }
      return JSON.parse(json);
    } catch (e) {
      return null;
    }
  }

  function tokenFromCookieString(cookieHeader) {
    if (!cookieHeader) return null;
    const match = cookieHeader.split(';').map(s => s.trim()).find(s => s.startsWith('token='));
    if (!match) return null;
    return match.split('=')[1];
  }

  // Validate token and expiry, clearing token and redirecting if expired/missing
  function handleToken(token) {
    if (!token) return false;
    const payload = decodeJwt(token);
    if (!payload) return false;
    if (payload.exp && (payload.exp * 1000) < Date.now()) {
      // expired
      try {
        if (process.client) {
          localStorage.removeItem('token');
          document.cookie = 'token=; Path=/; Max-Age=0; SameSite=Lax';
        }
        if (process.server && res && typeof res.setHeader === 'function') {
          res.setHeader('Set-Cookie', 'token=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax');
        }
      } catch (e) {}
      return false;
    }
    return true;
  }

  // Server-side: check for token cookie in request headers and validate expiry
  if (process.server) {
    const cookieHeader = req && req.headers && req.headers.cookie;
    const token = tokenFromCookieString(cookieHeader);
    const ok = handleToken(token);
    if (!ok) return redirect('/login');
    return;
  }

  // Client-side: check localStorage token or cookie and validate expiry
  if (process.client) {
    let token = null;
    try { token = localStorage.getItem('token'); } catch (e) { token = null; }
    // fallback to cookie if localStorage not available
    if (!token && typeof document !== 'undefined') token = tokenFromCookieString(document.cookie);
    const ok = handleToken(token);
    if (!ok) return redirect('/login');
  }
}
