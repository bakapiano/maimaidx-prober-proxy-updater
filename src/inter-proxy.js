import config from "../config.js";
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
  "maibot.bakapiano.com",
].concat(config.host);

function checkHostInWhiteList(target) {
  console.log(target)
  if (!target) return false;
  target = target.split(":")[0];
  console.log(WHITE_LIST.find((value) => value === target) !== undefined, target, WHITE_LIST)
  return WHITE_LIST.find((value) => value === target) !== undefined;
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

  console.log(reqUrl.hostname)
  console.log(reqUrl.port)
  console.log(reqUrl.path)

  const path = `http://${reqUrl.hostname}:${reqUrl.port || ""}${reqUrl.path}`

  console.log(path)

  var options = {
    hostname: config.interProxy.targetHost,
    port: config.interProxy.targetPort,
    path: path,
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

  var options = {
    // host: "maimai.bakapiano.com",
    // port: 2560,
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

export { proxyServer as interProxy };