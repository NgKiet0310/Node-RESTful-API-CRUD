// utils /cache.js
     import redis from "redis";

     const client = redis.createClient({ url: process.env.REDIS_URL || "redis://localhost:6379" });
     client.connect();

     export const getCache = async (key) => {
       const data = await client.get(key);
       return data ? JSON.parse(data) : null;
     };

     export const setCache = async (key, value, expiry = 3600) => {
       await client.setEx(key, expiry, JSON.stringify(value));
     };
     export const deleteCache = async (key) => {
  await client.del(key);
};

export const deleteCacheByPrefix = async (prefix) => {
  const keys = await client.keys(`${prefix}*`);
  if (keys.length) {
    await client.del(keys);
  }
};
