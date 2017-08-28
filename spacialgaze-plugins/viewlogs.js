/*
 * Chat log viewer plugin by jd
 */
'use strict';

const fs = require('fs');
const MAX_LINES = 1000;

exports.commands = {
	viewlogs: function (target, room, user) {
		if (target) {
			let targets = target.split(',');
			for (let u in targets) targets[u] = targets[u].trim();
			if (!targets[1]) return this.errorReply("Please use /viewlogs with no target.");
			switch (toId(targets[0])) {
			case 'month':
				if (!targets[1]) return this.errorReply("Please use /viewlogs with no target.");
				if (!permissionCheck(user, targets[1])) return this.errorReply("/viewlogs - Access denied.");
				let months = fs.readdirSync('logs/chat/' + targets[1]);
				user.send("|popup||html|Choose a month:" + generateTable(months, "/viewlogs date," + targets[1] + ","));
				return;
			case 'date':
				if (!targets[2]) return this.errorReply("Please use /viewlogs with no target.");
				if (!permissionCheck(user, targets[1])) return this.errorReply("/viewlogs - Access denied.");
				let days = fs.readdirSync('logs/chat/' + targets[1] + '/' + targets[2]);
				user.send("|popup||html|Choose a date:" + generateTable(days, "/viewlogspopup " + targets[1] + ","));
				return;
			default:
				this.errorReply("/viewlogs - Command not recognized.");
				break;
			}
		}

		let rooms = fs.readdirSync('logs/chat');
		let roomList = [], groupChats = [];

		for (let u in rooms) {
			if (!rooms[u]) continue;
			if (rooms[u] === 'README.md') continue;
			if (!permissionCheck(user, rooms[u])) continue;
			(rooms[u].includes('groupchat-') ? groupChats : roomList).push(rooms[u]);
		}
		if (roomList.length < 1) return this.errorReply("You don't have access to view the logs of any rooms.");

		let output = "Choose a room to view the logs:";
		output += generateTable(roomList, "/viewlogs month,");
		output += "<br />Group Chats:" + generateTable(groupChats, "/viewlogs month,");
		user.send("|popup||wide||html|" + output);
	},

	viewlogspopup: 'viewlogs2',
	viewlogs2: function (target, room, user, connection, cmd) {
		if (!target) return this.sendReply("Usage: /viewlogs [room], [year-month-day / 2014-12-08] - Provides you with a temporary link to view the target rooms chat logs.");
		let targetSplit = target.split(',');
		if (!targetSplit[1]) return this.sendReply("Usage: /viewlogs [room], [year-month-day / 2014-12-08] -Provides you with a temporary link to view the target rooms chat logs.");
		for (let u in targetSplit) targetSplit[u] = targetSplit[u].trim();
		let targetRoom = targetSplit[0];
		if (!permissionCheck(user, targetRoom)) return this.errorReply("/viewlogs - Access denied.");
		let date;
		if (toId(targetSplit[1]) === 'today' || toId(targetSplit[1]) === 'yesterday') {
			date = new Date();
			if (toId(targetSplit[1]) === 'yesterday') date.setDate(date.getDate() - 1);
			date = date.toLocaleDateString('en-US', {
				day : 'numeric',
				month : 'numeric',
				year : 'numeric',
			}).split('/').reverse();
			if (date[1] < 10) date[1] = "0" + date[1];
			if (date[2] < 10) date[2] = "0" + date[2];
			targetSplit[1] = date[0] + '-' + date[2] + '-' + date[1];
		}
		date = targetSplit[1].replace(/\.txt/, '');
		let splitDate = date.split('-');
		if (splitDate.length < 3) return this.sendReply("Usage: /viewlogs [room], [year-month-day / 2014-12-08] -Provides you with a temporary link to view the target rooms chat logs.");

		fs.readFile('logs/chat/' + targetRoom.toLowerCase() + '/' + splitDate[0] + '-' + splitDate[1] + '/' + date + '.txt', 'utf8', (err, data) => {
			if (err && err.code === "ENOENT") return user.send("|popup||html|<font color=\"red\">No logs found.</font>");
			if (err) return this.errorReply("/viewlogs - Error: " + err);
			fs.appendFile('logs/viewlogs.log', '[' + new Date().toUTCString() + '] ' + user.name + " viewed the logs of " + toId(targetRoom) + ". Date: " + date + '\n');
			let filename = require('crypto').randomBytes(4).toString('hex');

			if (!user.can('warn', null, Rooms(targetRoom))) {
				let lines = data.split('\n');
				for (let line in lines) {
					if (lines[line].substr(9).trim().charAt(0) === '(') lines.slice(line, 1);
				}
				data = lines.join('\n');
			}

			if (cmd === 'viewlogspopup') {
				let output = 'Displaying room logs of room "' + Chat.escapeHTML(targetRoom) + '" on ' + Chat.escapeHTML(date) + '<br />';
				data = data.split('\n');
				for (let u in data) {
					if (data[u].length < 1) continue;
					let message = parseMessage(data[u], user.userid);
					if (message.length < 1) continue;
					output += message + '<br />';
				}
				return user.send("|popup||wide||html|" + output);
			}

			data = targetRoom + "|" + date + "|" + JSON.stringify(SG.customColors) + "\n" + data;

			fs.writeFile('static/logs/' + filename, data, err => {
				if (err) return this.errorReply("/viewlogs - " + err);
				this.sendReply(
					"|raw|You can view the logs at <a href=\"http://158.69.196.64:" + Config.port +
					"/logs/logviewer.html?file=" + filename + "\">http://158.69.196.64:" + Config.port +
					"/logs/logviewer.html?file=" + filename + "</a>"
				);
				setTimeout(function () {
					fs.unlink('static/logs/' + filename);
				}, 1 * 1000 * 60);
			});
		});
	},

	searchlogs: function (target, room, user) {
		if (!target) return this.parse('/help searchlogs');
		let targets = target.split(',');
		for (let u in targets) targets[u] = targets[u].trim();
		if (!targets[1]) return this.errorReply("Please specify a phrase to search.");

		if (toId(targets[0]) === 'all' && !this.can('hotpatch')) return false;
		if (!permissionCheck(user, toId(targets[0]))) return false;

		fs.appendFile('logs/viewlogs.log', '[' + new Date().toUTCString() + '] ' + user.name + " searched the logs of " + toId(targets[0]) +
		" for '" + targets[1] + "'." + '\n');

		let pattern = escapeRegExp(targets[1]).replace(/\\\*/g, '.*');
		let command = 'grep -Rnw \'./logs/chat/' + (toId(targets[0]) === 'all' ? '' : toId(targets[0])) + '\' -e "' + pattern + '"';

		require('child_process').exec(command, function (error, stdout, stderr) {
			if (error && stderr) {
				user.popup("/searchlogs doesn't support Windows.");
				console.log("/searchlogs error: " + error);
				return false;
			}
			if (!stdout) return user.popup('Could not find any logs containing "' + pattern + '".');
			let output = '';
			stdout = stdout.split('\n');
			for (let i = 0; i < stdout.length; i++) {
				if (stdout[i].length < 1 || i > MAX_LINES) continue;
				let file = stdout[i].substr(0, stdout[i].indexOf(':'));
				let lineNumber = stdout[i].split(':')[1];
				let line = stdout[i].split(':');
				line.splice(0, 2);
				line = line.join(':');
				let message = parseMessage(line, user.userid);
				if (message.length < 1) continue;
				output += '<font color="#970097">' + Chat.escapeHTML(file) + '</font><font color="#00AAAA">:</font><font color="#008700">' + lineNumber +
					'</font><font color="#00AAAA">:</font>' + message + '<br />';
			}
			user.send('|popup||wide||html|Displaying last ' + MAX_LINES + ' lines containing "' + Chat.escapeHTML(pattern) + '"' +
				(toId(targets[0]) === 'all' ? '' : ' in "' + Chat.escapeHTML(targets[0]) + '"') + ':<br /><br />' + output);
		});
	},
	searchlogshelp: ["/searchlogs [room / all], [phrase] - Phrase may contain * wildcards."],
};

function permissionCheck(user, room) {
	if (Rooms(room)) {
		room = Rooms(room);
		if (room.auth && room.auth[user.userid] && room.auth[user.userid] !== '+') return true; // roomauth check
		if (!user.can('lock')) return false;
		let grouplist = ['+', '%', '@', '&', '~']; // hardcoded because permissions are hardcoded too
		let minRank = '%';
		if (room.isPrivate === true) minRank = '&';
		if (room.isPrivate === 'hidden') minRank = '@';
		if (room.modjoin && (grouplist.indexOf(room.modjoin) > grouplist.indexOf(minRank))) minRank = room.modjoin;
		// Staff room overides
		if (toId(room.title) === 'staff') minRank = '%';
		if (toId(room.title) === 'upperstaff') minRank = '&';
		if (grouplist.indexOf(user.group) < grouplist.indexOf(minRank)) return false;
	} else {
		if (room.startsWith('groupchat')) return true;
		if (!user.can('hotpatch')) return false;
	}
	return true;
}

function generateTable(array, command) {
	let output = "<table>";
	let count = 0;
	for (let u in array) {
		if (array[u] === 'today.txt') continue;
		if (count === 0) output += "<tr>";
		output += '<td><button style="width: 100%" name="send" value="' + command + Chat.escapeHTML(array[u]) + '">' +
		(Rooms(array[u]) ? '' : '<font color="red">') + Chat.escapeHTML(array[u]) + (Rooms(array[u]) ? '' : '</font>') + '</button></td>';
		count++;
		if (count > 3) {
			output += '<tr />';
			count = 0;
		}
	}
	output += '</table>';
	return output;
}

function escapeRegExp(s) {
	return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'); // eslint-disable-line no-useless-escape
}

function parseMessage(message, user) {
	let timestamp = message.substr(0, 9).trim();
	message = message.substr(9).trim();
	let lineSplit = message.split('|');

	let name, highlight, div;

	switch (lineSplit[1]) {
	case 'c':
		name = lineSplit[2];
		if (name === '~') break;
		highlight = new RegExp("\\b" + toId(user) + "\\b", 'gi');
		div = "chat";
		if (lineSplit.slice(3).join('|').match(highlight)) div = "chat highlighted";
		message = '<span class="' + div + '"><small>[' + timestamp + ']</small> ' + '<small>' + name.substr(0, 1) +
		'</small><b><font color="' + SG.hashColor(name.substr(1)) + '">' + name.substr(1, name.length) + ':</font></b><em>' +
		SG.parseMessage(lineSplit.slice(3).join('|')) + '</em></span>';
		break;
	case 'c:':
		name = lineSplit[3];
		if (name === '~') break;
		highlight = new RegExp("\\b" + toId(user) + "\\b", 'gi');
		div = "chat";
		if (lineSplit.slice(4).join('|').match(highlight)) div = "chat highlighted";

		while (lineSplit[2].length < 13) lineSplit[2] = lineSplit[2] + "0";

		let date = new Date(Number(lineSplit[2]));
		let components = [date.getHours(), date.getMinutes(), date.getSeconds()];
		timestamp = components.map(function (x) { return (x < 10) ? '0' + x : x;}).join(':');

		message = '<span class="' + div + '"><small>[' + timestamp + ']</small> ' + '<small>' + name.substr(0, 1) +
		'</small>' + SG.nameColor(toId(name), true) + '<em>' +
		SG.parseMessage(lineSplit.slice(4).join('|')) + '</em></span>';
		break;
	case 'uhtml':
		message = '<span class="notice">' + lineSplit.slice(3).join('|').trim() + '</span>';
		break;
	case 'raw':
	case 'html':
		message = '<span class="notice">' + lineSplit.slice(2).join('|').trim() + '</span>';
		break;
	case '':
		message = '<span class="notice">' + Chat.escapeHTML(lineSplit.slice(1).join('|')) + '</span>';
		break;
	case 'j':
	case 'J':
	case 'l':
	case 'L':
	case 'N':
	case 'unlink':
	case 'userstats':
	case 'tournament':
	case 'uhtmlchange':
		message = "";
		break;
	default:
		message = '<span class="notice">' + Chat.escapeHTML(message) + '</span>';
		break;
	}
	return message;
}
