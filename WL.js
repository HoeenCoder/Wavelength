'use strict';

const FS = require("./lib/fs.js");
let https = require('https');
const Autolinker = require('autolinker');

let regdateCache = {};

exports.WL = {
	uncache: function () {
		// Add more files to here as they are called by require() so they are reloaded by /hotpatch chat
		const caches = ['./config/SGGame/locations.js'];
		for (let cache of caches) {
			Chat.uncache(cache);
		}
	},
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

	getSprite: function (pokemon, shiny) {
		if (!pokemon) return false;
		let template = Dex.getTemplate(pokemon);
		let spriteId = toId(pokemon);
		if (template.id !== spriteId) {
			let idx = spriteId.indexOf(template.id);
			spriteId = template.id + '-' + spriteId.slice(idx + template.id.length);
		}
		return `//play.pokemonshowdown.com/sprites/xyani${shiny ? '-shiny' : ''}/${spriteId}.gif`;
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
	locationData: require('./config/SGGame/locations.js').locations,
	makeWildPokemon: function (location, zone, type, exact) {
		if (!this.pokemonLoaded) this.loadPokemon();
		let pokemon = null, wild = {};
		if (exact && Dex.getTemplate(exact.species).exists) {
			pokemon = exact.species;
			if (!exact.level && (!exact.min || !exact.max)) {
				console.log(`Error on pokemon generation: Exact pokemon provided without a level`);
				return "ERROR!|missingno|||hiddenpower|Serious|||0,0,0,0,0,0||1|0,,pokeball,0,hoeenhero";
			}
		} else {
			if (!location || !zone || !WL.locationData[location] || !WL.locationData[location].zones[zone]) {
				console.log(`Error on pokemon generation: Location/zone not found: ${location}|${zone}`);
				return "ERROR!|missingno|||hiddenpower|Serious|||0,0,0,0,0,0||1|0,,pokeball,0,hoeenhero";
			}
			let area = WL.locationData[location].zones[zone].wild;
			if (!area) {
				console.log(`Error on pokemon generation: Wild pokemon data not found for ${location}|${zone}`);
				return "ERROR!|missingno|||hiddenpower|Serious|||0,0,0,0,0,0||1|0,,pokeball,0,hoeenhero";
			}
			if (!area[type]) {
				console.log(`Error on pokemon generation: Type "${type}" not found in wild pokemon data for ${location}|${zone}`);
				return "ERROR!|missingno|||hiddenpower|Serious|||0,0,0,0,0,0||1|0,,pokeball,0,hoeenhero";
			}
			wild = area[type][Math.floor(Math.random() * area[type].length)];
			pokemon = wild.species;
		}
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
		if (exact && exact.min) wild.min = exact.min;
		if (exact && exact.max) wild.max = exact.max;
		let lvl = (wild.min === wild.max ? wild.min : Math.round(Math.random() * (wild.max - wild.min)) + wild.min);
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
		let data = forme ? `${pokemon.id}|${toId(forme)}||` : `${pokemon.id}|||`;
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
		} else if (pokemon.forme === "Starter") {
			// 6 Perfect Ivs required
			data += "31,31,31,31,31,31|";
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
	makeComTeam: function (location, count) {
		// TODO random trainers / replace this
		if (!location.trainers || location.trainers.type !== 'random') throw new Error(`Trying to generate a random team for a location that does not support random teams: ${location.id}`);
		let trainer = location.trainers.trainers.slice()[Math.floor(Math.random() * location.trainers.trainers.length)];
		if (!trainer.team.startsWith('random')) return trainer;
		let details = trainer.team.slice().split(',');
		trainer.team = '';
		let numPokes = parseInt(details[1]);
		if (!numPokes || isNaN(numPokes)) numPokes = Math.ceil(Math.random() * 6);
		let teamAverage = parseInt(details[2]);
		if (!teamAverage || isNaN(teamAverage)) teamAverage = 10 + ((count - numPokes) * 3);
		const isNot = details[3][0] === '!';
		const types = isNot ? Object.keys(Dex.data.TypeChart).map(toId).filter(type => !details[3].substring(1).split('|').includes(type)) : details[3].split('|');
		const allowLegends = !!details[4];
		const validPokemon = Object.keys(Dex.data.Pokedex).slice().filter(species => {
			let template = Dex.getTemplate(species);
			if (['illegal', 'cap', 'caplc', 'capnfe'].includes(toId(template.tier))) return false;
			if (template.forme) return false; // other formes supported by the pokemon generator
			if (types.length) {
				let hasOne = false;
				for (let i = 0; i < types.length; i++) {
					if (template.types.slice().map(toId).includes(types[i])) {
						hasOne = true;
						break;
					}
				}
				if (!hasOne) return false;
			}
			if (template.evoLevel > teamAverage) return false;
			if ((template.eggGroups[0] === 'Undiscovered' || template.species === 'Manaphy') && !template.prevo && !template.nfe && template.species !== 'Unown' && template.baseSpecies !== 'Pikachu' && !allowLegends) return false;
			return true;
		});
		for (numPokes; numPokes > 0; numPokes--) {
			let level = Math.round(Math.random() * ((teamAverage + 2) - (teamAverage - 2))) + (teamAverage - 2);
			if (level < 0) level = 1;
			if (level > 100) level = 100;
			let options = {allowOtherFormes: true, level: level};
			options.species = validPokemon[Math.floor(Math.random() * validPokemon.length)];
			trainer.team += `${(trainer.team ? ']' : '')}${WL.makeWildPokemon(null, null, null, options)}`;
		}
		return trainer;
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
	getStat: function (pokemon, stat) {
		stat = toId(stat);
		if (!pokemon || !pokemon.species || !['hp', 'atk', 'def', 'spa', 'spd', 'spe'].includes(stat)) return (stat === 'hp' ? 11 : 4); // Return the lowest possible value
		let template = Dex.getTemplate(pokemon.species);
		if (!pokemon.evs) pokemon.evs = {hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0};
		if (stat === 'hp') {
			if (template.speciesid === 'shedinja') return 1;
			return Math.floor((((2 * template.baseStats.hp + pokemon.ivs.hp + (pokemon.evs.hp / 4)) * pokemon.level) / 100) + pokemon.level + 10);
		} else {
			let natureMod = 1, nature = Dex.getNature(pokemon.nature);
			if (nature.plus === stat) natureMod = 1.1;
			if (nature.minus === stat) natureMod = 0.9;
			return Math.floor(((((2 * template.baseStats[stat] + pokemon.ivs[stat] + (pokemon.evs[stat] / 4)) * pokemon.level) / 100) + 5) * natureMod);
		}
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
					stats[i] = this.getStat(pokemon, toCheck[i]);
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
	getTmMoves: function (pokemon, tm, curMoves, slot) {
		if (!pokemon) return [];
		if (typeof pokemon === 'string') pokemon = Dex.getTemplate(pokemon);
		if (!pokemon.exists) throw new Error('Can\'t get new moves for non-existant pokemon "' + pokemon.id + '"');
		let moves = [];
		let baseSpecies = null;
		if (pokemon.baseSpecies) baseSpecies = Dex.getTemplate(pokemon.baseSpecies);
		if (!pokemon.learnset && baseSpecies && baseSpecies.learnset) {
			pokemon.learnset = baseSpecies.learnset;
		}
		if (pokemon.learnset[tm] && pokemon.learnset[tm].includes('7M') && curMoves.indexOf(tm) === -1) {
			moves.push("learn|" + slot + "|" + tm);
		}
		return moves;
	},
	loadPokemon: function () {
		let raw = FS('./config/SGGame/encounters.txt').readIfExistsSync().split('\n');
		let ignoring = false, location = null, zone = null, type = null;
		const types = ['grass', 'water', 'cave', 'fish'];
		for (let i = 0; i < raw.length; i++) {
			let line = raw[i];
			switch (line.substring(0, 2)) {
			case '//':
				continue;
			case '/*':
				ignoring = true;
				continue;
			case '*/':
				ignoring = false;
				continue;
			}
			if (ignoring || !toId(line)) continue;
			let action = line.split(' ')[0];
			switch (action) {
			case 'LOCATION':
				// new location
				location = toId(line.split(' ')[1].split('|')[0]);
				zone = toId(line.split(' ')[1].split('|')[1]);
				type = null;
				if (!WL.locationData[location] || !WL.locationData[location].zones[zone]) throw new Error(`Error while parsing encounter data: Unable to find location "${location}|${zone}".`, `config/SGgame/encounters.txt`, `${i + 1}:10`);
				WL.locationData[location].zones[zone].wild = {};
				continue;
			case 'TYPE':
				// new type
				if (!location || !zone) throw new Error(`Error while parsing encounter data: No location set`, `config/SGgame/encounters.txt`, i + 1);
				if (!types.includes(toId(line.split(' ')[1]))) throw new Error(`Error while parsing encounter data: Invalid type: "${type}"`, `config/SGgame/encounters.txt`, `${i + 1}:6`);
				type = toId(line.split(' ')[1]);
				WL.locationData[location].zones[zone].wild[type] = [];
				continue;
			default:
				// data
				if (!location || !zone) throw new Error(`Error while parsing encounter data: No location set`, `config/SGgame/encounters.txt`, i + 1);
				if (!type) throw new Error(`Error while parsing encounter data: No encounter type set`, `config/SGgame/encounters.txt`, i + 1);
				let obj = {}, data = line.split(',');
				let species = null;
				for (let j = 0; j < data.length; j++) {
					switch (j) {
					case 0:
						species = Dex.getTemplate(data[j]);
						if (!species.exists) throw new Error(`Error while parsing encounter data: Unkown species: ${data[j]}`, `config/SGgame/encounters.txt`, `${i + 1}:1`);
						obj.species = species.id;
						continue;
					case 1:
						if (isNaN(parseInt(data[j])) || parseInt(data[j] < 1) || parseInt(data[j] > 100)) throw new Error(`Error while parsing encounter data: Invalid level`, `config/SGgame/encounters.txt`, `${i + 1}:${obj.species.length + 1}`);
						obj.min = parseInt(data[j]);
						if (data.length === 2) obj.max = parseInt(data[j]);
						continue;
					case 2:
						if (isNaN(parseInt(data[j])) || parseInt(data[j]) < 1 || parseInt(data[j] > 100)) throw new Error(`Error while parsing encounter data: Invalid level`, `config/SGgame/encounters.txt`, `${i + 1}:${obj.species.length + ('' + obj.min).length + 2}`);
						obj.max = parseInt(data[j]);
						continue;
					case 3:
						let count = parseInt(data[j]);
						if (isNaN(count) || count > 100 || count < 1) throw new Error(`Error while parsing encounter data: Invalid count: "${count}"`, `config/SGgame/encounters.txt`, `${i + 1}:${obj.species.length + ('' + obj.min).length + ('' + obj.max).length + 3}`);
						if (count === 1) continue; // 1 is supported to support future additions to the generator
						while (count > 1) {
							WL.locationData[location].zones[zone].wild[type].push(obj);
							count--;
						}
						continue;
					}
				}
				WL.locationData[location].zones[zone].wild[type].push(obj);
			}
		}
		this.pokemonLoaded = true;
	},
	loadTrainers: function () {
		let raw = FS('./config/SGGame/trainers.txt').readIfExistsSync().split('\n');
		let ignoring = false, location = null, zone = null, type = null, allIds = [];
		for (let i = 0; i < raw.length; i++) {
			let line = raw[i];
			switch (line.substring(0, 2)) {
			case '//':
				continue;
			case '/*':
				ignoring = true;
				continue;
			case '*/':
				ignoring = false;
				continue;
			}
			if (ignoring || !toId(line)) continue;
			let action = line.split(' ')[0];
			switch (action) {
			case 'LOCATION':
				// new location
				location = toId(line.split(' ')[1].split('|')[0]);
				zone = toId(line.split(' ')[1].split('|')[1]);
				type = null;
				if (!WL.locationData[location] || !WL.locationData[location].zones[zone]) throw new Error(`Error while parsing trainer data: Unable to find location "${location}|${zone}".`, `config/SGgame/trainers.txt`);
				WL.locationData[location].zones[zone].trainers = {type: null, trainers: []};
				continue;
			case 'TYPE':
				// set type
				if (!location || !zone) throw new Error(`Error while parsing trainer data: No location set`, `config/SGgame/trainers.txt`);
				if (!['preset', 'random'].includes(toId(line.split(' ')[1]))) throw new Error(`Error while parsing trainer data: Invalid type: "${type}"`, `config/SGgame/trainers.txt`);
				type = toId(line.split(' ')[1]);
				WL.locationData[location].zones[zone].trainers.type = type;
				continue;
			default:
				// data
				if (!location || !zone) throw new Error(`Error while parsing trainer data: No location set`, `config/SGgame/trainer.txt`);
				if (!type) throw new Error(`Error while parsing trainer data: No trainer battle type set`, `config/SGgame/trainers.txt`);
				let obj = {}, data = line.split(',');
				for (let j = 0; j < data.length; j++) {
					// Trainer info
					switch (j) {
					case 0:
						// Trainer Prefix
						if (toId(data[j]) === 'random' && type !== 'random') throw new Error(`Error while parsing trainer data: Trying to use a random trainer prefix with type PRESET`, `config/SGgame/trainer.txt`);
						obj.prefix = data[j].trim();
						break;
					case 1:
						// Trainer Name
						if (toId(data[j]) === 'random' && type !== 'random') throw new Error(`Error while parsing trainer data: Trying to use a random trainer name with type PRESET`, `config/SGgame/trainer.txt`);
						obj.name = data[j].trim();
						break;
					case 2:
						// Trainer ID
						if (allIds.includes(data[j].trim())) throw new Error(`Error while parsing trainer data: Trainer ID used twice: ${data[j].trim()}`, `config/SGgame/trainer.txt`);
						allIds.push(data[j].trim());
						obj.id = data[j].trim();
						break;
					case 3:
						// Requirement to battle this trainer before advancing
						if (toId(data[j]) === 'true') {
							if (type === 'random') throw new Error(`Error while parsing trainer data: Requiring a trainer battle with type RANDOM`, `config/SGgame/trainer.txt`);
							obj.required = true;
						}
					}
				}
				// Team data
				i++; // Next line
				line = raw[i];
				data = line.split(',');
				let randomGeneration = (toId(data[0]) === 'random');
				if (randomGeneration) {
					// Validate random setup
					let team = 'random,';
					let num;
					for (let j = 1; j < data.length; j++) {
						switch (j) {
						case 1:
							if (!toId(data[j])) {
								team += ',';
								break; // Empty block, skip
							}
							num = parseInt(data[j]);
							if (isNaN(num) || num < 1 || num > 6) throw new Error(`Error while parsing trainer data: Invalid amount of pokemon on a random team: ${data[j]}`, `config/SGgame/trainer.txt`);
							team += num + ',';
							break;
						case 2:
							if (!toId(data[j])) {
								team += ',';
								break; // Empty block, skip
							}
							num = parseInt(data[j]);
							if (isNaN(num) || num < 1 || num > 100) throw new Error(`Error while parsing trainer data: Invalid level average on a random team: ${data[j]}`, `config/SGgame/trainer.txt`);
							team += num + ',';
							break;
						case 3:
							if (!toId(data[j])) {
								team += ',';
								break; // Empty block, skip
							}
							const isNot = data[j].startsWith('!');
							const types = Object.keys(Dex.data.TypeChart).map(toId);
							let selectedTypes = data[j].slice(isNot ? 1 : 0).split('|').map(toId);
							for (let type = 0; type < selectedTypes.length; type++) {
								if (!types.includes(selectedTypes[type])) throw new Error(`Error while parsing trainer data: Invalid type in pool of ${isNot ? 'im' : ''}possible types: ${selectedTypes[type]}`, `config/SGgame/trainer.txt`);
							}
							if (selectedTypes.length === types.length && isNot) throw new Error(`Error while parsing trainer data: You cannot disallow all types at once`, `config/SGgame/trainer.txt`);
							team += (isNot ? '!' : '') + selectedTypes.join('|') + ',';
							break;
						case 4:
							if (toId(data[j])) team += 'true';
							break;
						}
					}
					obj.team = team;
				} else {
					// Packed team
					let valid = Dex.fastUnpackTeam(line.trim());
					if (!valid) throw new Error(`Error while parsing trainer data: Invalid team provided: ${line.trim()}`, `config/SGgame/trainer.txt`);
					obj.team = line.trim();
				}
				WL.locationData[location].zones[zone].trainers.trainers.push(obj);
			}
		}
		this.trainersLoaded = true;
	},
	loadShops: function () {
		let raw = FS('./config/SGGame/shops.txt').readIfExistsSync().split('\n');
		let ignoring = false, location = null, zone = null, id = null;
		for (let i = 0; i < raw.length; i++) {
			let line = raw[i];
			switch (line.substring(0, 2)) {
			case '//':
				continue;
			case '/*':
				ignoring = true;
				continue;
			case '*/':
				ignoring = false;
				continue;
			}
			if (ignoring || !toId(line)) continue;
			let action = line.split(' ')[0];
			switch (action) {
			case 'LOCATION':
				// new location
				location = toId(line.split(' ')[1].split('|')[0]);
				zone = toId(line.split(' ')[1].split('|')[1]);
				if (!WL.locationData[location] || !WL.locationData[location].zones[zone]) throw new Error(`Error while parsing shop data: Unable to find location "${location}|${zone}".`, `config/SGgame/shops.txt`);
				WL.locationData[location].zones[zone].shops = {};
				id = null;
				continue;
			case 'SHOPID':
				// new shop
				if (!location || !zone) throw new Error(`Error while parsing shop data: No location set when setting shop id`, `config/SGgame/shops.txt`);
				if (this.locationData[location].zones[zone].shops[toId(line.split(' ')[1])]) throw new Error(`Error while parsing shop data: Duplicate shop id in "${location}|${zone}": ${toId(line.split(' ')[1])}.`, `config/SGgame/shops.txt`);
				id = toId(line.split(' ')[1]);
				WL.locationData[location].zones[zone].shops[id] = {};
				continue;
			default:
				// data
				if (!location || !zone) throw new Error(`Error while parsing shop data: No location set when parsing shop data`, `config/SGgame/shops.txt`);
				if (!id) throw new Error(`Error while parsing shop data: No shop id set`, `config/SGgame/shops.txt`);
				let data = line.split(',');
				let item = WL.getItem(data[0]);
				if (!item) throw new Error(`Error while parsing shop data: Item ${data[0]} does not exist`, `config/SGgame/shops.txt`);
				if (item.slot === 'keyitems') throw new Error(`Error while parsing shop data: Item ${data[0]} is a key item and cannot be sold`, `config/SGgame/shops.txt`);
				let price = parseInt(data[1]);
				if (!price || price < 0) throw new Error(`Error while parsing shop data: Item ${data[0]} has an invalid price (must be a integer that is greater than 0)`, `config/SGgame/shops.txt`);
				let once = !!data[2];
				this.locationData[location].zones[zone].shops[id][item.id] = [price, once];
			}
		}
		this.shopsLoaded = true;
	},
	getShop: function (location, zone, id) {
		if (!this.shopsLoaded) this.loadShops();
		if (!this.locationData[location] || !this.locationData[location].zones[zone] || !this.locationData[location].zones[zone].shops || !this.locationData[location].zones[zone].shops[id]) return false;
		return this.locationData[location].zones[zone].shops[id];
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
