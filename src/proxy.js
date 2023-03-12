import { delValue, getValue } from "./db.js";
import { updateChunithmScore, updateMaimaiScore } from "./crawler.js";

import { HTTPParser } from "http-parser-js";
import config from "../config.js";
import { v4 as genUUID } from "uuid"
import http from "http";
import net from "net";
import url from "url";

const proxyServer = http.createServer(httpOptions);

const WHITE_LIST = [
  "127.0.0.1",
  "localhost",

  "tgk-wcaime.wahlap.com",

  "maimai.bakapiano.com",
  "www.diving-fish.com",

  "open.weixin.qq.com",
  "weixin110.qq.com",
  "res.wx.qq.com",

  "libs.baidu.com",

].concat(config.host);

function checkHostInWhiteList(target) {
  if (!target) return false;
  target = target.split(":")[0];
  return WHITE_LIST.find((value) => value === target) !== undefined;
}

async function onAuthHook(href) {
  console.log("Successfully hook auth request!");

  const protocol = config.dev ? "http" : "https"
  const target = href.replace("http", "https");
  const key = url.parse(target, true).query.r;
  const value = await getValue(key);
  
  if (value === undefined) {
    return `${protocol}://${config.host}/#/error`;
  }

  const { username, password, callbackHost } = value;
  const baseHost = callbackHost || config.host
  const errorPageUrl = `${protocol}://${baseHost}/#/error`
  const traceUUID = genUUID()
  const tracePageUrl = `${protocol}://${baseHost}/#/trace/${traceUUID}/`
  delValue(key);

  console.log(username, password, baseHost)
  if (!username || !password) {
    return errorPageUrl;
  }
  
  if (target.includes('maimai-dx')) {
    updateMaimaiScore(username, password, target, traceUUID);
  } else if (target.includes('chunithm')) {
    updateChunithmScore(username, password, target, traceUUID);
  } else { // ongeki? hahaha
    return errorPageUrl
  }
  return tracePageUrl;
}

// handle http proxy requests
async function httpOptions(clientReq, clientRes) {
  clientReq.on("error", (e) => {
    console.log("client socket error: " + e);
  });

  // console.log(clientReq.url)
  var reqUrl = url.parse(clientReq.url);
  if (!checkHostInWhiteList(reqUrl.host)) {
    try {
      clientRes.statusCode = 400;
      clientRes.writeHead(400, {
        "Access-Control-Allow-Origin": "*",
      });
      clientRes.end("HTTP/1.1 400 Bad Request\r\n\r\n");
    } catch (err) {
      console.log(err);
    }
    return;
  }

  if (
    reqUrl.href.startsWith(
      "http://tgk-wcaime.wahlap.com/wc_auth/oauth/callback"
    )
  ) {
    try {
      const redirectResult = await onAuthHook(reqUrl.href);
      clientRes.writeHead(302, { location: redirectResult });
      clientRes.statusCode = 302;
      clientRes.end();
    } catch (err) {
      console.log(err);
    }

    return;
  }

  var options = {
    hostname: reqUrl.hostname,
    port: reqUrl.port,
    path: reqUrl.path,
    method: clientReq.method,
    headers: clientReq.headers,
  };

  // create socket connection on behalf of client, then pipe the response to client response (pass it on)
  var serverConnection = http.request(options, function (res) {
    clientRes.writeHead(res.statusCode, res.headers);
    res.pipe(clientRes);
  });

  serverConnection.on("error", (e) => {
    console.log("server connection error: " + e);
  });

  clientReq.pipe(serverConnection);
}

// handle https proxy requests (CONNECT method)
proxyServer.on("connect", (clientReq, clientSocket, head) => {
  clientSocket.on("error", (e) => {
    console.log("client socket error: " + e);
    clientSocket.end();
  });

  var reqUrl = url.parse("https://" + clientReq.url);
  // console.log('proxy for https request: ' + reqUrl.href + '(path encrypted by ssl)');

  if (
    !checkHostInWhiteList(reqUrl.host) ||
    reqUrl.href.startsWith("https://maimai.wahlap.com/") ||
    reqUrl.href.startsWith("https://chunithm.wahlap.com/")
  ) {
    try {
      clientSocket.statusCode = 400;
      clientSocket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
    } catch (err) {
      console.log(err);
    }
    return;
  }

  if (reqUrl.host === 'tgk-wcaime.wahlap.com:80') {
    clientSocket.write("HTTP/" +
      clientReq.httpVersion +
      " 200 Connection Established\r\n" +
      "Proxy-agent: Node.js-Proxy\r\n" +
      "\r\n",
      "UTF-8", () => {
        const parser = new HTTPParser('REQUEST');
        parser[HTTPParser.kOnHeadersComplete] = async (info) => {
          const redirectResult = await onAuthHook(`http://tgk-wcaime.wahlap.com${info.url}`);
          clientSocket.end(`HTTP/1.1 302 Found\r\nLocation: ${redirectResult}\r\n\r\n`);
        };

        clientSocket.on('data', chunk => {
          parser.execute(chunk);
        });
      });

    return;
  }

  var options = {
    port: reqUrl.port,
    host: reqUrl.hostname,
  };

  // create socket connection for client, then pipe (redirect) it to client socket
  var serverSocket = net.connect(options, () => {
    clientSocket.write(
      "HTTP/" +
      clientReq.httpVersion +
      " 200 Connection Established\r\n" +
      "Proxy-agent: Node.js-Proxy\r\n" +
      "\r\n",
      "UTF-8",
      () => {
        // creating pipes in both ends
        serverSocket.write(head);
        serverSocket.pipe(clientSocket);
        clientSocket.pipe(serverSocket);
      }
    );
  });

  serverSocket.on("error", (e) => {
    console.log("forward proxy server connection error: " + e);
    clientSocket.end();
  });
});

proxyServer.on("clientError", (err, clientSocket) => {
  console.log("client error: " + err);
  clientSocket.statusCode = 400;
  clientSocket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
});

export { proxyServer as proxy };
