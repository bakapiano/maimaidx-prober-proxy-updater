import config from "../config.js";
import { fetch } from "node-fetch-cookies";

const testCookieExpired = async (cj) => {
  const result = await fetch(
    cj,
    "https://maimai.wahlap.com/maimai-mobile/home/"
  );
  const body = await result.text();
  console.log(body.indexOf("登录失败"))
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
  cj.save(config.wechatLogin.cookiePath)
  console.log(result);
};

const getSentRequests = async (cj) => {
  const result = await fetch(
    cj,
    "https://maimai.wahlap.com/maimai-mobile/friend/invite/"
  );
  const text = await result.text();
  const t = text.matchAll(/<input type="hidden" name="idx" value="(.*?)"/g)
  const ids = [...t].map(x => x[1])
  console.log(ids)
  return ids
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
}

const  favoriteOffFriend = async (cj, friendCode) => {
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
}


const getFriendVS = async (cj, friendCode, scoreType) => {

}

const getFriendList = async (cj) => {
  const url = "https://maimai.wahlap.com/maimai-mobile/friend/"
  const result = await fetch(cj, url);
  const text = await result.text();
  const t = text.matchAll(/<input type="hidden" name="idx" value="(.*?)"/g)
  const ids = [...new Set([...t].map(x => x[1]))]
  console.log(result)
  return ids
};

const removeFriend = async (cj, friendCode) => {};

const sendFriendRequest = async (cj, friendCode) => {
  // console.log("ok", cj.cookies);
  const rr = await fetch(cj, "https://maimai.wahlap.com/maimai-mobile/home/");
  console.log(rr);
  console.log("home post done");
  const result = await fetch(
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
  // console.log(result);
  cj.save(config.wechatLogin.cookiePath)

  const rrr = await fetch(
    cj,
    "https://maimai.wahlap.com/maimai-mobile/index.php/friend/invite/"
  );
  cj.save(config.wechatLogin.cookiePath)
};

const updateScoreByVsPage = async (cj, friendCode, username, password) => {};

export {
  getFriendList,
  removeFriend,
  sendFriendRequest,
  updateScoreByVsPage,
  cancelFriendRequest,
  getSentRequests,
  testCookieExpired,
  favoriteOffFriend,
  favoriteOnFriend,
};
