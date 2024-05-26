import React from "react";
import Login, { useUser } from "./Login.tsx";
import App from "./App.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export function Landing() {
  const { user } = useUser();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col h-full overflow-hidden">
        {user ? <App /> : <Login />}
        <div className="border-t border-gray-800 light:border-gray-200 select-none px-2 -mb-0.5 font-bold text-green-500">CONNECTED</div>
      </div>
    </QueryClientProvider>
  );
}
