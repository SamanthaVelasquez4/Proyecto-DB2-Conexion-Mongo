const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const tipoUberSchema = new Schema({
  descripcion: String,
  precioBase: Number,
  precioXkm: Number
});

module.exports = mongoose.model('tipoubers', tipoUberSchema);
