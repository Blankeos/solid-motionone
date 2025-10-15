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

function easeOutQuart(x: number): number {
	return 1 - Math.pow(1 - x, 4)
}

export function FullPageTransitionExample() {
	const [selectedCard, setSelectedCard] = createSignal<(typeof cards)[number] | null>(null)

	return (
		<div class="bg-white rounded-2xl overflow-auto w-full h-full p-4 md:p-8">
			<motion.ul class="grid grid-cols-2 gap-4 max-w-4xl mx-auto">
				<For each={cards}>
					{(card, i) => {
						const isSelected = () => selectedCard()?.id === card.id
						return (
							<Show when={!isSelected()} fallback={<div class="" />}>
								<motion.li
									class="relative aspect-square rounded-xl bg-gray-100 overflow-hidden"
									layoutId={`card-${card.id}`}
									transition={{ease: easeOutQuart, duration: 2}}
								>
									<motion.div
										class="relative w-full h-full"
										layoutId={`content-container-${card.id}`}
										transition={{ease: easeOutQuart, duration: 2}}
									>
										<motion.div
											class="relative w-full h-full"
											layoutId={`content-${card.id}`}
											transition={{ease: easeOutQuart, duration: 2}}
										>
											<motion.div
												class="absolute inset-0"
												// layout
												// layoutId={`image-container-${card.id}`}
												transition={{ease: easeOutQuart, duration: 2}}
											>
												<img
													class="w-full h-full object-cover"
													src={card.image}
													alt=""
												/>
											</motion.div>
											<motion.div
												class="absolute top-0 left-0 p-6 md:p-8 text-white opacity-0 max-w-xs"
												layoutId={`title-${card.id}`}
												transition={{ease: easeOutQuart, duration: 2}}
											>
												<span class="text-sm text-gray-50 uppercase tracking-wide">
													{card.label}
												</span>
												<h2 class="text-2xl md:text-3xl mt-2">
													{card.title}
												</h2>
											</motion.div>
											<motion.div
												layoutId={`card-content-${card.id}`}
												class="absolute -bottom-full right-0 left-0 bg-gray-800 opacity-100"
												transition={{ease: easeOutQuart, duration: 2}}
											>
												<div class="px-6 pt-6 md:px-8 pb-6 md:pb-8">
													<p class="text-gray-200 leading-relaxed">
														{card.content}
													</p>
												</div>
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

			<motion.div class="pointer-events-none">
				<Show when={selectedCard()}>
					<motion.div
						class="fixed inset-0 z-50 bg-black/80 pointer-events-auto"
						initial={{opacity: 0}}
						animate={{opacity: 1}}
						exit={{opacity: 0}}
						transition={{duration: 0.3}}
						onClick={e => {
							e.preventDefault()
							setSelectedCard(null)
						}}
					/>
				</Show>

				<Show when={selectedCard()}>
					{card => (
						<motion.div class="fixed inset-0 z-60 flex items-center justify-center pointer-events-none">
							<motion.div
								class="relative w-full max-w-2xl max-h-full bg-white rounded-[45px] overflow-hidden"
								layoutId={`card-${card().id}`}
								transition={{ease: easeOutQuart, duration: 2}}
							>
								<motion.div
									class="relative w-full h-[760px]"
									// layout
									// layoutId={`image-container-${card().id}`}
									transition={{ease: easeOutQuart, duration: 2}}
								>
									<img
										class="w-full h-full object-cover"
										src={card().image}
										alt=""
									/>
								</motion.div>

								<motion.div
									class="absolute top-0 left-0 p-6 md:p-8 text-white max-w-xs"
									layoutId={`title-${card().id}`}
									transition={{ease: easeOutQuart, duration: 2}}
								>
									<span class="text-sm text-gray-50 uppercase tracking-wide">
										{card().label}
									</span>
									<h2 class="text-2xl md:text-3xl mt-2">{card().title}</h2>
								</motion.div>

								<motion.div
									layoutId={`card-content-${card().id}`}
									class="absolute bottom-0 right-0 left-0 bg-gray-800"
									transition={{ease: easeOutQuart, duration: 2}}
								>
									<div class="px-6 pt-6 md:px-8 pb-6 md:pb-8">
										<p class="text-gray-200 leading-relaxed">
											{card().content}
										</p>
									</div>
								</motion.div>
							</motion.div>
						</motion.div>
					)}
				</Show>
			</motion.div>
		</div>
	)
}
