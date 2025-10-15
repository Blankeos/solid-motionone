import {createSignal, For, Index, onCleanup, onMount, Show} from "solid-js"
import type {JSX} from "solid-js/h/jsx-runtime"
import {Motion, Presence} from "../../../src"
import {rootlessLayoutStore} from "../../../src/layout"
import {motion} from "../../../src/motion-new"
import {FullPageTransitionExample} from "./full-page-transition-example"

export default function Page(): JSX.Element {
	const [isOn, setIsOn] = createSignal(false)

	const {layoutStore} = rootlessLayoutStore

	return (
		<>
			<div
				style={{
					display: "flex",
					"min-height": "100vh",
					"flex-direction": "column",
					"align-items": "center",
					"justify-content": "center",
					gap: "50px",
				}}
			>
				<h1>Motion One + Solid Demo</h1>
				<motion.div
					animate={{opacity: [0, 1]}}
					transition={{duration: 1, ease: "easeInOut"}}
				>
					Fade in animation
				</motion.div>

				<motion.button
					animate={{scale: 1, rotate: 90, backgroundColor: "yellow"}}
					whileHover={{
						scale: 3,
					}}
					transition={{
						duration: 1,
						type: "spring",
					}}
				>
					Rotate and color change
				</motion.button>

				<Presence>
					<motion.div
						initial={{opacity: 0, scale: 0.6}}
						animate={{opacity: 1, scale: 1}}
						exit={{opacity: 0, scale: 0.6}}
						transition={{duration: 0.3}}
					>
						Presence animation
					</motion.div>
				</Presence>

				<motion.div whileHover={{scale: 1.2}} whilePress={{scale: 0.9}}>
					Hover and press effects {layoutStore.count}
				</motion.div>

				<SwitchLayoutExample />

				<Switch2WithId />

				<SharedLayoutExample />

				<ReorderExample />

				<StyleCorrectionExample />

				<FullPageTransitionExample />
			</div>
		</>
	)
}

function SwitchLayoutExample() {
	const [isOn, setIsOn] = createSignal(false)

	return (
		<button
			style={{
				"border-radius": "24px",
				"background-color": isOn() ? "#3b82f6" : "#e5e7eb",
				padding: "4px",
				border: "none",
				cursor: "pointer",
				width: "80px",
				height: "40px",
				display: "flex",
				"align-items": "center",
				"justify-content": isOn() ? "flex-end" : "flex-start",
				"box-shadow": "0 2px 4px rgba(0,0,0,0.1)",
				transition: "background-color 0.2s ease",
			}}
			onClick={() => setIsOn(!isOn())}
			aria-pressed={isOn()}
		>
			<motion.div
				layout
				style={{
					background: "white",
					height: "32px",
					width: "32px",
					"border-radius": "50%",
					"box-shadow": "0 1px 3px rgba(0,0,0,0.15)",
				}}
				transition={{
					type: "spring",
					stiffness: 700,
					damping: 30,
				}}
			></motion.div>
		</button>
	)
}

function Switch2WithId() {
	const [on, setOn] = createSignal(false)

	return (
		<div class="mt-8 flex justify-center">
			<Motion
				class="w-16 h-8 bg-gray-300 rounded-full relative cursor-pointer"
				onClick={() => {
					setOn(!on())
				}}
			>
				<Show
					when={on()}
					fallback={
						<Motion
							id="switch-toggle-a"
							class="w-6 h-6 bg-white rounded-full absolute top-1 right-1 shadow-md"
							layoutId="switch-knob"
						/>
					}
				>
					<Motion
						id="switch-toggle-b"
						class="w-6 h-6 bg-white rounded-full absolute top-1 left-1 shadow-md"
						layoutId="switch-knob"
					/>
				</Show>
			</Motion>
		</div>
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
		<div class="w-[480px] h-[60vh] max-h-[360px] rounded-xl bg-white shadow-2xl flex flex-col">
			<nav class="bg-[#fdfdfd] px-1 pt-1 rounded-t-xl border-b border-gray-200 h-11 overflow-hidden">
				<ul class="list-none p-0 m-0 font-medium text-sm flex w-full h-full">
					<For each={tabs}>
						{(item, index) => (
							<li
								class="list-none m-0 font-medium text-sm rounded-t-md w-full relative cursor-pointer h-full flex flex-1 min-w-0 select-none items-center justify-center text-[#0f1115]"
								onClick={() => setSelectedTab(item)}
							>
								<span>{`${item.icon} ${item.label}`}</span>
								<Show when={item === selectedTab()}>
									<motion.div
										class={`absolute bottom-0 left-0 right-0 z-50 bg-blue-500 h-1`}
										layoutId="underline"
									/>
								</Show>
							</li>
						)}
					</For>
				</ul>
			</nav>
			<main class="flex justify-center items-center flex-1">
				<Presence exitBeforeEnter>
					<For each={[selectedTab()]}>
						{() => (
							<Motion.div
								initial={{y: "10px", opacity: 0}}
								animate={{y: "0px", opacity: 1}}
								exit={{y: "-10px", opacity: 0}}
								transition={{duration: 0.2}}
								class="text-[128px]"
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

//  -----

const initialOrder = ["#ff0088", "#dd00ee", "#9911ff", "#0d63f8"]

function ReorderExample() {
	const [order, setOrder] = createSignal(initialOrder)

	onMount(() => {
		const interval = setInterval(() => {
			const copy = structuredClone(shuffle(order()))
			setOrder(prev => copy)
		}, 900)

		setTimeout(() => {
			setOrder(prev => [...prev, "#ff5500"])
			setTimeout(() => {
				setOrder(prev => [...prev, "#00ff55"])
			}, 2000)
		}, 2000)

		onCleanup(() => clearTimeout(interval))
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
			<Index each={order()}>
				{(backgroundColor, index) => (
					<ReorderItem key={backgroundColor()} backgroundColor={backgroundColor()} />
				)}
			</Index>
		</ul>
	)
}

function ReorderItem(props: {key: string; backgroundColor: string}) {
	const [c, setC] = createSignal(0)
	return (
		<motion.li
			layoutId={props.key}
			style={{
				width: "100px",
				height: "100px",
				"border-radius": "10px",
				"background-color": props.backgroundColor,
			}}
			class="flex items-center justify-center text-white"
			onClick={() => setC(c() + 1)}
		>
			{c()}
		</motion.li>
	)
}

// ----

function StyleCorrectionExample() {
	const [isOpen, setIsOpen] = createSignal(false)

	return (
		<motion.div
			data-isOpen={isOpen()}
			animate={{
				width: isOpen() ? "400px" : "100px",
				height: isOpen() ? "200px" : "100px",
				borderRadius: isOpen() ? "40px" : "12px",
			}}
			transition={{type: "spring"}}
			style={{
				"justify-content": "center",
				"align-items": "center",
				display: "flex",
			}}
			class="bg-black"
			onClick={() => setIsOpen(!isOpen())}
		>
			<motion.div
				transition={{duration: 1}}
				style={{
					width: "40px",
					height: "40px",
					"border-radius": "50%",
				}}
				class="bg-amber-500"
				layout
			/>
		</motion.div>
	)
}

// -----

/**
 * ==============   Utils   ================
 */
function shuffle([...array]: string[]) {
	return array.sort(() => Math.random() - 0.5)
}

// ----
