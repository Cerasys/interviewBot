import Script from 'next/script';
import * as React from 'react';

const googleAnalyticsScript = `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'G-RQ8E0KNLW6');`

const clarityScript = `(function (c, l, a, r, i, t, y) {
c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments) };
t = l.createElement(r); t.async = 1; t.src = "https://www.clarity.ms/tag/" + i;
y = l.getElementsByTagName(r)[0]; y.parentNode.insertBefore(t, y);
})(window, document, "clarity", "script", "i9oc1qeo92");`

export const Analytics = React.memo(function AnalyticsAnchor() {
    return (
        <>
            <Script src="https://www.googletagmanager.com/gtag/js?id=G-RQ8E0KNLW6" />
            <Script id="googleanalytics-anchor">
                {googleAnalyticsScript}
            </Script>
            <Script id="clarity-anchor">
                {clarityScript}
            </Script>
        </>
    )
})