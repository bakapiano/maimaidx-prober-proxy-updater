import { Low, Memory } from "lowdb";

import { JSONFile } from 'lowdb/node'

var fileDB = new Low(new JSONFile("db.json"));
var memoDB = new Low(new Memory())

fileDB.read().then(() => {
  if (!fileDB.data) {
    fileDB.data = { count: 0 }
    fileDB.write()
  }
})

memoDB.read().then(() => {
  memoDB.data = { time: {} }
})

async function setValue(key, value) {
  memoDB.data.time[key] = (new Date()).getTime()
  memoDB.data[key] = value;
}

async function getValue(key) {
  return memoDB.data[key];
}

async function appendValue(key, value, defaultValue) {
  const current = memoDB.data[key];
  if (current === undefined) {
    memoDB.data[key] = defaultValue;
  }
  memoDB.data.time[key] = (new Date()).getTime()
  memoDB.data[key] = current + value;
}

async function delValue(key) {
  if (memoDB.data[key] !== undefined) {
    delete memoDB.data[key];
  }
  if (memoDB.data.time[key] !== undefined) {
    delete memoDB.data.time[key];
  }
}

async function clearExpireData() {
  Object.keys(memoDB.data.time).forEach(async (key) => {
    const current = (new Date()).getTime();
    const delta = current - (memoDB.data.time[key]);
    if (delta >= 1000 * 60 * 60 * 30) {
      await delValue(key)
    } 
  });
}

function increaseCount() {
  if (fileDB.data.count === undefined) 
    fileDB.data.count = 0;
  fileDB.data.count += 1;
}

function getCount() {
  return fileDB.data.count;
}

async function saveCount() {
  await fileDB.write();
}

export { setValue, getValue, delValue, increaseCount, getCount, clearExpireData, saveCount, appendValue };