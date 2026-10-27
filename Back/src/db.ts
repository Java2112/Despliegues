import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'crud_db',
    port: Number(process.env.DB_PORT) || 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Función para comprobar la conexión inicial
async function testConnection(): Promise<void> {
    try {
        const connection = await pool.getConnection();
        console.log('✅ Conexión exitosa a la base de datos MySQL');
        connection.release();
    } catch (error: any) {
        console.error('⚠️ Advertencia: No se pudo conectar a la base de datos MySQL.');
        console.error('Detalle:', error.message);
        console.error('Asegúrate de que MySQL esté iniciado y de haber ejecutado BD/schema.sql');
    }
}

testConnection();

export default pool;
