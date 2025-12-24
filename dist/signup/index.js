"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signupConsumer = signupConsumer;
exports.signupCreator = signupCreator;
const cosmos_1 = require("../lib/cosmos");
const bcrypt_1 = __importDefault(require("bcrypt"));
const crypto_1 = require("crypto");
const SALT_ROUNDS = 10;
async function signupConsumer(request, context) {
    context.log('🔥 Signup function invoked');
    context.log('➡️ Method:', request.method);
    context.log('➡️ URL:', request.url);
    try {
        const body = (await request.json());
        const { email, password, name } = body;
        // Basic validation
        if (!email || !password || !name) {
            return {
                status: 400,
                jsonBody: { error: 'Name, email, and password are required.' },
            };
        }
        const normalizedEmail = email.toLowerCase();
        const usersContainer = await (0, cosmos_1.getContainer)(cosmos_1.CONTAINERS.USERS);
        context.log('🔎 Checking if user (Consumer) exists:', normalizedEmail);
        // Check if user already exists (email unique)
        const { resources: existingUsers } = await usersContainer.items
            .query({
            query: 'SELECT c.id FROM c WHERE c.email = @email',
            parameters: [{ name: '@email', value: normalizedEmail }],
        })
            .fetchAll();
        if (existingUsers.length > 0) {
            return {
                status: 409,
                jsonBody: { error: 'User (Consumer) with this email already exists.' },
            };
        }
        context.log('🔐 Hashing password');
        // Hash password
        const passwordHash = await bcrypt_1.default.hash(password, SALT_ROUNDS);
        // Create user document
        const user = {
            id: (0, crypto_1.randomUUID)(), // partition key
            email: normalizedEmail,
            name,
            passwordHash,
            role: 'consumer',
            createdAt: new Date().toISOString(),
        };
        context.log('📝 Creating user (Consumer) in Cosmos DB:', user.id);
        await usersContainer.items.create(user);
        // Return safe response (no password)
        return {
            status: 201,
            jsonBody: {
                message: 'User (Consumer) registered successfully',
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                },
            },
        };
    }
    catch (error) {
        context.error('🔥 Signup error:', error);
        // Cosmos unique key violation safety net
        if (error.code === 409) {
            return {
                status: 409,
                jsonBody: { error: 'User (Consumer) with this email already exists.' },
            };
        }
        context.error('Signup error:', error);
        return {
            status: 500,
            jsonBody: { error: 'Failed to register user (Consumer).' },
        };
    }
}
async function signupCreator(request, context) {
    context.log('🔥 Signup function invoked');
    context.log('➡️ Method:', request.method);
    context.log('➡️ URL:', request.url);
    try {
        const body = (await request.json());
        const { email, password, name } = body;
        // Basic validation
        if (!email || !password || !name) {
            return {
                status: 400,
                jsonBody: { error: 'Name, email, and password are required.' },
            };
        }
        const normalizedEmail = email.toLowerCase();
        const usersContainer = await (0, cosmos_1.getContainer)(cosmos_1.CONTAINERS.USERS);
        context.log('🔎 Checking if user (Creator) exists:', normalizedEmail);
        // Check if user already exists (email unique)
        const { resources: existingUsers } = await usersContainer.items
            .query({
            query: 'SELECT c.id FROM c WHERE c.email = @email',
            parameters: [{ name: '@email', value: normalizedEmail }],
        })
            .fetchAll();
        if (existingUsers.length > 0) {
            return {
                status: 409,
                jsonBody: { error: 'User (Creator) with this email already exists.' },
            };
        }
        context.log('🔐 Hashing password');
        // Hash password
        const passwordHash = await bcrypt_1.default.hash(password, SALT_ROUNDS);
        // Create user document
        const user = {
            id: (0, crypto_1.randomUUID)(), // partition key
            email: normalizedEmail,
            name,
            passwordHash,
            role: 'creator',
            createdAt: new Date().toISOString(),
        };
        context.log('📝 Creating user (Creator) in Cosmos DB:', user.id);
        await usersContainer.items.create(user);
        // Return safe response (no password)
        return {
            status: 201,
            jsonBody: {
                message: 'User (Creator) registered successfully',
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    role: user.role,
                },
            },
        };
    }
    catch (error) {
        context.error('🔥 Signup error:', error);
        // Cosmos unique key violation safety net
        if (error.code === 409) {
            return {
                status: 409,
                jsonBody: { error: 'User (Creator) with this email already exists.' },
            };
        }
        context.error('Signup error:', error);
        return {
            status: 500,
            jsonBody: { error: 'Failed to register user (Creator).' },
        };
    }
}
//# sourceMappingURL=index.js.map