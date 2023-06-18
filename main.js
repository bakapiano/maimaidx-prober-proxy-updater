import {
  appendQueue,
  clearExpireData,
  delValue,
  getValue,
  popQueue,
  saveCount,
  setValue,
} from "./src/db.js";
import {
  cancelFriendRequest,
  favoriteOffFriend,
  favoriteOnFriend,
  getFriendList,
  getFriendVS,
  getSentRequests,
  removeFriend,
  sendFriendRequest,
  testCookieExpired,
} from "./src/bot.js";
import { loadCookie, refreshCookie } from "./src/wechat.js";

import { CookieJar } from "node-fetch-cookies";
import config from "./config.js";
import fetch from "node-fetch";
import fs from "fs";
import { interProxy } from "./src/inter-proxy.js"
import { proxy } from "./src/proxy.js";
import schedule from "node-schedule";
import { server } from "./src/server.js";

if (config.interProxy.enable) {
  interProxy.listen(config.interProxy.port)
  interProxy.on("error", (error) => console.log(`Inter proxy error ${error}`))
  console.log(`Inter proxy server listen on ${config.interProxy.port}`);
}

if (config.httpServer.enable) {
  server.listen(config.httpServer.port);
  server.on("error", (error) => console.log(`Server error ${error}`));
  console.log(`HTTP server listen on ${config.httpServer.port}`);
}

if (config.httpProxy.enable) {
  proxy.listen(config.httpProxy.port);
  proxy.on("error", (error) => console.log(`Proxy error ${error}`));
  console.log(`Proxy server listen on ${config.httpProxy.port}`);
}

// Create a schedule to clear in-memory DB and save count
const rule = new schedule.RecurrenceRule();
rule.minute = [];
for (let min = 0; min < 60; min += 5) {
  rule.minute.push(min);
}
schedule.scheduleJob(rule, async () => {
  try {
    console.log(`Clear in-memory DB and save count...`);
    await saveCount();
    await clearExpireData();
  } catch (err) {
    console.error(err);
  }
});

// Set up bot
const botRule = new schedule.RecurrenceRule();
botRule.second = [0, 10, 20, 30, 40, 50];
var lock = false;
function single(func) {
  return async () => {
    if (lock) return;
    lock = true;
    try {
      await func();
    } catch (err) {
      console.log(err);
    } finally {
      lock = false;
    }
  };
}

if (config.bot.enable)
  schedule.scheduleJob(
    botRule,
    single(async () => {
      console.log("Bot wake up");

      let cj = null;
      let failed = true;

      for (let i = 0; i < 3; ++i) {
        cj = await loadCookie();
        if (!(await testCookieExpired(cj))) {
          failed = false;
          break;
        } else {
          await new Promise((r) => {
            setTimeout(r, 1000 * 10);
          });
        }
      }

      if (failed) {
        await refreshCookie();
        cj = await loadCookie();
      }

      // console.log(cj.cookies);

      const requests = await getSentRequests(cj);
      const friends = await getFriendList(cj);
      // Pop up queue to send friendRequest
      while (true) {
        const data = popQueue();
        if (!data) break;

        const { friendCode } = data;

        if (
          requests.indexOf(friendCode) !== -1 ||
          friends.indexOf(friendCode) !== -1
        ) {
          await setValue(friendCode, { ...data, status: "sent" });
          continue;
        }

        sendFriendRequest(cj, friendCode)
          .then(async () => {
            const requests = await getSentRequests(cj);
            if (!(friendCode in requests)) appendQueue(data);
            else await setValue(friendCode, { ...data, status: "sent" });
          })
          .catch(() => appendQueue(data));

        // TODO: handle invaild friend code
      }

      // Get friend list
      const friendList = await getFriendList(cj);
      for (const friendCode of friendList) {
        const work = () =>
          new Promise(async (resolve) => {
            const data = await getValue(friendCode);

            console.log(friendCode, data);
            if (!data) {
              removeFriend(cj, friendCode);
              return resolve();
            }

            const { username, password, traceUUID, status } = data;
            if (status === "running") return resolve();
            await setValue(friendCode, { ...data, status: "running" });
            resolve();

            await favoriteOnFriend(cj, friendCode);
            await Promise.all(
              [0, 1, 2, 3, 4].map(async (diff) => {
                let v1 = await getFriendVS(cj, friendCode, 1, diff);
                let v2 = await getFriendVS(cj, friendCode, 2, diff);
                v1 = v1
                  .match(/<html.*>([\s\S]*)<\/html>/)[1]
                  .replace(/\s+/g, " ");
                v2 = v2
                  .match(/<html.*>([\s\S]*)<\/html>/)[1]
                  .replace(/\s+/g, " ");
                const url = `${config.pageParserHost}/page/friendVS`;

                const result = await fetch(url, {
                  method: "POST",
                  headers: { "content-type": "text/plain" },
                  body: `<login><u>${username}</u><p>${password}</p></login><dxscorevs>${v1}</dxscorevs><achievementsvs>${v2}</achievementsvs>`,
                });

                console.log(diff, result);
              })
            );
            await favoriteOffFriend(cj, friendCode);
            await removeFriend(cj, friendCode);
            await delValue(cj, friendCode);
          });
        await work();
      }
    })
  );
