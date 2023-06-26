import { RedisClientType, createClient } from "redis";
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


let client: RedisClientType;

export const RedisClient = async () => {
  if (!client) {
    client = createClient({
      url: process.env.REDIS_URL,
    });

    // @todo: proper logging and error handling
    client.on("error", console.error);
  }
  await client.connect();

  return client;
};

console.log("after redis client");

export default {
  getUser: async function (zoomUserId: string) {
    const user = await client.get(zoomUserId);
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

    return client.set(
      zoomUserId,
      encrypt.afterSerialization(
        JSON.stringify({ accessToken, refreshToken, expired_at })
      )
    );
  },

  updateUser: async function (zoomUserId: string, data: any) {
    const userData = await client.get(zoomUserId);
    const existingUser = JSON.parse(encrypt.beforeDeserialization(userData as string));
    const updatedUser = { ...existingUser, ...data };

    return client.set(
      zoomUserId,
      encrypt.afterSerialization(JSON.stringify(updatedUser))
    );
  },

  logoutUser: async function (zoomUserId: string) {
    const reply = await client.get(zoomUserId);
    const decrypted = JSON.parse(encrypt.beforeDeserialization(reply as string));
    delete decrypted.thirdPartyAccessToken;
    return client.set(
      zoomUserId,
      encrypt.afterSerialization(JSON.stringify(decrypted))
    );
  },

  deleteUser: (zoomUserId: string) => client.del(zoomUserId),

  storeInvite: (invitationID: string, tabState: string) => {
    const dbKey = `invite:${invitationID}`;
    return client.set(dbKey, tabState);
  },

  getInvite: (invitationID: string) => {
    const dbKey = `invite:${invitationID}`;
    return client.get(dbKey);
  },
};
