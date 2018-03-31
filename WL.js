'use strict';

const FS = require("./lib/fs.js");
let https = require('https');
const Autolinker = require('autolinker');

let regdateCache = {};

exports.WL = {
	nameColor: function (name, bold, userGroup) {
		let userGroupSymbol = Users.usergroups[toId(name)] ? '<b><font color=#948A88>' + Users.usergroups[toId(name)].substr(0, 1) + '</font></b>' : "";
		return (userGroup ? userGroupSymbol : "") + (bold ? "<b>" : "") + "<font color=" + WL.hashColor(name) + ">" + (Users(name) && Users(name).connected && Users.getExact(name) ? Chat.escapeHTML(Users.getExact(name).name) : Chat.escapeHTML(name)) + "</font>" + (bold ? "</b>" : "");
	},
	// usage: WL.nameColor(user.name, true) for bold OR WL.nameColor(user.name, false) for non-bolded.

	messageSeniorStaff: function (message, pmName, from) {
		pmName = (pmName ? pmName : '~Wavelength Server');
		from = (from ? ' (PM from ' + from + ')' : '');
		Users.users.forEach(curUser => {
			if (curUser.can('roomowner')) {
				curUser.send('|pm|' + pmName + '|' + curUser.getIdentity() + '|' + message + from);
			}
		});
	},
	// format: WL.messageSeniorStaff('message', 'person')
	//
	// usage: WL.messageSeniorStaff('Mystifi is a confirmed user and they were banned from a public room. Assess the situation immediately.', '~Server')
	//
	// this makes a PM from ~Server stating the message

	regdate: function (target, callback) {
		target = toId(target);
		if (regdateCache[target]) return callback(regdateCache[target]);
		let req = https.get('https://pokemonshowdown.com/users/' + target + '.json', res => {
			let data = '';
			res.on('data', chunk => {
				data += chunk;
			}).on('end', () => {
				try {
					data = JSON.parse(data);
				} catch (e) {
					return callback(false);
				}
				let date = data['registertime'];
				if (date !== 0 && date.toString().length < 13) {
					while (date.toString().length < 13) {
						date = Number(date.toString() + '0');
					}
				}
				if (date !== 0) {
					regdateCache[target] = date;
					saveRegdateCache();
				}
				callback((date === 0 ? false : date));
			});
		});
		req.end();
	},

	/* eslint-disable no-useless-escape */
	parseMessage: function (message) {
		if (message.substr(0, 5) === "/html") {
			message = message.substr(5);
			message = message.replace(/\_\_([^< ](?:[^<]*?[^< ])?)\_\_(?![^<]*?<\/a)/g, '<i>$1</i>'); // italics
			message = message.replace(/\*\*([^< ](?:[^<]*?[^< ])?)\*\*/g, '<b>$1</b>'); // bold
			message = message.replace(/\~\~([^< ](?:[^<]*?[^< ])?)\~\~/g, '<strike>$1</strike>'); // strikethrough
			message = message.replace(/&lt;&lt;([a-z0-9-]+)&gt;&gt;/g, '&laquo;<a href="/$1" target="_blank">$1</a>&raquo;'); // <<roomid>>
			message = Autolinker.link(message.replace(/&#x2f;/g, '/'), {stripPrefix: false, phone: false, twitter: false});
			return message;
		}
		message = Chat.escapeHTML(message).replace(/&#x2f;/g, '/');
		message = message.replace(/\_\_([^< ](?:[^<]*?[^< ])?)\_\_(?![^<]*?<\/a)/g, '<i>$1</i>'); // italics
		message = message.replace(/\*\*([^< ](?:[^<]*?[^< ])?)\*\*/g, '<b>$1</b>'); // bold
		message = message.replace(/\~\~([^< ](?:[^<]*?[^< ])?)\~\~/g, '<strike>$1</strike>'); // strikethrough
		message = message.replace(/&lt;&lt;([a-z0-9-]+)&gt;&gt;/g, '&laquo;<a href="/$1" target="_blank">$1</a>&raquo;'); // <<roomid>>
		message = Autolinker.link(message, {stripPrefix: false, phone: false, twitter: false});
		return message;
	},
	/* eslint-enable no-useless-escape */

	randomString: function (length) {
		return Math.round((Math.pow(36, length + 1) - Math.random() * Math.pow(36, length))).toString(36).slice(1);
	},

	reloadCSS: function () {
		const cssPath = 'wavelength'; // This should be the server id if Config.serverid doesn't exist. Ex: 'serverid'
		let req = https.get('https://play.pokemonshowdown.com/customcss.php?server=' + (Config.serverid || cssPath), () => {});
		req.end();
	},

	//Daily Rewards System for Wavelength by Lord Haji
	giveDailyReward: function (user) {
		if (!user || !user.named) return false;
		let reward = 0, time = Date.now();
		for (let ip in user.ips) {
			let cur = Db.DailyBonus.get(ip);
			if (!cur) {
				cur = [1, Date.now()];
				Db.DailyBonus.set(ip, cur);
			}
			if (cur[0] < reward || !reward) reward = cur[0];
			if (cur[1] < time) time = cur[1];
		}
		if (Date.now() - time < 86400000) return;
		reward++;
		if (reward > 7 || Date.now() - time > 172800000) reward = 1;
		// Loop again to set the ips values
		for (let ip in user.ips) {
			Db.DailyBonus.set(ip, [reward, Date.now()]);
		}
		Economy.writeMoney(user.userid, reward);
		user.send('|popup||wide||html| <center><u><b><font size="3">Wavelength Daily Bonus</font></b></u><br>You have been awarded ' + reward + ' Stardust.<br>' + showDailyRewardAni(reward) + '<br>Because you have connected to the server for the past ' + (reward === 1 ? 'Day' : reward + ' Days') + '.</center>');
	},
	makeCOM: function () {
		if (Users('sgserver')) return false; // Already exists!
		let user = new Users.User({user: false, send: function () {}, inRooms: new Set(), worker: {send: function () {}}, socketid: false, ip: '127.0.0.1', protocal: '', autojoin: '', isCOM: true}); // Fake connection object, fill it with whats needed to prevent crashes
		user.connected = false; // Technically isnt connected
		user.avatar = 167;
		user.wildTeams = {}; // Object to store data from wild pokemon battles.
		user.trainerTeams = {}; // Object to store data from trainer battles.
		user.forceRename('SG Server', true); // I have this name registed for use here. - HoeenHero
		return user;
	},
	makeWildPokemon: function (location, lvlBase, exact) {
		//TODO: locations
		if (!lvlBase) lvlBase = 10;
		if (this.wildPokemon.length <= 0) this.loadPokemon();
		let pokemon = this.wildPokemon[Math.floor(Math.random() * this.wildPokemon.length)];
		if (exact && Dex.getTemplate(exact.species).exists) pokemon = exact.species;
		pokemon = Dex.getTemplate(pokemon);
		let baseSpecies = pokemon;
		let forme = null;
		if ((pokemon.otherForms && pokemon.id !== 'unown') && (!exact || !exact.species)) {
			let formes = pokemon.otherForms.concat(pokemon.baseSpecies).map(x => { return toId(x); });
			forme = formes[Math.floor(Math.random() * formes.length)];
			pokemon = Dex.getTemplate(forme);
		} else if ((pokemon.otherForms && pokemon.id !== 'unown') && exact.species && exact.allowOtherFormes) {
			let formes = pokemon.otherForms.concat(pokemon.baseSpecies).map(x => { return toId(x); });
			forme = formes[Math.floor(Math.random() * formes.length)];
			pokemon = Dex.getTemplate(forme);
		}
		if (pokemon.baseSpecies) baseSpecies = Dex.getTemplate(pokemon.baseSpecies);
		if (!pokemon || !pokemon.exists) {
			console.log('Error on pokemon generation: Invalid pokemon: ' + pokemon.id);
			return "ERROR!|missingno|||hiddenpower|Serious|||0,0,0,0,0,0||1|0,,pokeball,0,hoeenhero";
		}
		let lvl = Math.round(Math.random() * 10) + (lvlBase - 5); //-5 levels -> +5 levels. TODO base on location
		if (exact && exact.level && !isNaN(parseInt(exact.level))) lvl = exact.level;
		lvl = (lvl < 1 ? lvl = 1 : (lvl > 100 ? lvl = 100 : lvl));
		if (lvl < pokemon.evoLevel) {
			let depth = 0;
			do {
				pokemon = Dex.getTemplate(pokemon.prevo);
				if (!pokemon || !pokemon.exists) {
					// Shouldn't happen
					console.log('Error on pokemon generation while de-evolving: Invalid pokemon: ' + pokemon.id);
					return "ERROR!|missingno|||hiddenpower|Serious|||0,0,0,0,0,0||1|0,,pokeball,0,hoeenhero";
				}
				depth++;
			} while (lvl < pokemon.evoLevel && depth < 5);
			if (depth >= 5 && lvl < pokemon.evoLevel) {
				console.log('Error on pokemon generation: MAXIMUM CALL STACK SIZE EXCEEDED');
				return "ERROR!|missingno|||hiddenpower|Serious|||0,0,0,0,0,0||1|0,,pokeball,0,hoeenhero";
			}
		}
		let data = (forme ? toId(forme) : pokemon.id) + "|||";
		let ability = Math.round(Math.random());
		if (ability === 1 && !pokemon.abilities[1]) ability = 0; //TODO hidden abilities?
		if (exact && exact.ability) {
			if (isNaN(parseInt(exact.ability))) {
				for (let ab in pokemon.abilities) {
					if (toId(pokemon.abilties[ab]) === toId(exact.ability)) {
						ability = ab;
						break;
					}
				}
				if (toId(exact.ability) === 'h' && pokemon.abilites.H) ability = 'H';
			} else {
				if (pokemon.abilities[parseInt(exact.ability)]) ability = parseInt(exact.ability);
			}
		}
		data += ability + "|";
		let moves = "";
		let raw = [];
		let used = [];
		if (!pokemon.learnset && baseSpecies.learnset) {
			pokemon.learnset = baseSpecies.learnset;
		} else if (!pokemon.learnset) {
			console.log('Error on pokemon generation: No learn set found for: ' + pokemon.id + ' or for its base species: ' + baseSpecies.id);
			return "ERROR!|missingno|||hiddenpower|Serious|||0,0,0,0,0,0||1|0,,pokeball,0,hoeenhero";
		}
		for (let move in pokemon.learnset) {
			for (let learned in pokemon.learnset[move]) {
				if (pokemon.learnset[move][learned].substr(0, 2) === '7L' && parseInt(pokemon.learnset[move][learned].substr(2)) <= lvl && !used[move]) {
					raw.push({move: move, lvl: pokemon.learnset[move][learned]});
					used.push(move);
				}
			}
		}
		raw = raw.sort(function (a, b) { return parseInt(a.lvl.substr(2)) - parseInt(b.lvl.substr(2)); });
		for (let i = 0; i < 4; i++) {
			if (raw.length === 0) break;
			let target = raw.pop();
			if (moves.split(',').indexOf(target.move) > -1) {
				// Duplicate move
				i--;
				continue;
			}
			moves += target.move + ((raw.length === 0 || i === 3) ? "" : ",");
		}
		data += moves + "|";
		let plus = ['atk', 'def', 'spa', 'spd', 'spe'][Math.floor(Math.random() * 5)], minus = ['atk', 'def', 'spa', 'spd', 'spe'][Math.floor(Math.random() * 5)];
		if (plus === minus) {
			while (plus === minus) {
				minus = ['atk', 'def', 'spa', 'spd', 'spe'][Math.floor(Math.random() * 5)];
			}
		}
		if (Math.ceil(Math.random() * 10) > 3) {
			for (let key in Dex.data.Natures) {
				if (Dex.data.Natures[key].plus === plus && Dex.data.Natures[key].minus === minus) {
					data += Dex.data.Natures[key].name + "||";
					break;
				}
			}
		} else {
			data += ['Bashful', 'Docile', 'Hardy', 'Quirky', 'Serious'][Math.floor(Math.random() * 5)] + "||";
		}
		let gender = Math.random();
		if (pokemon.gender) {
			gender = pokemon.gender;
		} else {
			if (pokemon.genderRatio.M > gender) {
				gender = "M";
			} else if (pokemon.genderRatio.M !== 0 && pokemon.genderRatio.F !== 0) {
				gender = "F";
			} else {
				gender = "";
			}
		}
		data += gender + "|";
		if ((pokemon.eggGroups[0] === 'Undiscovered' || pokemon.species === 'Manaphy') && !pokemon.prevo && !pokemon.nfe && pokemon.species !== 'Unown' && pokemon.baseSpecies !== 'Pikachu') {
			// 3 Perfect Ivs required
			let left = 3;
			for (let i = 0; i < 6; i++) {
				let iv = Math.round(Math.random() * 31);
				if (iv !== 31 && left) {
					iv = (Math.random() > 0.5 ? 31 : iv);
					if (i + left >= 6) iv = 31;
				}
				if (iv === 31 & left > 0) left--;
				data += iv + (i === 5 ? "|" : ",");
			}
		} else {
			for (let i = 0; i < 6; i++) {
				data += Math.round(Math.random() * 31) + (i === 5 ? "|" : ",");
			}
		}
		if (Math.ceil(Math.random() * 4096) === 1 || (exact && exact.shiny)) {
			data += "S|";
		} else {
			data += "|";
		}
		data += lvl + "|70"; // TODO base happiness values by species
		data += ",,pokeball," + this.calcExp(pokemon.species, lvl) + "," + (exact && exact.ot ? exact.ot : '');
		if (data.split('|').length !== 12) {
			console.log('Error on pokemon generation: Corrupted data: ' + data);
			return "ERROR!|missingno|||hiddenpower|Serious|||0,0,0,0,0,0||1|0,,pokeball,0,hoeenhero";
		}
		return data;
		//return "|lotad|||astonish,growl,absorb|Hasty|||30,21,21,28,29,19||6|0";
	},
	makeComTeam: function (average, count) {
		if (!average || isNaN(parseInt(average))) average = 10;
		if (typeof average !== 'number') average = parseInt(average);
		if (!count || isNaN(parseInt(count))) count = 1;
		if (typeof count !== 'number') count = parseInt(count);
		let numPokes = Math.ceil(Math.random() * 6) || 2;
		average += ((count - numPokes) * 3);
		let team = '';
		for (numPokes; numPokes > 0; numPokes--) {
			team += this.makeWildPokemon(null, average) + (numPokes === 1 ? '' : ']');
		}
		return team;
	},
	teamAverage: function (team) {
		if (typeof team === "string") team = Dex.fastUnpackTeam(team);
		let avrg = 0;
		for (let i = 0; i < team.length; i++) {
			avrg += team[i].level;
		}
		avrg = avrg / team.length;
		return Math.round(avrg);
	},
	gameData: JSON.parse(FS('config/SGGame/pokemon.json').readIfExistsSync()),
	calcExp: function (pokemon, n) {
		pokemon = toId(pokemon);
		let type = this.getEXPType(pokemon);
		let EXP;
		switch (type) {
		case 'erratic':
			if (n <= 50) EXP = ((Math.pow(n, 3) * (100 - n))) / 50;
			if (50 <= n && n <= 68) EXP = ((Math.pow(n, 3) * (150 - n))) / 100;
			if (68 <= n && n <= 98) EXP = ((Math.pow(n, 3) * ((1911 - (10 * n)) / 3))) / 500;
			if (98 <= n && n <= 100) EXP = ((Math.pow(n, 3) * (160 - n))) / 100;
			break;
		case 'fast':
			EXP = (4 * Math.pow(n, 3)) / 5;
			break;
		case 'mediumfast':
			EXP = Math.pow(n, 3);
			break;
		case 'mediumslow':
			EXP = ((6 / 5) * Math.pow(n, 3)) - (15 * Math.pow(n, 2)) + (100 * n) - 140;
			break;
		case 'slow':
			EXP = (5 * Math.pow(n, 3)) / 4;
			break;
		case 'fluctuating':
			if (n <= 15) EXP = Math.pow(n, 3) * ((((n + 1) / 3) + 24) / 50);
			if (15 <= n && n <= 36) EXP = Math.pow(n, 3) * ((n + 14) / 50);
			if (36 <= n && n <= 100) EXP = Math.pow(n, 3) * (((n / 2) + 32) / 50);
			break;
		}
		if (EXP < 0) return 0; // Experience underflow glitch
		return EXP;
	},
	getEXPType: function (pokemon) {
		pokemon = toId(pokemon);
		if (!this.gameData[pokemon]) throw new Error(pokemon + " not found in pokemon.json");
		if (this.gameData[pokemon].expType) return this.gameData[pokemon].expType;
		if (!this.gameData[pokemon].inherit) throw new Error('Unable to find expType for ' + pokemon);
		let curData = null;
		for (let depth = 0; depth < 8; depth++) {
			if (curData && !curData.inherit) throw new Error('Unable to find expType for ' + pokemon);
			curData = this.gameData[(this.gameData[(curData ? curData.id : pokemon)].inherit)];
			if (curData.expType) return curData.expType;
		}
		// If we reach here its an error
		throw new Error('MAXIMUM STACK LIMIT EXCEEDED');
	},
	getEvoData: function (pokemon) {
		pokemon = (pokemon.species ? toId(pokemon.species) : pokemon);
		if (!this.gameData[toId(pokemon)]) throw new Error(pokemon + " not found in pokemon.json");
		if (this.gameData[toId(pokemon)].evolution) return this.gameData[toId(pokemon)].evolution;
		if (!this.gameData[toId(pokemon)].inherit) throw new Error('Unable to find evolution data for ' + pokemon);
		let curData = null;
		for (let depth = 0; depth < 8; depth++) {
			if (curData && !curData.inherit) throw new Error('Unable to find evolution data for ' + pokemon);
			curData = this.gameData[(this.gameData[(curData ? curData.id : toId(pokemon))].inherit)];
			if (curData.evolution) return curData.evolution;
		}
		// If we reach here its an error
		throw new Error('MAXIMUM STACK LIMIT EXCEEDED');
	},
	/**
	 * Checks if a pokemon can evolve
	 * @param {Object} pokemon, a pokemon party object
	 * @param {String} trigger, "level", "item", or "trade", what is triggering this check?
	 * @param {Object} options, extra data for the evolution including location, trade partner, item used, ect
	 * @return {String} the pokemon it should evolve into OR {Boolean} false
	 */
	canEvolve: function (pokemon, trigger, userid, options) {
		trigger = toId(trigger);
		if (!['level', 'item', 'trade'].includes(trigger)) return false;
		if (!pokemon || typeof pokemon !== 'object' || !pokemon.species) return false;
		if (!toId(userid)) return false;
		if (pokemon.item === 'everstone') return false;
		userid = toId(userid);
		let evoData = this.getEvoData(pokemon);
		if (!evoData || !evoData.evolvesTo) return false;
		let evos = evoData.evolvesTo.split('|');
		let time = new Date();
		time = ((time.getHours() >= 6 && time.getHours() < 18) ? "day" : "night");
		let valid = [];
		for (let e = 0; e < evos.length; e++) {
			evoData = this.getEvoData(evos[e]);
			if (evoData.trigger !== trigger) continue;
			if (evoData.level && pokemon.level < evoData.level) continue;
			if (evoData.happiness && pokemon.happiness < evoData.happiness) continue;
			if (evoData.time && evoData.time !== time) continue;
			if (evoData.hold && pokemon.item !== evoData.hold) continue;
			if (evoData.move || evoData.moveType) {
				let moves = (evoData.moves ? evoData.moves.split('|') : null);
				let types = (evoData.moveType ? evoData.moveType.split('|') : null);
				for (let m = 0; m < pokemon.moves.length; m++) {
					if (moves && moves.length && moves.indexOf(pokemon.moves[m]) > -1) moves.splice(moves.indexOf(pokemon.moves[m]), 1);
					let type = Dex.getMove(pokemon.moves[m]).type;
					if (types && types.length && types.indexOf(type) > -1) types.splice(types.indexOf(type), 1);
				}
				if (moves && moves.length) continue;
				if (types && types.length) continue;
			}
			if (evoData.location && (!options || options.location !== evoData.location)) continue;
			if (evoData.item && (!options || options.item !== evoData.item)) continue;
			if (evoData.gender && pokemon.gender !== evoData.gender) continue;
			if (evoData.partner && (!options || options.partner !== evoData.partner)) continue;
			if (evoData.stat) {
				let stats = [];
				let symbol = (evoData.stat.search('>') > -1 ? '>' : '=');
				let toCheck = evoData.stat.split(symbol);
				let base = Dex.getTemplate(pokemon.species);
				if (!base.baseStats) base = Dex.getTemplate(base.baseSpecies).baseStats;
				if (!pokemon.evs) pokemon.evs = {hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0};
				for (let i = 0; i < toCheck.length; i++) {
					if (toCheck[i] === 'hp') {
						if (pokemon.species === 'shedinja') stats[i] = 1;
						stats[i] = (((2 * base.hp + pokemon.ivs.hp + (pokemon.evs.hp / 4)) * pokemon.level) / 100) + pokemon.level + 10;
					} else {
						let n = Dex.getNature(pokemon.nature);
						if (n.plus === toCheck[i]) {
							n = 1.1;
						} else if (n.minus === toCheck[i]) {
							n = 0.9;
						} else {
							n = 1;
						}
						stats[i] = (((((2 * base[toCheck[i]] + pokemon.ivs[toCheck[i]] + (pokemon.evs[toCheck[i]] / 4)) * pokemon.level) / 100) + 5) * n);
					}
				}
				if (symbol === '>' && stats[0] < stats[1]) continue;
				if (symbol === '=' && stats[0] !== stats[1]) continue;
			}
			if (evoData.special) {
				// Special rules for special evolutions
				if (pokemon.species === 'nincada') {
					let player = Db.players.get(toId(userid));
					if (player.party.length >= 5 || !player.bag.pokeballs.pokeball) continue;
				} else if (pokemon.species === 'mantyke') {
					let player = Db.players.get(toId(userid));
					let rem = false;
					for (let p = 0; p < player.party.length; p++) {
						if (player.party[p].species === 'remoraid') {
							rem = true;
							break;
						}
					}
					if (!rem) continue;
				} else if (pokemon.species === 'rockruff') {
					let now = new Date().getHours();
					if (now !== 17 || pokemon.ability !== 'Own Tempo') continue;
				}
			}
			valid.push(evos[e]);
		}
		if (valid.length > 1) {
			// Prioritze evoluitons for pokemon like eevee
			let priority, depth = 0;
			switch (pokemon.species) {
			case 'eevee':
				// location > fairy + affection (SGgame uses friendship as affection) > friendship
				priority = ['espeon', 'umbreon', 'sylveon', 'leafeon', 'glaceon', 'flareon', 'jolteon', 'vaporeon'];
				do {
					if (valid.indexOf(priority[depth]) > -1) valid.splice(valid.indexOf(priority[depth]));
					depth++;
				} while (valid.length > 1 && depth < priority.length);
				break;
			case 'nincada':
				// Falls through due to special rule
				break;
			case 'cosmoem':
				// ATM: 50/50 for each forme
				valid = valid.splice(Math.floor(Math.random() * valid.length), 1);
				break;
			default:
				console.log('Multiple valid evolutions detected and unhandled. Base: ' + pokemon.species + '. Valid Evos: ' + valid.join('|'));
			}
		}
		return (valid.length ? valid.join('|') : false); // Incase of shedinja return the two evos joined with "|"
	},
	/**
	 * Get the required evolution item for the prevo to evolve into the provided pokemon
	 * @param {String} pokemon
	 * @return {String|Boolean} item or false
	 */
	getEvoItem: function (pokemon) {
		let data = this.getEvoData(pokemon);
		if (!data) return false;
		if (data.hold) return data.hold;
		if (data.item) return data.item;
		return false;
	},
	itemData: JSON.parse(FS('config/SGGame/items.json').readIfExistsSync()),
	getItem: function (id) {
		id = toId(id);
		if (!this.itemData[id]) return false;
		return this.itemData[id];
	},
	getNewMoves: function (pokemon, olvl, lvl, curMoves, slot, evo) {
		if (!pokemon || olvl >= lvl) return [];
		if (typeof pokemon === 'string') pokemon = Dex.getTemplate(pokemon);
		if (!pokemon.exists) throw new Error('Can\'t get new moves for non-existant pokemon "' + pokemon.id + '"');
		let moves = [];
		let baseSpecies = null;
		if (pokemon.baseSpecies) baseSpecies = Dex.getTemplate(pokemon.baseSpecies);
		if (!pokemon.learnset && baseSpecies && baseSpecies.learnset) {
			pokemon.learnset = baseSpecies.learnset;
		}
		let used = [];
		for (let move in pokemon.learnset) {
			for (let learned in pokemon.learnset[move]) {
				if (pokemon.learnset[move][learned].substr(0, 2) === '7L' && parseInt(pokemon.learnset[move][learned].substr(2)) > olvl && parseInt(pokemon.learnset[move][learned].substr(2)) <= lvl && !used[move] && curMoves.indexOf(move) === -1) {
					moves.push("learn|" + slot + "|" + move);
					used.push(move);
				}
			}
		}
		if (evo) {
			let eMoves = this.getEvoData(pokemon).evoMove;
			if (!eMoves) return moves;
			eMoves = eMoves.split('|');
			for (let i = 0; i < eMoves.length; i++) {
				if (used.indexOf(eMoves[i]) > -1 || curMoves.indexOf(eMoves[i]) > -1) continue;
				moves.push("learn|" + slot + "|" + eMoves[i]);
			}
		}
		return moves;
	},
	// Ripped from client, modified for SGgame
	getPokemonIcon: function (pokemon) {
		let base = pokemon;
		pokemon = Dex.getTemplate(pokemon);
		let resourcePrefix = "//play.pokemonshowdown.com/";
		let num = 0;
		if (base === 'pokeball') {
			return 'background:transparent url(' + resourcePrefix + 'sprites/smicons-pokeball-sheet.png) no-repeat scroll -0px 4px';
		} else if (base === 'pokeball-statused') {
			return 'background:transparent url(' + resourcePrefix + 'sprites/smicons-pokeball-sheet.png) no-repeat scroll -40px 4px';
		} else if (base === 'pokeball-none') {
			return 'background:transparent url(' + resourcePrefix + 'sprites/smicons-pokeball-sheet.png) no-repeat scroll -80px 4px';
		}
		let id = toId(base);
		//if (pokemon && pokemon.species) id = toId(pokemon.species);
		if (pokemon && pokemon.volatiles && pokemon.volatiles.formechange && !pokemon.volatiles.transform) id = toId(pokemon.volatiles.formechange[2]);
		if (pokemon && pokemon.num !== undefined) num = pokemon.num;
		if (num < 0) num = 0;
		if (num > 807) num = 0;
		let altNums = {
			egg: 816 + 1,
			pikachubelle: 816 + 2,
			pikachulibre: 816 + 3,
			pikachuphd: 816 + 4,
			pikachupopstar: 816 + 5,
			pikachurockstar: 816 + 6,
			pikachucosplay: 816 + 7,
			// unown gap
			castformrainy: 816 + 35,
			castformsnowy: 816 + 36,
			castformsunny: 816 + 37,
			deoxysattack: 816 + 38,
			deoxysdefense: 816 + 39,
			deoxysspeed: 816 + 40,
			burmysandy: 816 + 41,
			burmytrash: 816 + 42,
			wormadamsandy: 816 + 43,
			wormadamtrash: 816 + 44,
			cherrimsunshine: 816 + 45,
			shelloseast: 816 + 46,
			gastrodoneast: 816 + 47,
			rotomfan: 816 + 48,
			rotomfrost: 816 + 49,
			rotomheat: 816 + 50,
			rotommow: 816 + 51,
			rotomwash: 816 + 52,
			giratinaorigin: 816 + 53,
			shayminsky: 816 + 54,
			unfezantf: 816 + 55,
			basculinbluestriped: 816 + 56,
			darmanitanzen: 816 + 57,
			deerlingautumn: 816 + 58,
			deerlingsummer: 816 + 59,
			deerlingwinter: 816 + 60,
			sawsbuckautumn: 816 + 61,
			sawsbucksummer: 816 + 62,
			sawsbuckwinter: 816 + 63,
			frillishf: 816 + 64,
			jellicentf: 816 + 65,
			tornadustherian: 816 + 66,
			thundurustherian: 816 + 67,
			landorustherian: 816 + 68,
			kyuremblack: 816 + 69,
			kyuremwhite: 816 + 70,
			keldeoresolute: 816 + 71,
			meloettapirouette: 816 + 72,
			vivillonarchipelago: 816 + 73,
			vivilloncontinental: 816 + 74,
			vivillonelegant: 816 + 75,
			vivillonfancy: 816 + 76,
			vivillongarden: 816 + 77,
			vivillonhighplains: 816 + 78,
			vivillonicysnow: 816 + 79,
			vivillonjungle: 816 + 80,
			vivillonmarine: 816 + 81,
			vivillonmodern: 816 + 82,
			vivillonmonsoon: 816 + 83,
			vivillonocean: 816 + 84,
			vivillonpokeball: 816 + 85,
			vivillonpolar: 816 + 86,
			vivillonriver: 816 + 87,
			vivillonsandstorm: 816 + 88,
			vivillonsavanna: 816 + 89,
			vivillonsun: 816 + 90,
			vivillontundra: 816 + 91,
			pyroarf: 816 + 92,
			flabebeblue: 816 + 93,
			flabebeorange: 816 + 94,
			flabebewhite: 816 + 95,
			flabebeyellow: 816 + 96,
			floetteblue: 816 + 97,
			floetteeternal: 816 + 98,
			floetteorange: 816 + 99,
			floettewhite: 816 + 100,
			floetteyellow: 816 + 101,
			florgesblue: 816 + 102,
			florgesorange: 816 + 103,
			florgeswhite: 816 + 104,
			florgesyellow: 816 + 105,
			// furfrou gap
			meowsticf: 816 + 115,
			aegislashblade: 816 + 116,
			hoopaunbound: 816 + 118,
			rattataalola: 816 + 119,
			raticatealola: 816 + 120,
			raichualola: 816 + 121,
			sandshrewalola: 816 + 122,
			sandslashalola: 816 + 123,
			vulpixalola: 816 + 124,
			ninetalesalola: 816 + 125,
			diglettalola: 816 + 126,
			dugtrioalola: 816 + 127,
			meowthalola: 816 + 128,
			persianalola: 816 + 129,
			geodudealola: 816 + 130,
			graveleralola: 816 + 131,
			golemalola: 816 + 132,
			grimeralola: 816 + 133,
			mukalola: 816 + 134,
			exeggutoralola: 816 + 135,
			marowakalola: 816 + 136,
			greninjaash: 816 + 137,
			zygarde10: 816 + 138,
			zygardecomplete: 816 + 139,
			oricoriopompom: 816 + 140,
			oricoriopau: 816 + 141,
			oricoriosensu: 816 + 142,
			lycanrocmidnight: 816 + 143,
			wishiwashischool: 816 + 144,
			miniormeteor: 816 + 145,
			miniororange: 816 + 146,
			minioryellow: 816 + 147,
			miniorgreen: 816 + 148,
			miniorblue: 816 + 149,
			miniorviolet: 816 + 150,
			miniorindigo: 816 + 151,
			magearnaoriginal: 816 + 152,
			pikachuoriginal: 816 + 153,
			pikachuhoenn: 816 + 154,
			pikachusinnoh: 816 + 155,
			pikachuunova: 816 + 156,
			pikachukalos: 816 + 157,
			pikachualola: 816 + 158,
			pikachupartner: 816 + 159,
			lycanrocdusk: 816 + 160,
			necrozmaduskmane: 816 + 161,
			necrozmadawnwings: 816 + 162,
			necrozmaultra: 816 + 163,

			venusaurmega: 984 + 0,
			charizardmegax: 984 + 1,
			charizardmegay: 984 + 2,
			blastoisemega: 984 + 3,
			beedrillmega: 984 + 4,
			pidgeotmega: 984 + 5,
			alakazammega: 984 + 6,
			slowbromega: 984 + 7,
			gengarmega: 984 + 8,
			kangaskhanmega: 984 + 9,
			pinsirmega: 984 + 10,
			gyaradosmega: 984 + 11,
			aerodactylmega: 984 + 12,
			mewtwomegax: 984 + 13,
			mewtwomegay: 984 + 14,
			ampharosmega: 984 + 15,
			steelixmega: 984 + 16,
			scizormega: 984 + 17,
			heracrossmega: 984 + 18,
			houndoommega: 984 + 19,
			tyranitarmega: 984 + 20,
			sceptilemega: 984 + 21,
			blazikenmega: 984 + 22,
			swampertmega: 984 + 23,
			gardevoirmega: 984 + 24,
			sableyemega: 984 + 25,
			mawilemega: 984 + 26,
			aggronmega: 984 + 27,
			medichammega: 984 + 28,
			manectricmega: 984 + 29,
			sharpedomega: 984 + 30,
			cameruptmega: 984 + 31,
			altariamega: 984 + 32,
			banettemega: 984 + 33,
			absolmega: 984 + 34,
			glaliemega: 984 + 35,
			salamencemega: 984 + 36,
			metagrossmega: 984 + 37,
			latiasmega: 984 + 38,
			latiosmega: 984 + 39,
			kyogreprimal: 984 + 40,
			groudonprimal: 984 + 41,
			rayquazamega: 984 + 42,
			lopunnymega: 984 + 43,
			garchompmega: 984 + 44,
			lucariomega: 984 + 45,
			abomasnowmega: 984 + 46,
			gallademega: 984 + 47,
			audinomega: 984 + 48,
			dianciemega: 984 + 49,

			syclant: 1152 + 0,
			revenankh: 1152 + 1,
			pyroak: 1152 + 2,
			fidgit: 1152 + 3,
			stratagem: 1152 + 4,
			arghonaut: 1152 + 5,
			kitsunoh: 1152 + 6,
			cyclohm: 1152 + 7,
			colossoil: 1152 + 8,
			krilowatt: 1152 + 9,
			voodoom: 1152 + 10,
			tomohawk: 1152 + 11,
			necturna: 1152 + 12,
			mollux: 1152 + 13,
			aurumoth: 1152 + 14,
			malaconda: 1152 + 15,
			cawmodore: 1152 + 16,
			volkraken: 1152 + 17,
			plasmanta: 1152 + 18,
			naviathan: 1152 + 19,
			crucibelle: 1152 + 20,
			crucibellemega: 1152 + 21,
			kerfluffle: 1152 + 22,
			pajantom: 1152 + 23,

			syclar: 1176 + 0,
			embirch: 1176 + 1,
			flarelm: 1176 + 2,
			breezi: 1176 + 3,
			scratchet: 1176 + 4,
			necturine: 1176 + 5,
			cupra: 1176 + 6,
			argalis: 1176 + 7,
			brattler: 1176 + 8,
			cawdet: 1176 + 9,
			volkritter: 1176 + 10,
			snugglow: 1176 + 11,
			floatoy: 1176 + 12,
			caimanoe: 1176 + 13,
			pluffle: 1176 + 14,
		};

		if (altNums[id]) {
			num = altNums[id];
		}

		if (pokemon && pokemon.gender === 'F') {
			if (id === 'unfezant' || id === 'frillish' || id === 'jellicent' || id === 'meowstic' || id === 'pyroar') {
				num = altNums[id + 'f'];
			}
		}
		let top = Math.floor(num / 12) * 30;
		let left = (num % 12) * 40;
		let fainted = (pokemon && pokemon.fainted ? ';opacity:.4' : '');
		return 'background:transparent url(' + resourcePrefix + 'sprites/smicons-sheet.png?a1) no-repeat scroll -' + left + 'px -' + top + 'px' + fainted;
	},
	wildPokemon: [],
	loadPokemon: function () {
		this.wildPokemon = [];
		let mons = Object.keys(Dex.data.Pokedex);
		for (let i = 0; i < mons.length; i++) {
			let poke = Dex.getTemplate(mons[i]);
			let banned = {illegal: 1, cap: 1, capnfe: 1, caplc: 1};
			if (!poke.exists || toId(poke.tier) in banned) continue;
			if (poke.forme) {
				let allowedFormes = ['alola', 'original', 'hoenn', 'sinnoh', 'unova', 'kalos', 'partner', 'heat', 'frost', 'fan', 'mow', 'wash', 'midnight', 'dusk', 'pompom', 'pau', 'sensu', 'small', 'large', 'super', 'f', 'bluestripped', 'sandy', 'trash', 'dawnwings', 'duskmane'];
				if (allowedFormes.indexOf(toId(poke.forme)) < 0) continue;
			}
			this.wildPokemon.push(poke.id);
		}
	},
};

// last two functions needed to make sure WL.regdate() fully works
function loadRegdateCache() {
	try {
		regdateCache = JSON.parse(FS('config/regdate.json').readIfExistsSync());
	} catch (e) {}
}
loadRegdateCache();

function saveRegdateCache() {
	FS('config/regdate.json').writeSync(JSON.stringify(regdateCache));
}

function showDailyRewardAni(streak) {
	let output = '';
	for (let i = 1; i <= streak; i++) {
		output += "<img src='http://i.imgur.com/ZItWCLB.png' width='16' height='16'> ";
	}
	return output;
}
