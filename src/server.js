import {
  getAuthUrl,
  verifyProberAccount,
} from "./crawler.js";
import { getCount, increaseCount, setValue } from "./db.js";

import bodyParser from "body-parser";
import config from "../config.js";
import cors from "cors";
import { exec } from "child_process";
import express from "express";
import fs from "fs";
import { getTrace } from "./trace.js";
import url from "url";

const app = express();
app.use(cors());

const jsonParser = bodyParser.json({ extended: false });

async function serve(serverReq, serverRes, data, redirect) {
  let { username, password, callbackHost, type } = data;
  console.log(username, password, callbackHost, type);

  if (!username || !password) {
    serverRes.status(400).send("用户名或密码不能为空！");
    return;
  }

  // Update maimai dx by default
  if (!type) {
    type = "maimai-dx";
  }

  if (!["maimai-dx", "chunithm"].includes(type)) {
    serverRes.status(400).send("不支持的查分类型！");
    return;
  }

  if (!(
    await verifyProberAccount(username, password)) 
    && username !== "bakapiano666" // 为 app 保留的用户名
  ) {
    serverRes.status(400).send("查分器用户名或密码错误！");
    return;
  }

  if (callbackHost === undefined) {
    callbackHost = config.host;
  }

  const href = await getAuthUrl(type);

  const resultUrl = url.parse(href, true);
  const { redirect_uri } = resultUrl.query;
  const key = url.parse(redirect_uri, true).query.r;

  await setValue(key, { username, password, callbackHost });
  // setTimeout(() => delValue(key), 1000 * 60 * 5);

  increaseCount()
  
  redirect === true
    ? serverRes.redirect(href)
    : serverRes.status(200).send(href);
}

app.post("/auth", jsonParser, async (serverReq, serverRes) => {
  return await serve(serverReq, serverRes, serverReq.body, false);
});

app.get("/shortcut", async (serverReq, serverRes) => {
  return await serve(serverReq, serverRes, serverReq.query, true);
});

app.get("/trace", async (serverReq, serverRes) => {
  const { uuid } = serverReq.query;
  !uuid
    ? serverRes.status(400).send("请提供uuid")
    : serverRes.send(await getTrace(uuid));
});

app.get("/count", async (_serverReq, serverRes) => {
  const count = getCount();
  serverRes.status(200).send({count});
})

if (config.wechatLogin.enable) {
  const validateToken = (serve) => {
    return async (serverReq, serverRes) => {
      const { token } = serverReq.query;
      if (token !== config.wechatLogin.token) {
        serverRes.status(400).send("Invalid token");
      }
      await serve(serverReq, serverRes);
    }
  }

  // Use for local login
  app.get("/token", validateToken(async (serverReq, serverRes) => {
    let { type } = serverReq.query;
  
    const href = await getAuthUrl(type);
  
    const resultUrl = url.parse(href, true);
    const { redirect_uri } = resultUrl.query;
    const key = url.parse(redirect_uri, true).query.r;
    
    await setValue(key, { local: true });

    serverRes.redirect(href);
  }))

  // Trigger a wechat login
  app.get("/trigger", validateToken(async () => {
    try {
      fs.unlink(config.wechatLogin.cookiePath, () => {})
    }
    catch (_err) {}
    exec(config.wechatLogin.cmd2Execute)
    serverRes.status(200).send("Triggered")
  }))

  // Get cookie file content
  app.get("/cookie", validateToken(async (_serverReq, serverRes) => {
    try {
      const content = fs.readFileSync(config.wechatLogin.cookiePath, "utf8")
      serverRes.status(200).send(content)
    }
    catch (err) {
      serverRes.status(400).send(err.message)
    }
  }))
}

app.use(express.static("static"));

export { app as server };
