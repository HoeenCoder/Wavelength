/**
 * Miscellaneous commands
 *
 * Fixed/Improved upon by: The Run, HoeenHero, and Mystifi.
 */

'use strict';

let fs = require('fs');
let moment = require('moment');
let request = require('request');
let regdateCache = {};

let badges = fs.createWriteStream('badges.txt', {'flags': 'a'});

function loadRegdateCache() {
	try {
		regdateCache = JSON.parse(fs.readFileSync('config/regdate.json', 'utf8'));
	} catch (e) {}
}
loadRegdateCache();

function saveRegdateCache() {
	fs.writeFileSync('config/regdate.json', JSON.stringify(regdateCache));
}


function getLastSeen (userid) {
	if (!global.LastSeen) return "(not available)";
	if (!LastSeen[userid]) return null;
	let f = new Date(LastSeen[userid]);
	let n = new Date(); // Now
	let diff = (Date.now() - LastSeen[userid]) / 1000;
	let text;
	if (diff > 24 * 60 * 60) {
		let days = Math.floor(diff / (24 * 60 * 60));
		text = days + " " + (days === 1 ? "day" : "days");
		let hours = Math.floor(diff / (60 * 60)) - days * 24;
		if (hours) text += ", " + hours + " " + (hours === 1 ? "hour" : "hours");
	} else {
		text = diff.seconds().duration();
	}
	return f.toString().substr(0, 25) + " (" + text + " ago)";
}

function clearRoom(room) {
	let len = (room.log && room.log.length) || 0;
	let users = [];
	while (len--) {
		room.log[len] = '';
	}
	for (let u in room.users) {
		users.push(u);
		Users(u).leaveRoom(room, Users(u).connections[0]);
	}
	len = users.length;
	setTimeout(() => {
		while (len--) {
			Users(users[len]).joinRoom(room, Users(users[len]).connections[0]);
		}
	}, 1000);
}

exports.commands = {
	globalauth: 'gal',
	stafflist: 'gal',
	authlist: 'gal',
	auth: 'gal',
	gal: function (target, room, user, connection) {
		let rankLists = {};
		let ranks = Object.keys(Config.groups);
		let persons = [];
		for (let u in Users.usergroups) {
			let rank = Users.usergroups[u].charAt(0);
			if (ranks.indexOf(rank) >= 0) {
				let name = Users.usergroups[u].substr(1);
				persons.push({name: name, rank: rank});
			}
		}
		let staff = {
			"admins": [],
			"leaders": [],
			"bots": [],
			"mods": [],
			"drivers": [],
			"voices": []
		};
		persons = persons.sort((a, b) => toId(a.name).localeCompare(toId(b.name))); // No need to return, arrow functions with single lines have an implicit return
		function nameColor (name) {
			if (Users.getExact(name) && Users(name).connected) {
				return '<b><i><font color="' + hashColorWithCustoms(name) + '">' + Tools.escapeHTML(Users.getExact(name).name) + '</font></i></b>';
			} else {
				return '<font color="' + hashColorWithCustoms(name) + '">' + Tools.escapeHTML(name) + '</font>';
			}
		}
		for (let j = 0; j < persons.length; j++) {
			let rank = persons[j].rank;
			let person = persons[j].name;
			switch (rank) {
				case '~':
					staff['admins'].push(nameColor(person));
					break;
				case '&':
					staff['leaders'].push(nameColor(person));
					break;
				case '*':
					staff['bots'].push(nameColor(person));
					break;
				case '@':
					staff['mods'].push(nameColor(person));
					break;
				case '%':
					staff['drivers'].push(nameColor(person));
					break;
				case '+':
					staff['voices'].push(nameColor(person));
					break;
				default:
					continue;

			}
		}
		connection.popup('|html|' +
			'<h3>SpacialGaze Authority List</h3>' +
			'<b><u>~Administrators (' + staff['admins'].length + ')</u></b>:<br />' + staff['admins'].join(', ') +
			'<br />' +
			'<br /><b><u>&Leaders (' + staff['leaders'].length + ')</u></b>:<br />' + staff['leaders'].join(', ') +
			'<br />' +
			'<br /><b><u>*Bots (' + staff['bots'].length + ')</u></b><br />' + staff['bots'].join(', ') +
			'<br />' +
			'<br /><b><u>@Moderators (' + staff['mods'].length + ')</u></b>:<br />' + staff['mods'].join(', ') +
			'<br />' +
			'<br /><b><u>%Drivers (' + staff['drivers'].length + ')</u></b>:<br />' + staff['drivers'].join(', ') +
			'<br />' +
			'<br /><b><u>+Voices (' + staff['voices'].length + ')</u></b>:<br />' + staff['voices'].join(', ') +
			'<br /><br /><blink>(<b>Bold</b> / <i>Italic</i> = Currently Online)</blink>'
		);
	},

	clearall: function (target, room, user) {
		if (!this.can('declare')) return false;
		if (room.battle) return this.sendReply("You cannot clearall in battle rooms.");

		clearRoom(room);
	},

	gclearall: 'globalclearall',
	globalclearall: function (target, room, user) {
		if (!this.can('gdeclare')) return false;

		Rooms.rooms.forEach(room => clearRoom(room));
		Users.users.forEach(user => user.popup('All rooms have been cleared.'));
	},

	contact:'whotocontact',
	wtc: 'whotocontact',
	whotocontact: function (target, room, user) {
		return this.sendReplyBox(
			'<b><u><font color="#008ae6"><h2>Who to Contact</u></b></font></h2>' +
			'<h3>For those who don\'t exactly know who to contact about a certain situation, this guide will help you contact the right person!</h3>'  +
			'<hr>' +
			'<b>Global Drivers (%):</b> - Its best to contact a Global Driver if there are any forms of trolling, spamming, or severely negative behavior. If you ever witness this, please contact them as soon as possible. <br />' +
			'<hr>' +
			'<b>Global Moderators (@)</b> - Normally if there are multiple spammers, Global Mods can be contacted to resolve the issue.  <br />' +
			'<hr>' +
			'<b>Global Leaders (&)</b> - Its best to contact a Leader if there are any issues with Global Auth or Room Owners. It is up to the Leaders to make the final decision of any situation reported. At the same time, they also handle requests on appointing Room Owners and creating/deregistering a room. <br />' +
			'<hr>' +
			'<b>Administrators (~)</b> - Administrators are to be contacted if there is a serious issue. This may include sexual harrassment and/or abuse of power from Room Owners as well as Global Staff. Its also important to contact Administrators if there are any bugs within the server system that need to be looked at.  <br />'
		);
	},

	roomlist: function (target, room, user) {
		if (!this.can('hotpatch')) return;

		let header = ['<b><font color="#1aff1a" size="2">Total users connected: ' + Rooms.global.userCount + '</font></b><br />'],
			official = ['<b><font color="#ff9900" size="2"><u>Official Rooms:</u></font></b><br />'],
			nonOfficial = ['<hr><b><u><font color="#005ce6" size="2">Public Rooms:</font></u></b><br />'],
			privateRoom = ['<hr><b><u><font color="#ff0066" size="2">Private Rooms:</font></u></b><br />'],
			groupChats = ['<hr><b><u><font color="#00b386" size="2">Group Chats:</font></u></b><br />'],
			battleRooms = ['<hr><b><u><font color="#cc0000" size="2">Battle Rooms:</font></u></b><br />']

		let rooms = [];

		Rooms.rooms.forEach(curRoom => {
			if (curRoom.id !== 'global') rooms.push(curRoom.id);
		});

		rooms.sort();

		for (let u in rooms) {
			let curRoom = Rooms(rooms[u]);
			if (curRoom.type === 'battle') {
				battleRooms.push('<a href="/' + curRoom.id + '" class="ilink">' + Tools.escapeHTML(curRoom.title) + '</a> (' + curRoom.userCount + ')');
			}
			if (curRoom.type === 'chat') {
				if (curRoom.isPersonal) {
					groupChats.push('<a href="/' + curRoom.id + '" class="ilink">' + curRoom.id + '</a> (' + curRoom.userCount + ')');
					continue;
				}
				if (curRoom.isOfficial) {
					official.push('<a href="/' + toId(curRoom.title) + '" class="ilink">' + Tools.escapeHTML(curRoom.title) + '</a> (' + curRoom.userCount + ')');
					continue;
				}
				if (curRoom.isPrivate) {
					privateRoom.push('<a href="/' + toId(curRoom.title) + '" class="ilink">' + Tools.escapeHTML(curRoom.title) + '</a> (' + curRoom.userCount + ')');
					continue;
				}
			}
			if (curRoom.type !== 'battle') nonOfficial.push('<a href="/' + toId(curRoom.title) + '" class="ilink">' + curRoom.title + '</a> (' + curRoom.userCount + ')');
		}
		this.sendReplyBox(header + official.join(' ') + nonOfficial.join(' ') + privateRoom.join(' ') + (groupChats.length > 1 ? groupChats.join(' ') : '') + (battleRooms.length > 1 ? battleRooms.join(' ') : ''));
	},

	hide: 'hideauth',
	hideauth: function (target, room, user) {
		if (!user.can('roomowner')) return this.sendReply("/hideauth - Access Denied.");
		let tar = ' ';
		if (target) {
			target = target.trim();
			if (Config.groupsranking.indexOf(target) > -1 && target != '#') {
				if (Config.groupsranking.indexOf(target) <= Config.groupsranking.indexOf(user.group)) {
					tar = target;
				} else {
					this.sendReply('The group symbol you have tried to use is of a higher authority than you have access to. Defaulting to \' \' instead.');
			}
			} else {
				this.sendReply('You have tried to use an invalid character as your auth symbol. Defaulting to \' \' instead.');
			}
		}
		user.getIdentity = function (roomid) {
			if (this.locked) {
				return '‽' + this.name;
			}
			if (roomid) {
				let room = Rooms.rooms.get(roomid);
				if (room.isMuted(this)) {
					return '!' + this.name;
				}
				if (room && room.auth) {
					if (room.auth[this.userid]) {
						return room.auth[this.userid] + this.name;
					}
					if (room.isPrivate === true) return ' ' + this.name;
				}
			}
			return tar + this.name;
		}
		user.updateIdentity();
		this.sendReply('You are now hiding your auth symbol as \'' + tar + '\'.');
	},
	hidehelp: ["/hide - Hides user's global rank. Requires: & ~"],

	show: 'showauth',
	showauth: function (target, room, user) {
		if (!user.can('roomowner')) return this.sendReply("/showauth - Access Denied.");
		delete user.getIdentity;
		user.updateIdentity();
		this.sendReply("You have now revealed your auth symbol.");
		this.sendReply("Your symbol has been reset.");
	},
	showhelp: ["/show - Displays user's global rank. Requires: & ~"],

	credits: function (target, room, user) {
		function name (name, bold) {
			if (bold) {
				return "<b><font color=" + hashColorWithCustoms(name) + ">" + Tools.escapeHTML(name) + "</font></b>";
			} else {
				return "<font color=" + hashColorWithCustoms(name) + ">" + Tools.escapeHTML(name) + "</font>";
			}
		}
		let popup = "|html|" + "<font size=5 color=#0066ff><u><b>SpacialGaze Credits</b></u></font><br />" +
			"<br />" +
			"<u><b>Staff:</u></b><br />" +
			"- " + (name)('Mystifi', true) + " (Owner, Sysadmin, Development)<br />" +
			"- " + (name)('HoeenHero', true) + " (Sysadmin, Development)<br />" +
			"<br />" +
			"<u><b>Contributors:</b></u><br />" +
			"- " + (name)('Opple', true) + " (Social Media Lead)<br />" +
			"<br />" +
			"<u><b>Retired Staff:</b></u><br />" +
			"- " + (name)('The Run', true) + " (Former Server Owner)<br />" +
			"- " + (name)('Vulcaron', true) + " (Former Policy Leader)<br />" +
			"<br />" +
			"<u><b>Special Thanks:</b></u><br />" +
			"- Staff Members<br />" +
			"- Our Regular Users<br />";
		user.popup(popup);
	},

	/* Friendcode command in profile.js
	friendcodehelp: function (target, room, user) {
		if (!this.runBroadcast()) return;
		this.sendReplyBox('<b>Friend Code Help:</b> <br><br />' +
			'/friendcode (/fc) [friendcode] - Sets your Friend Code.<br />' +
			'/getcode (gc) - Sends you a popup of all of the registered user\'s friend codes.<br />' +
			'/deletecode [user] - Deletes this user\'s friend code from the server (Requires %, @, &, ~)<br>' +
			'<i>--Any questions, PM The Run, HoeenHero, or Mystifi!</i>');
	},
	friendcode: 'fc',
	fc: function (target, room, user, connection) {
		if (!target) {
			return this.sendReply("Enter in your friend code. Make sure it's in the format: xxxx-xxxx-xxxx or xxxx xxxx xxxx or xxxxxxxxxxxx.");
		}
		let fc = target;
		fc = fc.replace(/-/g, '');
		fc = fc.replace(/ /g, '');
		if (isNaN(fc)) return this.sendReply("The friend code you submitted contains non-numerical characters. Make sure it's in the format: xxxx-xxxx-xxxx or xxxx xxxx xxxx or xxxxxxxxxxxx.");
		if (fc.length < 12) return this.sendReply("The friend code you have entered is not long enough! Make sure it's in the format: xxxx-xxxx-xxxx or xxxx xxxx xxxx or xxxxxxxxxxxx.");
		fc = fc.slice(0, 4) + '-' + fc.slice(4, 8) + '-' + fc.slice(8, 12);
		let codes = fs.readFileSync('config/friendcodes.txt', 'utf8');
		if (codes.toLowerCase().indexOf(user.name) > -1) {
			return this.sendReply("Your friend code is already here.");
		}
		fs.writeFileSync('config/friendcodes.txt', codes + '\n' + user.name + ': ' + fc);
		return this.sendReply("Your friend code: " + fc + " has been set.");
	},
	viewcode: 'gc',
	getcodes: 'gc',
	viewcodes: 'gc',
	vc: 'gc',
	getcode: 'gc',
	gc: function (target, room, user, connection) {
		let codes = fs.readFileSync('config/friendcodes.txt', 'utf8');
		return user.send('|popup|' + codes);
	},
	deletecode: function (target, room, user) {
		if (!target) {
			return this.sendReply('/deletecode [user] - Deletes the Friend Code of the User.');
		}
		if (!this.can('lock')) return false;
		fs.readFile('config/friendcodes.txt', 'utf8', (err, data) => {
			if (err) console.log(err);
			let row = ('' + data).split('\n');
			let match = false;
			let line = '';
			for (let i = row.length; i > -1; i--) {
				if (!row[i]) continue;
				let line = row[i].split(':');
				if (target === line[0]) {
					match = true;
					line = row[i];
				}
				break;
			}
			if (match === true) {
				let re = new RegExp(line, 'g');
				let result = data.replace(re, '');
				fs.writeFile('config/friendcodes.txt', result, 'utf8', err => {
					if (err) return this.sendReply(err);
					this.sendReply('The Friendcode ' + line + ' has been deleted.');
				});
			} else {
				this.sendReply('There is no match.');
			}
		});
	},
	*/
	rk: 'kick',
	roomkick: 'kick',
	kick: function (target, room, user) {
		if (!target) return this.parse('/help kick');
		if (!this.canTalk() && !user.can('bypassall')) {
			return this.sendReply("You cannot do this while unable to talk.");
		}

		target = this.splitTarget(target);
		let targetUser = this.targetUser;
		if (!targetUser || !targetUser.connected) return this.sendReply("User \"" + this.targetUsername + "\" not found.");
		if (!this.can('mute', targetUser, room)) return false;

		this.addModCommand(targetUser.name + " was kicked from the room by " + user.name + ".");
		targetUser.popup("You were kicked from " + room.id + " by " + user.name + ".");
		targetUser.leaveRoom(room.id);
	},
	kickhelp: ["/kick - Kick a user out of a room. Requires: % @ # & ~"],

	masspm: 'pmall',
	pmall: function (target, room, user) {
		if (!this.can('pmall')) return false;
		if (!target) return this.parse('/help pmall');

		let pmName = ' Server Info [Do Not Respond!]';
		Users.users.forEach(curUser => {
			let message = '|pm|' + pmName + '|' + curUser.getIdentity() + '|' + target;
			curUser.send(message);
		});
	},
	pmallhelp: ["/pmall [message]."],

	staffpm: 'pmallstaff',
	pmstaff: 'pmallstaff',
	pmallstaff: function (target, room, user) {
		if (!this.can('forcewin')) return false;
		if (!target) return this.parse('/help pmallstaff');

		let pmName = ' InFo.Staff';

		Users.users.forEach(curUser => {
			if (!curUser.isStaff) return;
			let message = '|pm|' + pmName + '|' + curUser.getIdentity() + '|' + target;
			curUser.send(message);
		});
	},
	pmallstaffhelp: ["/pmallstaff [message]"],

	hc: function (room, user, cmd) {
		return this.parse('/hotpatch chat');
	},

	hf: function (room, user, cmd) {
		return this.parse('/hotpatch formats');
	},

	hb: function (room, user, cmd) {
		return this.parse('/hotpatch battles');
	},

	hv: function (room, user, cmd) {
		return this.parse('/hotpatch validator');
	},

	regdate: function (target, room, user, connection) {
		if (!target) target = user.name;
		let targetUser = toId(target);
		if (targetUser.length < 1 || targetUser.length > 19) {
			return this.sendReply("Usernames can not be less than one character or longer than 19 characters. (Current length: " + targetUser.length + ".)");
		}
		if (!this.runBroadcast()) return;
		if (regdateCache[targetUser]) {
			this.sendReplyBox(regdateReply(regdateCache[targetUser]));
		} else {
			request('http://pokemonshowdown.com/users/' + targetUser + '.json', (error, response, body) => {
				let data = JSON.parse(body);
				let date = data['registertime'];
				if (date !== 0 && date.toString().length < 13) {
					while (date.toString().length < 13) {
						date = Number(date.toString() + '0');
					}
				}
				this.sendReplyBox(regdateReply(date));
				if (date !== 0) {
					regdateCache[targetUser] = date;
					saveRegdateCache();
				}
			});
		}

		function regdateReply(date) {
			if (date === 0) {
				return "<b><font color=\"" + hashColorWithCustoms(targetUser) + "\">" + Tools.escapeHTML(target) + "</font> is not registered.";
			} else {
				return "<b><font color=\"" + hashColorWithCustoms(targetUser) + "\">" + Tools.escapeHTML(target) + "</font></b> was registered on " + moment(date).format("dddd, MMMM DD, YYYY HH:mm A") + ".";
			}
			room.update();
		}
	},
	regdatehelp: ["/regdate - Gets the regdate (register date) of a username."],

	uor: 'usersofrank',
	usersofrank: function (target, room, user) {
		if (!target || !Config.groups[target]) return false;
		if (!this.runBroadcast()) return;
		let names = [];
		Users.users.forEach(user => {
			if (user.group === target) {
				names.push(user.name);
			}
		});
		names = names.sort();
		if (names.length < 1) return this.sendReplyBox('There are no users of the rank <font color="#24678d"><b>' + Tools.escapeHTML(Config.groups[target].name) + '</b></font> currently online.');
		return this.sendReplyBox('There ' + (names.length === 1 ? 'is' : 'are') + ' <font color="#24678d"><b>' + names.length + '</b></font> ' + (names.length === 1 ? 'user' : 'users') + ' with the rank <font color="#24678d"><b>' + Config.groups[target].name + '</b></font> currently online.<br />' + names.join(', '));
	},

	sg: 'spacialgazerepo',
	sgr: 'spacialgazerepo',
	repo: 'spacialgazerepo',
	spacialgazerepo: function (target, room, user) {
		if (!this.runBroadcast()) return;
		this.sendReply("|raw|<a href='https://github.com/HoeenCoder/SpacialGaze'>SpacialGaze\'s repo</a>");
	},
	showdownboilerplatehelp: ["/spacialgazerepo - Links to the SpacialGaze repository on Github."],

	seen: function (target, room, user) {
		if (!this.runBroadcast()) return;
		if (!target) return this.parse('/help seen');
		let targetUser = Users.get(target);
		if (targetUser && targetUser.connected) return this.sendReplyBox(targetUser.name + " is <b><font color=#00cc00>currently online</b></font>.");
		target = Tools.escapeHTML(target);
		let seen = Db('seen').get(toId(target));
		if (!seen) return this.sendReplyBox(target + " has <font color=#e60000>never been online</font> on this server.");
		this.sendReplyBox(target + " <font color=#ff9900>was last seen</font><b> " + moment(seen).fromNow() + "</b>.");
	},
	seenhelp: ["/seen - Shows when the user last connected on the server."],

	tell: function (target, room, user, connection) {
		if (!target) return this.parse('/help tell');
		target = this.splitTarget(target);
		let targetUser = this.targetUser;
		if (!target) {
			this.sendReply("You forgot the comma.");
			return this.parse('/help tell');
		}

		if (targetUser && targetUser.connected) {
			return this.parse('/pm ' + this.targetUsername + ', ' + target);
		}

		if (user.locked) return this.popupReply("You may not send offline messages when locked.");
		if (target.length > 255) return this.popupReply("Your message is too long to be sent as an offline message (>255 characters).");

		if (Config.tellrank === 'autoconfirmed' && !user.autoconfirmed) {
			return this.popupReply("You must be autoconfirmed to send an offline message.");
		} else if (!Config.tellrank || Config.groupsranking.indexOf(user.group) < Config.groupsranking.indexOf(Config.tellrank)) {
			return this.popupReply("You cannot send an offline message because offline messaging is " +
				(!Config.tellrank ? "disabled" : "only available to users of rank " + Config.tellrank + " and above") + ".");
		}

		let userid = toId(this.targetUsername);
		if (userid.length > 18) return this.popupReply("\"" + this.targetUsername + "\" is not a legal username.");

		let sendSuccess = Tells.addTell(user, userid, target);
		if (!sendSuccess) {
			if (sendSuccess === false) {
				return this.popupReply("User " + this.targetUsername + " has too many offline messages queued.");
			} else {
				return this.popupReply("You have too many outgoing offline messages queued. Please wait until some have been received or have expired.");
			}
		}
		return connection.send('|pm|' + user.getIdentity() + '|' +
			(targetUser ? targetUser.getIdentity() : ' ' + this.targetUsername) +
			"|/text This user is currently offline. Your message will be delivered when they are next online.");
	},
	tellhelp: ["/tell [username], [message] - Send a message to an offline user that will be received when they log in."],

};
