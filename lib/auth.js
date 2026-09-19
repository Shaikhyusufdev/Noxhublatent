function checkAdmin(req, res) {
  const password = req.headers['x-admin-password'];
  if (!password || password !== process.env.ADMIN_PASSWORD) {
    res.status(401).json({ error: 'Wrong or missing admin password' });
    return false;
  }
  return true;
}

module.exports = { checkAdmin };
