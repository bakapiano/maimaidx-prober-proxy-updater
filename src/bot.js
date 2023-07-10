import config from "../config.js";
import { fetchWithCookieWithRetry } from "./util.js";
import { loadCookie } from "./wechat.js";

const getCookieValue = (cj) => {
  return [
    cj.cookies?.get("maimai.wahlap.com")?.get("_t")?.value,
    cj.cookies?.get("maimai.wahlap.com")?.get("userId")?.value,
  ];
};

var lastFetchTime = 0;

const fetch = async (cj, url, options, retry = 1, fetchTimeout = 1000 * 15) => {
  // sleep random 1 - 3 seconds
  do { 
    await new Promise((r) => {
      setTimeout(r, Math.random() * 1000 * 3);
    });
  } while(new Date().getTime() - lastFetchTime < 1000 * 3)
  lastFetchTime = new Date().getTime();

  const result = await fetchWithCookieWithRetry(cj, url, options, fetchTimeout);
  if (result.url.indexOf("error") !== -1) {
    const cookieExpired = await testCookieExpired(cj);

    // For not cookie expired error, retry 2 times
    if (!cookieExpired && retry === 3) {
      throw new Error("Retry hit max limit.");
    }

    // For cookie expired error, retry 10 times
    if (retry === 10) {
      throw new Error("Retry hit max limit, failed to refresh cookie.");
    }

    const text = await result.text();
    const errroCode = text.match(/<div class="p_5 f_14 ">(.*)<\/div>/)[1];
    const errorBody = text.match(
      /<div class="p_5 f_12 gray break">(.*)<\/div>/
    )[1];
    console.log("Error url:", result.url);
    console.log("Error code:", errroCode);
    console.log("Error body:", errorBody);

    console.log(
      `Fetch error, try to reload cookie and retry. Retry time: ${retry}`
    );
    console.log("Cookie value:", getCookieValue(cj));
    return await new Promise((resolve, reject) => {
      setTimeout(async () => {
        await fetch(cj, url, options, retry + 1, fetchTimeout)
          .then(resolve)
          .catch(reject);
      }, 1000 * 15);
    });
  }

  const old = await loadCookie();
  if (
    old.cookies?.get("maimai.wahlap.com")?.get("_t")?.value !== undefined &&
    old.cookies?.get("maimai.wahlap.com")?.get("userId")?.value !== undefined
  ) {
    if (
      (cj.cookies?.get("maimai.wahlap.com")?.get("_t")?.value !==
        old.cookies?.get("maimai.wahlap.com")?.get("_t")?.value ||
        cj.cookies?.get("maimai.wahlap.com")?.get("userId")?.value !==
          old.cookies?.get("maimai.wahlap.com")?.get("userId")?.value) &&
      !(await testCookieExpired(cj))
    ) {
      console.log("Cookies changes", getCookieValue(cj), getCookieValue(old));
      cj.cookies.get("maimai.wahlap.com").get("userId").expiry =
        new Date().setFullYear(2099);
      cj.cookies.get("maimai.wahlap.com").get("_t").expiry =
        new Date().setFullYear(2099);
      await cj.save(config.wechatLogin.cookiePath);
    }
  }
  return result;
};

const testCookieExpired = async (cj) => {
  const result = await fetchWithCookieWithRetry(
    cj,
    "https://maimai.wahlap.com/maimai-mobile/home/"
  );
  const body = await result.text();
  // console.log(body.indexOf("登录失败") !== -1);
  return body.indexOf("登录失败") !== -1;
};

const cancelFriendRequest = async (cj, friendCode) => {
  console.log(`[Bot] Start cancel friend request, friend code ${friendCode}`);
  await fetch(
    cj,
    "https://maimai.wahlap.com/maimai-mobile/friend/invite/cancel/",
    {
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      body: `idx=${friendCode}&token=${
        cj.cookies.get("maimai.wahlap.com").get("_t").value
      }&invite=`,
      method: "POST",
    }
  );
  console.log(`[Bot] Done cancel friend request, friend code ${friendCode}`);
};

const getSentRequests = async (cj) => {
  console.log(`[Bot] Start get sent friend requests`);
  const result = await fetch(
    cj,
    "https://maimai.wahlap.com/maimai-mobile/friend/invite/"
  );
  const text = await result.text();
  const t = text.matchAll(/<input type="hidden" name="idx" value="(.*?)"/g);
  const ids = [...t].map((x) => x[1]);
  console.log(`[Bot] Done get sent friend requests`);
  return ids;
};

const favoriteOnFriend = async (cj, friendCode) => {
  console.log(`[Bot] Start favorite on friend, friend code ${friendCode}`);
  await fetch(
    cj,
    "https://maimai.wahlap.com/maimai-mobile/friend/favoriteOn/",
    {
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      body: `idx=${friendCode}&token=${
        cj.cookies.get("maimai.wahlap.com").get("_t").value
      }`,
      method: "POST",
    }
  );
  console.log(`[Bot] Done favorite on friend, friend code ${friendCode}`);
};

const favoriteOffFriend = async (cj, friendCode) => {
  console.log(`[Bot] Start favorite off friend, friend code ${friendCode}`);
  await fetch(
    cj,
    "https://maimai.wahlap.com/maimai-mobile/friend/favoriteOff/",
    {
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      body: `idx=${friendCode}&token=${
        cj.cookies.get("maimai.wahlap.com").get("_t").value
      }`,
      method: "POST",
    }
  );
  console.log(`[Bot] Done favorite off friend, friend code ${friendCode}`);
};

const getFriendVS = async (cj, friendCode, scoreType, diff) => {
  const url = `https://maimai.wahlap.com/maimai-mobile/friend/friendGenreVs/battleStart/?scoreType=${scoreType}&genre=99&diff=${diff}&idx=${friendCode}`;
  const result = await fetch(cj, url, {}, 1, 1000 * 60 * 5);
  return await result.text();
};

const getFriendList = async (cj) => {
  console.log(`[Bot] Start get friend list`);
  const url = "https://maimai.wahlap.com/maimai-mobile/index.php/friend/";
  const result = await fetch(cj, url);
  const text = await result.text();
  const t = text.matchAll(/<input type="hidden" name="idx" value="(.*?)"/g);
  const ids = [...new Set([...t].map((x) => x[1]))];
  console.log(`[Bot] Done get friend list`);
  return ids;
};

const removeFriend = async (cj, friendCode) => {
  console.log(`[Bot] Start remove friend, friend code ${friendCode}`);
  const url =
    "https://maimai.wahlap.com/maimai-mobile/friend/friendDetail/drop/";
  const result = await fetch(cj, url, {
    headers: {
      "content-type": "application/x-www-form-urlencoded",
    },
    body: `idx=${friendCode}&token=${
      cj.cookies.get("maimai.wahlap.com").get("_t").value
    }`,
    method: "POST",
  });
  console.log(`[Bot] Done remove friend, friend code ${friendCode}`);
};

const sendFriendRequest = async (cj, friendCode) => {
  console.log(`[Bot] Start send friend request, friend code ${friendCode}`);
  await fetch(
    cj,
    "https://maimai.wahlap.com/maimai-mobile/friend/search/invite/",
    {
      headers: {
        "content-type": "application/x-www-form-urlencoded",
      },
      body: `idx=${friendCode}&token=${
        cj.cookies.get("maimai.wahlap.com").get("_t").value
      }&invite=`,
      method: "POST",
    }
  );

  await fetch(
    cj,
    "https://maimai.wahlap.com/maimai-mobile/index.php/friend/invite/"
  );

  console.log(`[Bot] Done send friend request, friend code ${friendCode}`);
};

const validateFriendCode = async (cj, friendCode) => {
  console.log(`[Bot] Start validate friend code, friend code ${friendCode}`);

  const result = await fetch(
    cj,
    `https://maimai.wahlap.com/maimai-mobile/friend/search/searchUser/?friendCode=${friendCode}`
  );
  const body = await result.text();
  const validateResult = body.indexOf("找不到该玩家") === -1;

  console.log(
    `[Bot] Done validate friend code, friend code ${friendCode}, result ${validateResult}`
  );
  return validateResult;
};

export {
  getFriendList,
  removeFriend,
  sendFriendRequest,
  cancelFriendRequest,
  getSentRequests,
  testCookieExpired,
  favoriteOffFriend,
  favoriteOnFriend,
  getFriendVS,
  validateFriendCode,
};
