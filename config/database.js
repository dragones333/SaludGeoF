const mongoose = require('mongoose');
const dns = require('dns');

dns.setServers(['8.8.8.8', '8.8.4.4']);

const MONGO_URI = "mongodb+srv://orlandoabta:Dragon333@georef72.dcgsid7.mongodb.net/salud_db?retryWrites=true&w=majority&appName=georef72";

function connectDB() {
  mongoose.connect(MONGO_URI)
    .then(() => console.log('✅ Conectado exitosamente a MongoDB Atlas (Vía DNS Google)'))
    .catch(err => {
      console.error('❌ Error crítico al conectar a MongoDB:', err);
      process.exit(1);
    });
}

module.exports = connectDB;