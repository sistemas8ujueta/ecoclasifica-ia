import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import * as detector from "../services/detector";
import { IndicadorIA } from "../components/UI";
import { IconBottle, IconCheck, IconChevronLeft, IconFlip, IconImage, IconScan } from "../components/icons";
import "./Scanner.css";

const PASOS_ANALISIS = [
  "Procesando imagen...",
  "Detectando objeto...",
  "Clasificando material...",
  "Obteniendo resultado...",
];

export function Scanner() {
  const navigate = useNavigate();
  const { guardarResultadoEscaneo } = useApp();
  const [analizando, setAnalizando] = useState(false);
  const [pasoActual, setPasoActual] = useState(0);
  const inputCamaraRef = useRef<HTMLInputElement>(null);
  const inputGaleriaRef = useRef<HTMLInputElement>(null);
  const [modoFrontal, setModoFrontal] = useState(false);

  useEffect(() => {
    if (!analizando) { setPasoActual(0); return; }
    const intervalo = setInterval(() => {
      setPasoActual((p) => Math.min(p + 1, PASOS_ANALISIS.length - 1));
    }, 400);
    return () => clearInterval(intervalo);
  }, [analizando]);

  function leerArchivoComoDataUrl(archivo: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const lector = new FileReader();
      lector.onload = () => resolve(lector.result as string);
      lector.onerror = reject;
      lector.readAsDataURL(archivo);
    });
  }

  async function procesarArchivo(archivo: File | undefined) {
    if (!archivo) return;
    setAnalizando(true);
    const dataUrl = await leerArchivoComoDataUrl(archivo);
    const resultado = await detector.predecir(dataUrl);
    guardarResultadoEscaneo(resultado, dataUrl);
    setAnalizando(false);
    navigate("/resultado");
  }

  return (
    <div className="pantalla-columna escaner-pantalla">
      <button className="escaner-boton-circular escaner-atras" onClick={() => navigate("/inicio")} aria-label="Volver">
        <IconChevronLeft size={20} />
      </button>

      <div className="escaner-encabezado">
        <p className="escaner-titulo">Escáner inteligente</p>
        <p className="escaner-instruccion">Coloca el residuo dentro del marco</p>
        <IndicadorIA texto="IA activa · Modelo YOLO" color="rgba(255,255,255,.9)" />
      </div>

      <div className="escaner-marco">
        <span className="esquina sup-izq" /><span className="esquina sup-der" />
        <span className="esquina inf-izq" /><span className="esquina inf-der" />
        {!analizando && <span className="escaner-linea" />}
        <IconBottle size={100} color="#2c4238" />
      </div>

      <p className="escaner-ayuda">Centra el residuo y mantén la cámara estable.</p>

      <div className="escaner-controles">
        <div className="escaner-control">
          <button className="escaner-boton-circular" onClick={() => inputGaleriaRef.current?.click()} aria-label="Elegir de la galería">
            <IconImage size={20} />
          </button>
          <span>Subir imagen</span>
        </div>
        <div className="escaner-control">
          <button
            className="escaner-boton-circular escaner-boton-capturar"
            onClick={() => inputCamaraRef.current?.click()}
            aria-label="Capturar foto"
          >
            <IconScan size={28} />
          </button>
          <span>Capturar y analizar</span>
        </div>
        <div className="escaner-control">
          <button className="escaner-boton-circular" onClick={() => setModoFrontal((v) => !v)} aria-label="Cambiar de cámara">
            <IconFlip size={20} />
          </button>
          <span>Cámara</span>
        </div>
      </div>

      {/* En navegadores móviles, "capture" abre directamente la cámara nativa. */}
      <input
        ref={inputCamaraRef}
        type="file"
        accept="image/*"
        capture={modoFrontal ? "user" : "environment"}
        style={{ display: "none" }}
        onChange={(e) => procesarArchivo(e.target.files?.[0])}
      />
      <input
        ref={inputGaleriaRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => procesarArchivo(e.target.files?.[0])}
      />

      {analizando && (
        <div className="escaner-overlay">
          <div className="escaner-anillo escaner-anillo-1" />
          <div className="escaner-anillo escaner-anillo-2" />
          <IconBottle size={56} color="#3a5a4c" />
          <div className="escaner-texto-analizando">
            <div className="titulo">Analizando residuo…</div>
            <div className="sub">Nuestra IA está identificando el material</div>
          </div>
          <ul className="escaner-pasos">
            {PASOS_ANALISIS.map((paso, i) => (
              <li key={paso} className={i <= pasoActual ? "hecho" : ""}>
                {i < pasoActual ? <IconCheck size={13} /> : <span className="marcador" />}
                {paso}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
