const mongoose = require('mongoose');

const MedicalStaffSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  specialty: { type: String, required: true },
  phone: { type: String },
  status: { type: String, enum: ['Activo', 'Inactivo'], default: 'Activo' },
  assignedLocation: { type: mongoose.Schema.Types.ObjectId, ref: 'Location', required: true }
}, { timestamps: true });

module.exports = mongoose.model('MedicalStaff', MedicalStaffSchema);