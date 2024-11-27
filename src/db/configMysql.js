//mysql esta version se manejaba con callbacks

//mysql2/promises

import mysql from 'mysql2/promise'
import ENVIROMENT from '../config/enviroment.config.js'

const database_pool = mysql.createPool(
    {
        host: ENVIROMENT.MYSQL.HOST,
        user: ENVIROMENT.MYSQL.USERNAME,
        password: ENVIROMENT.MYSQL.PASSWORD,
        database: ENVIROMENT.MYSQL.DATABASE,
        connectionLimit: 10
    }
)

const checkConnection = async () => {
    try {
        const connection = await database_pool.getConnection() //Devolver la conexion
        await connection.query('SELECT 1')//Consulta simple de excusa para verificar la conexion
        //Cuando la consulta falla dara un throw
        console.log('Conexion exitosa con mysql!!');
        connection.release()//Matar la conexion de la pool

    } catch (error) {
        console.log(error);
        console.error('Error al conectar con la db');
    }
}

checkConnection() //Nos confirmara via consola que todo esta bien

export default database_pool 