import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext";
import * as storage from "../services/storage";
import type { Periodo } from "../services/storage";
import { clasificar } from "../data/canecas";
import { useContador } from "../hooks/useContador";
import { BottomNav } from "../components/BottomNav";
import {
  EncabezadoDegradado,
  IconBadge,
  Tarjeta,
} from "../components/UI";
import {
  IconBin,
  IconChart,
  IconLeaf,
  IconRecycle,
  IconTrendUp,
} from "../components/icons";

const ESTADISTICAS_VACIAS = {
  total: 0,
  blanca: 0,
  verde: 0,
  negra: 0,
  confianzaPromedio: null as number | null,
  residuoMasFrecuente: null as string | null,
};

const PERIODOS: { id: Periodo; etiqueta: string }[] = [
  { id: "semana", etiqueta: "Semana" },
  { id: "mes", etiqueta: "Mes" },
  { id: "todo", etiqueta: "Todo" },
];

export function Statistics() {
  const { sesion } = useApp();

  const [periodo, setPeriodo] = useState<Periodo>("todo");
  const [stats, setStats] = useState(ESTADISTICAS_VACIAS);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    if (!sesion) return;

    let vigente = true;
    setCargando(true);

    storage
      .obtenerEstadisticas(sesion.id, periodo)
      .then((datos) => {
        if (!vigente) return;

        setStats(datos);
        setCargando(false);
      })
      .catch(() => {
        if (!vigente) return;

        setStats(ESTADISTICAS_VACIAS);
        setCargando(false);
      });

    return () => {
      vigente = false;
    };
  }, [sesion, periodo]);

  const totalAnimado = useContador(stats.total, !cargando);
  const blancaAnimada = useContador(stats.blanca, !cargando);
  const verdeAnimada = useContador(stats.verde, !cargando);
  const negraAnimada = useContador(stats.negra, !cargando);

  const porcentaje = (cantidad: number) => {
    if (stats.total <= 0) return 0;
    return Math.round((cantidad / stats.total) * 100);
  };

  const pctBlanca = porcentaje(stats.blanca);
  const pctVerde = porcentaje(stats.verde);
  const pctNegra = porcentaje(stats.negra);

  const residuoFrecuente = stats.residuoMasFrecuente
    ? clasificar(stats.residuoMasFrecuente)?.nombreVisible ??
      stats.residuoMasFrecuente
    : "—";

  return (
    <div className="pantalla-columna">
      <EncabezadoDegradado
        titulo="Estadísticas"
        subtitulo="Resumen de tus clasificaciones"
      />

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px 20px 14px",
          display: "flex",
          flexDirection: "column",
          gap: 14,
        }}
      >
        {/* PERIODOS */}
        <div style={{ display: "flex", gap: 6 }}>
          {PERIODOS.map((p) => (
            <div
              key={p.id}
              className={`chip-pill ${
                periodo === p.id ? "activo" : ""
              }`}
              onClick={() => setPeriodo(p.id)}
            >
              {p.etiqueta}
            </div>
          ))}
        </div>

        {/* TARJETAS PRINCIPALES */}
        {cargando ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="skeleton"
                style={{
                  height: 92,
                  borderRadius: 14,
                }}
              />
            ))}
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            <TarjetaStat
              icono={<IconChart size={18} />}
              colorIcono="#fff"
              fondoIcono="rgba(255,255,255,.22)"
              fondo="linear-gradient(150deg, var(--verde-esmeralda), var(--turquesa))"
              colorTexto="#fff"
              etiqueta="Total escaneados"
              valor={totalAnimado}
            />

            <TarjetaStat
              icono={<IconRecycle size={18} />}
              colorIcono="#0E2622"
              fondoIcono="rgba(255,255,255,.5)"
              fondo="var(--grad-turquesa)"
              colorTexto="#0E2622"
              etiqueta="Aprovechables"
              valor={blancaAnimada}
            />

            <TarjetaStat
              icono={<IconLeaf size={18} />}
              colorIcono="#12210C"
              fondoIcono="rgba(255,255,255,.45)"
              fondo="var(--grad-lima)"
              colorTexto="#12210C"
              etiqueta="Orgánicos"
              valor={verdeAnimada}
            />

            <TarjetaStat
              icono={<IconBin size={18} />}
              colorIcono="#fff"
              fondoIcono="rgba(255,255,255,.16)"
              fondo="var(--grad-carbon)"
              colorTexto="#fff"
              etiqueta="No aprovechables"
              valor={negraAnimada}
            />
          </div>
        )}

        {/* INFORMACIÓN DEL MODELO */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 12,
          }}
        >
          <Tarjeta style={{ padding: 14 }}>
            <IconBadge
              icono={<IconTrendUp size={16} />}
              tamano={32}
              colorFondo="#E8F5FF"
              colorIcono="#0369A1"
            />

            <div
              style={{
                fontSize: 11,
                color: "var(--texto-secundario)",
                marginTop: 8,
              }}
            >
              Confianza promedio de IA
            </div>

            <div
              style={{
                fontFamily: "var(--font-d)",
                fontWeight: 700,
                fontSize: 19,
              }}
            >
              {stats.confianzaPromedio !== null
               ? `${stats.confianzaPromedio <= 1
                 ? Math.round(stats.confianzaPromedio * 100)
                 : Math.round(stats.confianzaPromedio)}%`
                  : "—"}
            </div>
          </Tarjeta>

          <Tarjeta style={{ padding: 14 }}>
            <IconBadge
              icono={<IconRecycle size={16} />}
              tamano={32}
              colorFondo="#FDF1E0"
              colorIcono="#B45309"
            />

            <div
              style={{
                fontSize: 11,
                color: "var(--texto-secundario)",
                marginTop: 8,
              }}
            >
              Residuo más clasificado
            </div>

            <div
              style={{
                fontFamily: "var(--font-d)",
                fontWeight: 700,
                fontSize: 14,
                marginTop: 2,
              }}
            >
              {residuoFrecuente}
            </div>
          </Tarjeta>
        </div>

        {/* DISTRIBUCIÓN POR CANECA */}
        <Tarjeta
          style={{
            padding: 18,
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-d)",
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            Distribución por caneca
          </div>

          <FilaDistribucion
            nombre="Caneca blanca"
            descripcion="Aprovechables"
            cantidad={stats.blanca}
            porcentaje={pctBlanca}
            fondo="linear-gradient(90deg, #8C9A91, #B7C1BB)"
            color="#3A4640"
          />

          <FilaDistribucion
            nombre="Caneca verde"
            descripcion="Orgánicos"
            cantidad={stats.verde}
            porcentaje={pctVerde}
            fondo="linear-gradient(90deg, var(--verde-esmeralda), var(--verde-lima))"
            color="var(--verde-esmeralda)"
          />

          <FilaDistribucion
            nombre="Caneca negra"
            descripcion="No aprovechables"
            cantidad={stats.negra}
            porcentaje={pctNegra}
            fondo="var(--grad-carbon)"
            color="#1C2924"
          />

          <div
            style={{
              borderTop: "1px solid #E8EEEB",
              paddingTop: 12,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 12,
            }}
          >
            <span style={{ color: "var(--texto-secundario)" }}>
              Total de clasificaciones
            </span>

            <strong
              style={{
                fontFamily: "var(--font-d)",
                fontSize: 15,
              }}
            >
              {stats.total}
            </strong>
          </div>
        </Tarjeta>
      </div>

      <BottomNav />
    </div>
  );
}

function TarjetaStat({
  icono,
  colorIcono,
  fondoIcono,
  fondo,
  colorTexto,
  etiqueta,
  valor,
}: {
  icono: React.ReactNode;
  colorIcono: string;
  fondoIcono: string;
  fondo: string;
  colorTexto: string;
  etiqueta: string;
  valor: number;
}) {
  return (
    <div
      style={{
        borderRadius: 18,
        padding: 14,
        background: fondo,
        color: colorTexto,
        boxShadow: "0 10px 22px rgba(11,107,79,.16)",
      }}
    >
      <IconBadge
        icono={icono}
        tamano={36}
        colorFondo={fondoIcono}
        colorIcono={colorIcono}
      />

      <div
        style={{
          fontSize: 11,
          opacity: 0.85,
          marginTop: 9,
        }}
      >
        {etiqueta}
      </div>

      <div
        style={{
          fontFamily: "var(--font-d)",
          fontWeight: 700,
          fontSize: 26,
        }}
      >
        {valor}
      </div>
    </div>
  );
}

function FilaDistribucion({
  nombre,
  descripcion,
  cantidad,
  porcentaje,
  fondo,
  color,
}: {
  nombre: string;
  descripcion: string;
  cantidad: number;
  porcentaje: number;
  fondo: string;
  color: string;
}) {
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 7,
        }}
      >
        <div>
          <div
            style={{
              fontWeight: 700,
              fontSize: 12.5,
            }}
          >
            {nombre}
          </div>

          <div
            style={{
              fontSize: 10,
              color: "var(--texto-secundario)",
              marginTop: 2,
            }}
          >
            {descripcion}
          </div>
        </div>

        <div
          style={{
            textAlign: "right",
          }}
        >
          <div
            style={{
              fontFamily: "var(--font-d)",
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            {porcentaje}%
          </div>

          <div
            style={{
              fontSize: 10,
              color: "var(--texto-secundario)",
            }}
          >
            {cantidad} {cantidad === 1 ? "residuo" : "residuos"}
          </div>
        </div>
      </div>

      <div
        style={{
          width: "100%",
          height: 9,
          borderRadius: 999,
          background: "#EDF1EF",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${porcentaje}%`,
            height: "100%",
            borderRadius: 999,
            background: fondo,
            minWidth: porcentaje > 0 ? 5 : 0,
            transition: "width .5s ease",
            boxShadow:
              porcentaje > 0
                ? `0 2px 6px ${color}33`
                : "none",
          }}
        />
      </div>
    </div>
  );
}