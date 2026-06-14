const express = require('express');
const path = require('path');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const connectDB = require('./config/database');
const routerApi = require('./routes/routerApi');
const { logError, errorHandler } = require('./middlewares/errorHandler');

const app = express();
const port = 4000;

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'API de Gestión de Cobertura Sanitaria y Mapeo',
      version: '1.0.0',
      description: 'Documentación oficial de los endpoints requeridos por la rúbrica del proyecto final.',
    },
    servers: [
      {
        url: `http://localhost:${port}`,
      },
    ],
  },
  apis: ['./routes/*.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);

app.use(cors());
app.use(express.json());

connectDB();

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Sirve los archivos estáticos del frontend (build de React generado en /public)
app.use(express.static(path.join(__dirname, 'public')));

routerApi(app);

// Fallback SPA: cualquier ruta que no sea /api o /api-docs devuelve el index.html
// para que React Router maneje el enrutamiento del lado del cliente.
app.get(/^\/(?!api|api-docs).*/, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use(logError);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`🚀 Servidor ejecutándose de forma local en http://localhost:${port}`);
  console.log(`📄 Documentación interactiva de Swagger disponible en http://localhost:${port}/api-docs`);
});