/**
 * Servicio IA Modular SINTSEG
 * Arquitectura basada en adaptadores para conectar con la API de NVIDIA (OpenAI-compatible)
 * o con proveedores alternativos (OpenAI, Gemini, Ollama, Mock).
 */

const https = require('https');
const http = require('http');

class AIService {
  constructor() {
    this.apiKey = process.env.NVIDIA_API_KEY || '';
    this.model = process.env.NVIDIA_MODEL || 'mistralai/mistral-nemotron';
    this.baseUrl = process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1';
  }

  // Verifica si la API key está configurada y no es el marcador de posición
  hasValidApiKey() {
    return this.apiKey && this.apiKey !== 'PEGA_AQUI_TU_CLAVE' && this.apiKey.trim().length > 10;
  }

  async generarRespuesta(userMessage, contextSummary) {
    if (!this.hasValidApiKey()) {
      return {
        success: false,
        provider: 'Mock / Simulación Local',
        model: 'Demostración Sin Clave',
        message: `ℹ️ MODO DEMOSTRACIÓN: La variable NVIDIA_API_KEY no está configurada o contiene la plantilla. Por favor, añada su API key en el archivo .env del backend para activar el modelo NVIDIA ${this.model}.\n\nAnálisis simulado sobre el contexto actual:\n${contextSummary}`
      };
    }

    const systemPrompt = `Eres el Asistente de Dirección y Mando del equipo SINTSEG (Seguridad de la Información y Gestión).
Tu función es analizar la información operativa proporcionada, responder preguntas en lenguaje natural y sugerir recomendaciones estratégicas.
REGLAS OBLIGATORIAS:
1. Sé conciso, ejecutivo, sobrio y riguroso.
2. Basate EXCLUSIVAMENTE en la información de contexto proporcionada.
3. Recuerda que las decisiones de asignación, redistribución o aprobación son SIEMPRE tomadas por el Jefe (control humano).
4. No inventes datos que no estén en el contexto.

CONTEXTO ACTUAL DE LA APLICACIÓN SINTSEG:
${contextSummary}`;

    const payload = JSON.stringify({
      model: this.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage }
      ],
      temperature: 0.2,
      max_tokens: 1024
    });

    try {
      const url = new URL(`${this.baseUrl}/chat/completions`);
      const options = {
        hostname: url.hostname,
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        path: url.pathname,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Length': Buffer.byteLength(payload)
        },
        timeout: 25000
      };

      const respuestaRaw = await new Promise((resolve, reject) => {
        const req = (url.protocol === 'https:' ? https : http).request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => { data += chunk; });
          res.on('end', () => {
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve({ statusCode: res.statusCode, body: data });
            } else {
              reject(new Error(`Respuesta de API NVIDIA con código HTTP ${res.statusCode}: ${data}`));
            }
          });
        });

        req.on('error', (err) => reject(err));
        req.on('timeout', () => {
          req.destroy();
          reject(new Error('Tiempo de espera agotado al conectar con la API de NVIDIA.'));
        });

        req.write(payload);
        req.end();
      });

      const parsed = JSON.parse(respuestaRaw.body);
      const textContent = parsed.choices?.[0]?.message?.content || 'Sin respuesta generada por el modelo.';

      return {
        success: true,
        provider: 'NVIDIA API',
        model: this.model,
        message: textContent
      };

    } catch (err) {
      console.error('Error al comunicar con NVIDIA API:', err.message);
      return {
        success: false,
        provider: 'NVIDIA API (Conexión Fallida)',
        model: this.model,
        error: err.message,
        message: `⚠️ El Asistente IA de NVIDIA no está disponible actualmente (${err.message}). Por favor, verifique la clave NVIDIA_API_KEY en el archivo .env y la conexión de red.`
      };
    }
  }
}

module.exports = new AIService();
