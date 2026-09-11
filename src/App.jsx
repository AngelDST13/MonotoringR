import { useState, useEffect, useCallback } from "react";
import AutomationControls from "./components/AutomationControls.jsx";
import DataViewer from "./components/DataViewer.jsx";
import { fetchDatosSimulados } from "./services/mockApi.js";

const STORAGE_KEY = "auto-sync:ultimo-snapshot";

export default function App() {
  // Estado para la navegación interactiva de la Navbar
  const [pestanaActiva, setPestanaActiva] = useState("Pipelines");

  const [estado, setEstado] = useState("inactivo");
  const [activo, setActivo] = useState(false);
  const [intervalo, setIntervalo] = useState(10000);
  const [logs, setLogs] = useState([]);
  const [tiempoRestante, setTiempoRestante] = useState(10);
  const [forzarError, setForzarError] = useState(false);

  const [datos, setDatos] = useState(() => {
    const guardado = localStorage.getItem(STORAGE_KEY);
    return guardado ? JSON.parse(guardado).datos : [];
  });

  const [error, setError] = useState(null);

  const [ultimaActualizacion, setUltimaActualizacion] = useState(() => {
    const guardado = localStorage.getItem(STORAGE_KEY);
    return guardado ? new Date(JSON.parse(guardado).timestamp) : null;
  });

  const agregarLog = (mensaje, tipo = "info") => {
    const hora = new Date().toLocaleTimeString("es-CR", { hour12: false });
    setLogs((prev) => [{ hora, mensaje, tipo }, ...prev.slice(0, 25)]);
  };

  const sincronizar = useCallback(async () => {
    setEstado("ejecutando");
    setError(null);
    agregarLog(`Polling trigger dispatched (interval: ${intervalo}ms)`, "info");

    try {
      const resultado = await fetchDatosSimulados(forzarError ? 1.0 : 0.2);

      setDatos(resultado);
      const ahora = new Date();
      setUltimaActualizacion(ahora);
      setEstado("exito");
      agregarLog(`GET /api/telemetry -> 200 OK (${resultado.length} métricas recuperadas)`, "success");

      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ datos: resultado, timestamp: ahora.toISOString() })
      );
    } catch (err) {
      setError(err.message);
      setEstado("error");
      agregarLog(`GET /api/telemetry -> 504 TIMEOUT (${err.message})`, "error");
    } finally {
      setTiempoRestante(intervalo / 1000);
    }
  }, [intervalo, forzarError]);

  useEffect(() => {
    if (!activo) return;

    sincronizar();
    const id = setInterval(sincronizar, intervalo);

    return () => clearInterval(id);
  }, [activo, intervalo, sincronizar]);

  useEffect(() => {
    if (!activo || estado === "ejecutando") return;

    const countdown = setInterval(() => {
      setTiempoRestante((prev) => (prev > 1 ? prev - 1 : intervalo / 1000));
    }, 1000);

    return () => clearInterval(countdown);
  }, [activo, estado, intervalo]);

  const manejarToggle = () => {
    setActivo((prev) => {
      const nuevoValor = !prev;
      if (!nuevoValor) {
        setEstado("inactivo");
        agregarLog("Polling loop suspendido por el usuario.", "info");
      } else {
        agregarLog("Polling loop reactivado.", "info");
      }
      return nuevoValor;
    });
  };

  const manejarCambioIntervalo = (nuevoIntervalo) => {
    setIntervalo(nuevoIntervalo);
    setTiempoRestante(nuevoIntervalo / 1000);
    agregarLog(`Intervalo de sincronización modificado a ${nuevoIntervalo / 1000}s`, "info");
  };

  const manejarReintento = () => {
    agregarLog("Reintento manual iniciado por el usuario...", "info");
    sincronizar();
  };

  const opcionesMenu = ["Pipelines", "State Hooks", "Telemetry", "Logs", "Documentation"];

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900 flex flex-col justify-between font-sans">
      <div>
        {/* BANNER SUPERIOR DE ALERTA DE ERROR */}
        {estado === "error" && (
          <div className="bg-rose-100/90 border-b border-rose-200 text-rose-900 px-6 py-2 text-xs font-mono flex items-center justify-between animate-fadeIn">
            <span className="flex items-center gap-2 font-semibold">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
              CIRCUIT BREAKER ENGAGED: React useEffect polling pipeline suspended due to consecutive request timeouts.
            </span>
            <span className="text-slate-500 hidden sm:inline">Target: /api/telemetry ({intervalo}ms)</span>
          </div>
        )}

        {/* TOP NAVIGATION BAR NAVEGABLE */}
        <nav className="bg-white border-b border-slate-200 px-6 py-2.5 flex items-center justify-between sticky top-0 z-50 shadow-xs">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setPestanaActiva("Pipelines")}
              className="flex items-center gap-2 cursor-pointer focus:outline-none"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-extrabold text-sm shadow-emerald-200 shadow">
                S
              </div>
              <span className="font-bold text-sm tracking-tight text-slate-900">SyncOps React</span>
              <span className="bg-slate-100 text-slate-600 text-[10px] font-mono px-2 py-0.5 rounded-full border border-slate-200">
                React 19 Hooks
              </span>
            </button>

            <div className="hidden md:flex items-center gap-5 text-xs font-semibold text-slate-500">
              {opcionesMenu.map((opcion) => (
                <button
                  key={opcion}
                  onClick={() => setPestanaActiva(opcion)}
                  className={`py-3 transition-all cursor-pointer relative ${
                    pestanaActiva === opcion
                      ? "text-slate-900 font-bold border-b-2 border-slate-900"
                      : "hover:text-slate-900"
                  }`}
                >
                  {opcion}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-1.5 bg-slate-100 text-slate-600 text-[11px] font-mono px-3 py-1 rounded-full border border-slate-200/60">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              Node #9024
            </span>

            <button
              onClick={manejarToggle}
              className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all text-white shadow-xs active:scale-95 cursor-pointer ${
                activo ? "bg-rose-500 hover:bg-rose-600" : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              {activo ? "Pausar auto-sync" : "Iniciar auto-sync"}
            </button>
          </div>
        </nav>

        {/* VISTAS SEGÚN LA PESTAÑA SELECCIONADA */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
          
          {/* 1. VISTA PIPELINES (DASHBOARD PRINCIPAL) */}
          {pestanaActiva === "Pipelines" && (
            <>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-mono font-semibold text-emerald-600 uppercase tracking-wider mb-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    Pipeline Reactor Online
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Sistema de Auto-Sincronización de Datos
                  </h1>
                  <p className="text-slate-500 text-xs sm:text-sm mt-1">
                    Laboratorio de Automatización en React · Hooks{" "}
                    <code className="text-slate-800 font-mono bg-slate-200/70 px-1.5 py-0.5 rounded font-semibold">useState</code> +{" "}
                    <code className="text-slate-800 font-mono bg-slate-200/70 px-1.5 py-0.5 rounded font-semibold">useEffect</code>
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-slate-200/60 p-1.5 rounded-full border border-slate-200 text-xs font-medium self-start md:self-auto shadow-inner">
                  <button
                    onClick={() => setForzarError(false)}
                    className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                      !forzarError
                        ? "bg-white text-slate-800 shadow-sm font-bold"
                        : "text-slate-500 hover:text-slate-700"
                    }`}
                  >
                    • Estado: Éxito (Normal)
                  </button>
                  <button
                    onClick={() => setForzarError(true)}
                    className={`px-3 py-1 rounded-full transition-all cursor-pointer ${
                      forzarError
                        ? "bg-rose-500 text-white font-bold shadow-sm"
                        : "text-slate-500 hover:text-rose-600"
                    }`}
                  >
                    • Forzar Error (Simulado)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <div className="lg:col-span-5">
                  <AutomationControls
                    estado={estado}
                    activo={activo}
                    intervalo={intervalo}
                    onToggle={manejarToggle}
                    onIntervaloChange={manejarCambioIntervalo}
                    logs={logs}
                    onClearLogs={() => setLogs([])}
                  />
                </div>

                <div className="lg:col-span-7">
                  <DataViewer
                    estado={estado}
                    datos={datos}
                    error={error}
                    ultimaActualizacion={ultimaActualizacion}
                    onReintentar={manejarReintento}
                    tiempoRestante={tiempoRestante < 10 ? `0${tiempoRestante}` : tiempoRestante}
                  />
                </div>
              </div>
            </>
          )}

          {/* 2. VISTA STATE HOOKS */}
          {pestanaActiva === "State Hooks" && (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Gestión de Estado en React 19</h2>
                <p className="text-slate-600 text-sm mt-1">
                  Arquitectura de los Hooks utilizados para coordinar las peticiones asíncronas sin bloquear el hilo de ejecución principal.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="font-mono text-emerald-600 font-bold text-xs mb-1">01. STATE MANAGEMENT</div>
                  <h3 className="font-bold text-slate-800 text-base mb-2">useState Hook</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Controla el ciclo de vida de la UI mediante 4 estados reactivos: <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800 font-mono">inactivo</code>, <code className="bg-blue-100 px-1 py-0.5 rounded text-blue-800 font-mono">ejecutando</code>, <code className="bg-emerald-100 px-1 py-0.5 rounded text-emerald-800 font-mono">exito</code> y <code className="bg-rose-100 px-1 py-0.5 rounded text-rose-800 font-mono">error</code>.
                  </p>
                </div>

                <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="font-mono text-blue-600 font-bold text-xs mb-1">02. SIDE EFFECTS</div>
                  <h3 className="font-bold text-slate-800 text-base mb-2">useEffect Hook</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Dispara el temporizador en segundo plano cuando el estado <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800 font-mono">activo</code> cambia a verdadero o se modifica la frecuencia de intervalo.
                  </p>
                </div>

                <div className="p-5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="font-mono text-purple-600 font-bold text-xs mb-1">03. MEMORY CLEANUP</div>
                  <h3 className="font-bold text-slate-800 text-base mb-2">Clean-up Function</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Retorna la ejecución de <code className="bg-slate-200 px-1 py-0.5 rounded text-slate-800 font-mono">clearInterval(id)</code> para prevenir memory leaks y procesos fetiche corriendo en background.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 3. VISTA TELEMETRY */}
          {pestanaActiva === "Telemetry" && (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Monitor de Telemetría</h2>
                  <p className="text-slate-600 text-sm mt-1">Diagnóstico de rendimiento y tiempos de respuesta del mock server.</p>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-xs font-mono px-3 py-1 rounded-full font-bold">
                  Node Status: Healthy
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 font-mono text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block mb-1">LATENCIA DE RED</span>
                  <span className="text-2xl font-extrabold text-slate-800">42 ms</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block mb-1">BUFFER HEALTH</span>
                  <span className="text-2xl font-extrabold text-emerald-600">99.8%</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block mb-1">PERSISTENCIA Snapshot</span>
                  <span className="text-2xl font-extrabold text-slate-800">localStorage</span>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block mb-1">RETRY CAPACITY</span>
                  <span className="text-2xl font-extrabold text-slate-800">3 max</span>
                </div>
              </div>
            </div>
          )}

          {/* 4. VISTA LOGS */}
          {pestanaActiva === "Logs" && (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Historial de Eventos del Sistema</h2>
                  <p className="text-slate-500 text-xs mt-0.5">Mapeo completo de peticiones GET /api/telemetry</p>
                </div>
                <button
                  onClick={() => setLogs([])}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer"
                >
                  Limpiar consola
                </button>
              </div>
              <div className="bg-[#0f172a] rounded-xl p-5 font-mono text-xs text-slate-300 h-96 overflow-y-auto space-y-2.5">
                {logs.length === 0 ? (
                  <p className="text-slate-500 italic text-center py-10">No hay logs guardados en esta sesión.</p>
                ) : (
                  logs.map((l, i) => (
                    <div key={i} className="flex gap-3 items-start border-b border-slate-800/60 pb-1.5">
                      <span className="text-slate-500 shrink-0">[{l.hora}]</span>
                      <span className={l.tipo === "error" ? "text-rose-400 font-semibold" : l.tipo === "success" ? "text-emerald-400 font-medium" : "text-slate-300"}>
                        {l.mensaje}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* 5. VISTA DOCUMENTATION (DOCUMENTACIÓN DE LA PRÁCTICA DE LABORATORIO) */}
          {pestanaActiva === "Documentation" && (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-sm space-y-8">
              <div className="border-b border-slate-200 pb-5">
                <span className="text-xs font-mono text-emerald-600 font-bold uppercase tracking-wider">Laboratorio Técnico</span>
                <h2 className="text-3xl font-extrabold text-slate-900 mt-1">
                  Documentación del Sistema de Auto-Sincronización
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  Especificación formal de la práctica sobre Hooks asíncronos en React y patrones de automatización.
                </p>
              </div>

              {/* Sección 1 */}
              <section className="space-y-3">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-slate-900 text-white font-mono text-xs flex items-center justify-center">1</span>
                  Objetivo General
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed pl-8">
                  Construir un sistema de sincronización periódica en segundo plano utilizando React 19. La aplicación simula la recepción de métricas de telemetría de servidor a través de peticiones asíncronas periódicas gestionadas con los hooks <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-800">useState</code> y <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-800">useEffect</code>.
                </p>
              </section>

              {/* Sección 2 */}
              <section className="space-y-3">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-slate-900 text-white font-mono text-xs flex items-center justify-center">2</span>
                  Máquina de Estados de la UI
                </h3>
                <div className="pl-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <span className="font-bold text-slate-700 block mb-1">INACTIVO</span>
                      <span className="text-slate-500">Temporizador pausado. No hay ejecuciones activas.</span>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                      <span className="font-bold text-blue-700 block mb-1">EJECUTANDO</span>
                      <span className="text-blue-600">Petición HTTP simulada en progreso.</span>
                    </div>
                    <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                      <span className="font-bold text-emerald-700 block mb-1">ÉXITO</span>
                      <span className="text-emerald-600">Datos recuperados y actualizados en localStorage.</span>
                    </div>
                    <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
                      <span className="font-bold text-rose-700 block mb-1">ERROR</span>
                      <span className="text-rose-600">Fallo de red o timeout. Activa banner de alerta.</span>
                    </div>
                  </div>
                </div>
              </section>

              {/* Sección 3 */}
              <section className="space-y-3">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-slate-900 text-white font-mono text-xs flex items-center justify-center">3</span>
                  Prevención de Memory Leaks (Función Cleanup)
                </h3>
                <div className="pl-8 text-sm text-slate-600 space-y-2">
                  <p>
                    El hook <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-800">useEffect</code> incluye la función de retorno explícita:
                  </p>
                  <pre className="bg-slate-900 text-emerald-400 p-4 rounded-xl font-mono text-xs overflow-x-auto">
{`useEffect(() => {
  if (!activo) return;
  sincronizar();
  const id = setInterval(sincronizar, intervalo);

  // FUNCIÓN DE LIMPIEZA OBLIGATORIA
  return () => clearInterval(id);
}, [activo, intervalo, sincronizar]);`}
                  </pre>
                  <p className="text-xs text-slate-500 italic">
                    Esto asegura que al desmarcar el toggle o cambiar la frecuencia del selector, el temporizador anterior sea destruido de la memoria global del navegador antes de crear uno nuevo.
                  </p>
                </div>
              </section>

              {/* Sección 4 */}
              <section className="space-y-3">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-slate-900 text-white font-mono text-xs flex items-center justify-center">4</span>
                  Persistencia y Snapshot Local
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed pl-8">
                  Cada respuesta exitosa sincroniza el payload recibido en la API de <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-800">localStorage</code> bajo la clave <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-slate-800">auto-sync:ultimo-snapshot</code>. Esto permite restaurar la última lectura incluso si el usuario recarga la página.
                </p>
              </section>
            </div>
          )}

        </main>
      </div>

      {/* FOOTER GENERAL */}
      <footer className="bg-white border-t border-slate-200 py-4 px-6 text-[11px] font-mono text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2 mt-12">
        <div>
          © 2026 SyncOps React Engine. Pipeline Active [Build 19.4.2-rel]. React 19 Concurrent Scheduler Mode.
        </div>
        <div className="flex items-center gap-4 text-slate-600 font-semibold">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Telemetry Node #9024: 0.2ms
          </span>
          <span>Buffer: 99.8% Healthy</span>
          <button onClick={() => setPestanaActiva("Documentation")} className="hover:underline hover:text-slate-900 cursor-pointer">
            Docs
          </button>
          <button onClick={() => setPestanaActiva("Telemetry")} className="hover:underline hover:text-slate-900 cursor-pointer">
            Incident Portal
          </button>
        </div>
      </footer>
    </div>
  );
}