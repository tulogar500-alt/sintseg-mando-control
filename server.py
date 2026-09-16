#!/usr/bin/env python3
"""
Servidor Backend SINTSEG en Python (Alternativa a Node.js)
Servidor HTTP nativo sin dependencias externas para conectar con la API de NVIDIA.
"""

import os
import json
import urllib.request
from http.server import HTTPServer, BaseHTTPRequestHandler

# Cargar variables desde .env si existe
env_path = os.path.join(os.path.dirname(__file__), '.env')
if os.path.exists(env_path):
    with open(env_path, 'r', encoding='utf-8') as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, val = line.split('=', 1)
                os.environ[key.strip()] = val.strip()

PORT = int(os.environ.get('PORT', 3001))
NVIDIA_API_KEY = os.environ.get('NVIDIA_API_KEY', '')
NVIDIA_MODEL = os.environ.get('NVIDIA_MODEL', 'mistralai/mistral-nemotron')
NVIDIA_BASE_URL = os.environ.get('NVIDIA_BASE_URL', 'https://integrate.api.nvidia.com/v1')

def has_valid_api_key():
    return bool(NVIDIA_API_KEY and NVIDIA_API_KEY != 'PEGA_AQUI_TU_CLAVE' and len(NVIDIA_API_KEY.strip()) > 10)

def seleccionar_contexto(query, app_data):
    if not app_data:
        return "Sin datos de contexto disponibles."

    q = query.lower()
    tareas = app_data.get('tareas', [])
    asuntos = app_data.get('asuntos', [])
    usuarios = app_data.get('usuarios', [])
    hoy = app_data.get('hoy', '')
    contexto = [f"FECHA ACTUAL DEL SISTEMA: {hoy}"]

    if any(k in q for k in ['priorita', 'crítica', 'critica', 'urgente']):
        criticas = [t for t in tareas if t.get('prioridad') == 'Crítica' and t.get('estado') not in ['Finalizada', 'Cancelada']]
        contexto.append(f"TAREAS CRÍTICAS ABIERTAS ({len(criticas)}):")
        for t in criticas:
            resp = next((u['nombre'] for u in usuarios if u['id'] == t.get('responsablePrincipalId')), 'SIN DESIGNAR')
            contexto.append(f"- [{t.get('codigo')}] \"{t.get('titulo')}\" | Estado: {t.get('estado')} | Resp: {resp} | Vence: {t.get('fechaLimite')}")

    if any(k in q for k in ['vencer', 'vencimiento', 'retrasad', 'plazo', 'fecha']):
        retrasadas = [t for t in tareas if t.get('fechaLimite', '') < hoy and t.get('estado') not in ['Finalizada', 'Cancelada']]
        contexto.append(f"TAREAS RETRASADAS ({len(retrasadas)}):")
        for t in retrasadas:
            resp = next((u['nombre'] for u in usuarios if u['id'] == t.get('responsablePrincipalId')), 'SIN DESIGNAR')
            contexto.append(f"- [{t.get('codigo')}] \"{t.get('titulo')}\" | Venció: {t.get('fechaLimite')} | Resp: {resp}")

    if any(k in q for k in ['sin responsable', 'responsable', 'asignar', 'sin designar']):
        sin_resp = [t for t in tareas if not t.get('responsablePrincipalId') and t.get('estado') not in ['Finalizada', 'Cancelada']]
        contexto.append(f"TAREAS SIN RESPONSABLE DESIGNADO ({len(sin_resp)}):")
        for t in sin_resp:
            contexto.append(f"- [{t.get('codigo')}] \"{t.get('titulo')}\" | Prioridad: {t.get('prioridad')}")

    if len(contexto) <= 1 or any(k in q for k in ['resume', 'situación', 'situacion', 'general']):
        abiertas = [t for t in tareas if t.get('estado') not in ['Finalizada', 'Cancelada']]
        criticas = [t for t in abiertas if t.get('prioridad') == 'Crítica']
        bloqueadas = [t for t in abiertas if t.get('estado') == 'Bloqueada']
        retrasadas = [t for t in abiertas if t.get('fechaLimite', '') < hoy]
        contexto.append("RESUMEN EJECUTIVO GENERAL SINTSEG:")
        contexto.append(f"- Total tareas abiertas: {len(abiertas)}")
        contexto.append(f"- Tareas críticas: {len(criticas)}")
        contexto.append(f"- Tareas bloqueadas: {len(bloqueadas)}")
        contexto.append(f"- Tareas retrasadas: {len(retrasadas)}")
        contexto.append(f"- Expedientes en curso: {len(asuntos)}")

    return "\n".join(contexto)

def consultar_nvidia_api(user_message, context_summary):
    if not has_valid_api_key():
        return {
            "success": False,
            "provider": "Mock / Simulación Local",
            "model": "Demostración Sin Clave",
            "message": f"ℹ️ MODO DEMOSTRACIÓN: NVIDIA_API_KEY no está configurada.\n\n{context_summary}"
        }

    system_prompt = f"""Eres el Asistente de Dirección y Mando del equipo SINTSEG.
Responde de forma concisa, ejecutiva y rigurosa. Usa exclusivamente el contexto proporcionado. No inventes datos. Las decisiones corresponden siempre al responsable humano.

CONTEXTO ACTUAL:\n{context_summary}"""

    payload = {
        "model": NVIDIA_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message}
        ],
        "temperature": 0.2,
        "max_tokens": 1024
    }

    req = urllib.request.Request(
        f"{NVIDIA_BASE_URL}/chat/completions",
        data=json.dumps(payload).encode('utf-8'),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {NVIDIA_API_KEY}"
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=25) as response:
            parsed = json.loads(response.read().decode('utf-8'))
            content = parsed.get('choices', [{}])[0].get('message', {}).get('content', 'Sin respuesta generada por el modelo.')
            return {"success": True, "provider": "NVIDIA API", "model": NVIDIA_MODEL, "message": content}
    except Exception as e:
        return {"success": False, "provider": "NVIDIA API", "model": NVIDIA_MODEL, "message": f"⚠️ NVIDIA no está disponible actualmente ({e})."}

class RequestHandler(BaseHTTPRequestHandler):
    def _set_headers(self, status=200):
        self.send_response(status)
        self.send_header('Content-Type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers(200)

    def do_GET(self):
        if self.path == '/api/health':
            self._set_headers(200)
            res = {
                "status": "online",
                "servidor": "SINTSEG Backend Python Local",
                "proveedorIA": "NVIDIA API",
                "modeloConfigurado": NVIDIA_MODEL,
                "apiKeyConfigurada": has_valid_api_key(),
                "mensaje": "NVIDIA_API_KEY detectada; la validez real se confirma al realizar una consulta." if has_valid_api_key() else "NVIDIA_API_KEY no detectada."
            }
            self.wfile.write(json.dumps(res).encode('utf-8'))
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "No encontrado"}).encode('utf-8'))

    def do_POST(self):
        if self.path == '/api/chat':
            try:
                body = json.loads(self.rfile.read(int(self.headers.get('Content-Length', 0))).decode('utf-8'))
                contexto = seleccionar_contexto(body.get('message', ''), body.get('appData', {}))
                respuesta = consultar_nvidia_api(body.get('message', ''), contexto)
                self._set_headers(200)
                self.wfile.write(json.dumps(respuesta).encode('utf-8'))
            except Exception as e:
                self._set_headers(500)
                self.wfile.write(json.dumps({"success": False, "message": f"Error interno del servidor: {e}"}).encode('utf-8'))
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "No encontrado"}).encode('utf-8'))

if __name__ == '__main__':
    print(f"SINTSEG backend Python en http://localhost:{PORT}")
    httpd = HTTPServer(('0.0.0.0', PORT), RequestHandler)
    httpd.serve_forever()
