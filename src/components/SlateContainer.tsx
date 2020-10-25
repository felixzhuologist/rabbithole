import produce from 'immer';
import isHotKey from 'is-hotkey';
import { nanoid } from 'nanoid';
import React from 'react';
import { Editor, Node as SlateNode, createEditor, Text } from 'slate';
import { Slate, Editable, withReact, RenderElementProps } from 'slate-react';

import Button from './Button';
import DefaultElement from './DefaultElement';
import TitleElement from './TitleElement';

type Props = {
  title: SlateNode | null;
  value: SlateNode[];
  onPush: (id: string, localState: SlateNode[]) => void;
  onPop: null | ((localState: SlateNode[]) => void);
};

const SlateContainer = (props: Props) => {
  const { value, title, onPush, onPop } = props;
  const [localValue, setLocalValue] = React.useState(value);

  const editor = React.useMemo(() => withReact(createEditor()), []);

  React.useEffect(() => {
    if (value !== localValue) {
      // with a new local value, the current selection may no longer be valid
      // (e.g. the selection is out of bounds for the new text)
      editor.selection = null;
      console.log('new local value: ', value);
      setLocalValue(value);
    }
  }, [value]);

  const renderElement = React.useCallback(
    (props: RenderElementProps) => {
      return (
        <DefaultElement {...props} rbOnPush={onPush} localState={localValue} />
      );
    },
    [localValue]
  );

  return (
    <React.Fragment>
      {title && <TitleElement {...title} onClick={() => onPop(localValue)} />}
      <div className="flex flex-col space-y-2 ml-2 my-4">
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
      </div>
    </React.Fragment>
  );
};

export default SlateContainer;
