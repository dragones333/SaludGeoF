const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class AuthService {
  async register(userData) {
    const { username, email, password } = userData;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const newUser = new User({
      username,
      email,
      password: hashedPassword
    });
    
    const savedUser = await newUser.save();
    const { password: _, ...userWithoutPassword } = savedUser.toObject();
    return userWithoutPassword;
  }

  async login(username, password) {
    const user = await User.findOne({ username });
    if (!user) throw new Error('Credenciales incorrectas');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Credenciales incorrectas');

    const token = jwt.sign({ id: user._id, username: user.username }, 'SECRET_KEY_SEMESTRE', { expiresIn: '8h' });
    
    return {
      token,
      user: { id: user._id, username: user.username, email: user.email }
    };
  }
}

module.exports = AuthService;