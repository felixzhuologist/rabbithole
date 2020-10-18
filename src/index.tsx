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

  return (
    <div className="container mx-auto m-8">
      {data && <TitleElement {...data} />}
      <SlateContainer
        value={initialEditorData}
        onPush={(id: string, localState: SlateNode[]) => {
          dispatch({ type: SET_NODE, payload: { id, localState } });
        }}
        onPop={
          parent &&
          ((localState: SlateNode[]) => {
            dispatch({ type: SET_NODE, payload: { id: parent, localState } });
          })
        }
      />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('reactroot'));
