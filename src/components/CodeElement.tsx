import React from 'react';
import { Node as SlateNode } from 'slate';

const CodeElement = (props: SlateNode) => {
  return (
    <pre {...props.attributes} spellcheck="false">
      <code>{props.children}</code>
    </pre>
  );
};

export default CodeElement;
