import config from "../config.js";
import { fetch } from "node-fetch-cookies";
import http from "node:http";
import https from "node:https";

async function fetchWithCookieWithRetry(cj, url, options, fetchTimeout) {
  for (let i = 0; i < config.fetchRetryCount; i++) {
    try {
      const result = await fetch(cj, url, {
        signal: AbortSignal.timeout(fetchTimeout || config.fetchTimeOut),
        agent: function (_parsedURL) {
          if (_parsedURL.protocol == "http:") {
            return new http.Agent({ keepAlive: true });
          } else {
            return new https.Agent({ keepAlive: true });
          }
        },
        ...options,
      });
      return result;
    } catch (e) {
      console.log(`delay due to fetch failed with attempt ${url} #${i + 1}`);
      if (i === config.fetchRetryCount - 1) throw e;

      await new Promise((r) => {
        setTimeout(r, 1000);
      });
    }
  }
}

export { fetchWithCookieWithRetry };
