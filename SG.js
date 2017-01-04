'use strict';

let fs = require('fs');
let http = require('http');
const Autolinker = require('autolinker');

let regdateCache = {};

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

	// We missed this when removing SQlite3, this should be cleaned up on the master branch
	/*setTitle: function (userid, title, callback) {
		userid = toId(userid);
		SG.database.all("SELECT * FROM users WHERE userid=$userid", {$userid: userid}, function (err, rows) {
			if (rows.length < 1) {
				SG.database.run("INSERT INTO users(userid, title) VALUES ($userid, $title)", {$userid: userid, $title: title}, function (err) {
					if (err) return console.log(err);
					if (callback) return callback();
				});
			} else {
				SG.database.run("UPDATE users SET title=$title WHERE userid=$userid", {$title: title, $userid: userid}, function (err) {
					if (err) return console.log(err);
					if (callback) return callback();
				});
			}
		});
	};

	getTitle: function (userid, callback) {
		if (!callback) return false;
		userid = toId(userid);
		SG.database.all("SELECT title FROM users WHERE userid=$userid", {$userid: userid}, function (err, rows) {
			if (err) return console.log(err);
			callback(((rows[0] && rows[0].title) ? rows[0].title : ""));
		});
	};*/

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
	makeCOM: function () {
		if (Users('sgserver')) return false; // Already exists!
		let user = new Users.User({user: false, send: function () {}, inRooms: new Set(), worker: {send: function () {}}, socketid: false, ip: '', protocal: '', autojoin: '', isCOM: true}); // Fake connection object, fill it with whats needed to prevent crashes
		user.connected = false; // Technically isnt connected
		user.avatar = 167;
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
	makeWildPokemon: function (location) {
		//TODO: locations
		let pokemon = ['lotad', 'snorunt', 'archen', 'klink', 'cacnea', 'cubchoo'][Math.floor(Math.random() * 6)]; //TODO pull from location
		if (!pokemon) return "ERROR!|unown|||hiddenpower|Serious|||0,0,0,0,0,0||1|0";
		pokemon = Tools.getTemplate(pokemon);
		let data = "|" + pokemon.id + "||";
		let ability = Math.round(Math.random());
		if (ability === 1 && !pokemon.abilities[1]) ability = 0; //TODO hidden abilities?
		data += (ability ? "1|" : "|");
		let lvl = Math.round(Math.random() * 5) + 2; //2 -> 7 for test. TODO base on location
		let moves = "";
		let raw = [];
		for (let move in pokemon.learnset) {
			for (let learned in pokemon.learnset[move]) {
				if (pokemon.learnset[move][learned].substr(0, 2) in {'7L': 1} && parseInt(pokemon.learnset[move][learned].substr(2)) <= lvl) {
					raw.push({move: move, lvl: pokemon.learnset[move][learned]});
				}
			}
		}
		raw = raw.sort(function (a, b) {return parseInt(a.lvl.substr(2)) - parseInt(b.lvl.substr(2));});
		for (let i = 0; i < 4; i++) {
			if (raw.length === 0) break;
			let target = raw.pop();
			moves += target.move + (raw.length === 0 ? "" : ",");
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
		if (data.split('|').length !== 12) return "ERROR!|unown|||hiddenpower|Serious|||0,0,0,0,0,0||1|0";
		return data;
		//return "|lotad|||astonish,growl,absorb|Hasty|||30,21,21,28,29,19||6|0";
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
