const express = require('express');
const router = express.Router();
const AuthService = require('../services/authService');

const service = new AuthService();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario o personal sanitario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario registrado exitosamente
 */
router.post('/register', async (req, res, next) => {
  try {
    const user = await service.register(req.body);
    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión en el sistema sanitario
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso, retorna información del usuario y token JWT
 */
router.post('/login', async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const result = await service.login(username, password);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;