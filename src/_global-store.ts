/* eslint-disable @typescript-eslint/explicit-function-return-type */

// Mostly based on this blogpost: https://nearform.com/digital-community/stores-no-context-api/

import {Accessor, createEffect, createSignal, onCleanup} from "solid-js"

/** @internal */
const createEmitter = () => {
	const subscriptions = new Map()
	return {
		emit: (v: any) => subscriptions.forEach(fn => fn(v)),
		subscribe: (fn: any) => {
			const key = Symbol()
			subscriptions.set(key, fn)
			return () => subscriptions.delete(key)
		},
	}
}

type StoreInitializer<T> = (get: () => T, set: (op: (state: T) => T) => void) => T
type UseStore<T> = () => Accessor<T>
/** @internal */
export const createGlobalStore = <T>(init: StoreInitializer<T>): UseStore<T> => {
	const emitter = createEmitter()

	let store: T = null
	const get = () => store
	const set = (op: (state: T) => T) => {
		return (
			(store = op(store)),
			// notify all subscriptions when the store updates
			emitter.emit(store)
		)
	}
	store = init(get, set)

	const useStore = (): Accessor<T> => {
		// intitialize component with latest store
		const [localStore, setLocalStore] = createSignal(get())

		// update our local store when the global
		// store updates.
		//
		// emitter.subscribe returns a cleanup
		// function, so react will clean this
		// up on unmount.
		createEffect(() => {
			const cleanup = emitter.subscribe(setLocalStore)
			onCleanup(cleanup)
		})
		return localStore
	}
	return useStore
}
