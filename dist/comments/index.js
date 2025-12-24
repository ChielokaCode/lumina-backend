"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getComments = getComments;
exports.createComment = createComment;
exports.deleteComment = deleteComment;
const cosmos_1 = require("../lib/cosmos");
// import { cacheGet, cacheSet, cacheDelete, CACHE_KEYS } from '../lib/redis';
const uuid_1 = require("uuid");
// GET /api/photos/:photoId/comments - Get comments for a photo
async function getComments(request, context) {
    try {
        const photoId = request.headers.get('x-photo-id');
        if (!photoId) {
            return { status: 400, jsonBody: { error: 'Photo ID required' } };
        }
        const container = await (0, cosmos_1.getContainer)(cosmos_1.CONTAINERS.COMMENTS);
        const { resources: comments } = await container.items
            .query({
            query: 'SELECT * FROM c WHERE c.photoId = @photoId ORDER BY c.createdAt DESC',
            parameters: [{ name: '@photoId', value: photoId }],
        }, { partitionKey: photoId } // optional but recommended
        )
            .fetchAll();
        return { status: 200, jsonBody: comments };
    }
    catch (error) {
        context.error('Error fetching comments:', error);
        return { status: 500, jsonBody: { error: 'Failed to fetch comments' } };
    }
}
// POST /api/photos/:photoId/comments - Add comment to a photo
async function createComment(request, context) {
    try {
        const body = await request.json();
        const { photoId, userId, userName, userRole, content } = body;
        if (!photoId) {
            return { status: 400, jsonBody: { error: 'Photo ID required' } };
        }
        if (!userId) {
            return { status: 401, jsonBody: { error: 'Not authenticated' } };
        }
        if (!content?.trim()) {
            return { status: 400, jsonBody: { error: 'Comment content required' } };
        }
        // Verify photo exists
        // const photosContainer = await getContainer(CONTAINERS.PHOTOS);
        // const { resource: photo } = await photosContainer.item(photoId, photoId).read();
        // if (!photoId) {
        //   return { status: 404, jsonBody: { error: 'Photo not found' } };
        // }
        const comment = {
            id: (0, uuid_1.v4)(),
            photoId,
            userId,
            userName: userName || 'Anonymous',
            userRole,
            content: content.trim(),
            createdAt: new Date().toISOString(),
        };
        const commentsContainer = await (0, cosmos_1.getContainer)(cosmos_1.CONTAINERS.COMMENTS);
        await commentsContainer.items.create(comment);
        return { status: 201, jsonBody: comment };
    }
    catch (error) {
        context.error('Error creating comment:', error);
        return { status: 500, jsonBody: { error: 'Failed to create comment' } };
    }
}
// DELETE /api/comments/:id - Delete a comment (own comments only)
async function deleteComment(request, context) {
    try {
        const commentId = request.params.id;
        const userId = request.headers.get('x-user-id');
        const userRole = request.headers.get('x-user-role');
        if (!commentId) {
            return { status: 400, jsonBody: { error: 'Comment ID required' } };
        }
        if (!userId) {
            return { status: 401, jsonBody: { error: 'Not authenticated' } };
        }
        const container = await (0, cosmos_1.getContainer)(cosmos_1.CONTAINERS.COMMENTS);
        // Find the comment
        const { resources: comments } = await container.items
            .query({
            query: 'SELECT * FROM c WHERE c.id = @id',
            parameters: [{ name: '@id', value: commentId }],
        })
            .fetchAll();
        if (comments.length === 0) {
            return { status: 404, jsonBody: { error: 'Comment not found' } };
        }
        const comment = comments[0];
        // Check authorization
        if (comment.userId !== userId && userRole !== 'admin') {
            return { status: 403, jsonBody: { error: 'Not authorized to delete this comment' } };
        }
        await container.item(commentId, comment.photoId).delete();
        // Invalidate cache
        // await cacheDelete(CACHE_KEYS.photoComments(comment.photoId));
        return { status: 204 };
    }
    catch (error) {
        context.error('Error deleting comment:', error);
        return { status: 500, jsonBody: { error: 'Failed to delete comment' } };
    }
}
//# sourceMappingURL=index.js.map