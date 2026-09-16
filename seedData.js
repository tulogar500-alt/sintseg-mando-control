// Datos Semilla Oficiales para el Prototipo SINTSEG Mando y Control
// Todos los datos son estrictamente ficticios y no sensibles.
// Las fechas se ajustan dinámicamente con respecto a la fecha actual del sistema.

export const getTodayISO = () => new Date().toISOString().split('T')[0];

export const addDaysISO = (baseDateStr, days) => {
  const d = new Date(baseDateStr || new Date());
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

export const formatFechaLegible = (isoStr) => {
  if (!isoStr) return 'Sin fecha';
  const parts = isoStr.split('-');
  if (parts.length < 3) return isoStr;
  const meses = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT', 'NOV', 'DIC'];
  const mesIndex = parseInt(parts[1], 10) - 1;
  return `${parts[2]} ${meses[mesIndex] || parts[1]} ${parts[0]}`;
};

const HOY = getTodayISO();

export const INITIAL_EQUIPOS = [
  { id: 'eq-1', nombre: 'Seguridad de la Información (SEGINFO)', liderId: 'usr-2', descripcion: 'Auditoría, cifrado y políticas de seguridad digital', color: 'blue' },
  { id: 'eq-2', nombre: 'Protección de Datos (LOPD)', liderId: 'usr-3', descripcion: 'Cumplimiento normativo y privacidad de datos sensibles', color: 'emerald' },
  { id: 'eq-3', nombre: 'Análisis de Riesgos y Amenazas', liderId: 'usr-4', descripcion: 'Evaluación contrainteligencia y gestión de vectores de ataque', color: 'amber' },
  { id: 'eq-4', nombre: 'Respuesta a Incidentes (CERT)', liderId: 'usr-5', descripcion: 'Mitigación inmediata y análisis forense digital', color: 'rose' }
];

export const INITIAL_USUARIOS = [
  { id: 'usr-1', nombre: 'Cnel. Alejandro Ramos', puesto: 'Director General SINTSEG', email: 'a.ramos@sintseg.gob.es', rol: 'JEFE', equipoId: 'eq-1', avatar: 'AR' },
  { id: 'usr-2', nombre: 'Dra. Beatriz Méndez', puesto: 'Jefa de Equipo SEGINFO', email: 'b.mendez@sintseg.gob.es', rol: 'RESPONSABLE_EQUIPO', equipoId: 'eq-1', avatar: 'BM' },
  { id: 'usr-3', nombre: 'Lic. Carlos Izquierdo', puesto: 'Coordinador LOPD', email: 'c.izquierdo@sintseg.gob.es', rol: 'RESPONSABLE_EQUIPO', equipoId: 'eq-2', avatar: 'CI' },
  { id: 'usr-4', nombre: 'Cap. David Navarro', puesto: 'Jefe de Análisis de Riesgos', email: 'd.navarro@sintseg.gob.es', rol: 'RESPONSABLE_EQUIPO', equipoId: 'eq-3', avatar: 'DN' },
  { id: 'usr-5', nombre: 'Ing. Elena Vega', puesto: 'Líder Operativa CERT', email: 'e.vega@sintseg.gob.es', rol: 'RESPONSABLE_EQUIPO', equipoId: 'eq-4', avatar: 'EV' },
  { id: 'usr-6', nombre: 'Fernando Gómez', puesto: 'Analista de Sistemas SEGINFO', email: 'f.gomez@sintseg.gob.es', rol: 'USUARIO', equipoId: 'eq-1', avatar: 'FG' },
  { id: 'usr-7', nombre: 'Gloria Sola', puesto: 'Auditora de Cifrado SEGINFO', email: 'g.sola@sintseg.gob.es', rol: 'USUARIO', equipoId: 'eq-1', avatar: 'GS' },
  { id: 'usr-8', nombre: 'Héctor Prieto', puesto: 'Especialista Legal LOPD', email: 'h.prieto@sintseg.gob.es', rol: 'USUARIO', equipoId: 'eq-2', avatar: 'HP' },
  { id: 'usr-9', nombre: 'Irene Beltrán', puesto: 'Analista de Inteligencia Riesgos', email: 'i.beltran@sintseg.gob.es', rol: 'USUARIO', equipoId: 'eq-3', avatar: 'IB' },
  { id: 'usr-10', nombre: 'Javier Castillo', puesto: 'Investigador Forense CERT', email: 'j.castillo@sintseg.gob.es', rol: 'USUARIO', equipoId: 'eq-4', avatar: 'JC' },
  { id: 'usr-11', nombre: 'Laura Medina', puesto: 'Técnico de Redes y Cripto', email: 'l.medina@sintseg.gob.es', rol: 'USUARIO', equipoId: 'eq-1', avatar: 'LM' },
  { id: 'usr-12', nombre: 'Marcos Alonso', puesto: 'Analista de Vulnerabilidades CERT', email: 'm.alonso@sintseg.gob.es', rol: 'USUARIO', equipoId: 'eq-4', avatar: 'MA' }
];

export const INITIAL_ASUNTOS = [
  {
    id: 'asu-1',
    codigo: 'EXP-2026-001',
    titulo: 'Inspección General SEGINFO 2026',
    descripcion: 'Auditoría integral de seguridad de la información e infraestructura digital acreditada.',
    responsableId: 'usr-2',
    equipoResponsableId: 'eq-1',
    participantesIds: ['usr-6', 'usr-7', 'usr-11', 'usr-3'],
    prioridad: 'Crítica',
    estado: 'En curso',
    progreso: 65,
    fechaInicio: addDaysISO(HOY, -15),
    fechaLimite: addDaysISO(HOY, 30),
    hitosCount: 4,
    reunionesCount: 3,
    documentosIds: ['doc-1', 'doc-2', 'doc-3'],
    historico: [
      { fecha: `${addDaysISO(HOY, -15)} 09:00`, usuario: 'Cnel. Alejandro Ramos', accion: 'Apertura de expediente y designación de responsable principal.' },
      { fecha: `${addDaysISO(HOY, -6)} 14:30`, usuario: 'Dra. Beatriz Méndez', accion: 'Incorporados 3 documentos iniciales de directiva de auditoría.' }
    ]
  },
  {
    id: 'asu-2',
    codigo: 'EXP-2026-002',
    titulo: 'Adecuación al Esquema Nacional de Seguridad (ENS)',
    descripcion: 'Revisión y actualización de controles de seguridad de nivel alto según directiva dictada.',
    responsableId: 'usr-3',
    equipoResponsableId: 'eq-2',
    participantesIds: ['usr-8', 'usr-2'],
    prioridad: 'Alta',
    estado: 'En curso',
    progreso: 45,
    fechaInicio: addDaysISO(HOY, -30),
    fechaLimite: addDaysISO(HOY, 45),
    hitosCount: 5,
    reunionesCount: 2,
    documentosIds: ['doc-4', 'doc-5'],
    historico: [
      { fecha: `${addDaysISO(HOY, -30)} 10:00`, usuario: 'Cnel. Alejandro Ramos', accion: 'Expediente creado.' }
    ]
  },
  {
    id: 'asu-3',
    codigo: 'EXP-2026-003',
    titulo: 'Plan de Contingencia ante Incidentes Críticos',
    descripcion: 'Protocolos de continuidad operativa y recuperación ante desastres informáticos.',
    responsableId: 'usr-5',
    equipoResponsableId: 'eq-4',
    participantesIds: ['usr-10', 'usr-12', 'usr-4'],
    prioridad: 'Crítica',
    estado: 'Bloqueado',
    progreso: 30,
    fechaInicio: addDaysISO(HOY, -10),
    fechaLimite: addDaysISO(HOY, 12),
    hitosCount: 3,
    reunionesCount: 4,
    documentosIds: ['doc-6', 'doc-7'],
    historico: [
      { fecha: `${addDaysISO(HOY, -2)} 11:20`, usuario: 'Ing. Elena Vega', accion: 'Comunicado bloqueo por falta de hardware de respaldo.' }
    ]
  },
  {
    id: 'asu-4',
    codigo: 'EXP-2026-004',
    titulo: 'Evaluación de Vectores de Amenaza Externa 2026',
    descripcion: 'Informe trimestral de vulnerabilidades y superficie de exposición externa.',
    responsableId: 'usr-4',
    equipoResponsableId: 'eq-3',
    participantesIds: ['usr-9', 'usr-12'],
    prioridad: 'Media',
    estado: 'En curso',
    progreso: 80,
    fechaInicio: addDaysISO(HOY, -14),
    fechaLimite: addDaysISO(HOY, 9),
    hitosCount: 2,
    reunionesCount: 1,
    documentosIds: ['doc-8'],
    historico: []
  },
  {
    id: 'asu-5',
    codigo: 'EXP-2026-005',
    titulo: 'Renovación de Licencias y Módulos Criptográficos',
    descripcion: 'Proceso de licitación y validación técnica de HSMs y tarjetas criptográficas.',
    responsableId: 'usr-2',
    equipoResponsableId: 'eq-1',
    participantesIds: ['usr-7', 'usr-11'],
    prioridad: 'Media',
    estado: 'En revisión',
    progreso: 90,
    fechaInicio: addDaysISO(HOY, -40),
    fechaLimite: addDaysISO(HOY, 4),
    hitosCount: 3,
    reunionesCount: 2,
    documentosIds: ['doc-9'],
    historico: []
  },
  {
    id: 'asu-6',
    codigo: 'EXP-2026-006',
    titulo: 'Formación y Concienciación en Ciberseguridad',
    descripcion: 'Jornadas de capacitación obligatoria para todo el personal interno SINTSEG.',
    responsableId: 'usr-3',
    equipoResponsableId: 'eq-2',
    participantesIds: ['usr-8', 'usr-9'],
    prioridad: 'Baja',
    estado: 'Pendiente',
    progreso: 10,
    fechaInicio: addDaysISO(HOY, 15),
    fechaLimite: addDaysISO(HOY, 75),
    hitosCount: 2,
    reunionesCount: 0,
    documentosIds: [],
    historico: []
  },
  {
    id: 'asu-7',
    codigo: 'EXP-2026-007',
    titulo: 'Auditoría Forense de Accesos Privilegiados',
    descripcion: 'Análisis de registros PAM y trazabilidad de cuentas con permisos de administración.',
    responsableId: 'usr-5',
    equipoResponsableId: 'eq-4',
    participantesIds: ['usr-10', 'usr-6'],
    prioridad: 'Alta',
    estado: 'En curso',
    progreso: 50,
    fechaInicio: addDaysISO(HOY, -8),
    fechaLimite: addDaysISO(HOY, 20),
    hitosCount: 3,
    reunionesCount: 1,
    documentosIds: ['doc-10', 'doc-11'],
    historico: []
  },
  {
    id: 'asu-8',
    codigo: 'EXP-2026-008',
    titulo: 'Despliegue del Sistema Local IA para Mando',
    descripcion: 'Instalación y pruebas de validación de modelos Ollama en infraestructura aislada.',
    responsableId: 'usr-1',
    equipoResponsableId: 'eq-1',
    participantesIds: ['usr-2', 'usr-4', 'usr-5'],
    prioridad: 'Crítica',
    estado: 'En curso',
    progreso: 40,
    fechaInicio: addDaysISO(HOY, -4),
    fechaLimite: addDaysISO(HOY, 35),
    hitosCount: 4,
    reunionesCount: 2,
    documentosIds: ['doc-12'],
    historico: []
  }
];

export const INITIAL_TAREAS = [
  {
    id: 'tar-101',
    codigo: 'TAR-101',
    asuntoId: 'asu-1',
    titulo: 'Recopilar inventario acreditado de servidores de alta seguridad',
    descripcion: 'Extraer y verificar la matriz de componentes y direcciones asignadas.',
    fechaCreacion: addDaysISO(HOY, -15),
    fechaInicio: addDaysISO(HOY, -14),
    fechaLimite: addDaysISO(HOY, 1), // Vence mañana (Vencimiento próximo)
    prioridad: 'Crítica',
    estado: 'En curso',
    progreso: 70,
    modalidad: 'Coordinada entre personas',
    responsablePrincipalId: 'usr-6',
    participantesIds: ['usr-7', 'usr-11'],
    equiposImplicadosIds: ['eq-1'],
    equipoApoyoId: 'eq-4',
    autoridadAprobacion: 'Cnel. Alejandro Ramos',
    subtareas: [
      { id: 'sub-1', titulo: 'Verificar servidores en Rack A3', completada: true },
      { id: 'sub-2', titulo: 'Validar firmas digitales del firmware', completada: true },
      { id: 'sub-3', titulo: 'Generar reporte de divergencias', completada: false }
    ],
    dependenciasIds: [],
    documentosAsociados: ['doc-1', 'doc-2'],
    observaciones: 'Falta confirmar datos de la granja de virtualización secundaria.',
    etiquetas: ['Inventario', 'SEGINFO', 'Auditoría'],
    historico: [
      { fecha: `${addDaysISO(HOY, -14)} 10:00`, usuario: 'Dra. Beatriz Méndez', detalle: 'Tarea asignada a Fernando Gómez.' },
      { fecha: `${addDaysISO(HOY, -2)} 16:00`, usuario: 'Fernando Gómez', detalle: 'Progreso actualizado al 70%.' }
    ]
  },
  {
    id: 'tar-102',
    codigo: 'TAR-102',
    asuntoId: 'asu-1',
    titulo: 'Redactar borrador de informe de cumplimiento de directiva 4/2026',
    descripcion: 'Sintetizar hallazgos preliminares y recomendaciones de mitigación.',
    fechaCreacion: addDaysISO(HOY, -11),
    fechaInicio: addDaysISO(HOY, -10),
    fechaLimite: addDaysISO(HOY, 6), // Próximos 7 días
    prioridad: 'Alta',
    estado: 'En curso',
    progreso: 40,
    modalidad: 'Individual',
    responsablePrincipalId: 'usr-2',
    participantesIds: ['usr-6'],
    equiposImplicadosIds: ['eq-1'],
    autoridadAprobacion: 'Cnel. Alejandro Ramos',
    subtareas: [
      { id: 'sub-4', titulo: 'Estructurar apartados 1 al 4', completada: true },
      { id: 'sub-5', titulo: 'Revisar anexos técnicos', completada: false }
    ],
    dependenciasIds: ['tar-101'],
    documentosAsociados: ['doc-3'],
    observaciones: 'Requiere la finalización de TAR-101.',
    etiquetas: ['Informe', 'Normativa'],
    historico: []
  },
  {
    id: 'tar-103',
    codigo: 'TAR-103',
    asuntoId: 'asu-1',
    titulo: 'Auditar política de contraseñas y certificados TLS',
    descripcion: 'Comprobar expiración de certificados y fortaleza de llaves RSA/ECC.',
    fechaCreacion: addDaysISO(HOY, -8),
    fechaInicio: addDaysISO(HOY, -7),
    fechaLimite: addDaysISO(HOY, -1), // RETRASADA (venció ayer)
    prioridad: 'Crítica',
    estado: 'En curso',
    progreso: 50,
    modalidad: 'Individual',
    responsablePrincipalId: 'usr-7',
    participantesIds: [],
    equiposImplicadosIds: ['eq-1'],
    autoridadAprobacion: 'Dra. Beatriz Méndez',
    subtareas: [],
    dependenciasIds: [],
    documentosAsociados: [],
    observaciones: 'Retrasada por interrupción urgente en auditoría de red.',
    bloqueos: 'Sobrecarga de trabajo en auditoría operativa.',
    etiquetas: ['TLS', 'Cripto', 'Retraso'],
    historico: [
      { fecha: `${addDaysISO(HOY, -1)} 18:00`, usuario: 'Sistema', detalle: 'ALERTA: Tarea fuera de plazo.' }
    ]
  },
  {
    id: 'tar-104',
    codigo: 'TAR-104',
    asuntoId: 'asu-1',
    titulo: 'Verificación física de sellos de seguridad en Rack de Mando',
    descripcion: 'Inspección presencial de los dispositivos criptográficos.',
    fechaCreacion: addDaysISO(HOY, -6),
    fechaInicio: addDaysISO(HOY, -5),
    fechaLimite: addDaysISO(HOY, 14),
    prioridad: 'Media',
    estado: 'Pendiente',
    progreso: 0,
    modalidad: 'Equipo',
    responsablePrincipalId: 'usr-11',
    participantesIds: ['usr-6'],
    equiposImplicadosIds: ['eq-1'],
    autoridadAprobacion: 'Dra. Beatriz Méndez',
    subtareas: [],
    dependenciasIds: [],
    documentosAsociados: [],
    observaciones: 'Coordinar acceso con guardia de seguridad.',
    etiquetas: ['Físico', 'Inspección'],
    historico: []
  },
  {
    id: 'tar-201',
    codigo: 'TAR-201',
    asuntoId: 'asu-2',
    titulo: 'Revisión de cláusulas de privacidad en contratos con proveedores',
    descripcion: 'Comprobar adendas de encargo de tratamiento según LOPD/GPRD.',
    fechaCreacion: addDaysISO(HOY, -25),
    fechaInicio: addDaysISO(HOY, -23),
    fechaLimite: addDaysISO(HOY, 9),
    prioridad: 'Alta',
    estado: 'En curso',
    progreso: 60,
    modalidad: 'Coordinada entre personas',
    responsablePrincipalId: 'usr-8',
    participantesIds: ['usr-3'],
    equiposImplicadosIds: ['eq-2'],
    autoridadAprobacion: 'Lic. Carlos Izquierdo',
    subtareas: [],
    dependenciasIds: [],
    documentosAsociados: ['doc-4'],
    observaciones: '',
    etiquetas: ['Legal', 'ENS'],
    historico: []
  },
  {
    id: 'tar-202',
    codigo: 'TAR-202',
    asuntoId: 'asu-2',
    titulo: 'Elaboración del Documento de Seguridad de la Información ENS',
    descripcion: 'Redacción de la versión v3.2 ajustada a la guía CCN-STIC.',
    fechaCreacion: addDaysISO(HOY, -15),
    fechaInicio: addDaysISO(HOY, -13),
    fechaLimite: addDaysISO(HOY, 24),
    prioridad: 'Media',
    estado: 'En curso',
    progreso: 30,
    modalidad: 'Mixta',
    responsablePrincipalId: 'usr-3',
    participantesIds: ['usr-8', 'usr-2'],
    equiposImplicadosIds: ['eq-2', 'eq-1'],
    autoridadAprobacion: 'Cnel. Alejandro Ramos',
    subtareas: [],
    dependenciasIds: [],
    documentosAsociados: ['doc-5'],
    observaciones: '',
    etiquetas: ['Documentación', 'CCN-STIC'],
    historico: []
  },
  {
    id: 'tar-301',
    codigo: 'TAR-301',
    asuntoId: 'asu-3',
    titulo: 'Prueba de conmutación a Centro de Proceso de Datos secundario',
    descripcion: 'Simulacro de caída total del centro primario y medición de RTO/RPO.',
    fechaCreacion: addDaysISO(HOY, -10),
    fechaInicio: addDaysISO(HOY, -9),
    fechaLimite: addDaysISO(HOY, 4),
    prioridad: 'Crítica',
    estado: 'Bloqueada',
    progreso: 20,
    modalidad: 'Coordinada entre equipos',
    responsablePrincipalId: 'usr-5',
    participantesIds: ['usr-10', 'usr-12', 'usr-4'],
    equiposImplicadosIds: ['eq-4', 'eq-3'],
    autoridadAprobacion: 'Cnel. Alejandro Ramos',
    subtareas: [],
    dependenciasIds: [],
    documentosAsociados: ['doc-6'],
    observaciones: 'BLOQUEADA: El switch SAN del centro secundario no responde a comandos de sincronización.',
    bloqueos: 'Fallo de hardware en almacenamiento SAN del CPD-B.',
    etiquetas: ['Simulacro', 'CERT', 'Bloqueo'],
    historico: [
      { fecha: `${addDaysISO(HOY, -2)} 11:20`, usuario: 'Ing. Elena Vega', detalle: 'Estado cambiado a Bloqueada por avería de hardware.' }
    ]
  },
  {
    id: 'tar-302',
    codigo: 'TAR-302',
    asuntoId: 'asu-3',
    titulo: 'Actualizar matriz de escalado de contactos de emergencia',
    descripcion: 'Confirmar teléfonos seguros, claves PGP y cadenas de mando.',
    fechaCreacion: addDaysISO(HOY, -9),
    fechaInicio: addDaysISO(HOY, -8),
    fechaLimite: addDaysISO(HOY, 2),
    prioridad: 'Alta',
    estado: 'En revisión',
    progreso: 90,
    modalidad: 'Individual',
    responsablePrincipalId: 'usr-10',
    participantesIds: [],
    equiposImplicadosIds: ['eq-4'],
    autoridadAprobacion: 'Ing. Elena Vega',
    subtareas: [],
    dependenciasIds: [],
    documentosAsociados: ['doc-7'],
    observaciones: 'Pendiente de firma del Director.',
    etiquetas: ['Contactos', 'Directorio'],
    historico: []
  },
  {
    id: 'tar-401',
    codigo: 'TAR-401',
    asuntoId: 'asu-4',
    titulo: 'Análisis de escaneo perimetral de direcciones IP públicas',
    descripcion: 'Filtrar falsos positivos e identificar puertos abiertos no autorizados.',
    fechaCreacion: addDaysISO(HOY, -4),
    fechaInicio: addDaysISO(HOY, -3),
    fechaLimite: addDaysISO(HOY, 8),
    prioridad: 'Crítica',
    estado: 'Pendiente',
    progreso: 0,
    modalidad: 'Individual',
    responsablePrincipalId: '', // SIN DESIGNAR
    participantesIds: ['usr-9'],
    equiposImplicadosIds: ['eq-3'],
    autoridadAprobacion: 'Cap. David Navarro',
    subtareas: [],
    dependenciasIds: [],
    documentosAsociados: ['doc-8'],
    observaciones: 'Requiere asignación urgente por el Jefe.',
    etiquetas: ['Escaneo', 'Perímetro', 'SinResponsable'],
    historico: []
  },
  {
    id: 'tar-402',
    codigo: 'TAR-402',
    asuntoId: 'asu-4',
    titulo: 'Evaluación de parches de seguridad del kernel en servidores críticos',
    descripcion: 'Revisión de boletines CVE-2026-8910.',
    fechaCreacion: addDaysISO(HOY, -6),
    fechaInicio: addDaysISO(HOY, -4),
    fechaLimite: addDaysISO(HOY, 10),
    prioridad: 'Media',
    estado: 'En curso',
    progreso: 75,
    modalidad: 'Individual',
    responsablePrincipalId: 'usr-9',
    participantesIds: [],
    equiposImplicadosIds: ['eq-3'],
    autoridadAprobacion: 'Cap. David Navarro',
    subtareas: [],
    dependenciasIds: [],
    documentosAsociados: [],
    observaciones: '',
    etiquetas: ['Parches', 'CVE'],
    historico: []
  },
  {
    id: 'tar-501',
    codigo: 'TAR-501',
    asuntoId: 'asu-5',
    titulo: 'Pruebas de estrés y homologación del módulo criptográfico HSM-v4',
    descripcion: 'Verificar operaciones RSA 4096 por segundo.',
    fechaCreacion: addDaysISO(HOY, -35),
    fechaInicio: addDaysISO(HOY, -30),
    fechaLimite: addDaysISO(HOY, 3),
    prioridad: 'Media',
    estado: 'En revisión',
    progreso: 95,
    modalidad: 'Coordinada entre personas',
    responsablePrincipalId: 'usr-7',
    participantesIds: ['usr-11'],
    equiposImplicadosIds: ['eq-1'],
    autoridadAprobacion: 'Dra. Beatriz Méndez',
    subtareas: [],
    dependenciasIds: [],
    documentosAsociados: ['doc-9'],
    observaciones: '',
    etiquetas: ['HSM', 'Cripto'],
    historico: []
  },
  {
    id: 'tar-701',
    codigo: 'TAR-701',
    asuntoId: 'asu-7',
    titulo: 'Extracción de logs de acceso PAM del último trimestre',
    descripcion: 'Normalización de registros de eventos syslogs.',
    fechaCreacion: addDaysISO(HOY, -7),
    fechaInicio: addDaysISO(HOY, -6),
    fechaLimite: addDaysISO(HOY, 7),
    prioridad: 'Alta',
    estado: 'En curso',
    progreso: 60,
    modalidad: 'Individual',
    responsablePrincipalId: 'usr-10',
    participantesIds: ['usr-6'],
    equiposImplicadosIds: ['eq-4', 'eq-1'],
    autoridadAprobacion: 'Ing. Elena Vega',
    subtareas: [],
    dependenciasIds: [],
    documentosAsociados: ['doc-10'],
    observaciones: '',
    etiquetas: ['Forense', 'PAM'],
    historico: []
  },
  {
    id: 'tar-801',
    codigo: 'TAR-801',
    asuntoId: 'asu-8',
    titulo: 'Configuración del servidor local Ollama con modelo Llama 3',
    descripcion: 'Montaje del entorno aislado sin conectividad a internet.',
    fechaCreacion: addDaysISO(HOY, -3),
    fechaInicio: addDaysISO(HOY, -2),
    fechaLimite: addDaysISO(HOY, 14),
    prioridad: 'Crítica',
    estado: 'En curso',
    progreso: 45,
    modalidad: 'Mixta',
    responsablePrincipalId: 'usr-12',
    participantesIds: ['usr-6', 'usr-9'],
    equiposImplicadosIds: ['eq-4', 'eq-1', 'eq-3'],
    autoridadAprobacion: 'Cnel. Alejandro Ramos',
    subtareas: [
      { id: 'sub-81', titulo: 'Despliegue del contenedor local', completada: true },
      { id: 'sub-82', titulo: 'Pruebas de inyección de embeddings', completada: false }
    ],
    dependenciasIds: [],
    documentosAsociados: ['doc-12'],
    observaciones: '',
    etiquetas: ['IA', 'Local', 'Ollama'],
    historico: []
  }
];

// Tareas adicionales para completar las 30 especificadas
const tareasExtra = [
  { id: 'tar-901', codigo: 'TAR-901', asuntoId: 'asu-1', titulo: 'Auditoría de puertos de consola de gestión KVM', estado: 'Finalizada', progreso: 100, prioridad: 'Media', resp: 'usr-6' },
  { id: 'tar-902', codigo: 'TAR-902', asuntoId: 'asu-1', titulo: 'Verificación de copias de respaldo fríos en cinta', estado: 'Finalizada', progreso: 100, prioridad: 'Alta', resp: 'usr-7' },
  { id: 'tar-903', codigo: 'TAR-903', asuntoId: 'asu-2', titulo: 'Formulación de política de uso de dispositivos móviles', estado: 'En curso', progreso: 55, prioridad: 'Media', resp: 'usr-8' },
  { id: 'tar-904', codigo: 'TAR-904', asuntoId: 'asu-2', titulo: 'Mapeo de activos de datos de carácter personal sensible', estado: 'En curso', progreso: 40, prioridad: 'Alta', resp: 'usr-3' },
  { id: 'tar-905', codigo: 'TAR-905', asuntoId: 'asu-3', titulo: 'Redacción de guía de comunicación de crisis ciber', estado: 'Pendiente', progreso: 0, prioridad: 'Baja', resp: 'usr-4' },
  { id: 'tar-906', codigo: 'TAR-906', asuntoId: 'asu-4', titulo: 'Análisis de reputación de direcciones IP de entrada', estado: 'En curso', progreso: 85, prioridad: 'Media', resp: 'usr-9' },
  { id: 'tar-907', codigo: 'TAR-907', asuntoId: 'asu-5', titulo: 'Validación de contratos de soporte criptográfico 24/7', estado: 'Finalizada', progreso: 100, prioridad: 'Baja', resp: 'usr-2' },
  { id: 'tar-908', codigo: 'TAR-908', asuntoId: 'asu-6', titulo: 'Diseño de cuestionario de autoevaluación antiphishing', estado: 'Pendiente', progreso: 0, prioridad: 'Baja', resp: 'usr-8' },
  { id: 'tar-909', codigo: 'TAR-909', asuntoId: 'asu-7', titulo: 'Correlación de eventos de login fuera de horario', estado: 'En curso', progreso: 30, prioridad: 'Alta', resp: 'usr-10' },
  { id: 'tar-910', codigo: 'TAR-910', asuntoId: 'asu-8', titulo: 'Benchmarking de tiempo de respuesta de inferencia local', estado: 'Pendiente', progreso: 15, prioridad: 'Media', resp: 'usr-12' },
  { id: 'tar-911', codigo: 'TAR-911', asuntoId: 'asu-1', titulo: 'Revisión de permisos de la carpeta compartida SEGINFO', estado: 'Asignada', progreso: 0, prioridad: 'Media', resp: 'usr-11' },
  { id: 'tar-912', codigo: 'TAR-912', asuntoId: 'asu-2', titulo: 'Control de caducidad de evaluaciones de impacto (EIPD)', estado: 'Asignada', progreso: 0, prioridad: 'Alta', resp: 'usr-8' },
  { id: 'tar-913', codigo: 'TAR-913', asuntoId: 'asu-3', titulo: 'Verificación de generador diésel del centro de mando', estado: 'Finalizada', progreso: 100, prioridad: 'Crítica', resp: 'usr-5' },
  { id: 'tar-914', codigo: 'TAR-914', asuntoId: 'asu-4', titulo: 'Filtro de reglas SNORT/Suricata para perímetro', estado: 'En curso', progreso: 65, prioridad: 'Alta', resp: 'usr-9' },
  { id: 'tar-915', codigo: 'TAR-915', asuntoId: 'asu-7', titulo: 'Comprobación de doble factor (MFA) en accesos SSH', estado: 'En revisión', progreso: 90, prioridad: 'Crítica', resp: 'usr-6' },
  { id: 'tar-916', codigo: 'TAR-916', asuntoId: 'asu-8', titulo: 'Evaluación de memoria RAM dedicada a GPU para IA', estado: 'En curso', progreso: 50, prioridad: 'Media', resp: 'usr-12' },
  { id: 'tar-917', codigo: 'TAR-917', asuntoId: 'asu-1', titulo: 'Desactivación de usuarios inactivos > 90 días', estado: 'Finalizada', progreso: 100, prioridad: 'Media', resp: 'usr-7' },
  { id: 'tar-918', codigo: 'TAR-918', asuntoId: 'asu-5', titulo: 'Actualización de firmware de conmutadores core', estado: 'Cancelada', progreso: 0, prioridad: 'Baja', resp: 'usr-11' },
  { id: 'tar-919', codigo: 'TAR-919', asuntoId: 'asu-6', titulo: 'Impresión de carteles con decálogo de buenas prácticas', estado: 'Pendiente', progreso: 0, prioridad: 'Baja', resp: 'usr-3' }
];

tareasExtra.forEach(t => {
  INITIAL_TAREAS.push({
    id: t.id,
    codigo: t.codigo,
    asuntoId: t.asuntoId,
    titulo: t.titulo,
    descripcion: `Tarea complementaria ${t.codigo} dentro de la planificación de control.`,
    fechaCreacion: addDaysISO(HOY, -6),
    fechaInicio: addDaysISO(HOY, -5),
    fechaLimite: addDaysISO(HOY, 12),
    prioridad: t.prioridad,
    estado: t.estado,
    progreso: t.progreso,
    modalidad: 'Individual',
    responsablePrincipalId: t.resp,
    participantesIds: [],
    equiposImplicadosIds: ['eq-1'],
    autoridadAprobacion: 'Jefe SINTSEG',
    subtareas: [],
    dependenciasIds: [],
    documentosAsociados: [],
    observaciones: '',
    etiquetas: ['Operativa'],
    historico: []
  });
});

export const INITIAL_DOCUMENTOS = [
  {
    id: 'doc-1',
    nombre: 'Directiva_Auditoria_SEGINFO_2026.pdf',
    tipo: 'PDF',
    tamaño: '2.4 MB',
    fechaCarga: addDaysISO(HOY, -15),
    asuntoId: 'asu-1',
    tareaIds: ['tar-101', 'tar-102'],
    remitente: 'Dirección General de Seguridad',
    destinatario: 'Dra. Beatriz Méndez',
    etiquetas: ['Normativa', 'SEGINFO', 'Oficial'],
    resumenIA: 'Establece los requisitos obligatorios de revisión de activos de red, matrices de cifrado y controles de acceso para el ejercicio 2026.',
    accionesExtraidas: [
      { accion: 'Recopilar inventario acreditado de servidores', fechaLimite: addDaysISO(HOY, 1), prioridad: 'Crítica', responsableSugerido: 'Fernando Gómez' },
      { accion: 'Elaborar informe de cumplimiento', fechaLimite: addDaysISO(HOY, 6), prioridad: 'Alta', responsableSugerido: 'Dra. Beatriz Méndez' }
    ]
  },
  {
    id: 'doc-2',
    nombre: 'Matriz_Servidores_Criticos_v2.xlsx',
    tipo: 'Excel',
    tamaño: '850 KB',
    fechaCarga: addDaysISO(HOY, -13),
    asuntoId: 'asu-1',
    tareaIds: ['tar-101'],
    remitente: 'Fernando Gómez',
    destinatario: 'Equipo SEGINFO',
    etiquetas: ['Inventario', 'Técnico'],
    resumenIA: 'Listado detallado de 48 nodos de cómputo y sus claves de huella digital.',
    accionesExtraidas: []
  },
  {
    id: 'doc-3',
    nombre: 'Borrador_Informe_Preliminar.docx',
    tipo: 'Word',
    tamaño: '1.1 MB',
    fechaCarga: addDaysISO(HOY, -6),
    asuntoId: 'asu-1',
    tareaIds: ['tar-102'],
    remitente: 'Dra. Beatriz Méndez',
    destinatario: 'Cnel. Alejandro Ramos',
    etiquetas: ['Borrador', 'Informe'],
    resumenIA: 'Avance del 65% de las auditorías de seguridad del sistema principal.',
    accionesExtraidas: []
  },
  {
    id: 'doc-4',
    nombre: 'Guia_CCN_STIC_801_ENS.pdf',
    tipo: 'PDF',
    tamaño: '5.2 MB',
    fechaCarga: addDaysISO(HOY, -29),
    asuntoId: 'asu-2',
    tareaIds: ['tar-201', 'tar-202'],
    remitente: 'Centro Criptológico Nacional',
    destinatario: 'Lic. Carlos Izquierdo',
    etiquetas: ['ENS', 'Guía', 'CCN'],
    resumenIA: 'Directrices para la adecuación de sistemas de categoría alta en la administración pública.',
    accionesExtraidas: []
  },
  {
    id: 'doc-5',
    nombre: 'Politica_Proteccion_Datos_SINTSEG.pdf',
    tipo: 'PDF',
    tamaño: '1.8 MB',
    fechaCarga: addDaysISO(HOY, -25),
    asuntoId: 'asu-2',
    tareaIds: ['tar-202'],
    remitente: 'Lic. Carlos Izquierdo',
    destinatario: 'Todos los equipos',
    etiquetas: ['LOPD', 'Políticas'],
    resumenIA: 'Marco de actuación para el tratamiento de ficheros clasificados.',
    accionesExtraidas: []
  },
  {
    id: 'doc-6',
    nombre: 'Protocolo_Continuidad_CPD_2.pdf',
    tipo: 'PDF',
    tamaño: '3.1 MB',
    fechaCarga: addDaysISO(HOY, -10),
    asuntoId: 'asu-3',
    tareaIds: ['tar-301'],
    remitente: 'Ing. Elena Vega',
    destinatario: 'Cnel. Alejandro Ramos',
    etiquetas: ['CERT', 'Desastres'],
    resumenIA: 'Pasos de failover automático para almacenamiento SAN y virtualización.',
    accionesExtraidas: []
  },
  {
    id: 'doc-7',
    nombre: 'Directorio_Escalado_Emergencias.docx',
    tipo: 'Word',
    tamaño: '420 KB',
    fechaCarga: addDaysISO(HOY, -7),
    asuntoId: 'asu-3',
    tareaIds: ['tar-302'],
    remitente: 'Javier Castillo',
    destinatario: 'Ing. Elena Vega',
    etiquetas: ['Directorio', 'Contactos'],
    resumenIA: 'Contactos actualizados de las unidades de enlace en caso de ataque ciber.',
    accionesExtraidas: []
  },
  {
    id: 'doc-8',
    nombre: 'Escaneo_Perimetral_Semana_37.txt',
    tipo: 'TXT',
    tamaño: '150 KB',
    fechaCarga: addDaysISO(HOY, -4),
    asuntoId: 'asu-4',
    tareaIds: ['tar-401'],
    remitente: 'Sistema Automatizado de Monitorización',
    destinatario: 'Cap. David Navarro',
    etiquetas: ['Log', 'Escaneo'],
    resumenIA: 'Detección de 3 intentos de exploración en rango IP 192.168.100.x.',
    accionesExtraidas: [
      { accion: 'Analizar puertos expuestos en IP pública 212.45.x.x', fechaLimite: addDaysISO(HOY, 8), prioridad: 'Crítica', responsableSugerido: 'Sin designar' }
    ]
  },
  {
    id: 'doc-9',
    nombre: 'Certificado_Homologacion_HSM.pdf',
    tipo: 'PDF',
    tamaño: '890 KB',
    fechaCarga: addDaysISO(HOY, -33),
    asuntoId: 'asu-5',
    tareaIds: ['tar-501'],
    remitente: 'Fabricante CriptoTech',
    destinatario: 'Dra. Beatriz Méndez',
    etiquetas: ['Criptografía', 'HSM'],
    resumenIA: 'Acreditación FIPS 140-3 Nivel 4 para los dispositivos adquiridos.',
    accionesExtraidas: []
  },
  {
    id: 'doc-10',
    nombre: 'Auditoria_Logs_PAM_Q3.csv',
    tipo: 'Excel',
    tamaño: '4.5 MB',
    fechaCarga: addDaysISO(HOY, -7),
    asuntoId: 'asu-7',
    tareaIds: ['tar-701'],
    remitente: 'Javier Castillo',
    destinatario: 'Ing. Elena Vega',
    etiquetas: ['Logs', 'PAM', 'Forense'],
    resumenIA: '124,000 registros de elevación de privilegios registrados en el periodo.',
    accionesExtraidas: []
  },
  {
    id: 'doc-11',
    nombre: 'Captura_Pantalla_Incidente.png',
    tipo: 'Imagen',
    tamaño: '1.2 MB',
    fechaCarga: addDaysISO(HOY, -5),
    asuntoId: 'asu-7',
    tareaIds: [],
    remitente: 'Fernando Gómez',
    destinatario: 'Equipo CERT',
    etiquetas: ['Evidencia', 'Imagen'],
    resumenIA: 'Captura de alerta en consola de supervisión.',
    accionesExtraidas: []
  },
  {
    id: 'doc-12',
    nombre: 'Arquitectura_IA_Local_Ollama.pdf',
    tipo: 'PDF',
    tamaño: '2.9 MB',
    fechaCarga: addDaysISO(HOY, -3),
    asuntoId: 'asu-8',
    tareaIds: ['tar-801'],
    remitente: 'Marcos Alonso',
    destinatario: 'Cnel. Alejandro Ramos',
    etiquetas: ['IA', 'Arquitectura'],
    resumenIA: 'Esquema de aislamiento para la ejecución de LLMs en local mediante contenedores seguros.',
    accionesExtraidas: []
  }
];

export const INITIAL_EVENTOS = [
  { id: 'evt-1', titulo: 'Vencimiento: Recopilar inventario acreditado', tipo: 'Plazo', fecha: addDaysISO(HOY, 1), hora: '14:00', asuntoId: 'asu-1', tareaId: 'tar-101', prioridad: 'Crítica' },
  { id: 'evt-2', titulo: 'Reunión de Coordinación de Mando SINTSEG', tipo: 'Reunión', fecha: addDaysISO(HOY, 2), hora: '09:30', asuntoId: 'asu-1', prioridad: 'Alta' },
  { id: 'evt-3', titulo: 'Hito: Cierre de Borrador preliminar SEGINFO', tipo: 'Hito', fecha: addDaysISO(HOY, 6), hora: '18:00', asuntoId: 'asu-1', tareaId: 'tar-102', prioridad: 'Alta' },
  { id: 'evt-4', titulo: 'Vencimiento Retrasado: Auditar política contraseñas', tipo: 'Plazo', fecha: addDaysISO(HOY, -1), hora: '23:59', asuntoId: 'asu-1', tareaId: 'tar-103', prioridad: 'Crítica' },
  { id: 'evt-5', titulo: 'Inspección Presencial CPD Secundario', tipo: 'Inspección', fecha: addDaysISO(HOY, 4), hora: '11:00', asuntoId: 'asu-3', prioridad: 'Crítica' },
  { id: 'evt-6', titulo: 'Reunión con Comité de Protección de Datos', tipo: 'Reunión', fecha: addDaysISO(HOY, 9), hora: '10:00', asuntoId: 'asu-2', prioridad: 'Media' },
  { id: 'evt-7', titulo: 'Entrega de Informe de Vectores de Amenaza', tipo: 'Entrega', fecha: addDaysISO(HOY, 9), hora: '15:00', asuntoId: 'asu-4', prioridad: 'Media' },
  { id: 'evt-8', titulo: 'Pruebas de Inferencia IA Local Ollama', tipo: 'Hito', fecha: addDaysISO(HOY, 14), hora: '12:00', asuntoId: 'asu-8', prioridad: 'Crítica' },
  { id: 'evt-9', titulo: 'Comité Trimestral de Gestión de Riesgos', tipo: 'Reunión', fecha: addDaysISO(HOY, 16), hora: '09:00', asuntoId: 'asu-4', prioridad: 'Alta' },
  { id: 'evt-10', titulo: 'Vencimiento Final: Inspección SEGINFO 2026', tipo: 'Entrega', fecha: addDaysISO(HOY, 30), hora: '23:59', asuntoId: 'asu-1', prioridad: 'Crítica' }
];

export const INITIAL_ALERTAS = [
  {
    id: 'alt-1',
    tipo: 'VENCIDA',
    titulo: 'Tarea fuera de plazo',
    mensaje: 'La tarea TAR-103 "Auditar política de contraseñas y certificados TLS" venció ayer y continúa en curso (50%).',
    fecha: `${HOY} 08:00`,
    nivel: 'Crítica',
    leida: false,
    referenciaId: 'tar-103'
  },
  {
    id: 'alt-2',
    tipo: 'SIN_RESPONSABLE',
    titulo: 'Tarea crítica sin responsable asignado',
    mensaje: 'La tarea TAR-401 "Análisis de escaneo perimetral" no tiene responsable principal designado.',
    fecha: `${HOY} 08:05`,
    nivel: 'Crítica',
    leida: false,
    referenciaId: 'tar-401'
  },
  {
    id: 'alt-3',
    tipo: 'BLOQUEO',
    titulo: 'Bloqueo comunicado en Asunto Crítico',
    mensaje: 'El Asunto EXP-2026-003 "Plan de Contingencia" presenta la tarea TAR-301 bloqueada por fallo de hardware SAN.',
    fecha: `${addDaysISO(HOY, -2)} 11:20`,
    nivel: 'Alta',
    leida: true,
    referenciaId: 'asu-3'
  },
  {
    id: 'alt-4',
    tipo: 'VENCIMIENTO_PROXIMO',
    titulo: 'Vencimiento en 24 horas',
    mensaje: 'La tarea TAR-101 "Recopilar inventario acreditado" vence mañana.',
    fecha: `${HOY} 09:00`,
    nivel: 'Alta',
    leida: false,
    referenciaId: 'tar-101'
  },
  {
    id: 'alt-5',
    tipo: 'SOBRECARGA',
    titulo: 'Sobrecarga detectada en personal',
    mensaje: 'Fernando Gómez (usr-6) acumula elevada densidad de tareas asignadas.',
    fecha: `${HOY} 09:15`,
    nivel: 'Media',
    leida: false,
    referenciaId: 'usr-6'
  }
];

export const INITIAL_TRAZABILIDAD = [
  { id: 'tr-1', fecha: HOY, hora: '09:30', usuario: 'Cnel. Alejandro Ramos', rol: 'JEFE', accion: 'Consulta de Dashboard Mando', detalles: 'Visualización ejecutiva de la situación de 8 asuntos activos.', entidad: 'Dashboard' },
  { id: 'tr-2', fecha: HOY, hora: '09:15', usuario: 'Sistema IA', rol: 'SISTEMA', accion: 'Detección de sobrecarga', detalles: 'Generada alerta por alta densidad de tareas en Fernando Gómez.', entidad: 'Alerta' },
  { id: 'tr-3', fecha: addDaysISO(HOY, -1), hora: '18:00', usuario: 'Sistema', rol: 'SISTEMA', accion: 'Registro de vencimiento', detalles: 'La tarea TAR-103 ha excedido su fecha límite fijada.', entidad: 'Tarea TAR-103' },
  { id: 'tr-4', fecha: addDaysISO(HOY, -2), hora: '11:20', usuario: 'Ing. Elena Vega', rol: 'RESPONSABLE_EQUIPO', accion: 'Comunicación de Bloqueo', detalles: 'Registrado fallo en switch SAN del CPD secundario.', entidad: 'Tarea TAR-301' },
  { id: 'tr-5', fecha: addDaysISO(HOY, -3), hora: '14:00', usuario: 'Marcos Alonso', rol: 'USUARIO', accion: 'Carga de Documento', detalles: 'Subido archivo Arquitectura_IA_Local_Ollama.pdf', entidad: 'Documentos' },
  { id: 'tr-6', fecha: addDaysISO(HOY, -4), hora: '10:00', usuario: 'Cnel. Alejandro Ramos', rol: 'JEFE', accion: 'Creación de Asunto', detalles: 'Apertura de EXP-2026-008 "Despliegue del Sistema Local IA".', entidad: 'Asunto EXP-2026-008' }
];
