// Catálogo oficial de canecas y residuos de EcoClasifica IA.
// Debe mantenerse sincronizado con las 11 clases del modelo YOLO.

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
    colorHex: "#ffffff",
    descripcion:
      "Residuos aprovechables: botellas plásticas, botellas de vidrio, latas, papel, cartón y envases desechables limpios y secos.",
  },

  verde: {
    id: "verde",
    nombre: "Caneca verde",
    colorHex: "#10B981",
    descripcion:
      "Residuos orgánicos aprovechables: restos de comida, cáscaras de fruta y residuos vegetales.",
  },

  negra: {
    id: "negra",
    nombre: "Caneca negra",
    colorHex: "#17211B",
    descripcion:
      "Residuos no aprovechables: envoltorios de snacks, servilletas usadas y envases desechables sucios o contaminados.",
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
    clave: "botella_plastica",
    nombreVisible: "Botella plástica",
    caneca: "blanca",
    explicacion:
      "La botella plástica debe depositarse limpia y seca en la caneca blanca.",
  },

  botella_vidrio: {
    clave: "botella_vidrio",
    nombreVisible: "Botella de vidrio",
    caneca: "blanca",
    explicacion:
      "La botella de vidrio limpia y seca debe depositarse en la caneca blanca.",
  },

  lata: {
    clave: "lata",
    nombreVisible: "Lata",
    caneca: "blanca",
    explicacion:
      "Las latas limpias y secas deben depositarse en la caneca blanca.",
  },

  carton: {
    clave: "carton",
    nombreVisible: "Cartón",
    caneca: "blanca",
    explicacion:
      "El cartón limpio y seco debe depositarse en la caneca blanca.",
  },

  papel: {
    clave: "papel",
    nombreVisible: "Papel",
    caneca: "blanca",
    explicacion:
      "El papel limpio y seco debe depositarse en la caneca blanca.",
  },

  envoltorio_snack: {
    clave: "envoltorio_snack",
    nombreVisible: "Envoltorio de snack",
    caneca: "negra",
    explicacion:
      "Los envoltorios de snacks se clasifican como residuos no aprovechables y van en la caneca negra.",
  },

  servilleta_usada: {
    clave: "servilleta_usada",
    nombreVisible: "Servilleta usada",
    caneca: "negra",
    explicacion:
      "Las servilletas usadas se depositan en la caneca negra.",
  },

  restos_comida: {
    clave: "restos_comida",
    nombreVisible: "Restos de comida",
    caneca: "verde",
    explicacion:
      "Los restos de comida son residuos orgánicos aprovechables y van en la caneca verde.",
  },

  cascara_fruta: {
    clave: "cascara_fruta",
    nombreVisible: "Cáscara de fruta",
    caneca: "verde",
    explicacion:
      "Las cáscaras de fruta son residuos orgánicos aprovechables y van en la caneca verde.",
  },

  // Caso especial:
  // El modelo reconoce "envase_desechable", pero la caneca final
  // depende de si está limpio y seco o sucio/contaminado.
  envase_desechable: {
    clave: "envase_desechable",
    nombreVisible: "Envase desechable",
    caneca: "blanca",
    explicacion:
      "Si está limpio y seco va en la caneca blanca. Si está sucio o contaminado va en la caneca negra.",
  },

  residuo_vegetal: {
    clave: "residuo_vegetal",
    nombreVisible: "Residuo vegetal",
    caneca: "verde",
    explicacion:
      "Los residuos vegetales son orgánicos aprovechables y van en la caneca verde.",
  },
};

export const UMBRAL_CONFIANZA_PREDETERMINADO = 0.5;

export function clasificar(
  residuoClave: string
): InfoResiduo | undefined {
  return RESIDUOS[residuoClave];
}

export function esConfianzaSuficiente(
  confianza: number,
  umbral = UMBRAL_CONFIANZA_PREDETERMINADO
): boolean {
  return confianza >= umbral;
}

export function residuosPorCaneca(
  canecaId: CanecaId
): InfoResiduo[] {
  return Object.values(RESIDUOS).filter(
    (r) => r.caneca === canecaId
  );
}