# Integración del Asistente IA NVIDIA

Este documento describe la integración experimental del asistente IA de SINTSEG.

- La API key se guarda únicamente en `.env` local.
- `.env` está excluido por `.gitignore`.
- El frontend nunca recibe la clave.
- El backend selecciona solo el contexto relevante antes de llamar a NVIDIA.
- El asistente es consultivo: no modifica tareas, usuarios ni equipos.
- Para el prototipo se usa por defecto `mistralai/mistral-nemotron`, configurable mediante `NVIDIA_MODEL`.

## Puesta en marcha

1. Copia `.env.example` como `.env`.
2. Introduce tu clave real en `NVIDIA_API_KEY`.
3. Ejecuta `npm install` y después `npm start`.
4. Abre `http://localhost:3001/api/health` para comprobar que el backend está activo.
5. Abre `index.html` y usa la vista Asistente IA.

> El endpoint de salud solo confirma que una clave parece estar configurada. La validez real se comprueba en la primera consulta a NVIDIA.

> Este repositorio es un prototipo con datos ficticios. No debe usarse para enviar información clasificada, operativa, personal o sensible a servicios externos sin autorización expresa.
