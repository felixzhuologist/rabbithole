import produce, { current } from 'immer';
import isHotKey from 'is-hotkey';
import { nanoid } from 'nanoid';
import React from 'react';
import {
  Editor,
  Element,
  Node as SlateNode,
  NodeEntry,
  createEditor,
  Range,
  Text,
  Transforms,
} from 'slate';
import { Slate, Editable, withReact, RenderElementProps } from 'slate-react';

import Button from './Button';
import CodeElement from './CodeElement';
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
  editor.normalizeNode = (entry: NodeEntry) => {
    // console.log(entry);
    const [node, path] = entry;
    const depth = path.length;

    // no normalizations for text nodes
    if (Text.isText(node)) {
      return;
    }

    // (omitted: ensuring that block and inline nodes have at least one child)

    // mark the depth of nodes, which affects how they are rendered
    Transforms.setNodes(editor, { depth }, { at: path });

    if (depth === 1) {
      // ensure that all children of a node are either Elements or Texts, which
      // seems to be an assumption that many Transforms have to function
      // properly (see default normalizeNode function)
      const hasLeaves = node.children.some((child) => Text.isText(child));
      const hasElements = node.children.some((child) =>
        Element.isElement(child)
      );
      if (hasLeaves && hasElements) {
        node.children.forEach((child, i) => {
          if (!Text.isText(child)) {
            return;
          }
          Transforms.wrapNodes(
            editor,
            { type: 'paragraph', children: [] },
            { at: path.concat(i) }
          );
        });
      }
    }

    // Since we'll be applying operations while iterating, keep track of an
    // index that accounts for any added/removed nodes.
    let n = 0;
    for (let i = 0; i < node.children.length; i++, n++) {
      const child = node.children[i] as Descendant;
      if (!Text.isText(child)) {
        continue;
      }
      const prev = node.children[i - 1] as Descendant;
      const isLast = i === node.children.length - 1;

      // Merge adjacent text nodes that are empty or match.
      if (prev != null && Text.isText(prev)) {
        if (Text.equals(child, prev, { loose: true })) {
          Transforms.mergeNodes(editor, { at: path.concat(n), voids: true });
          n--;
        } else if (prev.text === '') {
          Transforms.removeNodes(editor, {
            at: path.concat(n - 1),
            voids: true,
          });
          n--;
        } else if (isLast && child.text === '') {
          Transforms.removeNodes(editor, {
            at: path.concat(n),
            voids: true,
          });
          n--;
        }
      }
    }

    // Remove and collapse nodes that have empty text AND are not top level nodes.
    // if (node.children.length === 1 && Text.isText(node.children[0]) && node.children[0].text === '' && depth > 1) {
    //   Transforms.removeNodes(editor, { at: path });
    // }
  };

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
      switch (props.element.type) {
        case 'code':
          return <CodeElement {...props} />;
        default:
          return (
            <DefaultElement
              {...props}
              rbOnPush={onPush}
              localState={localValue}
            />
          );
      }
    },
    [localValue]
  );

  console.log(localValue);

  return (
    <React.Fragment>
      <TitleElement node={title} onClick={() => onPop(localValue)} />
      <div className="flex flex-col space-y-2 ml-2 my-4">
        <Slate
          editor={editor}
          value={localValue}
          onChange={(newValue) => {
            // TODO: move this to normalize
            setLocalValue(
              produce(newValue, (val) => {
                for (let i = 0; i < val.length; ++i) {
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

                // TODO: can this be abstracted out as a plugin?
                // based on: https://github.com/ianstormtaylor/slate/blob/master/site/examples/mentions.tsx
                const { selection } = editor;
                if (selection && Range.isCollapsed(selection)) {
                  const [start] = Range.edges(selection);

                  // wordBefore gets the Point that starts at the word before start.
                  // I think `before` is meant to include any leading whitespace
                  const wordBefore = Editor.before(editor, start, {
                    unit: 'word',
                  });
                  const before =
                    wordBefore && Editor.before(editor, wordBefore);

                  const beforeRange =
                    before && Editor.range(editor, before, start);
                  const beforeText =
                    beforeRange && Editor.string(editor, beforeRange);
                  const beforeMatch =
                    beforeText && beforeText.match(/\n```(\w*)$/);
                  if (beforeMatch) {
                    // some alternatives, in case it's useful...
                    // for some reason, this moves the cursor but doesn't actually
                    // delete text when done in onChange instead of here
                    // Transforms.delete(editor, { at: Editor.range(editor, wordBefore, start) });
                    // editor.apply({ type: 'remove_text', ...wordBefore, text: beforeText.slice(1) });
                    editor.deleteBackward('word');
                    Transforms.insertNodes(
                      editor,
                      {
                        type: 'code',
                        children: [{ text: '' }],
                      },
                      { match: (n) => Text.isText(n) }
                    );
                    return;
                  }
                }

                editor.insertText('\n');
                return;
              }
              if (isHotKey('cmd+j', event) && editor.selection) {
                event.preventDefault();
                // Editor.node will return the leaf text node, so what we want
                // is Editor.parent which will be the SlateNode (i.e. containing the id)
                const currentNode = Editor.parent(editor, editor.selection)[0];
                console.assert(
                  currentNode.id,
                  'queried node for push has no id: ',
                  currentNode
                );
                onPush(currentNode.id, localValue);
                return;
              }
              // TODO: this should be a global event handler
              if (isHotKey('cmd+k', event) && onPop) {
                event.preventDefault();
                onPop(localValue);
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
