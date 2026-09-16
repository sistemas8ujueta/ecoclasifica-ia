// Capa de persistencia (reemplaza a services/database.py de la versión
// Python). Ahora todo vive en el backend (server/index.js) sobre SQLite
// real (database/app.db), no en localStorage del navegador, para que los
// registros de usuarios y clasificaciones sean permanentes y consultables
// fuera de la app.

import { api } from "./api";
import type { Clasificacion, Rol, Usuario, UsuarioSesion } from "../types";
import type { CanecaId } from "../data/canecas";

export interface UsuarioAdmin {
  id: string;
  nombre: string;
  correo: string;
  rol: Rol;
  fechaRegistro: string;
  totalClasificaciones: number;
}

export function listarUsuarios(): Promise<UsuarioAdmin[]> {
  return api.get<UsuarioAdmin[]>("/usuarios");
}

export async function actualizarPerfil(usuarioId: string, nombre: string, rol: Rol): Promise<UsuarioSesion | undefined> {
  const resultado = await api.put<{ exito: boolean; datos?: UsuarioSesion }>(`/usuarios/${usuarioId}/perfil`, { nombre, rol });
  return resultado.datos;
}

export function guardarClasificacion(
  datos: Omit<Clasificacion, "id" | "fecha">,
): Promise<Clasificacion> {
  return api.post<Clasificacion>("/clasificaciones", datos);
}

export function obtenerHistorial(
  usuarioId: string,
  opciones: { caneca?: CanecaId | null; texto?: string | null } = {},
): Promise<Clasificacion[]> {
  const parametros = new URLSearchParams({ usuarioId });
  if (opciones.caneca) parametros.set("caneca", opciones.caneca);
  if (opciones.texto) parametros.set("texto", opciones.texto);
  return api.get<Clasificacion[]>(`/clasificaciones?${parametros.toString()}`);
}

export function eliminarClasificacion(id: string): Promise<void> {
  return api.del(`/clasificaciones/${id}`);
}

export function vaciarHistorial(usuarioId: string): Promise<void> {
  return api.post("/clasificaciones/vaciar", { usuarioId });
}

export type Periodo = "semana" | "mes" | "todo";

export interface Estadisticas {
  total: number;
  blanca: number;
  verde: number;
  negra: number;
  confianzaPromedio: number | null;
  residuoMasFrecuente: string | null;
}

export function obtenerEstadisticas(usuarioId: string, periodo: Periodo = "todo"): Promise<Estadisticas> {
  return api.get(`/estadisticas?usuarioId=${usuarioId}&periodo=${periodo}`);
}

export interface ActividadReciente {
  residuo: string;
  caneca: CanecaId;
  confianza: number;
  fecha: string;
  usuarioNombre: string;
}

export interface PanelInstitucional {
  totalUsuarios: number;
  totalClasificaciones: number;
  blanca: number;
  verde: number;
  negra: number;
  confianzaPromedio: number | null;
  usuariosPorRol: Partial<Record<Rol, number>>;
  recientes: ActividadReciente[];
}

export function obtenerPanel(): Promise<PanelInstitucional> {
  return api.get("/panel");
}

// Se mantiene el tipo Usuario exportado para quien lo necesite (p. ej. el
// panel de administración), aunque ya no se construye localmente.
export type { Usuario };
