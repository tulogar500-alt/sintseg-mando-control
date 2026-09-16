# 🛡️ SINTSEG — Dirección, Coordinación y Seguimiento (Mando y Control)

Prototipo web para gestión de expedientes, tareas, documentos y coordinación de equipos, con un asistente IA opcional conectado a NVIDIA mediante un backend local. El principio de diseño es **IA analiza → IA propone → jefe decide → sistema ejecuta**.

> ⚠️ **Uso docente y de demostración.** Los datos incluidos son ficticios. No introduzcas información clasificada, sensible, personal u operativa real en un servicio externo sin autorización expresa de tu organización.

## Funciones principales

- Dashboard ejecutivo con KPIs y alertas.
- Gestión de asuntos, expedientes y tareas.
- Carga de trabajo ponderada: Crítica=4, Alta=3, Media=2, Baja=1 y retraso=+2.
- Vista de usuario y trazabilidad.
- Persistencia de demostración en `localStorage`.
- Asistente IA consultivo: no modifica tareas, usuarios ni equipos.
- Selector de contexto: el backend envía al proveedor IA solo el subconjunto necesario para responder.

## Estructura

```text
sintseg-app/
├── index.html
├── app.jsx
├── seedData.js
├── server.js              # Backend Node.js recomendado
├── aiService.js           # Adaptador NVIDIA/OpenAI-compatible
├── contextSelector.js     # Minimización del contexto enviado
├── server.py              # Backend Python alternativo
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

## Configurar la API de NVIDIA

1. Copia `.env.example` como `.env`.
2. Sustituye el marcador por tu clave real. **No publiques `.env` ni pegues la clave en el frontend.**

```env
NVIDIA_API_KEY=nvapi-...
NVIDIA_MODEL=mistralai/mistral-nemotron
NVIDIA_BASE_URL=https://integrate.api.nvidia.com/v1
PORT=3001
```

El modelo es configurable. Conviene comprobar en NVIDIA Build que el modelo elegido siga disponible para tu tipo de endpoint.

## Arranque recomendado: Node.js

```bash
npm install
npm start
```

El backend quedará en `http://localhost:3001`. Después abre `index.html` en el navegador.

### Comprobar el backend

Abre `http://localhost:3001/api/health`. Este endpoint confirma que el backend está activo y que una clave parece estar configurada, **pero no valida la clave contra NVIDIA**. La validación real ocurre al enviar la primera consulta desde el Asistente IA.

## Alternativa Python

Si no quieres instalar dependencias Node, puedes ejecutar:

```bash
python server.py
```

La implementación Node.js es la referencia principal del prototipo; la versión Python se mantiene como alternativa local.

## Seguridad

- `.env` está excluido por `.gitignore`.
- La API key solo se usa en el backend.
- La interfaz nunca recibe la API key.
- El backend Node restringe CORS a uso local del prototipo.
- El asistente es de solo lectura: analiza y recomienda, no ejecuta cambios.
- Antes de un uso real en un entorno corporativo o de defensa, deben revisarse autorización, clasificación de la información, protección de datos, registro, autenticación, control de acceso y despliegue del backend.

## Licencia

Software de prototipado/uso educativo.
