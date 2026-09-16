import { useNavigate, useLocation } from "react-router-dom";
import { IconClock, IconHome, IconScan, IconUser } from "./icons";
import "./BottomNav.css";

const ITEMS = [
  { ruta: "/inicio", icono: IconHome, etiqueta: "Inicio" },
  { ruta: "/historial", icono: IconClock, etiqueta: "Historial" },
  { ruta: "/perfil", icono: IconUser, etiqueta: "Perfil" },
];

export function BottomNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const activa = location.pathname;

  return (
    <div className="bottom-nav">
      <div className="bottom-nav-fila">
        <NavItem
          activo={activa === "/inicio"}
          icono={<IconHome size={22} />}
          etiqueta="Inicio"
          onClick={() => navigate("/inicio")}
        />
        <div className="bottom-nav-espacio" />
        {ITEMS.slice(1).map(({ ruta, icono: Icono, etiqueta }) => (
          <NavItem
            key={ruta}
            activo={activa === ruta}
            icono={<Icono size={22} />}
            etiqueta={etiqueta}
            onClick={() => navigate(ruta)}
          />
        ))}
      </div>

      <button className="bottom-nav-fab" onClick={() => navigate("/escanear")} aria-label="Escanear residuo">
        <span className="bottom-nav-fab-circulo">
          <IconScan size={26} />
        </span>
      </button>
      <span className={`bottom-nav-fab-etiqueta ${activa === "/escanear" ? "activo" : ""}`}>Escanear</span>
    </div>
  );
}

function NavItem({ activo, icono, etiqueta, onClick }: { activo: boolean; icono: React.ReactNode; etiqueta: string; onClick: () => void }) {
  return (
    <div className={`bottom-nav-item ${activo ? "activo" : ""}`} onClick={onClick}>
      {icono}
      <span>{etiqueta}</span>
      {activo && <span className="punto-activo" />}
    </div>
  );
}
