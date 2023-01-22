import { Low, Memory } from "lowdb";

var db = new Low(new Memory());

db.data = {};
db.write();

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

export { setValue, getValue, delValue };