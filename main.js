import { server } from "./src/server.js"
import { proxy } from "./src/proxy.js"


global.dict = {}
global.host = "127.0.0.1"

server.listen(8081)
console.log("Server listen on 8081")

proxy.listen(2560)
console.log("Proxy server listen on 2560")
