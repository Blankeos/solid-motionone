import {animate, AnimationOptions, DOMKeyframesDefinition, hover, press, Variants} from "motion"
import {createEffect, createMemo, createUniqueId, JSX, onMount, ParentProps, Show} from "solid-js"
import {Dynamic} from "solid-js/web"
import {createAndBindLayoutState, useParentStylesChanged} from "./layout.js"
import {ParentContext} from "./motion.jsx"

export type MotionEventHandlers = {}

export type MotionComponentProps = ParentProps<MotionEventHandlers> & {
	/**
	 * Yes, normally in SolidJS this is not needed. But for layout animations because of solid's nature to only run a component body once.
	 * never call `onCleanup()` (which is essential to tracking layout), we can't force components to re-render.
	 *
	 * Passing a key will force You'll only need to pass key for "Reorder animation" in lists.
	 **/
	key?: string | number
	/** For single life-cycle layout animations. */
	layout?: true
	/** For shared mount/unmount layout animations. */
	layoutId?: string
	initial?: DOMKeyframesDefinition | string | false
	animate?: DOMKeyframesDefinition | string
	exit?: DOMKeyframesDefinition | string
	transition?: AnimationOptions
	variants?: Variants

	// Gestures
	whileHover?: DOMKeyframesDefinition | string
	/** Basically whileTap */
	whilePress?: DOMKeyframesDefinition | string
	whileInView?: DOMKeyframesDefinition | string
	whileFocus?: DOMKeyframesDefinition | string
	// Unsupported gestures
	// drag,
	// directionLock,
	// onDirectionLock
}

const DEFAULT_INITIAL: DOMKeyframesDefinition = {
	scale: 1,
	opacity: 1,
	x: 0,
	y: 0,
}
const getFirstIntersection = (
	first: DOMKeyframesDefinition,
	second: DOMKeyframesDefinition,
): DOMKeyframesDefinition => {
	const result: DOMKeyframesDefinition = {}
	for (const key in first) {
		if (key in second) {
			// @ts-ignore
			result[key] = first[key]
		}
	}
	return result
}

export default function MotionComp(
	props: MotionComponentProps & {
		ref?: (el: Element) => void
		tag: string
	},
) {
	let root!: Element

	createEffect(() => {
		const animateProp =
			typeof props.animate === "string" ? props.variants?.[props.animate] : props.animate
		if (animateProp) {
			animate(
				root,
				{
					...animateProp,
				},
				{...props.transition},
			)
		}
	})
	onMount(() => {
		const initialProp =
			(typeof props.initial === "string" ? props.variants?.[props.initial] : props.initial) ??
			DEFAULT_INITIAL

		const whilePress =
			typeof props.whilePress === "string"
				? props.variants?.[props.whilePress]
				: props.whilePress
		if (whilePress) {
			press(root, element => {
				animate(
					element,
					{
						...whilePress,
					},
					{...props.transition},
				)

				return () => {
					animate(
						element,
						{
							...getFirstIntersection(initialProp as any, whilePress as any),
						},
						{...props.transition},
					)
				}
			})
		}

		const whileHover =
			typeof props.whileHover === "string"
				? props.variants?.[props.whileHover]
				: props.whileHover
		if (whileHover) {
			hover(root, element => {
				animate(
					element,
					{
						...whileHover,
					},
					{...props.transition},
				)

				return () => {
					animate(
						element,
						{
							...getFirstIntersection(initialProp as any, whileHover as any),
						},
						{...props.transition},
					)
				}
			})
		}
	})

	const layoutId = createMemo(() => {
		if (props.layoutId) return props.layoutId
		if (props.layout) {
			return createUniqueId()
		}
		return undefined
	})

	const parentStyleChangedHash = useParentStylesChanged(() => root as HTMLElement, {
		layout: props.layout,
		layoutId: layoutId(),
	})

	// A layout change is when 'parent' changed OR this current component's hash changed.
	const layoutChangedHash = createMemo(() =>
		props.layoutId !== undefined
			? parentStyleChangedHash() + props.layoutId.toString()
			: parentStyleChangedHash(),
	)

	return (
		<Show when={layoutChangedHash()} keyed>
			{_parentStyleChangedHash => {
				createAndBindLayoutState(() => root as HTMLElement, {
					layout: props.layout,
					layoutId: layoutId(),
					transition: props.transition,
				})
				return (
					<ParentContext.Provider value={1 as any}>
						<Dynamic
							ref={(el: Element) => {
								root = el
								props.ref?.(el)
							}}
							component={props.tag || "div"}
							{...props}
						/>
					</ParentContext.Provider>
				)
			}}
		</Show>
	)
}

export type MotionComponent = {
	// <Motion />
	(props: JSX.IntrinsicElements["div"] & MotionComponentProps): JSX.Element
	// <Motion tag="div" />
	<T extends keyof JSX.IntrinsicElements>(
		props: JSX.IntrinsicElements[T] & MotionComponentProps & {tag: T},
	): JSX.Element
}

export type MotionProxyComponent<T> = (props: T & MotionComponentProps) => JSX.Element
export type MotionProxy = MotionComponent & {
	// <motion.div />
	[K in keyof JSX.IntrinsicElements]: MotionProxyComponent<JSX.IntrinsicElements[K]>
}
export const motion = new Proxy(MotionComp, {
	get:
		(_, tag: string): MotionProxyComponent<any> =>
		props => <MotionComp {...props} tag={tag} />,
}) as MotionProxy
