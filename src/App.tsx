import { useState } from "react";
import reactLogo from "./assets/react.svg";
import "./App.css";
import "@material-design-icons/font";
import Shop from "./ui/shop/shop";
import { Service } from "./service";
Service.init();

function App() {
  return <Shop />;
}

export default App;
