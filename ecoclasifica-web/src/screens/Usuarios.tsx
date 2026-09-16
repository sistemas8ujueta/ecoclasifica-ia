import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import * as storage from "../services/storage";
import type { UsuarioAdmin } from "../services/storage";
import type { Rol } from "../types";
import { IconChevronLeft, IconDatabase, IconSearch, IconUsers } from "../components/icons";
import { EstadoVacio } from "../components/UI";
import "./Usuarios.css";

const ESTILO_ROL: Record<Rol, { color: string; fondo: string }> = {
  "Estudiante": { color: "var(--verde-oscuro)", fondo: "#E8F6F0" },
  "Personal de aseo": { color: "#B45309", fondo: "#FDF1E0" },
};

function iniciales(nombre: string): string {
  return nombre.split(" ").slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");
}

function formatearFecha(iso: string): string {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return iso;
  return fecha.toLocaleString("es-CO", { day: "2-digit", month: "short", year: "numeric" });
}

export function Usuarios() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState("");

  useEffect(() => {
    let vigente = true;
    storage.listarUsuarios().then((datos) => {
      if (vigente) { setUsuarios(datos); setCargando(false); }
    });
    return () => { vigente = false; };
  }, []);

  const filtrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();
    if (!texto) return usuarios;
    return usuarios.filter((u) => u.nombre.toLowerCase().includes(texto) || u.correo.toLowerCase().includes(texto));
  }, [usuarios, busqueda]);

  const porRol = useMemo(() => {
    const conteo: Record<string, number> = {};
    usuarios.forEach((u) => { conteo[u.rol] = (conteo[u.rol] ?? 0) + 1; });
    return conteo;
  }, [usuarios]);

  return (
    <div className="pantalla-columna">
      <div className="usuarios-header">
        <button className="volver" onClick={() => navigate(-1)} aria-label="Volver">
          <IconChevronLeft size={19} />
        </button>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <IconUsers size={26} />
        </div>
        <h1>Usuarios registrados</h1>
        <p>Cuentas creadas en EcoClasifica IA</p>
        <div className="db-chip">
          <IconDatabase size={13} /> database/app.db
        </div>
      </div>

      <div className="usuarios-resumen">
        <div className="celda">
          <div className="n">{usuarios.length}</div>
          <div className="etq">Total</div>
        </div>
        <div className="celda">
          <div className="n">{porRol["Estudiante"] ?? 0}</div>
          <div className="etq">Estudiantes</div>
        </div>
        <div className="celda">
          <div className="n">{porRol["Personal de aseo"] ?? 0}</div>
          <div className="etq">Personal de aseo</div>
        </div>
      </div>

      <div className="usuarios-busqueda">
        <div className="campo-busqueda">
          <IconSearch size={17} color="#8B968F" />
          <input placeholder="Buscar por nombre o correo..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        </div>
      </div>

      <div className="usuarios-lista">
        {cargando && Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 68, borderRadius: 14 }} />
        ))}

        {!cargando && filtrados.length === 0 && (
          <EstadoVacio
            icono={<IconUsers size={26} />}
            titulo={usuarios.length === 0 ? "Aún no hay usuarios registrados" : "Sin coincidencias"}
            descripcion={usuarios.length === 0 ? "Las cuentas que se registren aparecerán aquí." : "Ningún usuario coincide con tu búsqueda."}
          />
        )}

        {!cargando && filtrados.map((u, i) => {
          const estilo = ESTILO_ROL[u.rol] ?? ESTILO_ROL["Estudiante"];
          return (
            <div key={u.id} className="usuario-fila" style={{ animationDelay: `${Math.min(i, 8) * 0.03}s` }}>
              <div className="avatar" style={{ background: estilo.fondo, color: estilo.color }}>
                {iniciales(u.nombre)}
              </div>
              <div className="info">
                <div className="nombre">{u.nombre}</div>
                <div className="correo">{u.correo}</div>
                <div className="meta">
                  <span className="rol-chip" style={{ background: estilo.fondo, color: estilo.color }}>{u.rol}</span>
                  <span className="fecha">Desde {formatearFecha(u.fechaRegistro)}</span>
                </div>
              </div>
              <div className="contador">
                <div className="num">{u.totalClasificaciones}</div>
                <div className="etq">escaneos</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
