/**
 * Servidor Backend SINTSEG
 * Express + dotenv + API de NVIDIA
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { seleccionarContexto } = require('./contextSelector');
const aiService = require('./aiService');

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = new Set([
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5500',
  'http://127.0.0.1:5500'
]);

app.use(cors({
  origin(origin, callback) {
    // file:// suele llegar sin Origin o como null; se permite para este prototipo local.
    if (!origin || origin === 'null' || allowedOrigins.has(origin)) return callback(null, true);
    return callback(new Error('Origen no autorizado por CORS'));
  }
}));
app.use(express.json({ limit: '5mb' }));

app.get('/api/health', async (req, res) => {
  const hasKey = aiService.hasValidApiKey();
  res.json({
    status: 'online',
    servidor: 'SINTSEG Backend Local',
    proveedorIA: 'NVIDIA API',
    modeloConfigurado: process.env.NVIDIA_MODEL || 'mistralai/mistral-nemotron',
    apiKeyConfigurada: hasKey,
    mensaje: hasKey
      ? 'NVIDIA_API_KEY detectada. La validez real se confirma al realizar una consulta al modelo.'
      : 'ADVERTENCIA: NVIDIA_API_KEY no configurada en el archivo .env.'
  });
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message, appData } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Error: Se requiere una pregunta o mensaje válido en el cuerpo de la petición.'
      });
    }

    const contextoSeleccionado = seleccionarContexto(message, appData || {});
    const resultado = await aiService.generarRespuesta(message, contextoSeleccionado);
    res.json(resultado);

  } catch (error) {
    console.error('Error procesando petición /api/chat:', error);
    res.status(500).json({
      success: false,
      provider: 'NVIDIA API',
      message: '⚠️ Error interno del servidor backend al procesar la consulta de IA.'
    });
  }
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🛡️  SERVIDOR BACKEND SINTSEG INICIADO EXITOSAMENTE`);
  console.log(`📍 Endpoint local: http://localhost:${PORT}`);
  console.log(`🤖 Proveedor IA: NVIDIA API (${process.env.NVIDIA_MODEL || 'mistralai/mistral-nemotron'})`);
  console.log(`🔑 Clave API: ${aiService.hasValidApiKey() ? 'CONFIGURADA ✓' : 'NO DETECTADA (Revisar archivo .env)'}`);
  console.log(`====================================================`);
});
