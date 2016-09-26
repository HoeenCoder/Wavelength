'use strict';

let fs = require('fs');
let http = require('http');

let regdateCache = {};

SG.nameColor = function (name, bold) {
        return (bold ? "<b>" : "") + "<font color=" + hashColorWithCustoms(name) + ">" + (Users(name) && Users(name).connected && Users.getExact(name) ? Tools.escapeHTML(Users.getExact(name).name) : Tools.escapeHTML(name)) + "</font>" + (bold ? "</b>" : "");
};
// usage: SG.nameColor(user.name, true) for bold OR SG.nameColor(user.name, false) for non-bolded.

SG.hashColor = function (user) {
    return hashColorWithCustoms(user);
}

SG.messageSeniorStaff = function (message, pmName, from) {
        pmName = (pmName ? pmName : '~Upper Staff PM');
	from = (from ? ' (PM from ' + from + ')' : '');
	Users.users.forEach(curUser => {
		if (curUser.group === '~' || curUser.group === '&') {
			curUser.send('|pm|' + pmName + '|' + curUser.getIdentity() + '|' + message + from);
		}
	});
};
// format: SG.messageSeniorStaff('message', 'person')
//
// usage: SG.messageSeniorStaff('Mystifi is a confirmed user and they were banned from a public room. Assess the situation immediately.', '~Server')
//
// this makes a PM from ~Server stating the message

SG.regdate = function (target, callback) {
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
};

SG.setTitle = function (userid, title, callback) {
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

SG.getTitle = function (userid, callback) {
	if (!callback) return false;
	userid = toId(userid);
	SG.database.all("SELECT title FROM users WHERE userid=$userid", {$userid: userid}, function (err, rows) {
		if (err) return console.log(err);
		callback(((rows[0] && rows[0].title) ? rows[0].title : ""));
	});
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
