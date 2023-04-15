const config = {
  host: "maimai.bakapiano.com",
  dev: false,
  httpServer: {
    enable: true,
    port: 8081,
  },
  httpProxy: {
    enable: true,
    port: 2560,
  },
  interProxy: {
    enable: false,
    port: 8848,
    targetHost: "49.235.118.199",
    targetPort: 2560,
  },
};

const serverHost = process.argv.slice(2)[0];
if (serverHost !== undefined) {
  config.host = serverHost;
  config.dev |= ["127.0.0.1", "localhost"].includes(serverHost);
}

console.log(`SERVER_HOST=${serverHost}`);
console.log(config);

export default config;
