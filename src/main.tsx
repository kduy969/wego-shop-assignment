import "@material-design-icons/font";
import "./index.css";
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import setup from "./setup";
setup();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
