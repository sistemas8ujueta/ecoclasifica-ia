import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import * as storage from "../services/storage";
import { useContador } from "../hooks/useContador";
import { BottomNav } from "../components/BottomNav";
import { IconBadge, IndicadorIA } from "../components/UI";
import { IconBell, IconChart, IconChevronRight, IconClock, IconLeaf, IconRecycle, IconScan } from "../components/icons";

const CONSEJOS = [
  "Separar los residuos en la fuente puede reducir hasta un 30% lo que termina en el relleno sanitario.",
  "Una botella de vidrio puede tardar hasta 4000 años en descomponerse si no se recicla.",
  "Reciclar una tonelada de papel salva alrededor de 17 árboles.",
  "Lavar y secar los envases antes de reciclarlos mejora la calidad del material recuperado.",
  "El aluminio se puede reciclar infinitas veces sin perder sus propiedades.",
  "Los residuos orgánicos compostados reducen la generación de metano en los rellenos sanitarios.",
];

const ACCESOS = [
  { ruta: "/aprende", titulo: "Aprende", descripcion: "Conoce cómo separar correctamente", icono: IconLeaf, colorIcono: "#fff", gradIcono: "linear-gradient(135deg, var(--verde-esmeralda), var(--turquesa))", fondoFila: "linear-gradient(120deg, #E8F6EE, #DFF3E7)" },
  { ruta: "/historial", titulo: "Historial", descripcion: "Consulta tus clasificaciones", icono: IconClock, colorIcono: "#0E2622", gradIcono: "var(--grad-turquesa)", fondoFila: "linear-gradient(120deg, #E5F8F6, #DAF3F0)" },
  { ruta: "/estadisticas", titulo: "Estadísticas", descripcion: "Mide tu impacto ambiental", icono: IconChart, colorIcono: "#12210C", gradIcono: "var(--grad-lima)", fondoFila: "linear-gradient(120deg, #F1F9DD, #E8F5CC)" },
];

function saludoDelMomento(): string {
  const hora = new Date().getHours();
  if (hora < 12) return "Buenos días";
  if (hora < 19) return "Buenas tardes";
  return "Buenas noches";
}

export function Home() {
  const navigate = useNavigate();
  const { sesion } = useApp();
  const consejo = useMemo(() => CONSEJOS[Math.floor(Math.random() * CONSEJOS.length)], []);
  const saludo = useMemo(() => saludoDelMomento(), []);
  const primerNombre = sesion?.nombre.split(" ")[0] ?? "usuario";
  const iniciales = sesion?.nombre.split(" ").slice(0, 2).map((p) => p[0]?.toUpperCase()).join("") ?? "";

  const [stats, setStats] = useState({ total: 0, blanca: 0, verde: 0, negra: 0 });
  const [cargado, setCargado] = useState(false);
  useEffect(() => {
    if (!sesion) return;
    let vigente = true;
    storage.obtenerEstadisticas(sesion.id).then((d) => { if (vigente) { setStats(d); setCargado(true); } });
    return () => { vigente = false; };
  }, [sesion]);

  const total = useContador(stats.total, cargado);
  const blanca = useContador(stats.blanca, cargado);
  const verde = useContador(stats.verde, cargado);
  const negra = useContador(stats.negra, cargado);

  return (
    <div className="pantalla-columna">
      <div style={{ flex: 1, overflowY: "auto", padding: "14px 20px 10px", display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-d)", fontSize: 21, margin: 0, fontWeight: 700 }}>{saludo}, {primerNombre} 👋</h1>
            <p style={{ margin: "3px 0 0", fontSize: 13.5, color: "var(--texto-secundario)" }}>Clasifiquemos correctamente nuestros residuos.</p>
          </div>
          <div className="inicio-acciones-cabecera">
            <button aria-label="Notificaciones" style={{ position: "relative", width: 38, height: 38, borderRadius: "50%", border: "1px solid var(--borde)", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--texto-secundario)", cursor: "pointer" }}>
              <IconBell size={16} />
              <span style={{ position: "absolute", top: 8, right: 9, width: 6, height: 6, borderRadius: "50%", background: "var(--rojo-alerta)", border: "1.5px solid #fff" }} />
            </button>
            <IconBadge icono={<span style={{ fontFamily: "var(--font-d)", fontWeight: 700, fontSize: 13 }}>{iniciales}</span>} tamano={38} colorFondo="var(--grad-principal)" colorIcono="#fff" />
          </div>
        </div>

        <div
          className="tarjeta-clicable"
          role="button"
          onClick={() => navigate("/escanear")}
          style={{ background: "var(--grad-principal)", borderRadius: 18, padding: 22, color: "#fff", position: "relative", overflow: "hidden", boxShadow: "var(--sombra-tarjeta)" }}
        >
          <div style={{ position: "absolute", width: 170, height: 170, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,.22), transparent 70%)", top: -60, right: -50 }} />
          <div style={{ position: "absolute", width: 110, height: 110, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,.12), transparent 70%)", bottom: -35, left: 15 }} />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ width: 46, height: 46, borderRadius: 14, background: "rgba(255,255,255,.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <IconScan size={24} />
            </div>
            <IndicadorIA texto="IA lista para analizar" color="rgba(255,255,255,.92)" />
          </div>
          <div style={{ fontFamily: "var(--font-d)", fontWeight: 700, fontSize: 18, marginTop: 14 }}>Clasifica un residuo con IA</div>
          <div style={{ fontSize: 12.5, opacity: 0.92, margin: "4px 0 16px", maxWidth: 260 }}>
            Usa la cámara para identificar el residuo y descubre en segundos dónde debes depositarlo.
          </div>
          <div style={{ background: "#fff", color: "var(--verde-oscuro)", display: "inline-flex", alignItems: "center", gap: 6, fontWeight: 700, fontSize: 12.5, padding: "11px 18px", borderRadius: "var(--radio-boton)" }}>
            Escanear residuo <IconChevronRight size={14} />
          </div>
        </div>

        <div>
          <div style={{ fontFamily: "var(--font-d)", fontWeight: 700, fontSize: 15, marginBottom: 10 }}>Tu impacto</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
            <MiniStat valor={total} etiqueta="Residuos" fondo="linear-gradient(160deg, var(--verde-esmeralda), var(--turquesa))" color="#fff" />
            <MiniStat valor={blanca} etiqueta="Aprovech." fondo="var(--grad-turquesa)" color="#0E2622" />
            <MiniStat valor={verde} etiqueta="Orgánicos" fondo="var(--grad-lima)" color="#12210C" />
            <MiniStat valor={negra} etiqueta="No aprov." fondo="var(--grad-carbon)" color="#fff" />
          </div>
        </div>

        <div>
          <div style={{ fontFamily: "var(--font-d)", fontWeight: 700, fontSize: 15, marginBottom: 10 }}>Accesos rápidos</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {ACCESOS.map((a, i) => (
              <FilaAcceso key={a.ruta} {...a} demora={i * 0.04} onClick={() => navigate(a.ruta)} />
            ))}
          </div>
        </div>

        <div style={{ borderRadius: 20, padding: 16, background: "linear-gradient(120deg, #0B2E28, var(--verde-esmeralda) 60%, var(--turquesa))", display: "flex", gap: 12, alignItems: "flex-start", color: "#fff", boxShadow: "0 14px 28px rgba(11,107,79,.3)" }}>
          <div style={{ width: 34, height: 34, borderRadius: 10, background: "rgba(255,255,255,.22)", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
            <IconRecycle size={18} />
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-d)", fontWeight: 700, fontSize: 13 }}>Consejo del día</div>
            <div style={{ fontSize: 12, opacity: 0.92, marginTop: 2 }}>{consejo}</div>
          </div>
        </div>
      </div>
      <BottomNav />
    </div>
  );
}

function MiniStat({ valor, etiqueta, fondo, color }: { valor: number; etiqueta: string; fondo: string; color: string }) {
  return (
    <div style={{ background: fondo, color, borderRadius: 14, padding: "10px 6px", textAlign: "center", boxShadow: "0 10px 20px rgba(11,107,79,.16)" }}>
      <div style={{ fontFamily: "var(--font-d)", fontWeight: 700, fontSize: 18 }}>{valor}</div>
      <div style={{ fontSize: 9.5, opacity: 0.85, marginTop: 2 }}>{etiqueta}</div>
    </div>
  );
}

function FilaAcceso({ titulo, descripcion, icono: Icono, colorIcono, gradIcono, fondoFila, onClick, demora = 0 }: {
  titulo: string; descripcion: string; icono: React.ComponentType<{ size?: number }>; colorIcono: string; gradIcono: string; fondoFila: string; onClick: () => void; demora?: number;
}) {
  return (
    <div
      onClick={onClick}
      className="tarjeta-clicable"
      style={{ display: "flex", alignItems: "center", gap: 13, padding: "13px 14px", borderRadius: 16, background: fondoFila, boxShadow: "var(--sombra-tarjeta-sm)", animation: "fila-entrada 0.3s cubic-bezier(0.22,1,0.36,1) backwards", animationDelay: `${demora}s` }}
    >
      <div style={{ width: 42, height: 42, borderRadius: 13, background: gradIcono, color: colorIcono, display: "flex", alignItems: "center", justifyContent: "center", flex: "none", boxShadow: "0 8px 16px rgba(11,107,79,.22)" }}>
        <Icono size={19} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 13.5 }}>{titulo}</div>
        <div style={{ fontSize: 11.5, color: "var(--texto-secundario)" }}>{descripcion}</div>
      </div>
      <IconChevronRight size={16} color="var(--verde-esmeralda)" />
    </div>
  );
}
