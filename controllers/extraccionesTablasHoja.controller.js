var extraccionesTablasHojas = {};

//modelos
var zonasRestringidaSchema  = require('../models/zonasRestringidas.model');
var historicoUberSchema  = require('../models/historicoUbers.model');

//Elementos conexion oracle
const oracledb = require('oracledb');
const dbConfig = require('../utils/databaseOracle');


extraccionesTablasHojas.zonasRestringidas = async()=>{

    bandera = true;

    // Hacer la conexión
    const connection = await oracledb.getConnection(dbConfig);

    // Opciones para realizar el commit
    const options = {
        outFormat: oracledb.OUT_FORMAT_OBJECT
    };

    try {
        // Utilizar el método find() para obtener todos los documentos del modelo
        const zonasRestringidas = await zonasRestringidaSchema.find();
        //console.log(zonasRestringidas);

        //Hacer un truncate de la tabla
        const secuenciaSQL = `TRUNCATE TABLE TBL_ZONAS_RESTRINGIDAS`;
    
        // Ejecutar la consulta
        const result = await connection.execute(secuenciaSQL,[],options);
        //console.log(result);

        // Iterar sobre cada modelo y realizar la inserción
        for (const zonaRestringida of zonasRestringidas) {
            
            // Secuencia SQL 
            const secuenciaSQL = `INSERT INTO tbl_zonas_restringidas ( id_zona_restringida, lng, lat, ubicacion_nombre )
            VALUES ( :idZonaRestringida, :lng, :lat, :ubicacionNombre )`;
    
            // Objeto consumidor
            const binds = {
                idZonaRestringida: zonaRestringida._id.toString(),
                lng: zonaRestringida.lng,
                lat: zonaRestringida.lat,
                ubicacionNombre: zonaRestringida.ubicacionNombre
            };
            
            // Ejecutar la consulta
            const result = await connection.execute(secuenciaSQL, binds, options);
    
        }
    } catch (error) {

        bandera = false;

        await connection.execute('ROLLBACK', [], options);
        
        //Hacer log
        const secuenciaSQL = 
        `BEGIN
            P_INSERT_LOG(P_nombre => 'EXTRACCION_ZONAS_RESTRINGIDAS',
            P_fecha_inicio => :fechaInicio,
            P_nombre_base => 'Uber',
            P_exito => 'Fail',
            P_error => :error); 
        END;`;

        const binds = {
            fechaInicio: new Date(),
            error: error.message
        };

        await connection.execute(secuenciaSQL, binds, options);
    }

    if(bandera){
        // Hacer Commit
        await connection.execute('COMMIT', [], options);

        //Hacer log
        const secuenciaSQL = 
        `BEGIN
            P_INSERT_LOG(P_nombre => 'EXTRACCION_ZONAS_RESTRINGIDAS',
            P_fecha_inicio => :fechaInicio,
            P_nombre_base => 'Uber',
            P_exito => 'SUCCESS',
            P_error => NULL); 
        END;`;

        const binds = {
            fechaInicio: new Date(),
        };

        await connection.execute(secuenciaSQL, binds, options);
    }

    // Cerrar la conexión 
    await connection.close();
};

extraccionesTablasHojas.historicoUber = async()=>{
    var badera= true;
    var hoy = new Date(); // Obtener la fecha de hoy
    var ayer = new Date(hoy); // Crear una copia de la fecha de hoy
    ayer.setDate(hoy.getDate() - 1); // Restar 1 día para obtener la fecha de ayer

    //Variables
    fechaInicio = '';
    fechaFinal = new Date(ayer.getFullYear(), ayer.getMonth(), ayer.getDate());
    fechaRegistro = '';
    resultado = '';

    //console.log(fechaFinal);

    // Hacer la conexión
    const connection = await oracledb.getConnection(dbConfig);

    // Opciones para realizar el commit
    const options = {
        outFormat: oracledb.OUT_FORMAT_OBJECT
    };

    try {

        //OBTENER FECHA INCIO DE LA TABLA EN EL DATAWARE HOUSE

        // Secuencia SQL 
        const secuenciaSQL = `SELECT TRUNC(MAX(FECHA_FINAL)+1) FECHA_INICIO FROM TBL_HISTORICO_UBERS`;

        // Ejecutar la consulta
        const result = await connection.execute(secuenciaSQL,[],options);
        
        if(result.rows[0].FECHA_INICIO == null){
            fechaInicio =new Date(1970, 0, 1);
        }else{
            fechaInicio =result.rows[0].FECHA_INICIO;
        }

        //console.log(fechaInicio);

        // Utilizar el método find() para obtener todos los documentos del modelo
        const historicoUbers = await historicoUberSchema.find({
            fechaFinal: {
                $gte: fechaInicio,
                $lte: fechaFinal
            }
        });
        //console.log(historicoUbers);

        for(historico of historicoUbers){

            // Secuencia SQL 
            const secuenciaSQL = 
            `INSERT INTO tbl_historico_ubers ( id_historico, id_conductor, marca, color, placa, anio, fecha_inicio, fecha_final) 
            VALUES ( :idHistorico, :idConductor, :marca, :color, :placa, :anio, :fechaInicio, :fechaFinal)`;
    
            // Objeto consumidor
            const binds = {
                idHistorico: historico._id.toString(),
                idConductor: historico.idConductor.toString(),
                marca: historico.marca,
                color: historico.color,
                placa:historico.placa,
                anio: historico.anio,
                fechaInicio: historico.fechaInicio,
                fechaFinal: historico.fechaFinal,
            };

            // Ejecutar la consulta
            const result = await connection.execute(secuenciaSQL, binds, options);

        }
            
    } catch (error) {

        bandera = false;

        await connection.execute('ROLLBACK', [], options);

        //Hacer log
        const secuenciaSQL = 
        `BEGIN
            P_INSERT_LOG(P_nombre => 'EXTRACCION_HISTORICO_UBERS',
            P_fecha_inicio => :fechaInicio,
            P_nombre_base => 'Uber',
            P_exito => 'Fail',
            P_error => :error); 
        END;`;

        const binds = {
            fechaInicio: hoy,
            error: error.message
        };

        await connection.execute(secuenciaSQL, binds, options);
    }

    if(bandera){
        // Hacer Commit
        await connection.execute('COMMIT', [], options);

        //Hacer log
        const secuenciaSQL = 
        `BEGIN
            P_INSERT_LOG(P_nombre => 'EXTRACCION_HISTORICO_UBERS',
            P_fecha_inicio => :fechaInicio,
            P_nombre_base => 'Uber',
            P_exito => 'SUCCESS',
            P_error => NULL); 
        END;`;

        const binds = {
            fechaInicio: hoy,
        };

        await connection.execute(secuenciaSQL, binds, options);
    }

    // Cerrar la conexión 
    await connection.close();
};

module.exports = extraccionesTablasHojas;