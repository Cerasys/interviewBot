import { createProxyMiddleware } from "http-proxy-middleware";

export const proxy = createProxyMiddleware({
  target: process.env.ZOOM_HOST as string,
  changeOrigin: true,
  pathRewrite: {
    "^/zoom/api": "",
  },

  onProxyRes: function (proxyRes, req, res) {
    console.log(
      "ZOOM API PROXY ==============================================",
      "\n"
    );

    const body: Uint8Array[] = [];
    proxyRes
      .on("error", (err) => {
        console.error(err);
      })
      .on("data", (chunk) => {
        body.push(chunk);
      })
      .on("end", () => {
        const completBody = Buffer.concat(body).toString();
        // At this point, we have the headers, method, url and body, and can now
        // do whatever we need to in order to respond to this request.
        console.log(
          `Zoom API Proxy => ${req.method} ${req.path} -> [${proxyRes.statusCode}] ${completBody}`
        );

        res.end();
      });
  },
});