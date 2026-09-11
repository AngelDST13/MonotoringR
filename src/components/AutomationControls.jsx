import React, { useState } from "react";

export default function AutomationControls({
  estado,
  activo,
  intervalo,
  onToggle,
  onIntervaloChange,
  logs = [],
  onClearLogs,
}) {
  const [autoScroll, setAutoScroll] = useState(true);

  const statusConfig = {
    inactivo: {
      label: "Pausado",
      badgeClass: "bg-slate-100 text-slate-600 border-slate-300",
      dotClass: "bg-slate-400",
    },
    ejecutando: {
      label: "Sincronizando...",
      badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
      dotClass: "bg-blue-500 animate-ping",
    },
    exito: {
      label: "Éxito (Activo)",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dotClass: "bg-emerald-500",
    },
    error: {
      label: "Error (Activo)",
      badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
      dotClass: "bg-rose-500 animate-pulse",
    },
  };

  const currentBadge = statusConfig[estado] || statusConfig.inactivo;

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between h-full">
      <div>
        {/* Header del Panel */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-slate-100/80 rounded-xl text-slate-700 shadow-inner">
              <svg className="w-5 h-5 text-slate-700 animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h2 className="text-base font-bold text-slate-800">Panel de automatización</h2>
          </div>

          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${currentBadge.badgeClass} transition-all duration-300`}>
            <span className={`w-2 h-2 rounded-full ${currentBadge.dotClass}`}></span>
            <span>{currentBadge.label}</span>
          </div>
        </div>

        {/* Form Controls */}
        <div className="mt-5 space-y-4">
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-mono text-slate-500 font-medium">Intervalo de sincronización</label>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">Timer ID: #882</span>
            </div>
            <select
              value={intervalo}
              onChange={(e) => onIntervaloChange(Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 font-mono focus:ring-2 focus:ring-slate-400 focus:outline-none transition-all cursor-pointer hover:bg-slate-100/50"
            >
              <option value={5000}>Cada 5 segundos</option>
              <option value={10000}>Cada 10 segundos</option>
              <option value={30000}>Cada 30 segundos</option>
            </select>
          </div>

          {/* Botón Principal con animación active scale */}
          <button
            onClick={onToggle}
            className={`w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-xs font-bold transition-all duration-200 active:scale-[0.98] shadow-sm ${
              activo
                ? "bg-rose-500 hover:bg-rose-600 text-white shadow-rose-200 shadow-md"
                : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-200 shadow-md"
            }`}
          >
            {activo ? (
              <>
                <svg className="w-4 h-4 fill-current animate-pulse" viewBox="0 0 24 24">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
                Pausar automatización
              </>
            ) : (
              <>
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
                Iniciar automatización
              </>
            )}
          </button>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed">
            <span className="text-emerald-500 mt-0.5 text-sm animate-bounce">🔄</span>
            <span>
              La automatización está corriendo en segundo plano cada {intervalo / 1000}s mediante un loop{" "}
              <code className="font-mono bg-slate-200/70 px-1 py-0.5 rounded text-slate-800 font-semibold">setInterval</code> gestionado en{" "}
              <code className="font-mono bg-slate-200/70 px-1 py-0.5 rounded text-slate-800 font-semibold">useEffect</code>.
            </span>
          </div>
        </div>
      </div>

      {/* Terminal de Consola en Vivo */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-mono font-bold text-slate-700 flex items-center gap-1.5">
            <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Registro de ejecución reactivo
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClearLogs}
              className="text-[10px] font-mono text-slate-400 hover:text-slate-600 underline transition-all"
            >
              Limpiar
            </button>
            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              STREAMING
            </span>
          </div>
        </div>

        <div className="bg-[#0f172a] rounded-xl p-4 font-mono text-[11px] text-slate-300 shadow-inner h-48 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-slate-700 hover:border-slate-700 border border-slate-800 transition-all">
          <div className="flex justify-between text-slate-500 border-b border-slate-800 pb-1.5 mb-2 text-[10px]">
            <span>STDIO / DISPATCHER_V19</span>
            <span className={activo ? "text-emerald-400 font-bold" : "text-amber-400 font-bold"}>
              SYNC_LOOP: {activo ? "ACTIVE" : "PAUSED"}
            </span>
          </div>

          {logs.length === 0 ? (
            <p className="text-slate-500 italic text-center py-6">Espere al siguiente tick del temporizador para ver logs...</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="flex items-start gap-2 leading-snug animate-fadeIn">
                <span className="text-slate-500 shrink-0">[{log.hora}]</span>
                <span className={log.tipo === "error" ? "text-rose-400 font-semibold" : log.tipo === "success" ? "text-emerald-400 font-medium" : "text-slate-300"}>
                  {log.mensaje}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}