import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import { useState } from "react";
import "./ui.css";
import { IconCheck, IconEye, IconEyeOff } from "./icons";

// ---------------------------------------------------------------------
// Botones
// ---------------------------------------------------------------------
type BotonProps = ButtonHTMLAttributes<HTMLButtonElement> & { icono?: ReactNode };

export function BotonPrimario({ children, icono, className = "", ...props }: BotonProps) {
  return (
    <button className={`btn btn-primario ${className}`} {...props}>
      {icono}
      {children}
    </button>
  );
}

export function BotonSecundario({ children, className = "", ...props }: BotonProps) {
  return (
    <button className={`btn btn-secundario ${className}`} {...props}>
      {children}
    </button>
  );
}

export function BotonTexto({ children, className = "", ...props }: BotonProps) {
  return (
    <button className={`btn btn-texto ${className}`} {...props}>
      {children}
    </button>
  );
}

export function BotonPeligro({ children, icono, className = "", ...props }: BotonProps) {
  return (
    <button className={`btn btn-peligro ${className}`} {...props}>
      {icono}
      {children}
    </button>
  );
}

// ---------------------------------------------------------------------
// Insignia de ícono (círculo de color)
// ---------------------------------------------------------------------
export function IconBadge({
  icono, tamano = 46, colorFondo = "#E8F6F0", colorIcono = "#065F46", style,
}: { icono: ReactNode; tamano?: number; colorFondo?: string; colorIcono?: string; style?: React.CSSProperties }) {
  return (
    <div
      className="icon-badge"
      style={{ width: tamano, height: tamano, background: colorFondo, color: colorIcono, ...style }}
    >
      {icono}
    </div>
  );
}

// ---------------------------------------------------------------------
// Tarjeta
// ---------------------------------------------------------------------
export function Tarjeta({
  children, className = "", style, ...props
}: { children: ReactNode; className?: string; style?: React.CSSProperties; onClick?: () => void }) {
  return (
    <div className={`tarjeta ${className}`} style={style} {...props}>
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------
// Campo de texto con ícono
// ---------------------------------------------------------------------
type CampoProps = InputHTMLAttributes<HTMLInputElement> & { icono: ReactNode };

export function CampoTexto({ icono, ...props }: CampoProps) {
  return (
    <div className="campo">
      {icono}
      <input {...props} />
    </div>
  );
}

export function CampoPassword({ icono, ...props }: CampoProps) {
  const [mostrar, setMostrar] = useState(false);
  return (
    <div className="campo">
      {icono}
      <input type={mostrar ? "text" : "password"} {...props} />
      <button type="button" className="mostrar-oculto" onClick={() => setMostrar((v) => !v)} aria-label="Mostrar u ocultar contraseña">
        {mostrar ? <IconEyeOff size={18} /> : <IconEye size={18} />}
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------
// Chips
// ---------------------------------------------------------------------
export function Chip({ texto, activo, onClick }: { texto: string; activo: boolean; onClick: () => void }) {
  return (
    <div className={`chip ${activo ? "activo" : ""}`} onClick={onClick}>
      {texto}
    </div>
  );
}

export function ChipPill({ texto, activo, onClick }: { texto: string; activo: boolean; onClick: () => void }) {
  return (
    <div className={`chip-pill ${activo ? "activo" : ""}`} onClick={onClick}>
      {texto}
    </div>
  );
}

// ---------------------------------------------------------------------
// Encabezado con degradado
// ---------------------------------------------------------------------
export function EncabezadoDegradado({ titulo, subtitulo, children }: { titulo: string; subtitulo?: string; children?: ReactNode }) {
  return (
    <div className="encabezado-degradado">
      <h1>{titulo}</h1>
      {subtitulo && <p>{subtitulo}</p>}
      {children}
    </div>
  );
}

// ---------------------------------------------------------------------
// Banner de error
// ---------------------------------------------------------------------
export function BannerError({ mensaje }: { mensaje: string }) {
  if (!mensaje) return null;
  return (
    <div className="error-banner">
      <span>⚠</span>
      <span>{mensaje}</span>
    </div>
  );
}

// ---------------------------------------------------------------------
// Indicador de IA (punto pulsante + texto)
// ---------------------------------------------------------------------
export function IndicadorIA({ texto, color = "var(--verde-oscuro)" }: { texto: string; color?: string }) {
  return (
    <span className="indicador-ia" style={{ color }}>
      <span className="punto" />
      {texto}
    </span>
  );
}

// ---------------------------------------------------------------------
// Barra de confianza
// ---------------------------------------------------------------------
export function BarraConfianza({ porcentaje }: { porcentaje: number }) {
  return (
    <div className="barra-confianza">
      <div className="relleno" style={{ width: `${Math.max(0, Math.min(100, porcentaje))}%` }} />
    </div>
  );
}

// ---------------------------------------------------------------------
// Estado vacío
// ---------------------------------------------------------------------
export function EstadoVacio({ icono, titulo, descripcion }: { icono: ReactNode; titulo: string; descripcion?: string }) {
  return (
    <div className="estado-vacio">
      <div className="estado-vacio-icono">{icono}</div>
      <div className="estado-vacio-titulo">{titulo}</div>
      {descripcion && <p className="estado-vacio-desc">{descripcion}</p>}
    </div>
  );
}

// ---------------------------------------------------------------------
// Casilla de verificación
// ---------------------------------------------------------------------
export function CasillaVerificacion({ activo, onChange }: { activo: boolean; onChange: (valor: boolean) => void }) {
  return (
    <div className={`casilla ${activo ? "activo" : ""}`} onClick={() => onChange(!activo)}>
      {activo && <IconCheck size={14} />}
    </div>
  );
}
