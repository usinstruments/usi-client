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