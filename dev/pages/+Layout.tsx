import {type FlowProps} from "solid-js"
import type {JSX} from "solid-js/h/jsx-runtime"
import {rootlessLayoutStore} from "../../src/layout"

import "../app.css"

export default function RootLayout(props: FlowProps): JSX.Element {
	const {layoutStore, increment} = rootlessLayoutStore

	return (
		<>
			{props.children}
			<button onClick={increment}>increase {JSON.stringify(layoutStore.count)}</button>
		</>
	)
}
