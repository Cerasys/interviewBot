import * as redis from "redis";
console.log("after redis, before encrypt");
import encrypt from "./encrypt";
console.log("after encrypt");
/**
 * The auth token exchange happens before the Zoom App is launched. Therefore,
 * we need a place to store the tokens so we can later use them when a session
 * is established.
 *
 * We're using Redis here, but this could be replaced by a cache or other means
 * of persistence.
 */

console.log("Creating redis client");
console.log(
  "process.env.REDIS_URL: " + process.env.REDIS_URL
);

try {
  redis.createClient({
    url: "redis://redis:6379/1" //process.env.REDIS_URL,
  });
} catch (e) {
  console.log("error: " + e);
}

export const RedisClient = redis.createClient({
  url: "redis://redis:6379/1" //process.env.REDIS_URL,
});

console.log("after redis client");

// @todo: proper logging and error handling
RedisClient.on("error", console.error);

export default {
  getUser: async function (zoomUserId: string) {
    const user = await RedisClient.get(zoomUserId);
    if (!user) {
      console.log(
        "User not found.  This is normal if the user has added via In-Client (or if you have restarted Docker without closing and reloading the app)"
      );
      return Promise.reject("User not found");
    }
    return JSON.parse(encrypt.beforeDeserialization(user));
  },

  upsertUser: function (
    zoomUserId: string,
    accessToken: string,
    refreshToken: string,
    expired_at: number
  ) {
    const isValidUser = Boolean(
      typeof zoomUserId === "string" &&
        typeof accessToken === "string" &&
        typeof refreshToken === "string" &&
        typeof expired_at === "number"
    );

    if (!isValidUser) {
      return Promise.reject("Invalid user input");
    }

    return RedisClient.set(
      zoomUserId,
      encrypt.afterSerialization(
        JSON.stringify({ accessToken, refreshToken, expired_at })
      )
    );
  },

  updateUser: async function (zoomUserId: string, data: any) {
    const userData = await RedisClient.get(zoomUserId);
    const existingUser = JSON.parse(encrypt.beforeDeserialization(userData as string));
    const updatedUser = { ...existingUser, ...data };

    return RedisClient.set(
      zoomUserId,
      encrypt.afterSerialization(JSON.stringify(updatedUser))
    );
  },

  logoutUser: async function (zoomUserId: string) {
    const reply = await RedisClient.get(zoomUserId);
    const decrypted = JSON.parse(encrypt.beforeDeserialization(reply as string));
    delete decrypted.thirdPartyAccessToken;
    return RedisClient.set(
      zoomUserId,
      encrypt.afterSerialization(JSON.stringify(decrypted))
    );
  },

  deleteUser: (zoomUserId: string) => RedisClient.del(zoomUserId),

  storeInvite: (invitationID: string, tabState: string) => {
    const dbKey = `invite:${invitationID}`;
    return RedisClient.set(dbKey, tabState);
  },

  getInvite: (invitationID: string) => {
    const dbKey = `invite:${invitationID}`;
    return RedisClient.get(dbKey);
  },
};
