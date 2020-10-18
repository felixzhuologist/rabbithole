import React from 'react';
import ReactDOM from 'react-dom';
import { Node as SlateNode } from 'slate';

import Button from './components/Button';
import TitleElement from './components/TitleElement';
import SlateContainer from './components/SlateContainer';
import {
  MERGE_DATA,
  INIT_CHILDREN,
  SET_NODE,
  initialState,
  reducer,
} from './state';

const App: React.FunctionComponent<{}> = (props: {}) => {
  const [state, dispatch] = React.useReducer(reducer, initialState());
  const { tree, currentNode } = state;
  const { data, parent, children } = tree[currentNode];

  // TODO: the reducer keeps the IDs when merging nodes back into the state,
  // so this is really only necessary before the first merge
  const initialEditorData = children.map((id) => ({ ...tree[id].data, id }));

  if (children.length === 0) {
    dispatch({ type: INIT_CHILDREN, payload: currentNode });
    return null;
  }

  return (
    <div className="container mx-auto m-8">
      {data && <TitleElement {...data} />}
      <div className="flex flex-col space-y-2 ml-2 my-4">
        <SlateContainer
          value={initialEditorData}
          onPush={(id: string, localState: SlateNode[]) => {
            dispatch({ type: SET_NODE, payload: { id, localState } });
          }}
        />
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('reactroot'));
