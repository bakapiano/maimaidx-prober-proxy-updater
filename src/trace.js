import { delValue, getValue, setValue } from "./db.js";

const PREFIX = "RESULT";

const LOG_KEY = "LOG";
const PROGRESS_KEY = "PROGRESS";
const STATUS_KEY = "STATUS";

const TRACE_EXPIRED_TIME = 1000 * 60 * 10;

async function appendLog(uuid, text) {
  const log = (await getValue(`${PREFIX}-${uuid}-${LOG_KEY}`)) || "";
  await setValue(
    `${PREFIX}-${uuid}-${LOG_KEY}`,
    log +
      `[${new Date().toLocaleString("en", {
        timeZone: "Asia/Shanghai",
      }).split(",")[1].trim()}] ${text}` +
      "\n"
  );
}

async function setProgress(uuid, progress) {
  await setValue(`${PREFIX}-${uuid}-${PROGRESS_KEY}`, progress);
}

async function setStatus(uuid, status) {
  await setValue(`${PREFIX}-${uuid}-${STATUS_KEY}`, status);
}

async function getTrace(uuid) {
  return {
    progress: Number(await getValue(`${PREFIX}-${uuid}-${PROGRESS_KEY}`)),
    log: (await getValue(`${PREFIX}-${uuid}-${LOG_KEY}`)) || "",
    status: await getValue(`${PREFIX}-${uuid}-${STATUS_KEY}`),
  };
}

async function expireTrace(uuid) {
  // setTimeout(() => {
  //   delValue(`${PREFIX}-${uuid}-${PROGRESS_KEY}`);
  //   delValue(`${PREFIX}-${uuid}-${LOG_KEY}`);
  //   delValue(`${PREFIX}-${uuid}-${STATUS_KEY}`);
  // }, TRACE_EXPIRED_TIME);
}

function useTrace(uuid) {
  return async (payload) => {
    console.log(uuid, payload);
    const { status, log, progress } = payload;
    status && (await setStatus(uuid, status));
    log && (await appendLog(uuid, log));
    progress !== undefined && await setProgress(uuid,progress);
    // Auto expire trace in db
    (status === "success" || status === "failed") && await expireTrace(uuid);
  };
}

function useStage(trace) {
  let failed = false;
  return async (description, progress, func) => {
    await trace({ log: `开始${description}` });
    try {
      await func();
      /*
      if (Math.random() >= 0.9) {
        throw new Error("test")
      }
      */
    } catch (error) {
      if (!failed) {
        failed = true;
        await trace({
          log: `${description}时候出现错误: ${String(error)}`,
          status: "failed",
        });
      }
      throw error;
    }
    await trace({ log: `${description}完成`, progress });
  };
}

export { appendLog, setProgress, getTrace, expireTrace, setStatus, useTrace, useStage };
