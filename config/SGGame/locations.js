'use strict';

/**
 * SGgame - Locations
 * This file has data on all the locations in SGgame.
 *
 * Events:
 * Events that are triggered by interacting with a location, or zone.
 * onFirstEnter(game) - Triggers the first time the player enters this location or zone.
 * onTryEnter(game) - Triggers before the player enters a location, useful when theres temporary blocks.
 * onEnter(game) - Triggers whenever the player enters this location or zone.
 * onBuilding(game, buildingId, action) - Triggered by interaction with a building with the `/sggame building` command.
 * buildingId is the id of the building, and action is the action the user is trying to take.
 * wild pokemon are handled in encounters.txt
 *
 */

// Common buildings throught the game

// Heals your pokemon, has a PC, where trading takes place
function pokemonCenter(game, id, action) {
	let player = Db.players.get(game.userid);
	let out = '<div style="display: inline-block; position: absolute; bottom: 0; overflow: hidden; border: 0.2em solid #000; border-radius: 5px; width: 99%; height: 98%; color: #000; background-color: rgba(255, 255, 255, 0.8);"><center><h2>Pokemon Center</h2>Pardon the empty screen while we work on SGgame.<br/>Use the buttons bellow to interact.';
	let options = {heal: '/sggame building ' + id + ', heal', pc: '/sggame pc'};
	switch (action) {
	case 'enter':
		if (player.party.length < 1) {
			game.queue.unshift(`text|You can't enter a pokemon center without pokemon!`);
			game.update(...game.next());
			return false;
		}
		game.curPane = id;
		break;
	case 'exit':
		game.curPane = null;
		return game.update(game.buildCSS(), game.buildMap(), game.buildBase());
	case 'heal':
		for (let i = 0; i < player.party.length; i++) {
			if (player.party[i].hp) delete player.party[i].hp;
			if (player.party[i].status) delete player.party[i].status;
		}
		Db.players.set(game.userid, player);
		delete options.heal;
		out += '<h3>Your party was healed!</h3>';
		break;
	/*case 'trade':

		break;*/
	}
	out += '</center></div>';
	return game.update(game.buildCSS(), game.buildMap() + out, game.buildBase('pokemoncenter', options));
}

// Used to travel to different islands
function marina(game, id, action, area, confirm) {
	let player = Db.players.get(game.userid);
	let out = `<div style="display: inline-block; position: absolute; bottom: 0; overflow: hidden; border: 0.2em solid #000; border-radius: 5px; width: 99%; height: 98%; color: #000; background-color: rgba(255, 255, 255, 0.8);"><center><h3>Marina - Travel to where?</h3></center>`;
	out += `<div style="height: 91%; border-top: 0.2em solid black; overflow: scroll; display: block;"><div><b style="float: left">Island</b><b style="float: right"></b></div><br>`;
	for (let i in player.bag.keyitems) {
		let item = WL.getItem(i);
		if (!item || !item.ticket || item.ticket === game.location) continue;
		if (item.ticket === area) {
			out += `<button style="background: #0B9; border: none; border-top: 0.1em solid #001; width: 100%;"><span style="float: left">${WL.locationData[item.ticket].name}</span><span style="float: right">${WL.locationData[item.ticket].shortDesc || 'Selected'}</span></button>`;
		} else {
			out += `<button name="send" value="/sggame building ${id}, travel, ${item.ticket}" style="background: none; border: none; border-top: 0.1em solid #001; width: 100%;"><span style="float: left">${WL.locationData[item.ticket].name}</span><span style="float: right">${WL.locationData[item.ticket].shortDesc || 'Click to travel here'}</span></button>`;
		}
	}
	out += '</div></div>';
	let options = {travel: ''};
	switch (action) {
	case 'enter':
		if (player.stage === 0) {
			game.queue.unshift(`text|The marina isn't open right now.<br>Try coming back later.`);
			game.update(...game.next());
			return false;
		}
		game.curPane = id;
		break;
	case 'exit':
		game.curPane = null;
		return game.update(game.buildCSS(), game.buildMap(), game.buildBase());
	case 'travel':
		if (!area || !WL.locationData[area]) break;
		if (confirm) {
			game.curPane = null;
			game.warp(`${area}|${WL.locationData[area].entry}`);
			return;
		}
		options.travel = `/sggame building ${id}, travel, ${area}, confirm`;
		break;
	}
	return game.update(game.buildCSS(), game.buildMap() + out, game.buildBase('marina', options));
}

// Shop
function shop(game, id, action, item = null, amount = 1, shopkeeper = "Pokemart Clerk") {
	let player = Db.players.get(game.userid);
	let shop = WL.getShop(player.location, player.zone, id);
	if (!shop) throw new Error(`Can't find shop data for ${player.location}|${player.zone} when trying to load a shop.`);
	let options = {id: id};
	if (item && !(item in shop)) {
		item = null;
		amount = 1;
	}
	if (item) item = WL.getItem(item);
	if (amount) {
		amount = parseInt(amount);
		if (!amount) amount = 1;
	}
	switch (action) {
	case 'enter':
		if (player.stage === 0) {
			game.queue.unshift(`text|${shopkeeper === "Old Merchant" ? `<b>Old Merchant</b>: I have nothing to sell you right now because it was all stolen!<br/>Please hurry and get my good back!` : `Strange... the shop appears to be closed.`}.`);
			game.update(...game.next());
			return false;
		}
		game.curPane = id;
		break;
	case 'exit':
		game.curPane = null;
		return game.update(game.buildCSS(), game.buildMap(), game.buildBase());
	case 'select':
		let price = shop[item.id][0];
		if (player.poke >= price && (!player.bag[item.slot][item.id] || !shop[item.id][1])) options.buy1 = `/sggame building ${id}, buy, ${item.id}, 1`;
		if (player.poke >= price * 5 && !shop[item.id][1]) options.buy5 = `/sggame building ${id}, buy, ${item.id}, 5`;
		if (player.poke >= price * 10 && !shop[item.id][1]) options.buy10 = `/sggame building ${id}, buy, ${item.id}, 10`;
		break;
	case 'buy':
		let cost = shop[item.id][0] * amount;
		if (player.poke < cost) break;
		player.poke -= cost;
		if (!player.bag[item.slot][item.id]) player.bag[item.slot][item.id] = 0;
		player.bag[item.slot][item.id] += amount;
		Db.players.set(game.userid, player);
		item = null;
		break;
	}
	let out = `<div style="display: inline-block; position: absolute; bottom: 0; overflow: hidden; border: 0.2em solid #000; border-radius: 5px; width: 99%; height: 98%; color: #000; background-color: rgba(255, 255, 255, 0.8);"><center><h3>${WL.locationData[player.location].zones[player.zone].buildings[id]}</h3></center>`;
	out += `<div style="height: 91%; border-top: 0.2em solid black; overflow: scroll; display: block;"><div><b style="float: left">Item</b><b style="float: right">Cost</b></div><br>`;
	let keys = Object.keys(shop);
	for (let i = 0; i < keys.length; i++) {
		let curItem = WL.getItem(keys[i]);
		if (!curItem) throw new Error(`Invalid item in shop: ${keys[i]} location: ${player.location}|${player.zone}`);
		if (item && curItem.id === item.id) {
			out += `<button style="background: #0B9; border: none; border-top: 0.1em solid #001; width: 100%;"><span style="float: left">${curItem.name}</span><span style="float: right">${shop[keys[i]][0]}</span></button>`;
		} else {
			out += `<button name="send" value="/sggame building ${id}, select, ${curItem.id}" style="background: none; border: none; border-top: 0.1em solid #001; width: 100%;"><span style="float: left">${curItem.name}</span><span style="float: right">${shop[keys[i]][0]}</span></button>`;
		}
	}
	out += '</div></div>';
	return game.update(game.buildCSS(), game.buildMap() + out, game.buildBase('shop', options));
}

exports.locations = {
	"welcome": {
		"id": "welcome",
		"name": "Welcome to SGgame!",
		"type": "",
		"entry": "0",
		"code": 0,
		"zones": {
			"0": {
				"subTitle": "",
				"id": "welcome|0",
				"html": "<center><br/><br/><br/><br/><img src=\"https://play.pokemonshowdown.com/sprites/trainers/hoeenhero.png\"/></center>",
				"css": "",
				"base": "",
				"exits": {
					"up": null,
					"left": null,
					"right": null,
					"down": null,
				},
			},
		},
	},
	"mainisland": {
		"id": "mainisland",
		"name": "Main Island",
		"type": "",
		"entry": "3",
		"code": 1,
		"zones": {
			"0": {
				"subTitle": "",
				"id": "mainisland|0",
				"html": "",
				"css": "background: url(https://s8.postimg.cc/7g0qdu5h1/mainisland-0.png) no-repeat center center; background-size: 100% 100%;",
				"base": "",
				"buildings": {
					"pokemoncenter": "Pokemon Center",
				},
				"onBuilding": function (game, id, action) {
					if (id !== 'pokemoncenter') return;
					return pokemonCenter(game, id, action);
				},
				"exits": {
					"up": null,
					"left": null,
					"right": null,
					"down": "mainisland|1",
				},
			},
			"1": {
				"subTitle": "",
				"id": "mainisland|1",
				"html": "",
				"css": "background: url(https://s8.postimg.cc/ydunfkxtx/mainisland-1.png) no-repeat center center; background-size: 100% 100%;",
				"base": "",
				"exits": {
					"up": "mainisland|0",
					"left": null,
					"right": null,
					"down": "mainisland|2",
				},
			},
			"2": {
				"subTitle": "",
				"id": "mainisland|2",
				"html": "",
				"css": "background: url(https://s8.postimg.cc/evzzzno1h/mainisland-2.png) no-repeat center center; background-size: 100% 100%;",
				"base": "",
				"buildings": {
					"oldmerchant": "Old Merchant's Shop",
					"raregoods": "Rare Goods",
				},
				"onFirstEnter": function (game) {
					game.queue.push('text|<b>Old Merchant</b>: Someone please help me! I\'ve been robbed!', 'text|<b>Old Merchant</b>: You there! Yes you, you have to help me! That thief took most of my goods. Go after him and get them back for me!', 'text|<b>Old Merchant</b>: Wait, you don\'t have a Pokemon? Okay, you can use one of mine. Come over here and pick quickly. If you help me maybe I\'ll let you keep it too.');
					let msg = '';
					let starters = [
						['Bulbasaur', 'Chikorita', 'Treecko', 'Turtwig', 'Snivy', 'Chespin', 'Rowlet'],
						['Charmander', 'Cyndaquil', 'Torchic', 'Chimchar', 'Tepig', 'Fennekin', 'Litten'],
						['Squirtle', 'Totodile', 'Mudkip', 'Piplup', 'Oshawott', 'Froakie', 'Popplio'],
						['Pikachu'],
						['Eevee'],
					];
					for (let i = 0; i < starters.length; i++) {
						let color = (i === 0 ? 'green' : (i === 1 ? 'red' : (i === 2 ? 'blue' : (i === 3 ? '#E5DA2A' : '#B08257'))));
						for (let j = 0; j < starters[i].length; j++) {
							msg += '<button name="send" value="/pickstarter ' + starters[i][j] + '" style="border: none; background: none; color: ' + color + '"><u>' + starters[i][j] + '</u></button> ';
						}
						msg += (i + 1 < starters.length ? '<br/>' : '');
					}
					game.queueAction = 'pickStarter';
					game.queue.push('text|' + msg + '|hide', 'text|<b>Old Merchant</b>: Okay, you have a Pokemon. So go after that thief, there\'s no time to waste! He went to the west (&#8592;) towards the warehouses!|callback');
					game.callback = function (user) {
						//<center><!--mutebutton--><button name="send" value="/console sound" class="button">' + (user.console.muted ? 'Unmute' : 'Mute') + '</button><!--endmute--> <button name="send" value="/console shift" class="button">Shift</button> <button class="button" name="send" value="/sggame pokemon">Pokemon</button> <button class="button" name="send" value="/sggame bag">Bag</button> <button class="button" name="send" value="/sggame pc">PC Boxes</button> <button name="send" value="/sggame battle" class="button">Battle!</button> <button name="send" value="/resetalpha" class="button">Reset</button> <button class="button" name="send" value="/console kill">Power</button>
						user.console.defaultBottomHTML = '<center><!--mutebutton--><button name="send" value="/console sound" class="button">' + (user.console.muted ? 'Unmute' : 'Mute') + '</button><!--endmute--> <button name="send" value="/console shift" class="button">Shift</button> <button class="button" name="send" value="/sggame pokemon">Pokemon</button> <button class="button" name="send" value="/sggame bag">Bag</button> <button name="send" value="/resetalpha" class="button">Reset</button> <button class="button" name="send" value="/console kill">Power</button>';
						user.console.callback = null;
						user.console.queueAction = null;
						user.console.lastNextAction = null;
					};
				},
				"onEnter": function (game) {
					let player = Db.players.get(game.userid);
					if (player.bag.keyitems.recoveredgoods) {
						game.queue.push('text|<b>Old Merchant</b>: Did you get my goods back?<br/>Yes! Those are my goods, give them back to me.', 'text|<b>Old Merchant</b>: Thank you so much for getting these back, I thought I would never see them again.', 'text|<b>Old Merchant</b>: Hm, now what should I reward you with.<br/>It seems that ' + player.party[0].species + ' has bonded with you.');
						game.queue.push('text|<b>Old Merchant</b>: I think that ' + player.party[0].species + ' will do well with you.<br/>And take these as well, they will come in handy if you start traveling.', 'text|You obtained 20 Pokeballs!<br/>You placed the Pokeballs in the Pokeballs pocket.', 'text|<b>Old Merchant</b>: So where are you off to next? Are you going to train in the hills on this island?<br/>Or maybe try going to another island?', 'text|<b>Old Merchant</b>: It\'s up to you! If you ever need to heal, visit the Pokemon Center to the north. (&#8593;) You can buy more Pokeballs or medicines here.', 'text|Good luck out there!');
						delete player.bag.keyitems.recoveredgoods;
						player.bag.pokeballs.pokeball = 20;
						player.stage++;
						Db.players.set(game.userid, player);
					}
				},
				"onBuilding": function (game, id, action, item, amount) {
					if (!['oldmerchant', 'raregoods'].includes(id)) return;
					return shop(game, id, action, item, amount, id === 'pokemart' ? "Old Merchant" : "Merchant");
				},
				"exits": {
					"up": "mainisland|1",
					"left": "mainisland|4",
					"right": "mainisland|3",
					"down": null,
				},
			},
			"3": {
				"subTitle": "Marina",
				"id": "mainisland|3",
				"html": "",
				"css": "background: url(https://s8.postimg.cc/lz7vf9e1h/mainisland-3.png) no-repeat center center; background-size: 100% 100%;",
				"base": "",
				"buildings": {
					"marina": "Marina",
				},
				"onBuilding": function (game, id, action, area, confirm) {
					if (id !== 'marina') return;
					return marina(game, id, action, area, confirm);
				},
				"exits": {
					"up": null,
					"left": "mainisland|2",
					"right": null,
					"down": null,
				},
			},
			"4": {
				"subTitle": "Warehouses",
				"id": "mainisland|4",
				"html": "",
				"css": "background: url(https://s8.postimg.cc/jhw4801ut/mainisland-4.png) no-repeat center center; background-size: 100% 100%;",
				"base": "",
				"onFirstEnter": function (game) {
					game.queue.push('text|<b>Thief</b>: No! The door to the warehouse is locked!<br/>I just hope I can get away before...', 'text|<b>Thief</b>: Yikes! I\'ve been found! Well, I\'m not going down without a fight.<br/>Bring it on!', 'callback');
					game.callback = function (user) {
						if (!Users('sgserver')) WL.makeCOM();
						Rooms.createBattle('gen7trainerbattlealpha', {
							p1: Users('sgserver'),
							p2: user,
							p1team: 'purrloin|||0|growl|Quirky||M|29,18,19,0,27,4||5|70,,pokeball,125,',
							p2team: Dex.packTeam(Db.players.get(user.userid).party),
							rated: false,
						});
						if (Rooms.global.lockdown) {
							user.popup('|html|<b style="color: #090">HoeenHero</b>: Oops! The server is restarting and you cant battle now.<br/>I\'ll scale your game back so you can battle the thief after the restart.');
							let player = Db.players.get(user.userid);
							delete player.visited[user.console.location][user.console.zone];
							Db.players.set(user.userid, player);
							user.console.warp('mainisland|2');
						} else {
							user.console.afterBattle = function (user, won) {
								if (!user.console) {
									let player = Db.players.get(user.userid);
									delete player.visited[user.console.location][user.console.zone];
									Db.players.set(user.userid, player);
									return;
								}
								if (won) {
									user.console.queue.push('text|<b>Thief</b>: No! How could I lose! Aargh! Fine, take the stuff I stole back!<br/>I\'m out of here!', 'text|Obtained the Recovered Goods!<br/>The Recovered Goods were placed in the Key Items pocket.');
								} else {
									user.console.queue.push('text|<b>Thief</b>: Yes! I knew I would win! Now to make my escape!', 'text|...<br/>He forgot to take the stolen goods with him.<br/>May as well return them to the Old Merchant.', 'text|Obtained the Recovered Goods!<br/>The Recovered Goods were placed in the Key Items pocket.');
								}
								let player = Db.players.get(user.userid);
								player.bag.keyitems.recoveredgoods = 1;
								user.console.update(...user.console.next());
								delete user.console.afterBattle;
							};
						}
					};
				},
				"exits": {
					"up": null,
					"left": "mainisland|5",
					"right": "mainisland|2",
					"down": null,
				},
			},
			"5": {
				"subTitle": "",
				"id": "mainisland|5",
				"html": "",
				"css": "background: url(https://s33.postimg.cc/fgxeabn67/Main_5.png) no-repeat center center; background-size: 100% 100%;",
				"base": "",
				"onTryEnter": function (game) {
					if (Db.players.get(game.userid).stage < 1) {
						game.queue.unshift(`text|<b>Worker</b>: Some pylons fell over and are blocking the path ahead.<br/>We should have them cleaned up soon.`);
						game.update(...game.next());
						return false;
					}
					return true;
				},
				"exits": {
					"up": null,
					"left": "mainisland|6",
					"right": "mainisland|4",
					"down": null,
				},
			},
			"6": {
				"subTitle": "",
				"id": "mainisland|6",
				"html": "",
				"css": "background: url(https://s33.postimg.cc/fgxeacxgv/Main_6.png) no-repeat center center; background-size: 100% 100%;",
				"base": "",
				"exits": {
					"up": "mainisland|7",
					"left": null,
					"right": "mainisland|5",
					"down": null,
				},
			},
			"7": {
				"subTitle": "",
				"id": "mainisland|7",
				"html": "",
				"css": "background: url(https://s33.postimg.cc/k2tiipqpr/Main_7_maybe_2.png) no-repeat center center; background-size: 100% 100%;",
				"base": "",
				"onFirstEnter": function (game) {
					game.queue.push('text|<b>?</b>: Looking for a good place to train and battle?', 'text|<b>?</b>: Well your in the right place!<br>Click the Battle button to challenge a trainer.');
				},
				"exits": {
					"up": null,
					"left": null,
					"right": null,
					"down": "mainisland|6",
				},
			},
		},
	},
};
