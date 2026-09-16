import crypto from "node:crypto";

const ITERACIONES = 200_000;

export function hashPassword(password, saltHex) {
  const salt = saltHex ?? crypto.randomBytes(16).toString("hex");
  const derivado = crypto.pbkdf2Sync(password, Buffer.from(salt, "hex"), ITERACIONES, 32, "sha256");
  return `${salt}$${derivado.toString("hex")}`;
}

export function verificarPassword(password, hashGuardado) {
  const [salt] = hashGuardado.split("$");
  if (!salt) return false;
  return hashPassword(password, salt) === hashGuardado;
}
