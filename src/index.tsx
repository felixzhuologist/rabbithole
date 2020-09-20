import React from 'react';
import ReactDOM from 'react-dom';

type Props = {};

const App: React.FunctionComponent<Props> = (props: Props) => {
	return (
		<p>Hello rabbit</p>
	);
}

ReactDOM.render(
	<App />,
	document.getElementById('reactroot')
);
