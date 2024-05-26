import React from "react";
import Login, { useUser } from "./Login.tsx";
import Editor from "./Editor.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { atom, useAtom } from "jotai";

export const connectedAtom = atom(false);

const queryClient = new QueryClient();

export function Router() {
  const { user } = useUser();
  const [connected, setConnected] = useAtom(connectedAtom);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col h-full overflow-hidden">
        {user ? <Editor /> : <Login />}
        <div className="border-t border-gray-200 dark:border-gray-800 select-none px-2 -mb-0.5 font-bold">
          {connected ? (
            <span className="text-green-500">CONNECTED</span>
          ) : (
            <span className="text-red-500">DISCONNECTED</span>
          )}
        </div>
      </div>
    </QueryClientProvider>
  );
}
