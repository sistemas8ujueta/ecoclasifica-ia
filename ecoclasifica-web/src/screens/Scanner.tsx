import { useEffect, useState } from "react";
import {
  Camera,
  CameraDirection,
  CameraResultType,
  CameraSource,
} from "@capacitor/camera";
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

  async function capturarConCamara() {
    if (analizando) {
      return;
    }

    try {
      setAnalizando(true);

      console.log(
        "Abriendo cámara nativa..."
      );

      const foto =
        await Camera.getPhoto({
          quality: 90,
          allowEditing: false,
          resultType:
            CameraResultType.DataUrl,
          source:
            CameraSource.Camera,
          direction: modoFrontal
            ? CameraDirection.Front
            : CameraDirection.Rear,
        });

      if (!foto.dataUrl) {
        throw new Error(
          "No se pudo obtener la fotografía."
        );
      }

      console.log(
        "Fotografía capturada correctamente."
      );

      console.log(
        "Analizando con modelo ONNX local..."
      );

      const resultado =
        await detector.predecir(
          foto.dataUrl
        );

      console.log(
        "Resultado:",
        resultado
      );

      guardarResultadoEscaneo(
        resultado,
        foto.dataUrl
      );

      navigate("/resultado");
    } catch (error) {
      console.error(
        "ERROR DE CÁMARA:",
        error
      );

      alert(
        error instanceof Error
          ? error.message
          : "No se pudo capturar o analizar la imagen."
      );
    } finally {
      setAnalizando(false);
    }
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
        onChange={(e) =>
          procesarArchivo(
            e.target.files?.[0]
          )
        }
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