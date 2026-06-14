const express = require('express');
const router = express.Router();
const LocationService = require('../services/locationService');

const service = new LocationService();

/**
 * @swagger
 * /api/locations:
 *   get:
 *     summary: Obtener lista de ubicaciones de salud o filtrar por nombre
 *     parameters:
 *       - in: query
 *         name: name
 *         schema:
 *           type: string
 *         description: Nombre de la ubicación a buscar
 *     responses:
 *       200:
 *         description: Lista de ubicaciones encontradas
 */
router.get('/', async (req, res, next) => {
  try {
    const { name } = req.query;
    if (name) {
      const locations = await service.getByName(name);
      return res.json(locations);
    }
    const locations = await service.getAll();
    res.json(locations);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/locations:
 *   post:
 *     summary: Crear una nueva ubicación médica exacta en el mapa
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
 *               lat:
 *                 type: number
 *               lng:
 *                 type: number
 *     responses:
 *       201:
 *         description: Ubicación almacenada correctamente
 */
router.post('/', async (req, res, next) => {
  try {
    const newLocation = await service.create(req.body);
    res.status(201).json(newLocation);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/locations/{id}:
 *   patch:
 *     summary: Actualizar datos de una ubicación por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
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
 *     responses:
 *       200:
 *         description: Ubicación editada con éxito
 */
router.patch('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const updated = await service.update(id, req.body);
    res.json(updated);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/locations/{id}:
 *   delete:
 *     summary: Eliminar una ubicación médica del mapa por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Ubicación eliminada correctamente
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