const express = require('express');
const cors = require('cors');
const app = express();
const port = 5000;
var bodyParser = require('body-parser');

var DataBaseMongo = require('./utils/databaseMongo');
var llenarTransaccionales = require('./controllers/llenarTransaccionales.controller');
var extraccionesTablasHojas = require('./controllers/extraccionesTablasHoja.controller');
var extraccionesTablasTransaccionales = require('./controllers/extraccionesTablasTransaccionales.controller');

app.use(express.static('public')); //Se utiliza para ejecutar Middleware
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());


DataBaseMongo.conectar().then(() => {
    console.log('Conexión exitosa a la base de datos');

    //Se llenan los modelos de comentario y carreras en la base de datos
    llenarTransaccionales.llenarCarrerasComentarios().then(()=>{
        console.log("Se llenaron las carreras y comentarios (mil registros)");
            //Extraccion zonas restringidas
            extraccionesTablasHojas.zonasRestringidas().then(()=>{
                console.log("Extraccion de zonas restringidas");

                //Extraccion clientes
                extraccionesTablasTransaccionales.clientes().then(()=>{
                    console.log("Extraccion de clientes");

                    //Extraccion de conductores
                    extraccionesTablasTransaccionales.conductores().then(()=>{
                        console.log("Extraccion de conductores");

                        //Extraccion de Historicos
                        extraccionesTablasHojas.historicoUber().then(()=>{
                            console.log("Extraccion de historicos");

                            //Extraccion de Carreras
                            extraccionesTablasTransaccionales.carreras().then(()=>{
                                console.log("Extraccion de carreras");

                                //Extraccion de Comentarios
                                extraccionesTablasTransaccionales.comentarios().then(()=>{
                                    console.log("Extraccion de comentarios");

                                    console.log("EXTRACCIONES COMPLETADAS CORRECTAMENTE");
                                    
                                }).catch(error => {
                                    console.error('Error al extraer carreras', error);
                                });

                            }).catch(error => {
                                console.error('Error al extraer carreras', error);
                            });
                            
                        }).catch(error => {
                            console.error('Error al extraer historicos', error);
                        });

                        
                    }).catch(error => {
                        console.error('Error al extraer conductores', error);
                    });

                }).catch(error => {
                    console.error('Error al extraer clientes', error);
                });

            }).catch(error => {
                console.error('Error al extraer zonas restringidas', error);
            });
  
    }).catch(error => {
        console.error('Error al extraer historicos', error);
    });

}).catch(error => {
    console.error('Error al conectar a la base de datos:', error);
});

app.listen(port, () => {
    console.log(`Servidor levantado en el puerto: ${port}`);
})