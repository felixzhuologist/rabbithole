import React from 'react';
import ReactDOM from 'react-dom';

import Button from './components/Button';
import TitleElement from './components/TitleElement';
import SlateContainer from './components/SlateContainer';
import { INIT_CHILDREN, SET_NODE, initialState, reducer } from './state';

const App: React.FunctionComponent<{}> = (props: {}) => {
  const [state, dispatch] = React.useReducer(reducer, initialState());
  const { tree, currentNode } = state;
  const { data, parent, children } = tree[currentNode];

  const initialEditorData = children.map((id) => ({ id, ...tree[id].data }));
  const mergeEditorData = React.useCallback((data: SlateNode[]) => {
    console.log('merging data: ', data);
  }, []);

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
          mergeValue={mergeEditorData}
          onPush={(id: string) => dispatch({ type: SET_NODE, payload: id })}
        />
      </div>
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById('reactroot'));
