import React, { useMemo } from "react";
import { useUser } from "./Login.tsx";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import {
  IoCodeWorkingSharp,
  IoFolderSharp,
  IoGitBranchSharp,
  IoLogOutSharp,
} from "react-icons/io5";
import { useAtom } from "jotai";
import { myFetch, myStoredAtom } from "./util.ts";
import { TabsView } from "./TabsView.tsx";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Project } from "./api-types.ts";
import { Tree, TreeNodeData, findNode, getNodeParent, popNode } from "./Tree.tsx";

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

  const SidebarView = () => {
    switch (currentTask) {
      case "Explorer":
        return <ExplorerSidebar />;
      case "Projects":
        return <SidebarProjects />;
      case "Template Repos":
        return <div>Template Repos</div>;

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
        <SidebarView />
      </Panel>
    );
  }, [currentTask]);

  const resizeHandle = <PanelResizeHandle className="panel-resize-handle" />;

  return (
    <div className="flex flex-row h-full">
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
        {TaskbarButton("Template Repos", <IoGitBranchSharp />)}

        <button
          className="mt-auto overflow-hidden"
          title="Logout"
          onClick={logout}
        >
          <IoLogOutSharp className="ms-1" />
        </button>
      </div>
    </div>
  );
}

function ExplorerSidebar() {
  const dummyTree: TreeNodeData = {
    id: "root",
    children: [
      {
        id: "A",
        children: [
          {
            id: "A1",
            children: [
              {
                id: "A1a",
                children: null
              },
              {
                id: "A1b",
                children: null
              },
            ],
          },
          {
            id: "A2",
            children: null,
          },
        ],
      },
      {
        id: "B",
        children: [
          {
            id: "B1",
            children: null,
          },
          {
            id: "B2",
            children: [
              {
                id: "B2a",
                children: null,
              },
              {
                id: "B2b",
                children: null,
              },
            ],
          },
        ],
      },
    ],
  };

  const [tree, setTree] = React.useState<TreeNodeData>(dummyTree);
  const moveNode = (inserteeId: string, targetId: string, index: number) => {
    setTree((prev) => {
      const insertee = findNode(prev, inserteeId);
      const target = findNode(prev, targetId);

      const inserteeParent = getNodeParent(prev, inserteeId);

      if (!insertee || !target || !inserteeParent || !inserteeParent.children) {
        throw new Error("Invalid moveNode arguments");
      }

      if (target === inserteeParent) {
        const inserteeIndex = inserteeParent.children.indexOf(insertee);
        if (inserteeIndex < index) {
          index--;
        }
      }

      popNode(prev, inserteeId);
      target.children?.splice(index, 0, insertee);

      return { ...prev };
    });
  }

  return (
    <>
      <h1>Explorer</h1>
      <Tree tree={tree} moveNode={moveNode} />
    </>
  );
}

function SidebarProjects() {
  const queryClient = useQueryClient();
  const query = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: () => myFetch("/projects").then((res) => res.json()),
  });

  return (
    <>
      <h1>Projects</h1>
      <div className="flex-1 px-2">
        {query.isLoading && <div>Loading...</div>}
        {query.isError && <div>Error: {query.error.message}</div>}
        {query.data?.map((project) => (
          <div key={project.id}>{project.name}</div>
        ))}
      </div>
    </>
  );
}
