const jwt = require('jsonwebtoken');

exports.generateToken = (user) => {
  return jwt.sign({ id: user.id, role: user.role.name }, process.env.JWT_SECRET, {
    expiresIn: '1h',
  });
};
