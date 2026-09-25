import { Capacitor } from "@capacitor/core";
import { api } from "./api";
import * as auth from "./auth";
import type {
  Clasificacion,
  Rol,
  Usuario,
  UsuarioSesion,
} from "../types";
import type { CanecaId } from "../data/canecas";

export interface UsuarioAdmin {
  id: string;
  nombre: string;
  correo: string;
  rol: Rol;
  fechaRegistro: string;
  totalClasificaciones: number;
}

const CLAVE_HISTORIAL =
  "ecoclasifica_historial";

function esAndroid(): boolean {
  return Capacitor.isNativePlatform();
}

function leerHistorialLocal(): Clasificacion[] {
  try {
    const contenido =
      localStorage.getItem(
        CLAVE_HISTORIAL
      );

    if (!contenido) {
      return [];
    }

    const datos =
      JSON.parse(
        contenido
      ) as Clasificacion[];

    return Array.isArray(datos)
      ? datos
      : [];
  } catch (error) {
    console.error(
      "Error leyendo historial local:",
      error
    );

    return [];
  }
}

function escribirHistorialLocal(
  historial: Clasificacion[]
): void {
  localStorage.setItem(
    CLAVE_HISTORIAL,
    JSON.stringify(historial)
  );
}

export function listarUsuarios(): Promise<UsuarioAdmin[]> {
  return api.get<UsuarioAdmin[]>(
    "/usuarios"
  );
}

export async function actualizarPerfil(
  usuarioId: string,
  nombre: string,
  rol: Rol
): Promise<UsuarioSesion | undefined> {

  const resultado =
    await api.put<{
      exito: boolean;
      datos?: UsuarioSesion;
    }>(
      `/usuarios/${usuarioId}/perfil`,
      {
        nombre,
        rol,
      }
    );

  return resultado.datos;
}

/**
 * Guarda una clasificación.
 *
 * Android:
 *   Guarda directamente en el celular.
 *
 * Web:
 *   Continúa utilizando el backend.
 */
export async function guardarClasificacion(
  datos: Omit<
    Clasificacion,
    "id" | "fecha"
  >
): Promise<Clasificacion> {

  if (esAndroid()) {

    const nuevaClasificacion: Clasificacion = {
      ...datos,

      id:
        `${Date.now()}-${Math.random()
          .toString(36)
          .substring(2, 10)}`,

      fecha:
        new Date().toISOString(),
    };

    const historial =
      leerHistorialLocal();

    historial.unshift(
      nuevaClasificacion
    );

    escribirHistorialLocal(
      historial
    );

    console.log(
      "Clasificación guardada localmente:",
      nuevaClasificacion
    );

    return nuevaClasificacion;
  }

  return api.post<Clasificacion>(
    "/clasificaciones",
    datos
  );
}

export async function obtenerHistorial(
  usuarioId: string,
  opciones: {
    caneca?: CanecaId | null;
    texto?: string | null;
  } = {}
): Promise<Clasificacion[]> {

  if (esAndroid()) {

    let historial =
      leerHistorialLocal();

    /*
     * Solo mostrar las clasificaciones
     * del usuario actual.
     */
    historial =
      historial.filter(
        (item) =>
          item.usuarioId ===
          usuarioId
      );

    /*
     * Filtrar por caneca.
     */
    if (opciones.caneca) {
      historial =
        historial.filter(
          (item) =>
            item.caneca ===
            opciones.caneca
        );
    }

    /*
     * Filtrar por nombre del residuo.
     */
    if (opciones.texto) {

      const texto =
        opciones.texto
          .toLowerCase()
          .trim();

      if (texto) {
        historial =
          historial.filter(
            (item) =>
              item.residuo
                .toLowerCase()
                .includes(texto)
          );
      }
    }

    return historial;
  }

  const parametros =
    new URLSearchParams({
      usuarioId,
    });

  if (opciones.caneca) {
    parametros.set(
      "caneca",
      opciones.caneca
    );
  }

  if (opciones.texto) {
    parametros.set(
      "texto",
      opciones.texto
    );
  }

  return api.get<Clasificacion[]>(
    `/clasificaciones?${parametros.toString()}`
  );
}

export async function eliminarClasificacion(
  id: string
): Promise<void> {

  if (esAndroid()) {

    const historial =
      leerHistorialLocal();

    escribirHistorialLocal(
      historial.filter(
        (item) =>
          item.id !== id
      )
    );

    return;
  }

  await api.del(
    `/clasificaciones/${id}`
  );
}

export async function vaciarHistorial(
  usuarioId: string
): Promise<void> {

  if (esAndroid()) {

    const historial =
      leerHistorialLocal();

    /*
     * Elimina únicamente los
     * registros del usuario actual.
     */
    const restante =
      historial.filter(
        (item) =>
          item.usuarioId !==
          usuarioId
      );

    escribirHistorialLocal(
      restante
    );

    return;
  }

  await api.post(
    "/clasificaciones/vaciar",
    {
      usuarioId,
    }
  );
}

export type Periodo =
  | "semana"
  | "mes"
  | "todo";

export interface Estadisticas {
  total: number;
  blanca: number;
  verde: number;
  negra: number;
  confianzaPromedio: number | null;
  residuoMasFrecuente: string | null;
}

function filtrarPeriodo(
  historial: Clasificacion[],
  periodo: Periodo
): Clasificacion[] {

  if (periodo === "todo") {
    return historial;
  }

  const ahora =
    new Date();

  const limite =
    new Date(ahora);

  if (periodo === "semana") {
    limite.setDate(
      ahora.getDate() - 7
    );
  }

  if (periodo === "mes") {
    limite.setMonth(
      ahora.getMonth() - 1
    );
  }

  return historial.filter(
    (item) =>
      new Date(item.fecha) >=
      limite
  );
}

function calcularEstadisticas(
  historial: Clasificacion[]
): Estadisticas {

  const total =
    historial.length;

  const blanca =
    historial.filter(
      (item) =>
        item.caneca === "blanca"
    ).length;

  const verde =
    historial.filter(
      (item) =>
        item.caneca === "verde"
    ).length;

  const negra =
    historial.filter(
      (item) =>
        item.caneca === "negra"
    ).length;

  const confianzaPromedio =
    total > 0
      ? historial.reduce(
          (suma, item) =>
            suma +
            item.confianza,
          0
        ) / total
      : null;

  const frecuencias:
    Record<string, number> = {};

  for (const item of historial) {

    frecuencias[item.residuo] =
      (frecuencias[item.residuo] ?? 0) +
      1;
  }

  let residuoMasFrecuente:
    string | null = null;

  let mayorCantidad = 0;

  for (
    const [residuo, cantidad]
    of Object.entries(
      frecuencias
    )
  ) {

    if (
      cantidad >
      mayorCantidad
    ) {
      mayorCantidad =
        cantidad;

      residuoMasFrecuente =
        residuo;
    }
  }

  return {
    total,
    blanca,
    verde,
    negra,
    confianzaPromedio,
    residuoMasFrecuente,
  };
}

export async function obtenerEstadisticas(
  usuarioId: string,
  periodo: Periodo = "todo"
): Promise<Estadisticas> {

  if (esAndroid()) {

    const historial =
      leerHistorialLocal()
        .filter(
          (item) =>
            item.usuarioId ===
            usuarioId
        );

    const filtrado =
      filtrarPeriodo(
        historial,
        periodo
      );

    return calcularEstadisticas(
      filtrado
    );
  }

  return api.get<Estadisticas>(
    `/estadisticas?usuarioId=${usuarioId}&periodo=${periodo}`
  );
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
  usuariosPorRol: Partial<
    Record<Rol, number>
  >;
  recientes: ActividadReciente[];
}

export async function obtenerPanel(): Promise<PanelInstitucional> {

  if (esAndroid()) {

    const usuarios = auth.listarUsuariosLocales();
    const historial = leerHistorialLocal();

    const totalUsuarios = usuarios.length;
    const totalClasificaciones = historial.length;

    const blanca = historial.filter(
      (item) => item.caneca === "blanca"
    ).length;

    const verde = historial.filter(
      (item) => item.caneca === "verde"
    ).length;

    const negra = historial.filter(
      (item) => item.caneca === "negra"
    ).length;

    const confianzaPromedio =
      totalClasificaciones > 0
        ? historial.reduce(
            (suma, item) => suma + item.confianza,
            0
          ) / totalClasificaciones
        : null;

    const usuariosPorRol: Partial<Record<Rol, number>> = {};

    usuarios.forEach((usuario) => {
      usuariosPorRol[usuario.rol] =
        (usuariosPorRol[usuario.rol] ?? 0) + 1;
    });

    const recientes: ActividadReciente[] =
      historial
        .slice()
        .sort(
          (a, b) =>
            new Date(b.fecha).getTime() -
            new Date(a.fecha).getTime()
        )
        .slice(0, 10)
        .map((clasificacion) => {

          const usuario =
            usuarios.find(
              (u) =>
                u.id ===
                clasificacion.usuarioId
            );

          return {
            residuo: clasificacion.residuo,
            caneca: clasificacion.caneca,
            confianza: clasificacion.confianza,
            fecha: clasificacion.fecha,
            usuarioNombre:
              usuario?.nombre ?? "Usuario",
          };
        });

    return {
      totalUsuarios,
      totalClasificaciones,
      blanca,
      verde,
      negra,
      confianzaPromedio,
      usuariosPorRol,
      recientes,
    };
  }

  return api.get<PanelInstitucional>(
    "/panel"
  );
}

export type { Usuario };