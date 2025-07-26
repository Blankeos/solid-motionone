import {createSignal, For, onCleanup, onMount, Show} from "solid-js"
import type {JSX} from "solid-js/h/jsx-runtime"
import {Motion, Presence} from "../../../src"
import {rootlessLayoutStore} from "../../../src/layout"

export default function Page(): JSX.Element {
	const [isOn, setIsOn] = createSignal(false)

	const {layoutStore} = rootlessLayoutStore

	return (
		<>
			<div
				style={{
					display: "flex",
					height: "100vh",
					"flex-direction": "column",
					"align-items": "center",
					"justify-content": "center",
					gap: "50px",
				}}
			>
				<h1>Motion One + Solid Demo</h1>
				<Motion.div
					animate={{opacity: [0, 1]}}
					transition={{duration: 1, easing: "ease-in-out"}}
				>
					Fade in animation
				</Motion.div>

				<Motion.button
					animate={{rotate: 90, backgroundColor: "yellow"}}
					transition={{duration: 1}}
				>
					Rotate and color change
				</Motion.button>

				<Presence>
					<Motion.div
						initial={{opacity: 0, scale: 0.6}}
						animate={{opacity: 1, scale: 1}}
						exit={{opacity: 0, scale: 0.6}}
						transition={{duration: 0.3}}
					>
						Presence animation
					</Motion.div>
				</Presence>

				<Motion.div hover={{scale: 1.2}} press={{scale: 0.9}}>
					Hover and press effects {layoutStore.count}
				</Motion.div>

				<SwitchLayoutExample />

				<SharedLayoutExample />

				<ReorderExample />
			</div>
		</>
	)
}

function SwitchLayoutExample() {
	const [isOn, setIsOn] = createSignal(false)

	return (
		<Motion.button
			style={{
				"border-radius": "9999px",
				"background-color": "#9ca3af",
				padding: "0.5rem",
				transition: "background-color 0.3s ease",
				border: "none",
				cursor: "pointer",
				width: "90px",
				display: "flex",
				"justify-content": isOn() ? "flex-start" : "flex-end",
			}}
			onClick={() => setIsOn(!isOn())}
		>
			<Motion.div
				data-switch-circle="true"
				layout
				style={{
					background: "blue",
					height: "20px",
					width: "20px",
					"border-radius": "9999px",
				}}
				transition={{duration: 0.5}}
			></Motion.div>
		</Motion.button>
	)
}

// ----

const allIngredients = [
	{icon: "🍅", label: "Tomato"},
	{icon: "🥬", label: "Lettuce"},
	{icon: "🧀", label: "Cheese"},
	{icon: "🥕", label: "Carrot"},
	{icon: "🍌", label: "Banana"},
	{icon: "🫐", label: "Blueberries"},
	{icon: "🥂", label: "Champers?"},
]

function SharedLayoutExample() {
	const [tomato, lettuce, cheese] = allIngredients
	const tabs = [tomato, lettuce, cheese]

	const [selectedTab, setSelectedTab] = createSignal(tabs[0])

	return (
		<div
			style={{
				width: "480px",
				height: "60vh",
				"max-height": "360px",
				"border-radius": "10px",
				background: "white",
				"box-shadow":
					"0 1px 1px hsl(0deg 0% 0% / 0.075), 0 2px 2px hsl(0deg 0% 0% / 0.075), 0 4px 4px hsl(0deg 0% 0% / 0.075), 0 8px 8px hsl(0deg 0% 0% / 0.075), 0 16px 16px hsl(0deg 0% 0% / 0.075), 0 2px 2px hsl(0deg 0% 0% / 0.075), 0 4px 4px hsl(0deg 0% 0% / 0.075), 0 8px 8px hsl(0deg 0% 0% / 0.075), 0 16px 16px hsl(0deg 0% 0% / 0.075)",
				display: "flex",
				"flex-direction": "column",
			}}
		>
			<nav
				style={{
					background: "#fdfdfd",
					padding: "5px 5px 0",
					"border-radius": "10px",
					"border-bottom-left-radius": "0",
					"border-bottom-right-radius": "0",
					"border-bottom": "1px solid #eeeeee",
					height: "44px",
					overflow: "hidden",
				}}
			>
				<ul
					style={{
						"list-style": "none",
						padding: "0",
						margin: "0",
						"font-weight": "500",
						"font-size": "14px",
						display: "flex",
						width: "100%",
					}}
				>
					<For each={tabs}>
						{item => (
							<li
								style={{
									"list-style": "none",
									margin: "0",
									"font-weight": "500",
									"font-size": "14px",
									"border-radius": "5px",
									"border-bottom-left-radius": "0",
									"border-bottom-right-radius": "0",
									width: "100%",
									padding: "10px 15px",
									position: "relative",
									background: "white",
									cursor: "pointer",
									height: "24px",
									display: "flex",
									flex: "1",
									"min-width": "0",
									"user-select": "none",
									color: "#0f1115",
								}}
								onClick={() => setSelectedTab(item)}
							>
								{`${item.icon} ${item.label}`}
								<Show when={item === selectedTab()}>
									<Motion.div
										style={{
											position: "absolute",
											bottom: "0px",
											left: "0",
											right: "0",
											height: "5px",
											"z-index": 50,
											background: "yellow",
										}}
										layoutId="underline" // Motion One's equivalent to Framer Motion's layoutId for shared layout transitions
										transition={{duration: 0.3}}
									/>
								</Show>
							</li>
						)}
					</For>
				</ul>
			</nav>
			<main
				style={{
					display: "flex",
					"justify-content": "center",
					"align-items": "center",
					flex: "1",
				}}
			>
				<Presence exitBeforeEnter>
					<For each={[selectedTab()]}>
						{tab => (
							<Motion.div
								initial={{y: "10px", opacity: 0}}
								animate={{y: "0px", opacity: 1}}
								exit={{y: "-10px", opacity: 0}}
								transition={{duration: 0.2}}
								style={{
									"font-size": "128px",
								}}
							>
								{selectedTab().icon}
							</Motion.div>
						)}
					</For>
				</Presence>
			</main>
		</div>
	)
}

function ReorderExample() {
	const [order, setOrder] = createSignal(initialOrder)

	// In Solid, createEffect will re-run when its dependencies (signals accessed within it) change.
	// This mimics the behavior of React's useEffect with a dependency array.
	onMount(() => {
		const currentOrder = order() // Access the signal to make it a dependency
		const timeout = setInterval(() => {
			setOrder(shuffle(currentOrder))
		}, 500)

		// onCleanup is Solid's equivalent of useEffect's return cleanup function.
		// It runs before the effect re-runs, and when the component is unmounted.
		onCleanup(() => clearTimeout(timeout))
	})

	return (
		<ul
			style={{
				"list-style": "none",
				padding: "0",
				margin: "0",
				position: "relative",
				display: "flex",
				"flex-wrap": "wrap",
				gap: "10px",
				width: "300px",
				"flex-direction": "row",
				"justify-content": "center",
				"align-items": "center",
			}}
		>
			{/* Solid's For loop is used for rendering lists. */}
			{/* Motion One's layout prop handles shared layout animations. */}
			<For each={order()}>
				{(backgroundColor, index) => (
					<Motion.li
						// transition={{
						// 	type: "spring", // FIXME, not existing because motion one dom (old)
						// 	damping: 20,
						// 	stiffness: 300,
						// }}
						style={{
							width: "100px",
							height: "100px",
							"border-radius": "10px",
							"background-color": backgroundColor,
						}}
					/>
				)}
			</For>
		</ul>
	)
}

const initialOrder = ["#ff0088", "#dd00ee", "#9911ff", "#0d63f8"]

/**
 * ==============   Utils   ================
 */
function shuffle([...array]: string[]) {
	return array.sort(() => Math.random() - 0.5)
}
