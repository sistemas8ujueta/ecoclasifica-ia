import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext";
import * as detector from "../services/detector";
import { IndicadorIA } from "../components/UI";
import {
  IconBottle,
  IconCheck,
  IconChevronLeft,
  IconFlip,
  IconImage,
  IconScan,
} from "../components/icons";
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
  const [modoFrontal, setModoFrontal] = useState(false);

  useEffect(() => {
    if (!analizando) {
      setPasoActual(0);
      return;
    }

    const intervalo = setInterval(() => {
      setPasoActual((p) =>
        Math.min(
          p + 1,
          PASOS_ANALISIS.length - 1
        )
      );
    }, 400);

    return () => clearInterval(intervalo);
  }, [analizando]);

  function leerArchivoComoDataUrl(
    archivo: File
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const lector = new FileReader();

      lector.onload = () => {
        resolve(lector.result as string);
      };

      lector.onerror = (error) => {
        console.error(
          "Error leyendo archivo:",
          error
        );
        reject(error);
      };

      lector.onabort = () => {
        reject(
          new Error(
            "La lectura de la imagen fue cancelada."
          )
        );
      };

      lector.readAsDataURL(archivo);
    });
  }

  async function procesarArchivo(
    archivo: File | undefined
  ) {
    if (!archivo) {
      return;
    }

    setAnalizando(true);

    try {
      console.log(
        "Imagen seleccionada de la galería."
      );

      const dataUrl =
        await leerArchivoComoDataUrl(
          archivo
        );

      const resultado =
        await detector.predecir(dataUrl);

      guardarResultadoEscaneo(
        resultado,
        dataUrl
      );

      navigate("/resultado");
    } catch (error) {
      console.error(
        "ERROR AL ANALIZAR:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "No se pudo analizar la imagen."
      );
    } finally {
      setAnalizando(false);
    }
  }

  // Usamos el selector de archivos nativo del navegador con el
  // atributo `capture`, en vez del plugin @capacitor/camera.
  //
  // Motivo: el plugin @capacitor/camera (con CameraX por debajo)
  // resultó no ser confiable en algunos equipos Android, fallando
  // con "Unable to create photo on disk" incluso con el permiso de
  // Cámara ya concedido. El atributo `capture` en un <input type="file">
  // delega la captura directamente a la app de cámara del sistema
  // (la misma que usan las demás apps del teléfono), así que funciona
  // de forma consistente sin importar el modelo o la marca del equipo.
  function capturarConCamara() {
    if (analizando) {
      return;
    }

    document
      .getElementById("input-camara-nativa")
      ?.click();
  }

  return (
    <div className="pantalla-columna escaner-pantalla">

      <button
        className="escaner-boton-circular escaner-atras"
        onClick={() => navigate("/inicio")}
        aria-label="Volver"
      >
        <IconChevronLeft size={20} />
      </button>

      <div className="escaner-encabezado">
        <p className="escaner-titulo">
          Escáner inteligente
        </p>

        <p className="escaner-instruccion">
          Coloca el residuo dentro del marco
        </p>

        <IndicadorIA
          texto="IA activa · Modelo YOLO"
          color="rgba(255,255,255,.9)"
        />
      </div>

      <div className="escaner-marco">
        <span className="esquina sup-izq" />
        <span className="esquina sup-der" />
        <span className="esquina inf-izq" />
        <span className="esquina inf-der" />

        {!analizando && (
          <span className="escaner-linea" />
        )}

        <IconBottle
          size={100}
          color="#2c4238"
        />
      </div>

      <p className="escaner-ayuda">
        Centra el residuo y mantén la cámara estable.
      </p>

      <div className="escaner-controles">

        {/* GALERÍA */}
        <div className="escaner-control">
          <button
            className="escaner-boton-circular"
            onClick={() =>
              document
                .getElementById(
                  "input-galeria"
                )
                ?.click()
            }
            aria-label="Elegir de la galería"
            disabled={analizando}
          >
            <IconImage size={20} />
          </button>

          <span>
            Subir imagen
          </span>
        </div>

        {/* CÁMARA NATIVA */}
        <div className="escaner-control">
          <button
            className="escaner-boton-circular escaner-boton-capturar"
            onClick={
              capturarConCamara
            }
            aria-label="Capturar foto"
            disabled={analizando}
          >
            <IconScan size={28} />
          </button>

          <span>
            Capturar y analizar
          </span>
        </div>

        {/* CAMBIAR CÁMARA */}
        <div className="escaner-control">
          <button
            className="escaner-boton-circular"
            onClick={() =>
              setModoFrontal(
                (valor) => !valor
              )
            }
            aria-label="Cambiar de cámara"
            disabled={analizando}
          >
            <IconFlip size={20} />
          </button>

          <span>
            {modoFrontal
              ? "Frontal"
              : "Trasera"}
          </span>
        </div>
      </div>

      {/* SOLO GALERÍA */}
      <input
        id="input-galeria"
        type="file"
        accept="image/*"
        style={{
          display: "none",
        }}
        onChange={(e) => {
          procesarArchivo(
            e.target.files?.[0]
          );
          e.target.value = "";
        }}
      />

      {/*
        CÁMARA NATIVA (vía navegador, no vía @capacitor/camera).
        El atributo `capture` hace que el navegador abra directamente
        la app de cámara del sistema en vez de un selector de archivos.
        `key` fuerza a recrear el input al cambiar de cámara frontal/trasera,
        porque algunos navegadores ignoran un cambio de atributo en caliente.
      */}
      <input
        key={
          modoFrontal
            ? "camara-frontal"
            : "camara-trasera"
        }
        id="input-camara-nativa"
        type="file"
        accept="image/*"
        capture={
          modoFrontal ? "user" : "environment"
        }
        style={{
          display: "none",
        }}
        onChange={(e) => {
          procesarArchivo(
            e.target.files?.[0]
          );
          e.target.value = "";
        }}
      />

      {analizando && (
        <div className="escaner-overlay">

          <div className="escaner-anillo escaner-anillo-1" />
          <div className="escaner-anillo escaner-anillo-2" />

          <IconBottle
            size={56}
            color="#3a5a4c"
          />

          <div className="escaner-texto-analizando">
            <div className="titulo">
              Analizando residuo...
            </div>

            <div className="sub">
              Nuestra IA está identificando el material
            </div>
          </div>

          <ul className="escaner-pasos">
            {PASOS_ANALISIS.map(
              (paso, i) => (
                <li
                  key={paso}
                  className={
                    i <= pasoActual
                      ? "hecho"
                      : ""
                  }
                >
                  {i < pasoActual ? (
                    <IconCheck size={13} />
                  ) : (
                    <span className="marcador" />
                  )}

                  {paso}
                </li>
              )
            )}
          </ul>
        </div>
      )}
    </div>
  );
}