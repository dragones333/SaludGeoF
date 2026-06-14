const Location = require('../models/Location');

class LocationService {
  async create(data) {
    const newLocation = new Location(data);
    return await newLocation.save();
  }

  async getAll() {
    return await Location.find();
  }

  async getByName(name) {
    return await Location.find({ name: { $regex: name, $options: 'i' } });
  }

  async update(id, changes) {
    const updated = await Location.findByIdAndUpdate(id, changes, { new: true });
    if (!updated) throw new Error('Location not found');
    return updated;
  }

  async delete(id) {
    const deleted = await Location.findByIdAndDelete(id);
    if (!deleted) throw new Error('Location not found');
    return { id };
  }
}

module.exports = LocationService;