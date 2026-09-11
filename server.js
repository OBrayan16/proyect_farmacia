// Importar dependencias
require('dotenv').config();
const express = require("express");
const cors = require("cors");

const app = express();

// Configuración de CORS (Permite que el frontend se conecte al backend)
var corsOptions = {
  origin: "*" // En producción, aquí pondrías la URL de tu frontend
};

app.use(cors(corsOptions));
app.use(express.json()); // Permite recibir datos en formato JSON
app.use(express.urlencoded({ extended: true }));

// Sincronización con la Base de Datos (Neon)
const db = require("./app/models");
console.log("🔍 DIAGNÓSTICO DE DB:", db);
// Utilizamos { alter: true } para que Sequelize cree o actualice las tablas sin borrar datos existentes
db.sequelize.sync({ alter: true })
  .then(() => {
    console.log("¡Sincronización exitosa con la base de datos de Neon!");
  })
  .catch((err) => {
    console.log("Error al sincronizar la base de datos: " + err.message);
  });

// Ruta de prueba
app.get("/", (req, res) => {
  res.json({ message: "Bienvenido a la API del Sistema de Farmacia." });
});

// Importar e inicializar todas las rutas de la API
require("./app/routes/cliente.routes")(app);
require("./app/routes/empleado.routes")(app);
require("./app/routes/proveedor.routes")(app);
require("./app/routes/producto.routes")(app);
require("./app/routes/factura.routes")(app);
require("./app/routes/pago.routes")(app);

// Configurar el puerto y encender el servidor
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`El servidor está corriendo en el puerto ${PORT}.`);
});


