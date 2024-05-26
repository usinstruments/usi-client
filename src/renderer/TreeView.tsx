import React, { useContext, useEffect, useRef, useState } from "react";
import {
  IoChevronDownSharp,
  IoChevronForwardSharp,
  IoCubeSharp,
} from "react-icons/io5";

type TreeNodeData = {
  id: string;
  children?: TreeNodeData[];
};

function findNode(tree: TreeNodeData, id: string): TreeNodeData | undefined {
  if (tree.id === id) {
    return tree;
  }

  if (tree.children) {
    for (const child of tree.children) {
      const found = findNode(child, id);

      if (found) {
        return found;
      }
    }
  }

  return undefined;
}

function popNode(tree: TreeNodeData, id: string): TreeNodeData | undefined {
  if (!tree.children) {
    return undefined;
  }

  for (let i = 0; i < tree.children.length; i++) {
    if (tree.children[i].id === id) {
      return tree.children.splice(i, 1)[0];
    }
  }

  for (const child of tree.children) {
    const found = popNode(child, id);

    if (found) {
      return found;
    }
  }

  return undefined;
}

function getNodeParent(tree: TreeNodeData, id: string): TreeNodeData | undefined {
  if (!tree.children) {
    return undefined;
  }

  for (const child of tree.children) {
    if (child.id === id) {
      return tree;
    }

    const found = getNodeParent(child, id);

    if (found) {
      return found;
    }
  }

  return undefined;
}

type DragTarget = {
  id: string;
  below: boolean;
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

export function Tree() {
  const [selected, setSelected] = React.useState<string | undefined>(undefined);
  const [dragTarget, setDragTarget] = React.useState<DragTarget | undefined>(
    undefined
  );
  const [collapsed, setCollapsed] = React.useState<Set<string>>(new Set());

  const defaultTree: TreeNodeData = { id: "root", children: [
    {
      id: "A",
      children: [
        {
          id: "A1",
          children: [
            {
              id: "A1a",
            },
            {
              id: "A1b",
            },
          ],
        },
        {
          id: "A2",
        },
      ],
    },
    {
      id: "B",
      children: [
        {
          id: "B1",
        },
        {
          id: "B2",
        },
      ],
    },
  ]};

  const [tree, setTree] = React.useState<TreeNodeData>(defaultTree);

  if (tree.id !== "root") {
    throw new Error("Tree root must have id 'root'");
  }
  if (!tree.children) {
    throw new Error("Tree root must have children");
  }

  return (
    <TreeContext.Provider
      value={{ selected, setSelected, dragTarget, setDragTarget, collapsed, setCollapsed }}
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

          setTree((prev) => {
            const insertee_id = e.dataTransfer.getData("text/plain");
            if (insertee_id === "") {
              throw new Error("No insertee id in drop event");
            }

            if (insertee_id === dragTarget.id) {
              // No-op
              return prev;
            }

            if (insertee_id === "root") {
              throw new Error("Not sure how this could happen");
            }

            const insertee = findNode(prev, insertee_id);
            if (!insertee) {
              throw new Error(`Could not find insertee node ${insertee_id}`);
            }

            const targetId = dragTarget.id;
            const target = findNode(prev, targetId);
            const targetParent = getNodeParent(prev, targetId);
            const inserteeParent = getNodeParent(prev, insertee_id);

            if (!target) {
              throw new Error(`Could not find target node ${dragTarget.id}`);
            }

            if (!targetParent) {
              throw new Error(`Could not find parent of target node ${dragTarget.id}`);
            }

            if (!targetParent.children) {
              throw new Error('This should not be possible');
            }

            if (!inserteeParent) {
              throw new Error(`Could not find parent of insertee node ${insertee_id}`);
            }

            if (!inserteeParent.children) {
              throw new Error('This should not be possible');
            }

            const below = dragTarget.below;

            let insertee_index = targetParent.children.indexOf(target);

            if (below) {
              insertee_index++;
            }

            popNode(prev, insertee_id);
            if (inserteeParent === targetParent && insertee_index > targetParent.children.indexOf(insertee)) {
              insertee_index--;
            }

            targetParent.children.splice(insertee_index, 0, insertee);

            return { ...prev };
          });

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

function TreeNode({ node, depth }: { node: TreeNodeData; depth?: number }) {
  const nodeRef = useRef<HTMLDivElement>(null);

  // const [open, setOpen] = useState(true);
  const { collapsed, setCollapsed } = useContext(TreeContext);
  const { selected, setSelected } = useContext(TreeContext);
  const { dragTarget, setDragTarget } = useContext(TreeContext);

  const amCollapsed = collapsed.has(node.id);
  const amSelected = selected === node.id;
  const amDragTarget = dragTarget?.id === node.id;
  const isTargetBelow = dragTarget?.below;

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
  }

  if (!depth) {
    depth = 0;
  }

  const depthLine = [0, 19, 32, 4, 5];

  return (
    <div className={`node-container relative`}>
      {depth > 0 && (
        <div
          className="absolute top-0 h-full border-s z-10 border-gray-300 dark:border-gray-700"
          style={{ left: `${depthLine[depth]}px` }}
        ></div>
      )}
      <div
        className={`node ${amSelected && "selected"} relative`}
        ref={nodeRef}
        draggable={true}
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

          setDragTarget({ id: node.id, below: relY >= 0.5 });
        }}
      >
        {amDragTarget && !isTargetBelow && (
          <div
            className="absolute -top-0.5 w-full border-t-2 border-blue-500"
            style={{ left: `${depthLine[depth]}px` }}
          ></div>
        )}
        {amDragTarget && isTargetBelow && (
          <div
            className="absolute bottom-0 w-full border-t-2 border-blue-500"
            style={{ left: `${depthLine[depth]}px` }}
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
