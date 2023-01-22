import {
  CookieJar,
  fetch as fetchWithCookie,
} from "node-fetch-cookies";

import fetch from "node-fetch";

async function verifyProberAccount(username, password) {
  const res = await fetch(
    "https://www.diving-fish.com/api/maimaidxprober/login",
    {
      method: "post",
      headers: {
        Host: "www.diving-fish.com",
        Origin: "https://www.diving-fish.com",
        Referer: "https://www.diving-fish.com/maimaidx/prober/",
        "Content-Type": "application/json;charset=UTF-8",
      },
      body: JSON.stringify({ username, password }),
    }
  );
  const data = await res.json()
  console.log(data)
  return data.errcode == undefined
}

async function getAuthUrl() {
  const res = await fetch(
    "https://tgk-wcaime.wahlap.com/wc_auth/oauth/authorize/maimai-dx"
  );
  const href = res.url.replace("redirect_uri=https", "redirect_uri=http");
  console.log(href);
  return href;
}

async function updateMaimaiScore(username, password, authUrl) {
  const cj = new CookieJar();
  const fetch = async (url, options) => await fetchWithCookie(cj, url, options);

  await fetch(authUrl, {
    headers: {
      Host: "tgk-wcaime.wahlap.com",
      Connection: "keep-alive",
      "Upgrade-Insecure-Requests": "1",
      "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36 NetType/WIFI MicroMessenger/7.0.20.1781(0x6700143B) WindowsWechat(0x6307001e)",
      Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
      "Sec-Fetch-Site": "none",
      "Sec-Fetch-Mode": "navigate",
      "Sec-Fetch-User": "?1",
      "Sec-Fetch-Dest": "document",
      "Accept-Encoding": "gzip, deflate, br",
      "Accept-Language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
    },
  });

  const result = await fetch("https://maimai.wahlap.com/maimai-mobile/home/");
  const body = await result.text();
  if (body.match("错误")) {
    return;
  }

  for (let diff = 0; diff < 5; diff++) {
    const result = await fetch(
      `https://maimai.wahlap.com/maimai-mobile/record/musicGenre/search/?genre=99&diff=${diff}`
    );
    const body = (await result.text())
      .match(/<html.*>([\s\S]*)<\/html>/)[1]
      .replace(/\s+/g, " ");

    const uploadResult = await fetch("https://www.diving-fish.com/api/pageparser/page", {
      method: "post",
      headers: { "content-type": "text/plain" },
      body: `<login><u>${username}</u><p>${password}</p></login>${body}`,
    });

    console.log(await uploadResult.text())
  }
}

async function updateChunithmScore(username, password, url) {}

export {
  verifyProberAccount,
  updateMaimaiScore,
  updateChunithmScore,
  getAuthUrl,
};