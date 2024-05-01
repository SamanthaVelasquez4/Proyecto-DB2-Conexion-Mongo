const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const historicoSchema = new Schema({
  idConductor: Schema.Types.ObjectId,
  marca: String,
  color: String,
  placa: String,
  anio: Number,
  fechaInicio: Date,
  fechaFinal: Date
});

module.exports = mongoose.model('historicoubers', historicoSchema);
