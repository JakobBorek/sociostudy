import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./lib/aiKeyInjector";

createRoot(document.getElementById("root")!).render(<App />);
