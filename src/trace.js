import { appendValue, getValue, setValue } from "./db.js";

import config from "../config.js";

const PREFIX = "RESULT";

const LOG_KEY = "LOG";
const PROGRESS_KEY = "PROGRESS";
const STATUS_KEY = "STATUS";

async function appendLog(uuid, text) {
  const key = `${PREFIX}-${uuid}-${LOG_KEY}`;
  const time = new Date()
    .toLocaleString("en", { timeZone: "Asia/Shanghai" })
    .split(",")[1]
    .trim();
  const log = `[${time.replace(" ", "")}] ${text}` + "\n";
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

const queue = {};

function tryExecute(uuid) {
  if (queue[uuid] === undefined || queue[uuid].length === 0) return
  const {payload, execute, resolve, reject} = queue[uuid][0]
  execute(payload)
    .then(()=>{
      resolve()
      queue[uuid].shift()
      tryExecute(uuid)
    })
    .catch(()=>{
      reject()
      queue[uuid].shift()
      tryExecute(uuid)
    })
}

function useTrace(uuid) {
  return (payload) =>
    new Promise((resolve, reject) => {
      const execute = async (payload) => {
        console.log(uuid, payload);
        const { status, log, progress } = payload;
        status && (await setStatus(uuid, status));
        log && (await appendLog(uuid, log));
        progress !== undefined && (await setProgress(uuid, progress));
      };
      if (queue[uuid] === undefined) queue[uuid] = [];
      queue[uuid].push({ payload, execute, resolve, reject });
      if (queue[uuid].length === 1) tryExecute(uuid)
    });
}

function useStage(trace) {
  let failed = false;
  return async (description, progress, func) => {
    await trace({ log: `开始${description}...` });
    for (let i = 0; i < config.stageRetryCount; i++) {
      try {
        await func();
        break;
      } catch (error) {
        if (failed) throw error;

        if (i === config.stageRetryCount - 1) {
          failed = true;
          await trace({
            log: `${description}时候出现错误: ${String(error)}`,
            status: "failed",
          });
          throw error;
        } else {
          await trace({
            log: `${description}时出现错误: ${String(error)}; 进行第${
              i + 1
            }次重试`,
          });
          await new Promise((r) => {
            setTimeout(r, 1000);
          });
        }
      }
    }

    await trace({ log: `${description}完成!`, progress });
  };
}

export { appendLog, setProgress, getTrace, setStatus, useTrace, useStage };
