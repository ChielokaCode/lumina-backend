export interface AuthUser {
    id: string;
    name: string;
    role: string;
    email?: string;
}
export declare function getUserFromJwtToken(authorizationHeader?: string | null): AuthUser | null;
//# sourceMappingURL=auth.d.ts.map