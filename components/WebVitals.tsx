import Script from 'next/script'

export default function WebVitals() {
  return (
    <>
      <Script
        id="web-vitals"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              function sendToAnalytics(metric) {
                if (typeof gtag !== 'undefined') {
                  gtag('event', metric.name, {
                    'custom_parameter_1': Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
                    'custom_parameter_2': metric.id,
                    'custom_parameter_3': metric.delta,
                  });
                }
              }
              
              if ('web-vitals' in window) {
                import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
                  getCLS(sendToAnalytics);
                  getFID(sendToAnalytics);
                  getFCP(sendToAnalytics);
                  getLCP(sendToAnalytics);
                  getTTFB(sendToAnalytics);
                });
              }
            })();
          `,
        }}
      />
    </>
  )
}
