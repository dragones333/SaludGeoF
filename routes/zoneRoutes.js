const express = require('express');
const router = express.Router();
const ZoneService = require('../services/zoneService');

const service = new ZoneService();

/**
 * @swagger
 * /api/zones:
 *   get:
 *     summary: Obtener todas las zonas de cobertura o sanitarias trazadas
 *     responses:
 *       200:
 *         description: Lista de zonas con sus arrays de coordenadas geométricas
 */
router.get('/', async (req, res, next) => {
  try {
    const zones = await service.getAll();
    res.json(zones);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/zones:
 *   post:
 *     summary: Almacenar una nueva figura/zona trazada en el mapa
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               coordinates:
 *                 type: array
 *                 items:
 *                   type: array
 *                   items:
 *                     type: number
 *     responses:
 *       201:
 *         description: Zona resguardada permanentemente
 */
router.post('/', async (req, res, next) => {
  try {
    const newZone = await service.create(req.body);
    res.status(201).json(newZone);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/zones/{id}:
 *   delete:
 *     summary: Borrar un trazo de zona por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Zona removida de la base de datos
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await service.delete(id);
    res.json(result);
  } catch (error) {
    next(error);
  }
});

module.exports = router;