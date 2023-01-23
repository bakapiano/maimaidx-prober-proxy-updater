import { delValue, getValue, setValue } from "./db.js";
import {
  getAuthUrl,
  updateMaimaiScore,
  verifyProberAccount,
} from "./crawler.js";

import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import url from "url";

const app = express();
app.use(cors());

const jsonParser = bodyParser.json({ extended: false });

async function serve(serverReq, serverRes, data, redirect) {
  let { username, password, successPageUrl } = data
  console.log(username, password, successPageUrl)

  if (!username || !password) {
    serverRes.status(400).send("用户名或密码不能为空！");
    return;
  }

  if (!(await verifyProberAccount(username, password))) {
    serverRes.status(400).send("查分器用户名或密码错误！");
    return;
  }

  if (successPageUrl === undefined) {
    successPageUrl = "https://maimai.bakapiano.com/#Success"
  }

  const href = await getAuthUrl();

  const resultUrl = url.parse(href, true);
  const { redirect_uri } = resultUrl.query;
  const key = url.parse(redirect_uri, true).query.r;
  
  await setValue(key, {username, password, successPageUrl})
  
  setTimeout(() => delValue(key), 1000 * 60 * 5);

  redirect === true ? 
    serverRes.redirect(href) : 
    serverRes.status(200).send(href);
}

app.post("/auth", jsonParser, async (serverReq, serverRes) => {
  return await serve(
    serverReq,
    serverRes,
    serverReq.body,
    false,
  );
});

app.get("/shortcut", async (serverReq, serverRes) => {
  return await serve(
    serverReq,
    serverRes,
    serverReq.query,
    true,
  );
});

app.use(express.static("static"));

export { app as server };
