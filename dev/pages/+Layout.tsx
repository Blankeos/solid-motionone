import {type FlowProps} from "solid-js"
import type {JSX} from "solid-js/h/jsx-runtime"

import {useLayoutStore} from "../../src/layout"

export default function RootLayout(props: FlowProps): JSX.Element {
	const layoutStore = useLayoutStore()

	return (
		<>
			{props.children}
			<button onClick={layoutStore().increment}>
				increase {JSON.stringify(layoutStore().count)}
			</button>
		</>
	)
}
