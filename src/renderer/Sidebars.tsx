import React, { useMemo } from "react";
import {
  IoCubeSharp,
  IoDocumentTextSharp, IoFolderSharp, IoGitBranchSharp, IoSettingsSharp
} from "react-icons/io5";
import { myFetch } from "./util.ts";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Project, Repo } from "./types/api-types.ts";
import { TreeView } from "./Tree.tsx";
import { TreeNode, treeMap } from "./types/tree.ts";

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
  return (
    <>
      <h1>Explorer</h1>
    </>
  );
}
export function ProjectsSidebar() {
  const queryClient = useQueryClient();
  const project = useQuery<Project[]>({
    queryKey: ["projects"],
    queryFn: () => myFetch("/projects").then((res) => res.json()),
  });

  const projectTree = useMemo(() => {
    if (!project.data) {
      return undefined;
    }

    const tree: TreeNode = {
      id: "root",
      draggable: false,
      children: project.data.map((project) => {
        return {
          id: project.id,
          draggable: false,
          icon: <IoDocumentTextSharp />,
          content: <div className="w-full">{project.name}</div>,
          children: [
            {
              id: `${project.id}-repo`,
              draggable: false,
              icon: <IoGitBranchSharp />,
              content: (
                <span>
                  {project.template_repo.name} @ {project.template_repo_branch}
                </span>
              ),
              children: null, // TODO show files at this commit
            },
            {
              id: `${project.id}-config`,
              draggable: false,
              icon: <IoSettingsSharp />,
              content: <span>Config</span>,
              children: null,
            },
          ],
        };
      }),
    };

    return tree;
  }, [project.data]);

  return (
    <>
      <h1>Projects</h1>
      <div className="flex-1">
        {project.isLoading && <div>Loading...</div>}
        {project.isError && <div>Error: {project.error.message}</div>}
        {projectTree && <TreeView tree={projectTree} moveNode={() => { }} />}
      </div>
    </>
  );
}
export function ReposSidebar() {
  const repos = useQuery({
    queryKey: ["repos"],
    queryFn: () => myFetch("/repos").then((res) => res.json()).then((repos: Repo[]) => {
      const promises = repos.map(async (repo) => {
        const tree = await myFetch(`/repos/${repo.id}/HEAD`).then((res) => res.json());
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
        const treeEntries = treeMap(repo.tree, (node) => {
          return {
            ...node,
            id: `${repo.id}-${node.name}`,
            draggable: false,
            icon: node.children === null ? <IoDocumentTextSharp /> : <IoFolderSharp />,
            content: <span>{node.name}</span>,
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

  return (
    <>
      <h1>Repositories</h1>
      <div className="flex-1">
        {repos.isLoading && <div>Loading...</div>}
        {repos.isError && <div>Error: {repos.error.message}</div>}
        {repoTree && <TreeView tree={repoTree} moveNode={() => { }} />}
      </div>
    </>
  );
}
