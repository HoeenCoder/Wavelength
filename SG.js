'use strict';

let fs = require('fs');
let http = require('http');
const Autolinker = require('autolinker');

let regdateCache = {};

let gameData = {};
try {
	gameData = JSON.parse(fs.readFileSync('config/SGGame/pokemon.json', 'utf8'));
} catch (e) {}

exports.SG = {
	nameColor: function (name, bold) {
		return (bold ? "<b>" : "") + "<font color=" + hashColorWithCustoms(name) + ">" + (Users(name) && Users(name).connected && Users.getExact(name) ? Chat.escapeHTML(Users.getExact(name).name) : Chat.escapeHTML(name)) + "</font>" + (bold ? "</b>" : "");
	},
	// usage: SG.nameColor(user.name, true) for bold OR SG.nameColor(user.name, false) for non-bolded.

	hashColor: function (user) {
		return hashColorWithCustoms(user);
	},

	messageSeniorStaff: function (message, pmName, from) {
		pmName = (pmName ? pmName : '~Upper Staff PM');
		from = (from ? ' (PM from ' + from + ')' : '');
		Users.users.forEach(curUser => {
			if (curUser.group === '~' || curUser.group === '&') {
				curUser.send('|pm|' + pmName + '|' + curUser.getIdentity() + '|' + message + from);
			}
		});
	},
	// format: SG.messageSeniorStaff('message', 'person')
	//
	// usage: SG.messageSeniorStaff('Mystifi is a confirmed user and they were banned from a public room. Assess the situation immediately.', '~Server')
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
		http.get(options);
	},

	//This code is a WIP
	/*masterGameObj: {},
	writingGame: false, // TODO: To prevent a restart while writeSteam is running
	writeGameData: function () {
		// TODO: use fs.writeStream so we dont overload anything with the massive object.
		// TODO: what happens if we write from multiple process a the same time? Does the second write undo the first? Will it corrupt the JSON? Should we prevent that and only allow the main process to write to game.json?
		let buf = '';
		for (let key in SG.masterGameObj) {
			let obj = {};
			obj[key] = SG.masterGameObj[key];
			buf += JSON.stringify(obj) + '\n';
		}
		fs.writeFile('config/game.json', buf, 'utf-8');
	},

	readGameData: function () {
		try {
			fs.accessSync('config/game.json', fs.F_OK);
		} catch (e) {
			fs.writeFile('config/game.json', "{}", function (err) {
				if (err) {
					console.error('Error while creating game.json: ' + err);
				} else {
					console.log("config/game.json not found, creating a new one...");
				}
			});
			return; //No need to read from the file we just created.
		}
		let stream = fs.createReadStream('config/game.json', {flags: 'r', encoding: 'utf-8'});
		let buf = '';

		stream.on('data', function (d) {
			buf += d.toString(); // when data is read, stash it in a string buffer
			pump(); // then process the buffer
		});

		function pump() {
			let pos;

			while ((pos = buf.indexOf('\n')) >= 0) { // keep going while there's a newline somewhere in the buffer
				// if there's more than one newline in a row, the buffer will now start with a newline
				if (pos == 0) { // eslint-disable-line eqeqeq
					buf = buf.slice(1); // discard it
					continue; // so that the next iteration will start with data
				}
				processLine(buf.slice(0, pos)); // hand off the line
				buf = buf.slice(pos + 1); // and slice the processed data off the buffer
			}
		}

		function processLine(line) { // here's where we do something with a line
			// discard CR (0x0D)
			if (line[line.length - 1] == '\r') line = line.substr(0, line.length - 1); // eslint-disable-line eqeqeq
			if (line.length > 0) { // ignore empty lines
				let obj = JSON.parse(line); // parse the JSON
				Object.assign(SG.masterGameObj, obj); // do something with the data here!
			}
		}
	},*/
	gameData: gameData,
	makeCOM: function () {
		if (Users('sgserver')) return false; // Already exists!
		let user = new Users.User({user: false, send: function () {}, inRooms: new Set(), worker: {send: function () {}}, socketid: false, ip: '', protocal: '', autojoin: '', isCOM: true}); // Fake connection object, fill it with whats needed to prevent crashes
		user.connected = false; // Technically isnt connected
		user.avatar = 167;
		user.wildTeams = {}; //Object to store data from wild pokemon battles.
		user.onPokemonCaught = function (user) { // Handles pokemon catching
			if (!user || !this.wildTeams[toId(user)]) return false;
			user = toId(user);
			let curTeam = Db('players').get(user, []);
			if (curTeam.length === 6) return false; // TODO PC boxes / release a pokemon
			let newSet = SG.unpackTeam(this.wildTeams[user]);
			if (!newSet) return false;
			curTeam.push(newSet);
			Db('players').set(user, curTeam);
			return true;
		};
		user.forceRename('SG Server', true); // I have this name registed for use here. - HoeenHero
		return user;
	},
	/**
	* @param {Object} battle The battle object.
	* @param {String} side The side that the COM is playing on. ("p1" or "p2")
	* @param {String} type The type of action to take. (Currently supporting: "random")
	* @return {Boolean}
	*/
	decideCOM: function (battle, side, type) {
		// Only works within a battle process
		if (!battle || !side) return false;
		if (!type) type = 'random';
		if (battle.ended) return false;
		switch (type) {
		case 'random':
			if (battle[side].active[0].fainted) {
				let choices = Tools.shuffle(battle[side].pokemon.slice(0));
				for (let i = 0; i < choices.length; i++) {
					if (choices[i].fainted) continue;
					let idx = battle[side].pokemon.indexOf(choices[i]);
					let data = [battle.id, 'choose', side];
					data.push('switch ' + (idx + 1));
					data.push(battle.turn);
					battle.receive(data);
					return true;
				}
				//If it reaches here, it means were out of pokemon
				return false;
			} else {
				let choice = Math.floor(Math.random() * battle[side].active[0].moves.length);
				let data = [battle.id, 'choose', side];
				data.push('move ' + (choice + 1));
				data.push(battle.turn);
				battle.receive(data);
				return true;
			}
			//break;
		}
	},
	makeWildPokemon: function (location, exact) {
		//TODO: locations
		let pokemon = ['lotad', 'snorunt', 'archen', 'klink', 'cacnea', 'lillipup', 'gible', 'magikarp', 'numel', 'pineco', 'pikachu', 'makuhita', 'starly', 'gulpin', 'elgyem', 'swirlix', 'purrloin'][Math.floor(Math.random() * 17)]; //TODO pull from location
		if (exact && Tools.getTemplate(exact.species).exists) pokemon = exact.species;
		pokemon = Tools.getTemplate(pokemon);
		if (!pokemon || !pokemon.exists) {
			console.log('Error on pokemon generation: Invalid pokemon: ' + pokemon.id);
			return "ERROR!|missingno|||hiddenpower|Serious|||0,0,0,0,0,0||1|0";
		}
		let data = "|" + pokemon.id + "||";
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
		let lvl = Math.round(Math.random() * 5) + 8; //8 -> 12 for test. TODO base on location
		if (exact && exact.level && !isNaN(parseInt(exact.level))) lvl = exact.level;
		lvl = (lvl < 1 ? lvl = 1 : (lvl > 9999 ? lvl = 9999 : lvl)); // Maybe limit to something more reasonable... But atm since its only used by the server, 9999 will work.
		let moves = "";
		let raw = [];
		let used = [];
		for (let move in pokemon.learnset) {
			for (let learned in pokemon.learnset[move]) {
				if (pokemon.learnset[move][learned].substr(0, 2) in {'7L': 1} && parseInt(pokemon.learnset[move][learned].substr(2)) <= lvl && !used[move]) {
					raw.push({move: move, lvl: pokemon.learnset[move][learned]});
					used.push(move);
				}
			}
		}
		raw = raw.sort(function (a, b) {return parseInt(a.lvl.substr(2)) - parseInt(b.lvl.substr(2));});
		for (let i = 0; i < 4; i++) {
			if (raw.length === 0) break;
			let target = raw.pop();
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
			for (let key in Tools.data.Natures) {
				if (Tools.data.Natures[key].plus === plus && Tools.data.Natures[key].minus === minus) {
					data += Tools.data.Natures[key].name + "||";
					break;
				}
			}
		} else {
			data += ['Bashful', 'Docile', 'Hardy', 'Quirky', 'Serious'][Math.floor(Math.random() * 5)] + "||";
		}
		let gender = Math.random();
		if (pokemon.genderRatio.M < gender) {
			gender = "M";
		} else if (pokemon.genderRatio.M !== 0 && pokemon.genderRatio.F !== 0) {
			gender = "F";
		} else {
			gender = "";
		}
		data += gender + "|";
		for (let i = 0; i < 6; i++) {
			data += Math.round(Math.random() * 31) + (i === 5 ? "|" : ",");
		}
		if (Math.ceil(Math.random() * 4096) === 1) {
			data += "S|";
		} else {
			data += "|";
		}
		data += lvl + "|0";
		if (data.split('|').length !== 12) {
			console.log('Error on pokemon generation: Corrupted data: ' + data);
			return "ERROR!|missingno|||hiddenpower|Serious|||0,0,0,0,0,0||1|0";
		}
		return data;
		//return "|lotad|||astonish,growl,absorb|Hasty|||30,21,21,28,29,19||6|0";
	},
	throwPokeball: function (ball, pokemon) {
		if (!pokemon || !pokemon.species) return 0;
		ball = toId(ball);
		let ballRates = {pokeball: 1, greatball: 1.5, ultraball: 2};
		let catchRates = {};
		if (ball === 'masterball') return true;
		if (!ball || !(ball in ballRates)) ball = 'pokeball';
		let statusBonus = 1;
		switch (pokemon.status) {
		case 'slp':
		case 'frz':
			statusBonus = 2;
			break;
		case 'par':
		case 'brn':
		case 'psn':
		case 'tox':
			statusBonus = 1.5;
			break;
		default:
			statusBonus = 1;
		}
		let rate = catchRates[toId(pokemon.species)]; // TODO catch rates
		if (!rate) {
			console.log('Catch rate not found for ' + pokemon.species);
			rate = 150;
		}
		let a = (((3 * pokemon.maxhp - 2 * pokemon.hp) * rate * ballRates[ball]) / (3 * pokemon.maxhp)) * statusBonus;
		if (a >= 255) return true;
		let b = 65536 / Math.pow(255 / a, 0.1875);
		for (let i = 0; i < 4; i++) {
			if (Math.ceil(Math.random() * 65535) >= b) return i;
		}
		return true;
	},
	packTeam: function (team) {
		let buf = '';
		if (!team) return '';

		for (let i = 0; i < team.length; i++) {
			let set = team[i];
			if (buf) buf += ']';

			// name
			if (set.name) buf += set.name;

			// species
			let id = toId(set.species);
			buf += '|' + (toId(set.name) === id ? '' : id);

			// item
			buf += '|' + toId(set.item);

			// ability
			let template = Tools.getTemplate(set.species || set.name);
			let abilities = template.abilities;
			id = toId(set.ability);
			if (abilities) {
				if (id === toId(abilities['0']) || id === 0) {
					buf += '|';
				} else if (id === toId(abilities['1']) || id === 1) {
					buf += '|1';
				} else if (id === toId(abilities['H']) || id === 'h') {
					buf += '|H';
				} else {
					buf += '|' + id;
				}
			} else {
				buf += '|' + id;
			}

			// moves
			if (set.moves) {
				buf += '|' + set.moves.map(toId).join(',');
			} else {
				buf += '|';
			}

			// nature
			buf += '|' + (set.nature || '');

			// evs
			let evs = '|';
			if (set.evs) {
				evs = '|' + (set.evs['hp'] || '') + ',' + (set.evs['atk'] || '') + ',' + (set.evs['def'] || '') + ',' + (set.evs['spa'] || '') + ',' + (set.evs['spd'] || '') + ',' + (set.evs['spe'] || '');
			}
			if (evs === '|,,,,,') {
				buf += '|';
				// doing it this way means packTeam doesn't need to be past-gen aware
				if (set.evs['hp'] === 0) buf += '0';
			} else {
				buf += evs;
			}

			// gender
			if (set.gender && set.gender !== template.gender) {
				buf += '|' + set.gender;
			} else {
				buf += '|';
			}

			// ivs
			let ivs = '|';
			if (set.ivs) {
				ivs = '|' + (set.ivs['hp'] === 31 || set.ivs['hp'] === undefined ? '' : set.ivs['hp']) + ',' + (set.ivs['atk'] === 31 || set.ivs['atk'] === undefined ? '' : set.ivs['atk']) + ',' + (set.ivs['def'] === 31 || set.ivs['def'] === undefined ? '' : set.ivs['def']) + ',' + (set.ivs['spa'] === 31 || set.ivs['spa'] === undefined ? '' : set.ivs['spa']) + ',' + (set.ivs['spd'] === 31 || set.ivs['spd'] === undefined ? '' : set.ivs['spd']) + ',' + (set.ivs['spe'] === 31 || set.ivs['spe'] === undefined ? '' : set.ivs['spe']);
			}
			if (ivs === '|,,,,,') {
				buf += '|';
			} else {
				buf += ivs;
			}

			// shiny
			if (set.shiny) {
				buf += '|S';
			} else {
				buf += '|';
			}

			// level
			if (set.level && set.level !== 100) {
				buf += '|' + set.level;
			} else {
				buf += '|';
			}

			// happiness
			if (set.happiness !== undefined && set.happiness !== 255) {
				buf += '|' + set.happiness;
			} else {
				buf += '|';
			}
		}
		return buf;
	},
	unpackTeam: function (team) {
		if (!team) return [];
		team = team.split(']');
		let buf = [];

		for (let i = 0; i < team.length; i++) {
			let set = team[i];
			let parts = set.split('|');
			let obj = {};

			if (parts[0]) obj.name = parts[0];
			let pokemon = Tools.getTemplate(parts[1]);
			if (!pokemon.exists) continue; // Invalid species
			obj.species = pokemon.species;

			if (parts[2]) obj.item = Tools.getItem(parts[2]).name;

			let ability = parts[3];
			if (parseInt(ability) === 1) {
				obj.ability = pokemon.abilities[1];
			} else if (toId(ability) === 'h') {
				obj.ability = pokemon.abilities['H'];
			} else {
				obj.ability = pokemon.abilities[0];
			}

			let moves = parts[4].split(',');
			obj.moves = [];
			for (let j = 0; j < moves.length; j++) {
				obj.moves.push(Tools.getMove(moves[j]).name);
			}

			obj.nature = parts[5];

			obj.evs = {};
			if (parts[6]) {
				parts[6] = parts[6].split(',');
				let evs = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
				for (let j = 0; j < parts[6].length; j++) {
					obj.evs[evs[j]] = (parts[6][j] ? parts[6][j] : 0);
				}
			}

			if (parts[7]) obj.gender = parts[7];

			obj.ivs = {};
			if (parts[8]) {
				parts[8] = parts[8].split(',');
				let ivs = ['hp', 'atk', 'def', 'spa', 'spd', 'spe'];
				for (let j = 0; j < parts[8].length; j++) {
					obj.ivs[ivs[j]] = (parts[8][j] ? parts[8][j] : undefined);
				}
			}

			obj.shiny = false;
			if (parts[9] === 'S') obj.shiny = true;
			obj.level = 100;
			if (parts[10]) obj.level = parseInt(parts[10]);
			obj.happiness = 255;
			if (parts[11]) obj.happiness = parseInt(parts[11]);

			buf.push(obj);
		}

		return buf;
	},
	calcExp: function (pokemon, level) {
		let n = level;
		pokemon = toId(pokemon);
		let type = getEXPType(pokemon);
		let EXP;
		switch (type) {
		case 'erratic':
			if (n <= 50) EXP = ((Math.pow(n, 3) * (100 - n))) / 50;
			if (50 <= n <= 68) EXP = ((Math.pow(n, 3) * (150 - n))) / 100;
			if (68 <= n <= 98) EXP = ((Math.pow(n, 3) * ((1911 - (10 * n)) / 3))) / 500;
			if (98 <= n <= 100) EXP = ((Math.pow(n, 3) * (160 - n))) / 100;
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
			if (15 <= n <= 36) EXP = Math.pow(n, 3) * ((n + 14) / 50);
			if (36 <= n <= 100) EXP = Math.pow(n, 3) * (((n / 2) + 32) / 50);
			break;
		}
		if (EXP < 0) return 0; // Experience underflow glitch
		return EXP;
	},
	getGain: function (userid, pokemon, foe, particpated) {
		let a = 1, t = (pokemon.ot === userid ? 1 : 1.5), e = (toId(pokemon.item) === 'luckyegg' ? 1.5 : 1), L = foe.level, Lp = pokemon.level, p = 1, s = (particpated ? 2 : 1);
		/* TODO
		b is the base experience yield of the fainted Pokémon's species; values for the current Generation are listed here ( http://bulbapedia.bulbagarden.net/wiki/List_of_Pok%C3%A9mon_by_effort_value_yield )
		TODO base experience yeild => JSON
		* * * * *
		using default atm...
		Why 57 for b as default? The test mons are low formes.
		*/
		let b = 57;
		return (((a * b * L) / (5 * s)) * (Math.pow((2 * L + 10), 2.5) / Math.pow((L + Lp + 10), 2.5)) + 1) * t * e * p;
	},
};

// last two functions needed to make sure SG.regdate() fully works
function loadRegdateCache() {
	try {
		regdateCache = JSON.parse(fs.readFileSync('config/regdate.json', 'utf8'));
	} catch (e) {}
}
loadRegdateCache();

function saveRegdateCache() {
	fs.writeFileSync('config/regdate.json', JSON.stringify(regdateCache));
}

function getEXPType(pokemon) {
	return SG.gameData[pokemon].expType;
}
