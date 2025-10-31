import React from "react";
import { createRoot } from "react-dom/client";
import LuanaBotPackage from "./LuanaBotPackage";
import "./index.css";

// Componente principal da aplicação
const App = () => {
  return React.createElement(LuanaBotPackage, null);
};

// Renderização no DOM
const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(React.createElement(App, null));
}