// Lógica de autenticación: registro, inicio de sesión y recuperación de
// contraseña. Ahora delega en el backend (server/index.js), que guarda
// los usuarios en una base de datos SQLite real (database/app.db) y
// calcula el hash de la contraseña con PBKDF2-HMAC-SHA256 vía el módulo
// nativo "crypto" de Node (nunca en el navegador, para no depender de un
// contexto seguro HTTPS/localhost).

import { api } from "./api";
import type { Rol, UsuarioSesion } from "../types";

const CORREO_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function correoValido(correo: string): boolean {
  return CORREO_REGEX.test(correo.trim());
}

export function passwordValida(password: string): { valida: boolean; mensaje: string } {
  if (password.length < 6) {
    return { valida: false, mensaje: "La contraseña debe tener al menos 6 caracteres." };
  }
  return { valida: true, mensaje: "" };
}

export interface ResultadoAuth<T = undefined> {
  exito: boolean;
  mensaje: string;
  datos?: T;
}

export async function registrar(
  nombre: string, correo: string, password: string, confirmarPassword: string, rol: Rol,
): Promise<ResultadoAuth> {
  if (!nombre.trim() || !correo.trim() || !password || !confirmarPassword || !rol) {
    return { exito: false, mensaje: "Todos los campos son obligatorios." };
  }
  if (!correoValido(correo)) {
    return { exito: false, mensaje: "El correo electrónico no es válido." };
  }
  if (password !== confirmarPassword) {
    return { exito: false, mensaje: "Las contraseñas no coinciden." };
  }
  const { valida, mensaje } = passwordValida(password);
  if (!valida) {
    return { exito: false, mensaje };
  }
  return api.post<ResultadoAuth>("/auth/registrar", { nombre, correo, password, confirmarPassword, rol });
}

export async function iniciarSesion(correo: string, password: string): Promise<ResultadoAuth<UsuarioSesion>> {
  if (!correo.trim() || !password) {
    return { exito: false, mensaje: "Ingresa correo y contraseña." };
  }
  return api.post<ResultadoAuth<UsuarioSesion>>("/auth/login", { correo, password });
}

export async function solicitarRecuperacion(correo: string): Promise<ResultadoAuth<{ codigo: string; usuarioId: string }>> {
  return api.post("/auth/recuperar", { correo });
}

export async function restablecerPassword(usuarioId: string, nuevaPassword: string): Promise<ResultadoAuth> {
  const { valida, mensaje } = passwordValida(nuevaPassword);
  if (!valida) {
    return { exito: false, mensaje };
  }
  return api.post<ResultadoAuth>("/auth/restablecer", { usuarioId, nuevaPassword });
}

export async function cambiarPassword(usuarioId: string, actual: string, nueva: string): Promise<ResultadoAuth> {
  const { valida, mensaje } = passwordValida(nueva);
  if (!valida) {
    return { exito: false, mensaje };
  }
  return api.post<ResultadoAuth>(`/usuarios/${usuarioId}/password`, { actual, nueva });
}
