import { Request, Response, NextFunction } from "express";
import * as zoomApi from "../util/zoom-api";
import store from "../util/store";

interface AppUser {
  expired_at?: number;
  refreshToken: string | null;
  accessToken?: string;
}

// Middleware to automatically refresh an auth token in case of expiration
const getUser = async (req: Request, res: Response, next: NextFunction) => {
  const zoomUserId = req?.session?.user;
  if (!zoomUserId) {
    return next(
      new Error(
        "No session or no user. You may need to close and reload or reinstall the application"
      )
    );
  }

  try {
    const appUser = await store.getUser(zoomUserId);
    // @ts-expect-error not sure about this typing
    req.appUser = appUser;
    return next();
  } catch (error) {
    return next(new Error("Error getting user from session: ", error as ErrorOptions ));
  }
};

const refreshToken = async (req: Request, res: Response, next: NextFunction) => {
  console.log("1. Check validity of access token");
    
  // @ts-expect-error not sure about this typing
  const user = req.appUser as AppUser;
  const { expired_at = 0, refreshToken = null } = user;

  if (!refreshToken || refreshToken === null) {
    return next(new Error("No refresh token saved for this user"));
  }

  if (expired_at && Date.now() >= expired_at - 5000) {
    try {
      console.log("2. User access token expired");
      console.log("2a. Refresh Zoom REST API access token");

      const tokenResponse = await zoomApi.refreshZoomAccessToken(
        user.refreshToken as string
      );

      console.log("2b. Save refreshed user token");
      await store.updateUser(req.session.user, {
        accessToken: tokenResponse.data.access_token,
        refreshToken: tokenResponse.data.refresh_token,
        expired_at: Date.now() + tokenResponse.data.expires_in * 1000,
      });

    } catch (error) {
      return next(new Error("Error refreshing user token."));
    }
  }

  return next();
};

// AUTH HEADER MIDDLEWARE ===================================================
const setZoomAuthHeader = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.session.user) {
      throw new Error(
        "No user in session - this happens when you restart docker and reload embedded browser"
      );
    }
    const user = await store.getUser(req.session.user);
    if (!user) {
      throw new Error("User from this session not found");
    } else if (!user.accessToken) {
      throw new Error(
        "No Zoom REST API access token for this user yet. This happens when user visits your home url from in-client oauth flow.  Must use in-client oauth"
      );
    }
    req.headers["Authorization"] = `Bearer ${user.accessToken}`;
    return next();
  } catch (error) {
    return next(error);
  }
};

export { getUser, refreshToken, setZoomAuthHeader };