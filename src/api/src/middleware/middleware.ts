import session from "express-session";
import SessionStoreConstructor from "connect-redis";
import store, { RedisClient } from "../util/store";


export const middleware = {
  // Set up required OWASP HTTP response headers
  setResponseHeaders(req: any, res: any, next: any) {
    res.setHeader("Strict-Transport-Security", "max-age=31536000");
    res.setHeader("X-Content-Type-Options", "nosniff");
    // This CSP is an example, it might not work for your webpage(s)
    // You can generate correct CSP for your webpage here https://www.cspisawesome.com/
    const publicUrl = process.env.PUBLIC_URL as string;
    const { host } = new URL(publicUrl);
    res.setHeader(
      "Content-Security-Policy",
      `default-src *; style-src 'self' 'unsafe-inline'; script-src * 'self' https://appssdk.zoom.us 'unsafe-inline'; connect-src * 'self' wss://${host}/sockjs-node; img-src 'self' data: https://images.unsplash.com; base-uri 'self'; form-action 'self';`
    );
    res.setHeader("Referrer-Policy", "same-origin");
    res.setHeader("X-Frame-Option", "same-origin");
    next();
  },

  // Zoom app session middleware
  session: async () => session({
    secret: process.env.SESSION_SECRET as string,
    resave: false,
    saveUninitialized: true,
    cookie: {
      path: "/",
      httpOnly: true,
      maxAge: 365 * 24 * 60 * 60 * 1000,
    },
    store: new SessionStoreConstructor({
      client: await RedisClient()
    })
  }),

  // Protected route middleware
  // Routes behind this will only show if the user has a Zoom App session and an Auth0 id token
  async requiresThirdPartyAuth(req: any, res: any, next: any) {
    if (req.session.user) {
      try {
        const user = await store.getUser(req.session.user);
        req.thirdPartyAccessToken = user.thirdPartyAccessToken;
        return next();
      } catch (error) {
        return next(
          new Error(
            "Error getting app user from session.  The user may have added from In-Client OAuth"
          )
        );
      }
    } else {
      next(new Error("Unkown or missing session"));
    }
  },
};
