// Used with nef

'use strict';

/** @type {typeof import('../../../../lib/fs').FS} */
const FS = require('../../../../.lib-dist/fs').FS;
const DB_PATH = 'config/database'; // path to your database folder

module.exports = class Economy {
	/**
	 * @param {string} name
	 * @param {string} dbName
	 */
	constructor(name, dbName) {
		this.name = name;
		this.dbName = dbName;
		this.db = Db[dbName];

		this.transactionLogs = FS('logs/transactions.txt');
		this.tLogs = this.transactionLogs.createAppendStream();
	}

	/**
	 * Returns the currency label
	 * @param {number} value
	 * @param {boolean} [includeValue=true]
	 * @return {string}
	 */
	getCurrencyLabel(value, includeValue = true) {
		let buf = '';
		if (includeValue) buf = `${value} `;

		buf += `${this.name}${Chat.plural(Number(value))}`;

		return buf;
	}

	/**
	 * Returns the whether value is a positive integer or not
	 * @param {number} value
	 * @return {boolean}
	 */
	isPInteger(value) {
		const numValue = Number(value);

		return Number.isInteger(numValue) && numValue > 0;
	}

	/**
	 * Returns a user's savings
	 * @param {string} userid
	 * @return {number}
	 */
	get(userid) {
		return this.db.get(userid, 0);
	}

	/**
	 * Awards users with currency
	 * @param {string} target
	 * @param {number} value
	 * @return {boolean | string}
	 */
	award(target, value) {
		if (!this.isPInteger(value)) return false;

		const tarId = toId(target);

		this.db.put(tarId, amount => amount + Number(value), 0);

		return this.getCurrencyLabel(value);
	}

	/**
	 * Removes a specified portion of user's savings
	 * @param {string} target
	 * @param {number} value
	 * @return {boolean | string}
	 */
	remove(target, value) {
		if (!this.isPInteger(value)) return false;

		const tarId = toId(target);

		this.db.put(tarId, amount => amount - Number(value), 0);

		const amount = this.get(tarId);
		if (amount <= 0) {
			this.db.remove(tarId);
			return `0 ${this.name}s`;
		}

		return this.getCurrencyLabel(amount);
	}

	/**
	 * Transfers specified amount to another user
	 * @param {string} userid
	 * @param {string} target
	 * @param {number} value
	 * @return {boolean | [string, string]}
	 */
	transfer(userid, target, value) {
		if (!this.isPInteger(value)) return false;

		const tarId = toId(target);

		this.db.put(userid, amount => amount - Number(value), 0);
		this.db.put(tarId, amount => amount + Number(value), 0);

		return [value, this.get(userid)].map(i => this.getCurrencyLabel(i));
	}

	/**
	 * Returns the total currency, and the mean
	 * @return {[number, number]}
	 */
	getStats() {
		const keys = this.db.keys();
		const len = keys.length;
		let total = 0;

		for (let i = 0; i < len; i++) {
			total += this.get(keys[i]);
		}

		const mean = total / len;

		return [total, ~~mean];
	}

	/**
	 * Sorts the currency database
	 * @return {string[]}
	 */
	sort() {
		const keys = this.db.keys();
		if (!keys.length) return [];

		return keys.sort((a, b) => this.get(b) - this.get(a));
	}

	/**
	 * Generates a HTML ranking table
	 * @return {boolean | string}
	 */
	genLeaderboard() {
		const sortedList = this.sort();
		let output = `<h3 style="text-align: center; text-decoration: underline; text-transform: capitalize;">${this.name}s Ladder</h3><div style="max-height: 250px; overflow-y: auto;"><table style="width: 100%; border: 1px solid #000;"><tbody><tr><th style="padding: 5px; border: 1px solid #000;">Rank</th><th style="padding: 5px; border: 1px solid #000;">Name</th><th style="padding: 5px; border: 1px solid #000;">Amount</th></tr>`;
		if (!sortedList.length) return false; // return an error message

		for (const [i, userid] of sortedList.entries()) {
			const amount = this.get(userid);
			output += `<tr><td style="padding: 5px; border: 1px solid #000;">${i + 1}</td><td style="padding: 5px; border: 1px solid #000;">${userid}</td><td style="padding: 5px; border: 1px solid #000;">${amount}</td></tr>`;
		}

		return `${output}</tbody></table></div>`;
	}

	/**
	 * Writes text to logs along with timestamps
	 * @param {string} text
	 */
	log(text) {
		const date = new Date();
		const [dateString, timestamp] = Chat.toTimestamp(date).split(' ');

		this.tLogs.write(`[${dateString} - ${timestamp}] ${text}\n`);
	}

	/**
	 * Removes all existing values from currency database
	 * @return {boolean}
	 */
	wipe() {
		const keys = this.db.keys();
		if (!keys.length) return false;

		for (const target of keys) this.db.remove(target);

		return true;
	}

	/**
	 * Deletes the currency database
	 * @return {Promise}
	 */
	delete() {
		return FS(`${DB_PATH}/${this.dbName}.json`).unlinkIfExists();
	}
};
