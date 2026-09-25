import * as ort from "onnxruntime-web";
import { CANECAS, type CanecaId } from "../data/canecas";
import type { ResultadoDeteccion } from "../types";

interface ResultadoYOLO {
  residuo: string | null;
  confianza: number;
  caneca: CanecaId | null;
  reconocido: boolean;
}

const CLASES_YOLO = [
  "botella_plastica",
  "botella_vidrio",
  "lata",
  "carton",
  "papel",
  "envoltorio_snack",
  "servilleta_usada",
  "restos_comida",
  "cascara_fruta",
  "envase_desechable",
  "residuo_vegetal",
] as const;

const CANECA_POR_CLASE: Partial<Record<string, CanecaId>> = {
  botella_plastica: "blanca",
  botella_vidrio: "blanca",
  lata: "blanca",
  carton: "blanca",
  papel: "blanca",
  envoltorio_snack: "negra",
  servilleta_usada: "negra",
  restos_comida: "verde",
  cascara_fruta: "verde",
  residuo_vegetal: "verde",
};

const UMBRAL_YOLO = 0.25;

const RUTA_MODELO = "/models/clasificador_residuos_best.onnx";
const RUTA_WASM = "/ort/";

let sesionYOLOPromise: Promise<ort.InferenceSession> | null = null;

function obtenerSesionYOLO(): Promise<ort.InferenceSession> {
  if (!sesionYOLOPromise) {
    ort.env.wasm.wasmPaths = RUTA_WASM;
    ort.env.wasm.numThreads = 1;

    sesionYOLOPromise = ort.InferenceSession.create(
      RUTA_MODELO,
      {
        executionProviders: ["wasm"],
        graphOptimizationLevel: "all",
      }
    );
  }

  return sesionYOLOPromise;
}

function cargarImagen(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const imagen = new Image();

    imagen.onload = () => resolve(imagen);
    imagen.onerror = () =>
      reject(new Error("No se pudo cargar la imagen."));

    imagen.src = dataUrl;
  });
}

async function imagenATensor(
  dataUrl: string
): Promise<ort.Tensor> {
  if (
    typeof dataUrl !== "string" ||
    !dataUrl.startsWith("data:image/")
  ) {
    throw new Error("La imagen recibida no es válida.");
  }

  const imagen = await cargarImagen(dataUrl);

  const canvas = document.createElement("canvas");
  canvas.width = 640;
  canvas.height = 640;

  const contexto = canvas.getContext("2d", {
    willReadFrequently: true,
  });

  if (!contexto) {
    throw new Error(
      "No se pudo crear el contexto de imagen."
    );
  }

  // Fondo gris 114, igual que Sharp en el servidor.
  contexto.fillStyle = "rgb(114, 114, 114)";
  contexto.fillRect(0, 0, 640, 640);

  // Equivalente a Sharp fit: contain.
  const escala = Math.min(
    640 / imagen.naturalWidth,
    640 / imagen.naturalHeight
  );

  const ancho = imagen.naturalWidth * escala;
  const alto = imagen.naturalHeight * escala;

  const x = (640 - ancho) / 2;
  const y = (640 - alto) / 2;

  contexto.drawImage(
    imagen,
    x,
    y,
    ancho,
    alto
  );

  const datosImagen = contexto.getImageData(
    0,
    0,
    640,
    640
  ).data;

  const area = 640 * 640;

  const entrada = new Float32Array(
    3 * area
  );

  for (let i = 0; i < area; i += 1) {
    entrada[i] =
      datosImagen[i * 4] / 255;

    entrada[area + i] =
      datosImagen[i * 4 + 1] / 255;

    entrada[2 * area + i] =
      datosImagen[i * 4 + 2] / 255;
  }

  return new ort.Tensor(
    "float32",
    entrada,
    [1, 3, 640, 640]
  );
}

function mejorDeteccionYOLO(
  salida: ort.Tensor
): ResultadoYOLO {
  const datos = salida.data;
  const dimensiones = salida.dims;

  if (
    dimensiones.length !== 3 ||
    dimensiones[0] !== 1 ||
    dimensiones[1] !==
      4 + CLASES_YOLO.length
  ) {
    throw new Error(
      `Salida YOLO inesperada: [${dimensiones.join(", ")}]`
    );
  }

  const candidatos = dimensiones[2];

  let mejorConfianza = 0;
  let mejorClase = -1;

  for (
    let i = 0;
    i < candidatos;
    i += 1
  ) {
    for (
      let clase = 0;
      clase < CLASES_YOLO.length;
      clase += 1
    ) {
      const confianza =
        Number(
          datos[
            (4 + clase) * candidatos + i
          ]
        );

      if (
        confianza > mejorConfianza
      ) {
        mejorConfianza = confianza;
        mejorClase = clase;
      }
    }
  }

  if (
    mejorClase < 0 ||
    mejorConfianza < UMBRAL_YOLO
  ) {
    return {
      residuo: null,
      confianza: mejorConfianza,
      caneca: null,
      reconocido: false,
    };
  }

  const residuo =
    CLASES_YOLO[mejorClase];

  if (
    residuo ===
    "envase_desechable"
  ) {
    return {
      residuo,
      confianza: mejorConfianza,
      caneca: null,
      reconocido: true,
    };
  }

  return {
    residuo,
    confianza: mejorConfianza,
    caneca:
      CANECA_POR_CLASE[residuo] ??
      null,
    reconocido: true,
  };
}

export async function predecir(
  imagenDataUrl: string | null
): Promise<ResultadoDeteccion> {
  if (!imagenDataUrl) {
    return {
      residuo: null,
      confianza: 0,
      caneca: null,
      reconocido: false,
    };
  }

  const entrada =
    await imagenATensor(
      imagenDataUrl
    );

  const sesion =
    await obtenerSesionYOLO();

  const nombreEntrada =
    sesion.inputNames[0];

  const nombreSalida =
    sesion.outputNames.includes(
      "output0"
    )
      ? "output0"
      : sesion.outputNames[0];

  const resultados =
    await sesion.run({
      [nombreEntrada]: entrada,
    });

  const salida =
    resultados[nombreSalida];

  if (!salida) {
    throw new Error(
      "El modelo no devolvió una salida válida."
    );
  }

  return mejorDeteccionYOLO(
    salida
  );
}

export function infoCanecaDe(
  canecaId: CanecaId | null
) {
  return canecaId
    ? CANECAS[canecaId]
    : undefined;
}