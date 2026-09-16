import { useNavigate } from "react-router-dom";
import { BotonSecundario } from "../components/UI";
import { IconRecycle, IconUser } from "../components/icons";

export function About() {
  const navigate = useNavigate();
  return (
    <div className="pantalla-columna" style={{ background: "var(--grad-oscuro)", padding: "46px 26px 30px", color: "#fff" }}>
      <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--verde-oscuro)", alignSelf: "center", margin: "0 auto 16px" }}>
        <IconRecycle size={30} />
      </div>
      <h1 style={{ fontFamily: "var(--font-d)", textAlign: "center", fontSize: 20, margin: 0 }}>EcoClasifica IA</h1>
      <p style={{ textAlign: "center", fontSize: 13.5, opacity: 0.88, margin: "10px 0 20px" }}>
        Proyecto académico de la Corporación Universitaria Reformada de Barranquilla
      </p>

      <div className="tarjeta" style={{ padding: 20, color: "var(--gris-oscuro)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#E8F6F0", color: "var(--verde-oscuro)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <IconUser size={14} />
          </div>
          <span style={{ fontFamily: "var(--font-d)", fontWeight: 700, color: "var(--verde-oscuro)" }}>Autores</span>
        </div>
        <p style={{ margin: "0 0 10px", fontSize: 14 }}>
          Martínez Regino Yetit Vanesa<br />
          Rodríguez Sierra Daniel Andrés
        </p>
        <p style={{ margin: 0, fontSize: 13, color: "var(--texto-secundario)" }}>Año: 2026</p>
      </div>

      <div style={{ marginTop: 22 }}>
        <BotonSecundario style={{ background: "#fff" }} onClick={() => navigate(-1)}>Volver</BotonSecundario>
      </div>
    </div>
  );
}
