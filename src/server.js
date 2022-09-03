import express from "express";
import url from 'url';
import { crawler } from "./crawler.js";
import bodyParser from "body-parser";
import cors from "cors"

var app = express()
app.use(cors())

var jsonParser = bodyParser.json({ extended: false })

function work(username, password, serverRes, jump=false) {
    console.log(username, password)

    if (!username || !password) {
        serverRes.status(400).send("用户名或密码不能为空！")
        return
    }

    crawler.verifyAccount({
        username, password, callback(fail) {
            if (fail) {
                serverRes.status(400).send("查分器用户名或密码错误！")
                return
            }

            crawler.auth({
                callback(href) {
                    const resultUrl = url.parse(href, true)
                    const { redirect_uri } = resultUrl.query
                    const key = url.parse(redirect_uri, true).query.r

                    global.dict[key] = {
                        username,
                        password,
                    }
                    setTimeout(() => delete global.dict[key], 1000 * 60 * 5)

                    jump ? serverRes.redirect(href) : serverRes.status(200).send(href)
                }
            })
        }
    })
}

app.post("/auth", jsonParser, function (serverReq, serverRes) {
    work(serverReq.body.username, serverReq.body.password, serverRes)
})

app.get("/shortcut", function(serverReq, serverRes){
    work(serverReq.query.username, serverReq.query.password, serverRes, true)
})

app.use(express.static('static'));

var server = app
export { server }

