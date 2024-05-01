const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const carreraSchema = new Schema({
  conductor: {
    id: Schema.Types.ObjectId,
    nombre: String
  },
  cliente: {
    id: Schema.Types.ObjectId,
    nombre: String
  },
  ubicacionInicio: {
    lng: Number,
    lat: Number,
    ubicacionNombre: String
  },
  ubicacionFinal: {
    lng: Number,
    lat: Number,
    ubicacionNombre: String
  },
  estado: Boolean,
  fecha: Date,
  factura: {
    metodoPago: String,
    total: Number
  }
});

module.exports = mongoose.model('carreras', carreraSchema);
