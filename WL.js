'use strict';

let fs = require('fs');
let http = require('http');
const Autolinker = require('autolinker');

let regdateCache = {};

exports.WL = {
	nameColor: function (name, bold) {
		return (bold ? "<b>" : "") + "<font color=" + WL.hashColor(name) + ">" + (Users(name) && Users(name).connected && Users.getExact(name) ? Chat.escapeHTML(Users.getExact(name).name) : Chat.escapeHTML(name)) + "</font>" + (bold ? "</b>" : "");
	},
	// usage: WL.nameColor(user.name, true) for bold OR WL.nameColor(user.name, false) for non-bolded.

	messageSeniorStaff: function (message, pmName, from) {
		pmName = (pmName ? pmName : '~Wavelength Server');
		from = (from ? ' (PM from ' + from + ')' : '');
		Users.users.forEach(curUser => {
			if (curUser.group === '~' || curUser.group === '&') {
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
		let options = {
			host: 'pokemonshowdown.com',
			port: 80,
			path: '/users/' + target + '.json',
			method: 'GET',
		};
		http.get(options, function (res) {
			let data = '';
			res.on('data', function (chunk) {
				data += chunk;
			}).on('end', function () {
				data = JSON.parse(data);
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
		const cssPath = 'spacialgaze'; // This should be the server id if Config.serverid doesn't exist. Ex: 'serverid'
		let options = {
			host: 'play.pokemonshowdown.com',
			port: 80,
			path: '/customcss.php?server=' + (Config.serverid || cssPath),
			method: 'GET',
		};
		http.get(options, () => {});
	},

	giveDailyReward: function (userid, user) {
		if (!user || !userid) return false;
		userid = toId(userid);
		if (!Db.DailyBonus.has(userid)) {
			Db.DailyBonus.set(userid, [1, Date.now()]);
			return false;
		}
		let lastTime = Db.DailyBonus.get(userid)[1];
		if ((Date.now() - lastTime) < 86400000) return false;
		if ((Date.now() - lastTime) >= 127800000) Db.DailyBonus.set(userid, [1, Date.now()]);
		if (Db.DailyBonus.get(userid)[0] === 8) Db.DailyBonus.set(userid, [7, Date.now()]);
		Economy.writeMoney(userid, Db.DailyBonus.get(userid)[0]);
		user.send('|popup||wide||html| <center><u><b><font size="3">SpacialGaze Daily Bonus</font></b></u><br>You have been awarded ' + Db.DailyBonus.get(userid)[0] + ' Stardust.<br>' + showDailyRewardAni(userid) + '<br>Because you have connected to the server for the past ' + Db.DailyBonus.get(userid)[0] + ' Days.</center>');
		Db.DailyBonus.set(userid, [(Db.DailyBonus.get(userid)[0] + 1), Date.now()]);
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
					if (i + iv >= 6) iv = 31;
				}
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
		data += lvl + "|70";
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
	gameData: JSON.parse(fs.readFileSync('config/SGGame/pokemon.json', 'utf8')),
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
	itemData: JSON.parse(fs.readFileSync('config/SGGame/items.json', 'utf8')),
	getItem: function (id) {
		id = toId(id);
		if (!this.itemData[id]) return false;
		return this.itemData[id];
	},
	getNewMoves: function (pokemon, olvl, lvl, curMoves, slot) {
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
		if (num > 802) num = 0;
		let altNums = {
			egg: 804 + 1,
			pikachubelle: 804 + 2,
			pikachulibre: 804 + 3,
			pikachuphd: 804 + 4,
			pikachupopstar: 804 + 5,
			pikachurockstar: 804 + 6,
			pikachucosplay: 804 + 7,
			castformrainy: 804 + 35,
			castformsnowy: 804 + 36,
			castformsunny: 804 + 37,
			deoxysattack: 804 + 38,
			deoxysdefense: 804 + 39,
			deoxysspeed: 804 + 40,
			burmysandy: 804 + 41,
			burmytrash: 804 + 42,
			wormadamsandy: 804 + 43,
			wormadamtrash: 804 + 44,
			cherrimsunshine: 804 + 45,
			shelloseast: 804 + 46,
			gastrodoneast: 804 + 47,
			rotomfan: 804 + 48,
			rotomfrost: 804 + 49,
			rotomheat: 804 + 50,
			rotommow: 804 + 51,
			rotomwash: 804 + 52,
			giratinaorigin: 804 + 53,
			shayminsky: 804 + 54,
			unfezantf: 804 + 55,
			basculinbluestriped: 804 + 56,
			darmanitanzen: 804 + 57,
			deerlingautumn: 804 + 58,
			deerlingsummer: 804 + 59,
			deerlingwinter: 804 + 60,
			sawsbuckautumn: 804 + 61,
			sawsbucksummer: 804 + 62,
			sawsbuckwinter: 804 + 63,
			frillishf: 804 + 64,
			jellicentf: 804 + 65,
			tornadustherian: 804 + 66,
			thundurustherian: 804 + 67,
			landorustherian: 804 + 68,
			kyuremblack: 804 + 69,
			kyuremwhite: 804 + 70,
			keldeoresolute: 804 + 71,
			meloettapirouette: 804 + 72,
			vivillonarchipelago: 804 + 73,
			vivilloncontinental: 804 + 74,
			vivillonelegant: 804 + 75,
			vivillonfancy: 804 + 76,
			vivillongarden: 804 + 77,
			vivillonhighplains: 804 + 78,
			vivillonicysnow: 804 + 79,
			vivillonjungle: 804 + 80,
			vivillonmarine: 804 + 81,
			vivillonmodern: 804 + 82,
			vivillonmonsoon: 804 + 83,
			vivillonocean: 804 + 84,
			vivillonpokeball: 804 + 85,
			vivillonpolar: 804 + 86,
			vivillonriver: 804 + 87,
			vivillonsandstorm: 804 + 88,
			vivillonsavanna: 804 + 89,
			vivillonsun: 804 + 90,
			vivillontundra: 804 + 91,
			pyroarf: 804 + 92,
			flabebeblue: 804 + 93,
			flabebeorange: 804 + 94,
			flabebewhite: 804 + 95,
			flabebeyellow: 804 + 96,
			floetteblue: 804 + 97,
			floetteeternal: 804 + 98,
			floetteorange: 804 + 99,
			floettewhite: 804 + 100,
			floetteyellow: 804 + 101,
			florgesblue: 804 + 102,
			florgesorange: 804 + 103,
			florgeswhite: 804 + 104,
			florgesyellow: 804 + 105,
			meowsticf: 804 + 115,
			aegislashblade: 804 + 116,
			hoopaunbound: 804 + 118,
			rattataalola: 804 + 119,
			raticatealola: 804 + 120,
			raichualola: 804 + 121,
			sandshrewalola: 804 + 122,
			sandslashalola: 804 + 123,
			vulpixalola: 804 + 124,
			ninetalesalola: 804 + 125,
			diglettalola: 804 + 126,
			dugtrioalola: 804 + 127,
			meowthalola: 804 + 128,
			persianalola: 804 + 129,
			geodudealola: 804 + 130,
			graveleralola: 804 + 131,
			golemalola: 804 + 132,
			grimeralola: 804 + 133,
			mukalola: 804 + 134,
			exeggutoralola: 804 + 135,
			marowakalola: 804 + 136,
			greninjaash: 804 + 137,
			zygarde10: 804 + 138,
			zygardecomplete: 804 + 139,
			oricoriopompom: 804 + 140,
			oricoriopau: 804 + 141,
			oricoriosensu: 804 + 142,
			lycanrocmidnight: 804 + 143,
			wishiwashischool: 804 + 144,
			miniormeteor: 804 + 145,
			miniororange: 804 + 146,
			minioryellow: 804 + 147,
			miniorgreen: 804 + 148,
			miniorblue: 804 + 149,
			miniorviolet: 804 + 150,
			miniorindigo: 804 + 151,
			magearnaoriginal: 804 + 152,
			pikachuoriginal: 804 + 153,
			pikachuhoenn: 804 + 154,
			pikachusinnoh: 804 + 155,
			pikachuunova: 804 + 156,
			pikachukalos: 804 + 157,
			pikachualola: 804 + 158,

			venusaurmega: 972 + 0,
			charizardmegax: 972 + 1,
			charizardmegay: 972 + 2,
			blastoisemega: 972 + 3,
			beedrillmega: 972 + 4,
			pidgeotmega: 972 + 5,
			alakazammega: 972 + 6,
			slowbromega: 972 + 7,
			gengarmega: 972 + 8,
			kangaskhanmega: 972 + 9,
			pinsirmega: 972 + 10,
			gyaradosmega: 972 + 11,
			aerodactylmega: 972 + 12,
			mewtwomegax: 972 + 13,
			mewtwomegay: 972 + 14,
			ampharosmega: 972 + 15,
			steelixmega: 972 + 16,
			scizormega: 972 + 17,
			heracrossmega: 972 + 18,
			houndoommega: 972 + 19,
			tyranitarmega: 972 + 20,
			sceptilemega: 972 + 21,
			blazikenmega: 972 + 22,
			swampertmega: 972 + 23,
			gardevoirmega: 972 + 24,
			sableyemega: 972 + 25,
			mawilemega: 972 + 26,
			aggronmega: 972 + 27,
			medichammega: 972 + 28,
			manectricmega: 972 + 29,
			sharpedomega: 972 + 30,
			cameruptmega: 972 + 31,
			altariamega: 972 + 32,
			banettemega: 972 + 33,
			absolmega: 972 + 34,
			glaliemega: 972 + 35,
			salamencemega: 972 + 36,
			metagrossmega: 972 + 37,
			latiasmega: 972 + 38,
			latiosmega: 972 + 39,
			kyogreprimal: 972 + 40,
			groudonprimal: 972 + 41,
			rayquazamega: 972 + 42,
			lopunnymega: 972 + 43,
			garchompmega: 972 + 44,
			lucariomega: 972 + 45,
			abomasnowmega: 972 + 46,
			gallademega: 972 + 47,
			audinomega: 972 + 48,
			dianciemega: 972 + 49,

			syclant: 1140 + 0,
			revenankh: 1140 + 1,
			pyroak: 1140 + 2,
			fidgit: 1140 + 3,
			stratagem: 1140 + 4,
			arghonaut: 1140 + 5,
			kitsunoh: 1140 + 6,
			cyclohm: 1140 + 7,
			colossoil: 1140 + 8,
			krilowatt: 1140 + 9,
			voodoom: 1140 + 10,
			tomohawk: 1140 + 11,
			necturna: 1140 + 12,
			mollux: 1140 + 13,
			aurumoth: 1140 + 14,
			malaconda: 1140 + 15,
			cawmodore: 1140 + 16,
			volkraken: 1140 + 17,
			plasmanta: 1140 + 18,
			naviathan: 1140 + 19,
			crucibelle: 1140 + 20,
			crucibellemega: 1140 + 21,
			kerfluffle: 1140 + 22,
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
				let allowedFormes = ['alola', 'original', 'hoenn', 'sinnoh', 'unova', 'kalos', 'heat', 'frost', 'fan', 'mow', 'wash', 'midnight', 'pompom', 'pau', 'sensu', 'small', 'large', 'super', 'f', 'bluestripped', 'sandy', 'trash'];
				if (allowedFormes.indexOf(toId(poke.forme)) < 0) continue;
			}
			this.wildPokemon.push(poke.id);
		}
	},
};

// last two functions needed to make sure WL.regdate() fully works
function loadRegdateCache() {
	try {
		regdateCache = JSON.parse(fs.readFileSync('config/regdate.json', 'utf8'));
	} catch (e) {}
}
loadRegdateCache();

function saveRegdateCache() {
	fs.writeFileSync('config/regdate.json', JSON.stringify(regdateCache));
}

function showDailyRewardAni(userid) {
	userid = toId(userid);
	let streak = Db.DailyBonus.get(userid)[0];
	let output = '';
	for (let i = 1; i <= streak; i++) {
		output += "<img src='http://i.imgur.com/ZItWCLB.png' width='16' height='16'> ";
	}
	return output;
}
