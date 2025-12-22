const SLUG_REGEX = /^[a-zA-Z0-9-]+$/;

// Shared limits so client and server enforce the same boundaries
export const MAX_UPLOAD_FILE_SIZE_BYTES = 2 * 1024 * 1024 * 1024; // 2GB per file
export const MAX_BACKGROUND_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25MB for background assets

export function isValidSlug(slug: string) {
  return Boolean(slug && SLUG_REGEX.test(slug));
}
