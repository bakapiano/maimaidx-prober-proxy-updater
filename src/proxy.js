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
  //"maimai.wahlap.com",
  "bakapiano.digital",
  "maimai.bakapiano.digital",
  "maimai.bakapiano.com",
  "open.weixin.qq.com",
  "libs.baidu.com",
  "devtest.com",
]

function checkHostInWhiteList(target) {
  if (!target) return false
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
  clientReq.on('error', (e) => {
    console.log('client socket error: ' + e);
  });

  console.log("fuck")
  console.log(clientReq.url)
  var reqUrl = url.parse(clientReq.url);
    if (!checkHostInWhiteList(reqUrl.host)) {
    try {
        clientRes.statusCode = 400
        clientRes.writeHead(400, { 
            'Access-Control-Allow-Origin': '*',
        })
      clientRes.end('HTTP/1.1 400 Bad Request\r\n\r\n');
    }
    catch (err) {
      console.log(err)
    }
    return
  }

  if (reqUrl.href.startsWith("http://tgk-wcaime.wahlap.com/wc_auth/oauth/callback/maimai-dx")) {
    console.log("Successfully hook auth request!")

    try {
      const target = reqUrl.href.replace("http", "https")
      const key = url.parse(target, true).query.r
      const { username, password } = global.dict[key]
      delete global.dict[key]

      crawler.work({
        username, password, url: target, callback(msg) {
          clientRes.writeHead(302, { 
              //'Content-Type': 'text/html',
              "location": "https://maimai.bakapiano.com/#Success"
          })
          clientRes.statusCode = 302
          clientRes.end();
        }
      })
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

  serverConnection.on('error', (e) => {
    console.log('server connection error: ' + e);
  });

  clientReq.pipe(serverConnection);
}

// handle https proxy requests (CONNECT method)
proxyServer.on('connect', (clientReq, clientSocket, head) => {
  clientSocket.on('error', (e) => {
    console.log("client socket error: " + e);
    clientSocket.end();
  });

  var reqUrl = url.parse('https://' + clientReq.url);
  console.log('proxy for https request: ' + reqUrl.href + '(path encrypted by ssl)');

    if (!checkHostInWhiteList(reqUrl.host) ||
        reqUrl.href.startsWith("https://maimai.wahlap.com/")) {
    try {
      clientSocket.statusCode = 400
      clientSocket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
    }
    catch (err) {
      console.log(err)
    }
    return
  }

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

  serverSocket.on('error', (e) => {
    console.log("forward proxy server connection error: " + e);
    clientSocket.end();
  });
});

proxyServer.on('clientError', (err, clientSocket) => {
  console.log('client error: ' + err);
  clientSocket.statusCode = 400
  clientSocket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
});


var proxy = proxyServer
export { proxy }
