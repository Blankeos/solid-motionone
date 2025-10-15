import {animate, AnimationOptions} from "motion"
import {Accessor, createRoot, createSignal, onCleanup, onMount} from "solid-js"
import {createStore, produce} from "solid-js/store"

type SourceData = {
	domRect: DOMRect
	borderRadius: string
	opacity: string
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
		// console.log("layoutStore", unwrap(layoutStore).sourceDataByLayoutId)
	}

	/** @deprecated for demonstration purposes of a global store only*/
	function increment(): void {
		setLayoutStore("count", draft => draft + 1)
	}

	/** @deprecated for demonstration purposes of a global store only */
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
 * - [x] opacity
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
		opacity: source.opacity,
	}
}

const captureElementState = (element: HTMLElement) => {
	const domRect = element.getBoundingClientRect()
	const computedStyle = getComputedStyle(element)
	return {
		domRect,
		borderRadius: computedStyle.borderRadius,
		opacity: computedStyle.opacity,
	}
}

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function createAndBindLayoutState(
	el: () => HTMLElement | null,
	options: {
		layout?: true
		layoutId?: string
		key?: string | number
		transition?: AnimationOptions
	},
) {
	const {layoutStore, setSourceData} = rootlessLayoutStore

	onMount(() => {
		const ref = el()
		const layoutId = options.layoutId
		if (!ref || !layoutId) return

		const sourceData = layoutStore.sourceDataByLayoutId.get(layoutId)
		if (!sourceData) return
		// console.log({
		// 	sourceData,
		// 	targetData: ref.getBoundingClientRect(),
		// })

		const transform = copyTransformFromRect(sourceData, el()!.getBoundingClientRect())
		// console.log("transform from copy", transform)

		const target = {
			borderRadius: getComputedStyle(el()!).borderRadius,
			opacity: getComputedStyle(el()!).opacity,
		}

		animate(
			ref,
			{
				scaleX: [transform.scaleX, 1],
				scaleY: [transform.scaleY, 1],
				x: [transform.translateX, 0],
				y: [transform.translateY, 0],
				borderRadius: [sourceData.borderRadius, target.borderRadius],
				opacity: [parseFloat(sourceData.opacity), parseFloat(target.opacity)],
			},
			{
				...options.transition,
			},
		)
	})
	onCleanup(() => {
		const ref = el()
		const layoutId = options.layoutId

		if (options.layout) return // Don't set to global store here when layout, this is based on the parent.

		if (!ref || !layoutId) return
		const sourceData = captureElementState(ref)

		// Set to global store.
		setSourceData(layoutId, sourceData)
	})
}

/** @internal Used for layout changes based on parent. (i.e. passing `layout` on a switch thumb) */
export function useParentStylesChanged(
	el: () => HTMLElement | null,
	options: {
		layout?: true
		layoutId?: string
	},
): Accessor<number> {
	const {setSourceData} = rootlessLayoutStore
	const generateRandom = (): number => {
		return crypto.getRandomValues(new Uint32Array(1))[0] as number
	}
	const [parentStyledChangedHash, setParentStyleChangedHash] = createSignal(generateRandom()) // This is what we use to "signal" a change in parent

	onMount(() => {
		const ref = el()
		if (!ref || !options.layout || !options.layoutId || !ref.parentElement) return

		const parent = ref.parentElement
		const originalSetProperty = parent.style.setProperty.bind(parent.style)
		const layoutId = options.layoutId

		parent.style.setProperty = (property: string, value: string | null, priority?: string) => {
			const sourceData = captureElementState(el()!)
			setSourceData(layoutId, sourceData)

			setParentStyleChangedHash(generateRandom())
			originalSetProperty(property, value, priority)
		}

		onCleanup(() => {
			// Restore the original setProperty function to avoid side effects.
			parent.style.setProperty = originalSetProperty
		})
	})

	return parentStyledChangedHash
}
