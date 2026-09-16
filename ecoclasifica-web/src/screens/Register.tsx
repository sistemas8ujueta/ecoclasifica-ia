import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import * as auth from "../services/auth";
import { ROLES, type Rol } from "../types";
import { BannerError, BotonPrimario, BotonTexto, CampoPassword, CampoTexto, Chip, CasillaVerificacion, Tarjeta } from "../components/UI";
import { IconEdit, IconMail, IconLock, IconUser } from "../components/icons";

export function Register() {
  const navigate = useNavigate();
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [confirmar, setConfirmar] = useState("");
  const [rol, setRol] = useState<Rol>("Estudiante");
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [mensajeError, setMensajeError] = useState("");
  const [cargando, setCargando] = useState(false);

  async function manejarSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!aceptaTerminos) {
      setMensajeError("Debes aceptar los términos y la política de privacidad.");
      return;
    }
    setCargando(true);
    const resultado = await auth.registrar(nombre, correo, password, confirmar, rol);
    setCargando(false);
    if (!resultado.exito) {
      setMensajeError(resultado.mensaje);
      return;
    }
    navigate("/login", { replace: true });
  }

  return (
    <div className="pantalla-columna" style={{ background: "var(--grad-oscuro)", overflow: "hidden" }}>
      <div style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,.06)", top: -70, right: -60 }} />
      <div style={{ position: "absolute", width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,.05)", bottom: 40, left: -50 }} />
      <form onSubmit={manejarSubmit} style={{ padding: "34px 26px 28px", display: "flex", flexDirection: "column", gap: 12, position: "relative" }}>
        <div style={{ width: 58, height: 58, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--verde-oscuro)", alignSelf: "center", animation: "splash-logo 0.45s cubic-bezier(0.22, 1, 0.36, 1)" }}>
          <IconEdit size={26} />
        </div>
        <h1 style={{ fontFamily: "var(--font-d)", color: "#fff", textAlign: "center", fontSize: 23, margin: 0 }}>Crear cuenta</h1>
        <p style={{ color: "rgba(255,255,255,.88)", textAlign: "center", margin: 0, fontSize: 13.5 }}>Regístrate con tu correo institucional</p>

        <Tarjeta style={{ padding: "24px 22px", display: "flex", flexDirection: "column", gap: 12, marginTop: 8 }}>
          <CampoTexto icono={<IconUser size={18} />} placeholder="Nombre completo" value={nombre} onChange={(e) => setNombre(e.target.value)} autoComplete="name" />
          <CampoTexto icono={<IconMail size={18} />} type="email" placeholder="Correo electrónico" value={correo} onChange={(e) => setCorreo(e.target.value)} autoComplete="email" />
          <CampoPassword icono={<IconLock size={18} />} placeholder="Contraseña" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />
          <CampoPassword icono={<IconLock size={18} />} placeholder="Confirmar contraseña" value={confirmar} onChange={(e) => setConfirmar(e.target.value)} autoComplete="new-password" />

          <span style={{ fontSize: 12.5, fontWeight: 700, color: "var(--texto-secundario)" }}>Rol</span>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {ROLES.map((r) => (
              <Chip key={r} texto={r} activo={rol === r} onClick={() => setRol(r)} />
            ))}
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
            <CasillaVerificacion activo={aceptaTerminos} onChange={setAceptaTerminos} />
            <span style={{ fontSize: 12.5, color: "var(--texto-secundario)" }}>Acepto los términos y la política de privacidad.</span>
          </label>

          <BannerError mensaje={mensajeError} />

          <BotonPrimario type="submit" disabled={cargando}>{cargando ? "Creando cuenta..." : "Crear cuenta"}</BotonPrimario>
          <Link to="/login" style={{ textDecoration: "none" }}>
            <BotonTexto type="button" style={{ width: "100%" }}>Ya tengo una cuenta</BotonTexto>
          </Link>
        </Tarjeta>
      </form>
    </div>
  );
}
