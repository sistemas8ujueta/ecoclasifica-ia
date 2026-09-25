import { useEffect, useState } from "react";
import * as storage from "../services/storage";
import type { PanelInstitucional } from "../services/storage";
import { clasificar } from "../data/canecas";
import { BottomNav } from "../components/BottomNav";
import { EncabezadoDegradado, IconBadge } from "../components/UI";
import { IconBin, IconBottle, IconChart, IconLeaf, IconRecycle, IconUsers } from "../components/icons";
import "./Dashboard.css";

const ICONO_CANECA: Record<string, { icono: React.ReactNode; color: string; fondo: string }> = {
  blanca: { icono: <IconBottle size={14} />, color: "#555", fondo: "#F3F3F1" },
  verde: { icono: <IconLeaf size={14} />, color: "var(--verde-oscuro)", fondo: "#E8F6F0" },
  negra: { icono: <IconBin size={14} />, color: "var(--gris-oscuro)", fondo: "#EDEFEE" },
};

function formatearFecha(iso: string): string {
  const fecha = new Date(iso);
  return fecha.toLocaleString("es-CO", { day: "2-digit", month: "2-digit", hour: "numeric", minute: "2-digit" });
}

export function Dashboard() {
  const [datos, setDatos] = useState<PanelInstitucional | null>(null);

  useEffect(() => {
    let vigente = true;
    storage.obtenerPanel().then((d) => { if (vigente) setDatos(d); });
    return () => { vigente = false; };
  }, []);

  const total = datos ? datos.blanca + datos.verde + datos.negra || 1 : 1;
  const circunferencia = 2 * Math.PI * 42;
  const segBlanca = datos ? (datos.blanca / total) * circunferencia : 0;
  const segVerde = datos ? (datos.verde / total) * circunferencia : 0;
  const segNegra = datos ? (datos.negra / total) * circunferencia : 0;

  const maxRol = datos ? Math.max(1, ...Object.values(datos.usuariosPorRol)) : 1;

  return (
    <div className="pantalla-columna">
      <EncabezadoDegradado titulo="Dashboard" subtitulo="Resumen general de la plataforma" />

      <div style={{ flex: 1, overflowY: "auto", padding: "20px 20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
        {!datos ? (
          <div className="panel-kpis">
            {Array.from({ length: 4 }).map((_, i) => <div key={i} className="skeleton" style={{ height: 84 }} />)}
          </div>
        ) : (
          <>
            <div className="panel-kpis">
              <div className="panel-kpi">
                <IconBadge icono={<IconUsers size={16} />} tamano={32} colorFondo="#E8F6F0" colorIcono="var(--verde-oscuro)" />
                <div className="etiqueta" style={{ marginTop: 8 }}>Usuarios</div>
                <div className="valor">{datos.totalUsuarios}</div>
              </div>
              <div className="panel-kpi">
                <IconBadge icono={<IconChart size={16} />} tamano={32} colorFondo="#E8F5FF" colorIcono="#0369A1" />
                <div className="etiqueta" style={{ marginTop: 8 }}>Clasificaciones</div>
                <div className="valor">{datos.totalClasificaciones}</div>
              </div>
              <div className="panel-kpi">
                <IconBadge icono={<IconRecycle size={16} />} tamano={32} colorFondo="#F3ECFB" colorIcono="#7C3AED" />
                <div className="etiqueta" style={{ marginTop: 8 }}>Precisión de IA</div>
               <div className="valor">
  {datos.confianzaPromedio !== null
    ? `${Math.round(datos.confianzaPromedio * 100)}%`
    : "—"}
</div>
              </div>
              <div className="panel-kpi">
                <IconBadge icono={<IconLeaf size={16} />} tamano={32} colorFondo="#FDF1E0" colorIcono="#B45309" />
                <div className="etiqueta" style={{ marginTop: 8 }}>Aprovechables</div>
                <div className="valor">{total > 1 ? Math.round(((datos.blanca + datos.verde) / total) * 100) : 0}%</div>
              </div>
            </div>

            <div className="panel-grid">
              <div className="tarjeta" style={{ padding: 18 }}>
                <div style={{ fontFamily: "var(--font-d)", fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Actividad reciente</div>
                {datos.recientes.length === 0 ? (
                  <p style={{ fontSize: 13, color: "var(--texto-secundario)" }}>Aún no hay clasificaciones registradas.</p>
                ) : (
                  <table className="panel-tabla">
                    <thead>
                      <tr><th>Usuario</th><th>Residuo</th><th>Caneca</th><th>Fecha</th></tr>
                    </thead>
                    <tbody>
                      {datos.recientes.map((r, i) => {
                        const estilo = ICONO_CANECA[r.caneca];
                        return (
                          <tr key={i}>
                            <td>{r.usuarioNombre}</td>
                            <td>{clasificar(r.residuo)?.nombreVisible ?? r.residuo}</td>
                            <td>
                              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: estilo.fondo, color: estilo.color, padding: "3px 8px", borderRadius: "var(--radio-chip)", fontSize: 11, fontWeight: 700 }}>
                                {estilo.icono} {r.caneca}
                              </span>
                            </td>
                            <td style={{ color: "var(--texto-secundario)" }}>{formatearFecha(r.fecha)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                <div className="tarjeta" style={{ padding: 18, display: "flex", gap: 16, alignItems: "center" }}>
                  <div style={{ position: "relative", width: 92, height: 92, flex: "none" }}>
                    <svg viewBox="0 0 100 100" width={92} height={92} style={{ transform: "rotate(-90deg)" }}>
                      <circle cx="50" cy="50" r="42" fill="none" stroke="#EEF2F0" strokeWidth={13} />
                      {total > 1 && (
                        <>
                          <circle cx="50" cy="50" r="42" fill="none" stroke="#C9D2CD" strokeWidth={13} strokeLinecap="round"
                            strokeDasharray={`${segBlanca} ${circunferencia - segBlanca}`} />
                          <circle cx="50" cy="50" r="42" fill="none" stroke="#10B981" strokeWidth={13} strokeLinecap="round"
                            strokeDasharray={`${segVerde} ${circunferencia - segVerde}`} strokeDashoffset={-segBlanca} />
                          <circle cx="50" cy="50" r="42" fill="none" stroke="#17211B" strokeWidth={13} strokeLinecap="round"
                            strokeDasharray={`${segNegra} ${circunferencia - segNegra}`} strokeDashoffset={-(segBlanca + segVerde)} />
                        </>
                      )}
                    </svg>
                    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-d)", fontWeight: 700, fontSize: 16 }}>
                      {datos.totalClasificaciones}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, display: "flex", flexDirection: "column", gap: 5 }}>
                    <span>Blanca {total > 1 ? Math.round((datos.blanca / total) * 100) : 0}%</span>
                    <span>Verde {total > 1 ? Math.round((datos.verde / total) * 100) : 0}%</span>
                    <span>Negra {total > 1 ? Math.round((datos.negra / total) * 100) : 0}%</span>
                  </div>
                </div>

                <div className="tarjeta" style={{ padding: 18 }}>
                  <div style={{ fontFamily: "var(--font-d)", fontWeight: 700, fontSize: 14, marginBottom: 12 }}>Usuarios por rol</div>
                  {Object.entries(datos.usuariosPorRol).map(([rol, n]) => (
                    <div key={rol} className="panel-fila" style={{ gap: 10 }}>
                      <span style={{ fontSize: 12.5, width: 130, flex: "none" }}>{rol}</span>
                      <div className="panel-barra-rol">
                        <div className="relleno" style={{ width: `${((n ?? 0) / maxRol) * 100}%` }} />
                      </div>
                      <span style={{ fontSize: 12.5, fontWeight: 700, width: 20, textAlign: "right" }}>{n}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
}
