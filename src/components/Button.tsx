import React from 'react';

type Props = {
  onClick: () => void;
};

const Button = (props: Props) => {
  const { children, onClick } = props;
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs leading-4 font-medium rounded text-orange-700 hover:bg-orange-100 bg-orange-50 focus:outline-none focus:border-orange-300 focus:shadow-outline-orange active:bg-orange-200 transition ease-in-out duration-150"
    >
      {children}
    </button>
  );
};

export default Button;
