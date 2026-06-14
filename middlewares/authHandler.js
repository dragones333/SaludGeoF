const jwt = require('jsonwebtoken');

function checkJwt(req, res, next) {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(401).json({ message: 'Acceso denegado. No se proporcionó un token.' });
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Formato de token inválido.' });
  }

  try {
    const decoded = jwt.verify(token, 'SECRET_KEY_SEMESTRE');
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({ message: 'Token inválido o expirado.' });
  }
}

module.exports = { checkJwt };