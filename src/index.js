import React from "react";
import ReactDOM from "react-dom/client";
import WeatherApp from "./WeatherApp";

import "./styles.css";

function App() {
  return <WeatherApp />;
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
