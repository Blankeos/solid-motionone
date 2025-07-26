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
