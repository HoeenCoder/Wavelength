/**
 * FS
 * Pokemon Showdown - http://pokemonshowdown.com/
 *
 * An abstraction layer around Node's filesystem.
 *
 * Advantages:
 * - write() etc do nothing in unit tests
 * - paths are always relative to PS's base directory
 * - Promises (seriously wtf Node Core what are you thinking)
 * - PS-style API: FS("foo.txt").write("bar") for easier argument order
 * - mkdirp
 *
 * FS is used nearly everywhere, but exceptions include:
 * - crashlogger.js - in case the crash is in here
 * - repl.js - which use Unix sockets out of this file's scope
 * - launch script - happens before modules are loaded
 * - sim/ - intended to be self-contained
 *
 * @author Guangcong Luo <guangcongluo@gmail.com>
 * @license MIT
 */

'use strict';

const pathModule = require('path');
const fs = require('fs');

const ROOT_PATH = pathModule.resolve(__dirname, '..');

/*eslint no-unused-expressions: ["error", { "allowTernary": true }]*/

class FSPath {
	/**
	 * @param {string} path
	 */
	constructor(path) {
		this.path = pathModule.resolve(ROOT_PATH, path);
	}
	parentDir() {
		return new FSPath(pathModule.dirname(this.path));
	}
	read(/** @type {AnyObject | string} */ options = {}) {
		return new Promise((resolve, reject) => {
			fs.readFile(this.path, options, (err, data) => {
				err ? reject(err) : resolve(data);
			});
		});
	}
	readSync(/** @type {AnyObject | string} */ options = {}) {
		return fs.readFileSync(this.path, options);
	}
	/**
	 * @return {Promise<string>}
	 */
	readTextIfExists() {
		return new Promise((resolve, reject) => {
			fs.readFile(this.path, 'utf8', (err, data) => {
				if (err && err.code === 'ENOENT') return resolve('');
				err ? reject(err) : resolve(data);
			});
		});
	}
	readTextIfExistsSync() {
		try {
			return fs.readFileSync(this.path, 'utf8');
		} catch (err) {
			if (err.code !== 'ENOENT') throw err;
		}
		return '';
	}
	/**
	 * @param {string | Buffer} data
	 * @param {Object} options
	 */
	write(data, options = {}) {
		if (Config.nofswriting) return Promise.resolve();
		return new Promise((resolve, reject) => {
			fs.writeFile(this.path, data, options, err => {
				err ? reject(err) : resolve();
			});
		});
	}
	/**
	 * @param {string | Buffer} data
	 * @param {Object} options
	 */
	writeSync(data, options = {}) {
		if (Config.nofswriting) return;
		return fs.writeFileSync(this.path, data, options);
	}
	/**
	 * Writes to a new file before renaming to replace an old file. If
	 * the process crashes while writing, the old file won't be lost.
	 * Does not protect against simultaneous writing; use writeUpdate
	 * for that.
	 *
	 * @param {string | Buffer} data
	 * @param {Object} options
	 */
	async safeWrite(data, options = {}) {
		await FS(this.path + '.NEW').write(data, options);
		await FS(this.path + '.NEW').rename(this.path);
	}
	/**
	 * @param {string | Buffer} data
	 * @param {Object} options
	 */
	safeWriteSync(data, options = {}) {
		FS(this.path + '.NEW').writeSync(data, options);
		FS(this.path + '.NEW').renameSync(this.path);
	}
	/**
	 * Safest way to update a file with in-memory state. Pass a callback
	 * that fetches the data to be written. It will write an update,
	 * avoiding race conditions. The callback may not necessarily be
	 * called, if `writeUpdate` is called many times in a short period.
	 *
	 * `options.throttle`, if it exists, will make sure updates are not
	 * written more than once every `options.throttle` milliseconds.
	 *
	 * No synchronous version because there's no risk of race conditions
	 * with synchronous code; just use `safeWriteSync`.
	 *
	 * DO NOT do anything with the returned Promise; it's not meaningful.
	 *
	 * @param {() => string | Buffer} dataFetcher
	 * @param {Object} options
	 */
	async writeUpdate(dataFetcher, options = {}) {
		if (Config.nofswriting) return;
		const pendingUpdate = FS.pendingUpdates.get(this.path);
		if (pendingUpdate) {
			pendingUpdate[1] = dataFetcher;
			pendingUpdate[2] = options;
			return;
		}
		let pendingFetcher = /** @type {(() => string | Buffer)?} */ (dataFetcher);
		while (pendingFetcher) {
			let updatePromise = this.safeWrite(pendingFetcher(), options);
			FS.pendingUpdates.set(this.path, [updatePromise, null, options]);
			await updatePromise;
			if (options.throttle) {
				await new Promise(resolve => setTimeout(resolve, options.throttle));
			}
			const pendingUpdate = FS.pendingUpdates.get(this.path);
			if (!pendingUpdate) return;
			[updatePromise, pendingFetcher, options] = pendingUpdate;
		}
		FS.pendingUpdates.delete(this.path);
	}
	/**
	 * @param {string | Buffer} data
	 * @param {Object} options
	 */
	append(data, options = {}) {
		if (Config.nofswriting) return Promise.resolve();
		return new Promise((resolve, reject) => {
			fs.appendFile(this.path, data, options, err => {
				err ? reject(err) : resolve();
			});
		});
	}
	/**
	 * @param {string | Buffer} data
	 * @param {Object} options
	 */
	appendSync(data, options = {}) {
		if (Config.nofswriting) return;
		return fs.appendFileSync(this.path, data, options);
	}
	/**
	 * @param {string} target
	 */
	symlinkTo(target) {
		if (Config.nofswriting) return Promise.resolve();
		return new Promise((resolve, reject) => {
			// @ts-ignore TypeScript bug
			fs.symlink(target, this.path, err => {
				err ? reject(err) : resolve();
			});
		});
	}
	/**
	 * @param {string} target
	 */
	symlinkToSync(target) {
		if (Config.nofswriting) return;
		return fs.symlinkSync(target, this.path);
	}
	/**
	 * @param {string} target
	 */
	rename(target) {
		if (Config.nofswriting) return Promise.resolve();
		return new Promise((resolve, reject) => {
			fs.rename(this.path, target, err => {
				err ? reject(err) : resolve();
			});
		});
	}
	/**
	 * @param {string} target
	 */
	renameSync(target) {
		if (Config.nofswriting) return;
		return fs.renameSync(this.path, target);
	}
	readdir() {
		return new Promise((resolve, reject) => {
			fs.readdir(this.path, (err, data) => {
				err ? reject(err) : resolve(data);
			});
		});
	}
	readdirSync() {
		return fs.readdirSync(this.path);
	}
	/**
	 * @return {NodeJS.WritableStream}
	 */
	createWriteStream(options = {}) {
		if (Config.nofswriting) {
			const Writable = require('stream').Writable;
			return new Writable({write: (chunk, encoding, callback) => callback()});
		}
		return fs.createWriteStream(this.path, options);
	}
	/**
	 * @return {NodeJS.WritableStream}
	 */
	createAppendStream(options = {}) {
		if (Config.nofswriting) {
			const Writable = require('stream').Writable;
			return new Writable({write: (chunk, encoding, callback) => callback()});
		}
		options.flags = options.flags || 'a';
		return fs.createWriteStream(this.path, options);
	}
	unlinkIfExists() {
		if (Config.nofswriting) return Promise.resolve();
		return new Promise((resolve, reject) => {
			fs.unlink(this.path, err => {
				if (err && err.code === 'ENOENT') return resolve();
				err ? reject(err) : resolve();
			});
		});
	}
	unlinkIfExistsSync() {
		if (Config.nofswriting) return;
		try {
			fs.unlinkSync(this.path);
		} catch (err) {
			if (err.code !== 'ENOENT') throw err;
		}
	}
	/**
	 * @param {string | number} mode
	 */
	mkdir(mode = 0o755) {
		if (Config.nofswriting) return Promise.resolve();
		return new Promise((resolve, reject) => {
			// @ts-ignore
			fs.mkdir(this.path, mode, err => {
				err ? reject(err) : resolve();
			});
		});
	}
	/**
	 * @param {string | number} mode
	 */
	mkdirSync(mode = 0o755) {
		if (Config.nofswriting) return;
		// @ts-ignore
		return fs.mkdirSync(this.path, mode);
	}
	/**
	 * @param {string | number} mode
	 */
	mkdirIfNonexistent(mode = 0o755) {
		if (Config.nofswriting) return Promise.resolve();
		return new Promise((resolve, reject) => {
			// @ts-ignore
			fs.mkdir(this.path, mode, err => {
				if (err && err.code === 'EEXIST') return resolve();
				err ? reject(err) : resolve();
			});
		});
	}
	/**
	 * @param {string | number} mode
	 */
	mkdirIfNonexistentSync(mode = 0o755) {
		if (Config.nofswriting) return;
		try {
			// @ts-ignore
			fs.mkdirSync(this.path, mode);
		} catch (err) {
			if (err.code !== 'EEXIST') throw err;
		}
	}
	/**
	 * Creates the directory (and any parent directories if necessary).
	 * Does not throw if the directory already exists.
	 * @param {string | number} mode
	 */
	async mkdirp(mode = 0o755) {
		try {
			await this.mkdirIfNonexistent(mode);
		} catch (err) {
			if (err.code !== 'ENOENT') throw err;
			await this.parentDir().mkdirp(mode);
			await this.mkdirIfNonexistent(mode);
		}
	}
	/**
	 * Creates the directory (and any parent directories if necessary).
	 * Does not throw if the directory already exists. Synchronous.
	 * @param {string | number} mode
	 */
	mkdirpSync(mode = 0o755) {
		try {
			this.mkdirIfNonexistentSync(mode);
		} catch (err) {
			if (err.code !== 'ENOENT') throw err;
			this.parentDir().mkdirpSync(mode);
			this.mkdirIfNonexistentSync(mode);
		}
	}
	/**
	 * Calls the callback if the file is modified.
	 * @param {function (): void} callback
	 */
	onModify(callback) {
		fs.watchFile(this.path, (curr, prev) => {
			if (curr.mtime > prev.mtime) return callback();
		});
	}
	/**
	 * Clears callbacks added with onModify()
	 */
	unwatch() {
		fs.unwatchFile(this.path);
	}
}

/**
 * @param {string} path
 */
function getFs(path) {
	return new FSPath(path);
}

const FS = Object.assign(getFs, {
	/**
	 * @type {Map<string, [Promise, (() => string | Buffer)?, Object]>}
	 */
	pendingUpdates: new Map(),
});

module.exports = FS;
