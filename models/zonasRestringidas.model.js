const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const zonaRestringidaSchema = new Schema({
  lng: Number,
  lat: Number,
  ubicacionNombre: String
});

module.exports = mongoose.model('zonasrestringidas', zonaRestringidaSchema);
