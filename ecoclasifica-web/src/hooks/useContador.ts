import { useEffect, useState } from "react";

export function useContador(valorFinal: number, activo: boolean): number {
  const [valor, setValor] = useState(0);
  useEffect(() => {
    if (!activo) return;
    if (valorFinal === 0) { setValor(0); return; }
    const inicio = performance.now();
    const duracion = 700;
    let cuadro: number;
    const paso = (ahora: number) => {
      const progreso = Math.min(1, (ahora - inicio) / duracion);
      const facilitado = 1 - (1 - progreso) ** 3;
      setValor(Math.round(valorFinal * facilitado));
      if (progreso < 1) cuadro = requestAnimationFrame(paso);
    };
    cuadro = requestAnimationFrame(paso);
    return () => cancelAnimationFrame(cuadro);
  }, [valorFinal, activo]);
  return valor;
}
