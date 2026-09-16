import { Navigate, Route, Routes } from "react-router-dom";
import { AppProvider, useApp } from "./context/AppContext";
import { ToastProvider } from "./components/Toast";
import { Splash } from "./screens/Splash";
import { Login } from "./screens/Login";
import { Register } from "./screens/Register";
import { ForgotPassword } from "./screens/ForgotPassword";
import { Home } from "./screens/Home";
import { Scanner } from "./screens/Scanner";
import { Result } from "./screens/Result";
import { History } from "./screens/History";
import { Statistics } from "./screens/Statistics";
import { Learn } from "./screens/Learn";
import { Profile } from "./screens/Profile";
import { About } from "./screens/About";
import { Usuarios } from "./screens/Usuarios";
import { Dashboard } from "./screens/Dashboard";

function RutaProtegida({ children }: { children: React.ReactNode }) {
  const { sesion } = useApp();
  if (!sesion) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function Rutas() {
  return (
    <Routes>
      <Route path="/" element={<Splash />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Register />} />
      <Route path="/recuperar" element={<ForgotPassword />} />
      <Route path="/inicio" element={<RutaProtegida><Home /></RutaProtegida>} />
      <Route path="/escanear" element={<RutaProtegida><Scanner /></RutaProtegida>} />
      <Route path="/resultado" element={<RutaProtegida><Result /></RutaProtegida>} />
      <Route path="/historial" element={<RutaProtegida><History /></RutaProtegida>} />
      <Route path="/estadisticas" element={<RutaProtegida><Statistics /></RutaProtegida>} />
      <Route path="/aprende" element={<RutaProtegida><Learn /></RutaProtegida>} />
      <Route path="/perfil" element={<RutaProtegida><Profile /></RutaProtegida>} />
      <Route path="/acerca-de" element={<RutaProtegida><About /></RutaProtegida>} />
      <Route path="/usuarios" element={<RutaProtegida><Usuarios /></RutaProtegida>} />
      <Route path="/panel" element={<RutaProtegida><Dashboard /></RutaProtegida>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <Rutas />
      </ToastProvider>
    </AppProvider>
  );
}
