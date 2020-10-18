import produce from 'immer';
import isHotKey from 'is-hotkey';
import { nanoid } from 'nanoid';
import React from 'react';
import ReactDOM from 'react-dom';
import ContentEditable from 'react-contenteditable';
import { Editor, Node as SlateNode, createEditor, Text } from 'slate';
import { Slate, Editable, withReact, RenderElementProps } from 'slate-react';

import Button from './Button';

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

// const initialState = (): State => {
//   return {
//     tree: {
//       '1': {
//         data: '',
//         parent: null,
//         children: [2],
//       },
//       '2': {
//         data: 'why is this thing so?',
//         parent: 1,
//         children: [3, 5],
//       },
//       '3': {
//         data:
//           "well it could be this i guess.. let's trying making this line really long well it could be this i guess.. let's trying making this line really long well it could be this i guess.. let's trying making this line really long well it could be this i guess.. let's trying making this line really long well it could be this i guess.. let's trying making this line really long",
//         parent: 2,
//         children: [4],
//       },
//       '4': {
//         data: '',
//         parent: 3,
//         children: [],
//       },
//       '5': {
//         data: 'or maybe it could be that',
//         parent: 2,
//         children: [],
//       },
//     },
//     currentNode: 2,
//     nextId: 6,
//   };
// };

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

const initialState = (): State => {
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

// TODO: generalize
const TitleElement = (props: SlateNode) => (
  <h3 className="font-sans text-lg font-semibold">{props.children[0].text}</h3>
);

const DefaultElement = (props: RenderElementProps) => (
  <div {...props.attributes} className={`flex data-row space-x-2 border`}>
    <button
      style={{ userSelect: 'none' }}
      contentEditable={false}
      type="button"
      className="data-row-actions inline-flex items-start text-xs leading-4 font-medium rounded hover:bg-orange-100 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue transition ease-in-out duration-150"
      onClick={() => {
        {
          console.log(props.element.id);
          /*dispatch({ type: SET_NODE, payload: id as SetNode });*/
        }
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
    <p>{props.children}</p>
  </div>
);

type SlateContainerProps = {
  value: SlateNode[];
  mergeValue: (value: SlateNode[]) => void;
  generateId: () => Id;
};

const SlateContainer = (props: SlateContainerProps) => {
  const { value, mergeValue } = props;
  const [localValue, setLocalValue] = React.useState(value);
  React.useEffect(() => {
    return () => {
      mergeValue(localValue);
    };
  }, []);

  const editor = React.useMemo(() => withReact(createEditor()), []);

  const renderElement = React.useCallback((props: RenderElementProps) => {
    return <DefaultElement {...props} />;
  }, []);

  return (
    <Slate
      editor={editor}
      value={localValue}
      onChange={(newValue) => {
        setLocalValue(
          produce(newValue, (val) => {
            for (let i = 0; i < val.length; ++i) {
              // invariant: all nodes only contain leaf (text) nodes as children.
              // TODO: don't do this check in prod
              if (!val[i].children.every((child) => Text.isText(child))) {
                console.warn(`Slate node ${i} is not flat: `, val[i]);
              }
              // node splitting will cause the two pieces of the split node to share
              // the same ID. as a hacky workaround, check for consecutive nodes
              // with the same ID and give the second one a new ID
              if (i > 0 && val[i - 1].id === val[i].id) {
                val[i].id = nanoid();
              }
            }
          })
        );
      }}
    >
      <Editable
        onKeyDown={(event: React.KeyboardEvent<HTMLDivElement>) => {
          // by default make enter a soft break, and shift+enter a hard break
          if (isHotKey('shift+enter', event)) {
            event.preventDefault();
            editor.insertBreak(editor);
            return;
          }
          if (event.key === 'Enter') {
            event.preventDefault();
            editor.insertText('\n');
            return;
          }
        }}
        renderElement={renderElement}
      />
    </Slate>
  );
};

const reducer = (state: State, action: any): State => state;

const App: React.FunctionComponent<{}> = (props: {}) => {
  const [state, dispatch] = React.useReducer(reducer, initialState());
  const { tree, currentNode } = state;
  const { data, parent, children } = tree[currentNode];

  const initialEditorData = children.map((id) => ({ id, ...tree[id].data }));
  const mergeEditorData = React.useCallback((data: SlateNode[]) => {
    console.log('merging data: ', data);
  }, []);

  return (
    <div className="container mx-auto m-8">
      {data && <TitleElement {...data} />}
      <div className="flex flex-col space-y-2 ml-2 my-4">
        <SlateContainer
          value={initialEditorData}
          mergeValue={mergeEditorData}
        />
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('reactroot'));
