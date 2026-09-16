import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import * as auth from "../services/auth";
import { BannerError, BotonPrimario, BotonTexto, CampoPassword, CampoTexto, CasillaVerificacion, Tarjeta } from "../components/UI";
import { IconLeaf, IconLock, IconMail } from "../components/icons";

export function Login() {
  const navigate = useNavigate();
  const { iniciarSesion: guardarSesion } = useApp();
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [recordar, setRecordar] = useState(false);
  const [mensajeError, setMensajeError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function manejarSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!correo.trim() || !password) {
      setMensajeError("Por favor completa correo y contraseña.");
      return;
    }
    setCargando(true);
    const resultado = await auth.iniciarSesion(correo, password);
    setCargando(false);
    if (!resultado.exito || !resultado.datos) {
      setMensajeError(resultado.mensaje);
      return;
    }
    guardarSesion(resultado.datos);
    navigate("/inicio", { replace: true });
  }

  return (
    <div className="pantalla-columna" style={{ background: "var(--grad-oscuro)", overflow: "hidden" }}>
      <div style={{ position: "absolute", width: 260, height: 260, borderRadius: "50%", background: "radial-gradient(circle, rgba(163,230,53,.28), transparent 70%)", top: -90, right: -80 }} />
      <div style={{ position: "absolute", width: 180, height: 180, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,255,255,.12), transparent 70%)", bottom: 70, left: -60 }} />
      <form onSubmit={manejarSubmit} style={{ padding: "40px 26px 30px", display: "flex", flexDirection: "column", gap: 14, position: "relative" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--verde-oscuro)", alignSelf: "center", boxShadow: "0 0 0 5px rgba(163,230,53,.22), 0 14px 30px rgba(0,0,0,.28)", animation: "splash-logo 0.45s cubic-bezier(0.22, 1, 0.36, 1)" }}>
          <IconLeaf size={30} />
        </div>
        <h1 style={{ fontFamily: "var(--font-d)", color: "#fff", textAlign: "center", fontSize: 23, margin: 0 }}>Bienvenido de nuevo</h1>
        <p style={{ color: "rgba(255,255,255,.88)", textAlign: "center", margin: 0, fontSize: 13.5 }}>Ingresa a la plataforma y continúa generando impacto.</p>

        <Tarjeta style={{ padding: "26px 22px", display: "flex", flexDirection: "column", gap: 13, marginTop: 8 }}>
          <CampoTexto icono={<IconMail size={18} />} type="email" placeholder="Correo electrónico" value={correo} onChange={(e) => setCorreo(e.target.value)} autoComplete="email" />
          <CampoPassword icono={<IconLock size={18} />} placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />

          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <CasillaVerificacion activo={recordar} onChange={setRecordar} />
            <span style={{ fontSize: 13, color: "var(--texto-secundario)" }}>Mantener sesión iniciada</span>
          </label>

          <BannerError mensaje={mensajeError} />

          <BotonPrimario type="submit" disabled={cargando}>{cargando ? "Ingresando..." : "Iniciar sesión"}</BotonPrimario>
          <Link to="/recuperar" style={{ textDecoration: "none" }}>
            <BotonTexto type="button" style={{ width: "100%" }}>¿Olvidaste tu contraseña?</BotonTexto>
          </Link>
        </Tarjeta>

        <div style={{ textAlign: "center", marginTop: 8, color: "rgba(255,255,255,.85)", fontSize: 13.5 }}>
          ¿No tienes cuenta?{" "}
          <Link to="/registro" style={{ color: "#fff", fontWeight: 700, textDecoration: "none" }}>Crear cuenta</Link>
        </div>
        <p style={{ textAlign: "center", marginTop: 18, color: "rgba(255,255,255,.55)", fontSize: 11.5 }}>
          Tecnología e inteligencia artificial al servicio de la sostenibilidad.
        </p>
      </form>
    </div>
  );
}
