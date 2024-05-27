import React, { useContext, useEffect, useRef, useState } from "react";
import {
  IoChevronDownSharp,
  IoChevronForwardSharp,
  IoCubeSharp,
} from "react-icons/io5";

export interface TreeNodeData {
  id: string;
  children: TreeNodeData[] | null;
  draggable: boolean;
};

export interface TreeNodeDataWithChildren extends TreeNodeData {
  children: TreeNodeData[];
};

function findNodeMaybe(
  tree: TreeNodeData,
  id: string
): TreeNodeData | undefined {
  if (tree.id === id) {
    return tree;
  }

  if (tree.children) {
    for (const child of tree.children) {
      const found = findNodeMaybe(child, id);

      if (found) {
        return found;
      }
    }
  }

  return undefined;
}

export function findNode(tree: TreeNodeData, id: string): TreeNodeData {
  const found = findNodeMaybe(tree, id);

  if (!found) {
    throw new Error(`Could not find node ${id}`);
  }

  return found;
}

function _popNode(
  tree: TreeNodeData,
  id: string
): TreeNodeData | undefined {
  if (!tree.children) {
    return undefined;
  }

  for (let i = 0; i < tree.children.length; i++) {
    if (tree.children[i].id === id) {
      return tree.children.splice(i, 1)[0];
    }
  }

  for (const child of tree.children) {
    const found = _popNode(child, id);

    if (found) {
      return found;
    }
  }

  return undefined;
}

export function popNode(tree: TreeNodeData, id: string): TreeNodeData {
  const popped = _popNode(tree, id);

  if (!popped) {
    throw new Error(`Could not find node ${id}`);
  }

  return popped;
}

function _getNodeParent(
  tree: TreeNodeData,
  id: string
): TreeNodeDataWithChildren | undefined {
  if (!tree.children) {
    return undefined;
  }

  for (const child of tree.children) {
    if (child.id === id) {
      return tree as TreeNodeDataWithChildren;
    }

    const found = _getNodeParent(child, id);

    if (found) {
      return found;
    }
  }

  return undefined;
}

export function getNodeParent(tree: TreeNodeData, id: string): TreeNodeDataWithChildren {
  const parent = _getNodeParent(tree, id);

  if (!parent) {
    throw new Error(`Could not find parent of node ${id}`);
  }

  return parent;
}

function nodeIsGrandparent(tree: TreeNodeData, a: string, b: string): boolean {
  // returns true if a is a grandparent of b
  const a_node = findNode(tree, a);
  if (!a_node) {
    throw new Error(`Could not find node ${a}`);
  }

  const b_in_a = findNodeMaybe(a_node, b);
  return b_in_a !== undefined;
}

enum DragTargetLocation {
  Above,
  On,
  Below,
}

type DragTarget = {
  id: string;
  loc: DragTargetLocation;
};

type TreeContextType = {
  selected: string | undefined;
  setSelected: React.Dispatch<React.SetStateAction<string | undefined>>;

  dragTarget: DragTarget | undefined;
  setDragTarget: React.Dispatch<React.SetStateAction<DragTarget | undefined>>;

  collapsed: Set<string>;
  setCollapsed: React.Dispatch<React.SetStateAction<Set<string>>>;
};

// @ts-ignore
const TreeContext = React.createContext<TreeContextType>(undefined);

export function Tree({
  tree,
  moveNode,
}: {
  tree: TreeNodeData;
  moveNode: (inserteeId: string, targetId: string, index: number) => void;
}) {
  const [selected, setSelected] = useState<string | undefined>(undefined);
  const [dragTarget, setDragTarget] = useState<DragTarget | undefined>(
    undefined
  );
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  // const [tree, setTree] = React.useState<TreeNodeData>({id: "root", children: []});

  if (tree.id !== "root") {
    throw new Error("Tree root must have id 'root'");
  }
  if (!tree.children) {
    throw new Error("Tree root must have children");
  }

  return (
    <TreeContext.Provider
      value={{
        selected,
        setSelected,
        dragTarget,
        setDragTarget,
        collapsed,
        setCollapsed,
      }}
    >
      <div
        className="tree h-full"
        onClick={() => setSelected(undefined)}
        onDragOver={(e) => {
          e.preventDefault();
        }}
        onDrop={(e) => {
          e.preventDefault();

          if (!dragTarget) {
            return;
          }

          const next = ((prev) => {
            const inserteeId = e.dataTransfer.getData("text/plain");
            if (inserteeId === "") {
              throw new Error("No insertee id in drop event");
            }

            if (inserteeId === dragTarget.id) {
              // No-op
              return prev;
            }

            if (inserteeId === "root") {
              throw new Error("Not sure how this could happen");
            }

            const insertee = findNode(prev, inserteeId);
            const targetId = dragTarget.id;
            const target = findNode(prev, targetId);
            const targetParent = getNodeParent(prev, targetId);
            const inserteeParent = getNodeParent(prev, inserteeId);

            if (
              !insertee ||
              !target ||
              !inserteeParent ||
              !targetParent ||
              !targetParent.children ||
              !inserteeParent.children
            ) {
              throw new Error("Invalid drop event");
            }

            if (nodeIsGrandparent(prev, inserteeId, targetId)) {
              // No-op, can't drop a parent into a child
              return prev;
            }

            if (dragTarget.loc === DragTargetLocation.On) {
              if (target.children === null) {
                throw new Error("This should not be possible");
              }

              moveNode(inserteeId, targetId, 0);
            } else {
              let inserteeIndex = targetParent.children.indexOf(target);

              if (dragTarget.loc === DragTargetLocation.Below) {
                inserteeIndex++;
              }

              if (targetParent === inserteeParent) {
                const oldInserteeIndex = inserteeParent.children.indexOf(insertee);
                if (oldInserteeIndex < inserteeIndex) {
                  inserteeIndex--;
                }
              }

              moveNode(inserteeId, targetParent.id, inserteeIndex);
            }

            return { ...prev };
          })(tree);

          setDragTarget(undefined);
        }}
      >
        <div className="node-container">
          <div className="children">
            {tree.children.map((node) => (
              <TreeNode key={node.id} node={node} />
            ))}
          </div>
        </div>
      </div>
    </TreeContext.Provider>
  );
}

function depthLine(d: number): number {
  if (d === 0) {
    return 0;
  }

  if (d === 1) {
    return 20;
  }

  return depthLine(d - 1) + 12;
}

function TreeNode({ node, depth }: { node: TreeNodeData; depth?: number }) {
  const nodeRef = useRef<HTMLDivElement>(null);

  // const [open, setOpen] = useState(true);
  const { collapsed, setCollapsed } = useContext(TreeContext);
  const { selected, setSelected } = useContext(TreeContext);
  const { dragTarget, setDragTarget } = useContext(TreeContext);

  const amCollapsed = collapsed.has(node.id);
  const amSelected = selected === node.id;
  const amDragTarget = dragTarget?.id === node.id;

  const mySetCollapsed = (f: (prev: boolean) => boolean) => {
    setCollapsed((prev) => {
      const newSet = new Set(prev);
      const newValue = f(newSet.has(node.id));
      if (newValue) {
        newSet.add(node.id);
      } else {
        newSet.delete(node.id);
      }

      return newSet;
    });
  };

  if (!depth) {
    depth = 0;
  }

  // const depthLine = [0, 20, 32, 44, 5];
  return (
    <div className={`node-container relative`}>
      {depth > 0 && (
        <div
          className="absolute top-0 h-full border-s z-10 border-gray-300 dark:border-gray-700"
          style={{ left: `${depthLine(depth)}px` }}
        ></div>
      )}
      <div
        className={`node ${amSelected && "selected"} relative ${
          amDragTarget &&
          dragTarget.loc === DragTargetLocation.On &&
          "drag-target"
        }`}
        ref={nodeRef}
        draggable={node.draggable}
        onClick={(e) => {
          e.stopPropagation();
          setSelected(node.id);
        }}
        onDragStart={(e) => {
          e.dataTransfer.setData("text/plain", node.id);
        }}
        onDragOver={(e) => {
          const myY = nodeRef.current!.getBoundingClientRect().y;
          const myHeight = nodeRef.current!.getBoundingClientRect().height;

          const relY = (e.clientY - myY) / myHeight;
          let loc: DragTargetLocation;

          if (node.children === null) {
            // only above or below
            if (relY >= 0.5) {
              loc = DragTargetLocation.Below;
            } else {
              loc = DragTargetLocation.Above;
            }
          } else {
            if (relY < 0.25) {
              loc = DragTargetLocation.Above;
            } else if (relY > 0.75) {
              loc = DragTargetLocation.Below;
            } else {
              loc = DragTargetLocation.On;
            }
          }

          setDragTarget({ id: node.id, loc });
        }}
      >
        {amDragTarget && dragTarget.loc === DragTargetLocation.Above && (
          <div
            className="absolute -top-0.5 w-full border-t-2 border-blue-500"
            style={{ left: `${depthLine(depth)}px` }}
          ></div>
        )}
        {amDragTarget && dragTarget.loc === DragTargetLocation.Below && (
          <div
            className="absolute bottom-0 w-full border-t-2 border-blue-500"
            style={{ left: `${depthLine(depth)}px` }}
          ></div>
        )}
        {Array.from({ length: depth }).map((_, i) => (
          <div key={i} className="w-2"></div>
        ))}
        {node.children ? (
          <button
            className="button-or-icon"
            onClick={(e) => {
              e.stopPropagation();
              mySetCollapsed((p) => !p);
            }}
          >
            {!amCollapsed ? <IoChevronDownSharp /> : <IoChevronForwardSharp />}
          </button>
        ) : (
          <div className="button-or-icon">
            <IoCubeSharp />
          </div>
        )}
        <span>{node.id}</span>
      </div>
      {!amCollapsed && node.children && (
        <div className="children">
          {node.children.map((child) => (
            <TreeNode key={child.id} node={child} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
