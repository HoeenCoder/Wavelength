'use strict';

const ECON = require('../modules/economy/index.js');
<<<<<<< HEAD
const econWL = new ECON('stardust', 'currency');
=======
const econWL = new ECON('stardust', 'money');
>>>>>>> 2b016a13b5eb0e87ed9e0bc00cfa1ed93864594b

const DEFAULT_LINES = 50;

exports.commands = {
	currency: 'stardust',
	dust: 'stardust',
	stardust: {
	    give(target, room, user) {
<<<<<<< HEAD
			if (!this.can('economy')) return false;

			let [targetU, value] = target.split(',');
			const targetUser = toId(targetU);
			if (!targetUser || !value) return this.parse('/help stardust');

			const amountGiven = econWL.award(targetUser, value);
			if (!amountGiven) return this.errorReply('Indefinite amount; use whole numbers');

			econWL.log(`${user.userid} gave ${targetUser} ${econWL.getCurrencyLabel(value)}`);
=======
			if (!this.can('ban')) return false;

			let [targetU, value] = target.split(',');
			let targetUser = toId(targetU);
			if (!targetUser || !value) return this.parse('/help stardust');

			let amountGiven = econWL.award(targetUser, value);
			if (!amountGiven) return this.errorReply('Indefinite amount; use whole numbers');

			econWL.log(`${user.userid} gave ${targetUser} ${value} ${econWL.grammarizeName(0)}`);
>>>>>>> 2b016a13b5eb0e87ed9e0bc00cfa1ed93864594b
			return this.sendReply(`${targetU} has been awarded with ${amountGiven}!`);
		},

	    take(target, room, user) {
<<<<<<< HEAD
			if (!this.can('economy')) return false;

			let [targetU, value] = target.split(',');
			const targetUser = toId(targetU);
			if (!targetUser || !value) return this.parse('/help stardust');
			if (econWL.get(targetU) < value) return this.errorReply(`You can't take more ${econWL.getCurrencyLabel(value, false)} than they have!`);

			const amountLeft = econWL.remove(targetUser, value);
			if (!amountLeft) return this.errorReply('Indefinite amount.');

			const amountTaken = econWL.getCurrencyLabel(value);

			econWL.log(`${user.userid} took ${amountTaken} from ${targetUser}`);
			return this.sendReply(`${amountTaken} has been removed from ${targetU}'s account, they now have ${amountLeft}!`);
=======
			if (!this.can('ban')) return false;

			let [targetU, value] = target.split(',');
			let targetUser = toId(targetU);
			if (!targetUser || !value) return this.parse('/help stardust');
			if (econWL.get(targetU) < value) return this.errorReply(`You can't take more ${econWL.grammarizeName(0)} than they have!`);

			let amountLeft = econWL.remove(targetUser, value);
			if (!amountLeft) return this.errorReply('Indefinite amount.');

			econWL.log(`${user.userid} took ${value} ${econWL.grammarizeName(0)} from ${targetUser}`);
			return this.sendReply(`${value} ${econWL.grammarizeName(0)} has been removed from ${targetU}'s account, they now have ${amountLeft}!`);
>>>>>>> 2b016a13b5eb0e87ed9e0bc00cfa1ed93864594b
		},

		transfer(target, room, user) {
			let [targetU, value] = target.split(',');
<<<<<<< HEAD
			const targetUser = toId(targetU);
			if (!targetUser || !value) return this.parse('/help stardust');
			if (user.userid === targetUser) return this.errorReply(`You can't transfer ${econWL.getCurrencyLabel(value, false)} to yourself!`);
			if (econWL.get(user.userid) < value) return this.errorReply(`You can't transfer more ${econWL.getCurrencyLabel(value, false)} than you have!`);

			const amountLeft = econWL.remove(user.userid, value);
			const amountGiven = econWL.award(targetUser, value);

			if (!amountLeft || !amountGiven) return this.errorReply('Indefinite amount.');

			const transferred = econWL.getCurrencyLabel(value);

			econWL.log(`${user.userid} transferred ${transferred} to ${targetUser}`);
			return this.sendReply(`You transferred ${transferred} to ${targetUser}. You now have ${amountLeft}!`);
=======
			let targetUser = toId(targetU);
			if (!targetUser || !value) return this.parse('/help stardust');
			if (user.userid === targetUser) return this.errorReply(`You can't transfer ${econWL.grammarizeName(0)} to yourself!`);
			if (econWL.get(user.userid) < value) return this.errorReply(`You can't transfer more ${econWL.grammarizeName(0)} than you have!`);

			let amountLeft = econWL.remove(user.userid, value);
			let amountGiven = econWL.award(targetUser, value);

			if (!amountLeft || !amountGiven) return this.errorReply('Indefinite amount.');

			econWL.log(`${user.userid} transferred ${value} ${econWL.grammarizeName(0)} to ${targetUser}`);
			return this.sendReply(`You transferred ${value} ${econWL.grammarizeName(0)} to ${targetUser}. You now have ${amountLeft}!`);
>>>>>>> 2b016a13b5eb0e87ed9e0bc00cfa1ed93864594b
		},

		atm: 'wallet',
		wallet(target, room, user) {
			if (!this.runBroadcast()) return false;

			let targetU = toId(target);
<<<<<<< HEAD
			if (!targetU) targetU = user.userid;

			const savings = econWL.getCurrencyLabel(econWL.get(targetU));

			return this.sendReply(`${targetU} has ${savings} in their wallet.`);
=======
			if (!targetU) targetU = user.name;

			let savings = econWL.get(targetU);

			return this.sendReply(`${targetU} has ${savings} ${econWL.grammarizeName(0)} in their wallet.`);
>>>>>>> 2b016a13b5eb0e87ed9e0bc00cfa1ed93864594b
		},

		stat: 'stats',
		stats(target, room, user) {
			if (!this.runBroadcast()) return false;

<<<<<<< HEAD
			const [total, mean] = econWL.getStats().map(i => econWL.getCurrencyLabel(i));

			return this.sendReplyBox(`There are currently ${total} circulating in the economy, with ${mean} per user on average.`);
=======
			let getStats = econWL.getStats();
			let total = getStats[0];
			let mean = getStats[1];

			return this.sendReplyBox(`There are currently ${total} ${econWL.grammarizeName(0)} circulating in the economy, with ${mean} ${econWL.grammarizeName(0)} per user on average.`);
>>>>>>> 2b016a13b5eb0e87ed9e0bc00cfa1ed93864594b
		},

		ranking: 'rankings',
		rankings(target, room, user) {
			if (!this.runBroadcast()) return false;

			let leaderboard = econWL.genLeaderboard();
			if (!leaderboard) return this.errorReply('No leaderboards found!');

			this.sendReplyBox(leaderboard);
		},

		log: 'logs',
		logs(target, room, user) {
<<<<<<< HEAD
			if (!this.can('economy')) return false;
=======
			if (!this.can('ban')) return false;
>>>>>>> 2b016a13b5eb0e87ed9e0bc00cfa1ed93864594b

			const transactionLogs = econWL.transactionLogs.readIfExistsSync();
			if (!transactionLogs.length) return this.errorReply('Transaction logs are empty!');

			let msg = ":";
			let [searchString, lines] = target.split(",").map(i => i.trim());
			const searchStr = searchString.length > 0;
			const searchLines = typeof lines !== 'undefined';
			if (searchStr && !isNaN(searchString) && !searchLines) {
				lines = ~~Number(searchString);
			} else if (searchLines) {
				lines = ~~Number(lines);
			} else if (!searchLines || (searchLines && (isNaN(lines) || lines > DEFAULT_LINES))) {
				lines = DEFAULT_LINES;
			}

			let tLogsSplit = transactionLogs.split('\n').reverse();
			tLogsSplit = tLogsSplit.slice(0, (lines + 1));

			if (isNaN(searchString)) {
				msg = ` containing "${searchString}":`;
				tLogsSplit = tLogsSplit.filter(tLog => tLog.includes(searchString));
			}

			user.popup(`|wide||html|Displaying the last ${lines} line(s)${msg}<br /><div style="max-height: 200px; overflow-y: auto;">${tLogsSplit.join('<br />')}</div>`);
		},

		reset: 'cleardb',
		cleardb(target, room, user) {
			if (!this.can('lockdown')) return false;

			let wipe = econWL.wipe();
			if (!wipe) return this.errorReply(`${econWL.name} database is empty!`);

			econWL.log(`${user.userid} cleared the ${econWL.name} database`);
			return this.sendReply(`${user} has cleared the ${econWL.name} database!`);
		},

<<<<<<< HEAD
		async deletedb(target, room, user) {
			if (!this.can('lockdown')) return false;

			const err = await econWL.delete();
			if (err) {
				console.log(err.stack);
				return this.errorReply(`${econWL.dbName}.json couldn't be deleted, check logs for more info.`);
			}

			return this.sendReply(`${econWL.dbName}.json was deleted`);
=======
		deletedb(target, room, user) {
			if (!this.can('lockdown')) return false;

			econWL.delete().then(() => {
				return this.sendReply(`${econWL.dbName}.json was deleted`);
			}).catch(err => {
				console.log(err.stack);
				return this.errorReply(`${econWL.dbName}.json couldn't be deleted, check logs for more info.`);
			});
>>>>>>> 2b016a13b5eb0e87ed9e0bc00cfa1ed93864594b
		},

		""() {
			return this.parse('/help stardust');
		},
	},
	stardusthelp: [
		`/stardust enables users to utilize the economy plugin.`,
		`Use positive integer [value(s)], must be greater than zero.`,
		`Accepts the following commands:`,
		`/stardust give [username], [value] - Awards the user with specified stardust. Requires @ & ~`,
		`/stardust take [username], [value] - Takes the specified stardust from the user. Requires @ & ~`,
		`/stardust transfer [username], [value], Transfers stardust to the specified username.`,
		`/stardust wallet (username) - Shows the stardust a user has.`,
		`/stardust stats - Shows the total stardust in the economy and the mean amount.`,
		`/stardust rankings - Shows a leaderboard of users with stardust.`,
		`/stardust logs (search) - Searches transaction logs. Requires @ & ~`,
	],
};
