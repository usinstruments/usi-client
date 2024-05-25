import React from "react";
import { useUser } from "./Login.tsx";
import { MdLogout } from "react-icons/md";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { IoCodeWorkingOutline, IoCodeWorkingSharp, IoFolderSharp, IoGitBranch, IoGitBranchSharp, IoLogOutSharp, IoReorderThreeSharp, IoShapesSharp } from "react-icons/io5";
import { GrProjects } from "react-icons/gr";
import { FaProjectDiagram } from "react-icons/fa";

enum Order {
    Normal,
    Flipped
}

let order = Order.Flipped;

export default function App() {
  const { user, logout } = useUser();

  if (user === undefined) {
    return <div>Loading...</div>;
  }

  const tabs = ["Tab 1", "Tab 2", "Tab 3"];

  return (
    <div className="flex flex-row h-full">
      <div className={`flex-1 ${order === Order.Normal ? "order-2" : "order-1"}`}>
        {order === Order.Flipped ? (
        <PanelGroup direction="horizontal">
          <Panel order={1}>
            {TabsView(tabs)}
          </Panel>
          <PanelResizeHandle className="panel-resize-handle" />
          <Panel order={2} minSizePixels={160}>
            {SidebarView()}
          </Panel>
        </PanelGroup>) : (
        <PanelGroup direction="horizontal">
          <Panel order={1} minSizePixels={160}>
            {SidebarView()}
          </Panel>
          <PanelResizeHandle className="panel-resize-handle" />
          <Panel order={2}>
            {TabsView(tabs)}
          </Panel>
        </PanelGroup>)}
      </div>
      <div className={`right-buttons ${order === Order.Normal ? "order-1" : "order-2"}`}>
        <button title="Projects">
            <IoFolderSharp />
        </button>
        <button title="Projects">
            <IoCodeWorkingSharp />
        </button>
        <button title="Template Repos">
            <IoGitBranchSharp />
        </button>
        <button className="mt-auto overflow-hidden" title="Logout" onClick={logout}>
            <IoLogOutSharp className="ms-1" />
        </button>
      </div>
    </div>
  );
}

function SidebarView() {
  return <div className="min-w-40">
    Panel B
  </div>;
}

function TabsView(tabs: string[]) {
    return <div className="flex flex-col h-full">
        <div className="tabs">
            {tabs.map((tab) => (
                <div className="tab" key={tab}>
                    <span>{tab}</span>
                    {/* <button className="w-5 h-5 flex flex-row items-center justify-center border-none">x</button> */}
                </div>
            ))}
        </div>
        <div className="flex-1 bg-gray-100 dark:bg-gray-900"></div>
    </div>;
}

