import { BlobServiceClient, ContainerClient } from '@azure/storage-blob';
export declare const getBlobServiceClient: () => BlobServiceClient;
export declare const getContainerClient: () => Promise<ContainerClient>;
export declare const uploadPhoto: (fileName: string, data: Buffer, contentType: string) => Promise<string>;
export declare const deletePhoto: (fileName: string) => Promise<void>;
export declare const generateSasUrl: (fileName: string, expiresInMinutes?: number) => Promise<string>;
//# sourceMappingURL=storage.d.ts.map