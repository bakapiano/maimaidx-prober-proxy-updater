import { delValue, getValue } from "./db.js";

import config from "../config.js";
import http from "http";
import net from "net";
import { updateChunithmScore, updateMaimaiScore } from "./crawler.js";
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

// handle http proxy requests
function httpOptions(clientReq, clientRes) {
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
    console.log("Successfully hook auth request!");

    try {
      const target = reqUrl.href.replace("http", "https");
      const key = url.parse(target, true).query.r;

      getValue(key).then((value) => {
        if (value !== undefined) {
          console.log(key, value);

          let { username, password, successPageUrl } = value;
          delValue(key);

          if (successPageUrl === undefined) {
            successPageUrl = "https://maimai.bakapiano.com/#Success"
          }
          
          if(target.includes('maimai-dx')) {
            updateMaimaiScore(username, password, target);
          } else if (target.includes('chunithm')) {
            updateChunithmScore(username, password, target);
          } else {
            throw new Error('ongeki?');
          }
          
          clientRes.writeHead(302, { location: successPageUrl });
          clientRes.statusCode = 302;
          clientRes.end();
        }
      });
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
    reqUrl.href.startsWith("https://maimai.wahlap.com/")
  ) {
    try {
      clientSocket.statusCode = 400;
      clientSocket.end("HTTP/1.1 400 Bad Request\r\n\r\n");
    } catch (err) {
      console.log(err);
    }
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
