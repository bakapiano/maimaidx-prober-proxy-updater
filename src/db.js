import { JSONFile } from 'lowdb/node'
import { Low } from "lowdb";

var db = new Low(new JSONFile("db.json"));
db.read().then(() => {
  if (!db.data) {
    db.data = { count: 0}
    db.write()
  }
})

async function setValue(key, value) {
  await db.read();
  db.data[key] = value;
  await db.write();
}

async function getValue(key) {
  await db.read();
  return db.data[key];
}

async function delValue(key) {
  await db.read();
  if (db.data[key] !== undefined) {
    delete db.data[key];
    await db.write();
  }
}

async function increaseCount() {
  await db.read();
  if (db.data.count === undefined) 
    db.data.count = 0;
  db.data.count += 1;
  await db.write();
}

export { setValue, getValue, delValue, increaseCount };