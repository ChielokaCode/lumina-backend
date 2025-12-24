"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPhotos = getPhotos;
exports.getPhoto = getPhoto;
exports.createPhoto = createPhoto;
exports.deletePhotoHandler = deletePhotoHandler;
const cosmos_1 = require("../lib/cosmos");
const storage_1 = require("../lib/storage");
const auth_1 = require("../lib/auth");
const redis_1 = require("../lib/redis");
const uuid_1 = require("uuid");
async function getPhotos(request, context) {
    try {
        const page = parseInt(request.query.get("page") || "1", 10);
        const limitParam = request.query.get("limit");
        const limit = limitParam ? parseInt(limitParam, 10) : 20;
        const version = await (0, redis_1.getPhotosCacheVersion)();
        const cacheKey = redis_1.CACHE_KEYS.photos(version, page, limit);
        const cached = await (0, redis_1.cacheGet)(cacheKey);
        if (cached) {
            context.log("Returning cached photos list");
            return { status: 200, jsonBody: cached };
        }
        let query = "SELECT * FROM c ORDER BY c.createdAt DESC";
        const parameters = [];
        if (limit > 0) {
            const offset = (page - 1) * limit;
            query += " OFFSET @offset LIMIT @limit";
            parameters.push({ name: "@offset", value: offset });
            parameters.push({ name: "@limit", value: limit });
        }
        const container = await (0, cosmos_1.getContainer)(cosmos_1.CONTAINERS.PHOTOS);
        const { resources: photos } = await container.items
            .query({ query, parameters })
            .fetchAll();
        context.log(`Fetched ${photos.length} photos (page: ${page}, limit: ${limit})`);
        await (0, redis_1.cacheSet)(cacheKey, photos, 60);
        return { status: 200, jsonBody: photos };
    }
    catch (error) {
        context.error("Error fetching photos:", error);
        return { status: 500, jsonBody: { error: "Failed to fetch photos" } };
    }
}
async function getPhoto(request, context) {
    try {
        const id = request.params.id;
        if (!id) {
            context.log("Photo ID not provided");
            return { status: 400, jsonBody: { error: "Photo ID required" } };
        }
        const cacheKey = redis_1.CACHE_KEYS.photo(id);
        const cached = await (0, redis_1.cacheGet)(cacheKey);
        if (cached) {
            context.log(`Returning cached photo ${id}`);
            return { status: 200, jsonBody: cached };
        }
        const container = await (0, cosmos_1.getContainer)(cosmos_1.CONTAINERS.PHOTOS);
        const { resource: photo } = await container.item(id, id).read();
        if (!photo) {
            context.log(`Photo not found: ${id}`);
            return { status: 404, jsonBody: { error: "Photo not found" } };
        }
        await (0, redis_1.cacheSet)(cacheKey, photo, 300);
        context.log(`Fetched photo ${id} from database and cached`);
        return { status: 200, jsonBody: photo };
    }
    catch (error) {
        context.error(`Error fetching photo ${request.params.id}:`, error);
        return { status: 500, jsonBody: { error: "Failed to fetch photo" } };
    }
}
// POST /api/photos - Upload new photo (Creator only)
async function createPhoto(request, context) {
    try {
        // Get user from auth header (validated by middleware)
        const userId = request.headers.get('x-user-id');
        const userName = request.headers.get('x-user-name');
        const userRole = request.headers.get('x-user-role');
        const authHeader = request.headers.get('authorization');
        const user = (0, auth_1.getUserFromJwtToken)(authHeader);
        context.log("User", user?.role);
        if (userRole !== 'creator') {
            return { status: 403, jsonBody: { error: 'Only creators can upload photos' } };
        }
        const formData = await request.formData();
        const file = formData.get("file");
        if (!file || typeof file !== "object") {
            return {
                status: 400,
                jsonBody: { error: "File is required" },
            };
        }
        const title = formData.get('title');
        const caption = formData.get('caption');
        const location = formData.get('location');
        const people = formData.get('people');
        if (!file || !title) {
            return { status: 400, jsonBody: { error: 'Image and title are required' } };
        }
        // Upload to blob storage
        const photoId = (0, uuid_1.v4)();
        const fileName = `${photoId}-${file.name}`;
        const buffer = Buffer.from(await file.arrayBuffer());
        const imageUrl = await (0, storage_1.uploadPhoto)(fileName, buffer, file.type);
        // Save metadata to Cosmos DB
        const photo = {
            id: photoId,
            creatorId: userId,
            creatorName: userName,
            creatorRole: userRole,
            imageUrl,
            title,
            caption,
            location: location || undefined,
            people: people ? people.split(',').map((p) => p.trim()) : undefined,
            likes: 0,
            createdAt: new Date().toISOString(),
        };
        const container = await (0, cosmos_1.getContainer)(cosmos_1.CONTAINERS.PHOTOS);
        await container.items.create(photo);
        // 🔥 Safe cache invalidation
        await (0, redis_1.bumpPhotosCacheVersion)();
        return { status: 201, jsonBody: photo };
    }
    catch (error) {
        context.error('Error creating photo:', error);
        return { status: 500, jsonBody: { error: 'Failed to create photo' } };
    }
}
// DELETE /api/photos/:id - Delete photo (Creator only, own photos)
async function deletePhotoHandler(request, context) {
    try {
        const id = request.params.id;
        const userId = request.headers.get('x-user-id');
        const userRole = request.headers.get('x-user-role');
        if (!id) {
            return { status: 400, jsonBody: { error: 'Photo ID required' } };
        }
        const container = await (0, cosmos_1.getContainer)(cosmos_1.CONTAINERS.PHOTOS);
        const { resource: photo } = await container.item(id, id).read();
        if (!photo) {
            return { status: 404, jsonBody: { error: 'Photo not found' } };
        }
        if (photo.creatorId !== userId && userRole !== 'admin') {
            return { status: 403, jsonBody: { error: 'Not authorized to delete this photo' } };
        }
        // Delete from storage and database
        const fileName = photo.imageUrl.split('/').pop();
        if (fileName) {
            await (0, storage_1.deletePhoto)(fileName);
        }
        await container.item(id, id).delete();
        // 🔥 Proper cache cleanup
        await (0, redis_1.cacheDelete)(redis_1.CACHE_KEYS.photo(id));
        await (0, redis_1.bumpPhotosCacheVersion)();
        return { status: 204 };
    }
    catch (error) {
        context.error('Error deleting photo:', error);
        return { status: 500, jsonBody: { error: 'Failed to delete photo' } };
    }
}
//# sourceMappingURL=index.js.map