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
import { Project } from "./types/api-types.ts";
import {
  Tree,
} from "./Tree.tsx";
import {
  TreeNodeData,
  findNode,
  getNodeParent,
  popNode
} from "./types/tree.ts";

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
        return <ProjectsSidebar />;
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
    draggable: false,
    children: [
      {
        id: "A",
        draggable: false,
        children: [
          {
            id: "A1",
            draggable: false,
            children: [
              {
                id: "A1a",
                draggable: false,
                children: null,
              },
              {
                id: "A1b",
                draggable: false,
                children: null,
              },
            ],
          },
          {
            id: "A2",
            children: null,
            draggable: false,
          },
        ],
      },
      {
        id: "B",
        draggable: false,
        children: [
          {
            id: "B1",
            draggable: false,
            children: null,
          },
          {
            id: "B2",
            draggable: false,
            children: [
              {
                id: "B2a",
                draggable: false,
                children: null,
              },
              {
                id: "B2b",
                draggable: true,
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

      popNode(prev, inserteeId);
      target.children?.splice(index, 0, insertee);

      return { ...prev };
    });
  };

  return (
    <>
      <h1>Explorer</h1>
      <Tree tree={tree} moveNode={moveNode} />
    </>
  );
}

function ProjectsSidebar() {
  const queryClient = useQueryClient();
  const {isLoading, isError, error, data} = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: () => myFetch("/projects").then((res) => res.json()),
  });

  const projectTree = useMemo(() => {
    if (!data) {
      return undefined;
    }

    const tree: TreeNodeData = {
      id: "root",
      draggable: false,
      children: data.map((project) => ({
        id: project.id,
        draggable: false,
        children: null,
      })),
    };

    return tree;
  }, [data]);

  return (
    <>
      <h1>Projects</h1>
      <div className="flex-1 px-2">
        {isLoading && <div>Loading...</div>}
        {isError && <div>Error: {error.message}</div>}
        {projectTree && <Tree tree={projectTree} moveNode={() => {}} />}
      </div>
    </>
  );
}
