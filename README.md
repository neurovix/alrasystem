# ♻️ ALRA PLASTIC RECYCLING S.A. de C.V.

Sistema integral de trazabilidad y control desarrollado por **Neurovix** para **ALRA PLASTIC RECYCLING S.A. de C.V.**  
Permite el seguimiento completo del proceso de reciclaje — desde la **entrada del material** hasta la **venta o devolución al cliente** — mediante el uso de **códigos QR**, reportes automatizados y dashboards inteligentes.

---

## 🚀 Funcionalidades principales

### 🔹 Seguimiento de lotes y sublotes
- Alta de **lotes** y **sublotes** con **QR generados automáticamente**.
- Escaneo de QR desde la app para visualizar información del lote o sublote.
- Registro de datos clave: peso, tipo de material, cliente, estado y ubicación.
- Asociación jerárquica entre lotes y sublotes para mantener trazabilidad completa.

### 🔹 Manejo de inventario
- Control de materiales en tiempo real, con actualización automática según movimientos.
- Clasificación por tipo de material (PET, PEAD, PEBD, PP, etc.).
- Gráficos y estadísticas de inventario total y por tipo de material.
- Ajustes automáticos al finalizar o reabrir lotes.

### 🔹 Administración de usuarios
- Sistema de roles con permisos: **Administrador**, **Supervisor**, **Operador**.
- Registro, edición, suspensión y eliminación de usuarios.
- Autenticación segura mediante **Supabase Auth (JWT)**.

### 🔹 Gestión de materiales y clientes
- Alta, edición y eliminación de materiales reciclables.
- Registro de clientes con historial de ventas, devoluciones y transacciones.
- Reportes filtrados por cliente, material o periodo de tiempo.

### 🔹 Dashboards y analíticas
- Panel principal con estadísticas **mensuales y en tiempo real**:
  - Lotes en proceso 🏭  
  - Lotes finalizados ✅  
  - Material procesado ♻️  
  - Gráfico de inventario por material 📊  
- Visualización clara para la toma de decisiones operativas.

### 🔹 Reportes automatizados
- **Reporte de lotes:** por estado, cliente o rango de fechas.  
- **Reporte de inventario:** entre `fecha x` y `fecha y`.  
- **Reporte de clientes:** con totales, devoluciones y compras.  
- Exportación de reportes a PDF y envío automático por correo.

---

## 🧩 Tecnologías utilizadas

| Componente | Descripción |
|-------------|-------------|
| **Frontend móvil** | React Native + Expo Go + NativeWind |
| **Backend** | Supabase (Base de datos y API REST integrada) |
| **Autenticación** | Supabase Auth (correo y contraseña) |
| **Almacenamiento** | Supabase Storage (reportes y archivos) |
| **Gráficas** | React Native Charts / Victory Native |
| **QR** | Librerías `react-native-qrcode-svg` y `expo-barcode-scanner` |
| **Notificaciones** | Expo Notifications (para alertas de procesos) |

---

## 📱 Estructura general del proyecto
📦 alra-recycling-app
┣ 📂 app/ # Pantallas principales (Dashboards, Lotes, Inventario)
┣ 📂 components/ # Componentes reutilizables (Cards, Buttons, Inputs, etc.)
┣ 📂 services/ # Conexiones a Supabase, helpers y lógica de negocio
┣ 📂 assets/ # Íconos, logos, imágenes
┣ 📂 utils/ # Funciones utilitarias (formateo de fechas, colores, etc.)
┗ 📜 README.md

---

## 📸 Capturas de pantalla

### 🏠 Dashboard principal
> Información mensual de lotes, sublotes, inventario y rendimiento general.

![Dashboard Screenshot](./screenshots/dashboard.png)

---

### 📦 Lotes y sublotes
> Registro, seguimiento y escaneo mediante QR generados automáticamente.

![Lotes Screenshot](./screenshots/lotes.png)

---

### 🧾 Reportes
> Generación y descarga de reportes filtrados por rango de fechas o cliente.

![Reportes Screenshot](./screenshots/reportes.png)

---

### 👥 Administración de usuarios
> Control de roles, accesos y autenticación segura con Supabase Auth.

![Usuarios Screenshot](./screenshots/usuarios.png)

---

### 🧱 Inventario
> Visualización del inventario actual y movimientos por tipo de material.

![Inventario Screenshot](./screenshots/inventario.png)

---

### 👨‍💼 Clientes
> Listado, historial y análisis de compras o devoluciones.

![Clientes Screenshot](./screenshots/clientes.png)

---

## ⚙️ Instalación y ejecución

### Requisitos previos
- Node.js v18+
- Expo CLI
- Cuenta en Supabase (con proyecto configurado)
- Dispositivo físico o emulador con **Expo Go**

### Instalación local

```bash
# Clonar el repositorio
git clone https://github.com/neurovix/alra-recycling-app.git
cd alra-recycling-app

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar las variables con tu URL y API Key de Supabase

# Ejecutar la app
npx expo start

Luego escanea el código QR con Expo Go para ejecutar la aplicación en tu dispositivo.

🔑 Variables de entorno (.env)
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_public_anon_key

📅 Próximas mejoras
🌐 Panel web administrativo (integración con el backend móvil)
📊 Reportes con filtros avanzados y estadísticas inteligentes
📦 Integración con lector QR industrial
🧠 IA para predicción de rendimiento y optimización de planta
📲 Notificaciones push automáticas para estados de lotes

👨‍💻 Desarrollado por

Fernando Alejandro Vázquez Medina
Fullstack Developer — Fundador de Neurovix
📧 contacto@neurovix.com.mx

🌐 https://neurovix.com.mx

🏢 Sobre la empresa

ALRA PLASTIC RECYCLING S.A. de C.V.
Empresa mexicana dedicada al reciclaje y aprovechamiento sustentable de plásticos industriales.
Este sistema fue desarrollado para digitalizar completamente su operación y optimizar la trazabilidad, control y eficiencia en cada etapa del proceso productivo.

© 2025 Neurovix. Todos los derechos reservados.