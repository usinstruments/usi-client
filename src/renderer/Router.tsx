import React from "react";
import Login, { useUser } from "./Login.tsx";
import Editor from "./Editor.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { atom, useAtom } from "jotai";
import { myFetch } from "./util.ts";
import { store } from "./App.tsx";

export const connectedAtom = atom(false);
export const pingAtom = atom(NaN);

const queryClient = new QueryClient();

async function periodicPing() {
  const start = Date.now();
  myFetch("/ping").then(() => {
    const elapsed = Date.now() - start;
    store.set(pingAtom, elapsed);
  });

  setTimeout(periodicPing, 5000);
}

periodicPing();

export function Router() {
  const { user } = useUser();
  const [connected] = useAtom(connectedAtom);
  const [ping] = useAtom(pingAtom);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col h-full overflow-hidden">
        {user ? <Editor /> : <Login />}
        <div className="flex flex-row gap-2 border-t border-gray-200 dark:border-gray-800 select-none px-2 -mb-0.5 font-bold">
          {connected ? (
            <>
              <span className="text-green-500">CONNECTED</span>
              <span>{isNaN(ping) ? "..." : `${ping} ms`}</span>
            </>
          ) : (
            <span className="text-red-500">DISCONNECTED</span>
          )}
        </div>
      </div>
    </QueryClientProvider>
  );
}