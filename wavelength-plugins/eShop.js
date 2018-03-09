/******************************
    Default shop setup
    for wavelength.psim.us
    coded by HoeenHero
    -----------------------
    THIS IS NOT THE SAME AS
THE PRIVATE SHOP ON WAVELENGTH
******************************/
'use strict';

const fs = require('fs');
let allowThisShop = false; //Change to true to make these command work
let writeJSON = true;
WL.eShop = {};

function NewItem(name, desc, price, isSSB) {
	this.name = name;
	this.id = toId(name);
	this.desc = Chat.escapeHTML(desc);
	this.price = Number(price);
	this.isSSB = Boolean(isSSB);
}

function writeShop() {
	if (!writeJSON) return false; //Prevent corruptions
	fs.writeFile('config/eShop.json', JSON.stringify(WL.eShop), () => {});
}

function shopDisplay() {
	let output = '<div style="max-height:300px; width: 100%; overflow: scroll"><table style="border:2px solid #101ad1; border-radius: 5px; width: 100%;"><tr><th colspan="3" style="border: 2px solid #070e96; border-radius: 5px">Server Shop</th></tr>';
	for (let i in WL.eShop) {
		if (!WL.eShop[i]) continue;
		output += '<tr><td style="border: 2px solid #070e96; width: 20%; text-align: center"><button name="send" value="/eshop buy ' + WL.eShop[i].id + '">' + WL.eShop[i].name + '</button></td><td style="border: 2px solid #070e96; width: 70%; text-align: center">' + WL.eShop[i].desc + '</td><td style="border: 2px solid #070e96; width: 10%; text-align: center">' + WL.eShop[i].price + '</td></tr>';
	}
	output += '</table></div>';
	return output;
}

function toToken(item) {
	switch (item) {
	case 'customavatar':
	case 'avatar':
		return 'avatar';

	case 'globaldeclare':
	case 'declare':
		return 'declare';

	case 'customcolor':
	case 'color':
		return 'color';

	case 'customicon':
	case 'userlisticon':
	case 'icon':
		return 'icon';

	case 'customtitle':
	case 'profiletitle':
	case 'title':
		return 'title';

	case 'emoticon':
	case 'customemoticon':
	case 'customemote':
	case 'emote':
		return 'emote';

	case 'intro':
	case 'disableintro':
	case 'disableintroscroll':
		return 'disableintroscroll';

	case 'profilemusic':
	case 'music':
		return 'music';

	case 'profilebackground':
	case 'profilebg':
	case 'background':
	case 'bg':
		return 'bg';

	default:
		return false;
	}
}

try {
	fs.accessSync('config/eShop.json', fs.F_OK);
	let raw = JSON.parse(fs.readFileSync('config/eShop.json', 'utf8'));
	WL.eShop = raw;
} catch (e) {
	fs.writeFile('config/eShop.json', "{}", function (err) {
		if (err) {
			console.error('Error while loading eShop: ' + err);
			WL.eShop = {
				closed: true,
			};
			writeJSON = false;
		} else {
			console.log("config/eShop.json not found, creating a new one...");
		}
	});
}

//Usage notification
try {
	fs.accessSync('wavelength-plugins/shop-private.js', fs.F_OK);
	if (allowThisShop) console.warn('Since the normal shop is up the eShop has been disabled.');
	allowThisShop = false;
} catch (e) {
	if (!allowThisShop) console.warn('Unable to find the normal shop, activating the eShop...');
	allowThisShop = true;
}

exports.commands = {
	//shop: 'eshop', //Uncomment this if you want this to be able to be used using the /shop command
	eshop: {
		add: function (target, room, user, connection, cmd, message) {
			if (!this.can('editshop')) return false;
			if (!allowThisShop) return this.errorReply('This shop is closed');
			if (WL.eShop.closed) return this.sendReply('An error closed the shop.');
			target = target.split(',');
			if (!target[2]) return this.parse('/eshop help');
			if (WL.eShop[toId(target[0])]) return this.errorReply(target[0] + ' is already in the shop.');
			if (isNaN(Number(target[2]))) return this.parse('/eshop help');
			let isSSB = false;
			if (toId(target[0]) === 'shiny' || toId(target[0]) === 'ffacustomsymbol' || toId(target[0]) === 'customability' || toId(target[0]) === 'customitem' || toId(target[0]) === 'custommove') isSSB = true;
			WL.eShop[toId(target[0])] = new NewItem(target[0], target[1], target[2], isSSB);
			writeShop();
			return this.sendReply('The item ' + target[0] + ' was added.');
		},

		remove: function (target, room, user, connection, cmd, message) {
			if (!allowThisShop) return this.errorReply('This shop is closed');
			if (!this.can('editshop')) return false;
			if (WL.eShop.closed) return this.sendReply('An error closed the shop.');
			if (!target) return this.parse('/eshop help');
			if (!WL.eShop[toId(target)]) return this.errorReply(target + ' is not in the shop.');
			delete WL.eShop[toId(target)];
			writeShop();
			return this.sendReply('The item ' + target + ' was removed.');
		},

		buy: function (target, room, user, connection, cmd, message) {
			if (!allowThisShop) return this.errorReply('This shop is closed');
			if (!target) return this.parse('/eshop help buy');
			if (WL.eShop.closed) return this.sendReply('The shop is closed, come back later.');
			if (!WL.eShop[toId(target)]) return this.errorReply('Item ' + target + ' not found.');
			let item = WL.eShop[toId(target)];
			Economy.readMoney(user.userid, userMoney => {
				if (item.price > userMoney) return this.errorReply('You need ' + (item.price - userMoney) + ' more ' + ((item.price - userMoney) === 1 ? global.currencyName : global.currenyPlural) + ' to buy this.');
				if (item.isSSB && !WL.ssb[user.userid]) return this.sendReply('You need to run /ssb edit at least once before you can buy this.');
				if (item.isSSB) {
					//handle SSB pre-buy events
					switch (item.id) {
					case 'shiny':
						if (WL.ssb[user.userid].canShiny) return this.sendReply('You already own this.');
						break;
					case 'ffacustomsymbol':
						if (WL.ssb[user.userid].cSymbol) return this.sendReply('You already own this.');
						if (user.isStaff || user.group === '+') {
							//give free
							WL.ssb[user.userid].cSymbol = true;
							return this.sendReply('Because you have global auth you have been given this for free!');
						}
						break;
					case 'customitem':
						if (WL.ssb[user.userid].bought.cItem) return this.sendReply('You already own this.');
						break;
					case 'customability':
						if (WL.ssb[user.userid].bought.cAbility) return this.sendReply('You already own this.');
						break;
					case 'custommove':
						if (WL.ssb[user.userid].bought.cMove) return this.sendReply('You already own this.');
						break;
					default:
						//Unhandled
					}
				}
				Economy.writeMoney(user.userid, item.price * -1, () => {
					Economy.readMoney(user.userid, amount => {
						Economy.logTransaction(user.name + " has purchased a " + item.name + " for " + item.price + " " + (item.price === 1 ? global.currencyName : global.currencyPlural) + ". They now have " + amount + " " + (userMoney === 1 ? global.currencyName : global.currencyPlural));
						switch (item.id) {
						case 'customsymbol':
							user.canCustomSymbol = true;
							break;
						case 'shiny':
							WL.ssb[user.userid].canShiny = true;
							writeSSB();
							break;
						case 'ffacustomsymbol':
							WL.ssb[user.userid].cSymbol = true;
							writeSSB();
							break;
						case 'customitem':
							WL.ssb[user.userid].bought.cItem = true;
							writeSSB();
							break;
						case 'customability':
							WL.ssb[user.userid].bought.cAbility = true;
							writeSSB();
							break;
						case 'custommove':
							WL.ssb[user.userid].bought.cMove = true;
							writeSSB();
							break;
						default:
							if (!user.tokens) user.tokens = {};
							let tok = toToken(item.id);
							if (tok) {
								user.tokens[tok] = true;
							} else {
								WL.messageSeniorStaff(user.name + ' has purchased a ' + item.name + '.');
							}
						}
						user.sendTo(room, "|uhtmlchange|eshop" + user.userid + "|<div style='max-height:300px'><table style='border:2px solid #101ad1; border-radius: 5px'><tr><th colspan='3' style='border: 2px solid #070e96; border-radius: 5px'>Server Shop</th></tr><tr><td style='colspan: 3; border: 2px solid #070e96; border-radius: 5px'><center>You have purchased a " + item.name + ". " + (item.id === 'customsymbol' ? "You may now use /customsymbol [symbol] to change your symbol." : "Upper staff have been notified of your purchase and will contact you shortly.") + "</center></td></tr><tr><td colspan='3' style='text-align:center'><button name='send' value='/eshop reopen'>Return to Shop</button></td></tr></table>");
					});
				});
			});
		},

		help: function (target, room, user, connection, cmd, message) {
			let reply = '<b>Shop commands</b><br/>';
			reply += '/eshop - Load the shop screen.<br/>';
			reply += '/eshop buy [item] - Buy an item from the shop.<br/>';
			if (user.can('editshop')) {
				reply += '<b>Administrative shop commands:</b><br/>';
				reply += '/eshop add [item name], [description], [price], (is a SSBFFA item) - Adds a item to the shop.<br/>';
				reply += 'Valid SSBFFA items are: shiny, ffacustommove, customitem, customability, custommove.<br/>';
				reply += '/eshop remove [item] - removes a item from the shop.<br/>';
			}
			return this.sendReplyBox(reply);
		},

		reopen: '',
		'': function (target, room, user, connection, cmd, message) {
			if (!allowThisShop) return this.errorReply('This shop is closed');
			if (cmd === 'reopen') return user.sendTo(room, '|uhtmlchange|eshop' + user.userid + '|' + shopDisplay());
			return user.sendTo(room, '|uhtml|eshop' + user.userid + '|' + shopDisplay());
		},
	},
};
