'use strict';

exports.commands = {
	globalauth: 'gal',
	stafflist: 'gal',
	authlist: 'gal',
	auth: 'gal',
	gal: function (target, room, user, connection) {
		let ranks = Object.keys(Config.groups);
		let persons = [];
		for (let u in Users.usergroups) {
			let rank = Users.usergroups[u].charAt(0);
			if (ranks.indexOf(rank) >= 0) {
				let name = Users.usergroups[u].substr(1);
				persons.push({
					name: name,
					rank: rank,
				});
			}
		}
		let staff = {
			"admins": [],
			"leaders": [],
			"bots": [],
			"mods": [],
			"drivers": [],
			"voices": [],
		};
		persons = persons.sort((a, b) => toId(a.name).localeCompare(toId(b.name))); // No need to return, arrow functions with single lines have an implicit return
		function nameColor(name) {
			if (Users.getExact(name) && Users(name).connected) {
				return '<b><i><font color="' + hashColorWithCustoms(name) + '">' + Chat.escapeHTML(Users.getExact(name).name) + '</font></i></b>';
			} else {
				return '<font color="' + hashColorWithCustoms(name) + '">' + Chat.escapeHTML(name) + '</font>';
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

	'!roomauth': true,
	roomstaff: 'roomauth',
	roomauth1: 'roomauth',
	roomauth: function (target, room, user, connection, cmd) {
		let userLookup = '';
		if (cmd === 'roomauth1') userLookup = '\n\nTo look up auth for a user, use /userauth ' + target;
		let targetRoom = room;
		if (target) targetRoom = Rooms.search(target);
		if (!targetRoom || targetRoom.id === 'global' || !targetRoom.checkModjoin(user)) return this.errorReply(`The room "${target}" does not exist.`);
		if (!targetRoom.auth) return this.sendReply("/roomauth - The room '" + (targetRoom.title || target) + "' isn't designed for per-room moderation and therefore has no auth list." + userLookup);

		let rankLists = {};
		for (let u in targetRoom.auth) {
			if (!rankLists[targetRoom.auth[u]]) rankLists[targetRoom.auth[u]] = [];
			rankLists[targetRoom.auth[u]].push(u);
		}

		let buffer = Object.keys(rankLists).sort((a, b) =>
			(Config.groups[b] || {rank:0}).rank - (Config.groups[a] || {rank:0}).rank
		).map(r => {
			let roomRankList = rankLists[r].sort();
			roomRankList = roomRankList.map(s => s in targetRoom.users ? "**" + s + "**" : s);
			return (Config.groups[r] ? Config.groups[r].name + "s (" + r + ")" : r) + ":\n" + roomRankList.join(", ");
		});

		if (targetRoom.founder) buffer = ['Room Founder (#): \n' + targetRoom.founder].concat(buffer);

		if (!buffer.length) {
			connection.popup("The room '" + targetRoom.title + "' has no auth." + userLookup);
			return;
		}
		if (targetRoom !== room) buffer.unshift("" + targetRoom.title + " room auth:");
		connection.popup(buffer.join("\n\n") + userLookup);
	},

	roomfounder: function (target, room, user) {
		if (!room.chatRoomData) {
			return this.sendReply("/roomfounder - This room isn't designed for per-room moderation to be added");
		}
		if (!target) return this.parse('/help roomfounder');
		target = this.splitTarget(target, true);
		let targetUser = this.targetUser;
		let name = this.targetUsername;
		let userid = toId(name);

		if (!Users.isUsernameKnown(userid)) {
			return this.errorReply(`User '${this.targetUsername}' is offline and unrecognized, and so can't be promoted.`);
		}

		if (!this.can('makeroom')) return false;

		if (!room.auth) room.auth = room.chatRoomData.auth = {};

		room.auth[userid] = '#';
		room.founder = userid;
		this.addModCommand(`${name} was appointed Room Founder by ${user.name}.`);
		if (targetUser) {
			targetUser.popup(`You were appointed Room Founder by ${user.name} in ${room.id}.`);
			room.onUpdateIdentity(targetUser);
		}
		Rooms.global.writeChatRoomData();
	},
	roomfounderhelp: ["/roomfounder [username] - Appoints [username] as a room founder. Requires: & ~"],

	roomdefounder: function (target, room, user) {
		if (!room.chatRoomData) {
			return this.sendReply("/roomdefounder - This room isn't designed for per-room moderation.");
		}
		if (!target) return this.parse('/help roomdefounder');
		if (!this.can('makeroom')) return false;
		let targetUser = toId(target);
		if (room.founder !== targetUser) return this.errorReply(targetUser + ' is not the room founder of ' + room.name + '.');
		room.founder = false;
		return this.parse('/roomdeauth ' + target);
	},
	roomdefounderhelp: ["/roomdefounder [username] - Revoke [username]'s room founder position. Requires: &, ~"],

	roomowner: function (target, room, user) {
		if (!room.chatRoomData) {
			return this.sendReply("/roomowner - This room isn't designed for per-room moderation to be added");
		}
		if (!target) return this.parse('/help roomowner');
		target = this.splitTarget(target, true);
		let targetUser = this.targetUser;
		let name = this.targetUsername;
		let userid = toId(name);

		if (!Users.isUsernameKnown(userid)) {
			return this.errorReply(`User '${this.targetUsername}' is offline and unrecognized, and so can't be promoted.`);
		}

		if (!user.can('makeroom')) {
			if (user.userid !== room.founder) return false;
		}

		if (!room.auth) room.auth = room.chatRoomData.auth = {};

		room.auth[userid] = '#';
		this.addModCommand(`${name} was appointed Room Owner by ${user.name}.`);
		if (targetUser) {
			targetUser.popup(`You were appointed Room Owner by ${user.name} in ${room.id}.`);
			room.onUpdateIdentity(targetUser);
		}
		Rooms.global.writeChatRoomData();
	},
	roomownerhelp: ["/roomowner [username] - Appoints [username] as a room owner. Requires: & ~"],

	'!roompromote': true,
	roomdemote: 'roompromote',
	roompromote: function (target, room, user, connection, cmd) {
		if (!room) {
			// this command isn't marked as room-only because it's usable in PMs through /invite
			return this.errorReply("This command is only available in rooms");
		}
		if (!room.auth) {
			this.sendReply("/roompromote - This room isn't designed for per-room moderation");
			return this.sendReply("Before setting room staff, you need to set a room owner with /roomowner");
		}
		if (!this.canTalk()) return;
		if (!target) return this.parse('/help roompromote');

		target = this.splitTarget(target, true);
		let targetUser = this.targetUser;
		let userid = toId(this.targetUsername);
		let name = targetUser ? targetUser.name : this.targetUsername;

		if (!userid) return this.parse('/help roompromote');
		if (!targetUser && !Users.isUsernameKnown(userid)) {
			return this.errorReply(`User '${name}' is offline and unrecognized, and so can't be promoted.`);
		}
		if (targetUser && !targetUser.registered) {
			return this.errorReply(`User '${name}' is unregistered, and so can't be promoted.`);
		}

		let currentGroup = room.getAuth({userid, group: (Users.usergroups[userid] || ' ').charAt(0)});
		let nextGroup = target;
		if (target === 'deauth') nextGroup = Config.groupsranking[0];
		if (!nextGroup) {
			return this.errorReply("Please specify a group such as /roomvoice or /roomdeauth");
		}
		if (!Config.groups[nextGroup]) {
			return this.errorReply(`Group '${nextGroup}' does not exist.`);
		}

		if (Config.groups[nextGroup].globalonly || (Config.groups[nextGroup].battleonly && !room.battle)) {
			return this.errorReply(`Group 'room${Config.groups[nextGroup].id}' does not exist as a room rank.`);
		}

		let groupName = Config.groups[nextGroup].name || "regular user";
		if ((room.auth[userid] || Config.groupsranking[0]) === nextGroup) {
			return this.errorReply(`User '${name}' is already a ${groupName} in this room.`);
		}
		if (!user.can('makeroom')) {
			if (currentGroup !== ' ' && !user.can('room' + (Config.groups[currentGroup] ? Config.groups[currentGroup].id : 'voice'), null, room)) {
				if (user.userid !== room.founder) return this.errorReply(`/${cmd} - Access denied for promoting/demoting from ${(Config.groups[currentGroup] ? Config.groups[currentGroup].name : "an undefined group")}.`);
			}
			if (nextGroup !== ' ' && !user.can('room' + Config.groups[nextGroup].id, null, room)) {
				return this.errorReply(`/${cmd} - Access denied for promoting/demoting to ${Config.groups[nextGroup].name}.`);
			}
		}
		let nextGroupIndex = Config.groupsranking.indexOf(nextGroup) || 1; // assume voice if not defined (although it should be by now)
		if (targetUser && targetUser.locked && !room.isPrivate && !room.battle && !room.isPersonal && nextGroupIndex >= 2) {
			return this.errorReply("Locked users can't be promoted.");
		}

		if (nextGroup === Config.groupsranking[0]) {
			delete room.auth[userid];
		} else {
			room.auth[userid] = nextGroup;
		}
		if (room.founder === userid && nextGroup !== '#') room.founder = false; //Must be a demotion as

		// Only show popup if: user is online and in the room, the room is public, and not a groupchat or a battle.
		let needsPopup = targetUser && room.users[targetUser.userid] && !room.isPrivate && !room.isPersonal && !room.battle;

		if (this.pmTarget && targetUser) {
			const text = `${targetUser.name} was invited (and promoted to Room ${groupName}) by ${user.name}`;
			room.add(`|c|${user.getIdentity(room)}|/log ${text}`).update();
			room.modlog(text);
		} else if (nextGroup in Config.groups && currentGroup in Config.groups && Config.groups[nextGroup].rank < Config.groups[currentGroup].rank) {
			if (targetUser && room.users[targetUser.userid] && !Config.groups[nextGroup].modlog) {
				// if the user can't see the demotion message (i.e. rank < %), it is shown in the chat
				targetUser.send(">" + room.id + "\n(You were demoted to Room " + groupName + " by " + user.name + ".)");
			}
			this.privateModCommand(`(${name} was demoted to Room ${groupName} by ${user.name}.)`);
			if (needsPopup) targetUser.popup(`You were demoted to Room ${groupName} by ${user.name} in ${room.id}.`);
		} else if (nextGroup === '#') {
			this.addModCommand(`${'' + name} was promoted to ${groupName} by ${user.name}.`);
			if (needsPopup) targetUser.popup(`You were promoted to ${groupName} by ${user.name} in ${room.id}.`);
		} else {
			this.addModCommand(`${'' + name} was promoted to Room ${groupName} by ${user.name}.`);
			if (needsPopup) targetUser.popup(`You were promoted to Room ${groupName} by ${user.name} in ${room.id}.`);
		}

		if (targetUser) targetUser.updateIdentity(room.id);
		if (room.chatRoomData) Rooms.global.writeChatRoomData();
	},
	roompromotehelp: [
		"/roompromote OR /roomdemote [username], [group symbol] - Promotes/demotes the user to the specified room rank. Requires: @ * # & ~",
		"/room[group] [username] - Promotes/demotes the user to the specified room rank. Requires: @ * # & ~",
		"/roomdeauth [username] - Removes all room rank from the user. Requires: @ * # & ~",
	],

	reddeclare: 'declare',
	greendeclare: 'declare',
	declare: function (target, room, user, connection, cmd, message) {
		if (!target) return this.parse('/help declare');
		if (!this.can('declare', null, room)) return false;
		if (!this.canTalk()) return;

		let color = 'blue';
		switch (cmd) {
		case 'reddeclare':
			color = 'red';
			break;
		case 'greendeclare':
			color = 'green';
			break;
		}
		this.add('|raw|<div class="broadcast-' + color + '"><b>' + Chat.escapeHTML(target) + '</b></div>');
		this.logModCommand(user.name + " declared " + target);
	},
	declarehelp: ["/declare [message] - Anonymously announces a message. Requires: # * & ~"],

	redhtmldeclare: 'htmldeclare',
	greenhtmldeclare: 'htmldeclare',
	htmldeclare: function (target, room, user, connection, cmd, message) {
		if (!target) return this.parse('/help htmldeclare');
		if (!this.can('gdeclare', null, room)) return false;
		if (!this.canTalk()) return;
		target = this.canHTML(target);
		if (!target) return;

		let color = 'blue';
		switch (cmd) {
		case 'redhtmldeclare':
			color = 'red';
			break;
		case 'greenhtmldeclare':
			color = 'green';
			break;
		}
		this.add('|raw|<div class="broadcast-' + color + '">' + target + '</div>');
		this.logModCommand(user.name + " declared " + target);
	},
	htmldeclarehelp: ["/htmldeclare [message] - Anonymously announces a message using safe HTML. Requires: ~"],

	redglobaldeclare: 'globaldeclare',
	greenglobaldeclare: 'globaldeclare',
	redgdeclare: 'globaldeclare',
	greengdeclare: 'globaldeclare',
	gdeclare: 'globaldeclare',
	globaldeclare: function (target, room, user, connection, cmd, message) {
		if (!target) return this.parse('/help globaldeclare');
		if (!this.can('gdeclare')) return false;
		target = this.canHTML(target);
		if (!target) return;

		let color = 'blue';
		switch (cmd) {
		case 'redglobaldeclare':
		case 'redgdeclare':
			color = 'red';
			break;
		case 'greenglobaldeclare':
		case 'greengdeclare':
			color = 'green';
			break;
		}
		Rooms.rooms.forEach((curRoom, id) => {
			if (id !== 'global') curRoom.addRaw('<div class="broadcast-' + color + '">' + target + '</div>').update();
		});
		this.logModCommand(user.name + " globally declared " + target);
	},
	globaldeclarehelp: ["/globaldeclare [message] - Anonymously announces a message to every room on the server. Requires: ~"],

	redchatdeclare: 'chatdeclare',
	greenchatdeclare: 'chatdeclare',
	redcdeclare: 'chatdeclare',
	greencdeclare: 'chatdeclare',
	cdeclare: 'chatdeclare',
	chatdeclare: function (target, room, user, connection, cmd, message) {
		if (!target) return this.parse('/help chatdeclare');
		if (!this.can('gdeclare')) return false;
		target = this.canHTML(target);
		if (!target) return;

		let color = 'blue';
		switch (cmd) {
		case 'reddeclare':
			color = 'red';
			break;
		case 'greendeclare':
			color = 'green';
			break;
		}
		Rooms.rooms.forEach((curRoom, id) => {
			if (id !== 'global' && curRoom.type !== 'battle') curRoom.addRaw('<div class="broadcast-' + color + '">' + target + '</div>').update();
		});
		this.logModCommand(user.name + " globally declared (chat level) " + target);
	},
	chatdeclarehelp: ["/cdeclare [message] - Anonymously announces a message to all chatrooms on the server. Requires: ~"],

	'!ignorepms': true,
	blockpm: 'ignorepms',
	blockpms: 'ignorepms',
	ignorepm: 'ignorepms',
	ignorepms: function (target, room, user) {
		if (user.ignorePMs === (target || true)) return this.errorReply("You are already blocking private messages! To unblock, use /unblockpms");
		if (user.can('lock') && !user.can('roomowner')) return this.errorReply("You are not allowed to block private messages.");
		user.ignorePMs = true;
		if (target in Config.groups) {
			user.ignorePMs = target;
			return this.sendReply("You are now blocking private messages, except from staff and " + target + ".");
		}
		return this.sendReply("You are now blocking private messages, except from staff.");
	},
	ignorepmshelp: ["/blockpms - Blocks private messages. Unblock them with /unignorepms."],
};
