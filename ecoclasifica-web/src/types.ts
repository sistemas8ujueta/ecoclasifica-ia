import type { CanecaId } from "./data/canecas";

export type Rol = "Estudiante" | "Personal de aseo";

export const ROLES: Rol[] = ["Estudiante", "Personal de aseo"];

export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  passwordHash: string;
  rol: Rol;
  fechaRegistro: string;
}

export interface UsuarioSesion {
  id: string;
  nombre: string;
  correo: string;
  rol: Rol;
}

export interface Clasificacion {
  id: string;
  usuarioId: string;
  residuo: string;
  confianza: number;
  caneca: CanecaId;
  fecha: string;
  imagenDataUrl?: string;
}

export interface ResultadoDeteccion {
  residuo: string | null;
  confianza: number;
  caneca: CanecaId | null;
  reconocido: boolean;
}
