import net from "net";
import http from "http";
import url from 'url';
import { crawler } from "./crawler.js";

var proxyServer = http.createServer(httpOptions);

const whiteList = [
  "127.0.0.1",
  "www.diving-fish.com",
  "tgk-wcaime.wahlap.com",
  "localhost",
  "maimai.wahlap.com",
  "bakapiano.digital",
  "maimai.bakapiano.digital",
]

function checkHostInWhiteList(target) {
  target = target.split(":")[0]
  console.log(target)
  for (let host of whiteList) {
    if (target == host) {
      return true
    }
  }
  return false
}

// handle http proxy requests
function httpOptions(clientReq, clientRes) {
  var reqUrl = url.parse(clientReq.url);
  if (!checkHostInWhiteList(reqUrl.host)) return

  console.log('proxy for http request: ' + reqUrl.href);

  if (reqUrl.href.startsWith("http://tgk-wcaime.wahlap.com/wc_auth/oauth/callback/maimai-dx")) {
    console.log("Successfully hook auth request!")

    try {
      const target = reqUrl.href.replace("http", "https")
      const key = url.parse(target, true).query.r
      const { username, password } = global.dict[key]
      delete global.dict[key]

      crawler.work({ username, password, url: target })
    }
    catch (err) {
      console.log(err)
    }
    return
  }

  var options = {
    hostname: reqUrl.hostname,
    port: reqUrl.port,
    path: reqUrl.path,
    method: clientReq.method,
    headers: clientReq.headers
  };

  // create socket connection on behalf of client, then pipe the response to client response (pass it on)
  var serverConnection = http.request(options, function (res) {
    clientRes.writeHead(res.statusCode, res.headers)
    res.pipe(clientRes);
  });

  clientReq.pipe(serverConnection);

  clientReq.on('error', (e) => {
    console.log('client socket error: ' + e);
  });

  serverConnection.on('error', (e) => {
    console.log('server connection error: ' + e);
  });
}

// handle https proxy requests (CONNECT method)
proxyServer.on('connect', (clientReq, clientSocket, head) => {
  var reqUrl = url.parse('https://' + clientReq.url);
  console.log('proxy for https request: ' + reqUrl.href + '(path encrypted by ssl)');

  if (!checkHostInWhiteList(reqUrl.host)) return

  var options = {
    port: reqUrl.port,
    host: reqUrl.hostname
  };

  // create socket connection for client, then pipe (redirect) it to client socket
  var serverSocket = net.connect(options, () => {
    clientSocket.write('HTTP/' + clientReq.httpVersion + ' 200 Connection Established\r\n' +
      'Proxy-agent: Node.js-Proxy\r\n' +
      '\r\n', 'UTF-8', () => {
        // creating pipes in both ends
        serverSocket.write(head);
        serverSocket.pipe(clientSocket);
        clientSocket.pipe(serverSocket);
      });
  });

  clientSocket.on('error', (e) => {
    console.log("client socket error: " + e);
    serverSocket.end();
  });

  serverSocket.on('error', (e) => {
    console.log("forward proxy server connection error: " + e);
    clientSocket.end();
  });
});

proxyServer.on('clientError', (err, clientSocket) => {
  console.log('client error: ' + err);
  clientSocket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});


var proxy = proxyServer
export { proxy }
