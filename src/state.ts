import produce, { current } from 'immer';
import { nanoid } from 'nanoid';
import { Node as SlateNode } from 'slate';

type Id = string;

type Node = {
  data: SlateNode | null;
  parent: Id | null;
  children: Id[];
};

type Tree = { [key: number]: Node };

type State = {
  tree: Tree;
  currentNode: Id;
};

export const initialState = (): State => {
  const rootId = nanoid();
  const childId = nanoid();
  return {
    tree: {
      [rootId]: {
        data: null,
        parent: null,
        children: [childId],
      },
      [childId]: {
        data: {
          type: 'paragraph',
          children: [{ text: 'some starter text for ya' }],
        },
        parent: rootId,
        children: [],
      },
    },
    currentNode: rootId,
  };
};

export const SET_NODE = 'SET_NODE';
export const INIT_CHILDREN = 'INIT_CHILDREN';

// TODO: type actions once they become unwieldy
export const reducer = produce(
  (state: State, action: any): State => {
    console.log(current(state), action);
    switch (action.type) {
      case SET_NODE:
        // SET_NODE gets passed the next id (i.e. the node that has been "pushed"),
        // as well as the slate editor's local state which needs to be merged back
        // in. This is all wrapped up into one operation to avoid reasoning with
        // component lifecycle and rerendering issues.
        const { id: nextId, localState } = action.payload as {
          id: string;
          localState: SlateNode[];
        };

        // merge the local slate state into the global app state. this involves
        // setting the current node's children and updating the children
        state.tree[state.currentNode].children = localState.map(
          (node) => node.id
        );
        localState.forEach((node) => {
          // local slate nodes may exist but with new data, or may be new
          if (node.id in state.tree) {
            state.tree[node.id].data = node;
          } else {
            state.tree[node.id] = {
              data: node,
              parent: state.currentNode,
              children: [],
            };
          }

          // if we're about to push into a new node with no children yet,
          // initialize them first
          if (node.id === nextId && state.tree[nextId].children.length === 0) {
            const id = nanoid();
            const newNode: Node = {
              data: { type: 'paragraph', children: [{ text: '' }] },
              parent: nextId,
              children: [],
            };
            state.tree[node.id].children = [id];
            state.tree[id] = newNode;
          }
        });

        // finally, set the current node to the pushed node's ID
        state.currentNode = nextId;
        break;
      case INIT_CHILDREN:
        state.tree = treeReducer(state.tree, action);
        break;
      case MERGE_DATA:
        const payload = action.payload as SlateNode[];
        const updated = action.payload.map((node) => node.id);

        let parentId = null;
        action.payload.forEach((node) => {
          const withoutId = {
            type: node.type,
            children: node.children,
          };
          if (node.id in state.tree) {
            state.tree[node.id].data = withoutId;

            // NOTE: the parents should all be the same. it would maybe be
            // worth logging if that's not the case.
            parentId = parentId || state.tree[node.id].parent;
          } else {
            console.assert(parentId !== null);
            state.tree[node.id] = {
              data: withoutId,
              parent: parentId,
              children: [],
            };
          }
        });

        state.tree[parentId].children = updated;
        break;
      default:
        break;
    }
    console.log(current(state));
  }
);

export const treeReducer = produce(
  (tree: Tree, action: any): Tree => {
    switch (action.type) {
      case INIT_CHILDREN: {
        const id = nanoid();
        const newNode: Node = {
          data: { type: 'paragraph', children: [{ text: '' }] },
          parent: action.payload,
          children: [],
        };

        tree[action.payload].children = [id];
        tree[id] = newNode;
        break;
      }
      default:
        break;
    }
  }
);
