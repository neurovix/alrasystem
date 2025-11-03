-- ===============================
-- ENUMS
-- ===============================

-- Roles de usuario
CREATE TYPE rol_usuario AS ENUM ('Administrador', 'Operador');

-- Tipo de proceso del lote
CREATE TYPE tipo_proceso_lote AS ENUM ('Venta', 'Maquila');

-- Estado del lote
CREATE TYPE estado_lote AS ENUM ('Recibido', 'Molienda', 'Peletizado', 'Finalizado');

-- Procesos posibles
CREATE TYPE tipo_proceso AS ENUM ('Recibido', 'Molienda', 'Peletizado', 'Retorno', 'Venta');

-- Tipo de movimiento de inventario
CREATE TYPE tipo_movimiento AS ENUM ('Entrada', 'Salida', 'Ajuste', 'Traslado', 'Molienda', 'Peletizado');

-- ===============================
-- TABLAS
-- ===============================

-- 1. Usuarios (perfil extendido)
CREATE TABLE usuarios (
    id_usuario UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    email TEXT NOT NULL,
    rol rol_usuario NOT NULL,
    estatus BOOLEAN NOT NULL
);

-- 2. Clientes
CREATE TABLE clientes (
    id_cliente SERIAL PRIMARY KEY,
    nombre_cliente TEXT NOT NULL,
    empresa TEXT
);

-- 3. Materiales
CREATE TABLE materiales (
    id_material SERIAL PRIMARY KEY,
    nombre_material TEXT UNIQUE NOT NULL,
    cantidad_disponible_kg NUMERIC NOT NULL DEFAULT 0
);

-- 4. Lotes (lote principal)
CREATE TABLE lotes (
    id_lote SERIAL PRIMARY KEY,
    nombre_lote TEXT UNIQUE NOT NULL,
    id_material INT NOT NULL REFERENCES materiales (id_material) ON DELETE RESTRICT,
    peso_entrada_kg NUMERIC NOT NULL,
    fecha_recibido TIMESTAMP NOT NULL,
    id_cliente INT NOT NULL REFERENCES clientes (id_cliente) ON DELETE RESTRICT,
    tipo_proceso tipo_proceso_lote NOT NULL,
    estado_actual estado_lote NOT NULL DEFAULT 'Recibido',
    peso_final_kg NUMERIC,
    created_by UUID NOT NULL REFERENCES usuarios (id_usuario) ON DELETE SET NULL,
    reporte_url TEXT NULL,
    numero_de_sublotes INT NULL
);

-- 5. Sublotes (costales derivados del lote principal)
CREATE TABLE sublotes (
    id_sublote SERIAL PRIMARY KEY,
    id_lote INT NOT NULL REFERENCES lotes (id_lote) ON DELETE CASCADE,
    nombre_sublote TEXT UNIQUE NOT NULL,          -- Ejemplo: "LT-1/01"
    peso_sublote_kg NUMERIC NOT NULL,
    fecha_creado TIMESTAMP NOT NULL DEFAULT now(),
    estado_actual estado_lote NOT NULL DEFAULT 'Recibido',
    created_by UUID NOT NULL REFERENCES usuarios (id_usuario) ON DELETE SET NULL
);

-- 6. Procesos
CREATE TABLE procesos (
    id_proceso SERIAL PRIMARY KEY,
    id_lote INT REFERENCES lotes (id_lote) ON DELETE CASCADE,
    id_sublote INT REFERENCES sublotes (id_sublote) ON DELETE CASCADE,
    tipo_proceso tipo_proceso NOT NULL,
    peso_salida_kg NUMERIC NOT NULL,
    merma_kg NUMERIC NOT NULL,
    fecha_proceso TIMESTAMP NOT NULL,
    id_cliente INT REFERENCES clientes (id_cliente) ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES usuarios (id_usuario) ON DELETE SET NULL
);

-- 7. Fotos
CREATE TABLE fotos (
    id_foto SERIAL PRIMARY KEY,
    id_lote INT REFERENCES lotes (id_lote) ON DELETE CASCADE,
    id_sublote INT REFERENCES sublotes (id_sublote) ON DELETE CASCADE,
    id_proceso INT REFERENCES procesos (id_proceso) ON DELETE SET NULL,
    url_foto TEXT NOT NULL
);

-- 8. Inventario (movimientos)
CREATE TABLE inventario_movimientos (
    id_movimiento SERIAL PRIMARY KEY,
    id_material INT NOT NULL REFERENCES materiales (id_material) ON DELETE RESTRICT,
    cantidad_kg NUMERIC NOT NULL,
    tipo_movimiento tipo_movimiento NOT NULL,
    fecha TIMESTAMPTZ NOT NULL DEFAULT now(),
    id_lote INT REFERENCES lotes (id_lote) ON DELETE SET NULL,
    id_sublote INT REFERENCES sublotes (id_sublote) ON DELETE SET NULL,
    created_by UUID NOT NULL REFERENCES usuarios (id_usuario) ON DELETE SET NULL
);

-- ===============================
-- FIN DEL SCRIPT
-- ===============================
