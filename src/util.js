import config from "../config.js";
import { fetch } from "node-fetch-cookies";
import http from "node:http";
import https from "node:https";

async function fetchWithCookieWithRetry(cj, url, options) {
  for (let i = 0; i < config.fetchRetryCount; i++) {
    // timeout
    const contoller = new AbortController();
    const timeout = setTimeout(() => {
      console.log(`fetch canceled due to timeout`)
      try {
        contoller.abort();
      }
      catch(err) {
        console.log("failed to cancel timeout fetch: ", err)
      }
    }, config.fetchTimeOut);
    try {
      const result = await fetch(cj, url, {
        signal: contoller.signal,
        agent: function (_parsedURL) {
          if (_parsedURL.protocol == "http:") {
            return new http.Agent({ keepAlive: true });
          } else {
            return new https.Agent({ keepAlive: true });
          }
        },
        ...options,
      });
      clearTimeout(timeout);
      return result;
    } catch (e) {
      clearTimeout(timeout);
      console.log(`delay due to fetch failed with attempt ${url} #${i + 1}`);
      if (i === config.fetchRetryCount - 1) throw e;

      await new Promise((r) => {
        setTimeout(r, 1000);
      });
    }
  }
}

export { fetchWithCookieWithRetry };
