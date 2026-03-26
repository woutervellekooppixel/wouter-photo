export const ADOBE_EXCHANGE_HOME = "https://exchange.adobe.com/";

export const ADOBE_EXCHANGE_BATCHCROP_URL =
	process.env.NEXT_PUBLIC_ADOBE_EXCHANGE_BATCHCROP_URL ||
	"https://exchange.adobe.com/apps/cc/UXP/17b43c5f/versions/uxp-17b43c5f-version-1771508221542/preview?userId=A715574D5DF09C830A495CC8%40AdobeID";

export const ADOBE_EXCHANGE_EXPORT_EVERY_X_URL =
	process.env.NEXT_PUBLIC_ADOBE_EXCHANGE_EXPORT_EVERY_X_URL ||
	process.env.NEXT_PUBLIC_ADOBE_EXCHANGE_SLICE_EVERY_X_URL ||
	"https://exchange.adobe.com/apps/cc/UXP/17b43c5f/versions/uxp-17b43c5f-version-1771508221542/preview?userId=A715574D5DF09C830A495CC8%40AdobeID";
