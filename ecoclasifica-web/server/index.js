import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { db, DB_URL } from "./db.js";
import { hashPassword, verificarPassword } from "./hash.js";
import * as ort from "onnxruntime-node";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUERTO = process.env.PORT ? Number(process.env.PORT) : 4000;
const CORREO_REGEX = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const ROLES_VALIDOS = ["Estudiante", "Personal de aseo"];

const app = express();
app.use((req, _res, next) => {
  console.log("🌐 PETICIÓN:", req.method, req.url);
  next();
});
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ---------------------------------------------------------------------
// Helpers de acceso a datos (@libsql/client es asíncrono: cada consulta
// devuelve una promesa, a diferencia del antiguo node:sqlite síncrono).
// ---------------------------------------------------------------------
async function todas(sql, args = []) {
  const resultado = await db.execute({ sql, args });
  return resultado.rows;
}

async function una(sql, args = []) {
  const resultado = await db.execute({ sql, args });
  return resultado.rows[0];
}

async function ejecutar(sql, args = []) {
  return db.execute({ sql, args });
}

function aUsuarioSesion(fila) {
  return { id: String(fila.id), nombre: fila.nombre, correo: fila.correo, rol: fila.rol };
}

function aClasificacion(fila) {
  return {
    id: String(fila.id),
    usuarioId: String(fila.usuario_id),
    residuo: fila.residuo,
    confianza: fila.confianza,
    caneca: fila.caneca,
    fecha: fila.fecha,
  };
}

// Envuelve cada ruta async para que un error inesperado llegue al
// manejador de errores de Express en vez de colgar la petición.
function asincrona(manejador) {
  return (req, res, next) => manejador(req, res, next).catch(next);
}


// ---------------------------------------------------------------------
// Detector YOLO ONNX
// ---------------------------------------------------------------------

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
];

const CANECA_POR_CLASE = {
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

const RUTA_MODELO = path.resolve(
  __dirname,
  "../modelos/clasificador_residuos_best.onnx"
);

let sesionYOLOPromise;

function obtenerSesionYOLO() {
  if (!sesionYOLOPromise) {
    sesionYOLOPromise = ort.InferenceSession.create(RUTA_MODELO);
  }

  return sesionYOLOPromise;
}

async function imagenATensor(dataUrl) {
  if (
    typeof dataUrl !== "string" ||
    !dataUrl.startsWith("data:image/")
  ) {
    throw new Error("La imagen recibida no es válida.");
  }

  const coma = dataUrl.indexOf(",");

  if (coma < 0) {
    throw new Error("La imagen recibida no contiene datos.");
  }

  const buffer = Buffer.from(
    dataUrl.slice(coma + 1),
    "base64"
  );

  const { data, info } = await sharp(buffer)
    .rotate()
    .resize(640, 640, {
      fit: "contain",
      position: "centre",
      background: {
        r: 114,
        g: 114,
        b: 114,
      },
    })
    .removeAlpha()
    .raw()
    .toBuffer({
      resolveWithObject: true,
    });

  if (
    info.width !== 640 ||
    info.height !== 640 ||
    info.channels !== 3
  ) {
    throw new Error(
      "No se pudo convertir la imagen a RGB 640x640."
    );
  }

  const area = 640 * 640;

  const entrada = new Float32Array(
    3 * area
  );

  for (let i = 0; i < area; i += 1) {
    entrada[i] =
      data[i * 3] / 255;

    entrada[area + i] =
      data[i * 3 + 1] / 255;

    entrada[2 * area + i] =
      data[i * 3 + 2] / 255;
  }

  return new ort.Tensor(
    "float32",
    entrada,
    [1, 3, 640, 640]
  );
}

function mejorDeteccionYOLO(salida) {
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
        datos[
          (4 + clase) * candidatos + i
        ];

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

app.post(
  "/api/detectar",

  asincrona(async (req, res) => {
    console.log("======================================");
    console.log("📥 RECIBIDA PETICIÓN /api/detectar");
    console.log("Hora:", new Date().toISOString());

    const imagenDataUrl = req.body?.imagenDataUrl;

    console.log(
      "Imagen recibida:",
      typeof imagenDataUrl,
      imagenDataUrl
        ? `${imagenDataUrl.length} caracteres`
        : "SIN IMAGEN"
    );

    if (!imagenDataUrl) {
      console.log("❌ No se recibió imagen.");

      return res
        .status(400)
        .json({
          exito: false,
          mensaje: "Debes enviar una imagen.",
        });
    }

    console.log("1️⃣ Convirtiendo imagen a tensor...");

    const tensor = await imagenATensor(imagenDataUrl);

    console.log("2️⃣ Tensor creado correctamente.");
    console.log("Dimensiones:", tensor.dims);

    console.log("3️⃣ Cargando modelo YOLO...");

    const sesion = await obtenerSesionYOLO();

    console.log("4️⃣ Modelo YOLO cargado.");
    console.log("Ejecutando inferencia...");

    const resultados = await sesion.run({
      images: tensor,
    });

    console.log("5️⃣ YOLO terminó.");

    const salida = resultados.output0;

    if (!salida) {
      throw new Error(
        "El modelo no devolvió output0."
      );
    }

    console.log(
      "6️⃣ output0 recibido:",
      salida.dims
    );

    const resultadoFinal =
      mejorDeteccionYOLO(salida);

    console.log(
      "7️⃣ RESULTADO:",
      resultadoFinal
    );

    console.log("📤 Enviando resultado al celular.");
    console.log("======================================");

    res.json(resultadoFinal);
  })
);

// ---------------------------------------------------------------------
// Autenticación
// ---------------------------------------------------------------------
app.post(
  "/api/auth/registrar",
  asincrona(async (req, res) => {
    let { nombre, correo, password, confirmarPassword, rol } = req.body ?? {};
    nombre = String(nombre ?? "").trim();
    correo = String(correo ?? "").trim().toLowerCase();

    if (!nombre || !correo || !password || !confirmarPassword || !rol) {
      return res.json({ exito: false, mensaje: "Todos los campos son obligatorios." });
    }
    if (!CORREO_REGEX.test(correo)) {
      return res.json({ exito: false, mensaje: "El correo electrónico no es válido." });
    }
    if (!ROLES_VALIDOS.includes(rol)) {
      return res.json({ exito: false, mensaje: "El rol seleccionado no es válido." });
    }
    if (password !== confirmarPassword) {
      return res.json({ exito: false, mensaje: "Las contraseñas no coinciden." });
    }
    if (String(password).length < 6) {
      return res.json({ exito: false, mensaje: "La contraseña debe tener al menos 6 caracteres." });
    }

    const existente = await una("SELECT id FROM usuarios WHERE correo = ?", [correo]);
    if (existente) {
      return res.json({ exito: false, mensaje: "Ya existe una cuenta registrada con ese correo." });
    }

    const passwordHash = hashPassword(password);
    const fechaRegistro = new Date().toISOString();
    await ejecutar(
      "INSERT INTO usuarios (nombre, correo, password_hash, rol, fecha_registro) VALUES (?, ?, ?, ?, ?)",
      [nombre, correo, passwordHash, rol, fechaRegistro],
    );

    res.json({ exito: true, mensaje: "Cuenta creada correctamente." });
  }),
);

app.post(
  "/api/auth/login",
  asincrona(async (req, res) => {
    let { correo, password } = req.body ?? {};
    correo = String(correo ?? "").trim().toLowerCase();

    if (!correo || !password) {
      return res.json({ exito: false, mensaje: "Ingresa correo y contraseña." });
    }
    const usuario = await una("SELECT * FROM usuarios WHERE correo = ?", [correo]);
    if (!usuario) {
      return res.json({ exito: false, mensaje: "No existe una cuenta con ese correo." });
    }
    if (!verificarPassword(password, usuario.password_hash)) {
      return res.json({ exito: false, mensaje: "La contraseña es incorrecta." });
    }
    res.json({ exito: true, mensaje: "Inicio de sesión exitoso.", datos: aUsuarioSesion(usuario) });
  }),
);

app.post(
  "/api/auth/recuperar",
  asincrona(async (req, res) => {
    const correo = String(req.body?.correo ?? "").trim().toLowerCase();
    const usuario = await una("SELECT id FROM usuarios WHERE correo = ?", [correo]);
    if (!usuario) {
      return res.json({ exito: false, mensaje: "No existe una cuenta con ese correo." });
    }
    const codigo = String(Math.floor(Math.random() * 1_000_000)).padStart(6, "0");
    res.json({ exito: true, mensaje: "Se generó un código de verificación local.", datos: { codigo, usuarioId: String(usuario.id) } });
  }),
);

app.post(
  "/api/auth/restablecer",
  asincrona(async (req, res) => {
    const { usuarioId, nuevaPassword } = req.body ?? {};
    if (String(nuevaPassword ?? "").length < 6) {
      return res.json({ exito: false, mensaje: "La contraseña debe tener al menos 6 caracteres." });
    }
    await ejecutar("UPDATE usuarios SET password_hash = ? WHERE id = ?", [hashPassword(nuevaPassword), Number(usuarioId)]);
    res.json({ exito: true, mensaje: "Contraseña actualizada correctamente." });
  }),
);

// ---------------------------------------------------------------------
// Usuarios (panel de administración)
// ---------------------------------------------------------------------
app.get(
  "/api/usuarios",
  asincrona(async (_req, res) => {
    const filas = await todas(
      `SELECT u.*, (SELECT COUNT(*) FROM clasificaciones c WHERE c.usuario_id = u.id) AS total_clasificaciones
       FROM usuarios u ORDER BY u.fecha_registro DESC`,
    );
    res.json(
      filas.map((f) => ({
        id: String(f.id),
        nombre: f.nombre,
        correo: f.correo,
        rol: f.rol,
        fechaRegistro: f.fecha_registro,
        totalClasificaciones: Number(f.total_clasificaciones),
      })),
    );
  }),
);

app.put(
  "/api/usuarios/:id/perfil",
  asincrona(async (req, res) => {
    const id = Number(req.params.id);
    const nombre = String(req.body?.nombre ?? "").trim();
    const rol = req.body?.rol;
    if (!nombre || !ROLES_VALIDOS.includes(rol)) {
      return res.json({ exito: false, mensaje: "Datos de perfil inválidos." });
    }
    await ejecutar("UPDATE usuarios SET nombre = ?, rol = ? WHERE id = ?", [nombre, rol, id]);
    const usuario = await una("SELECT * FROM usuarios WHERE id = ?", [id]);
    res.json({ exito: true, mensaje: "Perfil actualizado.", datos: aUsuarioSesion(usuario) });
  }),
);

app.post(
  "/api/usuarios/:id/password",
  asincrona(async (req, res) => {
    const id = Number(req.params.id);
    const { actual, nueva } = req.body ?? {};
    const usuario = await una("SELECT * FROM usuarios WHERE id = ?", [id]);
    if (!usuario || !verificarPassword(actual ?? "", usuario.password_hash)) {
      return res.json({ exito: false, mensaje: "La contraseña actual no es correcta." });
    }
    if (String(nueva ?? "").length < 6) {
      return res.json({ exito: false, mensaje: "La contraseña debe tener al menos 6 caracteres." });
    }
    await ejecutar("UPDATE usuarios SET password_hash = ? WHERE id = ?", [hashPassword(nueva), id]);
    res.json({ exito: true, mensaje: "Contraseña actualizada correctamente." });
  }),
);

// ---------------------------------------------------------------------
// Clasificaciones (historial y estadísticas)
// ---------------------------------------------------------------------
app.post(
  "/api/clasificaciones",
  asincrona(async (req, res) => {
    const { usuarioId, residuo, confianza, caneca } = req.body ?? {};
    const fecha = new Date().toISOString();
    const info = await ejecutar(
      "INSERT INTO clasificaciones (usuario_id, residuo, confianza, caneca, fecha) VALUES (?, ?, ?, ?, ?)",
      [Number(usuarioId), residuo, confianza, caneca, fecha],
    );
    const fila = await una("SELECT * FROM clasificaciones WHERE id = ?", [Number(info.lastInsertRowid)]);
    res.json(aClasificacion(fila));
  }),
);

app.get(
  "/api/clasificaciones",
  asincrona(async (req, res) => {
    const { usuarioId, caneca, texto } = req.query;
    let sql = "SELECT * FROM clasificaciones WHERE usuario_id = ?";
    const parametros = [Number(usuarioId)];
    if (caneca && caneca !== "todas") {
      sql += " AND caneca = ?";
      parametros.push(caneca);
    }
    if (texto) {
      sql += " AND LOWER(residuo) LIKE ?";
      parametros.push(`%${String(texto).toLowerCase()}%`);
    }
    sql += " ORDER BY fecha DESC";
    const filas = await todas(sql, parametros);
    res.json(filas.map(aClasificacion));
  }),
);

app.delete(
  "/api/clasificaciones/:id",
  asincrona(async (req, res) => {
    await ejecutar("DELETE FROM clasificaciones WHERE id = ?", [Number(req.params.id)]);
    res.json({ exito: true });
  }),
);

app.post(
  "/api/clasificaciones/vaciar",
  asincrona(async (req, res) => {
    await ejecutar("DELETE FROM clasificaciones WHERE usuario_id = ?", [Number(req.body?.usuarioId)]);
    res.json({ exito: true });
  }),
);

function fechaLimitePeriodo(periodo) {
  const ahora = new Date();
  if (periodo === "semana") ahora.setDate(ahora.getDate() - 7);
  else if (periodo === "mes") ahora.setMonth(ahora.getMonth() - 1);
  else return null;
  return ahora.toISOString();
}

app.get(
  "/api/estadisticas",
  asincrona(async (req, res) => {
    const usuarioId = Number(req.query.usuarioId);
    const limite = fechaLimitePeriodo(req.query.periodo);
    const filtroPeriodo = limite ? "AND fecha >= ?" : "";
    const paramsPeriodo = limite ? [limite] : [];

    const contar = async (whereExtra = "", params = []) => {
      const fila = await una(
        `SELECT COUNT(*) AS n FROM clasificaciones WHERE usuario_id = ? ${filtroPeriodo} ${whereExtra}`,
        [usuarioId, ...paramsPeriodo, ...params],
      );
      return Number(fila.n);
    };

    const filaPromedio = await una(
      `SELECT AVG(confianza) AS prom FROM clasificaciones WHERE usuario_id = ? ${filtroPeriodo}`,
      [usuarioId, ...paramsPeriodo],
    );
    const promedio = filaPromedio.prom;

    const masFrecuente = await una(
      `SELECT residuo, COUNT(*) AS n FROM clasificaciones WHERE usuario_id = ? ${filtroPeriodo}
       GROUP BY residuo ORDER BY n DESC LIMIT 1`,
      [usuarioId, ...paramsPeriodo],
    );

    res.json({
      total: await contar(),
      blanca: await contar("AND caneca = ?", ["blanca"]),
      verde: await contar("AND caneca = ?", ["verde"]),
      negra: await contar("AND caneca = ?", ["negra"]),
      confianzaPromedio: promedio ? Math.round(promedio * 100) : null,
      residuoMasFrecuente: masFrecuente?.residuo ?? null,
    });
  }),
);

// ---------------------------------------------------------------------
// Panel institucional: agregados de toda la plataforma (todos los
// usuarios), para el dashboard de universidad/empresa.
// ---------------------------------------------------------------------
app.get(
  "/api/panel",
  asincrona(async (_req, res) => {
    const totalUsuarios = Number((await una("SELECT COUNT(*) AS n FROM usuarios")).n);
    const contarGlobal = async (whereExtra = "", params = []) => {
      const fila = await una(`SELECT COUNT(*) AS n FROM clasificaciones ${whereExtra}`, params);
      return Number(fila.n);
    };
    const filaPromedio = await una("SELECT AVG(confianza) AS prom FROM clasificaciones");
    const promedio = filaPromedio.prom;

    const filasPorRol = await todas("SELECT rol, COUNT(*) AS n FROM usuarios GROUP BY rol");
    const usuariosPorRol = filasPorRol.reduce((acc, fila) => ({ ...acc, [fila.rol]: Number(fila.n) }), {});

    const recientes = await todas(
      `SELECT c.residuo, c.caneca, c.confianza, c.fecha, u.nombre AS usuario_nombre
       FROM clasificaciones c JOIN usuarios u ON u.id = c.usuario_id
       ORDER BY c.fecha DESC LIMIT 8`,
    );

    res.json({
      totalUsuarios,
      totalClasificaciones: await contarGlobal(),
      blanca: await contarGlobal("WHERE caneca = ?", ["blanca"]),
      verde: await contarGlobal("WHERE caneca = ?", ["verde"]),
      negra: await contarGlobal("WHERE caneca = ?", ["negra"]),
      confianzaPromedio: promedio ? Math.round(promedio * 100) : null,
      usuariosPorRol,
      recientes: recientes.map((f) => ({
        residuo: f.residuo,
        caneca: f.caneca,
        confianza: f.confianza,
        fecha: f.fecha,
        usuarioNombre: f.usuario_nombre,
      })),
    });
  }),
);

app.get("/api/salud", (_req, res) => res.json({ ok: true, db: DB_URL }));

// ---------------------------------------------------------------------
// En producción, el propio servidor Express sirve el build estático del
// frontend (npm run build -> dist/) y responde con index.html para
// cualquier ruta que no sea de la API, para que el enrutado del lado del
// cliente (React Router) funcione al recargar la página o entrar por URL
// directa (p. ej. /historial).
// ---------------------------------------------------------------------
if (process.env.NODE_ENV === "production") {
  const RUTA_DIST = path.resolve(__dirname, "../dist");
  app.use(express.static(RUTA_DIST));
  app.get(/^\/(?!api\/).*/, (_req, res) => {
    res.sendFile(path.join(RUTA_DIST, "index.html"));
  });
}

// Manejador de errores: cualquier excepción no controlada en una ruta
// async (ver el envoltorio `asincrona`) termina aquí en vez de tumbar el
// proceso o dejar la petición colgada.
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ exito: false, mensaje: "Error interno del servidor." });
});

app.listen(PUERTO, "0.0.0.0", () => {
  console.log(`API de EcoClasifica IA escuchando en http://0.0.0.0:${PUERTO} (base de datos: ${DB_URL})`);
});
