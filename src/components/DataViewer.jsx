import React from "react";

export default function DataViewer({
  estado,
  datos,
  error,
  ultimaActualizacion,
  onReintentar,
  tiempoRestante,
}) {
  const formatearHora = (fecha) => {
    if (!fecha) return "--:--:--";
    return new Date(fecha).toLocaleTimeString("es-CR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  // Iconos exactos de alta calidad
  const renderIconoMetrica = (nombre) => {
    if (nombre.includes("CPU")) {
      return (
        <div className="p-1.5 bg-rose-50 text-rose-500 rounded-lg">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
      );
    }
    if (nombre.includes("memoria")) {
      return (
        <div className="p-1.5 bg-slate-100 text-slate-700 rounded-lg">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m14-6h2m-2 6h2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
          </svg>
        </div>
      );
    }
    if (nombre.includes("red")) {
      return (
        <div className="p-1.5 bg-emerald-50 text-emerald-600 rounded-lg">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.111 16.404a5.5 5.5 0 017.778 0M12 20h.01m-7.08-7.071c3.904-3.905 10.236-3.905 14.141 0M1.394 9.393c5.857-5.857 15.355-5.857 21.213 0" />
          </svg>
        </div>
      );
    }
    if (nombre.includes("Usuarios")) {
      return (
        <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
      );
    }
    return (
      <div className="p-1.5 bg-slate-100 text-slate-600 rounded-lg">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full">
      <div>
        {/* Header de la Card */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-100/80 rounded-xl text-slate-700 shadow-inner">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </div>
            <h3 className="text-base font-bold text-slate-800">Datos sincronizados</h3>
          </div>
          <span className="text-xs font-mono font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200/80">
            {datos && datos.length > 0 ? `${datos.length} métricas activas` : "0 payloads"}
          </span>
        </div>

        {/* VISTA 1: ESTADO ERROR (Matching Stitch Screen) */}
        {estado === "error" && (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center bg-rose-50/40 rounded-2xl border-2 border-dashed border-rose-200">
              <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-4 shadow-sm animate-bounce">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h4 className="text-lg font-bold text-rose-900 mb-1">Ocurrió un error al sincronizar</h4>
              <p className="text-xs text-slate-600 max-w-md mb-6 leading-relaxed font-mono">
                {error || "ERR_CONNECTION_TIMED_OUT: No se pudo contactar al servidor. El canal de streaming websocket no respondió a la trama SYN-ACK en 5000ms."}
              </p>
              <button
                onClick={onReintentar}
                className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-200 transition-all active:scale-95 flex items-center gap-2"
              >
                <svg className="w-4 h-4 animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Reintentar ahora
              </button>
            </div>

            {/* Debug console panel */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between text-xs font-mono text-slate-600">
              <div>
                <span className="text-[10px] block text-slate-400 font-bold uppercase tracking-wider">Último intento</span>
                <span className="font-semibold text-slate-800">{formatearHora(ultimaActualizacion)} UTC</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] block text-rose-500 font-bold uppercase tracking-wider">Reintentos Fallidos</span>
                <span className="font-bold text-rose-600">3 de 3</span>
              </div>
            </div>
          </div>
        )}

        {/* VISTA 2: ÉXITO / EJECUTANDO / CON DATOS */}
        {(estado === "exito" || estado === "ejecutando" || (estado === "inactivo" && datos && datos.length > 0)) && (
          <div className="animate-fadeIn">
            {/* Banner Verde */}
            <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-900 shadow-sm">
              <span className="flex items-center gap-2 font-semibold">
                <svg className="w-4 h-4 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                Datos actualizados correctamente
              </span>
              <span className="text-slate-500 font-mono text-[11px]">
                Última actualización: {formatearHora(ultimaActualizacion)}
              </span>
            </div>

            {/* Grid de Métricas con tarjetas animadas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {datos.map((item) => {
                const valorNum = parseFloat(item.valor);
                return (
                  <div
                    key={item.id}
                    className="p-4 bg-slate-50/70 border border-slate-200/90 rounded-xl hover:bg-white hover:border-slate-300 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold tracking-wider text-slate-500 font-mono uppercase">
                          {item.nombre}
                        </span>
                        {renderIconoMetrica(item.nombre)}
                      </div>

                      <div className="flex items-baseline gap-1 my-2">
                        <span className="text-2xl font-extrabold text-slate-900 font-mono tracking-tight">
                          {item.valor}
                        </span>
                        <span className="text-xs font-semibold text-slate-500 font-mono">
                          {item.unidad}
                        </span>
                      </div>
                    </div>

                    {/* Barra de Progreso Dinámica */}
                    <div className="mt-3">
                      <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-700 ${
                            item.nombre.includes("CPU") && valorNum > 85
                              ? "bg-rose-500"
                              : item.nombre.includes("memoria")
                              ? "bg-slate-700"
                              : "bg-emerald-500"
                          }`}
                          style={{ width: `${Math.min(valorNum, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center mt-1.5 text-[10px] font-mono text-slate-400">
                        <span>Status</span>
                        <span className={item.estado === "Elevado" ? "text-rose-600 font-bold" : "text-emerald-600 font-bold"}>
                          {item.estado || "Óptimo"}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VISTA 3: INACTIVO SIN DATOS */}
        {estado === "inactivo" && (!datos || datos.length === 0) && (
          <div className="py-16 text-center text-slate-400 text-xs font-mono bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            Automatización pausada. Haz clic en "Iniciar automatización" para activar el ciclo de sondeo.
          </div>
        )}
      </div>

      {/* Footer Info Bar */}
      <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono text-slate-500">
        <span className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Siguiente sondeo programado en: <strong className="text-slate-700 font-bold">{tiempoRestante}s</strong>
        </span>
        <span className="text-emerald-600 font-semibold">• Auto-Commit: ON</span>
      </div>
    </div>
  );
}