// Used with nef

'use strict';

/** @type {typeof import('../../../../lib/fs').FS} */
const FS = require('../../../../.lib-dist/fs').FS;
const DB_PATH = 'config/database'; // path to your database folder

module.exports = class Economy {
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
		return `${includeValue ? value : ''} ${this.name}${Chat.plural(value)}`;
	}

	/**
     * Returns the whether value is a positive integer or not
     * @param {number} value
     * @return {boolean}
     */

	isPInteger(value) {
		let numValue = Number(value);

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
     * @return {string}
     */

	award(target, value) {
		if (!this.isPInteger(value)) return false;

		let tarId = toId(target);

		this.db.put(tarId, amount => amount + Number(value), 0);

		let amount = this.get(tarId);

		return this.getCurrencyLabel(amount);
    }

    /**
     * Removes a specified portion of user's savings
     * @param {string} target
     * @param {number} value
     * @return {string}
     */

	remove(target, value) {
		if (!this.isPInteger(value)) return false;

		let tarId = toId(target);

		this.db.put(tarId, amount => amount - Number(value), 0);

		let amount = this.get(tarId);
		if (amount <= 0) {
			this.db.remove(tarId);
			return `0 ${this.name}s`;
		}

		return this.getCurrencyLabel(amount);
    }

    /**
     * Returns the total currency, and the mean
     * @return {array}
     */

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

    /**
     * Sorts the currency database
     * @return {array}
     */

	sort() {
		let keys = this.db.keys();
		if (!keys.length) return [];

		return keys.sort((a, b) => this.get(b) - this.get(a));
    }

    /**
     * Generates a HTML ranking table
     * @return {string}
     */

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
		let keys = this.db.keys();
		if (!keys.length) return false;

		for (let target of keys) this.db.remove(target);

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

