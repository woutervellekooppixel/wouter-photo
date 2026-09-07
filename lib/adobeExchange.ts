export const ADOBE_EXCHANGE_HOME = "https://exchange.adobe.com/";

export const ADOBE_EXCHANGE_BATCHCROP_URL =
	process.env.NEXT_PUBLIC_ADOBE_EXCHANGE_BATCHCROP_URL ||
	"https://exchange.adobe.com/apps/cc/a22459df/wouter-photo-batch-crop";

export const ADOBE_EXCHANGE_EXPORT_EVERY_X_URL =
	process.env.NEXT_PUBLIC_ADOBE_EXCHANGE_EXPORT_EVERY_X_URL ||
	process.env.NEXT_PUBLIC_ADOBE_EXCHANGE_SLICE_EVERY_X_URL ||
	"https://exchange.adobe.com/apps/cc/17b43c5f/export-every-x";
