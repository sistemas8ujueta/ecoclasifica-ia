// Detector de residuos. Portado de services/detector.py: como aún no
// existe un modelo entrenado desplegado (best.pt nunca se cargó en la
// versión Python tampoco — corría en "modo simulado"), esta versión
// genera una predicción de ejemplo con confianza aleatoria, para poder
// construir y probar todo el flujo de la app sin depender del modelo
// real. El día que haya un modelo real (por ejemplo exportado a
// TensorFlow.js u onnxruntime-web), solo hay que reemplazar el cuerpo
// de `predecir` sin tocar ninguna pantalla.

import { CANECAS, clasificar, esConfianzaSuficiente, type CanecaId } from "../data/canecas";
import type { ResultadoDeteccion } from "../types";

const CLASES_SIMULADAS = [
  "botella_plastica",
  "botella_vidrio",
  "lata",
  "papel",
  "carton",
  "restos_comida",
  "cascara_fruta",
  "servilleta_usada",
  "papel_higienico",
];

const UMBRAL_CONFIANZA = 0.5;

function elegirAlAzar<T>(lista: T[]): T {
  return lista[Math.floor(Math.random() * lista.length)];
}

export async function predecir(_imagenDataUrl: string | null): Promise<ResultadoDeteccion> {
  // Simula el tiempo de inferencia real para que la pantalla de
  // "Analizando residuo..." tenga sentido visualmente.
  await new Promise((resolve) => setTimeout(resolve, 1600));

  const clase = elegirAlAzar(CLASES_SIMULADAS);
  const confianza = Math.round((0.55 + Math.random() * 0.43) * 100) / 100;

  if (!esConfianzaSuficiente(confianza, UMBRAL_CONFIANZA)) {
    return { residuo: null, confianza, caneca: null, reconocido: false };
  }

  const info = clasificar(clase);
  if (!info) {
    return { residuo: null, confianza, caneca: null, reconocido: false };
  }

  return { residuo: info.clave, confianza, caneca: info.caneca as CanecaId, reconocido: true };
}

export function infoCanecaDe(canecaId: CanecaId | null) {
  return canecaId ? CANECAS[canecaId] : undefined;
}
