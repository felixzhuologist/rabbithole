import { Node as SlateNode } from 'slate';

// TODO: generalize
const TitleElement = (props: SlateNode) => {
  console.log(props);
  return (
    <h3 className="font-sans text-lg font-semibold">
      {props.children[0].text}
    </h3>
  );
};

export default TitleElement;
