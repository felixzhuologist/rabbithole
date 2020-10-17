import React from 'react';
import ReactDOM from 'react-dom';
import ContentEditable from 'react-contenteditable';
import { createEditor } from 'slate';
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


const DefaultElement = (props: RenderElementProps) => (
  <div {...props.attributes} className={`flex data-row space-x-2`}>
    <button
      style={{ userSelect: 'none' }}
      contentEditable={false}
      type="button"
      className="data-row-actions inline-flex items-center text-xs leading-4 font-medium rounded hover:bg-orange-100 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue transition ease-in-out duration-150"
      onClick={() => {
        {/*dispatch({ type: SET_NODE, payload: id as SetNode });*/}
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

const App: React.FunctionComponent<Props> = (props: Props) => {
  const [visibleNodes, setVisibleNodes] = React.useState(new Set([1, 3]));

  const renderElement = React.useCallback((props: RenderElementProps) => {
    if (!visibleNodes.has(props.element.id)) {
      return null;
    }
    return <DefaultElement {...props} />
  }, [visibleNodes]);
  const editor = React.useMemo(() => withReact(createEditor()), []);
  const [value, setValue] = React.useState([
    {
      id: 1,
      type: 'paragraph',
      children: [{ text: 'some text.' }],
    },
    {
      id: 2,
      type: 'paragraph',
      children: [{ text: 'foo' }],
    },
    {
      id: 3,
      type: 'paragraph',
      children: [
        { text: 'parent' },
        {
          id: 4,
          type: 'paragraph',
          children: [{ text: 'child1' }],
        },
        {
          id: 5,
          type: 'paragraph',
          children: [{ text: 'child2 '}],
        },
      ]
    }
  ]);

  return (
    <div className="container mx-auto m-8">
      <h3 className="font-sans text-lg font-semibold">
        Some topic title
      </h3>
      <div className="flex flex-col space-y-2 ml-2 my-4">
        <Slate editor={editor} value={value} onChange={newValue => { console.log(newValue); setValue(newValue); }}>
          <Editable renderElement={renderElement} />
        </Slate>
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('reactroot'));
