const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const comentarioSchema = new Schema({
  conductor: {
    id: Schema.Types.ObjectId,
    nombre: String
  },
  cliente: {
    id: Schema.Types.ObjectId,
    nombre: String
  },
  comentario: String,
  puntuacion: Number,
  fecha: Date,
  carrera: Schema.Types.ObjectId
});

module.exports = mongoose.model('comentarios', comentarioSchema);
