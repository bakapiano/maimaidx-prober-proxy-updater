import request from "request"
import tough from "tough-cookie"


var crawler = {}


crawler.auth = function ({ callback }) {
    request.get("https://tgk-wcaime.wahlap.com/wc_auth/oauth/authorize/maimai-dx", {}, (err, res, body) => {
        let href = res.request.uri.href
        href = href.replace("redirect_uri=https", "redirect_uri=http")
        callback(href)
    })
}

crawler.work = function ({ username, password, url }) {
    const cj = request.jar();

    request.get(
        url,
        {
            headers: {
                "Host": "tgk-wcaime.wahlap.com",
                "Connection": "keep-alive",
                "Upgrade-Insecure-Requests": "1",
                "User-Agent": "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.138 Safari/537.36 NetType/WIFI MicroMessenger/7.0.20.1781(0x6700143B) WindowsWechat(0x6307001e)",
                "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
                "Sec-Fetch-Site": "none",
                "Sec-Fetch-Mode": "navigate",
                "Sec-Fetch-User": "?1",
                "Sec-Fetch-Dest": "document",
                "Accept-Encoding": "gzip, deflate, br",
                "Accept-Language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
            },
            jar: cj,
        },
        (err, res, body) => {
            request.get(
                "https://maimai.wahlap.com/maimai-mobile/home/",
                { jar: cj },
                (err, res, body) => {
                    const fetch = (u, p, diff) => [diff].forEach((diff) => {
                        if (diff === 5) return
                        request.get(
                            'https://maimai.wahlap.com/maimai-mobile/record/musicGenre/search/?genre=99&diff=' + diff,
                            { jar: cj },
                            (err, res, body) => {
                                if (diff == 0) {
                                    console.log(body)
                                }
                                // console.log(diff, body);
                                // console.log(body.match("错误"));
                                request.post(
                                    "https://www.diving-fish.com/api/pageparser/page",
                                    {
                                        headers: { "content-type": 'text/plain', },
                                        body: "<login><u>" + u + "</u><p>" + p + "</p></login>" + body.match(/<html.*>([\s\S]*)<\/html>/)[1].replace(/\s+/g, ' '),
                                    },
                                    (err, res, body) => {
                                        console.log(diff, "upload", u, p, body);
                                        fetch(u, p, diff + 1);
                                    },
                                );
                            }
                        );
                    });
                    fetch(username, password, 0);
                }
            )
        }
    )
}


export { crawler }

