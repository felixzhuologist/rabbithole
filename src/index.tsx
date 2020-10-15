import React from 'react';
import ReactDOM from 'react-dom';
import ContentEditable from 'react-contenteditable';

import Button from './Button';

function insert<T>(array: T[], index: number, val: T): T[] {
  return [...array.slice(0, index), val, ...array.slice(index, array.length)];
}

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
  nextId: Id;
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

// const initialState = (): State => {
//   const tree: Tree = {};
//   const root: Node = newNode(null);
//   const rootId = 1;
//   tree[rootId] = root;
//   return {
//     tree,
//     currentNode: rootId,
//     nextId: 2,
//   };
// }

const initialState = (): State => {
  return {
    tree: {
      '1': {
        data: '',
        parent: null,
        children: [2],
      },
      '2': {
        data: 'why is this thing so?',
        parent: 1,
        children: [3, 5],
      },
      '3': {
        data:
          "well it could be this i guess.. let's trying making this line really long well it could be this i guess.. let's trying making this line really long well it could be this i guess.. let's trying making this line really long well it could be this i guess.. let's trying making this line really long well it could be this i guess.. let's trying making this line really long",
        parent: 2,
        children: [4],
      },
      '4': {
        data: '',
        parent: 3,
        children: [],
      },
      '5': {
        data: 'or maybe it could be that',
        parent: 2,
        children: [],
      },
    },
    currentNode: 2,
    nextId: 6,
  };
};

const UPDATE_TEXT = 'UPDATE_TEXT';
const SET_NODE = 'SET_NODE';
const PUSH_CHILD = 'PUSH_CHILD';
const LOAD_STATE = 'LOAD_STATE';

type Action = {
  type: string;
  payload: any;
};

type UpdateData = {
  id: Id;
  value: string;
};

type SetNode = Id;

type PushChild = {
  // node to push child to
  node: Id;
  // index that the new node should be inserted at in `node`'s children, or
  // undefined to append to the end
  index?: number;
};

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
    case PUSH_CHILD: {
      const withId: Action = {
        ...action,
        payload: {
          nextId: state.nextId,
          nodeId: action.payload.node,
          index: action.payload.index,
        },
      };
      return {
        ...state,
        nextId: state.nextId + 1,
        tree: treeReducer(state.tree, withId),
      };
    }
    case LOAD_STATE:
      return JSON.parse(action.payload);
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
      const { nodeId, nextId, index } = action.payload;
      const node: Node = tree[nodeId];
      const child = newNode(nodeId);
      return {
        ...tree,
        [nodeId]: {
          ...node,
          children: index
            ? insert(node.children, index, nextId)
            : [...node.children, nextId],
        },
        [nextId]: child,
      };
    }
    default:
      return tree;
  }
};

const App: React.FunctionComponent<Props> = (props: Props) => {
  const [state, dispatch] = React.useReducer(reducer, initialState());
  const [dumpedState, setDumpedState] = React.useState('');
  const rowRefs = React.useRef([]);
  const [pendingFocus, setPendingFocus] = React.useState<number | null>(null);

  const { tree, currentNode } = state;
  const { data, parent, children } = tree[currentNode];

  if (children.length === 0) {
    dispatch({ type: PUSH_CHILD, payload: { node: currentNode } });
  }

  React.useEffect(() => {
    if (pendingFocus !== null) {
      rowRefs.current[pendingFocus].getEl().focus();
      setPendingFocus(null);
    }
  }, [pendingFocus]);

  return (
    <div className="container mx-auto m-8">
      <h3 className="font-sans text-lg font-semibold">{data}</h3>
      <div className="flex flex-col space-y-2 ml-2 my-4">
        {children.map((id, index, children) => {
          return (
            <div
              className={`flex data-row space-x-2 dummy-${index}`}
              key={`${id}.${index}`}
            >
              {/* a combination of the id and index are used as the key above to
               force each row to be re-rendered when the data changes. this is
               because if React does not re-render, the values for `index` and
               `children` will be stale, causing the PUSH_CHILD and re-focusing
               actions to have weird behavior (e.g. when inserting between the
               elements in a list of size two, you could end up with indices
               [0, 1, 1]) */}
              <button
                type="button"
                className="data-row-actions inline-flex items-center px-1.5 py-1.5 text-xs leading-4 font-medium rounded hover:bg-orange-100 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue transition ease-in-out duration-150"
                onClick={() => {
                  dispatch({ type: SET_NODE, payload: id as SetNode });
                }}
              >
                <svg
                  className="text-orange-700 h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                  <path
                    fillRule="evenodd"
                    d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
              <ContentEditable
                ref={(el) => {
                  rowRefs.current[index] = el;
                }}
                className="focus:outline-none flex-grow"
                html={tree[id].data}
                onKeyDown={(event) => {
                  const sel = window.getSelection();
                  if (
                    event.key === 'Enter' &&
                    sel.focusOffset === tree[id].data.length
                  ) {
                    event.preventDefault();
                    event.stopPropagation();
                    dispatch({
                      type: PUSH_CHILD,
                      payload: {
                        node: currentNode,
                        index: index + 1,
                      },
                    });
                    setPendingFocus(index + 1);
                  }
                  if (
                    event.keyCode === 40 &&
                    index < rowRefs.current.length - 1
                  ) {
                    // DOWN
                    if (sel.focusOffset === tree[id].data.length) {
                      event.preventDefault();
                      event.stopPropagation();
                      rowRefs.current[index + 1].getEl().focus();
                    }
                  }
                  if (event.keyCode == 38 && index > 0) {
                    // UP
                    if (sel.focusOffset === 0) {
                      event.preventDefault();
                      event.stopPropagation();
                      rowRefs.current[index - 1].getEl().focus();
                    }
                  }
                }}
                onChange={(event) => {
                  dispatch({
                    type: UPDATE_TEXT,
                    payload: {
                      id,
                      value: event.target.value,
                    } as UpdateData,
                  });
                }}
              />
            </div>
          );
        })}
      </div>
      <div className="flex space-x-2">
        {parent !== null && (
          <Button
            onClick={() => {
              dispatch({ type: SET_NODE, payload: parent as SetNode });
            }}
          >
            pop
          </Button>
        )}
        <Button
          onClick={() => {
            dispatch({
              type: PUSH_CHILD,
              payload: { node: currentNode } as PushChild,
            });
          }}
        >
          add child
        </Button>
      </div>
      <br />
      <div className="container mt-16">
        <textarea
          className="w-full"
          name="loadtree"
          value={dumpedState}
          onChange={(event) => setDumpedState(event.target.value)}
        />
        <div className="flex space-x-2 my-2">
          <Button
            onClick={() => {
              dispatch({ type: LOAD_STATE, payload: dumpedState });
            }}
          >
            load state
          </Button>
          <Button
            onClick={() => {
              console.log(JSON.stringify(state, null, 2));
            }}
          >
            dump state
          </Button>
        </div>
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('reactroot'));
