module.exports = function (req, res, next) {
  // Add common protected routes here. Extend this list as your app grows.
  const protectedPaths = [
    '/dashboard', '/create', '/update', '/contact',
    '/contacts', '/profile', '/settings', '/admin', '/users'
  ];
  try {
    const url = req.url.split('?')[0];
    if (protectedPaths.some(p => url === p || url.startsWith(p + '/'))) {
      const cookieHeader = req.headers && req.headers.cookie;
      const hasToken = cookieHeader && cookieHeader.split(';').some(c => c.trim().startsWith('token='));
      if (!hasToken) {
        res.writeHead(302, { Location: '/login' });
        return res.end();
      }
    }
  } catch (e) {
    // fallback to next on any error
  }
  next();
};
