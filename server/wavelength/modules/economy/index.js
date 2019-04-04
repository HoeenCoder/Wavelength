// Used with nef

'use strict';

const FS = require(('../../../../.lib-dist/fs')).FS;
const DB_PATH = 'config/database'; // path to your database folder

module.exports = class Economy {
	constructor(name, dbName) {
		this.name = name;
		this.dbName = dbName;
		this.db = Db[dbName];

		this.transactionLogs = FS('logs/transactions.txt');
		this.tLogs = this.transactionLogs.createAppendStream();
	}

	grammarizeName(value) {
		return value !== 1 ? `${this.name}s` : this.name;
	}

	// positive integer
	isPInteger(value) {
		let numValue = Number(value);

		return Number.isInteger(numValue) && numValue > 0;
	}

	get(target) {
		let tarId = toId(target);

		return this.db.get(tarId, 0);
	}

	award(target, value) {
		if (!this.isPInteger(value)) return false;

		let tarId = toId(target);

		this.db.put(tarId, amount => amount + Number(value), 0);

		let amount = this.get(tarId);

		return `${amount} ${this.grammarizeName(amount)}`;
	}

	remove(target, value) {
		if (!this.isPInteger(value)) return false;

		let tarId = toId(target);

		this.db.put(tarId, amount => amount - Number(value), 0);

		let amount = this.get(tarId);
		if (amount <= 0) {
			this.db.remove(tarId);
			return `0 ${this.name}s`;
		}

		return `${amount} ${this.grammarizeName(amount)}`;
	}

	getStats() {
		let total = 0;
		let keys = this.db.keys();
		let len = keys.length;

		for (let i = 0; i < len; i++) {
			total += this.get(keys[i]);
		}

		let mean = total / len;

		return [total, ~~mean];
	}

	sort() {
		let keys = this.db.keys();
		if (!keys.length) return [];

		keys.sort((a, b) => { return this.get(b) - this.get(a); });
		return keys;
	}

	genLeaderboard() {
		// Deprecated attributes, but does anyone care?
		let output = `<table cellpadding="5" border="1" width="100%"><tbody><tr><th>Rank</th><th>Name</th><th>Amount</th></tr>`;
		let sortedList = this.sort();
		if (!sortedList.length) return false; // return an error message

		for (let i = 0, len = sortedList.length; i < len; i++) {
			let target = sortedList[i];
			let amount = this.get(target);

			output += `<tr><td>${(i + 1)}</td><td>${target}</td><td>${amount}</td></tr>`;
		}

		return `${output}</tbody></table>`;
	}

	log(text) {
		const date = new Date();
		const timeString = Chat.toTimestamp(date).split(' ');
		const dateString = timeString[0];
		const timestamp = timeString[1];

		this.tLogs.write(`[${dateString} - ${timestamp}] ${text}\n`);
	}

	wipe() {
		let keys = this.db.keys();
		if (!keys.length) return false;

		for (let target of keys) this.db.remove(target);

		return true;
	}

	delete() {
		return FS(`${DB_PATH}/${this.dbName}.json`).unlinkIfExists();
	}
};

/* global Db, toId */
