import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import * as storage from "../services/storage";
import type { Periodo } from "../services/storage";
import { clasificar } from "../data/canecas";
import { useContador } from "../hooks/useContador";
import { BottomNav } from "../components/BottomNav";
import { EncabezadoDegradado, IconBadge, Tarjeta } from "../components/UI";
import { IconAward, IconBin, IconChart, IconDroplet, IconLeaf, IconRecycle, IconTree, IconTrendUp } from "../components/icons";

const ESTADISTICAS_VACIAS = { total: 0, blanca: 0, verde: 0, negra: 0, confianzaPromedio: null as number | null, residuoMasFrecuente: null as string | null };
const PERIODOS: { id: Periodo; etiqueta: string }[] = [
  { id: "semana", etiqueta: "Semana" },
  { id: "mes", etiqueta: "Mes" },
  { id: "todo", etiqueta: "Todo" },
];

export function Statistics() {
  const { sesion } = useApp();
  const [periodo, setPeriodo] = useState<Periodo>("todo");
  const [stats, setStats] = useState(ESTADISTICAS_VACIAS);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!sesion) return;
    let vigente = true;
    setCargando(true);
    storage.obtenerEstadisticas(sesion.id, periodo).then((datos) => {
      if (!vigente) return;
      setStats(datos);
      setCargando(false);
    });
    return () => { vigente = false; };
  }, [sesion, periodo]);

  const totalAnimado = useContador(stats.total, !cargando);
  const blancaAnimada = useContador(stats.blanca, !cargando);
  const verdeAnimada = useContador(stats.verde, !cargando);
  const negraAnimada = useContador(stats.negra, !cargando);

  const total = stats.total || 1;
  const pctBlanca = Math.round((100 * stats.blanca) / total);
  const pctVerde = Math.round((100 * stats.verde) / total);
  const pctNegra = Math.round((100 * stats.negra) / total);

  const arboles = Math.floor(stats.total / 80);
  const agua = Math.round(stats.total * 0.17);
  const co2 = Math.round(stats.total * 0.05 * 10) / 10;

  const circunferencia = 2 * Math.PI * 50;
  const segBlanca = (stats.blanca / total) * circunferencia;
  const segVerde = (stats.verde / total) * circunferencia;
  const segNegra = (stats.negra / total) * circunferencia;

  const residuoFrecuente = stats.residuoMasFrecuente ? clasificar(stats.residuoMasFrecuente)?.nombreVisible ?? stats.residuoMasFrecuente : "—";

  return (
    <div className="pantalla-columna">
      <EncabezadoDegradado titulo="Impacto ambiental" subtitulo="Precisión y contribución de tus clasificaciones" />

      <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 14px", display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", gap: 6 }}>
          {PERIODOS.map((p) => (
            <div key={p.id} className={`chip-pill ${periodo === p.id ? "activo" : ""}`} onClick={() => setPeriodo(p.id)}>
              {p.etiqueta}
            </div>
          ))}
        </div>

        {cargando ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 92, borderRadius: 14 }} />)}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <TarjetaStat icono={<IconChart size={18} />} colorIcono="#fff" fondoIcono="rgba(255,255,255,.22)" fondo="linear-gradient(150deg, var(--verde-esmeralda), var(--turquesa))" colorTexto="#fff" etiqueta="Total escaneados" valor={totalAnimado} />
            <TarjetaStat icono={<IconRecycle size={18} />} colorIcono="#0E2622" fondoIcono="rgba(255,255,255,.5)" fondo="var(--grad-turquesa)" colorTexto="#0E2622" etiqueta="Aprovechables" valor={blancaAnimada} />
            <TarjetaStat icono={<IconLeaf size={18} />} colorIcono="#12210C" fondoIcono="rgba(255,255,255,.45)" fondo="var(--grad-lima)" colorTexto="#12210C" etiqueta="Orgánicos" valor={verdeAnimada} />
            <TarjetaStat icono={<IconBin size={18} />} colorIcono="#fff" fondoIcono="rgba(255,255,255,.16)" fondo="var(--grad-carbon)" colorTexto="#fff" etiqueta="No aprovechables" valor={negraAnimada} />
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Tarjeta style={{ padding: 14 }}>
            <IconBadge icono={<IconTrendUp size={16} />} tamano={32} colorFondo="#E8F5FF" colorIcono="#0369A1" />
            <div style={{ fontSize: 11, color: "var(--texto-secundario)", marginTop: 8 }}>Precisión promedio de IA</div>
            <div style={{ fontFamily: "var(--font-d)", fontWeight: 700, fontSize: 19 }}>{stats.confianzaPromedio !== null ? `${stats.confianzaPromedio}%` : "—"}</div>
          </Tarjeta>
          <Tarjeta style={{ padding: 14 }}>
            <IconBadge icono={<IconRecycle size={16} />} tamano={32} colorFondo="#FDF1E0" colorIcono="#B45309" />
            <div style={{ fontSize: 11, color: "var(--texto-secundario)", marginTop: 8 }}>Residuo más clasificado</div>
            <div style={{ fontFamily: "var(--font-d)", fontWeight: 700, fontSize: 14, marginTop: 2 }}>{residuoFrecuente}</div>
          </Tarjeta>
        </div>

        <Tarjeta style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", gap: 18, alignItems: "center" }}>
            <div style={{ position: "relative", width: 112, height: 112, flex: "none" }}>
              <svg viewBox="0 0 120 120" width={112} height={112} style={{ transform: "rotate(-90deg)" }}>
                <defs>
                  <linearGradient id="donaBlanca" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#8C9A91" /><stop offset="1" stopColor="#5C6D65" /></linearGradient>
                  <linearGradient id="donaVerde" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#A3E635" /><stop offset="1" stopColor="#0B6B4F" /></linearGradient>
                  <linearGradient id="donaNegra" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#3A4640" /><stop offset="1" stopColor="#0E1613" /></linearGradient>
                </defs>
                <circle cx="60" cy="60" r="50" fill="none" stroke="#EEF2F0" strokeWidth={16} />
                {stats.total > 0 && (
                  <>
                    <circle cx="60" cy="60" r="50" fill="none" stroke="url(#donaBlanca)" strokeWidth={16} strokeLinecap="round"
                      strokeDasharray={`${segBlanca} ${circunferencia - segBlanca}`} strokeDashoffset={0}
                      style={{ transition: "stroke-dasharray 0.8s cubic-bezier(0.22,1,0.36,1)", filter: "drop-shadow(0 0 4px rgba(92,109,101,.35))" }} />
                    <circle cx="60" cy="60" r="50" fill="none" stroke="url(#donaVerde)" strokeWidth={16} strokeLinecap="round"
                      strokeDasharray={`${segVerde} ${circunferencia - segVerde}`} strokeDashoffset={-segBlanca}
                      style={{ transition: "stroke-dasharray 0.8s cubic-bezier(0.22,1,0.36,1)", filter: "drop-shadow(0 0 6px rgba(163,230,53,.5))" }} />
                    <circle cx="60" cy="60" r="50" fill="none" stroke="url(#donaNegra)" strokeWidth={16} strokeLinecap="round"
                      strokeDasharray={`${segNegra} ${circunferencia - segNegra}`} strokeDashoffset={-(segBlanca + segVerde)}
                      style={{ transition: "stroke-dasharray 0.8s cubic-bezier(0.22,1,0.36,1)" }} />
                  </>
                )}
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontFamily: "var(--font-d)", fontWeight: 700, fontSize: 21 }}>{totalAnimado}</span>
                <span style={{ fontSize: 10, color: "var(--texto-secundario)" }}>total</span>
              </div>
            </div>
            <div style={{ fontFamily: "var(--font-d)", fontWeight: 700, fontSize: 13, flex: 1 }}>Distribución por caneca</div>
          </div>
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap" }}>
            <Leyenda fondo="linear-gradient(120deg, #EDEFEE, #DCE1DE)" color="#3A4640" texto="Blanca" valor={pctBlanca} />
            <Leyenda fondo="linear-gradient(120deg, var(--verde-esmeralda), var(--verde-lima))" color="#fff" texto="Verde" valor={pctVerde} />
            <Leyenda fondo="var(--grad-carbon)" color="#fff" texto="Negra" valor={pctNegra} />
          </div>
        </Tarjeta>

        <div style={{ borderRadius: 20, background: "var(--grad-oscuro)", color: "#fff", padding: 16, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", width: 160, height: 160, borderRadius: "50%", background: "radial-gradient(circle, rgba(163,230,53,.28), transparent 70%)", top: -55, right: -40 }} />
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontFamily: "var(--font-d)", fontWeight: 700, fontSize: 13.5, position: "relative" }}>
            <IconAward size={18} /> Tu contribución (estimado)
          </div>
          <div style={{ display: "flex", gap: 10, marginTop: 12, position: "relative" }}>
            <Pildora icono={<IconTree size={20} color="var(--verde-lima)" />} valor={String(arboles)} etiqueta="árboles" />
            <Pildora icono={<IconDroplet size={20} color="var(--turquesa)" />} valor={`${agua}L`} etiqueta="agua" />
            <Pildora icono={<IconRecycle size={20} />} valor={`${co2}kg`} etiqueta="CO2" />
          </div>
          <p style={{ margin: "11px 0 0", fontSize: 10, opacity: 0.72, lineHeight: 1.4, position: "relative" }}>
            Equivalencias estimadas de referencia, no provienen de una medición científica directa.
          </p>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function TarjetaStat({ icono, colorIcono, fondoIcono, fondo, colorTexto, etiqueta, valor }: {
  icono: React.ReactNode; colorIcono: string; fondoIcono: string; fondo: string; colorTexto: string; etiqueta: string; valor: number;
}) {
  return (
    <div style={{ borderRadius: 18, padding: 14, background: fondo, color: colorTexto, boxShadow: "0 10px 22px rgba(11,107,79,.16)" }}>
      <IconBadge icono={icono} tamano={36} colorFondo={fondoIcono} colorIcono={colorIcono} />
      <div style={{ fontSize: 11, opacity: 0.85, marginTop: 9 }}>{etiqueta}</div>
      <div style={{ fontFamily: "var(--font-d)", fontWeight: 700, fontSize: 26 }}>{valor}</div>
    </div>
  );
}

function Leyenda({ fondo, color, texto, valor }: { fondo: string; color: string; texto: string; valor: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 11.5, fontWeight: 700, background: fondo, color, borderRadius: 999, padding: "7px 12px" }}>
      <span>{texto} · {valor}%</span>
    </div>
  );
}

function Pildora({ icono, valor, etiqueta }: { icono: React.ReactNode; valor: string; etiqueta: string }) {
  return (
    <div style={{ flex: 1, background: "rgba(255,255,255,.14)", borderRadius: 14, padding: 10, textAlign: "center" }}>
      <div style={{ display: "flex", justifyContent: "center" }}>{icono}</div>
      <div style={{ fontFamily: "var(--font-d)", fontWeight: 700, fontSize: 15, marginTop: 4 }}>{valor}</div>
      <div style={{ fontSize: 10, opacity: 0.85 }}>{etiqueta}</div>
    </div>
  );
}
