-- 1. Usuarios
INSERT INTO usuarios (id_usuario, nombre, rol)
VALUES ('77d735ca-44b7-4888-aaeb-77a621eeb0ce', 'Fernando Vazquez', 'Administrador');

-- 2. Clientes
INSERT INTO clientes (id_cliente, nombre_cliente, empresa) VALUES
(1, 'Ing. Vazquez', 'Neurovix S. de R.L. de C.V.'),
(2, 'Hector Galindo', 'ALRA PLASTIC RECICLING S.A de C.V'),
(3, 'Ing. Javier Jaquez', 'CIMA TECNOLOGIA'),
(4, 'Arq. Bertha Cantu', 'MBS Proyectos y Construcciones S.A de C.V'),
(5, 'Lic. Julio M.', 'Kimberly Clark S.A de C.V');

-- 3. Materiales
INSERT INTO materiales (id_material, nombre_material, cantidad_disponible_kg) VALUES
(1, 'PET', 10000000.00),
(2, 'PP', 893388499.39),
(3, 'PVC', 38494893920.30),
(4, 'HDPE', 39489022.58),
(5, 'Naylon', 67362826493.83);

-- 4. Lotes
INSERT INTO lotes (id_lote, nombre_lote, id_material, peso_entrada_kg, fecha_recibido, id_cliente, tipo_proceso, estado_actual, peso_final_kg, created_by) VALUES
(1, 'LT-1', 1, 1000.00, '2025-09-01', 1, 'Venta', 'Recibido', NULL, '77d735ca-44b7-4888-aaeb-77a621eeb0ce'),
(2, 'LT-2', 2, 5000.00, '2025-09-05', 2, 'Maquila', 'Molienda', NULL, '77d735ca-44b7-4888-aaeb-77a621eeb0ce'),
(3, 'LT-3', 3, 20000.00, '2025-09-10', 3, 'Venta', 'Peletizado', 19500.00, '77d735ca-44b7-4888-aaeb-77a621eeb0ce'),
(4, 'LT-4', 4, 7500.00, '2025-09-12', 4, 'Maquila', 'Retorno', 7200.00, '77d735ca-44b7-4888-aaeb-77a621eeb0ce'),
(5, 'LT-5', 5, 12000.00, '2025-09-15', 5, 'Venta', 'Finalizado', 11800.00, '77d735ca-44b7-4888-aaeb-77a621eeb0ce');

-- Procesos registrados para cada lote
INSERT INTO procesos (id_proceso, id_lote, tipo_proceso, peso_salida_kg, merma_kg, fecha_proceso, id_cliente, created_by) VALUES
-- Lote 1: Venta directa (no tiene molienda/peletizado)
(1, 1, 'Venta', 980.00, 20.00, '2025-09-03', 1, '77d735ca-44b7-4888-aaeb-77a621eeb0ce'),

-- Lote 2: Molienda en maquila
(2, 2, 'Molienda', 4900.00, 100.00, '2025-09-06', 2, '77d735ca-44b7-4888-aaeb-77a621eeb0ce'),

-- Lote 3: Molienda + Peletizado
(3, 3, 'Molienda', 19800.00, 200.00, '2025-09-11', 3, '77d735ca-44b7-4888-aaeb-77a621eeb0ce'),
(4, 3, 'Peletizado', 19500.00, 300.00, '2025-09-13', 3, '77d735ca-44b7-4888-aaeb-77a621eeb0ce'),

-- Lote 4: Molienda + Retorno
(5, 4, 'Molienda', 7400.00, 100.00, '2025-09-13', 4, '77d735ca-44b7-4888-aaeb-77a621eeb0ce'),
(6, 4, 'Retorno', 7200.00, 200.00, '2025-09-14', 4, '77d735ca-44b7-4888-aaeb-77a621eeb0ce'),

-- Lote 5: Venta después de molienda
(7, 5, 'Molienda', 11900.00, 100.00, '2025-09-16', 5, '77d735ca-44b7-4888-aaeb-77a621eeb0ce'),
(8, 5, 'Venta', 11800.00, 100.00, '2025-09-17', 5, '77d735ca-44b7-4888-aaeb-77a621eeb0ce');

-- Movimientos de inventario
INSERT INTO inventario_movimientos (id_movimiento, id_material, cantidad_kg, tipo_movimiento, fecha, id_lote, created_by) VALUES
-- Lote 1: Entrada y salida por venta
(1, 1, 1000.00, 'Entrada', '2025-09-01', 1, '77d735ca-44b7-4888-aaeb-77a621eeb0ce'),
(2, 1, -980.00, 'Salida', '2025-09-03', 1, '77d735ca-44b7-4888-aaeb-77a621eeb0ce'),

-- Lote 2: Entrada + molienda
(3, 2, 5000.00, 'Entrada', '2025-09-05', 2, '77d735ca-44b7-4888-aaeb-77a621eeb0ce'),
(4, 2, -4900.00, 'Salida', '2025-09-06', 2, '77d735ca-44b7-4888-aaeb-77a621eeb0ce'),

-- Lote 3: Entrada + molienda + peletizado
(5, 3, 20000.00, 'Entrada', '2025-09-10', 3, '77d735ca-44b7-4888-aaeb-77a621eeb0ce'),
(6, 3, -19800.00, 'Salida', '2025-09-11', 3, '77d735ca-44b7-4888-aaeb-77a621eeb0ce'),
(7, 3, -19500.00, 'Salida', '2025-09-13', 3, '77d735ca-44b7-4888-aaeb-77a621eeb0ce'),

-- Lote 4: Entrada + molienda + retorno
(8, 4, 7500.00, 'Entrada', '2025-09-12', 4, '77d735ca-44b7-4888-aaeb-77a621eeb0ce'),
(9, 4, -7400.00, 'Salida', '2025-09-13', 4, '77d735ca-44b7-4888-aaeb-77a621eeb0ce'),
(10, 4, -7200.00, 'Salida', '2025-09-14', 4, '77d735ca-44b7-4888-aaeb-77a621eeb0ce'),

-- Lote 5: Entrada + molienda + venta
(11, 5, 12000.00, 'Entrada', '2025-09-15', 5, '77d735ca-44b7-4888-aaeb-77a621eeb0ce'),
(12, 5, -11900.00, 'Salida', '2025-09-16', 5, '77d735ca-44b7-4888-aaeb-77a621eeb0ce'),
(13, 5, -11800.00, 'Salida', '2025-09-17', 5, '77d735ca-44b7-4888-aaeb-77a621eeb0ce');
