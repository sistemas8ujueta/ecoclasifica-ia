import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import { useToast } from "../components/Toast";
import * as auth from "../services/auth";
import * as storage from "../services/storage";
import { ROLES, type Rol } from "../types";
import { BottomNav } from "../components/BottomNav";
import { BotonPeligro, BotonPrimario, CampoPassword, IconBadge } from "../components/UI";
import { IconAward, IconChevronRight, IconEdit, IconGrid, IconHelp, IconInfo, IconLock, IconLogout, IconShield, IconUsers, IconX } from "../components/icons";

const MENU = [
  { id: "editar", titulo: "Editar perfil", icono: <IconEdit size={17} />, color: "var(--verde-oscuro)", fondo: "#E8F6F0" },
  { id: "password", titulo: "Cambiar contraseña", icono: <IconLock size={17} />, color: "#0369A1", fondo: "#E8F5FF" },
  { id: "panel", titulo: "Panel institucional", icono: <IconGrid size={17} />, color: "#0369A1", fondo: "#E8F5FF" },
  { id: "usuarios", titulo: "Usuarios registrados", icono: <IconUsers size={17} />, color: "#B45309", fondo: "#FDF1E0" },
  { id: "privacidad", titulo: "Privacidad", icono: <IconShield size={17} />, color: "#9A6400", fondo: "#FFF3E0" },
  { id: "ayuda", titulo: "Ayuda", icono: <IconHelp size={17} />, color: "#7C3AED", fondo: "#F3ECFB" },
  { id: "acerca", titulo: "Acerca de", icono: <IconInfo size={17} />, color: "var(--gris-oscuro)", fondo: "#EDEFEE" },
];

export function Profile() {
  const navigate = useNavigate();
  const { sesion, cerrarSesion, actualizarSesion } = useApp();
  const { mostrarToast } = useToast();
  const [modal, setModal] = useState<string | null>(null);
  const [totalClasificaciones, setTotalClasificaciones] = useState<number | null>(null);

  useEffect(() => {
    if (!sesion) return;
    let vigente = true;
    storage.obtenerEstadisticas(sesion.id).then((d) => { if (vigente) setTotalClasificaciones(d.total); });
    return () => { vigente = false; };
  }, [sesion]);

  if (!sesion) return null;
  const iniciales = sesion.nombre.split(" ").slice(0, 2).map((p) => p[0]?.toUpperCase()).join("");

  function manejarClickMenu(id: string) {
    if (id === "acerca") navigate("/acerca-de");
    else if (id === "usuarios") navigate("/usuarios");
    else if (id === "panel") navigate("/panel");
    else setModal(id);
  }

  function salir() {
    cerrarSesion();
    navigate("/login", { replace: true });
  }

  return (
    <div className="pantalla-columna">
      <div style={{ height: 150, background: "var(--grad-oscuro)", position: "relative", flex: "none" }}>
        <div style={{ padding: "20px 22px", color: "#fff", fontFamily: "var(--font-d)", fontWeight: 700, fontSize: 17 }}>Mi perfil</div>
        <div style={{ position: "absolute", bottom: -32, left: "50%", transform: "translateX(-50%)", width: 74, height: 74, borderRadius: "50%", background: "#fff", padding: 4 }}>
          <div style={{ width: "100%", height: "100%", borderRadius: "50%", background: "var(--grad-principal)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontFamily: "var(--font-d)", fontWeight: 700, fontSize: 20 }}>
            {iniciales}
          </div>
        </div>
      </div>

      <div style={{ flex: 1, overflowY: "auto", padding: "42px 20px 20px", display: "flex", flexDirection: "column", gap: 12, alignItems: "center", textAlign: "center" }}>
        <div>
          <div style={{ fontFamily: "var(--font-d)", fontWeight: 700, fontSize: 16 }}>{sesion.nombre}</div>
          <div style={{ fontSize: 13, color: "var(--texto-secundario)" }}>{sesion.correo}</div>
          <span className="chip-pill activo" style={{ marginTop: 8, display: "inline-block", cursor: "default" }}>{sesion.rol}</span>
        </div>

        <div className="tarjeta" style={{ width: "100%", padding: 14, display: "flex", alignItems: "center", gap: 12, textAlign: "left" }}>
          <IconBadge icono={<IconAward size={18} />} tamano={40} colorFondo="#E8F6F0" colorIcono="var(--verde-oscuro)" />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11.5, color: "var(--texto-secundario)" }}>Mi contribución</div>
            <div style={{ fontFamily: "var(--font-d)", fontWeight: 700, fontSize: 16 }}>
              {totalClasificaciones ?? "—"} clasificaciones realizadas
            </div>
          </div>
        </div>

        <div className="tarjeta" style={{ width: "100%", padding: 6, textAlign: "left" }}>
          {MENU.map((item) => (
            <div key={item.id} onClick={() => manejarClickMenu(item.id)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 8px", cursor: "pointer" }}>
              <div style={{ width: 34, height: 34, borderRadius: 11, background: item.fondo, color: item.color, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {item.icono}
              </div>
              <span style={{ flex: 1, fontWeight: 600, fontSize: 12.5 }}>{item.titulo}</span>
              <IconChevronRight size={14} color="#B9C2BD" />
            </div>
          ))}
        </div>

        <BotonPeligro icono={<IconLogout size={16} />} onClick={salir}>Cerrar sesión</BotonPeligro>
      </div>

      {modal === "editar" && <ModalEditarPerfil onCerrar={() => setModal(null)} nombreActual={sesion.nombre} rolActual={sesion.rol}
        onGuardar={async (nombre, rol) => {
          await storage.actualizarPerfil(sesion.id, nombre, rol);
          actualizarSesion({ nombre, rol });
          setModal(null);
          mostrarToast("Perfil actualizado.");
        }} />}
      {modal === "password" && <ModalCambiarPassword onCerrar={() => setModal(null)} onExito={() => mostrarToast("Contraseña actualizada.")} />}
      {modal === "privacidad" && (
        <Modal titulo="Privacidad y permisos" onCerrar={() => setModal(null)}>
          <p style={{ fontSize: 13.5, lineHeight: 1.6 }}>
            Esta aplicación solicita acceso a tu cámara únicamente para fotografiar el residuo que deseas clasificar, y acceso a
            imágenes solo cuando eliges seleccionar una foto de la galería. Las fotografías solo se conservan si tú decides
            guardarlas en tu historial. Tus datos de cuenta (nombre, correo y contraseña) se almacenan localmente en tu
            navegador y la contraseña nunca se guarda en texto plano.
          </p>
        </Modal>
      )}
      {modal === "ayuda" && (
        <Modal titulo="Ayuda" onCerrar={() => setModal(null)}>
          <p style={{ fontSize: 13.5, lineHeight: 1.6 }}>
            ¿Cómo clasificar un residuo? Ve a la pestaña Escanear, toma una foto del residuo y la IA te dirá en qué caneca va.<br /><br />
            ¿El resultado no fue correcto? Puedes volver a escanear con mejor luz o desde otro ángulo.<br /><br />
            ¿Dudas sobre una caneca? Revisa la sección Aprende desde el inicio para ver ejemplos de cada categoría.
          </p>
        </Modal>
      )}

      <BottomNav />
    </div>
  );
}

function Modal({ titulo, children, onCerrar }: { titulo: string; children: React.ReactNode; onCerrar: () => void }) {
  return (
    <div className="modal-fondo" onClick={onCerrar}>
      <div className="tarjeta modal-tarjeta" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontFamily: "var(--font-d)", fontSize: 16.5 }}>{titulo}</h3>
          <button className="modal-cerrar" onClick={onCerrar} aria-label="Cerrar">
            <IconX size={16} />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ModalEditarPerfil({ nombreActual, rolActual, onCerrar, onGuardar }: { nombreActual: string; rolActual: Rol; onCerrar: () => void; onGuardar: (nombre: string, rol: Rol) => void }) {
  const [nombre, setNombre] = useState(nombreActual);
  const [rol, setRol] = useState<Rol>(rolActual);
  return (
    <Modal titulo="Editar perfil" onCerrar={onCerrar}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <input className="campo" style={{ padding: "0 14px" }} value={nombre} onChange={(e) => setNombre(e.target.value)} />
        <select className="campo" style={{ padding: "0 14px" }} value={rol} onChange={(e) => setRol(e.target.value as Rol)}>
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <BotonPrimario onClick={() => onGuardar(nombre.trim(), rol)}>Guardar cambios</BotonPrimario>
      </div>
    </Modal>
  );
}

function ModalCambiarPassword({ onCerrar, onExito }: { onCerrar: () => void; onExito: () => void }) {
  const { sesion } = useApp();
  const [actual, setActual] = useState("");
  const [nueva, setNueva] = useState("");
  const [error, setError] = useState("");
  const [guardando, setGuardando] = useState(false);

  async function guardar() {
    if (!sesion) return;
    setGuardando(true);
    const resultado = await auth.cambiarPassword(sesion.id, actual, nueva);
    setGuardando(false);
    if (!resultado.exito) {
      setError(resultado.mensaje);
      return;
    }
    onCerrar();
    onExito();
  }

  return (
    <Modal titulo="Cambiar contraseña" onCerrar={onCerrar}>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <CampoPassword icono={<IconLock size={18} />} placeholder="Contraseña actual" value={actual} onChange={(e) => setActual(e.target.value)} />
        <CampoPassword icono={<IconLock size={18} />} placeholder="Nueva contraseña" value={nueva} onChange={(e) => setNueva(e.target.value)} />
        {error && <p style={{ color: "var(--rojo-alerta)", fontSize: 12.5, margin: 0 }}>{error}</p>}
        <BotonPrimario onClick={guardar} disabled={guardando}>{guardando ? "Actualizando..." : "Actualizar contraseña"}</BotonPrimario>
      </div>
    </Modal>
  );
}
