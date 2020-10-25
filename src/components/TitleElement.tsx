import React from 'react';
import { Node as SlateNode } from 'slate';

type Props = {
  node: SlateNode | null;
  onClick: () => void;
};

// TODO: generalize
const TitleElement = (props: Props) => {
  const { node, onClick } = props;
  if (node === null) {
    // TODO: this height is hardcoded to the height of the div when there
    // is content. There's definitely a better way to do this.
    return <div style={{ minHeight: 27 }} />;
  }
  return (
    <div className="flex data-row space-x-2">
      <button type="button" className="data-row-actions" onClick={onClick}>
        <svg
          className="text-orange-700 h-5 w-5"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M11 19l-7-7 7-7m8 14l-7-7 7-7"
          />
        </svg>
      </button>
      <h3 className="font-sans text-lg font-semibold">
        {node.children[0].text}
      </h3>
    </div>
  );
};

export default TitleElement;
