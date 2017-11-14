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
 * 
 */

function pokemonCenter(game, id, action) {
	let player = Db.players.get(game.userid);
	switch (action) {
	case 'tryEnter':
		if (player.party.length < 1) return false;
		break;
	case 'enter':

		break;
	case 'exit':

		break;
	case 'heal':

		break;
	case 'pc':

		break;
	case 'trade':

		break;
	}
	return false;
}

exports.locations = {
	"welcome": {
		"id": "welcome",
		"name": "Welcome to SGgame!",
		"type": "",
		"code": 0,
		"zones": {
			"0": {
				"subTitle": "",
				"html": "<center><br/><br/><br/><br/><img src=\"http://i.imgur.com/tfYS6TN.png\"/></center>",
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
		"code": 1,
		"onFirstEnter": function (game) {
			game.queue.push('text|Welcome to the Main Island!');
		},
		"zones": {
			"0": {
				"subTitle": "",
				"html": "",
				"css": "background: url(https://i.imgur.com/LhQhKMj.png) no-repeat center center; background-size: 100% 100%;",
				"base": "",
				"onBuilding": function (game, id, action) {
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
				"html": "",
				"css": "background: url(https://i.imgur.com/qjiHqnW.png) no-repeat center center; background-size: 100% 100%;",
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
				"html": "",
				"css": "background: url(https://i.imgur.com/CUkNVM2.png) no-repeat center center; background-size: 100% 100%;",
				"base": "",
				"onFirstEnter": function (game) {
					game.queue.push('text|<b>Old Merchant</b>: Someone please help me! I\'ve been robbed!', 'text|<b>Old Merchant</b>: You there! Yes you, you have to help me! That thief took most of my goods. Go after him and get them back for me!', 'text|<b>Old Merchant</b>: Wait, you don\'t have a pokemon? Ok, you can use one of mine. Come over here and pick quickly. If you help me maybe I\'ll let you keep it too.');
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
					game.queue.push('text|' + msg + '|hide', 'text|<b>Old Merchant</b>: Ok, you have a pokemon. So go after that thief, theres no time to waste! He went to the west (&#8592;) towards the warehouses!|callback');
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
						game.queue.push('text|<b>Old Merchant</b>: Did you get my goods back?<br/>Yes! Those are my goods, give them back to me.', 'text|<b>Old Merchant</b>: Thanks you so much for getting these back, I thought I would never see them again.', 'text|<b>Old Merchant</b>: Hm, now what should I reward you with.<br/>It seems that ' + player.party[0].species + ' has bonded with you.');
						game.queue.push('text|<b>Old Merchant</b>: I think that ' + player.party[0].species + ' will do well with you.<br/>And take these as well, they will come in handy if you start traveling.', 'text|You obtained 20 pokeballs!<br/>You placed the pokeballs in the Pokeballs pocket.', 'text|<b>Old Merchant</b>: So where are you off to next? Are you going to train in the hills on this island?<br/>Or maybe try going to another island?', 'text|<b>Old Merchant</b>: Its up to you! If you ever need to heal, visit the pokemon center to the north. (&#8593;) You can buy more pokeballs or medicines here.', 'text|Good luck out there!');
						delete player.bag.keyitems.recoveredgoods;
						player.bag.pokeballs.pokeball = 20;
						Db.players.set(game.userid, player);
					}
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
				"html": "",
				"css": "background: url(https://i.imgur.com/mO3j75t.png) no-repeat center center; background-size: 100% 100%;",
				"base": "",
				"onBuilding": function (game, id, action) {
					// only one building here, no need to check id
					switch (action) {
					case 'enter':

						break;
					case 'exit':

						break;
					case 'travel':

						break;
					}
					return false;
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
				"html": "",
				"css": "background: url(https://i.imgur.com/HDNlLCr.png) no-repeat center center; background-size: 100% 100%;",
				"base": "",
				"onFirstEnter": function (game) {
					game.queue.push('text|<b>Thief</b>: No! The door to the warehouse is locked!<br/>I just hope I can get away before...', 'text|<b>Thief</b>: Yikes! I\'ve been found! Well, i\'m not going down without a fight.<br/>Bring it on!', 'callback');
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
					"left": null,
					"right": "mainisland|2",
					"down": null,
				},
			},
		},
	},
};
