import React from "react";
import Login, { useUser } from "./Login.tsx";
import App from "./App.tsx";

export function Landing() {
  const { user } = useUser();

  return (
    <div className="flex flex-col h-full">
      {user ? <App /> : <Login />}
      <div className="bg-pink-500 select-none"> Status Bar</div>
    </div>
  );
}
