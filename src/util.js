import config from "../config.js";
import { fetch } from "node-fetch-cookies";

async function fetchWithCookieWithRetry(cj, url, options) {
  for (let i = 0; i < config.fetchRetryCount; i++) {
    try {
      // timeout
      const contoller = new AbortController();
      const timeout = setTimeout(() => {
        contoller.abort();
      }, 666 * 1000);
      const result = await fetch(cj, url, {
        signal: contoller.signal,
        ...options,
      });
      clearTimeout(timeout);
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
