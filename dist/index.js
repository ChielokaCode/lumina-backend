"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpTrigger = httpTrigger;
const functions_1 = require("@azure/functions");
const index_js_1 = require("./signup/index.js");
const index_js_2 = require("./signin/index.js");
const index_js_3 = require("./photos/index.js");
const index_js_4 = require("./likes/index.js");
const index_js_5 = require("./comments/index.js");
async function httpTrigger(request, context) {
    context.log(`HTTP function processed request for url "${request.url}"`);
    const name = request.query.get("name") || (await request.text()) || "world";
    return {
        body: `Hello, ${name}!`,
    };
}
// Register the function with the Functions host
functions_1.app.http("httpTrigger", {
    methods: ["GET", "POST"],
    authLevel: "anonymous",
    handler: httpTrigger,
});
// AUTH
functions_1.app.http("signup-consumer", {
    methods: ["POST"],
    authLevel: "anonymous",
    handler: index_js_1.signupConsumer,
});
functions_1.app.http("signup-creator", {
    methods: ["POST"],
    authLevel: "anonymous",
    handler: index_js_1.signupCreator,
});
functions_1.app.http("signin", {
    methods: ["POST"],
    authLevel: "anonymous",
    handler: index_js_2.signin,
});
// PHOTOS
functions_1.app.http("get-photos", {
    methods: ["GET"],
    authLevel: "anonymous",
    handler: index_js_3.getPhotos,
});
functions_1.app.http("get-photo", {
    methods: ["GET"],
    authLevel: "anonymous",
    handler: index_js_3.getPhoto,
});
functions_1.app.http("create-photo", {
    methods: ["POST"],
    authLevel: "anonymous",
    handler: index_js_3.createPhoto,
});
functions_1.app.http("delete-photo", {
    methods: ["DELETE"],
    authLevel: "anonymous",
    handler: index_js_3.deletePhotoHandler,
});
// LIKES
functions_1.app.http("get-likes", {
    methods: ["GET"],
    authLevel: "anonymous",
    handler: index_js_4.getLikes,
});
functions_1.app.http("like-photo", {
    methods: ["POST"],
    authLevel: "anonymous",
    handler: index_js_4.likePhoto,
});
functions_1.app.http("unlike-photo", {
    methods: ["POST"],
    authLevel: "anonymous",
    handler: index_js_4.unlikePhoto,
});
functions_1.app.http("get-user-liked-photos", {
    methods: ["GET"],
    authLevel: "anonymous",
    handler: index_js_4.getPhotoLikes,
});
// COMMENTS
functions_1.app.http("get-comments", {
    methods: ["GET"],
    authLevel: "anonymous",
    handler: index_js_5.getComments,
});
functions_1.app.http("create-comment", {
    methods: ["POST"],
    authLevel: "anonymous",
    handler: index_js_5.createComment,
});
functions_1.app.http("delete-comment", {
    methods: ["DELETE"],
    authLevel: "anonymous",
    handler: index_js_5.deleteComment,
});
//# sourceMappingURL=index.js.map