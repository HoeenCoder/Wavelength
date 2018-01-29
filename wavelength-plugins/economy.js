'use strict';

const fs = require('fs');

// This should be the default amount of money users have.
// Ideally, this should be zero.
const DEFAULT_AMOUNT = 0;

global.currencyName = 'Stardust';
global.currencyPlural = 'Stardust';

let Economy = global.Economy = {
	/**
 	* Reads the specified user's money.
 	* If they have no money, DEFAULT_AMOUNT is returned.
 	*
 	* @param {String} userid
 	* @param {Function} callback
 	* @return {Function} callback
 	*/
	readMoney: function (userid, callback) {
		// In case someone forgot to turn `userid` into an actual ID...
		userid = toId(userid);
		if (userid.substring(0, 5) === 'guest') return 0;

		let amount = Db.currency.get(userid, DEFAULT_AMOUNT);
		if (callback && typeof callback === 'function') {
			// If a callback is specified, return `amount` through the callback.
			return callback(amount);
		} else {
			// If there is no callback, just return the amount.
			return amount;
		}
	},
	/**
 	* Writes the specified amount of money to the user's "bank."
 	* If a callback is specified, the amount is returned through the callback.
 	*
 	* @param {String} userid
 	* @param {Number} amount
 	* @param {Function} callback (optional)
 	* @return {Function} callback (optional)
 	*/
	writeMoney: function (userid, amount, callback) {
		// In case someone forgot to turn `userid` into an actual ID...
		userid = toId(userid);
		if (userid.substring(0, 5) === 'guest') return;

		// In case someone forgot to make sure `amount` was a Number...
		amount = Number(amount);
		if (isNaN(amount)) {
			throw new Error("Economy.writeMoney: Expected amount parameter to be a Number, instead received " + typeof amount);
		}

		let curTotal = Db.currency.get(userid, DEFAULT_AMOUNT);
		Db.currency.set(userid, curTotal + amount);
		let newTotal = Db.currency.get(userid);

		if (callback && typeof callback === 'function') {
			// If a callback is specified, return `newTotal` through the callback.
			return callback(newTotal);
		}
	},
	writeMoneyArr: function (users, amount) {
		for (let i = 0; i < users.length; i++) {
			this.writeMoney(users[i], amount);
		}
	},
	logTransaction: function (message) {
		if (!message) return false;
		fs.appendFile('logs/transactions.log', '[' + new Date().toUTCString() + '] ' + message + '\n', () => {});
	},

	logDice: function (message) {
		if (!message) return false;
		fs.appendFile('logs/dice.log', '[' + new Date().toUTCString() + '] ' + message + '\n', () => {});
	},
};

global.rankLadder = function (title, type, array, prop, group) {
	let groupHeader = group || 'Username';
	const ladderTitle = '<center><h4><u>' + title + '</u></h4></center>';
	const thStyle = 'class="rankladder-headers default-td" style="background: -moz-linear-gradient(#576468, #323A3C); background: -webkit-linear-gradient(#576468, #323A3C); background: -o-linear-gradient(#576468, #323A3C); background: linear-gradient(#576468, #323A3C); box-shadow: -1px -1px 2px rgba(0, 0, 0, 0.3) inset, 1px 1px 1px rgba(255, 255, 255, 0.7) inset;"';
	const tableTop = '<div style="max-height: 310px; overflow-y: scroll;">' +
		'<table style="width: 100%; border-collapse: collapse;">' +
		'<tr>' +
			'<th ' + thStyle + '>Rank</th>' +
			'<th ' + thStyle + '>' + groupHeader + '</th>' +
			'<th ' + thStyle + '>' + type + '</th>' +
		'</tr>';
	const tableBottom = '</table></div>';
	const tdStyle = 'class="rankladder-tds default-td" style="box-shadow: -1px -1px 2px rgba(0, 0, 0, 0.3) inset, 1px 1px 1px rgba(255, 255, 255, 0.7) inset;"';
	const first = 'class="first default-td important" style="box-shadow: -1px -1px 2px rgba(0, 0, 0, 0.3) inset, 1px 1px 1px rgba(255, 255, 255, 0.7) inset;"';
	const second = 'class="second default-td important" style="box-shadow: -1px -1px 2px rgba(0, 0, 0, 0.3) inset, 1px 1px 1px rgba(255, 255, 255, 0.7) inset;"';
	const third = 'class="third default-td important" style="box-shadow: -1px -1px 2px rgba(0, 0, 0, 0.3) inset, 1px 1px 1px rgba(255, 255, 255, 0.7) inset;"';
	let midColumn;

	let tableRows = '';

	for (let i = 0; i < array.length; i++) {
		if (i === 0) {
			midColumn = '</td><td ' + first + '>';
			tableRows += '<tr><td ' + first + '>' + (i + 1) + midColumn + WL.nameColor(array[i].name, true) + midColumn + array[i][prop] + '</td></tr>';
		} else if (i === 1) {
			midColumn = '</td><td ' + second + '>';
			tableRows += '<tr><td ' + second + '>' + (i + 1) + midColumn + WL.nameColor(array[i].name, true) + midColumn + array[i][prop] + '</td></tr>';
		} else if (i === 2) {
			midColumn = '</td><td ' + third + '>';
			tableRows += '<tr><td ' + third + '>' + (i + 1) + midColumn + WL.nameColor(array[i].name, true) + midColumn + array[i][prop] + '</td></tr>';
		} else {
			midColumn = '</td><td ' + tdStyle + '>';
			tableRows += '<tr><td ' + tdStyle + '>' + (i + 1) + midColumn + WL.nameColor(array[i].name, true) + midColumn + array[i][prop] + '</td></tr>';
		}
	}
	return ladderTitle + tableTop + tableRows + tableBottom;
};

exports.commands = {
	'!wallet': true,
	atm: 'wallet',
	wallet: function (target, room, user) {
		if (!target) target = user.name;
		if (!this.runBroadcast()) return;
		let userid = toId(target);
		if (userid.length < 1) return this.sendReply("/wallet - Please specify a user.");
		if (userid.length > 19) return this.sendReply("/wallet - [user] can't be longer than 19 characters.");

		Economy.readMoney(userid, money => {
			this.sendReplyBox(WL.nameColor(target, true) + " has " + money + ((money === 1) ? " " + currencyName + "." : " " + currencyPlural + "."));
			//if (this.broadcasting) room.update();
		});
	},

	gs: 'givecurrency', //You can change "gs" and "givestardust" to your currency name for an alias that applies to your currency Example: AwesomeBucks could be "ga" and "giveawesomebucks"
	givestardust: 'givecurrency',
	gc: 'givecurrency',
	givecurrency: function (target, room, user, connection, cmd) {
		if (!this.can('economy')) return false;
		if (!target) return this.sendReply("Usage: /" + cmd + " [user], [amount]");
		let splitTarget = target.split(',');
		if (!splitTarget[2]) return this.sendReply("Usage: /" + cmd + " [user], [amount], [reason]");
		for (let u in splitTarget) splitTarget[u] = splitTarget[u].trim();

		let targetUser = splitTarget[0];
		if (toId(targetUser).length < 1) return this.sendReply("/" + cmd + " - [user] may not be blank.");
		if (toId(targetUser).length > 19) return this.sendReply("/" + cmd + " - [user] can't be longer than 19 characters");

		let amount = Math.round(Number(splitTarget[1]));
		if (isNaN(amount)) return this.sendReply("/" + cmd + "- [amount] must be a number.");
		if (amount > 1000) return this.sendReply("/" + cmd + " - You can't give more than 1000 " + currencyName + " at a time.");
		if (amount < 1) return this.sendReply("/" + cmd + " - You can't give less than one " + currencyName + ".");

		let reason = splitTarget[2];
		if (reason.length > 100) return this.errorReply("Reason may not be longer than 100 characters.");
		if (toId(reason).length < 1) return this.errorReply("Please specify a reason to give " + currencyName + ".");

		Economy.writeMoney(targetUser, amount, () => {
			Economy.readMoney(targetUser, newAmount => {
				if (Users(targetUser) && Users(targetUser).connected) {
					Users.get(targetUser).popup('|html|You have received ' + amount + ' ' + (amount === 1 ? currencyName : currencyPlural) +
					' from ' + WL.nameColor(user.userid, true) + '.');
				}
				this.sendReply(targetUser + " has received " + amount + ((amount === 1) ? " " + currencyName + "." : " " + currencyPlural + "."));
				Economy.logTransaction(user.name + " has given " + amount + ((amount === 1) ? " " + currencyName + " " : " " + currencyPlural + " ") + " to " + targetUser + ". (Reason: " + reason + ") They now have " + newAmount + (newAmount === 1 ? " " + currencyName + "." : " " + currencyPlural + "."));
			});
		});
	},

	ts: 'takecurrency', //You can change "ts" and "takestardust" to your currency name for an alias that applies to your currency Example: AwesomeBucks could be "ta" and "takeawesomebucks"
	takestardust: 'takecurrency',
	tc: 'takecurrency',
	takecurrency: function (target, room, user, connection, cmd) {
		if (!this.can('economy')) return false;
		if (!target) return this.sendReply("Usage: /" + cmd + " [user], [amount]");
		let splitTarget = target.split(',');
		if (!splitTarget[2]) return this.sendReply("Usage: /" + cmd + " [user], [amount], [reason]");
		for (let u in splitTarget) splitTarget[u] = splitTarget[u].trim();

		let targetUser = splitTarget[0];
		if (toId(targetUser).length < 1) return this.sendReply("/" + cmd + " - [user] may not be blank.");
		if (toId(targetUser).length > 19) return this.sendReply("/" + cmd + " - [user] can't be longer than 19 characters");

		let amount = Math.round(Number(splitTarget[1]));
		if (isNaN(amount)) return this.sendReply("/" + cmd + "- [amount] must be a number.");
		if (amount > 1000) return this.sendReply("/" + cmd + " - You can't take more than 1000 " + currencyName + " at a time.");
		if (amount < 1) return this.sendReply("/" + cmd + " - You can't take less than one " + currencyName + ".");

		let reason = splitTarget[2];
		if (reason.length > 100) return this.errorReply("Reason may not be longer than 100 characters.");
		if (toId(reason).length < 1) return this.errorReply("Please specify a reason to give " + currencyName + ".");

		Economy.writeMoney(targetUser, -amount, () => {
			Economy.readMoney(targetUser, newAmount => {
				if (Users(targetUser) && Users(targetUser).connected) {
					Users.get(targetUser).popup('|html|' + WL.nameColor(user.userid, true) + ' has removed ' + amount + ' ' + (amount === 1 ? currencyName : currencyPlural) +
					' from you.<br />');
				}
				this.sendReply("You removed " + amount + ((amount === 1) ? " " + currencyName + " " : " " + currencyPlural + " ") + " from " + Chat.escapeHTML(targetUser));
				Economy.logTransaction(user.name + " has taken " + amount + ((amount === 1) ? " " + currencyName + " " : " " + currencyPlural + " ") + " from " + targetUser + ". (Reason: " + reason + ") They now have " + newAmount + (newAmount === 1 ? " " + currencyName + "." : " " + currencyPlural + "."));
			});
		});
	},

	confirmtransferstardust: 'transfercurrency', //You can change "transferstardust" and "confirmtransferstardust" to your currency name for an alias that applies to your currency Example: AwesomeBucks could be "transferawesomebucks" and "confirmtransferawesomebucks"
	transferstardust: 'transfercurrency',
	confirmtransfercurrency: 'transfercurrency',
	transfercurrency: function (target, room, user, connection, cmd) {
		if (!target) return this.sendReply("Usage: /" + cmd + " [user], [amount]");
		let splitTarget = target.split(',');
		for (let u in splitTarget) splitTarget[u] = splitTarget[u].trim();
		if (!splitTarget[1]) return this.sendReply("Usage: /" + cmd + " [user], [amount]");

		let targetUser = (Users.getExact(splitTarget[0]) ? Users.getExact(splitTarget[0]).name : splitTarget[0]);
		if (toId(targetUser).length < 1) return this.sendReply("/" + cmd + " - [user] may not be blank.");
		if (toId(targetUser).length > 18) return this.sendReply("/" + cmd + " - [user] can't be longer than 18 characters.");

		let amount = Math.round(Number(splitTarget[1]));
		if (isNaN(amount)) return this.sendReply("/" + cmd + " - [amount] must be a number.");
		if (amount > 1000) return this.sendReply("/" + cmd + " - You can't transfer more than 1000 " + currencyName + " at a time.");
		if (amount < 1) return this.sendReply("/" + cmd + " - You can't transfer less than one " + currencyName + ".");
		Economy.readMoney(user.userid, money => {
			if (money < amount) return this.sendReply("/" + cmd + " - You can't transfer more " + currencyName + " than you have.");
			if (cmd !== 'confirmtransfercurrency' && cmd !== 'confirmtransferstardust') {
				return this.popupReply('|html|<center>' +
					'<button class = "card-td button" name = "send" value = "/confirmtransfercurrency ' + toId(targetUser) + ', ' + amount + '"' +
					'style = "outline: none; width: 200px; font-size: 11pt; padding: 10px; border-radius: 14px ; text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.4); box-shadow: 0px 0px 7px rgba(0, 0, 0, 0.4) inset; transition: all 0.2s;">' +
					'Confirm transfer to <br><b style = "color:' + WL.hashColor(targetUser) + '; text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.8)">' + Chat.escapeHTML(targetUser) + '</b></button></center>'
				);
			}
			Economy.writeMoney(user.userid, -amount, () => {
				Economy.writeMoney(targetUser, amount, () => {
					Economy.readMoney(targetUser, firstAmount => {
						Economy.readMoney(user.userid, secondAmount => {
							this.popupReply("You sent " + amount + ((amount === 1) ? " " + currencyPlural : " " + currencyPlural) + " to " + targetUser);
							Economy.logTransaction(
								user.name + " has transfered " + amount + ((amount === 1) ? " " + currencyPlural : " " + currencyPlural) + " to " + targetUser + "\n" +
								user.name + " now has " + secondAmount + " " + (secondAmount === 1 ? " " + currencyPlural : " " + currencyPlural) + " " +
								targetUser + " now has " + firstAmount + " " + (firstAmount === 1 ? " " + currencyPlural : " " + currencyPlural)
							);
							if (Users.getExact(targetUser) && Users.getExact(targetUser).connected) {
								Users.getExact(targetUser).send('|popup||html|' + WL.nameColor(user.name, true) + " has sent you " + amount + ((amount === 1) ? " " + currencyPlural : " " + currencyPlural));
							}
						});
					});
				});
			});
		});
	},

	moneylog: function (target, room, user) {
		if (!this.can('economy')) return false;
		if (!target) return this.sendReply("Usage: /moneylog [number] to view the last x lines OR /moneylog [text] to search for text.");
		let word = false;
		if (isNaN(Number(target))) word = true;
		let lines = fs.readFileSync('logs/transactions.log', 'utf8').split('\n').reverse();
		let output = '';
		let count = 0;
		let regex = new RegExp(target.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'), "gi"); // eslint-disable-line no-useless-escape

		if (word) {
			output += 'Displaying last 50 lines containing "' + target + '":\n';
			for (let line in lines) {
				if (count >= 50) break;
				if (!~lines[line].search(regex)) continue;
				output += lines[line] + '\n';
				count++;
			}
		} else {
			if (target > 100) target = 100;
			output = lines.slice(0, (lines.length > target ? target : lines.length));
			output.unshift("Displaying the last " + (lines.length > target ? target : lines.length) + " lines:");
			output = output.join('\n');
		}
		user.popup("|wide|" + output);
	},

	'!richestuser': true,
	richestusers: 'richestuser',
	richestuser: function (target, room, user) {
		if (!target) target = 100;
		target = Number(target);
		if (isNaN(target)) target = 100;
		if (!this.runBroadcast()) return;
		let keys = Db.currency.keys().map(name => {
			return {name: name, money: Db.currency.get(name)};
		});
		if (!keys.length) return this.sendReplyBox("Money ladder is empty.");
		keys.sort(function (a, b) { return b.money - a.money; });
		this.sendReplyBox(rankLadder('Richest Users', currencyPlural, keys.slice(0, target), 'money') + '</div>');
	},

	resetstardust: 'resetmoney',
	resetmoney: function (target, room, user) {
		if (!this.can('economy')) return false;
		if (!target) return this.parse('/help resetmoney');
		target = toId(target);
		Economy.writeMoney(target, 0);
		this.sendReply(target + " now has 0 " + currencyName + ".");
	},
	resetmoneyhelp: ['/resetmoney [user] - Resets target user\'s currency to 0. Requires: &, ~'],

	customsymbol: function (target, room, user) {
		let bannedSymbols = ['!', '|', '‽', '\u2030', '\u534D', '\u5350', '\u223C'];
		for (let u in Config.groups) if (Config.groups[u].symbol) bannedSymbols.push(Config.groups[u].symbol);
		if (!user.canCustomSymbol && !user.can('vip')) return this.sendReply('You need to buy this item from the shop to use.');
		if (!target || target.length > 1) return this.sendReply('/customsymbol [symbol] - changes your symbol (usergroup) to the specified symbol. The symbol can only be one character');
		if (target.match(/([a-zA-Z 0-9])/g) || bannedSymbols.indexOf(target) >= 0) {
			return this.sendReply('This symbol is banned.');
		}
		user.customSymbol = target;
		user.updateIdentity();
		user.canCustomSymbol = false;
		this.sendReply('Your symbol is now ' + target + '. It will be saved until you log off for more than an hour, or the server restarts. You can remove it with /resetsymbol');
	},

	removesymbol: 'resetsymbol',
	resetsymbol: function (target, room, user) {
		if (!user.customSymbol) return this.sendReply("You don't have a custom symbol!");
		delete user.customSymbol;
		user.updateIdentity();
		this.sendReply('Your symbol has been removed.');
	},

	economy: 'economystats',
	currency: 'economystats',
	stardust: 'economystats',
	economystats: function (target, room, user) {
		if (!this.runBroadcast()) return;
		const users = Db.currency.keys().map(curUser => ({amount: Db.currency.get(curUser)}));
		const total = users.reduce((acc, cur) => acc + cur.amount, 0);
		let average = Math.floor(total / users.length) || 0;
		let output = "There " + (total > 1 ? "are " : "is ") + total + " " + (total > 1 ? currencyPlural : currencyName) + " circulating in the economy. ";
		output += "The average user has " + average + " " + (average > 1 ? currencyPlural : currencyName) + ".";
		this.sendReplyBox(output);
	},
};
