var mongoose = require('mongoose');
var DataBaseMongo ={};

DataBaseMongo.conectar= async()=> {
    try {

      const url = 'mongodb+srv://samvel200355:samvel200355@cluster0.tmaxqwh.mongodb.net/Uber';
      // Conectar a la base de datos
      await mongoose.connect(url);
    } catch (error) {
      
      throw error; // Rechazar la promesa con el error
    }
  }

module.exports = DataBaseMongo;