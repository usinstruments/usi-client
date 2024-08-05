import React from "react";
import { atom, useAtom } from "jotai";
import { store } from "./App.tsx";

enum ConsoleMessageKind {
  Info = "info",
  Warning = "warning",
  Error = "error",
}

type ConsoleMessage = {
  kind: ConsoleMessageKind;
  message: string;
  time: Date;
};

const consoleAtom = atom<ConsoleMessage[]>([]);

function addMessage(kind: ConsoleMessageKind, message: string) {
  store.set(consoleAtom, (messages) => [
    ...messages,
    {
      kind,
      message,
      time: new Date(),
    },
  ]);
}

export const myConsole = {
  info: (message: string) => {
    addMessage(ConsoleMessageKind.Info, message);
  },
  warn: (message: string) => {
    addMessage(ConsoleMessageKind.Warning, message);
  },
  error: (message: string) => {
    addMessage(ConsoleMessageKind.Error, message);
  },
};

export default function Console() {
  // TODO: in-app console, implement this
  const [messages] = useAtom(consoleAtom);

  return (
    <div>
    </div>
  );
}
