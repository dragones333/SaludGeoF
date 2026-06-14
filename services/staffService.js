const MedicalStaff = require('../models/MedicalStaff');

class StaffService {
  async create(data) {
  const newStaff = new MedicalStaff(data);
  const saved = await newStaff.save();
  return await MedicalStaff.populate(saved, { path: 'assignedLocation' });
}

  async getAll() {
    return await MedicalStaff.find().populate('assignedLocation');
  }

  async update(id, changes) {
    const updated = await MedicalStaff.findByIdAndUpdate(id, changes, { new: true }).populate('assignedLocation');
    if (!updated) throw new Error('Miembro del personal no encontrado');
    return updated;
  }

  async delete(id) {
    const deleted = await MedicalStaff.findByIdAndDelete(id);
    if (!deleted) throw new Error('Miembro del personal no encontrado');
    return { id };
  }
}

module.exports = StaffService;