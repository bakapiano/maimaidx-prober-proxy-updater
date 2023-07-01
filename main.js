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
  validateFriendCode,
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
import { useTrace } from "./src/trace.js";

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

        const { friendCode, traceUUID } = data;
        const trace = useTrace(traceUUID);

        if (
          requests.indexOf(friendCode) !== -1 ||
          friends.indexOf(friendCode) !== -1
        ) {
          await trace({
            log: `好友请求发送成功！请同意好友请求来继续`,
            progress: 10,
          });
          await setValue(friendCode, { ...data, status: "sent" });
          continue;
        }

        validateFriendCode(cj, friendCode).then(async (result)=>{
          if (!result) {
            await trace({
              log: `玩家不存在，请检查好友代码！`,
              status: "failed",
            });
            await delValue(cj, friendCode);
            return
          }
          
          sendFriendRequest(cj, friendCode)
          .then(async () => {
            const requests = await getSentRequests(cj);
            if (!(friendCode in requests)) appendQueue(data); // TODO: skip freiend code validation next try
            else {
              await setValue(friendCode, { ...data, status: "sent" });
              await trace({
                log: `好友请求发送成功！请同意好友请求来继续`,
                progress: 10,
              });
            }
          })
          .catch((err) => {
            console.log(err)
            appendQueue(data)
          });
        })
      }

      // Get friend list
      const friendList = await getFriendList(cj);
      for (const friendCode of friendList) {
        const work = () =>
          new Promise(async (resolve) => {
            const data = await getValue(friendCode);

            console.log(friendCode, data);
            if (!data) {
              // 清理已经完成的好友
              removeFriend(cj, friendCode);
              return resolve();
            }

            const { username, password, traceUUID, status } = data;
            const trace = useTrace(traceUUID);

            if (status === "running") return resolve();
            await trace({
              log: `已成功添加好友！`,
              progress: 10,
            });
            await setValue(friendCode, { ...data, status: "running" });
            resolve();

            const descriptions = ["Basic", "Advanced", "Expert", "Master", "Re:Master"];
            await favoriteOnFriend(cj, friendCode);
            await Promise.all(
              [0, 1, 2, 3, 4].map(async (diff) => {
                try {
                  await trace({
                    log: `开始更新 ${descriptions[diff]} 难度数据`,
                  });
                  
                  let v1 = await getFriendVS(cj, friendCode, 1, diff);
                  let v2 = await getFriendVS(cj, friendCode, 2, diff);

                  await trace({
                    log: `${descriptions[diff]} 难度友人对战数据获取成功`,
                  });

                  v1 = v1
                    .match(/<html.*>([\s\S]*)<\/html>/)[1]
                    .replace(/\s+/g, " ");
                  v2 = v2
                    .match(/<html.*>([\s\S]*)<\/html>/)[1]
                    .replace(/\s+/g, " ");
                  const url = `${config.pageParserHost}/page/friendVS`;
  
                  const uploadResult = await fetch(url, {
                    method: "POST",
                    headers: { "content-type": "text/plain" },
                    body: `<login><u>${username}</u><p>${password}</p></login><dxscorevs>${v1}</dxscorevs><achievementsvs>${v2}</achievementsvs>`,
                  });
                  console.log(descriptions[diff], uploadResult);

                  const log = `diving-fish 上传 ${
                    descriptions[diff]
                  } 分数接口返回消息: ${await uploadResult.text()}`;
                  await trace({log,});
                }
                catch (err) {
                  console.log(err);
                  await trace({
                    log: `${descriptions[diff]} 难度数据更新时出现错误 ${err}`,
                    progress: 0,
                  });
                }
                finally {
                  await trace({
                    log: `${descriptions[diff]} 难度数据结束`,
                    progress: 16,
                  });
                }
              })
            );
            await favoriteOffFriend(cj, friendCode);
            await removeFriend(cj, friendCode);
            await delValue(cj, friendCode);
            await trace({
              log: `maimai 数据更新完成`,
              status: "success",
            });
          });
        await work();
      }
    })
  );
