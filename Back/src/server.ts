import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import pool from './db';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// Middlewares
app.use(cors());
app.use(express.json());

// Interfaz para el tipo de datos de Producto
export interface Producto {
    id?: number;
    nombre: string;
    precio: number;
    descripcion?: string;
    fecha_creacion?: string;
}

// Ruta de bienvenida / salud
app.get('/', (_req: Request, res: Response) => {
    res.json({ mensaje: 'API CRUD de productos con TypeScript y Node.js funcionando' });
});

// ==========================================
// RUTAS CRUD DE PRODUCTOS
// ==========================================

// 1. OBTENER TODOS LOS PRODUCTOS (READ)
app.get('/api/productos', async (_req: Request, res: Response) => {
    try {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM productos ORDER BY id DESC');
        res.json(rows);
    } catch (error) {
        console.error('Error al obtener productos:', error);
        res.status(500).json({ error: 'Error al consultar la base de datos' });
    }
});

// 2. OBTENER UN PRODUCTO POR ID (READ ONE)
app.get('/api/productos/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const [rows] = await pool.query<RowDataPacket[]>('SELECT * FROM productos WHERE id = ?', [id]);
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        res.json(rows[0]);
    } catch (error) {
        console.error('Error al obtener producto:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// 3. CREAR UN PRODUCTO (CREATE)
app.post('/api/productos', async (req: Request, res: Response) => {
    const { nombre, precio, descripcion } = req.body;

    if (!nombre || precio === undefined || precio === null || precio === '') {
        return res.status(400).json({ error: 'El nombre y el precio son campos obligatorios' });
    }

    try {
        const [result] = await pool.query<ResultSetHeader>(
            'INSERT INTO productos (nombre, precio, descripcion) VALUES (?, ?, ?)',
            [nombre.toString().trim(), parseFloat(precio), descripcion ? descripcion.toString().trim() : null]
        );

        res.status(201).json({
            mensaje: 'Producto creado exitosamente',
            id: result.insertId,
            producto: {
                id: result.insertId,
                nombre,
                precio: parseFloat(precio),
                descripcion
            }
        });
    } catch (error) {
        console.error('Error al crear producto:', error);
        res.status(500).json({ error: 'Error al guardar el producto en la base de datos' });
    }
});

// 4. ACTUALIZAR UN PRODUCTO (UPDATE)
app.put('/api/productos/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    const { nombre, precio, descripcion } = req.body;

    if (!nombre || precio === undefined || precio === null || precio === '') {
        return res.status(400).json({ error: 'El nombre y el precio son campos obligatorios' });
    }

    try {
        const [result] = await pool.query<ResultSetHeader>(
            'UPDATE productos SET nombre = ?, precio = ?, descripcion = ? WHERE id = ?',
            [nombre.toString().trim(), parseFloat(precio), descripcion ? descripcion.toString().trim() : null, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Producto no encontrado para actualizar' });
        }

        res.json({
            mensaje: 'Producto actualizado con éxito',
            producto: { id: Number(id), nombre, precio: parseFloat(precio), descripcion }
        });
    } catch (error) {
        console.error('Error al actualizar producto:', error);
        res.status(500).json({ error: 'Error al actualizar el producto' });
    }
});

// 5. ELIMINAR UN PRODUCTO (DELETE)
app.delete('/api/productos/:id', async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
        const [result] = await pool.query<ResultSetHeader>('DELETE FROM productos WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Producto no encontrado para eliminar' });
        }

        res.json({ mensaje: 'Producto eliminado correctamente', id });
    } catch (error) {
        console.error('Error al eliminar producto:', error);
        res.status(500).json({ error: 'Error al eliminar el producto' });
    }
});

// Iniciar servidor
app.listen(PORT, HOST, () => {
    console.log(`🚀 Servidor backend corriendo en: http://${HOST}:${PORT}`);
});
