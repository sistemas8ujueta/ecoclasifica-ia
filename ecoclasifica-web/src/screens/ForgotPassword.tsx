import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as auth from "../services/auth";
import { BotonPrimario, BotonTexto, CampoPassword, CampoTexto, Tarjeta } from "../components/UI";
import { IconCheck, IconLock, IconMail } from "../components/icons";

type Paso = "correo" | "codigo" | "nueva_password";

export function ForgotPassword() {
  const navigate = useNavigate();
  const [paso, setPaso] = useState<Paso>("correo");
  const [correo, setCorreo] = useState("");
  const [codigo, setCodigo] = useState("");
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [codigoGenerado, setCodigoGenerado] = useState("");
  const [usuarioId, setUsuarioId] = useState("");
  const [instrucciones, setInstrucciones] = useState("Ingresa tu correo y te generaremos un código de verificación local.");
  const [mensaje, setMensaje] = useState("");
  const [esError, setEsError] = useState(false);

  async function continuar(e: React.FormEvent) {
    e.preventDefault();

    if (paso === "correo") {
      const resultado = await auth.solicitarRecuperacion(correo);
      if (!resultado.exito || !resultado.datos) {
        setMensaje(resultado.mensaje);
        setEsError(true);
        return;
      }
      setCodigoGenerado(resultado.datos.codigo);
      setUsuarioId(resultado.datos.usuarioId);
      setInstrucciones(
        `Código de verificación generado: ${resultado.datos.codigo} (en una versión conectada a un servicio de correo, este código se enviaría a tu bandeja de entrada).`,
      );
      setPaso("codigo");
      setMensaje("");
    } else if (paso === "codigo") {
      if (codigo.trim() !== codigoGenerado) {
        setMensaje("El código ingresado no es correcto.");
        setEsError(true);
        return;
      }
      setPaso("nueva_password");
      setMensaje("");
    } else {
      const resultado = await auth.restablecerPassword(usuarioId, nuevaPassword);
      setMensaje(resultado.mensaje);
      setEsError(!resultado.exito);
      if (resultado.exito) {
        setTimeout(() => navigate("/login", { replace: true }), 900);
      }
    }
  }

  const textoBoton = paso === "correo" ? "Enviar código" : paso === "codigo" ? "Verificar código" : "Guardar nueva contraseña";

  return (
    <div className="pantalla-columna" style={{ background: "var(--grad-oscuro)", overflow: "hidden" }}>
      <div style={{ position: "absolute", width: 200, height: 200, borderRadius: "50%", background: "rgba(255,255,255,.06)", top: -70, right: -60 }} />
      <div style={{ position: "absolute", width: 140, height: 140, borderRadius: "50%", background: "rgba(255,255,255,.05)", bottom: 40, left: -50 }} />
      <form onSubmit={continuar} style={{ padding: "46px 26px 30px", display: "flex", flexDirection: "column", gap: 14, position: "relative" }}>
        <div style={{ width: 60, height: 60, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--verde-oscuro)", alignSelf: "center", animation: "splash-logo 0.45s cubic-bezier(0.22, 1, 0.36, 1)" }}>
          <IconLock size={26} />
        </div>
        <h1 style={{ fontFamily: "var(--font-d)", color: "#fff", textAlign: "center", fontSize: 23, margin: 0 }}>Recuperar contraseña</h1>

        <Tarjeta style={{ padding: "24px 22px", display: "flex", flexDirection: "column", gap: 14, marginTop: 8 }}>
          <p style={{ margin: 0, fontSize: 13.5, color: "var(--texto-secundario)" }}>{instrucciones}</p>

          {paso === "correo" && (
            <CampoTexto icono={<IconMail size={18} />} type="email" placeholder="Correo electrónico" value={correo} onChange={(e) => setCorreo(e.target.value)} />
          )}
          {paso === "codigo" && (
            <CampoTexto icono={<IconCheck size={18} />} placeholder="Código de verificación (6 dígitos)" value={codigo} onChange={(e) => setCodigo(e.target.value)} />
          )}
          {paso === "nueva_password" && (
            <CampoPassword icono={<IconLock size={18} />} placeholder="Nueva contraseña" value={nuevaPassword} onChange={(e) => setNuevaPassword(e.target.value)} />
          )}

          {mensaje && (
            <p style={{ margin: 0, fontSize: 13, color: esError ? "var(--rojo-alerta)" : "var(--verde-oscuro)" }}>{mensaje}</p>
          )}

          <BotonPrimario type="submit">{textoBoton}</BotonPrimario>
          <BotonTexto type="button" style={{ width: "100%" }} onClick={() => navigate("/login")}>Volver al inicio de sesión</BotonTexto>
        </Tarjeta>
      </form>
    </div>
  );
}
