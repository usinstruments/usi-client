import React, { useMemo, useState } from "react";
import { useUser } from "./Login.tsx";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import {
  IoCodeWorkingSharp,
  IoFolderSharp,
  IoGitBranchSharp,
  IoLogOutSharp,
} from "react-icons/io5";
import { useAtom } from "jotai";
import { myStoredAtom } from "./util.ts";
import { TabsView } from "./TabsView.tsx";
import { ExplorerSidebar, ProjectsSidebar, ReposSidebar, Sidebar } from "./Sidebars.tsx";

let flipped = true;

const sidebarWidthAtom = myStoredAtom("sidebarWidth", 400);
const currentTaskAtom = myStoredAtom<string | undefined>(
  "currentTask",
  undefined
);

export default function Editor() {
  const { user, logout } = useUser();

  const [sidebarWidth, setSidebarWidth] = useAtom(sidebarWidthAtom);
  const defaultSidebarWidth = React.useRef(sidebarWidth);

  const [currentTask, setCurrentTask] = useAtom(currentTaskAtom);

  if (user === undefined) {
    return <div>Loading...</div>;
  }

  function TaskbarButton(name: string, icon: JSX.Element) {
    const current = currentTask === name;

    const taskClick = () => {
      if (current) {
        defaultSidebarWidth.current = sidebarWidth;
        setCurrentTask(undefined);
      } else {
        setCurrentTask(name);
      }
    };

    return (
      <button
        title={name}
        onClick={taskClick}
        className={current ? "selected" : ""}
      >
        {icon}
      </button>
    );
  }

  const SidebarFactory = () => {
    switch (currentTask) {
      case "Explorer":
        return <ExplorerSidebar />;
      case "Projects":
        return <ProjectsSidebar />;
      case "Repositories":
        return <ReposSidebar />;

      default:
        return <div></div>;
    }
  };

  const contentPanel = (
    <Panel order={flipped ? 1 : 2} id="content">
      <TabsView />
    </Panel>
  );

  const sidebarPanel = useMemo(() => {
    return (
      <Panel
        order={flipped ? 2 : 1}
        id="sidebar"
        minSizePixels={160}
        defaultSizePixels={defaultSidebarWidth.current}
        onResize={(size, _) => setSidebarWidth(size.sizePixels)}
        className="sidebar"
      >
        <Sidebar title={currentTask || ""}>{SidebarFactory()}</Sidebar>
      </Panel>
    );
  }, [currentTask]);

  const resizeHandle = <PanelResizeHandle className="panel-resize-handle" />;

  return (
    <div className="flex flex-row min-h-0 h-full">
      <div className={`flex-1 ${!flipped ? "order-2" : "order-1"}`}>
        <PanelGroup direction="horizontal">
          {flipped ? (
            <>
              {contentPanel}
              {
                // prettier-ignore
                currentTask && (<>{resizeHandle} {sidebarPanel}</>)
              }
            </>
          ) : (
            <>
              {
                // prettier-ignore
                currentTask && (<>{sidebarPanel} {resizeHandle}</>)
              }
              {contentPanel}
            </>
          )}
        </PanelGroup>
      </div>
      <div className={`taskbar ${!flipped ? "order-1" : "order-2"}`}>
        {TaskbarButton("Explorer", <IoFolderSharp />)}
        {TaskbarButton("Projects", <IoCodeWorkingSharp />)}
        {TaskbarButton("Repositories", <IoGitBranchSharp />)}

        <button
          className="mt-auto overflow-x-hidden"
          title="Logout"
          onClick={logout}
        >
          <IoLogOutSharp className="ms-1" />
        </button>
      </div>
    </div>
  );
}
