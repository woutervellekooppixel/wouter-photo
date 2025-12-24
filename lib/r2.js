"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.r2Client = void 0;
exports.uploadFile = uploadFile;
exports.getFile = getFile;
exports.getSignedDownloadUrl = getSignedDownloadUrl;
exports.listFiles = listFiles;
exports.deleteFile = deleteFile;
exports.saveMetadata = saveMetadata;
exports.getMetadata = getMetadata;
exports.createZipFile = createZipFile;
exports.getZipFile = getZipFile;
exports.updateDownloadCount = updateDownloadCount;
exports.listAllUploads = listAllUploads;
exports.deleteUpload = deleteUpload;
exports.deleteFolder = deleteFolder;
exports.findOrphanedUploads = findOrphanedUploads;
exports.getMonthlyStats = getMonthlyStats;
exports.saveMonthlyStats = saveMonthlyStats;
exports.trackOperation = trackOperation;
exports.trackBandwidth = trackBandwidth;
exports.calculateMonthlyCost = calculateMonthlyCost;
const client_s3_1 = require("@aws-sdk/client-s3");
const s3_request_presigner_1 = require("@aws-sdk/s3-request-presigner");
const archiver_1 = __importDefault(require("archiver"));
const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME;
exports.r2Client = new client_s3_1.S3Client({
    region: "auto",
    endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: R2_ACCESS_KEY_ID,
        secretAccessKey: R2_SECRET_ACCESS_KEY,
    },
});
async function uploadFile(file, key, contentType) {
    const command = new client_s3_1.PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
        Body: file,
        ContentType: contentType,
    });
    await exports.r2Client.send(command);
}
async function getFile(key) {
    var _a;
    const command = new client_s3_1.GetObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
    });
    const response = await exports.r2Client.send(command);
    const bytes = await ((_a = response.Body) === null || _a === void 0 ? void 0 : _a.transformToByteArray());
    return Buffer.from(bytes || []);
}
async function getSignedDownloadUrl(key, expiresIn = 3600) {
    const command = new client_s3_1.GetObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
    });
    return (0, s3_request_presigner_1.getSignedUrl)(exports.r2Client, command, { expiresIn });
}
async function listFiles(prefix) {
    var _a;
    const allFiles = [];
    let continuationToken;
    do {
        const command = new client_s3_1.ListObjectsV2Command({
            Bucket: R2_BUCKET_NAME,
            Prefix: prefix,
            ContinuationToken: continuationToken,
        });
        const response = await exports.r2Client.send(command);
        const files = ((_a = response.Contents) === null || _a === void 0 ? void 0 : _a.map((item) => item.Key)) || [];
        allFiles.push(...files);
        continuationToken = response.NextContinuationToken;
    } while (continuationToken);
    return allFiles;
}
async function deleteFile(key) {
    const command = new client_s3_1.DeleteObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
    });
    const response = await exports.r2Client.send(command);
    console.log('[R2] Delete response for', key, ':', response.$metadata.httpStatusCode);
    if (response.$metadata.httpStatusCode !== 204 && response.$metadata.httpStatusCode !== 200) {
        throw new Error(`Failed to delete ${key}: HTTP ${response.$metadata.httpStatusCode}`);
    }
}
async function saveMetadata(metadata) {
    const key = `metadata/${metadata.slug}.json`;
    await uploadFile(Buffer.from(JSON.stringify(metadata, null, 2)), key, "application/json");
}
async function getMetadata(slug) {
    try {
        const key = `metadata/${slug}.json`;
        const buffer = await getFile(key);
        return JSON.parse(buffer.toString("utf-8"));
    }
    catch (error) {
        return null;
    }
}
async function createZipFile(slug) {
    console.log(`[R2] Creating pre-made zip for ${slug}`);
    const metadata = await getMetadata(slug);
    if (!metadata) {
        throw new Error(`Metadata not found for ${slug}`);
    }
    const archive = (0, archiver_1.default)("zip", { zlib: { level: 6 } });
    const chunks = [];
    // Collect chunks from the archive
    archive.on("data", (chunk) => {
        chunks.push(chunk);
    });
    // Wait for archive to finish
    const archivePromise = new Promise((resolve, reject) => {
        archive.on("end", resolve);
        archive.on("error", reject);
    });
    // Add all files to the archive
    for (const file of metadata.files) {
        const buffer = await getFile(file.key);
        archive.append(buffer, { name: file.name });
    }
    // Finalize the archive
    await archive.finalize();
    await archivePromise;
    // Combine all chunks and upload
    const zipBuffer = Buffer.concat(chunks);
    const zipKey = `zips/${slug}.zip`;
    await uploadFile(zipBuffer, zipKey, "application/zip");
    console.log(`[R2] Pre-made zip created: ${zipKey} (${zipBuffer.length} bytes)`);
}
async function getZipFile(slug) {
    try {
        const zipKey = `zips/${slug}.zip`;
        return await getFile(zipKey);
    }
    catch (error) {
        return null;
    }
}
async function updateDownloadCount(slug, type = 'all', files, ip, userAgent) {
    const metadata = await getMetadata(slug);
    if (metadata) {
        metadata.downloads = (metadata.downloads || 0) + 1;
        // Add to download history
        if (!metadata.downloadHistory) {
            metadata.downloadHistory = [];
        }
        metadata.downloadHistory.push({
            timestamp: new Date().toISOString(),
            type,
            ...(files && { files }),
            ...(ip && { ip }),
            ...(userAgent && { userAgent }),
        });
        await saveMetadata(metadata);
    }
}
async function listAllUploads() {
    const metadataKeys = await listFiles("metadata/");
    const uploads = [];
    for (const key of metadataKeys) {
        if (key.endsWith(".json")) {
            const buffer = await getFile(key);
            const metadata = JSON.parse(buffer.toString("utf-8"));
            uploads.push(metadata);
        }
    }
    return uploads.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}
async function deleteUpload(slug) {
    const metadata = await getMetadata(slug);
    if (!metadata)
        return;
    // Delete all files
    for (const file of metadata.files) {
        await deleteFile(file.key);
    }
    // Delete metadata
    await deleteFile(`metadata/${slug}.json`);
}
async function deleteFolder(prefix) {
    console.log('[R2] Listing files in folder:', prefix);
    const files = await listFiles(prefix);
    console.log('[R2] Found', files.length, 'files to delete:', files);
    if (files.length === 0) {
        console.log('[R2] No files found with prefix:', prefix);
        // Try without trailing slash
        const prefixWithoutSlash = prefix.endsWith('/') ? prefix.slice(0, -1) : prefix;
        console.log('[R2] Trying without trailing slash:', prefixWithoutSlash);
        const filesAlt = await listFiles(prefixWithoutSlash);
        console.log('[R2] Found', filesAlt.length, 'files:', filesAlt);
        if (filesAlt.length === 0) {
            console.log('[R2] Still no files found. Folder may already be empty or not exist.');
            return;
        }
    }
    for (const key of files) {
        console.log('[R2] Deleting file:', key);
        await deleteFile(key);
    }
    // Verify deletion
    console.log('[R2] Verifying deletion...');
    const remainingFiles = await listFiles(prefix);
    console.log('[R2] Files remaining after deletion:', remainingFiles.length);
    if (remainingFiles.length > 0) {
        console.error('[R2] WARNING: Some files were not deleted:', remainingFiles);
        throw new Error(`Failed to delete all files. ${remainingFiles.length} files remaining.`);
    }
    console.log('[R2] Successfully deleted all files in folder:', prefix);
}
async function findOrphanedUploads() {
    // Get all upload folders
    const allFiles = await listFiles("uploads/");
    const uploadFolders = new Set();
    for (const key of allFiles) {
        const parts = key.split('/');
        if (parts.length >= 2) {
            uploadFolders.add(parts[1]); // slug is the second part after "uploads/"
        }
    }
    // Get all metadata slugs
    const metadataKeys = await listFiles("metadata/");
    const metadataSlugs = new Set();
    for (const key of metadataKeys) {
        if (key.endsWith(".json")) {
            const slug = key.replace("metadata/", "").replace(".json", "");
            metadataSlugs.add(slug);
        }
    }
    // Find folders without metadata
    const orphaned = [];
    for (const folder of uploadFolders) {
        if (!metadataSlugs.has(folder)) {
            orphaned.push(folder);
        }
    }
    return orphaned;
}
// Monthly stats tracking
async function getMonthlyStats() {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    try {
        const key = `stats/${currentMonth}.json`;
        const buffer = await getFile(key);
        return JSON.parse(buffer.toString('utf-8'));
    }
    catch (error) {
        // Return default stats if not found
        return {
            month: currentMonth,
            operations: {
                listFiles: 0,
                getFile: 0,
                putFile: 0,
                deleteFile: 0,
            },
            bandwidth: 0,
            storage: 0,
        };
    }
}
async function saveMonthlyStats(stats) {
    const key = `stats/${stats.month}.json`;
    await uploadFile(Buffer.from(JSON.stringify(stats, null, 2)), key, 'application/json');
}
async function trackOperation(operation, count = 1) {
    const stats = await getMonthlyStats();
    stats.operations[operation] += count;
    await saveMonthlyStats(stats);
}
async function trackBandwidth(bytes) {
    const stats = await getMonthlyStats();
    stats.bandwidth += bytes;
    await saveMonthlyStats(stats);
}
async function calculateMonthlyCost() {
    const stats = await getMonthlyStats();
    const uploads = await listAllUploads();
    // Calculate current storage
    const totalStorage = uploads.reduce((acc, u) => acc + u.files.reduce((sum, f) => sum + f.size, 0), 0);
    // R2 Pricing (per maand)
    const storageGB = totalStorage / (1024 * 1024 * 1024);
    const storageCost = storageGB * 0.015; // $0.015 per GB/month
    // Operations cost
    const classAOps = stats.operations.listFiles + stats.operations.putFile + stats.operations.deleteFile;
    const classBOps = stats.operations.getFile;
    const operationsCost = (classAOps / 1000000) * 4.50 + (classBOps / 1000000) * 0.36;
    // Bandwidth cost (egress is free for first 10TB/month with R2!)
    const bandwidthCost = 0;
    return {
        storage: storageGB,
        operations: operationsCost,
        bandwidth: bandwidthCost,
        total: storageCost + operationsCost + bandwidthCost,
    };
}
