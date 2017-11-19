'use strict';

/**
 * EXP SYSTEM FOR POKEMON SHOWDOWN
 * By Volco, modified by Insist
 */

const DEFAULT_AMOUNT = 0;
let DOUBLE_XP = false;

const minLevelExp = 15;
const multiply = 1.9;

function isExp(exp) {
	let numExp = Number(exp);
	if (isNaN(exp)) return "Must be a number.";
	if (String(exp).includes('.')) return "Cannot contain a decimal.";
	if (numExp < 1) return "Cannot be less than one EXP.";
	return numExp;
}
WL.isExp = isExp;

let EXP = WL.EXP = {
	readExp: function (userid, callback) {
		userid = toId(userid);

		let amount = Db.exp.get(userid, DEFAULT_AMOUNT);
		if (typeof callback !== 'function') {
			return amount;
		} else {
			return callback(amount);
		}
	},

	writeExp: function (userid, amount, callback) {
		// In case someone forgot to turn `userid` into an actual ID...
		userid = toId(userid);

		// In case someone forgot to make sure `amount` was a Number...
		amount = Number(amount);
		if (isNaN(amount)) {
			throw new Error("EXP.writeExp: Expected amount parameter to be a Number, instead received " + typeof amount);
		}
		let curTotal = Db.exp.get(userid, DEFAULT_AMOUNT);
		Db.exp.set(userid, curTotal + amount);
		let newTotal = Db.exp.get(userid);
		if (callback && typeof callback === 'function') {
			// If a callback is specified, return `newTotal` through the callback.
			return callback(newTotal);
		}
	},
};

function addExp(user, room, amount) {
	if (!user || !room) return;
	user = Users(toId(user));
	if (Db.expoff.get(user.userid)) return false;
	if (DOUBLE_XP) amount = amount * 2;
	EXP.readExp(user.userid, totalExp => {
		let oldLevel = WL.level(user.userid);
		EXP.writeExp(user.userid, amount, newTotal => {
			let level = WL.level(user.userid);
			if (oldLevel < level) {
				let reward = '';
				switch (level) {
				case 5:
					Economy.logTransaction(user.userid + ' received a custom symbol for reaching level ' + level + '.');
					user.canCustomSymbol = true;
					reward = 'a Custom Symbol. To claim your custom symbol, use the command /customsymbol [symbol]';
					break;
				case 10:
					Economy.logTransaction(user.userid + ' received a custom avatar for reaching level ' + level + '.');
					if (!user.tokens) user.tokens = {};
					user.tokens.avatar = true;
					reward = 'a Custom Avatar. To claim your avatar, use the command /usetoken avatar, [link to the image you want]';
					break;
				case 15:
					Economy.logTransaction(user.userid + ' received a custom title for reaching level ' + level + '.');
					if (!user.tokens) user.tokens = {};
					user.tokens.title = true;
					reward = 'a Profile Title. To claim your profile title, use the command /usetoken title, [title], [hex color]';
					break;
				case 20:
					Economy.logTransaction(user.userid + ' received a custom icon for reaching level ' + level + '.');
					if (!user.tokens) user.tokens = {};
					user.tokens.icon = true;
					reward = 'a Custom Userlist Icon. To claim your icon, use the command /usetoken icon, [link to the image you want]';
					break;
				case 25:
					Economy.logTransaction(user.userid + ' received a emote for reaching level ' + level + '.');
					if (!user.tokens) user.tokens = {};
					user.tokens.emote = true;
					reward = 'an Emote. To claim your emote, use the command /usetoken emote, [name], [image]';
					break;
				case 30:
					Economy.logTransaction(user.userid + ' received a custom color for reaching level ' + level + '.');
					if (!user.tokens) user.tokens = {};
					user.tokens.color = true;
					reward = 'a Custom Color. To claim your custom color, use the command /usetoken color, [hex color]';
					break;
				case 35:
					Economy.writeMoney(user.userid, 50);
					reward = '50 ' + currencyPlural + '.';
					break;
				case 40:
					Economy.logTransaction(user.userid + ' received a chatroom for reaching level ' + level + '.');
					WL.messageSeniorStaff(user.userid + ' has earned a chatroom for reaching level ' + level + '!');
					Monitor.adminlog(user.userid + ' has earned a chatroom for reaching level ' + level + '!');
					reward = 'a Chatroom. To claim your chatroom, Contact a Leader (&) or Administrator (~).';
					break;
				case 45:
					Economy.logTransaction(user.userid + ' received a profile background for reaching level ' + level + '.');
					WL.messageSeniorStaff(user.userid + ' has earned a profile background for reaching level ' + level + '.');
					Monitor.log(user.userid + ' has earned a profile background for reaching level ' + level + '!');
					reward = 'a Profile Background. To claim your profile background, contact a Global Staff (% and up).';
					break;
				case 50:
					Economy.logTransaction(user.userid + ' received profile music for reaching level ' + level + '.');
					WL.messageSeniorStaff(user.userid + ' has earned profile music for reaching level ' + level + '.');
					Monitor.log(user.userid + ' has earned profile music for reaching level ' + level + '!');
					reward = 'Profile Music. To claim your profile music, contact a Global Staff (% and up).';
					break;
				default:
					Economy.writeMoney(user.userid, Math.ceil(level * 0.5));
					reward = Math.ceil(level * 0.5) + ' ' + (Math.ceil(level * 0.5) === 1 ? currencyName : currencyPlural) + '.';
				}
				user.sendTo(room, '|html|<center><font size=4><b><i>Level Up!</i></b></font><br />' +
				'You have reached level ' + level + ', and have earned ' + reward + '</b></center>');
			}
		});
	});
}
WL.addExp = addExp;

function level(userid) {
	userid = toId(userid);
	let curExp = Db.exp.get(userid, 0);
	return Math.floor(Math.pow(curExp / minLevelExp, 1 / multiply) + 1);
}
WL.level = level;

function nextLevel(user) {
	let curExp = Db.exp.get(toId(user), 0);
	let lvl = WL.level(toId(user));
	return Math.floor(Math.pow(lvl, multiply) * minLevelExp) - curExp;
}
WL.nextLevel = nextLevel;

exports.commands = {
	'!exp': true,
	level: 'exp',
	xp: 'exp',
	exp: function (target, room, user) {
		if (!this.runBroadcast()) return;
		let targetId = toId(target);
		if (target || !target && this.broadcasting) {
			if (!target) targetId = user.userid;
			EXP.readExp(targetId, exp => {
				this.sendReplyBox('<b>' + WL.nameColor(targetId, true) + '</b> has ' + exp + ' exp and is level ' + WL.level(targetId) + ' and needs ' + WL.nextLevel(targetId) + ' to reach the next level.');
			});
		} else {
			EXP.readExp(user.userid, exp => {
				this.sendReplyBox(
					"Name: " + WL.nameColor(user.userid, true) + "<br />Current level: " + WL.level(user.userid) + "<br />Exp Needed for Next level: " + WL.nextLevel(user.userid) +
					"<br />All rewards have a 1 time use! <br /><br />" +
					"Level 5 unlocks a free Custom Symbol. <br /><br />" +
					"Level 10 unlocks a free Custom Avatar. <br /><br />" +
					"Level 15 unlocks a free Profile Title. <br /><br />" +
					"Level 20 unlocks a free Custom Userlist Icon. <br /><br />" +
					"Level 25 unlocks a free Emote. <br /><br />" +
					"Level 30 unlocks a free Custom Color.  <br /><br />" +
					"Level 35 unlocks 50 " + currencyPlural + ". <br /><br />" +
					"Level 40 unlocks a free Chatroom. <br /><br />" +
					"Level 45 unlocks a free Profile Background. <br /><br />" +
					"Level 50 unlocks a free Profile Song. <br /><br />"
				);
			});
		}
	},

	givexp: 'giveexp',
	giveexp: function (target, room, user) {
		if (!this.can('roomowner')) return false;
		if (!target || target.indexOf(',') < 0) return this.parse('/help giveexp');

		let parts = target.split(',');
		let username = parts[0];
		let uid = toId(username);
		let amount = isExp(parts[1]);

		if (amount > 1000) return this.sendReply("You cannot give more than 1,000 exp at a time.");
		if (username.length >= 19) return this.sendReply("Usernames are required to be less than 19 characters long.");
		if (typeof amount === 'string') return this.errorReply(amount);
		if (!Users.get(username)) return this.errorReply("The target user could not be found");


		WL.addExp(uid, this.room, amount);
		this.sendReply(uid + " has received " + amount + ((amount === 1) ? " exp." : " exp."));
	},
	giveexphelp: ["/giveexp [user], [amount] - Give a user a certain amount of exp."],

	resetexp: 'resetxp',
	confirmresetexp: 'resetxp',
	resetxp: function (target, room, user, conection, cmd) {
		if (!target) return this.errorReply('USAGE: /resetxp (USER)');
		let parts = target.split(',');
		let targetUser = parts[0].toLowerCase().trim();
		if (!this.can('roomowner')) return false;
		if (cmd !== 'confirmresetexp') {
			return this.popupReply('|html|<center><button name="send" value="/confirmresetexp ' + targetUser + '"style="background-color:red;height:300px;width:150px"><b><font color="white" size=3>Confirm XP reset of ' + WL.nameColor(targetUser, true) + '; this is only to be used in emergencies, cannot be undone!</font></b></button>');
		}
		Db.exp.set(toId(target), 0);
		if (Users.get(target)) Users.get(target).popup('Your XP was reset by an Administrator. This cannot be undone and nobody below the rank of Administrator can assist you or answer questions about this.');
		user.popup("|html|You have reset the XP of " + WL.nameColor(targetUser, true) + ".");
		Monitor.adminlog('[EXP Monitor] ' + user.name + ' has reset the XP of ' + target);
		room.update();
	},

	doublexp: 'doubleexp',
	doubleexp: function (target, room, user) {
		if (!this.can('roomowner')) return;
		DOUBLE_XP = !DOUBLE_XP;
		return this.sendReply('Double XP was turned ' + (DOUBLE_XP ? 'ON' : 'OFF') + '.');
	},

	expon: function (target, room, user) {
		if (!this.can('root')) return false;
		Db.expoff.remove(user.userid);
		this.sendReply("You are no longer exempt from exp");
	},

	expoff: function (target, room, user) {
		if (!this.can('root')) return false;
		Db.expoff.set(user.userid, true);
		this.sendReply("You are now exempt from exp");
	},

	'!xpladder': true,
	expladder: 'xpladder',
	xpladder: function (target, room, user) {
		if (!target) target = 100;
		target = Number(target);
		if (isNaN(target)) target = 100;
		if (!this.runBroadcast()) return;
		let keys = Db.exp.keys().map(name => {
			return {name: name, exp: Db.exp.get(name)};
		});
		if (!keys.length) return this.sendReplyBox("EXP ladder is empty.");
		keys.sort(function (a, b) { return b.exp - a.exp; });
		this.sendReplyBox(rankLadder('Exp Ladder', "EXP", keys.slice(0, target), 'exp') + '</div>');
	},
};
