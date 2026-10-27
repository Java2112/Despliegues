-- ===============================================================
-- 1. CREACIÓN DE BASE DE DATOS Y TABLA
-- ===============================================================
CREATE DATABASE IF NOT EXISTS crud_db;
USE crud_db;

CREATE TABLE IF NOT EXISTS productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    precio DECIMAL(10, 2) NOT NULL,
    descripcion TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Datos iniciales de prueba
INSERT INTO productos (nombre, precio, descripcion) VALUES
('Laptop Dell', 899.99, 'Portátil para desarrollo y oficina'),
('Mouse Inalámbrico', 24.50, 'Mouse óptico ergonómico Bluetooth'),
('Teclado Mecánico', 59.90, 'Teclado con switches mecánicos y retroiluminación');

-- ===============================================================
-- 2. CONFIGURACIÓN PARA MÁQUINAS VIRTUALES DISTINTAS (REMOTO)
-- ===============================================================
-- Por defecto en MySQL, el usuario 'root' solo acepta conexiones desde 'localhost'.
-- Si la base de datos está en una máquina virtual diferente a la del Backend,
-- ejecuta los siguientes comandos para crear un usuario con acceso remoto:
--
-- CREATE USER 'crud_user'@'%' IDENTIFIED BY 'tu_contraseña_aqui';
-- GRANT ALL PRIVILEGES ON crud_db.* TO 'crud_user'@'%';
-- FLUSH PRIVILEGES;
--
-- NOTA IMPORTANTE EN LINUX / SERVIDOR MYSQL:
-- En el archivo de configuración de MySQL (/etc/mysql/mysql.conf.d/mysqld.cnf o /etc/my.cnf),
-- asegúrate de que 'bind-address' esté configurado para escuchar en todas las interfaces:
--   bind-address = 0.0.0.0
-- Y reinicia el servicio MySQL (ej: sudo systemctl restart mysql).
