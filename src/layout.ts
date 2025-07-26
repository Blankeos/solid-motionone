import {onCleanup, onMount} from "solid-js"
import {createGlobalStore} from "./_global-store.js"

type SourceData = {
	domRect: DOMRect
	borderRadius: string
}

type LayoutStore = {
	mountedLayoutIds: Set<string>
	sourceDataByLayoutId: Map<string, SourceData>
	setSourceData: (layoutId: string, sourceData?: SourceData) => void
	/** @deprecated only for testing */
	count: number
	/** @deprecated only for testing */
	increment: () => void
	/** @deprecated only for testing */
	decrement: () => void
}
/** @internal Allows us to maintain a global layout state store without using context. Similar devx to framer-motion. */
export const useLayoutStore = createGlobalStore<LayoutStore>((get, set) => ({
	count: 0,
	mountedLayoutIds: new Set<string>(),
	sourceDataByLayoutId: new Map(),
	setSourceData: (layoutId, sourceData) => {
		set(store => {
			const newSourceDataByLayoutId = new Map(store.sourceDataByLayoutId)
			if (sourceData) {
				newSourceDataByLayoutId.set(layoutId, sourceData)
			} else {
				newSourceDataByLayoutId.delete(layoutId)
			}
			return {
				...store,
				sourceDataByLayoutId: newSourceDataByLayoutId,
			}
		})
	},
	increment: () => set(store => ({...store, count: store.count + 1})),
	decrement: () => set(store => ({...store, count: store.count - 1})),
}))

// Utilities
/**
 * @internal Used in motion only for reacting to the layout store state.
 * It must copy:
 * - [x] transform
 * - [x] transformOrigin
 * - [x] translateX
 * - [x] translateY
 * - [x] scaleX
 * - [x] scaleY
 * - [x] borderRadius
 * - [ ] border
 * - [ ] color
 * - [ ] rotation
 * - [ ] opacity
 */
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function copyTransformFromRect(source: SourceData, target: HTMLElement) {
	// Get the bounding rectangles of both elements
	const sourceBounds = source.domRect
	const targetBounds = target.getBoundingClientRect()

	// Calculate the scale factors needed
	const scaleX = sourceBounds.width / targetBounds.width
	const scaleY = sourceBounds.height / targetBounds.height

	// Calculate the distances between the elements' centers
	const sourceCenter = {
		x: sourceBounds.left + sourceBounds.width / 2,
		y: sourceBounds.top + sourceBounds.height / 2,
	}

	const targetCenter = {
		x: targetBounds.left + targetBounds.width / 2,
		y: targetBounds.top + targetBounds.height / 2,
	}

	// Calculate the translation needed to align centers
	const translateX = sourceCenter.x - targetCenter.x
	const translateY = sourceCenter.y - targetCenter.y

	// Transform origin is half the target's dimensions
	const transformOriginX = targetBounds.width / 2
	const transformOriginY = targetBounds.height / 2

	return {
		transform: `translate3d(${translateX}px, ${translateY}px, 0) scale(${scaleX}, ${scaleY})`,
		transformOrigin: `${transformOriginX}px ${transformOriginY}px`,
		translateX,
		translateY,
		scaleX,
		scaleY,
		borderRadius: source.borderRadius,
	}
}

export function createAndBindLayoutState(
	el: () => HTMLElement | null,
	options: {layout?: true | string; layoutId?: string; motionState: MotionState},
) {
	const layoutStore = useLayoutStore()

	// Handle for Single Lifecycle Layout. (Detect with mutationObserver)
	// onMount(() => {
	// 	if (!options.layout) return
	// 	const mutationObserver = new MutationObserver(mutations => {
	// 		mutations.forEach(mutation => {
	// 			if (mutation.type === "attributes" && mutation.attributeName === "style") {
	// 				const target = mutation.target
	// 				const justifyItems = getComputedStyle(target as Element).justifyItems
	// 				console.log("Parent justifyItems changed to:", justifyItems)
	// 			}
	// 		})
	// 	})

	// 	if (el().parentElement)
	// 		mutationObserver.observe(el().parentElement!, {
	// 			attributes: true,
	// 			attributeFilter: ["style", "class"], // Watch style and class changes
	// 		})

	// 	onCleanup(() => {
	// 		console.log("[Single lifecycle layout] Cleaning up..")
	// 		mutationObserver.disconnect()
	// 	})
	// })

	// Handle for Shared Layout (Detect with simply mount and unmount)
	onMount(() => {
		const ref = el()
		const layoutId = options.layoutId
		if (!ref || !layoutId) return

		requestAnimationFrame(() => {
			const sourceData = layoutStore().sourceDataByLayoutId.get(layoutId)
			if (!sourceData) return

			const transform = copyTransformFromRect(
				{
					borderRadius: sourceData.borderRadius,
					domRect: sourceData.domRect,
				},
				el()!,
			)

			const target = {
				borderRadius: getComputedStyle(el()!).borderRadius,
			}

			options.motionState.update({
				...options.motionState.getOptions(),
				initial: {
					scaleX: transform.scaleX,
					scaleY: transform.scaleY,
					x: transform.translateX,
					y: transform.translateY,
					borderRadius: sourceData.borderRadius,
				},
				animate: {
					scaleX: [transform.scaleX],
					scaleY: [transform.scaleY],
					x: [transform.translateX, 0],
					y: [transform.translateY, 0],
					borderRadius: [sourceData.borderRadius, target.borderRadius],
				},
			})
		})

		onCleanup(() => {
			// Exit animation logic here
			const borderRadius = getComputedStyle(ref).borderRadius
			const domRect = ref.getBoundingClientRect()

			// Set to global store.
			layoutStore().setSourceData(layoutId, {
				borderRadius: borderRadius,
				domRect: domRect,
			})
		})
	})
	// onCleanup(() => {
	// 	const ref = el()
	// 	const layoutId = options.layoutId
	// 	if (!ref || !layoutId) return

	// 	const borderRadius = getComputedStyle(ref).borderRadius
	// 	const domRect = ref.getBoundingClientRect()

	// 	// Set to global store.
	// 	layoutStore().setSourceData(layoutId, {
	// 		borderRadius: borderRadius,
	// 		domRect: ref.getBoundingClientRect(),
	// 	})
	// 	console.log("[Shared Layout] Cleaning up...", ref)
	// })

	// createEffect(() => {
	// 	console.log("something changed!?")
	// 	requestAnimationFrame(() => {
	// 		console.log("something changed!!")
	// 		// Animate based on rect
	// 	})
	// })

	// createEffect(() => {
	// 	if (!props.layoutId) return
	// 	// console.log("2createEffect: layoutId changed.", props.layoutId)
	// })
}

function createDestructionWatcher() {
	let isDestroyed = false
	const observers = []
	const callbacks = []

	return {
		watch(element, callback) {
			if (isDestroyed) return

			callbacks.push(callback)

			function handleDestruction() {
				if (isDestroyed) return
				isDestroyed = true
				callbacks.forEach(cb => cb())
				observers.forEach(obs => obs.disconnect())
			}

			// Watch all ancestors
			let current = element
			while (current && current !== document.body) {
				if (current.parentNode) {
					const observer = new MutationObserver(mutations => {
						mutations.forEach(mutation => {
							if (mutation.type === "childList") {
								mutation.removedNodes.forEach(node => {
									if (
										node === element ||
										(node.contains && node.contains(element))
									) {
										handleDestruction()
									}
								})
							}
						})
					})

					observer.observe(current.parentNode, {childList: true})
					observers.push(observer)
				}
				current = current.parentNode
			}

			// Fallback check
			function check() {
				if (isDestroyed) return
				if (!document.contains(element)) {
					handleDestruction()
					return
				}
				requestAnimationFrame(check)
			}
			requestAnimationFrame(check)
		},

		destroy() {
			isDestroyed = true
			observers.forEach(obs => obs.disconnect())
		},
	}
}
