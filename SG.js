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
	masterGameObj: {},
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
	},
	makeCOM: function () {
		if (Users('sgserver')) return false; // Already exists!
		let user = new Users.User({user: false, send: function() {}, inRooms: new Set(), worker: {send: function() {}}, socketid: false, ip: '', protocal: '', autojoin: '', isCOM: true}); // Fake connection object, fill it with whats needed to prevent crashes
		user.connected = false; // Technically isnt connected
		user.forceRename('SG Server', true); // I have this name registed for use here. - HoeenHero
		return user;
	},
	makeWildPokemon: function (location) {
		//TODO
		return "|lotad|||astonish,growl,absorb|Hasty|||30,21,21,28,29,19||6|0";
	}
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
