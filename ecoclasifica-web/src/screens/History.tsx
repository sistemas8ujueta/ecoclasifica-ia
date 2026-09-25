import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import { useToast } from "../components/Toast";
import * as storage from "../services/storage";
import { clasificar, type CanecaId } from "../data/canecas";
import type { Clasificacion } from "../types";
import { BottomNav } from "../components/BottomNav";
import { EncabezadoDegradado, EstadoVacio, IconBadge, BotonPeligro } from "../components/UI";
import { IconBin, IconBottle, IconClock, IconLeaf, IconSearch } from "../components/icons";

const FILTROS: { id: CanecaId | "todas"; etiqueta: string }[] = [
  { id: "todas", etiqueta: "Todas" },
  { id: "blanca", etiqueta: "Blanca" },
  { id: "verde", etiqueta: "Verde" },
  { id: "negra", etiqueta: "Negra" },
];

const ESTILO_CHIP_INACTIVO: Record<CanecaId | "todas", React.CSSProperties> = {
  todas: {},
  blanca: { background: "#EDEFEE", color: "#3A4640", borderColor: "#464742d3" },
  verde: { background: "#E8F6DA", color: "#3E7A1E", borderColor: "#44487e" },
  negra: { background: "#26332C", color: "#fff", borderColor: "#26332C" },
};

const ICONO_POR_CANECA: Record<
  CanecaId,
  { icono: React.ReactNode; color: string; fondo: string }
> = {
 blanca: {
  icono: <IconBottle size={18} />,
  color: "#26332C",
  fondo: "#f8fbfc",
},
  verde: {
    icono: <IconLeaf size={18} />,
    color: "#FFFFFF",
    fondo: "linear-gradient(135deg, var(--verde-esmeralda), var(--verde-lima))",
  },
  negra: {
    icono: <IconBin size={18} />,
    color: "#FFFFFF",
    fondo: "var(--grad-carbon)",
  },
};

function formatearFecha(iso: string): string {
  const fecha = new Date(iso);
  return fecha.toLocaleString("es-CO", { day: "2-digit", month: "2-digit", year: "numeric", hour: "numeric", minute: "2-digit" });
}

export function History() {
  const { sesion } = useApp();
  const { mostrarToast } = useToast();
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<CanecaId | "todas">("todas");
  const [registros, setRegistros] = useState<Clasificacion[]>([]);
  const [cargando, setCargando] = useState(true);
  const [resumen, setResumen] = useState({ blanca: 0, verde: 0, negra: 0 });

  useEffect(() => {
    if (!sesion) return;
    let vigente = true;
    setCargando(true);
    storage
      .obtenerHistorial(sesion.id, { caneca: filtro === "todas" ? null : filtro, texto: busqueda || null })
      .then((datos) => { if (vigente) { setRegistros(datos); setCargando(false); } });
    return () => { vigente = false; };
  }, [sesion, filtro, busqueda]);

  useEffect(() => {
    if (!sesion) return;
    let vigente = true;
    storage.obtenerEstadisticas(sesion.id).then((d) => { if (vigente) setResumen({ blanca: d.blanca, verde: d.verde, negra: d.negra }); });
    return () => { vigente = false; };
  }, [sesion]);

  async function eliminar(id: string) {
    setRegistros((actual) => actual.filter((r) => r.id !== id));
    await storage.eliminarClasificacion(id);
    mostrarToast("Registro eliminado.");
  }

  async function vaciarTodo() {
    if (!sesion) return;
    if (!confirm("¿Vaciar todo el historial? Esta acción no se puede deshacer.")) return;
    setRegistros([]);
    await storage.vaciarHistorial(sesion.id);
    mostrarToast("Historial vaciado.");
  }

  return (
    <div className="pantalla-columna">
      <EncabezadoDegradado titulo="Historial de clasificaciones" subtitulo="Tus residuos escaneados con IA">
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <div style={{ flex: 1, background: "rgba(255,255,255,.14)", borderRadius: 12, padding: 8, textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-d)", fontWeight: 700, fontSize: 16 }}>{resumen.blanca}</div>
            <div style={{ fontSize: 9, opacity: 0.8 }}>Blanca</div>
          </div>
          <div style={{ flex: 1, background: "rgba(163,230,53,.22)", borderRadius: 12, padding: 8, textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-d)", fontWeight: 700, fontSize: 16, color: "#EFFF9E" }}>{resumen.verde}</div>
            <div style={{ fontSize: 9, opacity: 0.85 }}>Verde</div>
          </div>
          <div style={{ flex: 1, background: "rgba(0,0,0,.22)", borderRadius: 12, padding: 8, textAlign: "center" }}>
            <div style={{ fontFamily: "var(--font-d)", fontWeight: 700, fontSize: 16 }}>{resumen.negra}</div>
            <div style={{ fontSize: 9, opacity: 0.8 }}>Negra</div>
          </div>
        </div>
      </EncabezadoDegradado>

      <div style={{ padding: "12px 20px 4px", display: "flex", gap: 8 }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6, background: "#fff", border: "1px solid var(--borde)", borderRadius: 10, padding: "0 14px", height: 42 }}>
          <IconSearch size={18} color="#8B968F" />
          <input
            placeholder="Buscar residuo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            style={{ border: "none", outline: "none", flex: 1, background: "transparent", fontSize: 13 }}
          />
        </div>
      </div>

      <div style={{ padding: "6px 20px", display: "flex", gap: 6, overflowX: "auto" }}>
        {FILTROS.map((f) => (
          <div
            key={f.id}
            onClick={() => setFiltro(f.id)}
            className="chip-pill"
            style={
              filtro === f.id
                ? { background: "linear-gradient(120deg, var(--verde-esmeralda), var(--turquesa))", color: "#fff", borderColor: "transparent" }
                : ESTILO_CHIP_INACTIVO[f.id]
            }
          >
            {f.etiqueta}
          </div>
        ))}
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "8px 20px", display: "flex", flexDirection: "column", gap: 10 }}>
        {cargando && Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="skeleton" style={{ height: 68, borderRadius: 14 }} />
        ))}
        {!cargando && registros.length === 0 && (
          <EstadoVacio
            icono={<IconClock size={26} />}
            titulo={busqueda || filtro !== "todas" ? "Sin resultados" : "Aún no tienes clasificaciones"}
            descripcion={
              busqueda || filtro !== "todas"
                ? "Prueba con otro término o quita el filtro seleccionado."
                : "Escanea tu primer residuo y aquí aparecerá su historial."
            }
          />
        )}
        {!cargando && registros.map((registro, i) => {
          const estilo = ICONO_POR_CANECA[registro.caneca];
          return (
            <div key={registro.id} className="tarjeta" style={{ padding: 12, display: "flex", gap: 12, alignItems: "center", animation: "fila-entrada 0.28s cubic-bezier(0.22,1,0.36,1) backwards", animationDelay: `${Math.min(i, 8) * 0.03}s` }}>
              <IconBadge icono={estilo.icono} tamano={44} colorFondo={estilo.fondo} colorIcono={estilo.color} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{clasificar(registro.residuo)?.nombreVisible ?? registro.residuo.replace(/_/g, " ")}</div>
                <div style={{ fontSize: 12, color: "var(--texto-secundario)" }}>
                  {formatearFecha(registro.fecha)} · {Math.round(registro.confianza * 100)}%
                </div>
              </div>
              <button onClick={() => eliminar(registro.id)} style={{ border: "none", background: "transparent", color: "var(--rojo-alerta)", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                Eliminar
              </button>
            </div>
          );
        })}
      </div>

      <div style={{ padding: "6px 20px 14px" }}>
        <BotonPeligro onClick={vaciarTodo}>Vaciar historial</BotonPeligro>
      </div>

      <BottomNav />
    </div>
  );
}
