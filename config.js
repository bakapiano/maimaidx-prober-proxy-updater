const config = {
    host: "maimai.bakapiano.com",
}

const serverHost = process.argv.slice(2)[0]
if (serverHost !== undefined) {
    config.host = serverHost;
}
console.log(`SERVER_HOST=${serverHost}`)

export default config;