import type { Rol, UsuarioSesion } from "../types";

const CLAVE_USUARIOS = "ecoclasifica_usuarios";
const CLAVE_SESION = "ecoclasifica_sesion";

interface UsuarioLocal {
  id: string;
  nombre: string;
  correo: string;
  password: string;
  rol: Rol;
  fechaRegistro: string;
}

export interface UsuarioLocalAdmin {
  id: string;
  nombre: string;
  correo: string;
  rol: Rol;
  fechaRegistro: string;
  totalClasificaciones: number;
}

export interface ResultadoAuth<T = undefined> {
  exito: boolean;
  mensaje: string;
  datos?: T;
}

const CORREO_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function correoValido(correo: string): boolean {
  return CORREO_REGEX.test(correo.trim());
}

export function passwordValida(password: string): {
  valida: boolean;
  mensaje: string;
} {
  if (password.length < 6) {
    return {
      valida: false,
      mensaje: "La contraseña debe tener al menos 6 caracteres.",
    };
  }

  return {
    valida: true,
    mensaje: "",
  };
}

function obtenerUsuarios(): UsuarioLocal[] {
  try {
    const datos = localStorage.getItem(CLAVE_USUARIOS);

    if (!datos) {
      return [];
    }

    return JSON.parse(datos) as UsuarioLocal[];
  } catch {
    return [];
  }
}

function guardarUsuarios(usuarios: UsuarioLocal[]): void {
  localStorage.setItem(
    CLAVE_USUARIOS,
    JSON.stringify(usuarios)
  );
}

export async function registrar(
  nombre: string,
  correo: string,
  password: string,
  confirmarPassword: string,
  rol: Rol
): Promise<ResultadoAuth> {

  if (
    !nombre.trim() ||
    !correo.trim() ||
    !password ||
    !confirmarPassword ||
    !rol
  ) {
    return {
      exito: false,
      mensaje: "Todos los campos son obligatorios.",
    };
  }

  if (!correoValido(correo)) {
    return {
      exito: false,
      mensaje: "El correo electrónico no es válido.",
    };
  }

  if (password !== confirmarPassword) {
    return {
      exito: false,
      mensaje: "Las contraseñas no coinciden.",
    };
  }

  const validacion = passwordValida(password);

  if (!validacion.valida) {
    return {
      exito: false,
      mensaje: validacion.mensaje,
    };
  }

  const usuarios = obtenerUsuarios();

  const correoNormalizado = correo.trim().toLowerCase();

  const existe = usuarios.some(
    (usuario) =>
      usuario.correo.toLowerCase() === correoNormalizado
  );

  if (existe) {
    return {
      exito: false,
      mensaje: "Ya existe una cuenta con ese correo.",
    };
  }

  const nuevoUsuario: UsuarioLocal = {
    id: crypto.randomUUID(),
    nombre: nombre.trim(),
    correo: correoNormalizado,
    password,
    rol,
    fechaRegistro: new Date().toISOString(),
  };

  usuarios.push(nuevoUsuario);

  guardarUsuarios(usuarios);

  return {
    exito: true,
    mensaje: "Cuenta creada correctamente.",
  };
}

export async function iniciarSesion(
  correo: string,
  password: string
): Promise<ResultadoAuth<UsuarioSesion>> {

  if (!correo.trim() || !password) {
    return {
      exito: false,
      mensaje: "Ingresa correo y contraseña.",
    };
  }

  const usuarios = obtenerUsuarios();

  const correoNormalizado = correo.trim().toLowerCase();

  const usuario = usuarios.find(
    (item) =>
      item.correo.toLowerCase() === correoNormalizado &&
      item.password === password
  );

  if (!usuario) {
    return {
      exito: false,
      mensaje: "Correo o contraseña incorrectos.",
    };
  }

  const sesion: UsuarioSesion = {
    id: usuario.id,
    nombre: usuario.nombre,
    correo: usuario.correo,
    rol: usuario.rol,
  };

  localStorage.setItem(
    CLAVE_SESION,
    JSON.stringify(sesion)
  );

  return {
    exito: true,
    mensaje: "Inicio de sesión correcto.",
    datos: sesion,
  };
}

export function obtenerSesionLocal(): UsuarioSesion | undefined {
  try {
    const datos = localStorage.getItem(CLAVE_SESION);

    if (!datos) {
      return undefined;
    }

    return JSON.parse(datos) as UsuarioSesion;
  } catch {
    return undefined;
  }
}

export function cerrarSesionLocal(): void {
  localStorage.removeItem(CLAVE_SESION);
}

export async function solicitarRecuperacion(
  correo: string
): Promise<ResultadoAuth<{ codigo: string; usuarioId: string }>> {

  const usuarios = obtenerUsuarios();

  const usuario = usuarios.find(
    (item) =>
      item.correo.toLowerCase() ===
      correo.trim().toLowerCase()
  );

  if (!usuario) {
    return {
      exito: false,
      mensaje: "No existe una cuenta con ese correo.",
    };
  }

  // Código local para recuperación.
  // En esta versión no se envía correo: se genera directamente
  // en el dispositivo.
  const codigo = String(
    Math.floor(100000 + Math.random() * 900000)
  );

  return {
    exito: true,
    mensaje: "Código de recuperación generado.",
    datos: {
      codigo,
      usuarioId: usuario.id,
    },
  };
}


export async function restablecerPassword(
  usuarioId: string,
  nuevaPassword: string
): Promise<ResultadoAuth> {

  const validacion = passwordValida(nuevaPassword);

  if (!validacion.valida) {
    return {
      exito: false,
      mensaje: validacion.mensaje,
    };
  }

  const usuarios = obtenerUsuarios();

  const indice = usuarios.findIndex(
    (usuario) => usuario.id === usuarioId
  );

  if (indice === -1) {
    return {
      exito: false,
      mensaje: "Usuario no encontrado.",
    };
  }

  usuarios[indice].password = nuevaPassword;

  guardarUsuarios(usuarios);

  return {
    exito: true,
    mensaje: "Contraseña actualizada correctamente.",
  };
}


export async function cambiarPassword(
  usuarioId: string,
  actual: string,
  nueva: string
): Promise<ResultadoAuth> {

  if (!actual) {
    return {
      exito: false,
      mensaje: "Ingresa tu contraseña actual.",
    };
  }

  const validacion = passwordValida(nueva);

  if (!validacion.valida) {
    return {
      exito: false,
      mensaje: validacion.mensaje,
    };
  }

  const usuarios = obtenerUsuarios();

  const indice = usuarios.findIndex(
    (usuario) => usuario.id === usuarioId
  );

  if (indice === -1) {
    return {
      exito: false,
      mensaje: "Usuario no encontrado.",
    };
  }

  if (usuarios[indice].password !== actual) {
    return {
      exito: false,
      mensaje: "La contraseña actual es incorrecta.",
    };
  }

  usuarios[indice].password = nueva;

  guardarUsuarios(usuarios);

  return {
    exito: true,
    mensaje: "Contraseña actualizada correctamente.",
  };
}

export function listarUsuariosLocales(): UsuarioLocalAdmin[] {
  const datos = localStorage.getItem("ecoclasifica_usuarios");

  if (!datos) return [];

  try {
    const usuarios = JSON.parse(datos);

    return usuarios.map((usuario: any) => ({
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
      rol: usuario.rol,
      fechaRegistro: usuario.fechaRegistro,
      totalClasificaciones: 0,
    }));
  } catch {
    return [];
  }
}