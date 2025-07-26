import {MotionState} from "@motionone/dom"
import {createRoot, onCleanup, onMount} from "solid-js"
import {createStore, produce} from "solid-js/store"

type SourceData = {
	domRect: DOMRect
	borderRadius: string
}

type LayoutStore = {
	mountedLayoutIds: Set<string>
	sourceDataByLayoutId: Map<string, SourceData>
	/** @deprecated for demonstration purposes only */
	count: number
}
// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
function createRootlessLayoutStore() {
	const [layoutStore, setLayoutStore] = createStore<LayoutStore>({
		mountedLayoutIds: new Set<string>(),
		sourceDataByLayoutId: new Map<string, SourceData>(),
		count: 0,
	})

	function setSourceData(layoutId: string, sourceData?: SourceData): void {
		setLayoutStore(
			produce(draft => {
				// const newSourceDataByLayoutId = new Map(draft.sourceDataByLayoutId);
				if (sourceData) {
					draft.sourceDataByLayoutId.set(layoutId, sourceData)
				} else {
					draft.sourceDataByLayoutId.delete(layoutId)
				}
			}),
		)
	}

	/** @deprecated for demonstration purposes only */
	function increment(): void {
		setLayoutStore("count", draft => draft + 1)
	}

	/** @deprecated for demonstration purposes only */
	function decrement(): void {
		setLayoutStore("count", draft => draft - 1)
	}

	return {
		layoutStore,
		setSourceData,
		increment,
		decrement,
	}
}

/** Turns this into a global store without needing context. Reference: https://www.solidjs.com/tutorial/stores_nocontext?solved */
export const rootlessLayoutStore = createRoot(createRootlessLayoutStore)

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
export function copyTransformFromRect(source: SourceData, target: DOMRect) {
	// Get the bounding rectangles of both elements
	const sourceBounds = source.domRect
	const targetBounds = target

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

const captureElementState = (element: HTMLElement) => {
	const domRect = element.getBoundingClientRect()
	const computedStyle = getComputedStyle(element)
	return {
		domRect,
		borderRadius: computedStyle.borderRadius,
	}
}

export function createAndBindLayoutState(
	el: () => HTMLElement | null,
	options: {
		layout?: true | string
		layoutId?: string
		motionState: MotionState
		key?: string | number
	},
) {
	const {layoutStore, setSourceData} = rootlessLayoutStore

	// Handle for Single Lifecycle Layout. (Detect with mutationObserver)
	onMount(() => {
		const ref = el()
		const layout = options.layout
		if (!ref || !layout) return

		const parentElement = ref.parentElement
		if (!parentElement) return

		// 1. Intercept setAttribute for style attribute changes
		const originalSetAttribute = parentElement.setAttribute.bind(parentElement)
		parentElement.setAttribute = function (name, value) {
			if (name === "style") {
				const beforeState = captureElementState(ref)

				const result = originalSetAttribute(name, value)

				Promise.resolve().then(() => {
					const afterState = captureElementState(ref)

					const transform = copyTransformFromRect(
						{
							borderRadius: beforeState.borderRadius,
							domRect: beforeState.domRect,
						},
						ref.getBoundingClientRect(),
					)

					console.log("hi1")
					options.motionState.update({
						...options.motionState.getOptions(),
						animate: {
							scaleX: [transform.scaleX],
							scaleY: [transform.scaleY],
							x: [transform.translateX, 0],
							y: [transform.translateY, 0],
							borderRadius: [beforeState.borderRadius, beforeState.borderRadius],
						},
					})
				})

				return result
			}
			return originalSetAttribute(name, value)
		}

		// 2. Intercept cssText changes
		const originalCssTextDescriptor = Object.getOwnPropertyDescriptor(
			CSSStyleDeclaration.prototype,
			"cssText",
		)
		if (originalCssTextDescriptor) {
			Object.defineProperty(parentElement.style, "cssText", {
				get: originalCssTextDescriptor.get,
				set: function (value) {
					const beforeState = captureElementState(ref)

					const result = originalCssTextDescriptor.set?.call(this, value)

					Promise.resolve().then(() => {
						const afterState = captureElementState(ref)

						const transform = copyTransformFromRect(
							{
								borderRadius: beforeState.borderRadius,
								domRect: beforeState.domRect,
							},
							ref.getBoundingClientRect(),
						)

						console.log("hi2")
						options.motionState.update({
							...options.motionState.getOptions(),
							animate: {
								scaleX: [transform.scaleX],
								scaleY: [transform.scaleY],
								x: [transform.translateX, 0],
								y: [transform.translateY, 0],
								borderRadius: [beforeState.borderRadius, beforeState.borderRadius],
							},
						})
					})

					return result
				},
				configurable: true,
			})
		}

		// 3. Intercept setProperty method
		const originalSetProperty = parentElement.style.setProperty.bind(parentElement.style)
		let pendingAnimation = false
		let beforeState: SourceData | null = null

		parentElement.style.setProperty = function (property, value, priority) {
			if (!pendingAnimation) {
				beforeState = captureElementState(el()!)
				pendingAnimation = true

				// Schedule animation for next microtask
				Promise.resolve().then(() => {
					if (beforeState) {
						originalSetProperty(property, value, priority)
						const afterState = captureElementState(ref)
						const transform = copyTransformFromRect(
							{
								borderRadius: beforeState.borderRadius,
								domRect: beforeState.domRect,
							},
							afterState.domRect,
						)

						console.log("afterState", afterState.domRect.x, beforeState.domRect.x)
						options.motionState.update({
							...options.motionState.getOptions(),
							animate: {
								scaleX: [transform.scaleX],
								scaleY: [transform.scaleY],
								x: [transform.translateX, 0],
								y: [transform.translateY, 0],
								borderRadius: [beforeState.borderRadius, beforeState.borderRadius],
							},
						})

						pendingAnimation = false
						beforeState = null
					}
				})
			}

			return originalSetProperty(property, value, priority)
		}
		// options.motionState.update({
		// 	...options.motionState.getOptions(),
		// 	animate: {
		// 		scaleX: [transform.scaleX],
		// 		scaleY: [transform.scaleY],
		// 		x: [transform.translateX, 0],
		// 		y: [transform.translateY, 0],
		// 		borderRadius: [beforeState.borderRadius, beforeState.borderRadius],
		// 	},
		// })

		// 4. Intercept commonly changed layout properties
		const layoutProperties = [
			"display",
			"position",
			"top",
			"left",
			"right",
			"bottom",
			"width",
			"height",
			"margin",
			"marginTop",
			"marginRight",
			"marginBottom",
			"marginLeft",
			"padding",
			"paddingTop",
			"paddingRight",
			"paddingBottom",
			"paddingLeft",
			"justifyItems",
			"alignItems",
			"justifyContent",
			"alignContent",
			"gridTemplateColumns",
			"gridTemplateRows",
			"gap",
			"rowGap",
			"columnGap",
			"flexDirection",
			"flexWrap",
			"flex",
			"flexGrow",
			"flexShrink",
			"flexBasis",
			"transform",
			"transformOrigin",
		]

		const originalDescriptors = new Map()

		layoutProperties.forEach(prop => {
			const descriptor = Object.getOwnPropertyDescriptor(CSSStyleDeclaration.prototype, prop)
			if (descriptor && descriptor.set) {
				originalDescriptors.set(prop, descriptor)

				Object.defineProperty(parentElement.style, prop, {
					get: descriptor.get,
					set: function (value) {
						const beforeState = captureElementState(ref)

						const result = descriptor.set.call(this, value)

						Promise.resolve().then(() => {
							const afterState = captureElementState(ref)

							const transform = copyTransformFromRect(
								{
									borderRadius: beforeState.borderRadius,
									domRect: beforeState.domRect,
								},
								ref.getBoundingClientRect(),
							)

							console.log("hi4")
							options.motionState.update({
								...options.motionState.getOptions(),
								animate: {
									scaleX: [transform.scaleX],
									scaleY: [transform.scaleY],
									x: [transform.translateX, 0],
									y: [transform.translateY, 0],
									borderRadius: [
										beforeState.borderRadius,
										beforeState.borderRadius,
									],
								},
							})
						})

						return result
					},
					configurable: true,
					enumerable: descriptor.enumerable,
				})
			}
		})

		onCleanup(() => {
			console.log("[Single lifecycle layout] Cleaning up..")

			// Restore setAttribute
			parentElement.setAttribute = originalSetAttribute

			// Restore cssText
			if (originalCssTextDescriptor) {
				Object.defineProperty(parentElement.style, "cssText", originalCssTextDescriptor)
			}

			// Restore setProperty
			Object.defineProperty(parentElement.style, "setProperty", {
				value: originalSetProperty,
				configurable: true,
			})

			// Restore individual property descriptors
			originalDescriptors.forEach((descriptor, prop) => {
				Object.defineProperty(parentElement.style, prop, descriptor)
			})
		})
	})
	// onMount(() => {
	// 	const ref = el()
	// 	const layout = options.layout
	// 	if (!ref || !layout) return
	// 	const mutationObserver = new MutationObserver(mutations => {
	// 		mutations.forEach(mutation => {
	// 			if (mutation.type === "attributes" && mutation.attributeName === "style") {
	// 				const target = mutation.target
	// 				const justifyItems = getComputedStyle(target as Element).justifyItems
	// 				console.log("Parent justifyItems changed to:", justifyItems)

	// 				// Capture BEFORE state
	// 				const sourceData = captureElementState(el()!)

	// 				console.log("Source Data", sourceData.domRect.x)
	// 				// Capture AFTER state
	// 				requestAnimationFrame(() => {
	// 					const transform = opyTransformFromRect(
	// 						{
	// 							borderRadius: sourceData.borderRadius,
	// 							domRect: sourceData.domRect,
	// 						},
	// 						el()!,
	// 					)

	// 					const targetData = captureElementState(el()!)
	// 					console.log("Target data", targetData.domRect.x)

	// 					const target = {
	// 						borderRadius: getComputedStyle(el()!).borderRadius,
	// 					}

	// 					// Update MotionOne state
	// 					options.motionState.update({
	// 						...options.motionState.getOptions(),
	// 						initial: {
	// 							scaleX: transform.scaleX,
	// 							scaleY: transform.scaleY,
	// 							x: transform.translateX,
	// 							y: transform.translateY,
	// 							borderRadius: sourceData.borderRadius,
	// 						},
	// 						animate: {
	// 							scaleX: [transform.scaleX],
	// 							scaleY: [transform.scaleY],
	// 							x: [transform.translateX, 0],
	// 							y: [transform.translateY, 0],
	// 							borderRadius: [sourceData.borderRadius, target.borderRadius],
	// 						},
	// 					})
	// 				})
	// 				//
	// 			}
	// 		})
	// 	})

	// Handle for Shared Layout (Detect with simply mount and unmount)
	onMount(() => {
		const ref = el()
		const layoutId = options.layoutId
		if (!ref || !layoutId) return

		const sourceData = layoutStore.sourceDataByLayoutId.get(layoutId)
		if (!sourceData) return

		const transform = copyTransformFromRect(
			{
				borderRadius: sourceData.borderRadius,
				domRect: sourceData.domRect,
			},
			el()!.getBoundingClientRect(),
		)

		const target = {
			borderRadius: getComputedStyle(el()!).borderRadius,
		}

		requestAnimationFrame(() => {
			options.motionState.update({
				...options.motionState.getOptions(),
				animate: {
					scaleX: [transform.scaleX],
					scaleY: [transform.scaleY],
					x: [transform.translateX, 0],
					y: [transform.translateY, 0],
					borderRadius: [sourceData.borderRadius, target.borderRadius],
				},
			})
		})
	})
	onCleanup(() => {
		const ref = el()
		const layoutId = options.layoutId

		if (!ref || !layoutId) return
		const borderRadius = getComputedStyle(ref).borderRadius
		const domRect = ref.getBoundingClientRect()

		// Set to global store.
		setSourceData(layoutId, {
			borderRadius: borderRadius,
			domRect: domRect,
		})
	})

	// createEffect(() => {
	// 	console.log(options.key, "changed")
	// })
}
