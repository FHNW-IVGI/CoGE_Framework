import React from "react";
import ReactDOM from "react-dom/client"; // Import createRoot from react-dom/client
import App from "./App";
import "@ionic/react/css/core.css";
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";
import "./App.css"; // Your custom CSS
import { setupIonicReact } from "@ionic/react";

setupIonicReact();

// Create a root and render the app
const container = document.getElementById("root");
const root = ReactDOM.createRoot(container!); // Create a root with non-null assertion

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
