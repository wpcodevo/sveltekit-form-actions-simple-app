<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from '@zerodevx/svelte-toast';
	import Rating from './rating.svelte';
	import feedbackStore from '$lib/store';

	import type { SubmitFunction } from '@sveltejs/kit';
	import type { ActionData } from '../routes/$types';

	export let form: ActionData;
	let rating = 10;

	const handleSubmit: SubmitFunction = () => {
		$feedbackStore.setPageLoading(true);
		return async ({ update, result }) => {
			await update();
			if (result.type === 'success') {
				rating = 10;
				toast.push('Added Feedback Successfully', { classes: ['success'] });
			}
			$feedbackStore.setPageLoading(false);
		};
	};
</script>

<div class="bg-white text-gray-700 rounded-lg p-2 my-2 sm:p-8 sm:my-5 relative">
	<form action="?/addFeedback" method="POST" use:enhance={handleSubmit}>
		<div class="max-w-md mx-auto">
			<label for="feedback-input" class="inline-block text-center text-2xl font-bold"
				>How would you rate your service with us?</label
			>
		</div>
		<Rating bind:selected={rating} />
		<div
			class="flex flex-col items-center gap-y-4 sm:gap-y-0 sm:flex-row sm:border rounded-lg sm:my-4 px-2 py-3"
		>
			<input
				type="text"
				id="feedback-input"
				name="text"
				value={form?.feedback?.text ?? ''}
				class="sm:flex-grow border w-full rounded sm:rounded-none px-2 py-3 sm:border-none text-base sm:text-lg focus:outline-none"
				placeholder="Tell us something that keeps you coming back"
			/>
			<button
				type="submit"
				class="border-0 rounded-md w-28 h-10 cursor-pointer bg-indigo-600 text-white hover:bg-indigo-500 disabled:bg-gray-400 disabled:text-gray-800 disabled:cursor-not-allowed"
			>
				Send
			</button>
		</div>
		{#if form?.message && form.type === 'add'}
			<div role="alert" aria-live="polite" class="sm:pt-3 text-center text-purple-600">
				{form.message}
			</div>
		{/if}
	</form>
</div>
