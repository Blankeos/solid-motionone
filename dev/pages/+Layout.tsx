import {type FlowProps} from "solid-js"
import type {JSX} from "solid-js/h/jsx-runtime"

export default function RootLayout(props: FlowProps): JSX.Element {
    return <>{props.children}</>
}
