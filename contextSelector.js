/**
 * Módulo Selector de Contexto SINTSEG
 * Selecciona únicamente la información relevante de la aplicación según la consulta del usuario
 * para enviarla como contexto al modelo de IA, evitando saturar el prompt con la base de datos completa.
 */

function seleccionarContexto(query, appData) {
  if (!appData) return "Sin datos de contexto disponibles.";

  const q = query.toLowerCase();
  const { tareas = [], asuntos = [], usuarios = [], equipos = [], hoy = new Date().toISOString().split('T')[0] } = appData;

  let contextoPartes = [];
  contextoPartes.push(`FECHA ACTUAL DEL SISTEMA: ${hoy}`);

  if (q.includes('priorita') || q.includes('crítica') || q.includes('critica') || q.includes('urgente')) {
    const criticas = tareas.filter(t => t.prioridad === 'Crítica' && t.estado !== 'Finalizada' && t.estado !== 'Cancelada');
    contextoPartes.push(`TAREAS CRÍTICAS ABIERTAS (${criticas.length}):`);
    criticas.forEach(t => {
      const resp = usuarios.find(u => u.id === t.responsablePrincipalId);
      contextoPartes.push(`- [${t.codigo}] "${t.titulo}" | Estado: ${t.estado} | Resp: ${resp ? resp.nombre : 'SIN DESIGNAR'} | Vence: ${t.fechaLimite} | Progreso: ${t.progreso}%`);
    });
  }

  if (q.includes('vencer') || q.includes('vencimiento') || q.includes('retrasad') || q.includes('plazo') || q.includes('fecha')) {
    const retrasadas = tareas.filter(t => t.fechaLimite < hoy && t.estado !== 'Finalizada' && t.estado !== 'Cancelada');
    const proximas = tareas.filter(t => t.fechaLimite >= hoy && t.fechaLimite <= addDays(hoy, 7) && t.estado !== 'Finalizada');

    contextoPartes.push(`TAREAS RETRASADAS (${retrasadas.length}):`);
    retrasadas.forEach(t => {
      const resp = usuarios.find(u => u.id === t.responsablePrincipalId);
      contextoPartes.push(`- [${t.codigo}] "${t.titulo}" | Venció: ${t.fechaLimite} | Resp: ${resp ? resp.nombre : 'SIN DESIGNAR'} | Progreso: ${t.progreso}%`);
    });

    contextoPartes.push(`TAREAS QUE VENCEN EN PRÓXIMOS 7 DÍAS (${proximas.length}):`);
    proximas.forEach(t => {
      contextoPartes.push(`- [${t.codigo}] "${t.titulo}" | Vence: ${t.fechaLimite} | Estado: ${t.estado}`);
    });
  }

  if (q.includes('carga') || q.includes('equipo') || q.includes('personal') || q.includes('sobrecarga')) {
    const pesoPrioridad = { 'Crítica': 4, 'Alta': 3, 'Media': 2, 'Baja': 1 };
    const cargaUsuario = (u) => {
      const asignadas = tareas.filter(t => t.responsablePrincipalId === u.id && !['Finalizada', 'Cancelada'].includes(t.estado));
      const participando = tareas.filter(t => Array.isArray(t.participantesIds) && t.participantesIds.includes(u.id) && !['Finalizada', 'Cancelada'].includes(t.estado));
      let puntos = 0;
      asignadas.forEach(t => {
        puntos += pesoPrioridad[t.prioridad] || 0;
        if (t.fechaLimite && t.fechaLimite < hoy) puntos += 2;
      });
      puntos += participando.length;
      return { asignadas: asignadas.length, participando: participando.length, puntos };
    };

    contextoPartes.push(`RESUMEN DE CARGA PONDERADA POR EQUIPO Y USUARIO:`);
    equipos.forEach(eq => {
      const miembros = usuarios.filter(u => u.equipoId === eq.id);
      const cargas = miembros.map(u => ({ usuario: u, ...cargaUsuario(u) }));
      const puntosEquipo = cargas.reduce((acc, c) => acc + c.puntos, 0);
      contextoPartes.push(`- Equipo: ${eq.nombre} | ${miembros.length} miembros | Carga total: ${puntosEquipo} pts`);
      cargas.filter(c => c.puntos > 0).forEach(c => {
        contextoPartes.push(`  * ${c.usuario.nombre} (${c.usuario.puesto}): ${c.puntos} pts | ${c.asignadas} como responsable | ${c.participando} como participante`);
      });
    });
  }

  if (q.includes('sin responsable') || q.includes('responsable') || q.includes('asignar') || q.includes('sin designar')) {
    const sinResp = tareas.filter(t => !t.responsablePrincipalId && t.estado !== 'Finalizada');
    contextoPartes.push(`TAREAS SIN RESPONSABLE DESIGNADO (${sinResp.length}):`);
    sinResp.forEach(t => {
      contextoPartes.push(`- [${t.codigo}] "${t.titulo}" | Prioridad: ${t.prioridad} | Estado: ${t.estado}`);
    });
  }

  if (q.includes('asunto') || q.includes('expediente') || q.includes('coordinación') || q.includes('coordinacion') || q.includes('mixta')) {
    contextoPartes.push(`EXPEDIENTES ACTIVOS Y COORDINACIÓN:`);
    asuntos.forEach(a => {
      const tareasAsu = tareas.filter(t => t.asuntoId === a.id);
      const mixtas = tareasAsu.filter(t => (t.modalidad || '').includes('Coordinada') || t.modalidad === 'Mixta');
      contextoPartes.push(`- [${a.codigo}] "${a.titulo}" | Progreso: ${a.progreso}% | Tareas coordinadas: ${mixtas.length}/${tareasAsu.length}`);
    });
  }

  if (contextoPartes.length <= 1 || q.includes('resume') || q.includes('situación') || q.includes('situacion') || q.includes('general')) {
    const abiertas = tareas.filter(t => t.estado !== 'Finalizada' && t.estado !== 'Cancelada');
    const criticas = abiertas.filter(t => t.prioridad === 'Crítica');
    const bloqueadas = abiertas.filter(t => t.estado === 'Bloqueada');
    const retrasadas = abiertas.filter(t => t.fechaLimite < hoy);

    contextoPartes.push(`RESUMEN EJECUTIVO GENERAL SINTSEG:`);
    contextoPartes.push(`- Total tareas abiertas: ${abiertas.length}`);
    contextoPartes.push(`- Tareas críticas: ${criticas.length}`);
    contextoPartes.push(`- Tareas bloqueadas: ${bloqueadas.length}`);
    contextoPartes.push(`- Tareas retrasadas: ${retrasadas.length}`);
    contextoPartes.push(`- Expedientes en curso: ${asuntos.length}`);
  }

  return contextoPartes.join('\n');
}

function addDays(dateStr, days) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

module.exports = { seleccionarContexto };
