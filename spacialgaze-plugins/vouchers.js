/*
    Voucher System for SpacialGaze
    Coded by HoeenHero
*/
'use strict';

const fs = require('fs');
let writeJSON = true;
let noRead = false;
let shopItems = ['Custom Symbol', 'Custom Avatar', 'Custom Color', 'Custom Title', 'Custom Icon'];
const eventLeaders = ['krakenmare', 'celestialtater'];
const expiresIn = 5; //false = never, otherwise specify a number of days. Vouchers will expire this number of days from creation.

class Voucher {
	constructor(userid, voucher, item, expires, id) {
		this.userid = userid;
		this.goodFor = voucher;
		this.expires = (expires ? expires : (expiresIn !== false ? (expiresIn * 24 * 60 * 60 * 1000 + Date.now()) : null));
		this.item = (item ? item : null); //item from shop / amount of currency
		this.id = (id ? id : SG.vouchers.storageForVocuherIds);
		if (!id) SG.vouchers.storageForVocuherIds++;
	}

	redeem() {
		if (!Users(this.userid)) return false;
		if (this.expires !== null && this.expires <= Date.now()) return 'expired'; //Voucher is expired
		switch (toId(this.goodFor)) {
		case 'currency':
			let self = this;
			Economy.writeMoney(self.userid, self.item, () => {
				Economy.readMoney(self.userid, newAmount => {
					if (Users(self.userid).connected) Users(self.userid).popup('|html|You have redemed a voucher for ' + self.item + ' ' + (self.item > 1 ? global.currencyPlural : global.currencyName) + '.');
				});
			});
			Economy.logTransaction(Chat.escapeHTML(Users(self.userid).name) + ' has redemed a voucher for ' + self.item + ' ' + (self.item === 1 ? global.currencyName : global.currencyPlural) + '.');
			break;
		case 'item':
			let valid = false;
			for (let i = 0; i < shopItems.length; i++) {
				if (toId(shopItems[i]) === toId(this.item)) valid = i;
			}
			if (!valid && valid !== 0) return false;
			switch (toId(this.item)) {
			case 'customsymbol':
				Users(this.userid).popup('|html|You have redeemed a Custom Symbol. To activate your custom symbol, you can set it with with /customsymbol [symbol];<br/>once you set your symbol, you\'ll need to purchase this again to set a new one.<br/>You can remove your symbol with /resetsymbol.<br/>');
				Users(this.userid).canCustomSymbol = true;
				break;
			case 'customavatar':
				Users(this.userid).popup('|html|You have purchased a Custom Avatar. Upper staff has been notified of your purchase and will contact you shortly.<br/>Inappropriate images may be denied; 80x80 is the optimal image resolution.<br/>');
				SG.messageSeniorStaff(Users(this.userid).name + " has purchased a Custom Avatar. Please contact this user to setup their Custom Avatar.");
				break;
			case 'customcolor':
				Users(this.userid).popup('|html|You have purchased a Custom Name Color. Upper staff has been notified of your purchase and will contact you shortly.<br/>Colors must be easily visible on the website.<br/>');
				SG.messageSeniorStaff(Users(this.userid).name + " has purchased a Custom Color. Please contact this user to setup their Custom Color.");
				break;
			case 'customtitle':
				Users(this.userid).popup('|html|You have purchased a Custom Title. Upper staff has been notified of your purchase and will contact you shortly.');
				SG.messageSeniorStaff(Users(this.userid).name + " has purchased a Custom Title. Please contact this user to setup their Custom Color.");
				break;
			case 'customicon':
				Users(this.userid).popup('|html|You have purchased a Userlist Icon. Upper staff has been notified of your purchase and will contact you shortly.<br/>Inappropriate images may be denied; must be a 32x32 image.<br/>');
				SG.messageSeniorStaff(Users(this.userid).name + " has purchased a Userlist Icon. Please contact this user to setup their Userlist Icon.");
				break;
			}
			break;
		case 'boostuno':
			if (Users(this.userid).unoBoost) return 'active';
			if (Users(this.userid).connected) Users(this.userid).popup('|html|You have redemed a voucher for double Uno winnings.<br/>If you win your next Uno game you will receive DOUBLE ' + (this.item > 1 ? global.currencyPlural : global.currencyName) + '!<br/>Please note that redemed boost vouchers expire when the server restarts, or when you have been offline for an hour.');
			Users(this.userid).unoBoost = true;
			break;
		case 'boosttour':
			if (Users(this.userid).tourBoost) return 'active';
			if (Users(this.userid).connected) Users(this.userid).popup('|html|You have redemed a voucher for double tournamnet winnings.<br/>If you win your next tournament you will receive DOUBLE ' + (this.item > 1 ? global.currencyPlural : global.currencyName) + '!<br/>Please note that redemed boost vouchers expire when the server restarts, or when you have been offline for an hour.');
			Users(this.userid).tourBoost = true;
			break;
		case 'boostgame':
			if (Users(this.userid).gameBoost) return 'active';
			if (Users(this.userid).connected) Users(this.userid).popup('|html|You have redemed a voucher for double Uno OR tournamnet winnings.<br/>If you win your next tournament OR game of Uno you will receive DOUBLE ' + (this.item > 1 ? global.currencyPlural : global.currencyName) + '!<br/>Please note that redemed boost vouchers expire when the server restarts, or when you have been offline for an hour.');
			Users(this.userid).gameBoost = true;
			break;
		default:
			return false; //Unrecoginzed voucher
		}
		//Redeemed, delete this voucher
		return true;
	}
}

function writeFile() {
	if (!writeJSON) return false; //Prevent corruptions
	fs.writeFile('config/vouchers.json', JSON.stringify(SG.vouchers));
}

//load JSON
try {
	fs.accessSync('config/vouchers.json', fs.F_OK);
} catch (e) {
	fs.writeFile('config/vouchers.json', "{}", function (err) {
		if (err) {
			console.error('Error while loading vouchers: ' + err);
			SG.vouchers = {
				storageForVocuherIds: -1,
			};
			writeJSON = false;
		} else {
			console.log("config/vouchers.json not found, creating a new one...");
		}
	});
	noRead = true;
}

//Load vouchers on server start / hotpatch chat
try {
	if (!noRead) {
		let raw = JSON.parse(fs.readFileSync('config/vouchers.json', 'utf8'));
		SG.vouchers = {};
		for (let key in raw) {
			if (key === 'storageForVocuherIds') {
				SG.vouchers.storageForVocuherIds = raw[key];
				continue;
			}
			SG.vouchers[key] = [];
			for (let i = 0; i < raw[key].length; i++) {
				let reVouch = new Voucher(raw[key][i].userid, raw[key][i].goodFor, raw[key][i].item, raw[key][i].expires, Number(raw[key][i].id));
				SG.vouchers[key].push(reVouch);
			}
		}
		if (!SG.vouchers.storageForVocuherIds) SG.vouchers.storageForVocuherIds = 1;
	} else {
		SG.vouchers = {
			storageForVocuherIds: 1,
		};
	}
} catch (e) {
	console.error('Error loading Vouchers: ' + e.stack);
	SG.vouchers = {
		storageForVocuherIds: -1,
	};
	writeJSON = false;
}

exports.commands = {
	coupon: 'voucher',
	coupons: 'voucher',
	vouchers: 'voucher',
	voucher: {
		give: function (target, room, user, connection, cmd, message) {
			if (SG.storageForVocuherIds === -1) return this.errorReply('An error occured while loading vouchers. They cannot be used at this time.');
			if (!user.can('roomowner')) {
				if (eventLeaders.indexOf(user.userid) === -1) return false;
			}
			target = target.split(',');
			if (!target[1]) return this.parse('/help voucher give');
			let targetUser = Users(toId(target[0]));
			if (!targetUser) return this.errorReply('User "' + target[0] + '" not found.');
			if (!SG.vouchers[targetUser.userid]) SG.vouchers[targetUser.userid] = [];
			let vouchers = ['currency', 'item', 'boostUno', 'boostTour', 'boostGame'];
			let index = -1;
			for (let i = 0; i < vouchers.length; i++) {
				if (toId(vouchers[i]) === toId(target[1])) {
					index = i;
					break;
				}
			}
			if (index === -1) return this.errorReply(target[1] + ' is not a valid voucher. Use /help voucher give for a list of valid vouchers.');
			if (index === 0 || index === 1) {
				if (!target[2]) return this.parse('/help voucher give');
				if (index === 0) {
					if (isNaN(Number(target[2]))) return this.errorReply('You need to give a number for the amount of ' + global.currencyPlural + ' to give.');
					if (Number(target[2]) < 1 || Number(target[2]) > 50) return this.errorReply('You cannot create a voucher for less than 1 ' + global.currencyName + ' or more than 50 ' + global.currencyPlural + '.');
					let voucher = new Voucher(targetUser.userid, vouchers[index], Number(target[2]));
					SG.vouchers[targetUser.userid].push(voucher);
					targetUser.popup('|html|' + Chat.escapeHTML(user.name) + ' has given you a voucher for ' + toId(target[2]) + ' ' + (Number(target[2]) === 1 ? global.currencyName : global.currencyPlural) + '.<br/>To redeem your voucher use <button name="send" value="/voucher redeem ' + voucher.id + '">/voucher redeem</button>.<br/>' + (expiresIn ? 'Your voucher expires in ' + expiresIn + ' days.' : 'This voucher will not expire.'));
					writeFile();
					Economy.logTransaction(Chat.escapeHTML(targetUser.name) + ' has received a voucher from ' + Chat.escapeHTML(user.name) + ' for ' + toId(target[2]) + ' ' + (Number(target[2]) === 1 ? global.currencyName : global.currencyPlural) + '.');
					this.sendReply('You gave ' + targetUser.name + ' a voucher for ' + target[2] + ' ' + (Number(target[2]) === 1 ? global.currencyName : global.currencyPlural) + '.');
					return true;
				} else {
					let shopIndex = -1;
					for (let i = 0; i < shopItems.length; i++) {
						if (toId(shopItems[i]) === toId(target[2])) {
							shopIndex = i;
							break;
						}
					}
					if (shopIndex === -1) return this.errorReply('Invalid item. Use /help voucher give for a list of valid items.');
					let voucher = new Voucher(targetUser.userid, vouchers[index], shopItems[shopIndex]);
					SG.vouchers[targetUser.userid].push(voucher);
					targetUser.popup('|html|' + Chat.escapeHTML(user.name) + ' has given you a voucher for a ' + shopItems[shopIndex] + '.<br/>To redeem your voucher use <button name="send" value="/voucher redeem ' + voucher.id + '">/voucher redeem</button>.<br/>' + (expiresIn ? 'Your voucher expires in ' + expiresIn + ' days.' : 'This voucher will not expire.'));
					writeFile();
					Economy.logTransaction(Chat.escapeHTML(targetUser.name) + ' has received a voucher from ' + Chat.escapeHTML(user.name) + ' for a ' + shopItems[shopIndex] + '.');
					this.sendReply('You gave ' + targetUser.name + ' a voucher for a ' + shopItems[shopIndex] + '.');
					return true;
				}
			} else {
				let voucher = new Voucher(targetUser.userid, vouchers[index], null);
				SG.vouchers[targetUser.userid].push(voucher);
				targetUser.popup('|html|' + Chat.escapeHTML(user.name) + ' has given you a voucher for a ' + vouchers[index] + '.<br/>To redeem your voucher use <button name="send" value="/voucher redeem ' + voucher.id + '">/voucher redeem</button>.<br/>' + (expiresIn ? 'Your voucher expires in ' + expiresIn + ' days.' : 'This voucher will not expire.'));
				writeFile();
				Economy.logTransaction(Chat.escapeHTML(targetUser.name) + ' has received a voucher from ' + Chat.escapeHTML(user.name) + ' for a ' + vouchers[index] + '.');
				this.sendReply('You gave ' + targetUser.name + ' a voucher for a ' + vouchers[index] + '.');
				return true;
			}
		},
		givehelp: ['/voucher give [user], [voucher], (item/amount) - Give a user a voucher. Valid vouchers are: currency, item, boostUno, boostTour, and boostGame. Valid items are Custom Symbol, Custom Avatar, Custom Title, Custom Icon, and Custom Color. Requires Server Event Leader, &, or ~.'],

		take: function (target, room, user, connection, cmd, message) {
			if (SG.storageForVocuherIds === -1) return this.errorReply('An error occured while loading vouchers. They cannot be used at this time.');
			if (!user.can('roomowner')) {
				if (eventLeaders.indexOf(user.userid) === -1) return false;
			}
			target = target.split(',');
			if (!target[1]) return this.parse('/help voucher take');
			let targetUser = Users(toId(target[0]));
			if (!targetUser) return this.errorReply('User ' + target[0] + ' not found.');
			if (!SG.vouchers[targetUser.userid] || SG.vouchers[targetUser.userid].length === 0) return this.errorReply(targetUser.name + ' has no vouchers.');
			if (isNaN(Number(target[1]))) return this.errorReply('Ids must be a number.');
			for (let key in SG.vouchers[targetUser.userid]) {
				if (SG.vouchers[targetUser.userid][key].id === Number(target[1])) {
					delete SG.vouchers[targetUser.userid][key];
					SG.vouchers[targetUser.userid].splice(key, 1);
					writeFile();
					Economy.logTransaction(Chat.escapeHTML(user.name) + ' has taken a voucher from ' + Chat.escapeHTML(targetUser.name) + ':');
					return this.sendReply('You have taken voucher ID ' + target[1] + ' from ' + targetUser.name + '.');
				}
			}
			return this.errorReply('Voucher ID ' + target[1] + ' not found in ' + targetUser.name + '\'s possession.');
		},
		takehelp: ['/voucher take [user], [id] - Take a user\'s voucher away. Requires Server Event Leader, &, or ~'],

		list: function (target, room, user, connection, cmd, message) {
			if (SG.storageForVocuherIds === -1) return this.errorReply('An error occured while loading vouchers. They cannot be used at this time.');
			if (!target) target = user.userid;
			if (user.userid === toId(target)) {
				if (!this.runBroadcast()) return;
			}
			let targetUser = Users(target);
			if (!targetUser) return this.errorReply('User ' + target + ' not found.');
			if (targetUser.userid !== user.userid && !user.can('roomowner')) {
				if (eventLeaders.indexOf(user.userid) === -1) return this.errorReply('You can only view your own vouchers.');
			}
			if (!SG.vouchers[targetUser.userid] || SG.vouchers[targetUser.userid].length === 0) return this.errorReply(targetUser.name + ' has no vouchers.');
			let list = SG.vouchers[targetUser.userid];
			let output = '<table style="border: 1px solid black"><tr><th colspan="5" style="border: 1px solid black">' + targetUser.name + '\'s Vouchers</th></tr>';
			output += '<tr><th style="border: 1px solid black">ID</th><th style="border: 1px solid black">Good For</th><th style="border: 1px solid black">Item/Amount</th><th style="border: 1px solid black">Expires</th><th style="border: 1px solid black">Redeem</th></tr>';
			for (let i = 0; i < list.length; i++) {
				if (list === undefined) continue; //In case we leave an empty slot in the array.
				output += '<tr><td style="border: 1px solid black">' + list[i].id + '</td><td style="border: 1px solid black">' + list[i].goodFor + '</td><td style="border: 1px solid black">' + (list[i].item ? list[i].item : 'N/A') + '</td><td style="border: 1px solid black">' + (list[i].expires === null ? 'Never' : (list[i].expires < Date.now() ? 'Expired' : Chat.toDurationString(list[i].expires - Date.now()))) + '</td><td style="border: 1px solid black"><button name="send" value="/voucher redeem ' + list[i].id + '">Redeem this Voucher</button></td></tr>';
			}
			output += '</table>';
			return this.sendReplyBox(output);
		},
		listhelp: ['/voucher list (user) - List the vouchers of a user, requires Server Event Leader, &, or ~ for viewing vouchers for other users.'],

		redeem: function (target, room, user, connection, cmd, message) {
			if (SG.storageForVocuherIds === -1) return this.errorReply('An error occured while loading vouchers. They cannot be used at this time.');
			if (!target) return this.parse('/help voucher redeem');
			target = Number(target);
			if (isNaN(target)) return this.errorReply('Ids must be a number.');
			if (!SG.vouchers[user.userid] || SG.vouchers[user.userid].length === 0) return this.errorReply('You have no vouchers.');
			let index = -1;
			for (let i = 0; i < SG.vouchers[user.userid].length; i++) {
				if (SG.vouchers[user.userid][i].id === target) {
					index = i;
					break;
				}
			}
			if (index === -1) return this.errorReply('You do not own voucher id ' + target + '.');
			switch (SG.vouchers[user.userid][index].redeem()) {
			case true:
				//Successfuly redeemed
				delete SG.vouchers[user.userid][index];
				SG.vouchers[user.userid].splice(index, 1);
				writeFile();
				return true;
				//break;
			case false:
				console.error('Voucher ID ' + target + '\'s goodFor value was Unrecoginzed.');
				return this.errorReply('An error occured while redeeming. Contact an Upper Staff member.');
				//break;
			case 'expired':
				delete SG.vouchers[user.userid][index];
				SG.vouchers[user.userid].splice(index, 1);
				writeFile();
				return this.errorReply('This voucher is expired.');
				//break;
			case 'active':
				return this.sendReply('You already have an active ' + toId(SG.vouchers[user.userid][index].goodFor) + '.');
				//break;
			default:
				return this.errorReply('Error.');
			}
		},
		redeemhelp: ['/voucher redeem [id] - Redeem a voucher. Use /voucher list for information on what you get from a voucher and for the ID to use for redeeming.'],

		'': function (target, room, user, connection, cmd, message) {
			return this.parse('/help voucher');
		},
	},
	voucherhelp: ['/voucher - Accepts the following commands:',
		'/voucher give [user], [voucher], (item/amount) - Give a user a voucher. Valid vouchers are: currency, item, boostUno, boostTour, and boostGame. Valid items are Custom Symbol, Custom Avatar, Custom Title, Custom Icon, and Custom Color. Requires Server Event Leader, &, or ~.',
		'/voucher take [user], [id] - Take a user\'s voucher away. Requires Server Event Leader, &, or ~',
		'/voucher list (user) - List the vouchers of a user, requires Server Event Leader, &, or ~ for viewing vouchers for other users.',
		'/voucher redeem [id] - Redeem a voucher. Use /voucher list for information on what you get from a voucher and for the ID to use for redeeming.',
		'Coded by HoeenHero.',
	],
};
