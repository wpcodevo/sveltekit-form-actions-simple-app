import { writable } from 'svelte/store';

type Store = {
	pageloading: boolean;
	setPageLoading: (val: boolean) => void;
};

function useFeedbackStore() {
	const { update, subscribe, set } = writable<Store>({
		pageloading: false,
		setPageLoading: (val) => update((state: Store) => ({ ...state, pageloading: val }))
	});
	return { update, subscribe, set };
}

const feedbackStore = useFeedbackStore();
export default feedbackStore;
