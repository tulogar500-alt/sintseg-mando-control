import {
  INITIAL_EQUIPOS,
  INITIAL_USUARIOS,
  INITIAL_ASUNTOS,
  INITIAL_TAREAS,
  INITIAL_DOCUMENTOS,
  INITIAL_EVENTOS,
  INITIAL_ALERTAS,
  INITIAL_TRAZABILIDAD,
  getTodayISO,
  addDaysISO,
  formatFechaLegible
} from './seedData.js';

const { useState, useEffect, useMemo } = React;

const STORAGE_KEY = 'SINTSEG_APP_DATA_V1.1';

function SintsegApp() {
  const HOY = useMemo(() => getTodayISO(), []);

  // Cargar estado desde localStorage o fallback a Datos Semilla
  const [dataLoaded, setDataLoaded] = useState(false);
  const [rolActual, setRolActual] = useState('JEFE'); // 'JEFE' | 'RESPONSABLE_EQUIPO' | 'USUARIO'
  const [usuarioActual, setUsuarioActual] = useState('usr-1'); // Default Cnel. Alejandro Ramos
  const [vistaActiva, setVistaActiva] = useState('dashboard'); // 11 vistas

  const [equipos, setEquipos] = useState(INITIAL_EQUIPOS);
  const [usuarios, setUsuarios] = useState(INITIAL_USUARIOS);
  const [asuntos, setAsuntos] = useState(INITIAL_ASUNTOS);
  const [tareas, setTareas] = useState(INITIAL_TAREAS);
  const [documentos, setDocumentos] = useState(INITIAL_DOCUMENTOS);
  const [eventos, setEventos] = useState(INITIAL_EVENTOS);
  const [alertas, setAlertas] = useState(INITIAL_ALERTAS);
  const [trazabilidad, setTrazabilidad] = useState(INITIAL_TRAZABILIDAD);

  // Notificaciones Toast (Reemplazo de alert())
  const [toast, setToast] = useState(null);
  const showToast = (mensaje, tipo = 'success') => {
    setToast({ mensaje, tipo });
    setTimeout(() => setToast(null), 3500);
  };

  // Carga Inicial desde localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.asuntos) setAsuntos(parsed.asuntos);
        if (parsed.tareas) setTareas(parsed.tareas);
        if (parsed.usuarios) setUsuarios(parsed.usuarios);
        if (parsed.equipos) setEquipos(parsed.equipos);
        if (parsed.documentos) setDocumentos(parsed.documentos);
        if (parsed.eventos) setEventos(parsed.eventos);
        if (parsed.alertas) setAlertas(parsed.alertas);
        if (parsed.trazabilidad) setTrazabilidad(parsed.trazabilidad);
      }
    } catch (err) {
      console.error('Error cargando localStorage:', err);
    }
    setDataLoaded(true);
  }, []);

  // Persistencia Automática en localStorage
  useEffect(() => {
    if (!dataLoaded) return;
    try {
      const stateToSave = {
        asuntos,
        tareas,
        usuarios,
        equipos,
        documentos,
        eventos,
        alertas,
        trazabilidad
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (err) {
      console.error('Error guardando localStorage:', err);
    }
  }, [asuntos, tareas, usuarios, equipos, documentos, eventos, alertas, trazabilidad, dataLoaded]);

  // Inicialización de iconos de Lucide
  useEffect(() => {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  });

  // Helper para auditoría
  const registrarTrazabilidad = (accion, entidad, detalles) => {
    const usr = usuarios.find(u => u.id === usuarioActual) || usuarios[0];
    const ahora = new Date();
    const hora = ahora.toTimeString().split(' ')[0].substring(0, 5);
    const nuevaTr = {
      id: `tr-${Date.now()}`,
      fecha: HOY,
      hora: hora,
      usuario: usr.nombre,
      rol: rolActual,
      accion: accion,
      detalles: detalles,
      entidad: entidad
    };
    setTrazabilidad(prev => [nuevaTr, ...prev]);
  };

  // ---------------------------------------------------------------------------
  // FÓRMULA DE CARGA DE TRABAJO PONDERADA (Puntos & Porcentaje)
  // ---------------------------------------------------------------------------
  const calcularCargaUsuario = (userId) => {
    const asignadas = tareas.filter(t => t.responsablePrincipalId === userId && t.estado !== 'Finalizada' && t.estado !== 'Cancelada');
    const participando = tareas.filter(t => t.participantesIds.includes(userId) && t.estado !== 'Finalizada' && t.estado !== 'Cancelada');

    let puntos = 0;
    let criticas = 0;
    let retrasadas = 0;

    asignadas.forEach(t => {
      if (t.prioridad === 'Crítica') { puntos += 4; criticas++; }
      else if (t.prioridad === 'Alta') puntos += 3;
      else if (t.prioridad === 'Media') puntos += 2;
      else if (t.prioridad === 'Baja') puntos += 1;

      if (t.fechaLimite < HOY) { puntos += 2; retrasadas++; } // Penalización por retraso
    });

    participando.forEach(t => {
      puntos += 1; // Ponderación de apoyo
    });

    const pct = Math.min(100, Math.round((puntos / 15) * 100));

    return {
      puntos,
      pct,
      totalAsignadas: asignadas.length,
      totalParticipando: participando.length,
      criticas,
      retrasadas
    };
  };

  // Métricas Calculadas Dinámicamente para Dashboard
  const kpis = useMemo(() => {
    const abiertas = tareas.filter(t => t.estado !== 'Finalizada' && t.estado !== 'Cancelada');
    const pendientes = tareas.filter(t => t.estado === 'Pendiente');
    const enCurso = tareas.filter(t => t.estado === 'En curso');
    const enRevision = tareas.filter(t => t.estado === 'En revisión');
    const bloqueadas = tareas.filter(t => t.estado === 'Bloqueada');
    const finalizadas = tareas.filter(t => t.estado === 'Finalizada');
    const criticas = abiertas.filter(t => t.prioridad === 'Crítica');
    const sinResponsable = abiertas.filter(t => !t.responsablePrincipalId);
    
    // Tareas retrasadas dinámicas (fechaLimite < HOY)
    const retrasadas = abiertas.filter(t => t.fechaLimite < HOY);

    return {
      totalAbiertas: abiertas.length,
      pendientes: pendientes.length,
      enCurso: enCurso.length,
      enRevision: enRevision.length,
      bloqueadas: bloqueadas.length,
      finalizadas: finalizadas.length,
      criticas: criticas.length,
      sinResponsable: sinResponsable.length,
      retrasadas: retrasadas.length,
      asuntosActivos: asuntos.filter(a => a.estado !== 'Finalizado').length
    };
  }, [tareas, asuntos, HOY]);

  const alertasNoLeidas = useMemo(() => alertas.filter(a => !a.leida).length, [alertas]);

  // Cambiar Rol de Demostración
  const cambiarRol = (nuevoRol) => {
    setRolActual(nuevoRol);
    let idUsr = 'usr-1';
    if (nuevoRol === 'RESPONSABLE_EQUIPO') idUsr = 'usr-2';
    if (nuevoRol === 'USUARIO') idUsr = 'usr-6'; // Fernando Gómez
    setUsuarioActual(idUsr);
    showToast(`Conmutado contexto a rol ${nuevoRol === 'JEFE' ? 'Jefe / Mando' : nuevoRol === 'RESPONSABLE_EQUIPO' ? 'Responsable Equipo' : 'Usuario Operativo'}`, 'info');
  };

  // ---------------------------------------------------------------------------
  // ESTADOS DE MODALES
  // ---------------------------------------------------------------------------
  const [modalReasignarTarea, setModalReasignarTarea] = useState(null); // Tarea objeto
  const [modalNuevaTareaOpen, setModalNuevaTareaOpen] = useState(false);
  const [modalEditarTarea, setModalEditarTarea] = useState(null); // Tarea objeto
  const [modalDetalleTarea, setModalDetalleTarea] = useState(null); // Tarea objeto
  const [modalNuevoAsuntoOpen, setModalNuevoAsuntoOpen] = useState(false);
  const [modalBriefingOpen, setModalBriefingOpen] = useState(false);
  const [tipoBriefing, setTipoBriefing] = useState('Diario');
  const [modalRedistribucionOpen, setModalRedistribucionOpen] = useState(false);
  const [propuestaRedistribucion, setPropuestaRedistribucion] = useState(null);
  const [docParaAnalizar, setDocParaAnalizar] = useState(null);
  const [propuestaTareaDoc, setPropuestaTareaDoc] = useState(null);

  // Pestañas de Agenda (HOY, 7 DÍAS, 30 DÍAS)
  const [pestanaAgenda, setPestanaAgenda] = useState('HOY');

  // Pestañas de Usuario ("MIS TAREAS")
  const [pestanaMisTareas, setPestanaMisTareas] = useState('RESPONSABLE');

  // Estado del Asistente IA
  const [asistenteMensajes, setAsistenteMensajes] = useState([
    { remitente: 'ia', texto: '¡Saludos, Mi Coronel! Soy el Asistente de Dirección SINTSEG. Estoy conectado a la base de datos viva de expedientes, tareas, documentos y cargas de trabajo. ¿En qué puedo asistir al Mando hoy?' }
  ]);
  const [asistenteInput, setAsistenteInput] = useState('');
  const [busquedaGlobal, setBusquedaGlobal] = useState('');

  // ---------------------------------------------------------------------------
  // NAVEGACIÓN LATERAL (11 MÓDULOS)
  // ---------------------------------------------------------------------------
  const menuModulos = [
    { id: 'dashboard', nombre: 'Dashboard Mando', icono: 'layout-dashboard' },
    { id: 'asuntos', nombre: 'Asuntos / Expedientes', icono: 'folder-git2', badge: asuntos.length },
    { id: 'bandeja', nombre: 'Bandeja de Entrada', icono: 'inbox', badge: 'IA' },
    { id: 'tareas', nombre: 'Gestión de Tareas', icono: 'check-square', badge: kpis.totalAbiertas },
    { id: 'calendario', nombre: 'Calendario y Agenda', icono: 'calendar' },
    { id: 'equipo', nombre: 'Equipo y Carga', icono: 'users' },
    { id: 'documentos', nombre: 'Documentos', icono: 'file-text', badge: documentos.length },
    { id: 'alertas', nombre: 'Alertas de Mando', icono: 'bell', badge: alertasNoLeidas, badgeColor: 'bg-red-600' },
    { id: 'informes', nombre: 'Informes Ejecutivos', icono: 'bar-chart-3' },
    { id: 'asistente', nombre: 'Asistente IA Mando', icono: 'bot' },
    { id: 'configuracion', nombre: 'Configuración', icono: 'settings' }
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950">
      
      {/* NOTIFICACIÓN TOAST FLOTANTE */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-2xl border text-xs font-bold flex items-center space-x-2 transition-all duration-300 ${
          toast.tipo === 'success' ? 'bg-emerald-950 border-emerald-700 text-emerald-300' :
          toast.tipo === 'info' ? 'bg-blue-950 border-blue-700 text-blue-300' : 'bg-red-950 border-red-700 text-red-300'
        }`}>
          <span>{toast.mensaje}</span>
        </div>
      )}

      {/* -------------------------------------------------------------------- */}
      {/* MENÚ LATERAL (SIDEBAR 11 MÓDULOS) */}
      {/* -------------------------------------------------------------------- */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between shrink-0">
        <div>
          <div className="p-4 border-b border-slate-800 flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-700 to-amber-600 flex items-center justify-center font-bold text-slate-950 shadow-md">
              <i data-lucide="shield" className="w-6 h-6 text-slate-950"></i>
            </div>
            <div>
              <h1 className="font-extrabold text-sm tracking-wider text-slate-100 uppercase">SINTSEG</h1>
              <p className="text-xs text-amber-500 font-medium">Mando & Coordinación</p>
            </div>
          </div>

          <nav className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-160px)]">
            {menuModulos.map(mod => {
              const activo = vistaActiva === mod.id;
              return (
                <button
                  key={mod.id}
                  onClick={() => setVistaActiva(mod.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    activo
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <i data-lucide={mod.icono} className="w-4 h-4"></i>
                    <span>{mod.nombre}</span>
                  </div>
                  {mod.badge !== undefined && (
                    <span className={`px-1.5 py-0.5 text-[10px] rounded-full font-bold ${mod.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                      {mod.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-3 border-t border-slate-800 bg-slate-950/60">
          <div className="flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center space-x-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>MODO DEMOSTRACIÓN IA</span>
            </span>
            <span className="text-[10px] font-mono text-slate-500">v1.1 Real</span>
          </div>
        </div>
      </aside>

      {/* -------------------------------------------------------------------- */}
      {/* ÁREA PRINCIPAL */}
      {/* -------------------------------------------------------------------- */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* CABECERA SUPERIOR */}
        <header className="h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-6 flex items-center justify-between shrink-0">
          
          <div className="flex items-center space-x-4">
            <h2 className="text-base font-bold text-slate-100 flex items-center space-x-2">
              <span>{menuModulos.find(m => m.id === vistaActiva)?.nombre}</span>
            </h2>
            
            {/* ETIQUETA DE SEGURIDAD ACTUALIZADA */}
            <span className="text-xs px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-400 font-mono font-bold">
              PROTOTIPO · DATOS FICTICIOS
            </span>
          </div>

          <div className="flex items-center space-x-4">
            
            {/* Selector de Rol en Cabecera */}
            <div className="flex items-center space-x-1.5 bg-slate-950 border border-slate-800 rounded-lg p-1 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-500 px-2">Rol Vista:</span>
              <button
                onClick={() => cambiarRol('JEFE')}
                className={`px-2.5 py-1 rounded font-semibold transition ${
                  rolActual === 'JEFE' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                JEFE / MANDO
              </button>
              <button
                onClick={() => cambiarRol('RESPONSABLE_EQUIPO')}
                className={`px-2.5 py-1 rounded font-semibold transition ${
                  rolActual === 'RESPONSABLE_EQUIPO' ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                RESPONSABLE
              </button>
              <button
                onClick={() => cambiarRol('USUARIO')}
                className={`px-2.5 py-1 rounded font-semibold transition ${
                  rolActual === 'USUARIO' ? 'bg-emerald-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                USUARIO
              </button>
            </div>

            {/* Icono de Alerta */}
            <button
              onClick={() => setVistaActiva('alertas')}
              className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
              title="Ver Alertas de Mando"
            >
              <i data-lucide="bell" className="w-4 h-4"></i>
              {alertasNoLeidas > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {alertasNoLeidas}
                </span>
              )}
            </button>

            {/* Perfil del Usuario Activo */}
            <div className="flex items-center space-x-3 border-l border-slate-800 pl-4">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-bold text-xs text-white">
                {usuarios.find(u => u.id === usuarioActual)?.avatar || 'US'}
              </div>
              <div className="hidden md:block text-left">
                <div className="text-xs font-bold text-slate-200">{usuarios.find(u => u.id === usuarioActual)?.nombre}</div>
                <div className="text-[10px] text-slate-400">{usuarios.find(u => u.id === usuarioActual)?.puesto}</div>
              </div>
            </div>

          </div>
        </header>

        {/* CONTENIDO PRINCIPAL */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-950">
          
          {/* ================================================================= */}
          {/* VISTA 1: DASHBOARD MANDO GENERAL */}
          {/* ================================================================= */}
          {vistaActiva === 'dashboard' && (
            <div className="space-y-6">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-5 rounded-xl">
                <div>
                  <h3 className="text-lg font-bold text-slate-100">Situación General Operativa en Tiempo Real</h3>
                  <p className="text-xs text-slate-400">Fecha del Sistema: <strong className="text-amber-400 font-mono">{formatFechaLegible(HOY)}</strong> | Control consolidado de expedientes y tareas SINTSEG.</p>
                </div>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setModalNuevaTareaOpen(true)}
                    className="flex items-center space-x-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition shadow"
                  >
                    <span>+ NUEVA TAREA</span>
                  </button>
                  <button
                    onClick={() => setModalBriefingOpen(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-lg text-xs shadow-lg transition"
                  >
                    <i data-lucide="file-text" className="w-4 h-4"></i>
                    <span>GENERAR BRIEFING</span>
                  </button>
                </div>
              </div>

              {/* TARJETAS DE KPIs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                  <div className="text-xs text-slate-400 font-semibold uppercase">Total Tareas Abiertas</div>
                  <div className="text-3xl font-extrabold text-blue-400 mt-1">{kpis.totalAbiertas}</div>
                  <div className="text-[11px] text-slate-500 mt-1">en {kpis.asuntosActivos} asuntos activos</div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                  <div className="text-xs text-slate-400 font-semibold uppercase">Tareas Críticas</div>
                  <div className="text-3xl font-extrabold text-amber-500 mt-1">{kpis.criticas}</div>
                  <div className="text-[11px] text-slate-500 mt-1">Atención ejecutiva</div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                  <div className="text-xs text-slate-400 font-semibold uppercase">Tareas Bloqueadas</div>
                  <div className="text-3xl font-extrabold text-rose-500 mt-1">{kpis.bloqueadas}</div>
                  <div className="text-[11px] text-slate-500 mt-1">Desbloqueo pendiente</div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl">
                  <div className="text-xs text-slate-400 font-semibold uppercase">Tareas Retrasadas</div>
                  <div className="text-3xl font-extrabold text-red-400 mt-1">{kpis.retrasadas}</div>
                  <div className="text-[11px] text-slate-500 mt-1">Vencimiento &lt; {formatFechaLegible(HOY)}</div>
                </div>
              </div>

              {/* BLOQUE ATENCIÓN DEL JEFE */}
              <div className="bg-gradient-to-r from-red-950/40 to-slate-900 border border-red-900/50 p-5 rounded-xl">
                <div className="flex items-center space-x-2 text-red-400 font-extrabold text-sm uppercase mb-3">
                  <i data-lucide="alert-triangle" className="w-5 h-5"></i>
                  <span>Atención del Jefe (Detección Automática)</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  
                  {/* Tarea Retrasada */}
                  <div className="bg-slate-950/80 p-3.5 rounded-lg border border-red-900/30 space-y-2">
                    <span className="text-[10px] font-bold bg-red-600/20 text-red-400 px-2 py-0.5 rounded uppercase">Retrasada / Vencida</span>
                    {tareas.find(t => t.fechaLimite < HOY && t.estado !== 'Finalizada') ? (
                      <div>
                        <h4 className="text-xs font-bold text-slate-200 mt-1">{tareas.find(t => t.fechaLimite < HOY && t.estado !== 'Finalizada')?.codigo}: {tareas.find(t => t.fechaLimite < HOY && t.estado !== 'Finalizada')?.titulo}</h4>
                        <p className="text-[11px] text-slate-400 mt-1">Venció el {formatFechaLegible(tareas.find(t => t.fechaLimite < HOY && t.estado !== 'Finalizada')?.fechaLimite)}.</p>
                        <button
                          onClick={() => setModalReasignarTarea(tareas.find(t => t.fechaLimite < HOY && t.estado !== 'Finalizada'))}
                          className="mt-2 text-xs text-amber-400 hover:underline font-semibold"
                        >
                          Reasignar / Reorganizar →
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">Sin tareas retrasadas en este momento.</p>
                    )}
                  </div>

                  {/* Tarea Sin Responsable */}
                  <div className="bg-slate-950/80 p-3.5 rounded-lg border border-amber-900/30 space-y-2">
                    <span className="text-[10px] font-bold bg-amber-600/20 text-amber-400 px-2 py-0.5 rounded uppercase">Sin Responsable</span>
                    {tareas.find(t => !t.responsablePrincipalId && t.estado !== 'Finalizada') ? (
                      <div>
                        <h4 className="text-xs font-bold text-slate-200 mt-1">{tareas.find(t => !t.responsablePrincipalId)?.codigo}: {tareas.find(t => !t.responsablePrincipalId)?.titulo}</h4>
                        <p className="text-[11px] text-slate-400 mt-1">Tarea Crítica pendiente de designación.</p>
                        <button
                          onClick={() => setModalReasignarTarea(tareas.find(t => !t.responsablePrincipalId))}
                          className="mt-2 text-xs text-amber-400 hover:underline font-semibold"
                        >
                          Designar Responsable →
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">Todas las tareas tienen responsable principal.</p>
                    )}
                  </div>

                  {/* Tarea Bloqueada */}
                  <div className="bg-slate-950/80 p-3.5 rounded-lg border border-rose-900/30 space-y-2">
                    <span className="text-[10px] font-bold bg-rose-600/20 text-rose-400 px-2 py-0.5 rounded uppercase">Bloqueada</span>
                    {tareas.find(t => t.estado === 'Bloqueada') ? (
                      <div>
                        <h4 className="text-xs font-bold text-slate-200 mt-1">{tareas.find(t => t.estado === 'Bloqueada')?.codigo}: {tareas.find(t => t.estado === 'Bloqueada')?.titulo}</h4>
                        <p className="text-[11px] text-slate-400 mt-1">Motivo: {tareas.find(t => t.estado === 'Bloqueada')?.bloqueos || 'Bloqueo sin especificar'}</p>
                        <button
                          onClick={() => setModalDetalleTarea(tareas.find(t => t.estado === 'Bloqueada'))}
                          className="mt-2 text-xs text-rose-400 hover:underline font-semibold"
                        >
                          Ver Ficha y Desbloquear →
                        </button>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">Sin bloqueos registrados.</p>
                    )}
                  </div>

                </div>
              </div>

              {/* ASUNTOS EN CURSO */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-100 uppercase">Expedientes Activos</h3>
                  <button onClick={() => setVistaActiva('asuntos')} className="text-xs text-blue-400 hover:underline font-semibold">
                    Ver Todos ({asuntos.length}) →
                  </button>
                </div>

                <div className="space-y-3">
                  {asuntos.slice(0, 4).map(asu => (
                    <div key={asu.id} className="bg-slate-950 p-3.5 rounded-lg border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono font-bold text-amber-500">{asu.codigo}</span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                            asu.prioridad === 'Crítica' ? 'bg-red-600/20 text-red-400' : 'bg-blue-600/20 text-blue-400'
                          }`}>{asu.prioridad}</span>
                          <span className="text-xs font-bold text-slate-200">{asu.titulo}</span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-1">{asu.descripcion}</p>
                      </div>
                      <div className="w-full md:w-48 space-y-1 shrink-0">
                        <div className="flex justify-between text-xs text-slate-400">
                          <span>Progreso Global</span>
                          <span className="font-bold text-slate-200">{asu.progreso}%</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${asu.progreso}%` }}></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* ================================================================= */}
          {/* VISTA 2: ASUNTOS / EXPEDIENTES */}
          {/* ================================================================= */}
          {vistaActiva === 'asuntos' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center bg-slate-900 p-4 rounded-xl border border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 uppercase">Gestión de Asuntos y Expedientes Máster</h3>
                  <p className="text-xs text-slate-400">Entidades superiores de coordinación de tareas, documentos y fechas límite.</p>
                </div>
                {rolActual === 'JEFE' && (
                  <button
                    onClick={() => setModalNuevoAsuntoOpen(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs shadow transition"
                  >
                    + NUEVO ASUNTO / EXPEDIENTE
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {asuntos.map(asu => {
                  const resp = usuarios.find(u => u.id === asu.responsableId);
                  const eqResp = equipos.find(e => e.id === asu.equipoResponsableId);
                  const tareasAsu = tareas.filter(t => t.asuntoId === asu.id);

                  return (
                    <div key={asu.id} className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4 hover:border-slate-700 transition">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-mono font-bold text-amber-500">{asu.codigo}</span>
                          <h4 className="text-sm font-bold text-slate-100 mt-0.5">{asu.titulo}</h4>
                        </div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          asu.estado === 'Bloqueado' ? 'bg-rose-600/20 text-rose-400' : 'bg-emerald-600/20 text-emerald-400'
                        }`}>
                          {asu.estado}
                        </span>
                      </div>

                      <p className="text-xs text-slate-300">{asu.descripcion}</p>

                      <div>
                        <div className="flex justify-between text-xs text-slate-400 mb-1">
                          <span>Progreso del Expediente</span>
                          <span className="font-bold text-slate-200">{asu.progreso}%</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${asu.progreso}%` }}></div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800 text-slate-400">
                        <div>
                          <span className="block text-[10px] uppercase text-slate-500 font-bold">Responsable Principal</span>
                          <span className="text-slate-200 font-semibold">{resp ? resp.nombre : 'Sin designar'}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] uppercase text-slate-500 font-bold">Equipo Responsable</span>
                          <span className="text-slate-200 font-semibold">{eqResp ? eqResp.nombre.split(' ')[0] : 'General'}</span>
                        </div>
                        <div>
                          <span className="block text-[10px] uppercase text-slate-500 font-bold">Tareas Asociadas</span>
                          <span className="text-slate-200 font-semibold">{tareasAsu.length} tareas</span>
                        </div>
                        <div>
                          <span className="block text-[10px] uppercase text-slate-500 font-bold">Fecha Límite</span>
                          <span className="text-slate-200 font-semibold">{formatFechaLegible(asu.fechaLimite)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* VISTA 3: BANDEJA DE ENTRADA DOCUMENTAL */}
          {/* ================================================================= */}
          {vistaActiva === 'bandeja' && (
            <div className="space-y-6">
              <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-slate-100 uppercase">Bandeja de Entrada Documental y Análisis Asistido por IA</h3>
                <p className="text-xs text-slate-400">Extracción de acciones e hitos para incorporación al sistema con supervisión del Mando.</p>
                
                <div
                  onClick={() => showToast('Simulación de Carga: Seleccione archivos ficticios en el prototipo.', 'info')}
                  className="border-2 border-dashed border-slate-700 hover:border-blue-500 rounded-xl p-8 text-center bg-slate-950/60 cursor-pointer transition"
                >
                  <i data-lucide="upload-cloud" className="w-10 h-10 text-blue-400 mx-auto mb-2"></i>
                  <p className="text-xs font-bold text-slate-200">Arrastre y suelte documentos aquí o haga clic para examinar</p>
                  <p className="text-[10px] text-slate-500 mt-1">Soporta: PDF, DOCX, XLSX, TXT, PNG</p>
                </div>
              </div>

              <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-4">
                <h4 className="text-xs font-bold text-slate-300 uppercase">Documentos Listos para Análisis IA</h4>
                <div className="space-y-3">
                  {documentos.map(doc => (
                    <div key={doc.id} className="bg-slate-950 p-4 rounded-lg border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="px-2 py-0.5 bg-blue-600/20 text-blue-400 font-mono text-[10px] font-bold rounded">{doc.tipo}</span>
                          <span className="text-xs font-bold text-slate-100">{doc.nombre}</span>
                          <span className="text-[10px] text-slate-500">({doc.tamaño})</span>
                        </div>
                        <p className="text-xs text-slate-400 line-clamp-1">{doc.resumenIA || 'Documento recién recibido en bandeja.'}</p>
                      </div>

                      <button
                        onClick={() => {
                          setDocParaAnalizar(doc);
                          if (doc.accionesExtraidas && doc.accionesExtraidas.length > 0) {
                            setPropuestaTareaDoc(doc.accionesExtraidas[0]);
                          } else {
                            setPropuestaTareaDoc({
                              accion: `Revisión general del documento ${doc.nombre}`,
                              fechaLimite: addDaysISO(HOY, 7),
                              prioridad: 'Media',
                              responsableSugerido: 'Sin designar'
                            });
                          }
                        }}
                        className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg shadow transition shrink-0"
                      >
                        ⚡ Analizar e Incorporar Tarea
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* VISTA 4: GESTIÓN DE TAREAS / VISTA MIS TAREAS PARA USUARIO */}
          {/* ================================================================= */}
          {vistaActiva === 'tareas' && (
            <div className="space-y-6">
              
              {/* Encabezado Tareas */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-4 rounded-xl border border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 uppercase">
                    {rolActual === 'USUARIO' ? 'Panel de Control: Mis Tareas Asignadas' : 'Gestión y Control de Tareas Operativas'}
                  </h3>
                  <p className="text-xs text-slate-400">Distinción de Responsable Principal, Participantes, Modalidad y Autoridad de Aprobación.</p>
                </div>
                <div className="flex items-center space-x-3">
                  {rolActual === 'JEFE' && (
                    <button
                      onClick={() => setModalNuevaTareaOpen(true)}
                      className="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs transition shadow"
                    >
                      + NUEVA TAREA
                    </button>
                  )}
                </div>
              </div>

              {/* VISTA ADAPTADA PARA ROL USUARIO: MIS TAREAS */}
              {rolActual === 'USUARIO' && (
                <div className="flex space-x-2 border-b border-slate-800 pb-2 text-xs">
                  <button
                    onClick={() => setPestanaMisTareas('RESPONSABLE')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition ${pestanaMisTareas === 'RESPONSABLE' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-slate-200'}`}
                  >
                    Soy Responsable ({tareas.filter(t => t.responsablePrincipalId === usuarioActual).length})
                  </button>
                  <button
                    onClick={() => setPestanaMisTareas('PARTICIPO')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition ${pestanaMisTareas === 'PARTICIPO' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-slate-200'}`}
                  >
                    Participo ({tareas.filter(t => t.participantesIds.includes(usuarioActual)).length})
                  </button>
                  <button
                    onClick={() => setPestanaMisTareas('PENDIENTES')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition ${pestanaMisTareas === 'PENDIENTES' ? 'bg-amber-500 text-slate-950' : 'bg-slate-900 text-slate-400 hover:text-slate-200'}`}
                  >
                    Pendientes / En Curso
                  </button>
                  <button
                    onClick={() => setPestanaMisTareas('RETRASADAS')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition ${pestanaMisTareas === 'RETRASADAS' ? 'bg-red-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-slate-200'}`}
                  >
                    Retrasadas ({tareas.filter(t => t.responsablePrincipalId === usuarioActual && t.fechaLimite < HOY && t.estado !== 'Finalizada').length})
                  </button>
                </div>
              )}

              {/* TABLA PRINCIPAL DE TAREAS */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                      <tr>
                        <th className="p-3">Código / Título</th>
                        <th className="p-3">Estado</th>
                        <th className="p-3">Prioridad</th>
                        <th className="p-3">Modalidad</th>
                        <th className="p-3">Responsable Principal</th>
                        <th className="p-3">Vencimiento</th>
                        <th className="p-3">Progreso</th>
                        <th className="p-3 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {tareas
                        .filter(t => {
                          if (rolActual !== 'USUARIO') return true;
                          if (pestanaMisTareas === 'RESPONSABLE') return t.responsablePrincipalId === usuarioActual;
                          if (pestanaMisTareas === 'PARTICIPO') return t.participantesIds.includes(usuarioActual);
                          if (pestanaMisTareas === 'PENDIENTES') return (t.responsablePrincipalId === usuarioActual || t.participantesIds.includes(usuarioActual)) && t.estado !== 'Finalizada';
                          if (pestanaMisTareas === 'RETRASADAS') return t.responsablePrincipalId === usuarioActual && t.fechaLimite < HOY && t.estado !== 'Finalizada';
                          return true;
                        })
                        .map(tar => {
                          const resp = usuarios.find(u => u.id === tar.responsablePrincipalId);
                          const esRetrasada = tar.fechaLimite < HOY && tar.estado !== 'Finalizada' && tar.estado !== 'Cancelada';

                          return (
                            <tr key={tar.id} className="hover:bg-slate-800/50 transition cursor-pointer">
                              <td className="p-3" onClick={() => setModalDetalleTarea(tar)}>
                                <span className="font-mono text-amber-500 font-bold block text-[11px]">{tar.codigo}</span>
                                <span className="font-bold text-slate-200 block text-xs">{tar.titulo}</span>
                                {tar.bloqueos && (
                                  <span className="inline-block mt-1 text-[10px] bg-rose-950 text-rose-400 border border-rose-800 px-1.5 py-0.5 rounded">
                                    ⚠️ {tar.bloqueos}
                                  </span>
                                )}
                              </td>

                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  tar.estado === 'Bloqueada' ? 'bg-rose-600/20 text-rose-400' :
                                  tar.estado === 'En curso' ? 'bg-blue-600/20 text-blue-400' :
                                  tar.estado === 'Finalizada' ? 'bg-emerald-600/20 text-emerald-400' :
                                  'bg-slate-800 text-slate-300'
                                }`}>
                                  {tar.estado}
                                </span>
                              </td>

                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  tar.prioridad === 'Crítica' ? 'bg-red-600/20 text-red-400' : 'bg-slate-800 text-slate-300'
                                }`}>
                                  {tar.prioridad}
                                </span>
                              </td>

                              <td className="p-3 text-slate-400 font-medium text-[11px]">
                                {tar.modalidad}
                              </td>

                              <td className="p-3">
                                {resp ? (
                                  <span className="font-bold text-slate-200">{resp.nombre}</span>
                                ) : (
                                  <span className="text-red-400 font-extrabold bg-red-950 px-2 py-0.5 rounded">⚠️ SIN DESIGNAR</span>
                                )}
                              </td>

                              <td className="p-3 font-mono">
                                <span className={esRetrasada ? 'text-red-400 font-bold bg-red-950/60 px-1.5 py-0.5 rounded' : 'text-slate-300'}>
                                  {formatFechaLegible(tar.fechaLimite)}
                                </span>
                              </td>

                              <td className="p-3 w-28">
                                <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                                  <span>{tar.progreso}%</span>
                                </div>
                                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${tar.progreso}%` }}></div>
                                </div>
                              </td>

                              <td className="p-3 text-right space-x-1">
                                <button
                                  onClick={() => setModalDetalleTarea(tar)}
                                  className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[10px] font-bold rounded"
                                >
                                  Ficha
                                </button>

                                {rolActual === 'JEFE' && (
                                  <button
                                    onClick={() => setModalReasignarTarea(tar)}
                                    className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-amber-400 text-[10px] font-bold rounded"
                                  >
                                    Reasignar
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* VISTA 5: CALENDARIO Y AGENDA DINÁMICA */}
          {/* ================================================================= */}
          {vistaActiva === 'calendario' && (
            <div className="space-y-6">
              <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-bold text-slate-100 uppercase">Agenda y Previsión Operativa</h3>
                    <p className="text-xs text-slate-400">Calculada dinámicamente según la fecha actual del sistema (<strong className="text-amber-400 font-mono">{formatFechaLegible(HOY)}</strong>).</p>
                  </div>

                  {/* Pestañas de Agenda */}
                  <div className="flex space-x-2 bg-slate-950 p-1 border border-slate-800 rounded-lg text-xs">
                    <button
                      onClick={() => setPestanaAgenda('HOY')}
                      className={`px-3 py-1 rounded font-bold transition ${pestanaAgenda === 'HOY' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      HOY
                    </button>
                    <button
                      onClick={() => setPestanaAgenda('7DIAS')}
                      className={`px-3 py-1 rounded font-bold transition ${pestanaAgenda === '7DIAS' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      PRÓXIMOS 7 DÍAS
                    </button>
                    <button
                      onClick={() => setPestanaAgenda('30DIAS')}
                      className={`px-3 py-1 rounded font-bold transition ${pestanaAgenda === '30DIAS' ? 'bg-amber-500 text-slate-950' : 'text-slate-400 hover:text-slate-200'}`}
                    >
                      PRÓXIMOS 30 DÍAS
                    </button>
                  </div>
                </div>
              </div>

              {/* LISTA DE EVENTOS Y TAREAS VINCULADAS SEGÚN LA PESTAÑA */}
              <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl space-y-4">
                <h4 className="text-xs font-bold text-amber-400 uppercase flex items-center space-x-2">
                  <i data-lucide="clock" className="w-4 h-4"></i>
                  <span>Actividades y Vencimientos ({pestanaAgenda})</span>
                </h4>

                <div className="space-y-2">
                  {eventos
                    .filter(evt => {
                      if (pestanaAgenda === 'HOY') return evt.fecha === HOY;
                      if (pestanaAgenda === '7DIAS') return evt.fecha >= HOY && evt.fecha <= addDaysISO(HOY, 7);
                      if (pestanaAgenda === '30DIAS') return evt.fecha >= HOY && evt.fecha <= addDaysISO(HOY, 30);
                      return true;
                    })
                    .map(evt => (
                      <div key={evt.id} className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 flex items-center justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-600/20 text-blue-400 uppercase">{evt.tipo}</span>
                            <span className="text-xs font-bold text-slate-100">{evt.titulo}</span>
                          </div>
                          <span className="text-[11px] text-slate-400 block">Fecha: <strong className="text-slate-200 font-mono">{formatFechaLegible(evt.fecha)}</strong></span>
                        </div>
                        <span className="text-xs font-mono font-bold text-amber-400">{evt.hora || 'Todo el día'}</span>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* VISTA 6: EQUIPO Y REDISTRIBUCIÓN DE CARGA PONDERADA */}
          {/* ================================================================= */}
          {vistaActiva === 'equipo' && (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-5 rounded-xl border border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 uppercase">Supervisión de Carga de Trabajo Ponderada</h3>
                  <p className="text-xs text-slate-400">Ponderación oficial: Crítica=4pt, Alta=3pt, Media=2pt, Baja=1pt. Tareas retrasadas añaden +2pt de penalización.</p>
                </div>
                {rolActual === 'JEFE' && (
                  <button
                    onClick={() => {
                      setPropuestaRedistribucion({
                        origenUserId: 'usr-6',
                        origenNombre: 'Fernando Gómez (Alta densidad de tareas)',
                        destinoUserId: 'usr-3',
                        destinoNombre: 'Lic. Carlos Izquierdo (Menor ponderación actual)',
                        tareaId: 'tar-101',
                        tareaNombre: 'TAR-101: Recopilar inventario acreditado de servidores',
                        motivo: 'Reequilibrio de ponderación ejecutiva tras superación de umbral en Fernando Gómez.'
                      });
                      setModalRedistribucionOpen(true);
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold rounded-lg text-xs shadow-lg transition"
                  >
                    ⚡ PROPONER REDISTRIBUCIÓN CON IA
                  </button>
                )}
              </div>

              {/* TARJETAS DE PERSONAL (12 USUARIOS) CON CARGA PONDERADA */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {usuarios.map(usr => {
                  const eq = equipos.find(e => e.id === usr.equipoId);
                  const carga = calcularCargaUsuario(usr.id);

                  return (
                    <div key={usr.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-3 shadow-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-xs">
                          {usr.avatar}
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-100">{usr.nombre}</h4>
                          <p className="text-[10px] text-slate-400">{usr.puesto}</p>
                        </div>
                      </div>

                      <div className="text-[11px] text-slate-400 space-y-1 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
                        <div className="flex justify-between">
                          <span>Equipo:</span>
                          <span className="font-semibold text-slate-200">{eq ? eq.nombre.split(' ')[0] : 'General'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Como Responsable Principal:</span>
                          <span className="font-bold text-slate-100">{carga.totalAsignadas} tareas</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Críticas / Retrasadas:</span>
                          <span className="font-bold text-red-400">{carga.criticas} / {carga.retrasadas}</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-800 pt-1 text-[10px]">
                          <span>Puntos de Carga Ponderados:</span>
                          <span className="font-mono font-bold text-amber-400">{carga.puntos} pts</span>
                        </div>
                      </div>

                      {/* Bar de Carga Ponderada con Tooltip */}
                      <div title="Ponderación: Crítica=4pt, Alta=3pt, Media=2pt, Baja=1pt, Retraso=+2pt">
                        <div className="flex justify-between text-[10px] text-slate-400 mb-1 cursor-help">
                          <span>Carga Ponderada</span>
                          <span className={`font-bold ${carga.pct > 70 ? 'text-red-400' : 'text-emerald-400'}`}>{carga.pct}%</span>
                        </div>
                        <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div className={`h-2 rounded-full ${carga.pct > 70 ? 'bg-red-500' : 'bg-emerald-500'}`} style={{ width: `${carga.pct}%` }}></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* VISTA 7: DOCUMENTOS */}
          {/* ================================================================= */}
          {vistaActiva === 'documentos' && (
            <div className="space-y-6">
              <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-slate-100 uppercase">Repositorio Central Documental</h3>
                <input
                  type="text"
                  placeholder="Buscar documento por nombre, etiqueta o asunto..."
                  value={busquedaGlobal}
                  onChange={(e) => setBusquedaGlobal(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {documentos
                  .filter(d => d.nombre.toLowerCase().includes(busquedaGlobal.toLowerCase()))
                  .map(doc => (
                    <div key={doc.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-mono font-bold text-amber-500">{doc.tipo}</span>
                        <span className="text-[10px] text-slate-500">{formatFechaLegible(doc.fechaCarga)}</span>
                      </div>
                      <h4 className="text-xs font-bold text-slate-100">{doc.nombre}</h4>
                      <p className="text-xs text-slate-400 line-clamp-2">{doc.resumenIA}</p>
                      <div className="flex flex-wrap gap-1 pt-2">
                        {doc.etiquetas.map(t => (
                          <span key={t} className="text-[9px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded">{t}</span>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* VISTA 8: ALERTAS DE MANDO */}
          {/* ================================================================= */}
          {vistaActiva === 'alertas' && (
            <div className="space-y-6">
              <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-slate-100 uppercase">Centro de Alertas SINTSEG</h3>
                  <p className="text-xs text-slate-400">Avisos de plazos, vencimientos dinámicos y bloqueos.</p>
                </div>
                <button
                  onClick={() => {
                    setAlertas(prev => prev.map(a => ({ ...a, leida: true })));
                    showToast('Todas las alertas marcadas como leídas.', 'info');
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded font-semibold"
                >
                  Marcar Todas como Leídas
                </button>
              </div>

              <div className="space-y-3">
                {alertas.map(alt => (
                  <div key={alt.id} className={`p-4 rounded-xl border flex items-start justify-between gap-4 ${
                    alt.nivel === 'Crítica' ? 'bg-red-950/40 border-red-900/60' : 'bg-slate-900 border-slate-800'
                  }`}>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                          alt.nivel === 'Crítica' ? 'bg-red-600 text-white' : 'bg-amber-600 text-slate-950'
                        }`}>{alt.nivel}</span>
                        <h4 className="text-xs font-bold text-slate-100">{alt.titulo}</h4>
                      </div>
                      <p className="text-xs text-slate-300">{alt.mensaje}</p>
                      <span className="text-[10px] text-slate-500 block font-mono">{alt.fecha}</span>
                    </div>

                    {!alt.leida && (
                      <button
                        onClick={() => {
                          setAlertas(prev => prev.map(a => a.id === alt.id ? { ...a, leida: true } : a));
                        }}
                        className="px-2.5 py-1 bg-slate-800 text-xs text-slate-300 hover:bg-slate-700 rounded shrink-0"
                      >
                        Descartar
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* VISTA 9: INFORMES EJECUTIVOS */}
          {/* ================================================================= */}
          {vistaActiva === 'informes' && (
            <div className="space-y-6">
              <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-3">
                <h3 className="text-sm font-bold text-slate-100 uppercase">Generador de Informes Ejecutivos</h3>
                <p className="text-xs text-slate-400">Exportación de resúmenes de situación.</p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['Informe Diario de Situación', 'Informe Semanal de Avance', 'Informe Mensual Consolidado', 'Informe de Tareas Retrasadas'].map(t => (
                    <button
                      key={t}
                      onClick={() => showToast(`Generado ${t} en formato PDF/Markdown.`)}
                      className="p-3 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-left text-xs font-bold text-slate-200 transition"
                    >
                      📄 {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* VISTA 10: ASISTENTE IA MANDO */}
          {/* ================================================================= */}
          {vistaActiva === 'asistente' && (
            <div className="h-[calc(100vh-140px)] flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              <div className="p-4 bg-slate-950 border-b border-slate-800 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center font-bold text-slate-950 text-xs">🤖</div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-100">Asistente IA de Dirección SINTSEG</h3>
                    <p className="text-[10px] text-slate-400">MODO DEMOSTRACIÓN IA (Simulado sobre base de datos viva)</p>
                  </div>
                </div>
                <span className="text-[10px] px-2 py-0.5 bg-amber-950 text-amber-400 border border-amber-800 rounded font-mono">
                  Contexto en Memoria
                </span>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {asistenteMensajes.map((m, idx) => (
                  <div key={idx} className={`flex ${m.remitente === 'usuario' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-xl p-3.5 rounded-xl text-xs ${
                      m.remitente === 'usuario'
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none'
                    }`}>
                      {m.texto}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-3">
                <div className="flex flex-wrap gap-1.5 text-[10px]">
                  {['¿Qué tengo pendiente hoy?', '¿Qué tareas están retrasadas?', '¿Quién es responsable de TAR-101?'].map(q => (
                    <button
                      key={q}
                      onClick={() => setAsistenteInput(q)}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-800 transition"
                    >
                      {q}
                    </button>
                  ))}
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    placeholder="Escriba su consulta al Asistente IA..."
                    value={asistenteInput}
                    onChange={(e) => setAsistenteInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && asistenteInput.trim()) {
                        const txt = asistenteInput;
                        setAsistenteMensajes(prev => [...prev, { remitente: 'usuario', texto: txt }]);
                        setAsistenteInput('');
                        setTimeout(() => {
                          setAsistenteMensajes(prev => [...prev, { remitente: 'ia', texto: `Respuesta simulada para: "${txt}". Situación actual: ${kpis.totalAbiertas} tareas abiertas, ${kpis.retrasadas} retrasadas.` }]);
                        }, 400);
                      }
                    }}
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    onClick={() => {
                      if (asistenteInput.trim()) {
                        const txt = asistenteInput;
                        setAsistenteMensajes(prev => [...prev, { remitente: 'usuario', texto: txt }]);
                        setAsistenteInput('');
                        setTimeout(() => {
                          setAsistenteMensajes(prev => [...prev, { remitente: 'ia', texto: `Respuesta simulada para "${txt}".` }]);
                        }, 400);
                      }
                    }}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg transition"
                  >
                    Enviar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================================================================= */}
          {/* VISTA 11: CONFIGURACIÓN & RESTAURAR DATOS */}
          {/* ================================================================= */}
          {vistaActiva === 'configuracion' && (
            <div className="space-y-6">
              <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 space-y-4">
                <h3 className="text-sm font-bold text-slate-100 uppercase">Configuración del Sistema y Persistencia</h3>
                
                {/* BOTÓN RESTAURAR DATOS DE DEMOSTRACIÓN */}
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 space-y-2">
                  <h4 className="font-bold text-amber-400 text-xs uppercase">Restaurar Estado Inicial</h4>
                  <p className="text-xs text-slate-400">Si desea descartar los cambios guardados en localStorage y volver al estado semilla original:</p>
                  <button
                    onClick={() => {
                      localStorage.removeItem(STORAGE_KEY);
                      setAsuntos(INITIAL_ASUNTOS);
                      setTareas(INITIAL_TAREAS);
                      setUsuarios(INITIAL_USUARIOS);
                      setEquipos(INITIAL_EQUIPOS);
                      setDocumentos(INITIAL_DOCUMENTOS);
                      setEventos(INITIAL_EVENTOS);
                      setAlertas(INITIAL_ALERTAS);
                      setTrazabilidad(INITIAL_TRAZABILIDAD);
                      registrarTrazabilidad('Restauración de Datos', 'Sistema', 'Datos de demostración restablecidos a estado semilla.');
                      showToast('✓ Datos de demostración restablecidos completamente.', 'success');
                    }}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-lg shadow transition"
                  >
                    🔄 RESTAURAR DATOS DE DEMOSTRACIÓN
                  </button>
                </div>

                {/* LOG DE TRAZABILIDAD */}
                <div className="space-y-2 pt-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase">Registro Inmutable de Trazabilidad e Historial</h4>
                  <div className="bg-slate-950 rounded-lg border border-slate-800 overflow-hidden max-h-80 overflow-y-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-900 text-slate-400 font-mono text-[10px] uppercase sticky top-0">
                        <tr>
                          <th className="p-2.5">Fecha / Hora</th>
                          <th className="p-2.5">Usuario</th>
                          <th className="p-2.5">Rol</th>
                          <th className="p-2.5">Acción</th>
                          <th className="p-2.5">Entidad</th>
                          <th className="p-2.5">Detalles</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {trazabilidad.map(tr => (
                          <tr key={tr.id} className="hover:bg-slate-900/50">
                            <td className="p-2.5 font-mono text-slate-400">{tr.fecha} {tr.hora}</td>
                            <td className="p-2.5 font-bold text-slate-200">{tr.usuario}</td>
                            <td className="p-2.5"><span className="text-[9px] bg-slate-800 px-2 py-0.5 rounded font-mono">{tr.rol}</span></td>
                            <td className="p-2.5 font-semibold text-amber-400">{tr.accion}</td>
                            <td className="p-2.5 text-slate-300">{tr.entidad}</td>
                            <td className="p-2.5 text-slate-400">{tr.detalles}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            </div>
          )}

        </main>
      </div>

      {/* ===================================================================== */}
      {/* MODAL 1: REASIGNAR TAREA (REAL SIN PROMPT) */}
      {/* ===================================================================== */}
      {modalReasignarTarea && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-xl w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-amber-400 uppercase">
                Reasignación Oficial de Responsable Principal
              </h3>
              <button onClick={() => setModalReasignarTarea(null)} className="text-slate-400 hover:text-slate-200 text-xs">✕</button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
                <span className="font-mono text-amber-500 font-bold">{modalReasignarTarea.codigo}</span>
                <h4 className="font-bold text-slate-100">{modalReasignarTarea.titulo}</h4>
                <p className="text-slate-400">Responsable Actual: <strong className="text-slate-200">{usuarios.find(u => u.id === modalReasignarTarea.responsablePrincipalId)?.nombre || 'Sin designar'}</strong></p>
              </div>

              <label className="block text-[10px] uppercase font-bold text-slate-400 mt-2">Seleccione Nuevo Responsable Principal:</label>
              
              <div className="max-h-60 overflow-y-auto space-y-1 bg-slate-950 p-2 rounded-lg border border-slate-800">
                {usuarios.map(u => {
                  const carga = calcularCargaUsuario(u.id);
                  const eq = equipos.find(e => e.id === u.equipoId);
                  const esSeleccionado = modalReasignarTarea.responsablePrincipalId === u.id;

                  return (
                    <div
                      key={u.id}
                      onClick={() => setModalReasignarTarea({ ...modalReasignarTarea, nuevoRespId: u.id })}
                      className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition ${
                        modalReasignarTarea.nuevoRespId === u.id || esSeleccionado
                          ? 'bg-blue-950/80 border-blue-600 text-white'
                          : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div>
                        <span className="font-bold block text-xs">{u.nombre}</span>
                        <span className="text-[10px] text-slate-400">{u.puesto} ({eq ? eq.nombre.split(' ')[0] : 'General'})</span>
                      </div>
                      <div className="text-right text-[10px]">
                        <span className="block font-bold text-amber-400">{carga.totalAsignadas} tareas ({carga.criticas} crít.)</span>
                        <span className="text-slate-400">Carga: {carga.pct}% ({carga.puntos} pts)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setModalReasignarTarea(null)}
                className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs rounded font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  const nuevoId = modalReasignarTarea.nuevoRespId || modalReasignarTarea.responsablePrincipalId;
                  const anteriorUsr = usuarios.find(u => u.id === modalReasignarTarea.responsablePrincipalId);
                  const nuevoUsr = usuarios.find(u => u.id === nuevoId);

                  if (!nuevoUsr) return;

                  const hora = new Date().toTimeString().split(' ')[0].substring(0, 5);
                  const nuevoHist = [
                    ...(modalReasignarTarea.historico || []),
                    { fecha: `${HOY} ${hora}`, usuario: usuarios.find(u => u.id === usuarioActual)?.nombre, detalle: `Tarea reasignada de ${anteriorUsr ? anteriorUsr.nombre : 'Sin designar'} a ${nuevoUsr.nombre}.` }
                  ];

                  setTareas(prev => prev.map(t => t.id === modalReasignarTarea.id ? { ...t, responsablePrincipalId: nuevoId, historico: nuevoHist } : t));
                  registrarTrazabilidad('Reasignación de Tarea', `Tarea ${modalReasignarTarea.codigo}`, `Reasignada a ${nuevoUsr.nombre}`);
                  setModalReasignarTarea(null);
                  showToast(`✓ Tarea reasignada exitosamente a ${nuevoUsr.nombre}.`, 'success');
                }}
                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded shadow"
              >
                ✓ CONFIRMAR REASIGNACIÓN
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 2: NUEVA TAREA (FORMULARIO REAL COMPLETO) */}
      {/* ===================================================================== */}
      {modalNuevaTareaOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-2xl w-full space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-blue-400 uppercase">Creación de Nueva Tarea Operativa</h3>
              <button onClick={() => setModalNuevaTareaOpen(false)} className="text-slate-400 hover:text-slate-200 text-xs">✕</button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const titulo = formData.get('titulo');
                const descripcion = formData.get('descripcion');
                const asuntoId = formData.get('asuntoId');
                const modalidad = formData.get('modalidad');
                const responsablePrincipalId = formData.get('responsablePrincipalId');
                const prioridad = formData.get('prioridad');
                const fechaInicio = formData.get('fechaInicio');
                const fechaLimite = formData.get('fechaLimite');
                const estado = formData.get('estado');
                const progreso = parseInt(formData.get('progreso') || '0', 10);
                const observaciones = formData.get('observaciones');

                const participantesIds = Array.from(e.target.querySelectorAll('input[name="participantes"]:checked')).map(cb => cb.value);
                const equiposImplicadosIds = Array.from(e.target.querySelectorAll('input[name="equipos"]:checked')).map(cb => cb.value);

                const nuevaTar = {
                  id: `tar-${Date.now()}`,
                  codigo: `TAR-${Math.floor(100 + Math.random() * 900)}`,
                  asuntoId,
                  titulo,
                  descripcion,
                  fechaCreacion: HOY,
                  fechaInicio: fechaInicio || HOY,
                  fechaLimite: fechaLimite || addDaysISO(HOY, 7),
                  prioridad,
                  estado,
                  progreso,
                  modalidad,
                  responsablePrincipalId,
                  participantesIds,
                  equiposImplicadosIds,
                  equipoApoyoId: 'eq-1',
                  autoridadAprobacion: 'Jefe SINTSEG',
                  subtareas: [],
                  dependenciasIds: [],
                  documentosAsociados: [],
                  observaciones,
                  etiquetas: ['Nueva'],
                  historico: [{ fecha: `${HOY} ${new Date().toTimeString().split(' ')[0].substring(0, 5)}`, usuario: usuarios.find(u => u.id === usuarioActual)?.nombre, detalle: 'Tarea creada en el sistema.' }]
                };

                setTareas(prev => [nuevaTar, ...prev]);
                registrarTrazabilidad('Creación de Tarea', `Tarea ${nuevaTar.codigo}`, `Creada: "${nuevaTar.titulo}"`);
                setModalNuevaTareaOpen(false);
                showToast(`✓ Tarea ${nuevaTar.codigo} incorporada al sistema.`, 'success');
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-slate-400">Título de la Tarea *</label>
                  <input required name="titulo" type="text" className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-100 mt-1" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-slate-400">Descripción *</label>
                  <textarea required name="descripcion" rows="2" className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-100 mt-1"></textarea>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400">Asunto / Expediente *</label>
                  <select name="asuntoId" className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-100 mt-1">
                    {asuntos.map(a => <option key={a.id} value={a.id}>{a.codigo} - {a.titulo}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400">Modalidad de Ejecución *</label>
                  <select name="modalidad" className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-100 mt-1">
                    <option value="Individual">Individual</option>
                    <option value="Equipo">Equipo</option>
                    <option value="Coordinada entre personas">Coordinada entre personas</option>
                    <option value="Coordinada entre equipos">Coordinada entre equipos</option>
                    <option value="Mixta">Mixta</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400">Responsable Principal *</label>
                  <select name="responsablePrincipalId" className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-100 mt-1">
                    <option value="">-- Sin designar --</option>
                    {usuarios.map(u => <option key={u.id} value={u.id}>{u.nombre} ({u.puesto})</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400">Prioridad *</label>
                  <select name="prioridad" className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-100 mt-1">
                    <option value="Crítica">Crítica</option>
                    <option value="Alta">Alta</option>
                    <option value="Media" selected>Media</option>
                    <option value="Baja">Baja</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400">Fecha Inicio</label>
                  <input name="fechaInicio" type="date" defaultValue={HOY} className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-100 mt-1" />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400">Fecha Límite</label>
                  <input name="fechaLimite" type="date" defaultValue={addDaysISO(HOY, 7)} className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-100 mt-1" />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400">Estado Inicial</label>
                  <select name="estado" className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-100 mt-1">
                    <option value="Pendiente">Pendiente</option>
                    <option value="Asignada">Asignada</option>
                    <option value="En curso" selected>En curso</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400">Progreso Inicial (%)</label>
                  <input name="progreso" type="number" min="0" max="100" defaultValue="0" className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-100 mt-1" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Participantes Adicionales</label>
                  <div className="grid grid-cols-2 gap-1 bg-slate-950 p-2 rounded border border-slate-800 max-h-28 overflow-y-auto">
                    {usuarios.map(u => (
                      <label key={u.id} className="flex items-center space-x-2 text-[11px] text-slate-300">
                        <input type="checkbox" name="participantes" value={u.id} className="rounded text-blue-600" />
                        <span>{u.nombre}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Equipos Implicados</label>
                  <div className="grid grid-cols-2 gap-1 bg-slate-950 p-2 rounded border border-slate-800">
                    {equipos.map(eq => (
                      <label key={eq.id} className="flex items-center space-x-2 text-[11px] text-slate-300">
                        <input type="checkbox" name="equipos" value={eq.id} defaultChecked={eq.id === 'eq-1'} className="rounded text-blue-600" />
                        <span>{eq.nombre.split(' ')[0]}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-[10px] uppercase font-bold text-slate-400">Observaciones Iniciales</label>
                  <input name="observaciones" type="text" className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-100 mt-1" />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button type="button" onClick={() => setModalNuevaTareaOpen(false)} className="px-3.5 py-1.5 bg-slate-800 text-slate-300 text-xs rounded font-semibold">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded shadow">
                  ✓ GUARDAR Y CREAR TAREA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 3: FICHA DE DETALLE Y EDICIÓN COMPLETA DE TAREA */}
      {/* ===================================================================== */}
      {modalDetalleTarea && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-2xl w-full space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <span className="font-mono text-amber-500 font-bold text-xs">{modalDetalleTarea.codigo}</span>
                <h3 className="text-sm font-bold text-slate-100">{modalDetalleTarea.titulo}</h3>
              </div>
              <button onClick={() => setModalDetalleTarea(null)} className="text-slate-400 hover:text-slate-200 text-xs">✕</button>
            </div>

            {/* Contenido Ficha Tarea */}
            <div className="space-y-4 text-xs">
              <p className="text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800">{modalDetalleTarea.descripcion}</p>

              <div className="grid grid-cols-2 gap-3 text-slate-400 bg-slate-950 p-3 rounded-lg border border-slate-800">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Responsable Principal</span>
                  <span className="text-slate-200 font-bold">{usuarios.find(u => u.id === modalDetalleTarea.responsablePrincipalId)?.nombre || 'Sin designar'}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Estado / Prioridad</span>
                  <span className="text-slate-200 font-bold">{modalDetalleTarea.estado} / {modalDetalleTarea.prioridad}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Fecha Límite</span>
                  <span className="text-slate-200 font-mono">{formatFechaLegible(modalDetalleTarea.fechaLimite)}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase block">Modalidad</span>
                  <span className="text-slate-200">{modalDetalleTarea.modalidad}</span>
                </div>
              </div>

              {/* Subtareas Interactivas */}
              {modalDetalleTarea.subtareas && modalDetalleTarea.subtareas.length > 0 && (
                <div className="space-y-2 bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <h4 className="text-[10px] font-bold text-amber-400 uppercase">Subtareas / Hitos Internos</h4>
                  <div className="space-y-1">
                    {modalDetalleTarea.subtareas.map(sub => (
                      <label key={sub.id} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={sub.completada}
                          onChange={(e) => {
                            const subtareasActualizadas = modalDetalleTarea.subtareas.map(s => s.id === sub.id ? { ...s, completada: e.target.checked } : s);
                            const tActualizada = { ...modalDetalleTarea, subtareas: subtareasActualizadas };
                            setTareas(prev => prev.map(t => t.id === tActualizada.id ? tActualizada : t));
                            setModalDetalleTarea(tActualizada);
                          }}
                          className="rounded text-emerald-600"
                        />
                        <span className={sub.completada ? 'line-through text-slate-500' : 'text-slate-200'}>{sub.titulo}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Histórico de Cambios */}
              <div className="space-y-2 bg-slate-950 p-3 rounded-lg border border-slate-800">
                <h4 className="text-[10px] font-bold text-slate-400 uppercase">Histórico de Modificaciones</h4>
                <div className="space-y-1 font-mono text-[11px] max-h-32 overflow-y-auto">
                  {modalDetalleTarea.historico && modalDetalleTarea.historico.length > 0 ? (
                    modalDetalleTarea.historico.map((h, i) => (
                      <div key={i} className="text-slate-400 border-b border-slate-900 pb-1">
                        <span className="text-amber-500">{h.fecha}</span> | <strong className="text-slate-300">{h.usuario}</strong>: {h.detalle}
                      </div>
                    ))
                  ) : (
                    <div className="text-slate-500 italic">Sin historial registrado.</div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
              <button onClick={() => setModalDetalleTarea(null)} className="px-3.5 py-1.5 bg-slate-800 text-slate-300 text-xs rounded font-semibold">
                Cerrar
              </button>
              {rolActual === 'JEFE' && (
                <button
                  onClick={() => {
                    setModalEditarTarea(modalDetalleTarea);
                    setModalDetalleTarea(null);
                  }}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded shadow"
                >
                  ✏️ EDITAR TAREA
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR TAREA REAL */}
      {modalEditarTarea && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-xl w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-amber-400 uppercase">Edición de Tarea ({modalEditarTarea.codigo})</h3>
              <button onClick={() => setModalEditarTarea(null)} className="text-slate-400 hover:text-slate-200 text-xs">✕</button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const nuevoEstado = formData.get('estado');
                const nuevoProgreso = parseInt(formData.get('progreso') || '0', 10);
                const nuevasObs = formData.get('observaciones');
                const nuevosBloqueos = formData.get('bloqueos');

                const hora = new Date().toTimeString().split(' ')[0].substring(0, 5);
                const nuevoHist = [
                  ...(modalEditarTarea.historico || []),
                  { fecha: `${HOY} ${hora}`, usuario: usuarios.find(u => u.id === usuarioActual)?.nombre, detalle: `Progreso actualizado al ${nuevoProgreso}%. Estado: ${nuevoEstado}.` }
                ];

                const tareaEditada = {
                  ...modalEditarTarea,
                  estado: nuevoEstado,
                  progreso: nuevoProgreso,
                  observaciones: nuevasObs,
                  bloqueos: nuevosBloqueos,
                  historico: nuevoHist
                };

                setTareas(prev => prev.map(t => t.id === tareaEditada.id ? tareaEditada : t));
                registrarTrazabilidad('Edición de Tarea', `Tarea ${tareaEditada.codigo}`, `Progreso cambiado a ${nuevoProgreso}%. Estado: ${nuevoEstado}`);
                setModalEditarTarea(null);
                showToast(`✓ Tarea ${tareaEditada.codigo} actualizada correctamente.`, 'success');
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400">Estado *</label>
                <select name="estado" defaultValue={modalEditarTarea.estado} className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-100 mt-1">
                  <option value="Pendiente">Pendiente</option>
                  <option value="Asignada">Asignada</option>
                  <option value="En curso">En curso</option>
                  <option value="En revisión">En revisión</option>
                  <option value="Bloqueada">Bloqueada</option>
                  <option value="Finalizada">Finalizada</option>
                  <option value="Cancelada">Cancelada</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400">Porcentaje de Progreso (%) *</label>
                <input name="progreso" type="number" min="0" max="100" defaultValue={modalEditarTarea.progreso} className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-100 mt-1" />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400">Observaciones</label>
                <input name="observaciones" type="text" defaultValue={modalEditarTarea.observaciones} className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-100 mt-1" />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400">Bloqueos Registrados (Si aplica)</label>
                <input name="bloqueos" type="text" defaultValue={modalEditarTarea.bloqueos || ''} placeholder="Ej. Esperando respuesta de proveedor" className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-100 mt-1" />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button type="button" onClick={() => setModalEditarTarea(null)} className="px-3.5 py-1.5 bg-slate-800 text-slate-300 text-xs rounded font-semibold">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded shadow">
                  ✓ GUARDAR CAMBIOS
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================================================================== */}
      {/* MODAL 4: NUEVO ASUNTO / EXPEDIENTE REAL */}
      {/* ===================================================================== */}
      {modalNuevoAsuntoOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-xl w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-blue-400 uppercase">Crear Nuevo Asunto / Expediente Máster</h3>
              <button onClick={() => setModalNuevoAsuntoOpen(false)} className="text-slate-400 hover:text-slate-200 text-xs">✕</button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const codigo = formData.get('codigo');
                const titulo = formData.get('titulo');
                const descripcion = formData.get('descripcion');
                const responsableId = formData.get('responsableId');
                const equipoResponsableId = formData.get('equipoResponsableId');
                const prioridad = formData.get('prioridad');
                const estado = formData.get('estado');
                const fechaInicio = formData.get('fechaInicio');
                const fechaLimite = formData.get('fechaLimite');

                const nuevoAsu = {
                  id: `asu-${Date.now()}`,
                  codigo,
                  titulo,
                  descripcion,
                  responsableId,
                  equipoResponsableId,
                  participantesIds: ['usr-6', 'usr-7'],
                  prioridad,
                  estado,
                  progreso: 0,
                  fechaInicio: fechaInicio || HOY,
                  fechaLimite: fechaLimite || addDaysISO(HOY, 30),
                  hitosCount: 0,
                  reunionesCount: 0,
                  documentosIds: [],
                  historico: [{ fecha: `${HOY} ${new Date().toTimeString().split(' ')[0].substring(0, 5)}`, usuario: usuarios.find(u => u.id === usuarioActual)?.nombre, accion: 'Apertura de expediente.' }]
                };

                setAsuntos(prev => [nuevoAsu, ...prev]);
                registrarTrazabilidad('Creación de Asunto', `Asunto ${codigo}`, `Creado expediente "${titulo}"`);
                setModalNuevoAsuntoOpen(false);
                showToast(`✓ Expediente ${codigo} creado correctamente.`, 'success');
              }}
              className="space-y-3 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400">Código de Expediente *</label>
                  <input required name="codigo" type="text" defaultValue={`EXP-2026-${Math.floor(100 + Math.random() * 900)}`} className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-100 mt-1" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400">Prioridad *</label>
                  <select name="prioridad" className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-100 mt-1">
                    <option value="Crítica">Crítica</option>
                    <option value="Alta" selected>Alta</option>
                    <option value="Media">Media</option>
                    <option value="Baja">Baja</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400">Título del Asunto *</label>
                <input required name="titulo" type="text" className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-100 mt-1" />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-slate-400">Descripción General *</label>
                <textarea required name="descripcion" rows="2" className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-100 mt-1"></textarea>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400">Responsable Principal *</label>
                  <select name="responsableId" className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-100 mt-1">
                    {usuarios.map(u => <option key={u.id} value={u.id}>{u.nombre}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400">Equipo Responsable *</label>
                  <select name="equipoResponsableId" className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-100 mt-1">
                    {equipos.map(eq => <option key={eq.id} value={eq.id}>{eq.nombre}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400">Fecha Inicio</label>
                  <input name="fechaInicio" type="date" defaultValue={HOY} className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-100 mt-1" />
                </div>
                <div>
                  <label className="block text-[10px] uppercase font-bold text-slate-400">Fecha Límite</label>
                  <input name="fechaLimite" type="date" defaultValue={addDaysISO(HOY, 30)} className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-slate-100 mt-1" />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
                <button type="button" onClick={() => setModalNuevoAsuntoOpen(false)} className="px-3.5 py-1.5 bg-slate-800 text-slate-300 text-xs rounded font-semibold">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded shadow">
                  ✓ CREAR EXPEDIENTE
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL REDISTRIBUCIÓN IA (EJECUCIÓN REAL) */}
      {modalRedistribucionOpen && propuestaRedistribucion && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-amber-400 uppercase">Propuesta de Redistribución IA</h3>
              <button onClick={() => setModalRedistribucionOpen(false)} className="text-slate-400 hover:text-slate-200 text-xs">✕</button>
            </div>

            <div className="space-y-3 text-xs bg-slate-950 p-4 rounded-lg border border-slate-800">
              <p className="text-slate-300"><strong>Origen:</strong> {propuestaRedistribucion.origenNombre}</p>
              <p className="text-slate-300"><strong>Destino Propuesto:</strong> {propuestaRedistribucion.destinoNombre}</p>
              <p className="text-slate-300"><strong>Tarea a Reasignar:</strong> <span className="text-amber-400 font-semibold">{propuestaRedistribucion.tareaNombre}</span></p>
              <p className="text-slate-400 italic mt-2">Motivo: {propuestaRedistribucion.motivo}</p>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
              <button onClick={() => setModalRedistribucionOpen(false)} className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs rounded font-semibold">
                CANCELAR
              </button>
              <button
                onClick={() => {
                  const hora = new Date().toTimeString().split(' ')[0].substring(0, 5);
                  setTareas(prev => prev.map(t => {
                    if (t.id === propuestaRedistribucion.tareaId) {
                      const nuevoHist = [
                        ...(t.historico || []),
                        { fecha: `${HOY} ${hora}`, usuario: usuarios.find(u => u.id === usuarioActual)?.nombre, detalle: `Tarea reasignada por redistribución de IA a ${propuestaRedistribucion.destinoNombre}.` }
                      ];
                      return { ...t, responsablePrincipalId: propuestaRedistribucion.destinoUserId, historico: nuevoHist };
                    }
                    return t;
                  }));
                  registrarTrazabilidad('Redistribución IA Ejecutada por el Jefe', 'Personal', `Transferida tarea ${propuestaRedistribucion.tareaNombre} a ${propuestaRedistribucion.destinoNombre}.`);
                  setModalRedistribucionOpen(false);
                  showToast('✓ Redistribución de carga ejecutada exitosamente.', 'success');
                }}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded shadow"
              >
                ✓ ACEPTAR Y EJECUTAR
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PROPUESTA DE TAREA DESDE DOCUMENTO */}
      {docParaAnalizar && propuestaTareaDoc && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-lg w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-amber-400 uppercase">Propuesta de Tarea Generada por IA</h3>
              <button onClick={() => setDocParaAnalizar(null)} className="text-slate-400 hover:text-slate-200 text-xs">✕</button>
            </div>

            <div className="space-y-2 text-xs">
              <p className="text-slate-400">Documento analizado: <strong className="text-slate-200">{docParaAnalizar.nombre}</strong></p>
              
              <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-2">
                <div>
                  <label className="text-[10px] text-slate-500 uppercase font-bold">Acción Requerida Extraída</label>
                  <input
                    type="text"
                    value={propuestaTareaDoc.accion}
                    onChange={(e) => setPropuestaTareaDoc({...propuestaTareaDoc, accion: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-slate-100 mt-1"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase font-bold">Fecha Límite Sugerida</label>
                    <input
                      type="date"
                      value={propuestaTareaDoc.fechaLimite}
                      onChange={(e) => setPropuestaTareaDoc({...propuestaTareaDoc, fechaLimite: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100 mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase font-bold">Prioridad Sugerida</label>
                    <select
                      value={propuestaTareaDoc.prioridad}
                      onChange={(e) => setPropuestaTareaDoc({...propuestaTareaDoc, prioridad: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-slate-100 mt-1"
                    >
                      <option value="Crítica">Crítica</option>
                      <option value="Alta">Alta</option>
                      <option value="Media">Media</option>
                      <option value="Baja">Baja</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
              <button onClick={() => setDocParaAnalizar(null)} className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs rounded font-semibold">
                Descartar
              </button>
              <button
                onClick={() => {
                  const nuevaTar = {
                    id: `tar-${Date.now()}`,
                    codigo: `TAR-${Math.floor(100 + Math.random() * 900)}`,
                    asuntoId: docParaAnalizar.asuntoId || 'asu-1',
                    titulo: propuestaTareaDoc.accion,
                    descripcion: `Tarea incorporada tras análisis IA del documento ${docParaAnalizar.nombre}.`,
                    fechaCreacion: HOY,
                    fechaInicio: HOY,
                    fechaLimite: propuestaTareaDoc.fechaLimite,
                    prioridad: propuestaTareaDoc.prioridad,
                    estado: 'Pendiente',
                    progreso: 0,
                    modalidad: 'Individual',
                    responsablePrincipalId: '', // Sin designar
                    participantesIds: [],
                    equiposImplicadosIds: ['eq-1'],
                    autoridadAprobacion: 'Jefe SINTSEG',
                    subtareas: [],
                    dependenciasIds: [],
                    documentosAsociados: [docParaAnalizar.id],
                    observaciones: 'Incorporada desde análisis documental IA.',
                    etiquetas: ['ExtraídaIA'],
                    historico: [{ fecha: `${HOY} ${new Date().toTimeString().split(' ')[0].substring(0, 5)}`, usuario: usuarios.find(u => u.id === usuarioActual)?.nombre, detalle: 'Tarea incorporada tras análisis de documento.' }]
                  };

                  setTareas(prev => [nuevaTar, ...prev]);
                  registrarTrazabilidad('Creación de Tarea asistida por IA', 'Tarea', `Creada tarea ${nuevaTar.codigo} desde documento ${docParaAnalizar.nombre}`);
                  setDocParaAnalizar(null);
                  showToast(`✓ Tarea ${nuevaTar.codigo} incorporada desde documento.`, 'success');
                }}
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded shadow"
              >
                ✓ APROBAR E INCORPORAR TAREA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL GENERACIÓN BRIEFING */}
      {modalBriefingOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-2xl w-full space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-amber-400 uppercase">BRIEFING EJECUTIVO DE MANDO — SINTSEG</h3>
              <button onClick={() => setModalBriefingOpen(false)} className="text-slate-400 hover:text-slate-200 text-xs">✕</button>
            </div>

            <div className="flex space-x-2 text-xs">
              {['Diario', 'Semanal', 'Mensual', 'Pre-Reunión'].map(t => (
                <button
                  key={t}
                  onClick={() => setTipoBriefing(t)}
                  className={`px-3 py-1 rounded font-bold transition ${tipoBriefing === t ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 space-y-3 max-h-96 overflow-y-auto">
              <p className="font-bold text-amber-400">=== BRIEFING {tipoBriefing.toUpperCase()} DE MANDO Y CONTROL ({formatFechaLegible(HOY)}) ===</p>
              <p>• Tareas abiertas activas: {kpis.totalAbiertas} distribuidas en {kpis.asuntosActivos} asuntos.</p>
              <p>• Tareas Críticas: {kpis.criticas} requieren supervisión ejecutiva.</p>
              <p>• Alertas de Plazo: {kpis.retrasadas} tareas fuera de plazo a fecha de hoy.</p>
              <p>• Bloqueos Operativos: {kpis.bloqueadas} tareas en estado bloqueada.</p>
              <p>• Carga de Trabajo Ponderada: El Equipo SEGINFO concentra la mayor densidad.</p>
            </div>

            <div className="flex justify-end space-x-2 pt-2 border-t border-slate-800">
              <button onClick={() => setModalBriefingOpen(false)} className="px-4 py-1.5 bg-slate-800 text-slate-300 text-xs rounded font-semibold">Cerrar</button>
              <button
                onClick={() => {
                  showToast('Briefing copiado al portapapeles.', 'info');
                }}
                className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded shadow"
              >
                Copiar Briefing
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<SintsegApp />);
