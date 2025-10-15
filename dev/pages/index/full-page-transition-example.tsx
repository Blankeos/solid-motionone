import {For, Show, createSignal} from "solid-js"
import {motion} from "../../../src/motion-new"

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

export function FullPageTransitionDemo() {
	const [selectedCard, setSelectedCard] = createSignal<(typeof cards)[number] | null>(null)

	return (
		<div class="bg-white rounded-2xl overflow-auto w-full h-full p-4 md:p-8">
			<motion.ul class="grid grid-cols-2 gap-4 max-w-4xl mx-auto">
				<For each={cards}>
					{(card, i) => {
						const isSelected = () => selectedCard()?.id === card.id
						return (
							<Show
								when={!isSelected()}
								fallback={<li class="w-full h-full bg-green-200">ads</li>}
							>
								<motion.li
									class="relative aspect-square rounded-xl overflow-hidden bg-gray-100"
									layoutId={`card-${card.id}`}
								>
									<motion.div
										class="relative w-full h-full"
										layoutId={`content-container-${card.id}`}
									>
										<motion.div
											class="relative w-full h-full"
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
													style={card.imageOffset}
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
													setSelectedCard(card)
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

			{(() => {
				const [on, setOn] = createSignal(false)

				return (
					<div class="mt-8 flex justify-center">
						<motion.div
							class="w-16 h-8 bg-gray-300 rounded-full relative cursor-pointer"
							onClick={() => {
								setOn(!on())
							}}
						>
							<Show
								when={on()}
								fallback={
									<motion.div
										id="switch-toggle-a"
										class="w-6 h-6 bg-white rounded-full absolute top-1 right-1 shadow-md"
										layoutId="switch-knob"
									/>
								}
							>
								<motion.div
									id="switch-toggle-b"
									class="w-6 h-6 bg-white rounded-full absolute top-1 left-1 shadow-md"
									layoutId="switch-knob"
								/>
							</Show>
						</motion.div>
					</div>
				)
			})()}

			<Show when={selectedCard()}>
				{card => (
					<div class="fixed inset-0 z-50">
						<motion.div
							class="fixed inset-0 bg-black/80"
							initial={{opacity: 0}}
							animate={{opacity: 1}}
							exit={{opacity: 0}}
							transition={{duration: 0.3}}
							onClick={() => setSelectedCard(null)}
						/>

						<motion.div
							class="fixed inset-4 md:inset-8 flex items-center justify-center pointer-events-none"
							layoutId={`card-${card().id}`}
						>
							<motion.div
								class="relative w-full max-w-2xl max-h-full bg-background rounded-2xl overflow-hidden pointer-events-auto"
								layoutId={`content-container-${card().id}`}
							>
								<motion.div
									class="relative w-full h-64 md:h-80"
									layoutId={`image-container-${card().id}`}
								>
									<img
										class="w-full h-full object-cover"
										src={card().image}
										alt=""
										style={card().imageOffset}
									/>
								</motion.div>
								<motion.div class="p-6 md:p-8" layoutId={`title-${card().id}`}>
									<span class="text-sm text-muted-foreground uppercase tracking-wide">
										{card().label}
									</span>
									<h2 class="text-2xl md:text-3xl font-bold mt-2">
										{card().title}
									</h2>
								</motion.div>
								<div class="px-6 md:px-8 pb-6 md:pb-8">
									<p class="text-muted-foreground leading-relaxed">
										{card().content}
									</p>
								</div>
							</motion.div>
						</motion.div>
					</div>
				)}
			</Show>
		</div>
	)
}
