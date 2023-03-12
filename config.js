const config = {
    host: "maimai.bakapiano.com",
    dev: false,
}

const serverHost = process.argv.slice(2)[0]
if (serverHost !== undefined) {
    config.host = serverHost;
    config.dev |= ["127.0.0.1", "localhost"].includes(serverHost);
}

console.log(`SERVER_HOST=${serverHost}`)
console.log(config)

export default config;