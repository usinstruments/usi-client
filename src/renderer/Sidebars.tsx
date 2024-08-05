import React, { useContext, useMemo } from "react";
import {
  IoCubeSharp,
  IoDocumentTextSharp,
  IoFolderSharp,
  IoGitBranchSharp,
  IoSettingsSharp,
} from "react-icons/io5";
import { myFetch } from "./util.ts";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Project, Repo } from "./types/api-types.ts";
import { TreeView } from "./Tree.tsx";
import { TreeNode, treeMap } from "./types/tree.ts";
import { openTab } from "./TabsView.tsx";
import { FileViewer } from "./components/FileViewer.tsx";
import { makeComponentDef as makeComponentDef } from "./components/ComponentFactory.tsx";
import { makeIconDef } from "./components/IconFactory.tsx";
import { ProjectContext } from "./ProjectContext.tsx";

export function Sidebar({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <h1>{title}</h1>
      <div className="min-h-0 flex-1">{children}</div>
    </>
  );
}

export function ExplorerSidebar() {
  // reference implementation of moving nodes
  // const moveNode = (inserteeId: string, targetId: string, index: number) => {
  //   setTree((prev) => {
  //     const insertee = findNode(prev, inserteeId);
  //     const target = findNode(prev, targetId);
  //     popNode(prev, inserteeId);
  //     target.children?.splice(index, 0, insertee);
  //     return { ...prev };
  //   });
  // };
  return <></>;
}
export function ProjectsSidebar() {
  const project = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: () => myFetch("/projects").then((res) => res.json()),
  });

  if (project.isLoading) {
    return <div>Loading...</div>;
  }

  if (project.isError) {
    return <div>Error: {project.error.message}</div>;
  }

  return (
    <div>
      <hr className="border-zinc-200 dark:border-zinc-800" />
      {project.data?.map((project) => (
        <ProjectListItem project={project} key={project.id} />
      ))}
    </div>
  );
}

function ProjectListItem({ project }: { project: Project }) {
  const [hover, setHover] = React.useState(false);
  const { currentProject, setCurrentProject } = useContext(ProjectContext);

  const amCurrent = currentProject?.id === project.id;

  return (
    <>
      <div
        className={`hover:bg-zinc-100 dark:hover:bg-zinc-900 select-none flex flex-row items-center text-xl ps-4 h-10 ${amCurrent ? "bg-green-200 dark:bg-green-800 hover:bg-green-200 dark:hover:bg-green-800" : ""}`}
        onMouseOver={() => setHover(true)}
        onMouseOut={() => setHover(false)}
      >
        <div className="ellipsis">{project.name}</div>
        {hover && !amCurrent && (
          <button
            className="ml-auto px-4 hover:bg-zinc-300 active:bg-zinc-400 dark:hover:bg-zinc-700 dark:active:bg-zinc-600 h-full"
            onClick={() => setCurrentProject(project.id)}
          >
            Open
          </button>
        )}
      </div>
      <hr className="border-zinc-200 dark:border-zinc-800" />
    </>
  );
}

export function ReposSidebar() {
  const repos = useQuery({
    queryKey: ["repos"],
    queryFn: () =>
      myFetch("/repos")
        .then((res) => res.json())
        .then((repos: Repo[]) => {
          const promises = repos.map(async (repo) => {
            const tree = await myFetch(`/repos/${repo.id}/HEAD`).then((res) =>
              res.json()
            );
            return {
              ...repo,
              tree,
            };
          });

          return Promise.all(promises);
        }),
  });

  const repoTree = useMemo(() => {
    if (!repos.data) {
      return undefined;
    }

    const tree: TreeNode = {
      id: "root",
      draggable: false,
      children: repos.data.map((repo) => {
        const treeEntries: TreeNode = treeMap(repo.tree, (node) => {
          return {
            ...node,
            id: `${repo.id}-${node.path}`,
            draggable: false,
            icon:
              node.children === null ? (
                <IoDocumentTextSharp />
              ) : (
                <IoFolderSharp />
              ),
            content: (
              <div
                className="w-full"
                onDoubleClick={() => {
                  if (node.children !== null) {
                    return;
                  }

                  openTab({
                    id: `${repo.id}-${node.path}`,
                    name: node.name,
                    icon: makeIconDef(IoDocumentTextSharp),
                    content: makeComponentDef(FileViewer, {
                      name: node.name,
                      uri: `/repos/${repo.id}/HEAD${node.path}`,
                    }),
                  });
                }}
              >
                {node.name}
              </div>
            ),
          };
        });

        return {
          id: repo.id,
          draggable: false,
          icon: <IoCubeSharp />,
          content: <span>{repo.name}</span>,
          children: treeEntries.children,
        };
      }),
    };

    return tree;
  }, [repos.data]);

  if (repos.isLoading) {
    return <div>Loading...</div>;
  }

  if (repos.isError) {
    return <div>Error: {repos.error.message}</div>;
  }

  if (!repoTree) {
    return <div>No repos</div>;
  }

  return (
    <TreeView
      tree={repoTree}
      initialCollapsed={
        new Set(repoTree.children?.map((node) => node.id) || [])
      }
      moveNode={() => {}}
    />
  );
}
