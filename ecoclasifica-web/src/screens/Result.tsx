import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useToast } from "../components/Toast";
import { clasificar } from "../data/canecas";
import * as storage from "../services/storage";
import { BarraConfianza, IconBadge, BotonPrimario, BotonSecundario, BotonTexto } from "../components/UI";
import { IconBin, IconCheck, IconWarning } from "../components/icons";

const MENSAJE_NO_RECONOCIDO =
  "No pudimos identificar el residuo. Intenta acercarlo, mejorar la iluminación o tomar otra fotografía.";

const DEGRADADOS_POR_CANECA: Record<string, [string, string]> = {
  blanca: ["#9BAAA1", "#5F6F66"],
  verde: ["#10B981", "#065F46"],
  negra: ["#3A4640", "#17211B"],
};

const CATEGORIA_POR_CANECA: Record<string, string> = {
  blanca: "Aprovechable",
  verde: "Orgánico",
  negra: "No aprovechable",
};

export function Result() {
  const navigate = useNavigate();
  const { ultimoResultado, sesion } = useApp();
  const { mostrarToast } = useToast();
  const [guardado, setGuardado] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mostrarPorque, setMostrarPorque] = useState(false);

  useEffect(() => {
    if (!ultimoResultado) navigate("/inicio", { replace: true });
  }, [ultimoResultado, navigate]);

  if (!ultimoResultado) return null;

  const { reconocido, residuo, confianza, caneca } = ultimoResultado;
  const info = residuo ? clasificar(residuo) : undefined;
  const [colorArriba, colorAbajo] = caneca ? DEGRADADOS_POR_CANECA[caneca] : DEGRADADOS_POR_CANECA.verde;
  const porcentaje = Math.round(confianza * 100);

  async function guardarResultado() {
    if (!reconocido || !residuo || !caneca || !sesion) return;
    setGuardando(true);
    await storage.guardarClasificacion({ usuarioId: sesion.id, residuo, confianza, caneca });
    setGuardando(false);
    setGuardado(true);
    mostrarToast("Resultado guardado en tu historial.");
  }

  return (
    <div className="pantalla-columna" style={{ padding: "30px 22px 24px", gap: 14, overflowY: "auto" }}>
      <h1 style={{ fontFamily: "var(--font-d)", fontSize: 21, margin: 0 }}>{reconocido ? "Residuo identificado" : "Sin identificar"}</h1>

      <div className="tarjeta" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
        <div style={{ display: "flex", gap: 13, alignItems: "center" }}>
          <div style={{ position: "relative", width: 54, height: 54, flex: "none" }}>
            {reconocido && (
              <div style={{ position: "absolute", inset: -6, borderRadius: "50%", background: "conic-gradient(var(--verde-lima), var(--turquesa), var(--verde-esmeralda), var(--verde-lima))", opacity: 0.35, filter: "blur(3px)" }} />
            )}
            <IconBadge
              icono={reconocido ? <IconCheck size={22} /> : <IconWarning size={22} />}
              tamano={54}
              colorFondo={reconocido ? "linear-gradient(135deg, var(--verde-esmeralda), var(--verde-lima))" : "rgba(192,57,43,.16)"}
              colorIcono={reconocido ? "#fff" : "var(--rojo-alerta)"}
              style={{ position: "relative", boxShadow: reconocido ? "0 12px 24px rgba(11,107,79,.32)" : "none", animation: "resultado-pop 0.32s cubic-bezier(0.22, 1, 0.36, 1)" }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "var(--font-d)", fontWeight: 700, fontSize: 18 }}>
              {reconocido ? info?.nombreVisible ?? residuo : "Residuo no identificado"}
            </div>
            {reconocido && info && (
              <span style={{ display: "inline-block", marginTop: 6, fontSize: 10.5, fontWeight: 800, padding: "5px 11px", borderRadius: 999, background: "#EDEFEE", color: "#3A4640" }}>
                {CATEGORIA_POR_CANECA[info.caneca]}
              </span>
            )}
          </div>
        </div>

        {reconocido && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 700, color: "var(--verde-oscuro)", marginBottom: 6 }}>
              <span>Confianza</span><span>{porcentaje}%</span>
            </div>
            <BarraConfianza porcentaje={porcentaje} />
          </div>
        )}

        {reconocido && (
          <div style={{ borderRadius: 16, padding: 17, display: "flex", gap: 13, alignItems: "center", background: `linear-gradient(135deg, ${colorArriba}, ${colorAbajo})`, color: "#fff", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", width: 90, height: 90, borderRadius: "50%", background: "rgba(255,255,255,.14)", top: -30, right: -20 }} />
            <IconBadge icono={<IconBin size={20} />} tamano={44} colorFondo="#fff" colorIcono="var(--gris-oscuro)" style={{ position: "relative" }} />
            <div style={{ position: "relative" }}>
              <div style={{ fontSize: 11, opacity: 0.85 }}>Deposítalo en</div>
              <div style={{ fontFamily: "var(--font-d)", fontWeight: 700, fontSize: 16, letterSpacing: "0.02em" }}>
                {caneca === "blanca" ? "CANECA BLANCA" : caneca === "verde" ? "CANECA VERDE" : "CANECA NEGRA"}
              </div>
            </div>
          </div>
        )}

        {!reconocido && (
          <p style={{ margin: 0, fontSize: 13, color: "var(--texto-secundario)" }}>{MENSAJE_NO_RECONOCIDO}</p>
        )}
        {reconocido && mostrarPorque && (
          <p style={{ margin: 0, fontSize: 13, color: "var(--texto-secundario)" }}>{info?.explicacion}</p>
        )}
      </div>

      {reconocido && !guardado && (
        <BotonPrimario onClick={guardarResultado} disabled={guardando}>{guardando ? "Guardando..." : "Guardar resultado"}</BotonPrimario>
      )}
      {guardado && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, color: "var(--verde-oscuro)", fontWeight: 700, fontSize: 13, padding: "13px 0" }}>
          <IconBadge icono={<IconCheck size={13} />} tamano={22} colorFondo="var(--verde)" colorIcono="#fff" />
          Guardado en tu historial
        </div>
      )}
      <BotonSecundario onClick={() => navigate("/escanear")}>Escanear otro residuo</BotonSecundario>
      {reconocido && (
        <BotonTexto style={{ width: "100%" }} onClick={() => setMostrarPorque((v) => !v)}>
          {mostrarPorque ? "Ocultar explicación" : "Ver por qué"}
        </BotonTexto>
      )}
      <BotonTexto style={{ width: "100%", color: "#7A857E" }} onClick={() => navigate("/inicio")}>Volver al inicio</BotonTexto>
    </div>
  );
}
