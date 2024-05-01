var extraccionesTablasTransaccionales = {};

//modelos
var clienteSchema  = require('../models/clientes.model');
var conductoreSchema  = require('../models/conductores.model');
var tipoUberSchema  = require('../models/tipoUbers.model');
var carreraSchema= require('../models/carreras.model');
var comentarioSchema  = require('../models/comentarios.model');

//Elementos conexion oracle
const oracledb = require('oracledb');
const dbConfig = require('../utils/databaseOracle');

extraccionesTablasTransaccionales.clientes = async()=>{

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
        const secuenciaSQL = `SELECT TRUNC(MAX(FECHA_REGISTRO)+1) FECHA_INICIO FROM TBL_CLIENTES`;

        // Ejecutar la consulta
        const result = await connection.execute(secuenciaSQL,[],options);
        
        if(result.rows[0].FECHA_INICIO == null){
            fechaInicio =new Date(1970, 0, 1);
        }else{
            fechaInicio =result.rows[0].FECHA_INICIO;
        }

        //console.log(fechaInicio);
        
        // Utilizar el método find() para obtener todos los documentos del modelo
        const clientes = await clienteSchema.find({
            fechaRegistro: {
              $gte: fechaInicio,
              $lte: fechaFinal
            }
        });
        //console.log(clientes);

        for (cliente of clientes){

            // Secuencia SQL 
            const secuenciaSQL = 
            `BEGIN
                P_INSERT_CLIENTE(P_CORREO_ELECTRONICO=> :correo,
                                P_nombre => :nombre,
                                P_apellido =>:apellido,
                                P_telefono => :telefono,
                                P_contrasena_uber => :contrasenaUber,
                                P_fecha_registro => :fechaRegistro);
            
            END;`;
    
            // Objeto consumidor
            const binds = {
                correo: cliente.correo,
                nombre: cliente.nombre,
                apellido: cliente.apellido,
                telefono: Number(cliente.telefono),
                contrasenaUber:cliente.contrasena,
                fechaRegistro: cliente.fechaRegistro
            };
            
            // Ejecutar la consulta
            const result = await connection.execute(secuenciaSQL, binds, options);
            
        }

    } catch (error) {

        await connection.execute('ROLLBACK', [], options);
        // Cerrar la conexión después de obtener los datos
        await connection.close();

        //Hacer log
        const secuenciaSQL = 
        `BEGIN
            P_INSERT_LOG(P_nombre => 'EXTRACCION_CLIENTES',
            P_fecha_inicio => :fechaInicio,
            P_nombre_base => 'Uber',
            P_exito => 'Fail'); 
        END;`;

        const binds = {
            fechaInicio: hoy,
        };
        
        await connection.execute(secuenciaSQL, binds, options);
        
        // Manejar cualquier error que ocurra durante la consulta a la base de datos
        console.error('Error (Se hizo rollback):', error);
        throw error; // Lanzar el error para que quien llame a esta función pueda manejarlo
    }

    // Hacer Commit
    await connection.execute('COMMIT', [], options);

    //Hacer log
    const secuenciaSQL = 
    `BEGIN
        P_INSERT_LOG(P_nombre => 'EXTRACCION_CLIENTES',
        P_fecha_inicio => :fechaInicio,
        P_nombre_base => 'Uber',
        P_exito => 'SUCCESS'); 
    END;`;

    const binds = {
        fechaInicio: hoy,
    };
    
    await connection.execute(secuenciaSQL, binds, options);

    // Cerrar la conexión 
    await connection.close();
};

extraccionesTablasTransaccionales.conductores = async()=>{

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
        const secuenciaSQL = `SELECT TRUNC(MAX(FECHA_CONTRATACION)+1) FECHA_INICIO FROM TBL_CONDUCTORES`;

        // Ejecutar la consulta
        const result = await connection.execute(secuenciaSQL,[],options);
        
        if(result.rows[0].FECHA_INICIO == null){
            fechaInicio =new Date(1970, 0, 1);
        }else{
            fechaInicio =result.rows[0].FECHA_INICIO;
        }

        //console.log(fechaInicio);

        // Utilizar el método find() para obtener todos los documentos del modelo
        const conductores = await conductoreSchema.find({
            fechaContratacion: {
              $gte: fechaInicio,
              $lte: fechaFinal
            }
        });
        //console.log(conductores);


        for (conductor of conductores){
        
            tipoUber = await tipoUberSchema.findOne({_id: conductor.tipoUber});
            //console.log(tipoUber);

            // Secuencia SQL 
            const secuenciaSQL = 
            `INSERT INTO tbl_conductores ( id_conductor, nombre, apellido, telefono, correo, fecha_nacimiento, fecha_contratacion, tipo_uber) 
            VALUES ( :idConductor, :nombre, :apellido, :telefono, :correo, :fechaNacimiento, :fechaContratacion, :tipoUber)`;
    
            // Objeto consumidor
            const binds = {
                idConductor: conductor._id.toString(),
                correo: conductor.correo,
                nombre: conductor.nombre,
                apellido: conductor.apellido,
                telefono: Number(conductor.telefono),
                fechaNacimiento:conductor.fechaNacimiento,
                fechaContratacion: conductor.fechaContratacion,
                tipoUber: tipoUber.descripcion
            };

            // Ejecutar la consulta
            const result = await connection.execute(secuenciaSQL, binds, options);
            //console.log(result);
            
        }
        

    } catch (error) {

        await connection.execute('ROLLBACK', [], options);
        // Cerrar la conexión después de obtener los datos
        await connection.close();

        //Hacer log
        const secuenciaSQL = 
        `BEGIN
            P_INSERT_LOG(P_nombre => 'EXTRACCION_CONDUCTORES',
            P_fecha_inicio => :fechaInicio,
            P_nombre_base => 'Uber',
            P_exito => 'Fail'); 
        END;`;

        const binds = {
            fechaInicio: hoy,
        };

        await connection.execute(secuenciaSQL, binds, options);
        
        // Manejar cualquier error que ocurra durante la consulta a la base de datos
        console.error('Error (Se hizo rollback):', error);
        throw error; // Lanzar el error para que quien llame a esta función pueda manejarlo
    }

    // Hacer Commit
    await connection.execute('COMMIT', [], options);

    //Hacer log
    const secuenciaSQL = 
    `BEGIN
        P_INSERT_LOG(P_nombre => 'EXTRACCION_CONDUCTORES',
        P_fecha_inicio => :fechaInicio,
        P_nombre_base => 'Uber',
        P_exito => 'SUCCESS'); 
    END;`;

    const binds = {
        fechaInicio: hoy,
    };

    await connection.execute(secuenciaSQL, binds, options);

    // Cerrar la conexión 
    await connection.close();
};

extraccionesTablasTransaccionales.carreras = async()=>{

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
        const secuenciaSQL = `SELECT TRUNC(MAX(FECHA)+1) FECHA_INICIO FROM TBL_CARRERAS`;

        // Ejecutar la consulta
        const result = await connection.execute(secuenciaSQL,[],options);
        
        if(result.rows[0].FECHA_INICIO == null){
            fechaInicio =new Date(1970, 0, 1);
        }else{
            fechaInicio =result.rows[0].FECHA_INICIO;
        }

        //console.log(fechaInicio);
            
        // Utilizar el método find() para obtener todos los documentos del modelo
        const carreras = await carreraSchema.find({
            fecha: {
              $gte: fechaInicio,
              $lte: fechaFinal
            }
        });
        //console.log(carreras);

        for (carrera of carreras){
            
            if(carrera.estado){
                estado = '1';
            }else{
                estado = '0';
            }

            cliente = await clienteSchema.findOne({_id: carrera.cliente.id});

            // Secuencia SQL 
            const secuenciaSQL = 
            `INSERT INTO tbl_carreras ( id_carrera, id_conductor, id_cliente, lng_inicio, lat_inicio, ubicacion_inicio, lng_final,
                lat_final, estado, fecha, monto_total) 
            VALUES ( :idCarrera, :idConductor, :idCliente, :lngInicio, :latInicio, :ubicacionInicio, :lngFinal, :latFinal, 
                :estado, :fecha, :montoTotal)`;
    
            // Objeto consumidor
            const binds = {
                idCarrera:carrera._id.toString(),
                idConductor:carrera.conductor.id.toString(),
                idCliente:cliente.correo,
                lngInicio:carrera.ubicacionInicio.lng,
                latInicio:carrera.ubicacionInicio.lat,
                ubicacionInicio:carrera.ubicacionInicio.ubicacionNombre,
                lngFinal:carrera.ubicacionFinal.lng,
                latFinal:carrera.ubicacionFinal.lat, 
                estado:estado,
                fecha:carrera.fecha,
                montoTotal:carrera.factura.total
            };
    
            // Ejecutar la consulta
            const result = await connection.execute(secuenciaSQL, binds, options);
            //console.log(result);
        
        };
        

    } catch (error) {

        await connection.execute('ROLLBACK', [], options);
        // Cerrar la conexión después de obtener los datos
        await connection.close();

        //Hacer log
        const secuenciaSQL = 
        `BEGIN
            P_INSERT_LOG(P_nombre => 'EXTRACCION_CARRERAS',
            P_fecha_inicio => :fechaInicio,
            P_nombre_base => 'Uber',
            P_exito => 'Fail'); 
        END;`;

        const binds = {
            fechaInicio: hoy,
        };

        await connection.execute(secuenciaSQL, binds, options);
        
        // Manejar cualquier error que ocurra durante la consulta a la base de datos
        console.error('Error (Se hizo rollback):', error);
        throw error; // Lanzar el error para que quien llame a esta función pueda manejarlo
    }

    // Hacer Commit
    await connection.execute('COMMIT', [], options);

    //Hacer log
    const secuenciaSQL = 
    `BEGIN
        P_INSERT_LOG(P_nombre => 'EXTRACCION_CARRERAS',
        P_fecha_inicio => :fechaInicio,
        P_nombre_base => 'Uber',
        P_exito => 'SUCCESS'); 
    END;`;

    const binds = {
        fechaInicio: hoy,
    };

    await connection.execute(secuenciaSQL, binds, options);

    // Cerrar la conexión 
    await connection.close();
};

extraccionesTablasTransaccionales.comentarios = async()=>{

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
        const secuenciaSQL = `SELECT TRUNC(MAX(FECHA)+1) FECHA_INICIO FROM TBL_COMENTARIOS`;

        // Ejecutar la consulta
        const result = await connection.execute(secuenciaSQL,[],options);
        
        if(result.rows[0].FECHA_INICIO == null){
            fechaInicio =new Date(1970, 0, 1);
        }else{
            fechaInicio =result.rows[0].FECHA_INICIO;
        }

        //console.log(fechaInicio);

        // Utilizar el método find() para obtener todos los documentos del modelo
        const comentarios = await comentarioSchema.find({
            fecha: {
              $gte: fechaInicio,
              $lte: fechaFinal
            }
        });
        //console.log(comentarios.length);

        for (comentario of comentarios){

            // Secuencia SQL 
            const secuenciaSQL = 
            `INSERT INTO tbl_comentarios ( id_comentario, id_carrera, comentario, puntuacion, fecha) 
            VALUES ( :idComentario,:idCarrera, :comentario, :puntuacion, :fecha)`;
    
            // Objeto consumidor
            const binds = {
                idComentario:comentario._id.toString(),
                idCarrera:comentario.carrera.toString(),
                comentario:comentario.comentario,
                puntuacion:comentario.puntuacion,
                fecha:comentario.fecha
            };
            
            // Ejecutar la consulta
            const result = await connection.execute(secuenciaSQL, binds, options);
            //console.log(result);

        };
        

    } catch (error) {

        await connection.execute('ROLLBACK', [], options);
        // Cerrar la conexión después de obtener los datos
        await connection.close();
        
        //Hacer log
        const secuenciaSQL = 
        `BEGIN
            P_INSERT_LOG(P_nombre => 'EXTRACCION_COMENTARIOS',
            P_fecha_inicio => :fechaInicio,
            P_nombre_base => 'Uber',
            P_exito => 'Fail'); 
        END;`;

        const binds = {
            fechaInicio: hoy,
        };

        await connection.execute(secuenciaSQL, binds, options);

        // Manejar cualquier error que ocurra durante la consulta a la base de datos
        console.error('Error (Se hizo rollback):', error);
        throw error; // Lanzar el error para que quien llame a esta función pueda manejarlo
    }

    // Hacer Commit
    await connection.execute('COMMIT', [], options);

    //Hacer log
    const secuenciaSQL = 
    `BEGIN
        P_INSERT_LOG(P_nombre => 'EXTRACCION_COMENTARIOS',
        P_fecha_inicio => :fechaInicio,
        P_nombre_base => 'Uber',
        P_exito => 'SUCCESS'); 
    END;`;

    const binds = {
        fechaInicio: hoy,
    };

    await connection.execute(secuenciaSQL, binds, options);

    // Cerrar la conexión 
    await connection.close();
};

module.exports = extraccionesTablasTransaccionales;