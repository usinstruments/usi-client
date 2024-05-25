import React from "react";
import Login, { useUser } from "./Login.tsx";
import App from "./App.tsx";

export function Landing() {
  const { user } = useUser();

  return (user ? <App />  : <Login />);
}
