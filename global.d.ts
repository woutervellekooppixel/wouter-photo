export {};

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    __wv_ga4_initialized?: boolean;
  }
}
