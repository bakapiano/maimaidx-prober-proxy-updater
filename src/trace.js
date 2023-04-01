import { appendValue, getValue, setValue } from "./db.js";

const PREFIX = "RESULT";

const LOG_KEY = "LOG";
const PROGRESS_KEY = "PROGRESS";
const STATUS_KEY = "STATUS";

async function appendLog(uuid, text) {
  const key = `${PREFIX}-${uuid}-${LOG_KEY}`;
  const time = new Date().toLocaleString("en", {timeZone: "Asia/Shanghai",}).split(",")[1].trim()
  const log  = `[${time}] ${text}` + "\n"
  await appendValue(key, log, "");
}

async function setProgress(uuid, progress) {
  const key = `${PREFIX}-${uuid}-${PROGRESS_KEY}`;
  const current = Number(await getValue(key)) || 0;
  await setValue(key, current + progress);
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

function useTrace(uuid) {
  return async (payload) => {
    console.log(uuid, payload);
    const { status, log, progress } = payload;
    status && (await setStatus(uuid, status));
    log && (await appendLog(uuid, log));
    progress !== undefined && await setProgress(uuid, progress);
    // Auto expire trace in db
    // (status === "success" || status === "failed") && await expireTrace(uuid);
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

export { appendLog, setProgress, getTrace, setStatus, useTrace, useStage };
