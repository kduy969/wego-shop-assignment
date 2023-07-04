import "./App.css";
import "@material-design-icons/font";
import Shop from "./ui/shop/shop";
import { Service } from "./service";
import React from "react";
Service.init();

function App() {
  return <Shop />;
}

export default App;
