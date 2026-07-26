const SLUG_REGEX = /^[a-zA-Z0-9-]+$/;

// Shared limits so client and server enforce the same boundaries
// 20GB per bestand: grote bestanden gaan via multipart (parts van 64MB),
// dus de oude 2GB single-PUT-muur geldt niet meer.
export const MAX_UPLOAD_FILE_SIZE_BYTES = 20 * 1024 * 1024 * 1024;
// Boven deze grootte moet de client multipart gebruiken (single PUT blijft
// ruim onder de R2-limiet van ~5GB en faalt minder snel op wankele lijnen).
export const SINGLE_PUT_MAX_BYTES = 512 * 1024 * 1024;
export const MAX_BACKGROUND_FILE_SIZE_BYTES = 25 * 1024 * 1024; // 25MB for background assets

export function isValidSlug(slug: string) {
  return Boolean(slug && SLUG_REGEX.test(slug));
}
