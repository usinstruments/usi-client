import React from "react";
import { createRoot } from "react-dom/client";
import { Router } from "./Router.tsx";
import { Provider, createStore } from "jotai";
import App from "./App.tsx";

const root = createRoot(document.getElementById("root")!);

root.render(
    <App />
);
