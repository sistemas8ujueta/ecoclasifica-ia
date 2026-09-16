// Catálogo de canecas y residuos, portado 1:1 desde
// services/clasificador_canecas.py (la versión Python del proyecto) para
// que la lógica de clasificación no se invente nada nuevo.

export type CanecaId = "blanca" | "verde" | "negra";

export interface InfoCaneca {
  id: CanecaId;
  nombre: string;
  colorHex: string;
  descripcion: string;
}

export const CANECAS: Record<CanecaId, InfoCaneca> = {
  blanca: {
    id: "blanca",
    nombre: "Caneca blanca",
    colorHex: "#FBFBFA",
    descripcion: "Residuos aprovechables: plástico, vidrio, latas, papel y cartón limpios y secos.",
  },
  verde: {
    id: "verde",
    nombre: "Caneca verde",
    colorHex: "#10B981",
    descripcion: "Residuos orgánicos aprovechables: restos de comida, cáscaras y residuos vegetales.",
  },
  negra: {
    id: "negra",
    nombre: "Caneca negra",
    colorHex: "#17211B",
    descripcion: "Residuos no aprovechables: servilletas usadas, papel higiénico, empaques contaminados y residuos sanitarios.",
  },
};

export interface InfoResiduo {
  clave: string;
  nombreVisible: string;
  caneca: CanecaId;
  explicacion: string;
}

export const RESIDUOS: Record<string, InfoResiduo> = {
  botella_plastica: {
    clave: "botella_plastica", nombreVisible: "Botella plástica", caneca: "blanca",
    explicacion: "Las botellas plásticas limpias son 100% reciclables. Retira la tapa y aplástala antes de depositarla.",
  },
  botella_vidrio: {
    clave: "botella_vidrio", nombreVisible: "Botella de vidrio", caneca: "blanca",
    explicacion: "El vidrio se recicla indefinidamente sin perder calidad. Deposítalo sin restos de líquido.",
  },
  lata: {
    clave: "lata", nombreVisible: "Lata", caneca: "blanca",
    explicacion: "Las latas de aluminio o acero son altamente reciclables. Enjuágalas antes de desecharlas.",
  },
  papel: {
    clave: "papel", nombreVisible: "Papel", caneca: "blanca",
    explicacion: "El papel limpio y seco puede reciclarse varias veces. Evita depositar papel sucio o engrasado.",
  },
  carton: {
    clave: "carton", nombreVisible: "Cartón", caneca: "blanca",
    explicacion: "Aplana las cajas de cartón para ahorrar espacio y facilita su reciclaje.",
  },
  envase_reciclable: {
    clave: "envase_reciclable", nombreVisible: "Envase reciclable limpio y seco", caneca: "blanca",
    explicacion: "Los envases reciclables deben estar limpios y secos para poder aprovecharse correctamente.",
  },
  restos_comida: {
    clave: "restos_comida", nombreVisible: "Restos de comida", caneca: "verde",
    explicacion: "Los restos de comida pueden convertirse en abono orgánico mediante compostaje.",
  },
  cascara_fruta: {
    clave: "cascara_fruta", nombreVisible: "Cáscara de fruta", caneca: "verde",
    explicacion: "Las cáscaras de fruta son un excelente material para compostaje.",
  },
  residuo_vegetal: {
    clave: "residuo_vegetal", nombreVisible: "Residuo vegetal", caneca: "verde",
    explicacion: "Los residuos vegetales se degradan fácilmente y pueden aprovecharse como abono.",
  },
  servilleta_usada: {
    clave: "servilleta_usada", nombreVisible: "Servilleta usada", caneca: "negra",
    explicacion: "Las servilletas usadas no son reciclables por estar contaminadas con residuos orgánicos.",
  },
  papel_higienico: {
    clave: "papel_higienico", nombreVisible: "Papel higiénico", caneca: "negra",
    explicacion: "El papel higiénico usado se considera residuo sanitario y va en la caneca negra.",
  },
  empaque_contaminado: {
    clave: "empaque_contaminado", nombreVisible: "Empaque contaminado", caneca: "negra",
    explicacion: "Un empaque con restos de comida o grasa deja de ser aprovechable y debe ir en la caneca negra.",
  },
  residuo_sanitario: {
    clave: "residuo_sanitario", nombreVisible: "Residuo sanitario", caneca: "negra",
    explicacion: "Los residuos sanitarios deben manejarse como no aprovechables por razones de higiene.",
  },
};

export const UMBRAL_CONFIANZA_PREDETERMINADO = 0.5;

export function clasificar(residuoClave: string): InfoResiduo | undefined {
  return RESIDUOS[residuoClave];
}

export function esConfianzaSuficiente(confianza: number, umbral = UMBRAL_CONFIANZA_PREDETERMINADO): boolean {
  return confianza >= umbral;
}

export function residuosPorCaneca(canecaId: CanecaId): InfoResiduo[] {
  return Object.values(RESIDUOS).filter((r) => r.caneca === canecaId);
}
