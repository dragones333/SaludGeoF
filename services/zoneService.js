const Zone = require('../models/Zone');

class ZoneService {
  async create(data) {
    const newZone = new Zone(data);
    return await newZone.save();
  }

  async getAll() {
    return await Zone.find();
  }

  async delete(id) {
    const deleted = await Zone.findByIdAndDelete(id);
    if (!deleted) throw new Error('Zona no encontrada');
    return { id };
  }
}

module.exports = ZoneService;