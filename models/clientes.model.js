var mongoose = require('mongoose');

const ubicacionSchema = new mongoose.Schema({
  lng: Number,
  lat: Number,
  ubicacionNombre: String
});

var esquema = new mongoose.Schema({
  nombre: String,
  apellido: String,
  telefono: String,
  correo: String,
  contrasena: String,
  fechaNacimiento: String,
  ubicacion: ubicacionSchema,
  carreras: [mongoose.Schema.Types.ObjectId], // Referencia a los IDs de las carreras
  fechaRegistro: Date
});

module.exports = mongoose.model('clientes', esquema);
