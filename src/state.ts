import produce from 'immer';
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
        parent: 0,
        children: [],
      },
    },
    currentNode: rootId,
  };
};

export const SET_NODE = 'SET_NODE';
export const INIT_CHILDREN = 'INIT_CHILDREN';

// TODO: type actions once they become unwieldy
export const reducer = (state: State, action: any): State => {
  switch (action.type) {
    case SET_NODE:
      return {
        ...state,
        currentNode: action.payload,
      };
    case INIT_CHILDREN:
      return {
        ...state,
        tree: treeReducer(state.tree, action),
      };
    default:
      return state;
  }
};

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
      }
      default:
        return tree;
    }
  }
);
