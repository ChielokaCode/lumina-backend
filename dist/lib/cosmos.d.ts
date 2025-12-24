import { CosmosClient, Database, Container } from '@azure/cosmos';
export declare const getCosmosClient: () => CosmosClient;
export declare const getDatabase: () => Promise<Database>;
export declare const getContainer: (containerId: string) => Promise<Container>;
export declare const CONTAINERS: {
    readonly USERS: "users";
    readonly PHOTOS: "photos";
    readonly COMMENTS: "comments";
    readonly LIKES: "likes";
};
//# sourceMappingURL=cosmos.d.ts.map