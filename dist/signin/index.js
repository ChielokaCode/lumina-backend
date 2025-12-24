"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signin = signin;
const cosmos_1 = require("../lib/cosmos");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';
async function signin(request, context) {
    try {
        const body = (await request.json());
        const { email, password } = body;
        if (!email || !password) {
            return { status: 400, jsonBody: { error: 'Email and password are required.' } };
        }
        const container = await (0, cosmos_1.getContainer)(cosmos_1.CONTAINERS.USERS);
        // Fetch user by email
        const { resources } = await container.items
            .query({
            query: 'SELECT * FROM c WHERE c.email=@email',
            parameters: [{ name: '@email', value: email }],
        })
            .fetchAll();
        const user = resources[0];
        if (!user) {
            return { status: 400, jsonBody: { error: 'Invalid email or password.' } };
        }
        // Verify password
        const validPassword = await bcrypt_1.default.compare(password, user.passwordHash);
        if (!validPassword) {
            return { status: 400, jsonBody: { error: 'Invalid email or password.' } };
        }
        // Return user info (omit password) and include role
        const { passwordHash: _, ...userInfo } = user;
        // 🔑 Create JWT with role
        const token = jsonwebtoken_1.default.sign({
            sub: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
        }, JWT_SECRET, { expiresIn: "7d" });
        return {
            status: 200,
            jsonBody: {
                token,
                message: 'Sign-in successful.',
                user: {
                    id: userInfo.id,
                    email: userInfo.email,
                    name: userInfo.name,
                    role: userInfo.role, // <-- include role for frontend
                },
            },
        };
    }
    catch (error) {
        context.error('Sign-In Error:', error);
        return { status: 500, jsonBody: { error: 'Failed to sign in.' } };
    }
}
//# sourceMappingURL=index.js.map