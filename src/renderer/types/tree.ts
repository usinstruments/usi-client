
export interface TreeNodeData {
  id: string;
  children: TreeNodeData[] | null;
  draggable: boolean;
}
;

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
function popNodeMaybe(
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
    const found = popNodeMaybe(child, id);

    if (found) {
      return found;
    }
  }

  return undefined;
}

export function popNode(tree: TreeNodeData, id: string): TreeNodeData {
  const popped = popNodeMaybe(tree, id);

  if (!popped) {
    throw new Error(`Could not find node ${id}`);
  }

  return popped;
}
function getNodeParentMaybe(
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

    const found = getNodeParentMaybe(child, id);

    if (found) {
      return found;
    }
  }

  return undefined;
}

export function getNodeParent(tree: TreeNodeData, id: string): TreeNodeDataWithChildren {
  const parent = getNodeParentMaybe(tree, id);

  if (!parent) {
    throw new Error(`Could not find parent of node ${id}`);
  }

  return parent;
}
export function nodeIsGrandparent(tree: TreeNodeData, a: string, b: string): boolean {
  // returns true if a is a grandparent of b
  const a_node = findNode(tree, a);
  if (!a_node) {
    throw new Error(`Could not find node ${a}`);
  }

  const b_in_a = findNodeMaybe(a_node, b);
  return b_in_a !== undefined;
}
