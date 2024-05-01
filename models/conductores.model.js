const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const carroSchema = new Schema({
  marca: String,
  color: String,
  placa: String,
  anio: Number,
  fechaInicio: Date
});

const conductorSchema = new Schema({
  nombre: String,
  apellido: String,
  telefono: String,
  correo: String,
  contrasena: String,
  fechaNacimiento: Date,
  fechaContratacion: Date,
  disponible: Boolean,
  tipoUber:Schema.Types.ObjectId,
  carro: carroSchema
});

module.exports = mongoose.model('conductores', conductorSchema);
