import {createSignal, For, onCleanup, onMount, Show} from "solid-js"
import type {JSX} from "solid-js/h/jsx-runtime"
import {Motion, Presence} from "../../../src"
import {rootlessLayoutStore} from "../../../src/layout"
import {motion} from "../../../src/motion-new"

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
										class={`absolute bottom-0 left-0 right-0 z-50 bg-blue-500 ${index() === 1 || index() === 2 ? "h-4" : "h-1"}`}
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

function ReorderExample() {
	const [order, setOrder] = createSignal(initialOrder)

	onMount(() => {
		const timeout = setInterval(() => {
			const copy = structuredClone(shuffle(order()))
			setOrder([])
			setOrder(copy)
		}, 900)

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
			<For each={order()}>
				{(backgroundColor, index) => (
					<ReorderItem
						layoutId={`item-${backgroundColor}}`}
						backgroundColor={backgroundColor}
					/>
				)}
			</For>
		</ul>
	)
}

function ReorderItem(props: {layoutId: string; backgroundColor: string}) {
	const [c, setC] = createSignal(0)
	return (
		<motion.li
			layoutId={props.layoutId}
			style={{
				width: "100px",
				height: "100px",
				"border-radius": "10px",
				"background-color": props.backgroundColor,
			}}
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
			initial={{borderRadius: 50}}
			animate={{
				width: isOpen() ? "400px" : "100px",
				height: isOpen() ? "200px" : "100px",
				display: "flex",
			}}
			transition={{type: "spring"}}
			style={{
				background: "gray",
				"justify-content": "center",
				"align-items": "center",
			}}
			onClick={() => setIsOpen(!isOpen())}
		>
			<motion.div
				transition={{duration: 1}}
				style={{
					width: "40px",
					height: "40px",
					background: "#f107a3",
					"border-radius": "50%",
				}}
			/>
		</motion.div>
	)
}

// -----

const initialOrder = ["#ff0088", "#dd00ee", "#9911ff", "#0d63f8"]

const cards = [
	{
		id: "travel",
		label: "Travel",
		title: "5 Inspiring Apps for Your Next Trip",
		image: "https://examples.motion.dev/photos/app-store/a.jpg",
		imageOffset: {top: "-300px", width: "100%"},
		content:
			"Love to travel? So do the makers of these five subscription apps. For a small monthly fee, they'll help you find the best deals on flights, hotels, and some other stuff we turn a blind eye to. Plan your perfect itinerary with intelligent recommendations based on your interests, time, and credit history.",
		contentClass: "content-container small",
	},
	{
		id: "howto",
		label: "How to",
		title: "Contemplate the Meaning of Life Twice a Day",
		image: "https://examples.motion.dev/photos/app-store/c.jpg",
		imageOffset: {bottom: "-50px", width: "110%", left: "-20px"},
		content:
			"Take a moment each morning and evening to reflect on your existence. This simple practice can help you find clarity and purpose in your daily life. Remember to breathe deeply and consider the vastness of the cosmos.",
		contentClass: "content-container small",
	},
	{
		id: "steps",
		label: "Steps",
		title: "Urban Exploration Apps for the Vertically-Inclined",
		image: "https://examples.motion.dev/photos/app-store/d.jpg",
		imageOffset: {width: "200%", left: "-100px"},
		content:
			"Get off the beaten path. Find the best views, skywalks, and elevated gardens in your city.\n\nLocked door? No problem! This app crowdsources the access code to every door in your city.",
		contentClass: "content-container small",
	},
	{
		id: "hats",
		label: "Hats",
		title: "Take Control of Your Hat Life With This Stunning New App",
		image: "https://examples.motion.dev/photos/app-store/b.jpg",
		imageOffset: {bottom: "-100px", width: "100%"},
		content:
			"Whether you're serious hat enthusiast, or just a filthy casual, this new app revolutionizes how you organize, care for, and expand your hat collection.\n\nStay up to date with the latest hat trends, get personalized hat care reminders, and use predictive analytics to discover the last place you left your hat.\n\nWhy follow the crowd when you can be the crowd?",
		contentClass: "content-container small",
	},
]

export function FullPageTransitionExample() {
	const [selectedCard, setSelectedCard] = createSignal<string | null>(null)

	return (
		<div class="bg-white rounded-2xl overflow-auto w-full h-full p-4 md:p-8">
			<motion.ul
				class="grid grid-cols-2 gap-4 max-w-4xl mx-auto"
				initial={{opacity: 0}}
				animate={{opacity: 1}}
				transition={{duration: 0.5}}
			>
				<For each={cards}>
					{(card, i) => {
						const isSelected = () => selectedCard() === card.id
						return (
							<Show when={!isSelected()}>
								<motion.li
									class="relative aspect-square rounded-xl overflow-hidden bg-gray-100"
									initial={{opacity: 0, y: 20}}
									animate={{opacity: 1, y: 0}}
									transition={{delay: i() * 0.1, duration: 0.4}}
									layoutId={`card-${card.id}`}
								>
									<motion.div
										class="relative w-full h-full"
										layoutId={`content-container-${card.id}`}
									>
										<motion.div
											class="relative w-full h-full"
											initial={{opacity: 0}}
											animate={{opacity: 1}}
											transition={{delay: i() * 0.1 + 0.2, duration: 0.3}}
											layoutId={`content-${card.id}`}
										>
											<motion.div
												class="absolute inset-0"
												layoutId={`image-container-${card.id}`}
											>
												<img
													class="w-full h-full object-cover"
													src={card.image}
													alt=""
												/>
											</motion.div>
											<motion.div
												class="absolute bottom-4 left-4 right-4"
												layoutId={`title-${card.id}`}
											>
												<span class="text-xs text-white/80 uppercase tracking-wide">
													{card.label}
												</span>
												<h2 class="text-lg font-bold text-white leading-tight">
													{card.title}
												</h2>
											</motion.div>
											<a
												class="absolute inset-0"
												href="#"
												onClick={e => {
													e.preventDefault()
													setSelectedCard(card.id)
												}}
											/>
										</motion.div>
									</motion.div>
								</motion.li>
							</Show>
						)
					}}
				</For>
			</motion.ul>
			{selectedCard() && (
				<motion.div
					class="fixed inset-0 z-50 bg-black/80"
					initial={{opacity: 0}}
					animate={{opacity: 1}}
					exit={{opacity: 0}}
					transition={{duration: 0.3}}
				>
					<a
						class="absolute inset-0"
						href="#"
						onClick={e => {
							e.preventDefault()
							setSelectedCard(null)
						}}
					/>
					<For each={cards}>
						{card => {
							if (selectedCard() !== card.id) return null
							return (
								<motion.div
									class="fixed inset-4 md:inset-8 flex items-center justify-center"
									layoutId={`content-container-${card.id}`}
								>
									<motion.div
										class="relative w-full max-w-2xl max-h-full bg-white rounded-2xl overflow-hidden"
										layoutId={`content-${card.id}`}
									>
										<motion.div
											class="relative w-full h-64 md:h-80"
											layoutId={`image-container-${card.id}`}
										>
											<img
												class="w-full h-full object-cover"
												src={card.image}
												alt=""
											/>
										</motion.div>
										<motion.div
											class="p-6 md:p-8"
											layoutId={`title-${card.id}`}
										>
											<span class="text-sm text-gray-500 uppercase tracking-wide">
												{card.label}
											</span>
											<h2 class="text-2xl md:text-3xl font-bold mt-2">
												{card.title}
											</h2>
										</motion.div>
										<div class="px-6 md:px-8 pb-6 md:pb-8">
											<p class="text-gray-700 leading-relaxed">
												{card.content}
											</p>
										</div>
									</motion.div>
								</motion.div>
							)
						}}
					</For>
				</motion.div>
			)}
		</div>
	)
}

/**
 * ==============   Utils   ================
 */
function shuffle([...array]: string[]) {
	return array.sort(() => Math.random() - 0.5)
}

// ----
