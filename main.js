import config from "./config.js"
import { proxy } from "./src/proxy.js"
import { server } from "./src/server.js"

server.listen(8081)
server.on("error", (error) => console.log(`Server error ${error}`))
console.log("HTTP server listen on 8081")

proxy.listen(2560)
proxy.on("error", (error) => console.log(`Proxy error ${error}`))
console.log("Proxy server listen on 2560");