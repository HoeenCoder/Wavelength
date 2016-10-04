'use strict';

SG.database = new sqlite3.Database('config/users.db', function () {
	SG.database.run("CREATE TABLE if not exists users (userid TEXT, name TEXT, currency INTEGER, lastSeen INTEGER, onlineTime INTEGER, credits INTEGER, title TEXT, notifystatus INTEGER, background TEXT)");
	SG.database.run("CREATE TABLE if not exists friends (id integer primary key, userid TEXT, friend TEXT)");
});

const fs = require('fs');
const currencyName = 'Stardust';
const currenyPlural = 'Stardust';

let Economy = global.Economy = {
	readMoney: function (userid, callback) {
		if (!callback) return false;
		userid = toId(userid);
		SG.database.all("SELECT * FROM users WHERE userid=$userid", {$userid: userid}, function (err, rows) {
			if (err) return console.log("readMoney: " + err);
			callback(((rows[0] && rows[0].currency) ? rows[0].currency : 0));
		});
	},
	writeMoney: function (userid, amount, callback) {
		userid = toId(userid);
		SG.database.all("SELECT * FROM users WHERE userid=$userid", {$userid: userid}, function (err, rows) {
			if (err) return console.log("writeMoney 1: " + err);
			if (rows.length < 1) {
				SG.database.run("INSERT INTO users(userid, currency) VALUES ($userid, $amount)", {$userid: userid, $amount: amount}, function (err) {
					if (err) return console.log("writeMoney 2: " + err);
					if (callback) return callback();
				});
			} else {
				amount += rows[0].currency;
				SG.database.run("UPDATE users SET currency=$amount WHERE userid=$userid", {$amount: amount, $userid: userid}, function (err) {
					if (err) return console.log("writeMoney 3: " + err);
					if (callback) return callback();
				});
			}
		});
	},
	writeMoneyArr: function (users, amount) {
		this.writeMoney(users[0], amount, () => {
			users.splice(0, 1);
			if (users.length > 0) this.writeMoneyArr(users, amount);
		});
	},
	logTransaction: function (message) {
		if (!message) return false;
		fs.appendFile('logs/transactions.log', '[' + new Date().toUTCString() + '] ' + message + '\n');
	},

	logDice: function (message) {
		if (!message) return false;
		fs.appendFile('logs/dice.log', '[' + new Date().toUTCString() + '] ' + message + '\n');
	},
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
			this.sendReplyBox(SG.nameColor(target, true) + " has " + money + ((money === 1) ? " " + currencyName + "." : " " + currenyPlural + "."));
			if (this.broadcasting) room.update();
		});
	},

	gc: 'givecurrency',
	givecurrency: function (target, room, user) {
		if (!this.can('currency')) return false;
		if (!target) return this.sendReply("Usage: /givecurrency [user], [amount]");
		let splitTarget = target.split(',');
		if (!splitTarget[2]) return this.sendReply("Usage: /givecurrency [user], [amount], [reason]");
		for (let u in splitTarget) splitTarget[u] = splitTarget[u].trim();

		let targetUser = splitTarget[0];
		if (toId(targetUser).length < 1) return this.sendReply("/givecurrency - [user] may not be blank.");
		if (toId(targetUser).length > 19) return this.sendReply("/givecurrency - [user] can't be longer than 19 characters");

		let amount = Math.round(Number(splitTarget[1]));
		if (isNaN(amount)) return this.sendReply("/givecurrency - [amount] must be a number.");
		if (amount > 1000) return this.sendReply("/givecurrency - You can't give more than 1000 currency at a time.");
		if (amount < 1) return this.sendReply("/givecurrency - You can't give less than one buck.");

		let reason = splitTarget[2];
		if (reason.length > 100) return this.errorReply("Reason may not be longer than 100 characters.");
		if (toId(reason).length < 1) return this.errorReply("Please specify a reason to give currency.");

		Economy.writeMoney(targetUser, amount, () => {
			Economy.readMoney(targetUser, newAmount => {
				if (Users(targetUser) && Users(targetUser).connected) {
					Users.get(targetUser).popup('|html|You have received ' + amount + ' ' + (amount === 1 ? currencyName : currenyPlural) +
					' from ' + SG.nameColor(user.userid, true) + '.');
				}
				this.sendReply(targetUser + " has received " + amount + ((amount === 1) ? " " + currencyName + "." : " " + currenyPlural + "."));
				Economy.logTransaction(user.name + " has given " + amount + ((amount === 1) ? " " + currencyName + " " : " " + currenyPlural + " ") + " to " + targetUser + ". (Reason: " + reason + ") They now have " + newAmount + (newAmount === 1 ? " " + currencyName + "." : " " + currenyPlural + "."));
			});
		});
	},

	tc:'takecurrency',
	takecurrency: function (target, room, user) {
		if (!this.can('currency')) return false;
		if (!target) return this.sendReply("Usage: /takecurrency [user], [amount]");
		let splitTarget = target.split(',');
		if (!splitTarget[2]) return this.sendReply("Usage: /takecurrency [user], [amount], [reason]");
		for (let u in splitTarget) splitTarget[u] = splitTarget[u].trim();

		let targetUser = splitTarget[0];
		if (toId(targetUser).length < 1) return this.sendReply("/takecurrency - [user] may not be blank.");
		if (toId(targetUser).length > 19) return this.sendReply("/takecurrency - [user] can't be longer than 19 characters");

		let amount = Math.round(Number(splitTarget[1]));
		if (isNaN(amount)) return this.sendReply("/takecurrency - [amount] must be a number.");
		if (amount > 1000) return this.sendReply("/takecurrency - You can't take more than 1000 currency at a time.");
		if (amount < 1) return this.sendReply("/takecurrency - You can't take less than one buck.");

		let reason = splitTarget[2];
		if (reason.length > 100) return this.errorReply("Reason may not be longer than 100 characters.");
		if (toId(reason).length < 1) return this.errorReply("Please specify a reason to remove currency.");

		Economy.writeMoney(targetUser, -amount, () => {
			Economy.readMoney(targetUser, newAmount => {
				if (Users(targetUser) && Users(targetUser).connected) {
					Users.get(targetUser).popup('|html|' + SG.nameColor(user.userid, true) + ' has removed ' + amount + ' ' + (amount === 1 ? currencyName : currenyPlural) +
					' from you.<br />');
				}
				this.sendReply("You removed " + amount + ((amount === 1) ? " " + currencyName + " " : " " + currenyPlural + " ") + " from " + Chat.escapeHTML(targetUser));
				Economy.logTransaction(user.name + " has taken " + amount + ((amount === 1) ? " " + currencyName + " " : " " + currenyPlural + " ") + " from " + targetUser + ". (Reason: " + reason + ") They now have " + newAmount + (newAmount === 1 ? " " + currencyName + "." : " " + currenyPlural + "."));
			});
		});
	},

	confirmtransfercurrency: 'transfercurrency',
	transfercurrency: function (target, room, user, connection, cmd) {
		if (!target) return this.sendReply("Usage: /transfercurrency [user], [amount]");
		let splitTarget = target.split(',');
		for (let u in splitTarget) splitTarget[u] = splitTarget[u].trim();
		if (!splitTarget[1]) return this.sendReply("Usage: /transfercurrency [user], [amount]");

		let targetUser = (Users.getExact(splitTarget[0]) ? Users.getExact(splitTarget[0]).name : splitTarget[0]);
		if (toId(targetUser).length < 1) return this.sendReply("/transfercurrency - [user] may not be blank.");
		if (toId(targetUser).length > 18) return this.sendReply("/transfercurrency - [user] can't be longer than 18 characters.");

		let amount = Math.round(Number(splitTarget[1]));
		if (isNaN(amount)) return this.sendReply("/transfercurrency - [amount] must be a number.");
		if (amount > 1000) return this.sendReply("/transfercurrency - You can't transfer more than 1000 currency at a time.");
		if (amount < 1) return this.sendReply("/transfercurrency - You can't transfer less than one buck.");

		Economy.readMoney(user.userid, money => {
			if (money < amount) return this.sendReply("/transfercurrency - You can't transfer more currency than you have.");
			if (cmd !== 'confirmtransfercurrency') {
				return this.popupReply('|html|<center>' +
					'<button class = "card-td button" name = "send" value = "/confirmtransfercurrency ' + toId(targetUser) + ', ' + amount + '"' +
					'style = "outline: none; width: 200px; font-size: 11pt; padding: 10px; border-radius: 14px ; text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.4); box-shadow: 0px 0px 7px rgba(0, 0, 0, 0.4) inset; transition: all 0.2s;">' +
					'Confirm transfer to <br><b style = "color:' + SG.hashColor(targetUser) + '; text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.8)">' + Chat.escapeHTML(targetUser) + '</b></button></center>'
				);
			}
			Economy.writeMoney(user.userid, -amount, () => {
				Economy.writeMoney(targetUser, amount, () => {
					Economy.readMoney(targetUser, firstAmount => {
						Economy.readMoney(user.userid, secondAmount => {
							this.popupReply("You sent " + amount + ((amount === 1) ? " currency " : " currency ") + " to " + targetUser);
							Economy.logTransaction(
								user.name + " has transfered " + amount + ((amount === 1) ? " currency " : " currency ") + " to " + targetUser + "\n" +
								user.name + " now has " + secondAmount + " " + (secondAmount === 1 ? "currency." : "currency.") + " " +
								targetUser + " now has " + firstAmount + " " + (firstAmount === 1 ? "currency." : "currency.")
							);
							if (Users.getExact(targetUser) && Users.getExact(targetUser).connected) {
								Users.getExact(targetUser).send('|popup||html|' + SG.nameColor(user.name, true) + " has sent you " + amount + ((amount === 1) ? " currency." : " currency."));
							}
						});
					});
				});
			});
		});
	},
}
