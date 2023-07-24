import { error, type Actions, fail } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { prisma } from '$lib/server/prisma';
import type { Feedback } from '@prisma/client';

export const load: PageServerLoad = async ({ url }) => {
	const pageQueryParam = url.searchParams.get('page');
	const limitQueryParam = url.searchParams.get('limit');
	const orderBy = url.searchParams.get('orderBy') === 'asc' ? 'asc' : 'desc';

	const page = pageQueryParam ? parseInt(pageQueryParam, 10) : 1;
	const limit = limitQueryParam ? parseInt(limitQueryParam, 10) : 10;
	const skip = (page - 1) * limit;

	const [totalFeedbacks, feedbacks] = await Promise.all([
		prisma.feedback.count(),
		prisma.feedback.findMany({
			skip,
			take: limit,
			orderBy: {
				createdAt: orderBy
			}
		})
	]);

	const totalPages = Math.ceil(totalFeedbacks / limit);
	const hasNextPage = page < totalPages;
	const hasPreviousPage = page > 1;

	return {
		status: 'success',
		pagination: {
			totalPages,
			currentPage: page,
			totalResults: totalFeedbacks,
			hasNextPage,
			hasPreviousPage
		},
		feedbacks
	};
};

export const actions = {
	addFeedback: async ({ request }) => {
		try {
			const { text, rating } = Object.fromEntries(await request.formData()) as {
				text?: string;
				rating: string;
			};

			if (!text) {
				return fail(400, {
					type: 'add',
					message: 'feedback input cannot be empty',
					feedback: { text, id: '' }
				});
			} else if (text.trim().length < 10) {
				return fail(400, {
					type: 'add',
					message: 'feedback text must be at least 10 characters',
					feedback: { text, id: '' }
				});
			}

			const feedback = await prisma.feedback.create({
				data: { text, rating: Number(rating) }
			});

			return { newFeedback: feedback };
		} catch (err: any) {
			if (err.code === 'P2002') {
				return fail(409, {
					type: 'add',
					message: 'Feedback with this title already exists',
					feedback: { text: '', id: '' }
				});
			}

			return fail(500, { type: 'add', message: err.message, feedback: { text: '', id: '' } });
		}
	},
	editFeedback: async ({ url, request }) => {
		const feedbackId = url.searchParams.get('id');
		try {
			if (!feedbackId) {
				return fail(400, {
					type: 'edit',
					message: 'invalid request',
					feedback: { text: '', id: feedbackId }
				});
			}

			const { text } = Object.fromEntries(await request.formData()) as { text?: string };

			if (!text) {
				return fail(400, {
					type: 'edit',
					message: 'feedback input cannot be empty',
					feedback: { text, id: feedbackId }
				});
			} else if (text.trim().length < 10) {
				return fail(400, {
					type: 'edit',
					message: 'feedback text must be at least 10 characters',
					feedback: { text, id: feedbackId }
				});
			}

			const feedback = await prisma.feedback.update({
				where: { id: feedbackId },
				data: { text }
			});

			return { feedback };
		} catch (err: any) {
			if (err.code === 'P2002') {
				return fail(409, {
					type: 'edit',
					message: 'Feedback with this title already exists',
					feedback: { text: '', id: feedbackId }
				});
			}

			if (err.code === 'P2025') {
				return fail(404, {
					type: 'edit',
					message: 'No Feedback with the Provided ID Found',
					feedback: { text: '', id: feedbackId }
				});
			}

			return fail(500, {
				type: 'edit',
				message: err.message,
				feedback: { text: '', id: feedbackId }
			});
		}
	},
	deleteFeedback: async ({ url }) => {
		const feedbackId = url.searchParams.get('id');
		try {
			if (!feedbackId) {
				return fail(400, {
					type: 'delete',
					message: 'invalid request',
					feedback: { text: '', id: feedbackId }
				});
			}

			await prisma.feedback.delete({
				where: { id: feedbackId }
			});

			return {};
		} catch (err: any) {
			if (err.code === 'P2025') {
				return fail(404, {
					type: 'delete',
					message: 'No Feedback with the Provided ID Found',
					feedback: { text: '', id: feedbackId }
				});
			}

			return fail(500, {
				type: 'delete',
				message: err.message,
				feedback: { text: '', id: feedbackId }
			});
		}
	}
} satisfies Actions;
