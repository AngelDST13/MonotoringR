/**
 * Servicio de telemetría y Mock API
 */
const generarRegistros = () => {
  const sensoresConfig = [
    { nombre: "Temperatura CPU", min: 45, max: 95, unidad: "%" },
    { nombre: "Uso de memoria", min: 30, max: 98, unidad: "%" },
    { nombre: "Latencia de red", min: 15, max: 120, unidad: "ms" },
    { nombre: "Usuarios conectados", min: 100, max: 1500, unidad: "u" },
    { nombre: "Peticiones/seg", min: 100, max: 950, unidad: "req/s" },
    { nombre: "Estado de buffer", min: 98, max: 100, unidad: "% OK" },
  ];

  return sensoresConfig.map((sensor, index) => {
    const valorCalculado = (Math.random() * (sensor.max - sensor.min) + sensor.min).toFixed(1);
    
    let estado = "Óptimo";
    if (sensor.unidad === "%" && parseFloat(valorCalculado) > 85) {
      estado = "Elevado";
    } else if (sensor.unidad === "ms" && parseFloat(valorCalculado) > 80) {
      estado = "Alto";
    }

    return {
      id: index + 1,
      nombre: sensor.nombre,
      valor: valorCalculado,
      unidad: sensor.unidad,
      estado,
    };
  });
};

export function fetchDatosSimulados(errorRate = 0.2) {
  return new Promise((resolve, reject) => {
    const latencia = Math.floor(400 + Math.random() * 700);

    setTimeout(() => {
      const hayFallo = Math.random() < errorRate;

      if (hayFallo) {
        const error = new Error("ERR_CONNECTION_TIMED_OUT: No se pudo contactar al servidor (timeout simulado). El canal de streaming websocket no respondió a la trama SYN-ACK en 5000ms.");
        error.code = "ERR_CONNECTION_TIMED_OUT";
        error.status = 504;
        error.timestamp = new Date().toLocaleTimeString('es-CR', { hour12: false });
        reject(error);
      } else {
        resolve(generarRegistros());
      }
    }, latencia);
  });
}