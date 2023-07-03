import config from "../config.js";
import { fetchWithCookieWithRetry } from "./util.js";
import { loadCookie } from "./wechat.js";

const getCookieValue = (cj) => {
  return [
    cj.cookies?.get("maimai.wahlap.com")?.get("_t")?.value,
    cj.cookies?.get("maimai.wahlap.com")?.get("userId")?.value,
  ]
}

const fetch = async (cj, url, options, retry = 1) => {
  cj = await loadCookie();
  const result = await fetchWithCookieWithRetry(cj, url, options);
  const resultToReturn = result.clone();
  if (result.url.indexOf("error") !== -1 || (await testCookieExpired(cj))) {
    if (retry === 10) {
      throw new Error("Retry hit max limit.");
    }

    if (result.url.indexOf("error") !== -1) {
      const text = await result.text();
      const errroCode = text.match(/<div class="p_5 f_14 ">(.*)<\/div>/)[1]
      const errorBody = text.match(/<div class="p_5 f_12 gray break">(.*)<\/div>/)[1]
      console.log("Error url:", result.url)
      console.log("Error code:", errroCode)
      console.log("Error body:", errorBody)
    }

    console.log(
      `Fetch error, try to reload cookie and retry. Retry time: ${retry}`
    );
    console.log(
      "Cookie value:", getCookieValue(cj)
    )
    return await new Promise((resolve, reject) => {
      setTimeout(async () => {
        await fetch(cj, url, options, retry + 1)
          .then(resolve)
          .catch(reject);
      }, 1000 * 30);
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
      cj.cookies.get("maimai.wahlap.com").get("userId").expiry = (new Date()).setFullYear(2099)
      cj.cookies.get("maimai.wahlap.com").get("_t").expiry = (new Date()).setFullYear(2099)
      await cj.save(config.wechatLogin.cookiePath)
    }
  }
  return resultToReturn;
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
  const result = await fetch(
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
  // cj.save(config.wechatLogin.cookiePath);
  // console.log(result);
};

const getSentRequests = async (cj) => {
  const result = await fetch(
    cj,
    "https://maimai.wahlap.com/maimai-mobile/friend/invite/"
  );
  const text = await result.text();
  const t = text.matchAll(/<input type="hidden" name="idx" value="(.*?)"/g);
  const ids = [...t].map((x) => x[1]);
  // console.log(ids);
  return ids;
};

const favoriteOnFriend = async (cj, friendCode) => {
  const result = await fetch(
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
};

const favoriteOffFriend = async (cj, friendCode) => {
  const result = await fetch(
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
};

const getFriendVS = async (cj, friendCode, scoreType, diff) => {
  const url = `https://maimai.wahlap.com/maimai-mobile/friend/friendGenreVs/battleStart/?scoreType=${scoreType}&genre=99&diff=${diff}&idx=${friendCode}`;
  const result = await fetch(cj, url);
  return await result.text();
};

const getFriendList = async (cj) => {
  const url = "https://maimai.wahlap.com/maimai-mobile/index.php/friend/";
  const result = await fetch(cj, url);
  const text = await result.text();
  const t = text.matchAll(/<input type="hidden" name="idx" value="(.*?)"/g);
  const ids = [...new Set([...t].map((x) => x[1]))];
  // console.log(result);
  // console.log(ids);
  return ids;
};

const removeFriend = async (cj, friendCode) => {
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
  // console.log(result);
};

const sendFriendRequest = async (cj, friendCode) => {
  const result1 = await fetch(
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

  // console.log(result1);

  const result2 = await fetch(
    cj,
    "https://maimai.wahlap.com/maimai-mobile/index.php/friend/invite/"
  );

  // console.log(result2);
};

const validateFriendCode = async (cj, friendCode) => {
  const result = await fetch(
    cj,
    `https://maimai.wahlap.com/maimai-mobile/friend/search/searchUser/?friendCode=${friendCode}`
  );
  const body = await result.text();
  const validateResult = body.indexOf("找不到该玩家") === -1;
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
