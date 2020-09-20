import React from 'react';
import ReactDOM from 'react-dom';

type Props = {};

type Id = number;

type Node = {
  data: string;
  parent: Id | null;
  children: Id[];
};

type Tree = { [key: number]: Node };

type State = {
  tree: Tree;
  currentNode: Id;
};

let currentId = 0;

const getNextId = (): Id => {
  currentId += 1;
  return currentId;
};

const newNode = (parent: Id | null): Node => ({
  data: '',
  parent,
  children: [],
});

const initialState = (): State => {
  const tree: Tree = {};
  const root: Node = newNode(null);
  const rootId = getNextId();
  tree[rootId] = root;
  return {
    tree,
    currentNode: rootId,
  };
};

const UPDATE_TEXT = 'UPDATE_TEXT';
const SET_NODE = 'SET_NODE';
const PUSH_CHILD = 'PUSH_CHILD';

type Action = {
  type: string;
  payload: any;
};

type UpdateData = {
  id: Id;
  value: string;
};

type SetNode = Id;

type PushChild = Id;

const reducer = (state: State, action: Action): State => {
  console.log(state, action);
  switch (action.type) {
    case UPDATE_TEXT:
      return {
        ...state,
        tree: treeReducer(state.tree, action),
      };
    case SET_NODE:
      return {
        ...state,
        currentNode: action.payload as SetNode,
      };
    case PUSH_CHILD:
      return {
        ...state,
        tree: treeReducer(state.tree, action),
      };
    default:
      return state;
  }
};

const treeReducer = (tree: Tree, action: Action): Tree => {
  switch (action.type) {
    case UPDATE_TEXT:
      const { id, value } = action.payload as UpdateData;
      return {
        ...tree,
        [id]: {
          ...tree[id],
          data: value,
        },
      };
    case PUSH_CHILD: {
      const node: Node = tree[action.payload];
      const child = newNode(action.payload);
      const newId = getNextId();
      return {
        ...tree,
        [action.payload]: {
          ...node,
          children: [...node.children, newId],
        },
        [newId]: child,
      };
    }
    default:
      return tree;
  }
};

const App: React.FunctionComponent<Props> = (props: Props) => {
  const [state, dispatch] = React.useReducer(reducer, initialState());
  const { tree, currentNode } = state;
  const { data, parent, children } = tree[currentNode];

  return (
    <div>
      <h3>{data}</h3>
      {children.map((id) => (
        <div key={id}>
          <input
            type="text"
            value={tree[id].data}
            onChange={(event) => {
              dispatch({
                type: UPDATE_TEXT,
                payload: { id, value: event.target.value } as UpdateData,
              });
            }}
          />
          <button
            type="button"
            onClick={() => {
              dispatch({ type: SET_NODE, payload: id as SetNode });
            }}
          >
            push
          </button>
        </div>
      ))}
      {parent !== null && (
        <button
          type="button"
          onClick={() => {
            dispatch({ type: SET_NODE, payload: parent as SetNode });
          }}
        >
          pop
        </button>
      )}
      <button
        type="button"
        onClick={() => {
          dispatch({ type: PUSH_CHILD, payload: currentNode as PushChild });
        }}
      >
        add child
      </button>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('reactroot'));
