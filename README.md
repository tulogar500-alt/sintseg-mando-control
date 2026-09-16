# 🛡️ SINTSEG — Dirección, Coordinación y Seguimiento (Mando y Control)

Plataforma web profesional para la gestión de expedientes, tareas, documentos y coordinación de equipos de seguridad e inteligencia SINTSEG. Diseñada para operar en entornos de mando con control humano garantizado (**IA Analiza → IA Propone → Jefe Decide → Sistema Ejecuta**).

> ⚠️ **IMPORTANTE**: Prototipo desarrollado para fines docentes y de demostración. Utiliza exclusivamente datos ficticios no sensibles.

---

## 🚀 Características Principales

1. **Dashboard Mando General (< 30s Status)**:
   - Resumen ejecutivo en tiempo real con KPIs de tareas abiertas, críticas, bloqueadas y retrasadas.
   - Bloque de **Atención del Jefe** con detección automática de alertas graves.
   - Generación instantánea de **Briefings Ejecutivos** (Diario, Semanal, Mensual).

2. **Gestión de Asuntos y Expedientes Máster**:
   - Entidades superiores que agrupan tareas, documentos, hitos y responsables principales.

3. **Control Avanzado de Tareas**:
   - Clasificación por Prioridad (*Crítica, Alta, Media, Baja*), Estado y Modalidades de Ejecución (*Individual, Equipo, Coordinada entre personas, Coordinada entre equipos, Mixta*).
   - Distinción entre **Responsable Principal** y **Participantes**.

4. **Redistribución de Carga de Trabajo Asistida por IA**:
   - Cálculo de densidad de carga ponderada (Crítica=4pt, Alta=3pt, Media=2pt, Baja=1pt + penalización por retrasos).
   - Propuesta de reequilibrio de tareas por IA ejecutable tras confirmación del Mando.

5. **Bandeja de Entrada Documental & Análisis IA**:
   - Extracción de acciones requeridas y fechas límite con propuesta automática de tareas.

6. **Trazabilidad e Historial Inmutable**:
   - Registro de auditoría con fecha, hora, usuario y acción realizada.
   - Persistencia temporal en `localStorage` con opción de *Restaurar Datos de Demostración*.

7. **Soberanía y Funcionamiento Local**:
   - Diseñado sin dependencia obligatoria de servicios cloud de pago.
   - Desacoplado para futura integración con modelos locales **Ollama (Llama 3)** e infraestructura aislada.

---

## 📂 Estructura del Proyecto

```text
sintseg-app/
├── index.html        # Aplicación SPA autosuficiente (React 18 + Babel + Tailwind)
├── seedData.js       # Datos semilla iniciales (12 usuarios, 4 equipos, 8 expedientes, 30 tareas)
├── app.jsx           # Componente React principal
└── README.md         # Documentación del proyecto
```

---

## 🖥️ Cómo Ejecutar Localmente

1. Descarga o clona este repositorio.
2. Haz **doble clic** en el archivo `index.html` para abrir la aplicación directamente en tu navegador (Chrome, Edge, Firefox, Safari).
3. No requiere instalación de `npm` ni servidor Node.js.

---

## ⚖️ Licencia

Software libre y de código abierto para fines educativos y de prototipado.
