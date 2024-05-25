import React from "react";
import { useUser } from "./Login.tsx";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";

export default function App() {
  const { user } = useUser();

  if (user === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <div className="flex flex-row h-svh">
      <div className="flex-1">
        <PanelGroup direction="horizontal">
          <Panel order={1}>Panel A</Panel>
          <PanelResizeHandle className="w-[1px] bg-gray-200 dark:bg-gray-800 relative active:bg-black hover:bg-gray-400 dark:active:bg-white after:absolute after:w-[4px] after:h-full after:-left-[1px] before:absolute before:h-full before:w-[16px] before:-left-[6px] before:z-50" />
          <Panel order={2}>Panel B</Panel>
        </PanelGroup>
      </div>
      <div className="w-14 flex flex-col border-s border-gray-200 dark:border-gray-800">
        <span className="w-12 aspect-square">A</span>
        <span className="w-12 aspect-square">B</span>
      </div>
    </div>
  );
}
