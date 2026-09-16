import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { IconAi, IconLeaf } from "../components/icons";

export function Splash() {
  const navigate = useNavigate();
  const { sesion } = useApp();

  useEffect(() => {
    const temporizador = setTimeout(() => {
      navigate(sesion ? "/inicio" : "/login", { replace: true });
    }, 2200);
    return () => clearTimeout(temporizador);
  }, [navigate, sesion]);

  return (
    <div
      className="pantalla-columna"
      style={{
        background: "var(--grad-splash)",
        color: "#fff",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        gap: 22,
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", width: 320, height: 320, borderRadius: "50%", background: "radial-gradient(circle, rgba(163,230,53,.28), transparent 70%)", top: "-6%", left: -100 }} />
      <div style={{ position: "absolute", width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,.16), transparent 70%)", bottom: "-8%", right: -90 }} />
      <span style={{ position: "absolute", width: 9, height: 9, borderRadius: "50%", background: "var(--verde-lima)", top: "20%", right: "18%", boxShadow: "0 0 14px 3px rgba(163,230,53,.7)" }} />
      <span style={{ position: "absolute", width: 6, height: 6, borderRadius: "50%", background: "#fff", top: "36%", left: "16%", opacity: 0.85 }} />
      <span style={{ position: "absolute", width: 6, height: 6, borderRadius: "50%", background: "var(--turquesa)", bottom: "30%", left: "26%", opacity: 0.75 }} />

      <div style={{ width: 104, height: 104, borderRadius: 24, background: "rgba(255,255,255,.16)", display: "flex", alignItems: "center", justifyContent: "center", animation: "splash-logo 0.5s cubic-bezier(0.22, 1, 0.36, 1), splash-glow 2.6s ease-in-out 0.5s infinite" }}>
        <div style={{ width: 78, height: 78, borderRadius: 18, background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", color: "var(--verde-oscuro)" }}>
          <IconLeaf size={40} />
          <span style={{ position: "absolute", bottom: -6, right: -6, background: "var(--grad-principal)", color: "#fff", borderRadius: "50%", padding: 5, boxShadow: "0 4px 10px rgba(0,0,0,.2)", display: "flex" }}>
            <IconAi size={16} />
          </span>
        </div>
      </div>

      <div style={{ animation: "splash-texto 0.5s ease 0.15s backwards" }}>
        <div style={{ fontFamily: "var(--font-d)", fontWeight: 700, fontSize: 27, letterSpacing: "-0.01em" }}>EcoClasifica IA</div>
        <div style={{ fontSize: 14, opacity: 0.92, marginTop: 8 }}>Clasificación inteligente para un futuro sostenible</div>
      </div>

      <div style={{ width: 34, height: 34, borderRadius: "50%", border: "3px solid rgba(255,255,255,.28)", borderTopColor: "#fff", animation: "girar 1s linear infinite" }} />
      <p style={{ position: "absolute", bottom: 34, margin: 0, fontSize: 11.5, opacity: 0.7 }}>Cargando un planeta más limpio...</p>
      <style>{`
        @keyframes girar { to { transform: rotate(360deg); } }
        @keyframes splash-glow {
          0%, 100% { box-shadow: 0 0 0 0 rgba(163, 230, 53, 0); }
          50% { box-shadow: 0 0 26px 6px rgba(163, 230, 53, 0.25); }
        }
      `}</style>
    </div>
  );
}
