import { useState } from "react";
import { CANECAS, residuosPorCaneca, type CanecaId } from "../data/canecas";
import { BottomNav } from "../components/BottomNav";
import { EncabezadoDegradado, IconBadge } from "../components/UI";
import { IconBin, IconChevronRight, IconLeaf, IconRecycle } from "../components/icons";

const CONSEJOS: Record<CanecaId, string[]> = {
  blanca: [
    "Enjuaga los envases antes de depositarlos: la suciedad puede inutilizar todo un lote reciclable.",
    "Aplana botellas y cajas para ahorrar espacio en la caneca.",
    "Retira tapas y etiquetas cuando sea posible.",
  ],
  verde: [
    "Evita mezclar residuos orgánicos con envases o plásticos.",
    "Si es posible, separa los restos de comida para compostaje institucional.",
    "No deposites líquidos: escurre bien los restos antes de botarlos.",
  ],
  negra: [
    "Los residuos sanitarios deben ir siempre en bolsa cerrada.",
    "Si un empaque tiene restos de comida o grasa, ya no es aprovechable.",
    "Ante la duda entre caneca blanca o negra, prioriza la higiene: va en la negra.",
  ],
};

const ESTILO_POR_CANECA: Record<CanecaId, { fondo: string; texto: string; icono: React.ReactNode; iconoFondo: string; iconoColor: string; chip: string; chipTexto: string }> = {
  blanca: { fondo: "#fff", texto: "var(--gris-oscuro)", icono: <IconRecycle size={26} />, iconoFondo: "#F3F3F1", iconoColor: "#555", chip: "#F3F3F1", chipTexto: "var(--gris-oscuro)" },
  verde: { fondo: "var(--verde)", texto: "#fff", icono: <IconLeaf size={26} />, iconoFondo: "rgba(255,255,255,.22)", iconoColor: "#fff", chip: "rgba(255,255,255,.2)", chipTexto: "#fff" },
  negra: { fondo: "var(--gris-oscuro)", texto: "#fff", icono: <IconBin size={26} />, iconoFondo: "rgba(255,255,255,.14)", iconoColor: "#fff", chip: "rgba(255,255,255,.14)", chipTexto: "#fff" },
};

export function Learn() {
  const [abiertas, setAbiertas] = useState<Set<CanecaId>>(new Set());

  function alternar(id: CanecaId) {
    setAbiertas((actual) => {
      const nuevo = new Set(actual);
      if (nuevo.has(id)) nuevo.delete(id); else nuevo.add(id);
      return nuevo;
    });
  }

  return (
    <div className="pantalla-columna">
      <EncabezadoDegradado titulo="Aprende a clasificar" subtitulo="Pequeñas decisiones generan grandes cambios." />

      <div style={{ flex: 1, overflowY: "auto", padding: "18px 20px 14px", display: "flex", flexDirection: "column", gap: 14 }}>
        {(Object.keys(CANECAS) as CanecaId[]).map((canecaId, i) => {
          const info = CANECAS[canecaId];
          const estilo = ESTILO_POR_CANECA[canecaId];
          const ejemplos = residuosPorCaneca(canecaId);
          const abierta = abiertas.has(canecaId);
          return (
            <div key={canecaId} style={{ borderRadius: 14, background: estilo.fondo, color: estilo.texto, padding: 18, boxShadow: "var(--sombra-tarjeta-sm)", animation: "fila-entrada 0.34s cubic-bezier(0.22,1,0.36,1) backwards", animationDelay: `${i * 0.07}s` }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 8 }}>
                <IconBadge icono={estilo.icono} tamano={44} colorFondo={estilo.iconoFondo} colorIcono={estilo.iconoColor} />
                <span style={{ fontFamily: "var(--font-d)", fontWeight: 700, fontSize: 17 }}>{info.nombre}</span>
              </div>
              <p style={{ margin: "0 0 10px", fontSize: 13 }}>{info.descripcion}</p>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 10 }}>
                {ejemplos.length === 0 ? (
                  <span style={{ fontSize: 12, opacity: 0.8 }}>Sin ejemplos registrados</span>
                ) : ejemplos.map((r) => (
                  <span key={r.clave} style={{ background: estilo.chip, color: estilo.chipTexto, fontSize: 11.5, fontWeight: 600, padding: "5px 10px", borderRadius: "var(--radio-chip)" }}>
                    {r.nombreVisible}
                  </span>
                ))}
              </div>

              <div
                onClick={() => alternar(canecaId)}
                style={{ display: "flex", alignItems: "center", gap: 5, cursor: "pointer", fontSize: 12.5, fontWeight: 700, opacity: 0.9 }}
              >
                {abierta ? "Ocultar consejos" : "Ver consejos"}
                <IconChevronRight size={13} style={{ transform: abierta ? "rotate(90deg)" : "none", transition: "transform 0.2s ease" }} />
              </div>

              {abierta && (
                <ul style={{ margin: "10px 0 0", paddingLeft: 18, fontSize: 12.5, animation: "fila-entrada 0.22s ease" }}>
                  {CONSEJOS[canecaId].map((c) => (
                    <li key={c} style={{ marginBottom: 4 }}>{c}</li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      <BottomNav />
    </div>
  );
}
