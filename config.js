const config = {
    host: "maimai.bakapiano.com",
}

const host = process.argv.slice(3)[0]
if (host !== undefined) {
    config.host = host;
}
console.log(host)

export default config;