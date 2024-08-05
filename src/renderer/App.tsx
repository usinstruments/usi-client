import React from "react";
import { Provider, createStore } from "jotai";
import { Router } from "./Router.tsx";

export const store = createStore();

export default function App() {
  return (
    <Provider store={store}>
      <Router />
    </Provider>
  );
}
