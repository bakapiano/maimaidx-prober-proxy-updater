import { clearExpireData, saveCount } from "./src/db.js"

import { proxy } from "./src/proxy.js"
import schedule from "node-schedule"
import { server } from "./src/server.js"

// const warp = (logFunc) => {
//   return (msg) => {
//     logFunc(`[${(new Date()).toLocaleTimeString()}] ${msg}`)
//   }
// }

// console.log = warp(console.log)
// console.warn = warp(console.warn)
// console.error = warp(console.error)

server.listen(8081)
server.on("error", (error) => console.log(`Server error ${error}`))
console.log("HTTP server listen on 8081")

proxy.listen(2560)
proxy.on("error", (error) => console.log(`Proxy error ${error}`))
console.log("Proxy server listen on 2560");


const rule = new schedule.RecurrenceRule()
rule.minute = []
for (var min = 0; min < 60; min += 5) {
  rule.minute.push(min)
}
schedule.scheduleJob(rule, async () => {
  try {
    console.log(`Clear in-memory DB and save count...`)
    await saveCount()
    await clearExpireData()
  } 
  catch (err) {
    console.error(err)
  }
})