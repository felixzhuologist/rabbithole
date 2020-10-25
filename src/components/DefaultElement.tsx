import React from 'react';
import { Node as SlateNode } from 'slate';
import { RenderElementProps } from 'slate-react';

type CustomRenderProps = {
  // rb prefix to avoid any clashes with slate properties
  rbOnPush: (id: string, localState: SlateNode[]) => void;
  // the current slate value
  localState: any;
};

// TODO: augment RenderElementProps.Element with our own custom fields
const DefaultElement = (props: RenderElementProps & CustomRenderProps) => {
  if (props.element.depth === 1) {
    return (
      <div {...props.attributes} className={`flex data-row space-x-2`}>
        <button
          style={{ userSelect: 'none' }}
          contentEditable={false}
          type="button"
          className="data-row-actions inline-flex items-start text-xs leading-4 font-medium rounded hover:bg-orange-100 focus:outline-none focus:border-blue-300 focus:shadow-outline-blue transition ease-in-out duration-150"
          onClick={() => props.rbOnPush(props.element.id, props.localState)}
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
        <div className="flex-grow">{props.children}</div>
      </div>
    );
  } else {
    return (
      <div className="min-w-full">{props.children}</div>
    );
  }

}

export default DefaultElement;
