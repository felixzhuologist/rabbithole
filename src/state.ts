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

export const reducer = (state: State, action: any): State => state;
