const express = require('express');
const router = express.Router();
const StaffService = require('../services/staffService');

const service = new StaffService();

/**
 * @swagger
 * /api/staff:
 *   get:
 *     summary: Listar personal médico junto con los datos poblados de su hospital asignado
 *     responses:
 *       200:
 *         description: Lista de personal con populate de referencias relacionales
 */
router.get('/', async (req, res, next) => {
  try {
    const staff = await service.getAll();
    res.json(staff);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/staff:
 *   post:
 *     summary: Dar de alta un nuevo miembro del personal médico adscrito a una sede
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName:
 *                 type: string
 *               specialty:
 *                 type: string
 *               phone:
 *                 type: string
 *               status:
 *                 type: string
 *               assignedLocation:
 *                 type: string
 *     responses:
 *       201:
 *         description: Personal médico creado y enlazado correctamente
 */
router.post('/', async (req, res, next) => {
  try {
    const newStaff = await service.create(req.body);
    res.status(201).json(newStaff);
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/staff/{id}:
 *   patch:
 *     summary: Modificar la información de adscripción o estatus de un médico
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
 *               fullName:
 *                 type: string
 *               specialty:
 *                 type: string
 *               phone:
 *                 type: string
 *               status:
 *                 type: string
 *               assignedLocation:
 *                 type: string
 *     responses:
 *       200:
 *         description: Datos actualizados exitosamente
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
 * /api/staff/{id}:
 *   delete:
 *     summary: Remover registro de personal médico por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Registro eliminado correctamente
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