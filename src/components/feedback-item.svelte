<script lang="ts">
	import { enhance } from '$app/forms';
	import { toast } from '@zerodevx/svelte-toast';
	import { tick } from 'svelte';
	import { fade } from 'svelte/transition';

	import feedbackStore from '$lib/store';
	import type { Feedback } from '@prisma/client';
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { ActionData } from '../routes/$types';

	export let feedback: Feedback;
	export let form: ActionData;

	let editing = false;
	let editedFeedbackText = feedback.text;

	function windowConfirm(message: string) {
		return window.confirm(message);
	}

	let inputElement: HTMLInputElement | null = null;

	$: if (editing) {
		(async () => {
			await tick();
			inputElement?.focus();
		})();
	}

	const handleSubmit: SubmitFunction = (options) => {
		const deleteAction = options.action.search.includes('deleteFeedback');
		const editAction = options.action.search.includes('editFeedback');

		if (deleteAction) {
			const confirm = windowConfirm('Do you really want to delete this item?');
			if (!confirm) {
				options.cancel();
				return;
			}
		}

		if (feedback.text === editedFeedbackText && editAction) {
			editing = false;
			options.cancel();
			return;
		}

		$feedbackStore.setPageLoading(true);
		return async ({ update, result }) => {
			if (result.type === 'success' && editAction) editing = false;
			await update();

			if (result.type === 'success' && editAction) {
				toast.push('Edited Feedback Successfully', { classes: ['success'] });
			} else if (result.type === 'success' && deleteAction) {
				editing = false;
				toast.push('Deleted Feedback Successfully', { classes: ['success'] });
			}

			$feedbackStore.setPageLoading(false);
		};
	};
</script>

<form
	action="?/editFeedback&id={feedback.id}"
	method="POST"
	use:enhance={handleSubmit}
	in:fade={{ delay: 300, duration: 300 }}
	out:fade={{ delay: 300, duration: 300 }}
	class="bg-white text-gray-700 rounded-lg p-8 my-5 relative"
>
	<div
		class="bg-pink-500 text-white rounded-full border-2 border-gray-200 w-12 h-12 flex items-center justify-center text-2xl font-bold absolute top-0 left-0 -mt-4 -ml-4"
	>
		{feedback.rating}
	</div>
	<button
		class="absolute text-gray-900 font-semibold top-2 right-4"
		formaction="?/deleteFeedback&id={feedback.id}"
	>
		X
	</button>
	<button
		type="button"
		class="absolute top-2 right-12 text-pink-500 hover:text-pink-700"
		class:hidden={editing}
		on:click={() => (editing = true)}>Edit</button
	>
	{#if editing}
		<div class="flex flex-col items-center sm:flex-row justify-between sm:gap-4 gap-y-2">
			<input
				type="text"
				name="text"
				class="border rounded-lg p-2 w-full focus:outline-none"
				bind:value={editedFeedbackText}
				bind:this={inputElement}
			/>
			<div class="flex gap-2">
				<button type="submit" class="text-pink-500 hover:text-pink-700">Save</button>
				<button class="hover:text-pink-700" on:click={() => (editing = false)}>Cancel</button>
			</div>
		</div>
		{#if form?.message && form.type === 'edit' && feedback.id === form.feedback.id}
			<div class="sm:pt-3 text-sm text-center text-purple-600">{form.message}</div>
		{/if}
	{:else}
		<p>{feedback.text}</p>
	{/if}
</form>
