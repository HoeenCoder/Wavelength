/**
 * PSGO Collectable Pokemon Cards for Wavelength
 * Programmed by HoeenHero, and Volco
 */

'use strict';

const CARDS_PER_PACK = 10;
let origCards = require('../config/cards.json');
let newCards = {};
const fs = require('fs');

try {
	newCards = JSON.parse(fs.readFileSync('config/extracards.json', 'utf8'));
} catch (e) {
	if (e.code !== 'ENOENT') throw e;
}

function saveCards() {
	//clone WL.cards
	let cloned = Object.assign({}, WL.cards);
	for (let u in cloned) {
		if (origCards[u]) delete cloned[u];
	}
	fs.writeFile('config/extracards.json', JSON.stringify(cloned), () => {});
}

WL.cards = Object.assign(newCards, origCards);

const PACK_MAKING_DATA = {
	Common: {chance: 50, limits: [4, 7]},
	Uncommon: {chance: 20, limits: [2, 4]},
	Rare: {chance: 15, limits: [1, 2]},
	'Ultra Rare': {chance: 9, limits: [0, 1]},
	Legendary: {chance: 5, limits: [0, 1]},
	Mythic: {chance: 1, limits: [0, 1]},
};
const packs = (function () {
	let packs2 = [];
	for (let card in WL.cards) {
		if (packs2.indexOf(WL.cards[card].pack) === -1) packs2.push(WL.cards[card].pack);
	}
	return packs2;
})();
const CARDSEARCH_MAX_VALUE = 500;

function toPackName(pack) {
	pack = toId(pack);
	for (let p = 0; p < packs.length; p++) {
		if (toId(packs[p]) === pack) return packs[p];
	}
	return pack;
}

function makePack(pack) {
	let out = [];
	let choices = {'Common': 0, 'Uncommon': 0, 'Rare': 0, 'Ultra Rare': 0, 'Legendary': 0, 'Mythic': 0};
	for (let rarity in PACK_MAKING_DATA) {
		if (PACK_MAKING_DATA[rarity].limits[0] > 0) {
			for (let i = 0; i < PACK_MAKING_DATA[rarity].limits[0]; i++) {
				if (out.length >= CARDS_PER_PACK) return out;
				out.push(genCard({rarity: rarity, pack: (pack ? pack : false)}));
				choices[rarity]++;
			}
		}
	}
	if (out.length >= CARDS_PER_PACK) return out;
	while (out.length < CARDS_PER_PACK) {
		let type = Math.ceil(Math.random() * 100), count = 0;
		for (let rarity in PACK_MAKING_DATA) {
			count += PACK_MAKING_DATA[rarity].chance;
			if (count >= type) {
				type = rarity;
				break;
			}
		}
		if (PACK_MAKING_DATA[type].limits[1] <= choices[type]) continue;
		if (['Ultra Rare', 'Legendary', 'Mythic'].includes(type)) {
			if (choices.hasTopThree) continue;
			choices.hasTopThree = true;
		}
		out.push(genCard({rarity: type, pack: (pack ? pack : false)}));
		choices[type]++;
	}
	return out;
}

function genCard(options) {
	if (options) {
		for (let key in options) {
			options[key] = toId(options[key]);
		}
	}
	let validCards = Object.keys(WL.cards).filter(id => {
		let card = WL.cards[id];
		if (options.rarity && toId(card.rarity) !== options.rarity) return false;
		if (options.pack && toId(card.pack) !== options.pack) return false;
		if (options.type && toId(card.type) !== options.type) return false;
		if (options.species && toId(card.species) !== options.species) return false;
		if (options.cardType && toId(card.cardType) !== options.cardType) return false;
		if (options.artist && toId(card.artist) !== options.artist) return false;
		return true;
	});
	if (!validCards.length) return WL.cards['primalclashshroomish']; // default
	return WL.cards[validCards[Math.floor(Math.random() * validCards.length)]];
}

function giveCard(name, card) {
	if (!WL.cards[card]) return false;
	let newCard = Object.assign({}, WL.cards[card]);
	let userid = toId(name);
	Db.cards.set(userid, Db.cards.get(userid, []).concat([newCard]));
}

function hasCard(userid, cardId) {
	let userCards = Db.cards.get(userid, []);
	for (let i = 0; i < userCards.length; i++) {
		let card = userCards[i];
		if (card.id === cardId) {
			return true;
		}
	}
	return false;
}

function takeCard(userid, cardId) {
	let userCards = Db.cards.get(userid, []);
	let idx = -1;
	for (let i = 0; i < userCards.length; i++) {
		let card = userCards[i];
		if (card.id === cardId) {
			idx = i;
			break;
		}
	}
	if (idx === -1) return false;
	userCards.splice(idx, 1);
	Db.cards.set(userid, userCards);
	return true;
}

exports.commands = {
	psgo: {
		display: 'card',
		card: function (target, room, user) {
			if (!this.runBroadcast()) return;
			if (!target) return this.parse(`/help psgo card`);
			if (!WL.cards[toId(target)]) return this.errorReply(`That card does not exist.`);
			let card = WL.cards[toId(target)];
			let display = `<div style="width: 49%; display: inline-block;"><img src="${card.image}" title="${card.id}" width="254" height="342"></div>`;
			display += `<div style="width: 49%; display: inline-block; float: right;">`;
			let colors = {Common: '#0066ff', Uncommon: '#008000', Rare: '#cc0000', "Ultra Rare": '#800080', Legendary: '#c0c0c0', Mythic: '#998200'};
			display += `<font style="font-size: 3em; font-weight: bold;">${card.name}</font><h5>(ID: ${card.id})</h5><font style="font-size: 2em; font-weight: bold; color: ${colors[card.rarity]};">${card.rarity}</font><br/><strong>Species</strong>: ${card.species}<br/><strong>Type</strong>: ${card.type}<br/>`;
			display += `<strong>Pack</strong>: ${card.pack}<br/><strong>Card Type</strong>: ${card.cardType}</div>`;

			return this.sendReplyBox(display);
		},
		cardhelp: ['/psgo card [card id] - Gives information on the card selected.'],

		showcase: function (target, room, user) {
			if (!this.runBroadcast()) return;
			if (!target) target = user.userid;
			const cards = Db.cards.get(toId(target), []);
			if (!cards.length) return this.sendReplyBox(`${toId(target)} has no cards.`);
			let cardsShown = 0;
			// done this way because of a glitch
			let broadcasting = this.broadcasting;
			const cardsMapping = cards.map(function (card) {
				if (broadcasting && cardsShown >= 100) {
					if (cardsShown === 100) {
						cardsShown++;
						return `<button name="send" value="/psgo showcase ${toId(target)}" style="border-radius: 12px; box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.2) inset;">Show all cards</button>`;
					}
					return '';
				}
				cardsShown++;
				return `<button name="send" value="/psgo card ${card.id}" style="border-radius: 12px; box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.2) inset;"><img src="${card.image}" width="100" title="${card.id}"></button>`;
			});
			this.sendReplyBox(`<div style="max-height: 300px; overflow-y: scroll;">${cardsMapping.join('')}</div><br><center><b>${WL.nameColor(toId(target), true)} has ${cards.length} cards</b></center>`);
		},
		showcasehelp: ['/psgo showcase (user) - Show all of the selected users cards.'],

		confirmtransfercard: 'transfercard',
		transfercard: function (target, room, user, connection, cmd) {
			if (!target) return this.parse(`/help psgo transfercard`);
			let targets = target.split(`,`).map(x => {
				return x.trim();
			});
			if (targets.length < 2) return this.parse(`/help psgo transfercard`);

			let targetUser = Users(toId(targets[0]));
			if (!targetUser) return this.errorReply(`The user "${targets[0]}" was not found.`);
			if (!targetUser.named) return this.errorReply(`Guests cannot be given cards.`);
			if (targetUser.userid === user.userid) return this.errorReply(`You cannot transfer cards to yourself.`);
			let card = toId(targets[1]);
			if (!WL.cards[card]) return this.errorReply(`That card does not exist.`);

			let canTransfer = hasCard(user.userid, card);
			if (!canTransfer) return user.popup(`You do note have that card.`);

			if (cmd !== 'confirmtransfercard') {
				return this.popupReply(`|html|<center>` +
					`<button class = "card-td button" name = "send" value = "/psgo confirmtransfercard ${targetUser.userid}, ${card}"` +
					`style = "outline: none; width: 200px; font-size: 11pt; padding: 10px; border-radius: 14px ; text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.4); box-shadow: 0px 0px 7px rgba(0, 0, 0, 0.4) inset; transition: all 0.2s;">` +
					`Confirm transfer to <br><b style = "color:${WL.hashColor(targetUser.userid)}; text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.8)">${Chat.escapeHTML(targetUser.name)}</b></button></center>`
				);
			}

			if (takeCard(user.userid, card)) {
				giveCard(targetUser, card);
			} else {
				// should never happen but just in case...
				return user.popup(`Transfer Failed, card could not be taken from you.`);
			}
			if (targetUser.connected) targetUser.popup(`|html|${Chat.escapeHTML(user.name)} has given you a card. <button class="button" name="send" value="/psgo card ${WL.cards[card].id}">View Card</button>`);
			user.popup(`You have successfully transfered ${WL.cards[card].id} to ${targetUser.name}.`);
		},
		transfercardhelp: ['/psgo transfercard [user], [card ID] - Transfer one of your cards to another user.'],

		cardsearchdisplay: 'search',
		cardsearch: 'search',
		searchchange: 'search',
		search: function (target, room, user, connection, cmd) {
			/*
			/psgo cardsearch Section:value, Section:value
			/psgo cardsearchdisplay card
			*/
			if (cmd !== 'cardsearchdisplay') user.lastPSGOSearch = target;
			let change = !!target || cmd === 'searchchange';
			let choices = {
				alphabetical: 'abcdefghijklmnopqrstuvwxyz'.split(''),
				rarity: ['Common', 'Uncommon', 'Rare', 'Ultra Rare', 'Legendary', 'Mythic'],
				pack: packs,
				type: ['Grass', 'Colorless', 'Fire', 'Water', 'Psychic', 'Darkness', 'Metal', 'Lightning', 'Fairy', 'Fighting', 'Dragon'],
				cardType: ['Basic', 'Stage 1', 'Stage 2', 'EX', 'MEGA', 'BREAK', 'GX', 'LEGEND', 'Restored', 'Level Up'],
			};
			let menu = `<div class="infobox"><center><strong>Cardsearch</strong></center><br/>`;
			if (cmd !== 'cardsearchdisplay') {
				target = target.split(',').map(x => {
					return x.trim();
				});
				for (let type in choices) {
					menu += `<details><summary>${type.substring(0, 1).toUpperCase() + type.substring(1)}</summary>`;
					for (let i = 0; i < choices[type].length; i++) {
						let newTarget = false;
						if (target.indexOf(type + ':' + choices[type][i]) > -1) {
							newTarget = target.slice(0);
							newTarget.splice(newTarget.indexOf(type + ':' + choices[type][i]), 1).join(',');
						}
						menu += `<button class="button" name="send" value="${newTarget ? `/psgo searchchange ${newTarget}" style="background: #4286f4"` : `/psgo searchchange ${target.join(',')}${change ? `,` : ``}${type}:${choices[type][i]}"`}>${choices[type][i]}</button>`;
					}
					menu += `</details>`;
				}
				if (toId(target.join(''))) {
					// Show found cards
					let reqs = {alphabetical: '', rarity: '', pack: '', type: '', cardType: ''};
					let invalidSearch = false;
					target.map(y => {
						if (invalidSearch) return y;
						y = y.split(':');
						if (choices[y[0]] && choices[y[0]].includes(y[1])) {
							if (reqs[y[0]]) {
								invalidSearch = true;
								return y.join(':');
							}
							reqs[y[0]] = y[1];
						}
						return y.join(':');
					});
					if (invalidSearch) {
						menu += `No cards were found. (Your search was invalid)</div>`;
						return user.sendTo(room, `${change ? `|uhtmlchange|cs${user.userid}|` : `|uhtml|cs${user.userid}|`}${menu}`);
					}
					menu += `<div style='max-height: 300px; overflow-y: scroll;'>`;
					let foundCard = 0;
					for (let card in WL.cards) {
						if ((foundCard + 1) > CARDSEARCH_MAX_VALUE) {
							menu += `</div><div style="color: red; font-weight: bold;">The maximum value of 500 cards is being shown.`;
							break;
						}
						let letter = WL.cards[card].name.substring(0, 1).toLowerCase();
						if (reqs.alphabetical && reqs.alphabetical !== letter) continue;
						if (reqs.rarity && reqs.rarity !== WL.cards[card].rarity) continue;
						if (reqs.pack && reqs.pack !== WL.cards[card].pack) continue;
						if (reqs.type && reqs.type !== WL.cards[card].type) continue;
						if (reqs.cardType && reqs.cardType !== WL.cards[card].cardType) continue;
						// Valid
						foundCard++;
						menu += `<button class="button" name="send" value="/psgo cardsearchdisplay ${WL.cards[card].id}"><img src="${WL.cards[card].image}" title="${WL.cards[card].id}" height="100" width="80"></button> `;
					}
					if (!foundCard) menu += `No cards were found.`;
					menu += `</div></div>`;
				}
			} else {
				menu += `<button class="button" name="send" value="${user.lastPSGOSearch ? `/psgo search ${user.lastPSGOSearch}` : `/psgo search`}">Back</button><br/>`;
				let card = WL.cards[toId(target)];
				if (!card) {
					menu += `The card "${toId(target)}" does not exist.</div>`;
					return user.sendTo(room, `${change ? `|uhtmlchange|cs${user.userid}|` : `|uhtml|cs${user.userid}|`}${menu}`);
				}
				menu += `<div style="width: 49%; display: inline-block;">`;
				menu += `<img src="${card.image}" title="${card.id}" width="254" height="342">`;
				menu += `</div><div style="width: 49%; display: inline-block; float: right;">`;
				let colors = {Common: '#0066ff', Uncommon: '#008000', Rare: '#cc0000', "Ultra Rare": '#800080', Legendary: '#c0c0c0', Mythic: '#998200'};
				menu += `<font style="font-size: 3em; font-weight: bold;">${card.name}</font><h5>(ID: ${card.id})</h5><font style="font-size: 2em; font-weight: bold; ${colors[card.rarity] ? `color: ${colors[card.rarity]};` : ``}">${card.rarity}</font><br/><strong>Species</strong>: ${card.species}<br/><strong>Type</strong>: ${card.type}<br/>`;
				menu += `<strong>Pack</strong>: ${card.pack}<br/><strong>Card Type</strong>: ${card.cardType}</div></div>`;
			}
			return user.sendTo(room, `${change ? `|uhtmlchange|cs${user.userid}|` : `|uhtml|cs${user.userid}|`}${menu}`);
		},
		cardsearchhelp: ['/psgo cardsearch - sends a display to search for a list of cards'],

		add: function (target, room, user) {
			if (!this.can('roomowner')) return false;
			if (!target) return this.parse(`/help psgo add`);
			let targets = target.split(`,`).map(x => {
				return x.trim();
			});

			if (!targets[5]) return this.parse(`/help psgo add`);
			let pack = targets[0];
			let rarity = targets[1];
			let species = targets[2];
			let type = targets[3];
			let image = targets[4];
			let cardType = targets[5];
			let id = toId(pack) + toId(species);
			if (WL.cards[id]) return this.errorReply(`The card ${id} already exists in the psgo database!`);
			newCards[id] = {
				id: id,
				name: species,
				pack: pack,
				type: type,
				image: image,
				cardType: cardType,
				species: species,
				rarity: rarity,
			};
			saveCards();
			WL.cards = Object.assign(newCards, origCards);
			return this.parse(`/psgo card ${id}`);
		},
		addhelp: ['/psgo add [pack], [rarity], [species], [type], [image], [card type] - adds a new card to the psgo database.'],

		delete: function (target, room, user) {
			if (!this.can('roomowner')) return false;
			if (!target) return this.parse(`/help psgo delete`);
			if (!newCards[toId(target)]) return this.errorReply(`The card "${toId(target)}" is not in psgo database or cannot be deleted.`);
			delete newCards[toId(target)];
			saveCards();
			WL.cards = Object.assign(newCards, origCards);
			return this.sendReply(`${toId(target)} has been removed from the card database!`);
		},
		deletehelp: ['/psgo delete [card id] - removes a card from the psgo database'],

		give: function (target, room, user) {
			if (!this.can('psgo')) return false;
			if (!target) return this.parse(`/help psgo give`);
			let targets = target.split(`,`).map(x => {
				return x.trim();
			});
			let targetUser = Users(toId(targets[0]));
			if (!targetUser) return this.errorReply(`The user "${targets[0]}" was not found.`);
			if (!targetUser.named) return this.errorReply(`Guests cannot be given cards.`);
			let card = WL.cards[toId(targets[1])];
			if (!card) return this.errorReply(`The card "${targets[1]}" does not exist.`);

			giveCard(targetUser.userid, card.id);
			if (targetUser.connected) targetUser.popup(`You have received ${card.name}.`);
			return this.sendReply(`${targetUser.name} has received the card ${card.id}.`);
		},
		givehelp: ['/psgo give [user], [card] - gives the user specified card'],

		confirmtakeall: 'take',
		takeall: 'take',
		take: function (target, room, user, connection, cmd) {
			if (!this.can('psgo')) return false;
			if (!target) return this.parse(`/help psgo take`);
			let targets = target.split(`,`);
			for (let u in targets) targets[u] = targets[u].trim();
			let targetUser = Users(toId(targets[0]));
			if (!targetUser) targetUser = {name: target[0], userid: toId(target[0]), connected: false};
			if (!Db.cards.get(targetUser.userid, []).length) return this.errorReply(`${targetUser.name} has no cards.`);
			if (cmd !== 'take') {
				if (cmd !== 'confirmtakeall') return this.sendReply(`WARNING: Are you sure you want to take ALL of ${targetUser.name}'s cards? If so use /psgo confirmtakeall ${targetUser.name}`);
				Db.cards.set(targetUser.userid, []);
				if (targetUser.connected) targetUser.popup(`You have lost all your cards.`);
				return this.sendReply(`All of ${targetUser.name}'s cards have been removed.`);
			}
			let card = WL.cards[toId(targets[1])];
			if (!card) return this.errorReply(`The card "${targets[1]}" does not exist.`);
			let success = takeCard(targetUser.userid, card.id);
			if (success) {
				if (targetUser.connected) targetUser.popup(`The card ${card.id} has been taken from you.`);
				return this.sendReply(`The card ${card.id} has been taken from ${targetUser.name}.`);
			} else {
				return this.sendReply(`${targetUser.name} does not have that card!`);
			}
		},
		takehelp: ['/psgo take [user], [card] - takes the card from the specified user. Requires: &, ~',
			'/psgo takeall [user] - takes all cards from the specified user. Requires: &, ~'],

		shop: {
			buy: function (target, room, user) {
				if (!toId(target)) return this.parse(`/help psgo shop buy`);
				target = toPackName(target);
				if (packs.indexOf(target) === -1) return this.parse(`/psgo shop`);
				let userMoney = Economy.readMoney(user.userid);
				if (userMoney < 5) return this.errorReply(`You need at least 5 ${currencyPlural} to buy a pack!`);
				Economy.writeMoney(user.userid, -5, () => {
					Economy.readMoney(user.userid, amount => {
						Economy.logTransaction(`${user.name} has purchased a ${target} pack for 5 ${currencyPlural}. They now have ${amount} ${(userMoney === 1 ? currencyName : currencyPlural)}`);
					});
				});
				Db.userpacks.set(user.userid, Db.userpacks.get(user.userid, []).concat([target]));
				return this.parse(`/psgo packs pending`);
			},
			buyhelp: ['/psgo shop buy [pack] - Cost 5 ' + currencyPlural + '  per pack.'],
			// All packs are added by default.
			'': 'display',
			display: function (target, room, user) {
				if (!this.runBroadcast()) return;
				let output = `<div style="max-height:200px; width:100%; overflow: scroll;">`;
				output += `<table><tr><center>Pack Shop</center></tr>`;
				for (let u in packs) {
					output += `<tr><td style="border: 2px solid #000000; width: 20%; text-align: center"><button class="button" name="send" value="/psgo shop buy ${packs[u]}">Buy Pack: ${packs[u]}</button></td><td style="border: 2px solid #000000; width: 20%; text-align: center"> Price: 5 ${currencyPlural}</td></tr>`;
				}
				output += `</table></div>`;
				return this.sendReplyBox(output);
			},
			displayhelp: ['/psgo shop display - Display the PSGO pack shop.'],
		},

		pack: 'packs',
		packs: {
			give: function (target, room, user) {
				if (!this.can('psgo')) return false;
				if (!target) return this.parse(`/help psgo packs give`);
				let targets = target.split(',').map(x => {
					return x.trim();
				});
				let targetUser = Users(toId(targets[0]));
				if (!targetUser) return this.errorReply(`The user "${targets[0]}" was not found.`);
				let pack = toPackName(targets[1]);
				if (!packs.includes(pack)) return this.errorReply(`The pack ${pack} does not exist!`);
				Db.userpacks.set(targetUser.userid, Db.userpacks.get(targetUser.userid, []).concat([pack]));
				if (targetUser.connected) targetUser.popup(`You have received a ${pack} pack.`);

				return this.sendReply(`A ${pack} pack has been given to ${targetUser.name}`);
			},
			givehelp: ['/psgo packs give [user], [pack] - Give a user a pack. Requires: &, ~'],

			confirmtakeall: 'take',
			takeall: 'take',
			take: function (target, room, user, connection, cmd) {
				if (!this.can('psgo')) return false;
				if (!target) return this.parse(`/help psgo packs take`);
				let targets = target.split(',').map(x => {
					return x.trim();
				});
				let targetUser = Users(toId(targets[0]));
				if (!targetUser) targetUser = {name: target[0], userid: toId(target[0]), connected: false};
				let pack = toPackName(targets[1]);
				if (!Db.userpacks.get(targetUser.userid, []).length) return this.errorReply(`${targetUser.name} has no packs.`);
				if (!toId(pack) && cmd !== 'take') {
					if (cmd !== 'confirmtakeall') return this.sendReply(`WARNING: Are you sure you want to take ALL of ${targetUser.name}'s packs? If so use /psgo packs confirmtakeall ${targetUser.name}`);
					Db.userpacks.set(targetUser.userid, []);
					if (targetUser.connected) targetUser.popup(`You have lost all of your packs.`);
					return this.sendReply(`${targetUser.name}'s packs have been removed.`);
				}
				if (!packs[pack]) return this.errorReply(`${pack} is not a valid pack.`);
				let index = Db.userpacks.get(targetUser.userid, []).indexOf(pack);
				if (index === -1) return this.sendReply(`${targetUser.name} does not have any ${pack} packs.`);
				let array = Db.userpacks.get(targetUser.userid, []);
				if (cmd === 'takeall') {
					for (let i = 0; i < array.length; i++) {
						if (array[i] === pack) {
							array.splice(i, 1);
							i--;
						}
					}
				} else {
					array.splice(index, 1);
				}
				Db.userpacks.set(targetUser.userid, array);
				if (targetUser.connected) targetUser.popup(`You have lost ${(cmd === 'takeall' ? `all your ${pack} packs.` : `1 ${pack} pack.`)}`);
				return this.sendReply(`${cmd === 'takeall' ? `All ${pack} packs` : `One ${pack} pack`} has been taken from ${targetUser.userid}.`);
			},
			takehelp: ['/psgo packs take [user], [pack] - Take a pack from a user. Requires &, ~',
				'/psgo packs takeall [user], (pack) - Take all packs from a user. If the type of pack is not specified, all packs will be removed. Requires: &, ~'],

			open: function (target, room, user) {
				if (!this.runBroadcast()) return;
				if (!target) return this.parse(`/help psgo packs open`);
				target = toPackName(target);
				if (!Db.userpacks.has(user.userid)) return this.errorReply(`You do not have any packs.`);
				let index = Db.userpacks.get(user.userid, []).indexOf(target);
				if (index === -1) return this.errorReply(`You do not have the pack ${target}.`);
				let array = Db.userpacks.get(user.userid, []);
				array.splice(index, 1);
				Db.userpacks.set(user.userid, array);
				let cards = makePack(target);
				let results = [];
				for (let u in cards) {
					results.push(`<button class="button" name="send" value="/psgo card ${cards[u].id}"><img src="${cards[u].image}" title="${cards[u].id} height="100" width="80"/></button>`);
				}
				Db.cards.set(user.userid, Db.cards.get(user.userid, []).concat(cards));
				return this.sendReplyBox(`You have received the following cards from the ${target} pack:<br/>${results.join('')}`);
			},
			openhelp: ['/psgo packs open [pack name] - Open a pack you own.'],

			unopened: 'holding',
			pending: 'holding',
			stored: 'holding',
			holding: function (target, room, user) {
				if (!Db.userpacks.get(user.userid, []).length) return this.errorReply(`You do not have any packs!`);
				let usedPacks = {};
				let userPacks = Db.userpacks.get(user.userid, []);
				for (let i = 0; i < userPacks.length; i++) {
					if (!usedPacks[userPacks[i]]) {
						usedPacks[userPacks[i]] = 1;
					} else {
						usedPacks[userPacks[i]]++;
					}
				}
				return this.sendReplyBox(`<strong>Your unopened packs</strong>:<br/>` + Object.keys(usedPacks).map(pack => {
					return `<button class="button" name="send" value="/psgo packs open ${pack}">Open ${pack} Pack</button> (${usedPacks[pack]} Remaining.)`;
				}).join('<br/>'));
			},

			list: function (target, room, user) {
				if (!this.runBroadcast()) return;
				this.sendReplyBox(`<div style="max-height: 300px; overflow-y: scroll;"><strong>PSGO Packs</strong><br/><br/>${packs.join(`<br/>`)}</div>`);
			},
			listhelp: ['/psgo packs list - displays all psgo packs'],
		},

		ladder: function (target, room, user) {
			if (!this.runBroadcast()) return;
			let values = {Common: 1, Uncommon: 3, Rare: 6, "Ultra Rare": 10, Legendary: 15, Mythic: 20};
			let keys = Db.cards.keys().map(name => {
				let points = 0;
				let userCards = Db.cards.get(name, []);
				if (userCards.length) {
					for (let c = 0; c < userCards.length; c++) {
						points += values[userCards[c].rarity] || 1;
					}
				}
				return {name: name, points: points};
			});
			keys = keys.slice(0, 500).sort(function (a, b) { return b.points - a.points; });
			return this.sendReplyBox(rankLadder('PSGO Card Ladder', 'Points', keys, 'points'));
		},
		ladderhelp: ['/psgo ladder - show the PSGO card point ladder.'],

		nuke: 'reset',
		reset: function (target, room, user) {
			if (!this.can('lockdown')) return;
			if (!toId(target) || !user.psgoResetCode) {
				let chars = `abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890!@#$%^&*`.split(``);
				let out = ``;
				for (let i = 0; i < 10; i++) {
					out += chars[Math.floor(Math.random() * chars.length)];
				}
				user.psgoResetCode = out;
				return this.sendReplyBox(`<h1 style="color: red">WARNING</h1>You are about to remove <strong>ALL users cards AND PACKS</strong><br/>If you are <strong>100%</strong> sure you want to do this, please use:<br/><br/>/psgo reset ${user.psgoResetCode}<br/><h3 style="color: red">Once done, this is irreversible please be 100% sure!</h3>`);
			}
			if (user.psgoResetCode !== target.trim()) return this.parse(`/psgo reset`);

			let cardKeys = Db.cards.keys();
			for (let i = 0; i < cardKeys.length; i++) {
				Db.cards.remove(cardKeys[i]);
			}
			let packKeys = Db.userpacks.keys();
			for (let i = 0; i < packKeys.length; i++) {
				Db.userpacks.remove(packKeys[i]);
			}
			Rooms.rooms.forEach(r => {
				r.addRaw(`<div class="broadcast-red"><strong>The PSGO database was reset</strong><br/>You no longer have any cards or packs.`).update();
			});
		},
		resethelp: ['/psgo reset - Wipe the PSGO database (Take ALL user\'s cards AND packs). Requires: ~'],

		'': 'help',
		help: function (target, room, user) {
			if (!this.runBroadcast()) return;
			return this.parse('/help psgo');
		},
	},
	psgohelp: ['/psgo card [card id] - Gives information on the card selected.',
		'/psgo showcase (user) - Show all of the selected users cards.',
		'/psgo transfercard [user], [card ID] - Transfer one of your cards to another user.',
		'/psgo add [pack], [rarity], [species], [type], [image], [card type] - adds a new card to the psgo database.',
		'/psgo delete [card id] - removes a card from the psgo database',
		'/psgo cardsearch - sends a display to search for a list of cards.',
		'/psgo give [user], [card] - gives the user specified card. Requires &, ~',
		'/psgo take [user], [card] - takes the card from the specified user. Requires: &, ~',
		'/psgo takeall [user] - takes all cards from the specified user. Requires: &, ~',
		'/psgo shop buy [pack] - Cost 5 ' + global.currencyPlural + '  per pack.',
		'/psgo shop display - shops pack shop.<br />',
		'/psgo packs give [user], [pack] - gives a user a  pack. Requires &, ~',
		'/psgo packs take [user], [pack] - Take a pack from a user. Requires &, ~',
		'/psgo packs takeall [user], (pack) - Take all packs from a user. If the type of pack is not specified, all packs will be removed. Requires: &, ~',
		'/psgo packs open [pack name] - Open a pack you own.',
		'/psgo packs holding - displays psgo packs you currently hold.',
		'/psgo packs list - displays all psgo packs.',
		'/psgo ladder - show the PSGO card point ladder.',
		'/psgo reset - Wipe the PSGO database (Take ALL users cards AND packs). Requires: ~'],
	// Shortcut commands
	showcase: function (target, room, user) {
		if (!this.runBroadcast()) return;
		Chat.commands.psgo.showcase.call(this, ...[target, room, user]);
	},
	showcasehelp: ['/psgo showcase (user) - Show all of the selected users cards.'],
	cardsearch: function (target, room, user) {
		this.parse(`/psgo cardsearch`);
	},
	cardsearchhelp: ['/psgo cardsearch - sends a display to search for a list of cards'],
	cardladder: function (target, room, user) {
		if (!this.runBroadcast()) return;
		Chat.commands.psgo.ladder.call(this, ...[target, room, user]);
	},
	cardladderhelp: ['/psgo ladder - show the PSGO card point ladder.'],
	checkpacks: function (target, room, user) {
		this.parse(`/psgo packs holding`);
	},
	checkpackshelp: ['/psgo packs holding - displays psgo packs you currently hold.'],
	openpack: function (target, room, user) {
		if (!this.runBroadcast()) return;
		Chat.commands.psgo.packs.open.call(this, ...[target, room, user]);
	},
	openpackhelp: ['/psgo packs open [pack name] - Open a pack you own.'],
};
