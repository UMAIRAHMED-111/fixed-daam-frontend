import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";
import App from "./App";
import "./index.css";

if (typeof window !== "undefined" && window.location.hostname === "www.fixeddaam.com") {
  const { pathname, search, hash } = window.location;
  window.location.replace(`https://fixeddaam.com${pathname}${search}${hash}`);
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <App />
      <Toaster position="top-right" richColors closeButton />
    </BrowserRouter>
  </StrictMode>
);
