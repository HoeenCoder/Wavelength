/**
 * System commands
 * Pokemon Showdown - http://pokemonshowdown.com/
 *
 * These are system commands - commands required for Pokemon Showdown
 * to run. A lot of these are sent by the client.
 *
 * System commands should not be modified, added, or removed. If you'd
 * like to modify or add commands, add or edit files in chat-plugins/
 *
 * For the API, see chat-plugins/COMMANDS.md
 *
 * @license MIT license
 */

'use strict';

/* eslint no-else-return: "error" */

const crypto = require('crypto');
const FS = require('./fs');

const MAX_REASON_LENGTH = 300;
const MUTE_LENGTH = 7 * 60 * 1000;
const HOURMUTE_LENGTH = 60 * 60 * 1000;

const MAX_CHATROOM_ID_LENGTH = 225;

exports.commands = {

	'!version': true,
	version: function (target, room, user) {
		if (!this.runBroadcast()) return;
		this.sendReplyBox("Server version: <b>" + Chat.package.version + "</b>");
	},

	'!authority': true,
	auth: 'authority',
	stafflist: 'authority',
	globalauth: 'authority',
	authlist: 'authority',
	authority: function (target, room, user, connection) {
		if (target) {
			let targetRoom = Rooms.search(target);
			let availableRoom = targetRoom && targetRoom.checkModjoin(user);
			if (targetRoom && availableRoom) return this.parse('/roomauth1 ' + target);
			return this.parse('/userauth ' + target);
		}
		let rankLists = {};
		let ranks = Object.keys(Config.groups);
		for (let u in Users.usergroups) {
			let rank = Users.usergroups[u].charAt(0);
			if (rank === ' ' || rank === '+') continue;
			// In case the usergroups.csv file is not proper, we check for the server ranks.
			if (ranks.includes(rank)) {
				let name = Users.usergroups[u].substr(1);
				if (!rankLists[rank]) rankLists[rank] = [];
				if (name) rankLists[rank].push(name);
			}
		}

		let buffer = Object.keys(rankLists).sort((a, b) =>
			(Config.groups[b] || {rank: 0}).rank - (Config.groups[a] || {rank: 0}).rank
		).map(r =>
			(Config.groups[r] ? "**" + Config.groups[r].name + "s** (" + r + ")" : r) + ":\n" + rankLists[r].sort((a, b) => toId(a).localeCompare(toId(b))).join(", ")
		);

		if (!buffer.length) return connection.popup("This server has no global authority.");
		connection.popup(buffer.join("\n\n"));
	},
	authhelp: ["/auth - Show global staff for the server.",
		"/auth [room] - Show what roomauth a room has.",
		"/auth [user] - Show what global and roomauth a user has."],

	userlist: function (target, room, user) {
		let userList = [];

		for (let i in room.users) {
			let curUser = Users(room.users[i]);
			if (!curUser || !curUser.named) continue;
			userList.push(Chat.escapeHTML(curUser.getIdentity(room.id)));
		}

		let output = `There ${Chat.plural(userList.length, 'are', 'is')} <strong style="color:#24678d">${userList.length}</strong> user${Chat.plural(userList.length)} in this room:<br />`;
		output += userList.join(`, `);

		this.sendReplyBox(output);
	},
	userlisthelp: ["/userlist - Displays a list of users who are currently in the room."],

	'!me': true,
	mee: 'me',
	me: function (target, room, user) {
		if (this.cmd === 'mee' && /[A-Z-a-z0-9/]/.test(target.charAt(0))) {
			return this.errorReply(`/mee - must not start with a letter or number`);
		}
		target = this.canTalk(`/${this.cmd} ${target || ''}`);
		if (!target) return;

		if (this.message.startsWith(`/ME`)) {
			const uppercaseIdentity = user.getIdentity(room).toUpperCase();
			if (room) {
				this.add(`|c|${uppercaseIdentity}|${target}`);
			} else {
				let msg = `|pm|${uppercaseIdentity}|${this.pmTarget.getIdentity()}|${target}`;
				user.send(msg);
				if (this.pmTarget !== user) this.pmTarget.send(msg);
			}
			return;
		}

		return target;
	},

	'!battle': true,
	'battle!': 'battle',
	battle: function (target, room, user, connection, cmd) {
		if (cmd === 'battle') return this.sendReply("What?! How are you not more excited to battle?! Try /battle! to show me you're ready.");
		if (!target) target = "randombattle";
		return this.parse("/search " + target);
	},

	pi: function (target, room, user) {
		return this.sendReplyBox(
			'Did you mean: 1. 3.1415926535897932384626... (Decimal)<br />' +
			'2. 3.184809493B91866... (Duodecimal)<br />' +
			'3. 3.243F6A8885A308D... (Hexadecimal)<br /><br />' +
			'How many digits of pi do YOU know? Test it out <a href="http://guangcongluo.com/mempi/">here</a>!');
	},

	code: function (target, room, user) {
		if (!target) return this.parse('/help code');
		if (!this.canTalk()) return;
		const separator = '\n';
		if (target.includes(separator)) {
			const params = target.split(separator);
			let output = [];
			for (const param of params) {
				output.push(Chat.escapeHTML(param));
			}
			let code = `<div class="chat"><code style="white-space: pre-wrap; display: table">${output.join('<br />')}</code></div>`;
			if (output.length > 3) code = `<details><summary>See code...</summary>${code}</details>`;

			if (!this.canBroadcast('!code')) return;
			if (this.broadcastMessage && !this.can('broadcast', null, room)) return false;

			if (!this.runBroadcast('!code')) return;

			this.sendReplyBox(code);
		} else {
			return this.errorReply("You can simply use ``[code]`` for code messages that are only one line.");
		}
	},
	codehelp: [
		"!code [code] - Broadcasts code to a room. Accepts multi-line arguments. Requires: + % @ & # ~",
		"/code [code] - Shows you code. Accepts multi-line arguments.",
	],

	'!avatar': true,
	avatar: function (target, room, user) {
		if (!target) return this.parse('/avatars');
		let parts = target.split(',');
		let avatarid = toId(parts[0]);
		let avatar = 0;
		let avatarTable = {
			lucas: 1,
			dawn: 2,
			youngster: 3,
			lass: 4,
			camper: 5,
			picnicker: 6,
			bugcatcher: 7,
			aromalady: 8,
			twins: 9,
			hiker: 10,
			battlegirl: 11,
			fisherman: 12,
			cyclist: 13,
			cyclistf: 14,
			blackbelt: 15,
			artist: 16,
			pokemonbreeder: 17,
			pokemonbreederf: 18,
			cowgirl: 19,
			jogger: 20,
			pokefan: 21,
			pokefanf: 22,
			pokekid: 23,
			youngcouple: 24,
			acetrainer: 25,
			acetrainerf: 26,
			waitress: 27,
			veteran: 28,
			ninjaboy: 29,
			dragontamer: 30,
			birdkeeper: 31,
			doubleteam: 32,
			richboy: 33,
			lady: 34,
			gentleman: 35,
			socialite: 36,
			madame: 36,
			beauty: 37,
			collector: 38,
			policeman: 39,
			pokemonranger: 40,
			pokemonrangerf: 41,
			scientist: 42,
			swimmer: 43,
			swimmerf: 44,
			tuber: 45,
			tuberf: 46,
			sailor: 47,
			sisandbro: 48,
			ruinmaniac: 49,
			psychic: 50,
			psychicf: 51,
			gambler: 52,
			dppguitarist: 53,
			acetrainersnow: 54,
			acetrainersnowf: 55,
			skier: 56,
			skierf: 57,
			roughneck: 58,
			clown: 59,
			worker: 60,
			schoolkid: 61,
			schoolkidf: 62,
			roark: 63,
			barry: 64,
			byron: 65,
			aaron: 66,
			bertha: 67,
			flint: 68,
			lucian: 69,
			dppcynthia: 70,
			bellepa: 71,
			rancher: 72,
			mars: 73,
			galacticgrunt: 74,
			gardenia: 75,
			crasherwake: 76,
			maylene: 77,
			fantina: 78,
			candice: 79,
			volkner: 80,
			parasollady: 81,
			waiter: 82,
			interviewers: 83,
			cameraman: 84,
			oli: 84,
			reporter: 85,
			roxy: 85,
			idol: 86,
			grace: 86,
			cyrus: 87,
			jupiter: 88,
			saturn: 89,
			galacticgruntf: 90,
			argenta: 91,
			palmer: 92,
			thorton: 93,
			buck: 94,
			darach: 95,
			marley: 96,
			mira: 97,
			cheryl: 98,
			riley: 99,
			dahlia: 100,
			ethan: 101,
			lyra: 102,

			archer: 132,
			ariana: 133,
			proton: 134,
			petrel: 135,
			mysteryman: 136,
			eusine: 136,
			ptlucas: 137,
			ptdawn: 138,

			falkner: 141,
			bugsy: 142,
			whitney: 143,
			morty: 144,
			chuck: 145,
			jasmine: 146,
			pryce: 147,
			clair: 148,
			will: 149,
			koga: 150,
			bruno: 151,
			karen: 152,
			lance: 153,
			brock: 154,
			misty: 155,
			ltsurge: 156,
			erika: 157,
			janine: 158,
			sabrina: 159,
			blaine: 160,
			blue: 161,
			red2: 162,
			red: 163,
			silver: 164,
			giovanni: 165,
			unknownf: 166,
			unknownm: 167,
			unknown: 168,
			hilbert: 169,
			hilda: 170,

			chili: 179,
			cilan: 180,
			cress: 181,

			lenora: 188,
			burgh: 189,
			elesa: 190,
			clay: 191,
			skyla: 192,

			cheren: 206,
			bianca: 207,

			n: 209,

			brycen: 222,
			iris: 223,
			drayden: 224,

			shauntal: 246,
			marshal: 247,
			grimsley: 248,
			caitlin: 249,
			ghetsis: 250,

			ingo: 256,
			alder: 257,

			cynthia: 260,
			emmet: 261,
			dueldiskhilbert: 262,
			dueldiskhilda: 263,
			hugh: 264,
			rosa: 265,
			nate: 266,
			colress: 267,
			bw2beauty: 268,
			bw2ghetsis: 269,
			bw2plasmagrunt: 270,
			bw2plasmagruntf: 271,
			bw2iris: 272,
			brycenman: 273,
			shadowtriad: 274,
			rood: 275,
			zinzolin: 276,
			bw2cheren: 277,
			marlon: 278,
			roxie: 279,
			roxanne: 280,
			brawly: 281,
			wattson: 282,
			flannery: 283,
			norman: 284,
			winona: 285,
			tate: 286,
			liza: 287,
			juan: 288,
			guitarist: 289,
			steven: 290,
			wallace: 291,
			magicqueen: 292,
			bellelba: 292,
			benga: 293,

			bw2elesa: '#bw2elesa',
			teamrocket: '#teamrocket',
			yellow: '#yellow',
			zinnia: '#zinnia',
			clemont: '#clemont',
		};
		if (avatarTable.hasOwnProperty(avatarid)) {
			avatar = avatarTable[avatarid];
		} else {
			avatar = parseInt(avatarid);
		}
		if (typeof avatar === 'number' && (!avatar || avatar > 294 || avatar < 1)) {
			if (!parts[1]) {
				this.errorReply("Invalid avatar.");
			}
			return false;
		}

		user.avatar = avatar;
		if (!parts[1]) {
			this.sendReply("Avatar changed to:\n" +
				'|raw|<img src="//play.pokemonshowdown.com/sprites/trainers/' + (typeof avatar === 'string' ? avatar.substr(1) : avatar) + '.png" alt="" width="80" height="80" />');
		}
	},
	avatarhelp: ["/avatar [avatar number 1 to 293] - Change your trainer sprite."],

	'!logout': true,
	signout: 'logout',
	logout: function (target, room, user) {
		user.resetName();
	},

	requesthelp: 'report',
	report: function (target, room, user) {
		if (room.id === 'help') {
			this.sendReply("Ask one of the Moderators (@) in the Help room.");
		} else {
			this.parse('/join help');
		}
	},

	r: 'reply',
	reply: function (target, room, user) {
		if (!target) return this.parse('/help reply');
		if (!user.lastPM) {
			return this.errorReply("No one has PMed you yet.");
		}
		return this.parse('/msg ' + (user.lastPM || '') + ', ' + target);
	},
	replyhelp: ["/reply OR /r [message] - Send a private message to the last person you received a message from, or sent a message to."],

	'!msg': true,
	pm: 'msg',
	whisper: 'msg',
	w: 'msg',
	msg: function (target, room, user, connection) {
		if (!target) return this.parse('/help msg');
		target = this.splitTarget(target);
		let targetUser = this.targetUser;
		if (!target) {
			this.errorReply("You forgot the comma.");
			return this.parse('/help msg');
		}
		if (!targetUser) {
			let error = `User ${this.targetUsername} not found. Did you misspell their name?`;
			error = `|pm|${this.user.getIdentity()}| ${this.targetUsername}|/error ${error}`;
			connection.send(error);
			return;
		}
		this.pmTarget = targetUser;
		this.room = undefined;

		if (!targetUser.connected) {
			return this.errorReply("User " + this.targetUsername + " is offline.");
		}

		this.parse(target);
	},
	msghelp: ["/msg OR /whisper OR /w [username], [message] - Send a private message."],

	'!invite': true,
	inv: 'invite',
	invite: function (target, room, user) {
		if (!target) return this.parse('/help invite');
		if (!this.canTalk()) return;
		if (room) target = this.splitTarget(target) || room.id;
		let targetRoom = Rooms.search(target);
		if (targetRoom && !targetRoom.checkModjoin(user)) {
			targetRoom = undefined;
		}

		if (room) {
			if (!this.targetUser) return this.errorReply(`The user "${this.targetUsername}" was not found.`);
			if (!targetRoom) return this.errorReply(`The room "${target}" was not found.`);

			return this.parse(`/pm ${this.targetUsername}, /invite ${targetRoom.id}`);
		}

		let targetUser = this.pmTarget;

		if (!targetRoom || targetRoom === Rooms.global) return this.errorReply(`The room "${target}" was not found.`);
		if (targetRoom.staffRoom && !targetUser.isStaff) return this.errorReply(`User "${targetUser.name}" requires global auth to join room "${targetRoom.id}".`);
		if (!targetUser) return this.errorReply(`The user "${targetUser.name}" was not found.`);

		if (!targetRoom.checkModjoin(targetUser)) {
			if (targetRoom.getAuth(targetUser) !== ' ') {
				return this.errorReply(`The user "${targetUser.name}" does not have permission to join "${targetRoom.title}".`);
			}
			this.room = targetRoom;
			this.parse(`/roomvoice ${targetUser.name}`);
			if (!targetRoom.checkModjoin(targetUser)) {
				if (targetRoom.getAuth(targetUser) !== ' ') {
					return this.errorReply(`The user "${targetUser.name}" does not have permission to join "${targetRoom.title}".`);
				}
				return this.errorReply(`You do not have permission to invite people into this room.`);
			}
		}
		if (targetUser in targetRoom.users) return this.errorReply(`This user is already in "${targetRoom.title}".`);

		return '/invite ' + targetRoom.id;
	},
	invitehelp: ["/invite [username] - Invites the player [username] to join the room you sent the command to.",
		"(in a PM) /invite [roomname] - Invites the player you're PMing to join the room [roomname]."],

	pminfobox: function (target, room, user, connection) {
		if (!this.canTalk()) return;
		if (!this.can('addhtml', null, room)) return false;
		if (!target) return this.parse("/help pminfobox");

		target = this.canHTML(this.splitTarget(target));
		if (!target) return;
		let targetUser = this.targetUser;

		if (!targetUser || !targetUser.connected) return this.errorReply(`User ${this.targetUsername} is not currently online.`);
		if (!(targetUser in room.users) && !user.can('addhtml')) return this.errorReply("You do not have permission to use this command to users who are not in this room.");
		if (targetUser.ignorePMs && targetUser.ignorePMs !== user.group && !user.can('lock')) return this.errorReply("This user is currently ignoring PMs.");
		if (targetUser.locked && !user.can('lock')) return this.errorReply("This user is currently locked, so you cannot send them a pminfobox.");

		// Apply the infobox to the message
		target = `/raw <div class="infobox">${target}</div>`;
		let message = `|pm|${user.getIdentity()}|${targetUser.getIdentity()}|${target}`;

		user.send(message);
		if (targetUser !== user) targetUser.send(message);
		targetUser.lastPM = user.userid;
		user.lastPM = targetUser.userid;
	},
	pminfoboxhelp: ["/pminfobox [user], [html]- PMs an [html] infobox to [user]. Requires * ~"],

	'!ignorepms': true,
	blockpm: 'ignorepms',
	blockpms: 'ignorepms',
	ignorepm: 'ignorepms',
	ignorepms: function (target, room, user) {
		if (user.ignorePMs === (target || true)) return this.errorReply("You are already blocking private messages! To unblock, use /unblockpms");
		if (user.can('lock') && !user.can('bypassall')) return this.errorReply("You are not allowed to block private messages.");
		user.ignorePMs = true;
		if (target in Config.groups) {
			user.ignorePMs = target;
			return this.sendReply("You are now blocking private messages, except from staff and " + target + ".");
		}
		return this.sendReply("You are now blocking private messages, except from staff.");
	},
	ignorepmshelp: ["/blockpms - Blocks private messages. Unblock them with /unignorepms."],

	'!unignorepms': true,
	unblockpm: 'unignorepms',
	unblockpms: 'unignorepms',
	unignorepm: 'unignorepms',
	unignorepms: function (target, room, user) {
		if (!user.ignorePMs) return this.errorReply("You are not blocking private messages! To block, use /blockpms");
		user.ignorePMs = false;
		return this.sendReply("You are no longer blocking private messages.");
	},
	unignorepmshelp: ["/unblockpms - Unblocks private messages. Block them with /blockpms."],

	'!away': true,
	idle: 'away',
	afk: 'away',
	away: function (target, room, user) {
		this.parse('/blockchallenges');
		this.parse('/blockpms ' + target);
	},
	awayhelp: ["/away - Blocks challenges and private messages. Unblock them with /back."],

	'!back': true,
	unaway: 'back',
	unafk: 'back',
	back: function () {
		this.parse('/unblockpms');
		this.parse('/unblockchallenges');
	},
	backhelp: ["/back - Unblocks challenges and/or private messages, if either are blocked."],

	'!rank': true,
	rank: function (target, room, user) {
		if (!target) target = user.name;

		Ladders.visualizeAll(target).then(values => {
			let buffer = '<div class="ladder"><table>';
			buffer += '<tr><td colspan="8">User: <strong>' + Chat.escapeHTML(target) + '</strong></td></tr>';

			let ratings = values.join('');
			if (!ratings) {
				buffer += '<tr><td colspan="8"><em>This user has not played any ladder games yet.</em></td></tr>';
			} else {
				buffer += '<tr><th>Format</th><th><abbr title="Elo rating">Elo</abbr></th><th>W</th><th>L</th><th>Total</th>';
				buffer += ratings;
			}
			buffer += '</table></div>';

			this.sendReply('|raw|' + buffer);
		});
	},

	makeprivatechatroom: 'makechatroom',
	makechatroom: function (target, room, user, connection, cmd) {
		if (!this.can('makeroom')) return;

		// `,` is a delimiter used by a lot of /commands
		// `|` and `[` are delimiters used by the protocol
		// `-` has special meaning in roomids
		if (target.includes(',') || target.includes('|') || target.includes('[') || target.includes('-')) {
			return this.errorReply("Room titles can't contain any of: ,|[-");
		}

		let id = toId(target);
		if (!id) return this.parse('/help makechatroom');
		if (id.length > MAX_CHATROOM_ID_LENGTH) return this.errorReply("The given room title is too long.");
		// Check if the name already exists as a room or alias
		if (Rooms.search(id)) return this.errorReply(`The room '${target}' already exists.`);
		if (!Rooms.global.addChatRoom(target)) return this.errorReply(`An error occurred while trying to create the room '${target}'.`);

		if (cmd === 'makeprivatechatroom') {
			let targetRoom = Rooms.search(target);
			targetRoom.isPrivate = true;
			targetRoom.chatRoomData.isPrivate = true;
			Rooms.global.writeChatRoomData();
			if (Rooms.get('upperstaff')) {
				Rooms.get('upperstaff').add(`|raw|<div class="broadcast-green">Private chat room created: <b>${Chat.escapeHTML(target)}</b></div>`).update();
			}
			this.sendReply(`The private chat room '${target}' was created.`);
		} else {
			if (Rooms.get('staff')) {
				Rooms.get('staff').add(`|raw|<div class="broadcast-green">Public chat room created: <b>${Chat.escapeHTML(target)}</b></div>`).update();
			}
			if (Rooms.get('upperstaff')) {
				Rooms.get('upperstaff').add(`|raw|<div class="broadcast-green">Public chat room created: <b>${Chat.escapeHTML(target)}</b></div>`).update();
			}
			this.sendReply(`The chat room '${target}' was created.`);
		}
	},
	makechatroomhelp: ["/makechatroom [roomname] - Creates a new room named [roomname]. Requires: & ~"],

	makegroupchat: function (target, room, user, connection, cmd) {
		if (!user.autoconfirmed) {
			return this.errorReply("You must be autoconfirmed to make a groupchat.");
		}
		if (!user.trusted) {
			return this.errorReply("You must be global voice or roomdriver+ in some public room to make a groupchat.");
		}
		// if (!this.can('makegroupchat')) return false;
		if (target.length > 64) return this.errorReply("Title must be under 32 characters long.");
		let targets = target.split(',', 2);

		// Title defaults to a random 8-digit number.
		let title = targets[0].trim();
		if (title.length >= 32) {
			return this.errorReply("Title must be under 32 characters long.");
		} else if (!title) {
			title = ('' + Math.floor(Math.random() * 100000000));
		} else if (Config.chatfilter) {
			let filterResult = Config.chatfilter.call(this, title, user, null, connection);
			if (!filterResult) return;
			if (title !== filterResult) {
				return this.errorReply("Invalid title.");
			}
		}
		// `,` is a delimiter used by a lot of /commands
		// `|` and `[` are delimiters used by the protocol
		// `-` has special meaning in roomids
		if (title.includes(',') || title.includes('|') || title.includes('[') || title.includes('-')) {
			return this.errorReply("Room titles can't contain any of: ,|[-");
		}

		// Even though they're different namespaces, to cut down on confusion, you
		// can't share names with registered chatrooms.
		let existingRoom = Rooms.search(toId(title));
		if (existingRoom && !existingRoom.modjoin) return this.errorReply("The room '" + title + "' already exists.");
		// Room IDs for groupchats are groupchat-TITLEID
		let titleid = toId(title);
		if (!titleid) {
			titleid = '' + Math.floor(Math.random() * 100000000);
		}
		let roomid = 'groupchat-' + user.userid + '-' + titleid;
		// Titles must be unique.
		if (Rooms.search(roomid)) return this.errorReply("A group chat named '" + title + "' already exists.");
		// Tab title is prefixed with '[G]' to distinguish groupchats from
		// registered chatrooms

		if (Monitor.countGroupChat(connection.ip)) {
			this.errorReply("Due to high load, you are limited to creating 4 group chats every hour.");
			return;
		}

		// Privacy settings, default to hidden.
		let privacy = (toId(targets[1]) === 'private') ? true : 'hidden';

		let groupChatLink = '<code>&lt;&lt;' + roomid + '>></code>';
		let groupChatURL = '';
		if (Config.serverid) {
			groupChatURL = 'http://' + (Config.serverid === 'showdown' ? 'psim.us' : Config.serverid + '.psim.us') + '/' + roomid;
			groupChatLink = '<a href="' + groupChatURL + '">' + groupChatLink + '</a>';
		}
		let titleHTML = '';
		if (/^[0-9]+$/.test(title)) {
			titleHTML = groupChatLink;
		} else {
			titleHTML = Chat.escapeHTML(title) + ' <small style="font-weight:normal;font-size:9pt">' + groupChatLink + '</small>';
		}
		let targetRoom = Rooms.createChatRoom(roomid, '[G] ' + title, {
			isPersonal: true,
			isPrivate: privacy,
			auth: {},
			introMessage: '<h2 style="margin-top:0">' + titleHTML + '</h2><p>There are several ways to invite people:<br />- in this chat: <code>/invite USERNAME</code><br />- anywhere in PS: link to <code>&lt;&lt;' + roomid + '>></code>' + (groupChatURL ? '<br />- outside of PS: link to <a href="' + groupChatURL + '">' + groupChatURL + '</a>' : '') + '</p><p>This room will expire after 40 minutes of inactivity or when the server is restarted.</p><p style="margin-bottom:0"><button name="send" value="/roomhelp">Room management</button>',
		});
		if (targetRoom) {
			// The creator is RO.
			targetRoom.auth[user.userid] = '#';
			// Join after creating room. No other response is given.
			user.joinRoom(targetRoom.id);
			return;
		}
		return this.errorReply("An unknown error occurred while trying to create the room '" + title + "'.");
	},
	makegroupchathelp: ["/makegroupchat [roomname], [hidden|private] - Creates a group chat named [roomname]. Leave off privacy to default to hidden. Requires global voice or roomdriver+ in a public room to make a groupchat."],

	deregisterchatroom: function (target, room, user) {
		if (!this.can('makeroom')) return;
		this.errorReply("NOTE: You probably want to use `/deleteroom` now that it exists.");
		let id = toId(target);
		if (!id) return this.parse('/help deregisterchatroom');
		let targetRoom = Rooms.search(id);
		if (!targetRoom) return this.errorReply("The room '" + target + "' doesn't exist.");
		target = targetRoom.title || targetRoom.id;
		if (Rooms.global.deregisterChatRoom(id)) {
			this.sendReply("The room '" + target + "' was deregistered.");
			this.sendReply("It will be deleted as of the next server restart.");
			return;
		}
		return this.errorReply("The room '" + target + "' isn't registered.");
	},
	deregisterchatroomhelp: ["/deregisterchatroom [roomname] - Deletes room [roomname] after the next server restart. Requires: & ~"],

	deletechatroom: 'deleteroom',
	deletegroupchat: 'deleteroom',
	deleteroom: function (target, room, user) {
		let roomid = target.trim();
		if (!roomid) return this.parse('/help deleteroom');
		let targetRoom = Rooms.search(roomid);
		if (!targetRoom) return this.errorReply("The room '" + target + "' doesn't exist.");
		if (room.isPersonal) {
			if (!this.can('editroom', null, targetRoom)) return;
		} else {
			if (!this.can('makeroom')) return;
		}
		target = targetRoom.title || targetRoom.id;

		if (targetRoom.id === 'global') {
			return this.errorReply("This room can't be deleted.");
		}

		if (targetRoom.chatRoomData) {
			if (targetRoom.isPrivate) {
				if (Rooms.get('upperstaff')) {
					Rooms.get('upperstaff').add(`|raw|<div class="broadcast-red">Private chat room deleted by ${user.userid}: <b>${Chat.escapeHTML(target)}</b></div>`).update();
				}
			} else {
				if (Rooms.get('staff')) {
					Rooms.get('staff').add('|raw|<div class="broadcast-red">Public chat room deleted: <b>' + Chat.escapeHTML(target) + '</b></div>').update();
				}
				if (Rooms.get('upperstaff')) {
					Rooms.get('upperstaff').add(`|raw|<div class="broadcast-red">Public chat room deleted by ${user.userid}: <b>${Chat.escapeHTML(target)}</b></div>`).update();
				}
			}
		}

		targetRoom.add("|raw|<div class=\"broadcast-red\"><b>This room has been deleted.</b></div>");
		targetRoom.update(); // |expire| needs to be its own message
		targetRoom.add("|expire|This room has been deleted.");
		this.sendReply("The room '" + target + "' was deleted.");
		targetRoom.update();
		targetRoom.destroy();
	},
	deleteroomhelp: ["/deleteroom [roomname] - Deletes room [roomname]. Requires: & ~"],

	hideroom: 'privateroom',
	hiddenroom: 'privateroom',
	secretroom: 'privateroom',
	publicroom: 'privateroom',
	privateroom: function (target, room, user, connection, cmd) {
		if (room.battle || room.isPersonal) {
			if (!this.can('editroom', null, room)) return;
		} else {
			// registered chatrooms show up on the room list and so require
			// higher permissions to modify privacy settings
			if (!this.can('makeroom')) return;
		}
		let setting;
		switch (cmd) {
		case 'privateroom':
			return this.parse('/help privateroom');
		case 'publicroom':
			setting = false;
			break;
		case 'secretroom':
			setting = true;
			break;
		default:
			if (room.isPrivate === true && target !== 'force') {
				return this.sendReply(`This room is a secret room. Use "/publicroom" to make it public, or "/hiddenroom force" to force it hidden.`);
			}
			setting = 'hidden';
			break;
		}

		if ((setting === true || room.isPrivate === true) && !room.isPersonal) {
			if (!this.can('makeroom')) return;
		}

		if (target === 'off' || !setting) {
			if (!room.isPrivate) {
				return this.errorReply(`This room is already public.`);
			}
			if (room.isPersonal) return this.errorReply(`This room can't be made public.`);
			if (room.privacySetter && user.can('nooverride', null, room) && !user.can('makeroom')) {
				if (!room.privacySetter.has(user.userid)) {
					const privacySetters = Array.from(room.privacySetter).join(', ');
					return this.errorReply(`You can't make the room public since you didn't make it private - only ${privacySetters} can.`);
				}
				room.privacySetter.delete(user.userid);
				if (room.privacySetter.size) {
					const privacySetters = Array.from(room.privacySetter).join(', ');
					return this.sendReply(`You are no longer forcing the room to stay private, but ${privacySetters} also need${Chat.plural(room.privacySetter, '', 's')} to use /publicroom to make the room public.`);
				}
			}
			delete room.isPrivate;
			room.privacySetter = null;
			this.addModCommand(`${user.name} made this room public.`);
			if (room.chatRoomData) {
				delete room.chatRoomData.isPrivate;
				Rooms.global.writeChatRoomData();
			}
		} else {
			const settingName = (setting === true ? 'secret' : setting);
			if (room.isPrivate === setting) {
				if (room.privacySetter && !room.privacySetter.has(user.userid)) {
					room.privacySetter.add(user.userid);
					return this.sendReply(`This room is already ${settingName}, but is now forced to stay that way until you use /publicroom.`);
				}
				return this.errorReply(`This room is already ${settingName}.`);
			}
			room.isPrivate = setting;
			this.addModCommand(`${user.name} made this room ${settingName}.`);
			if (room.chatRoomData) {
				room.chatRoomData.isPrivate = setting;
				Rooms.global.writeChatRoomData();
			}
			room.privacySetter = new Set([user.userid]);
		}
	},
	privateroomhelp: ["/secretroom - Makes a room secret. Secret rooms are visible to & and up. Requires: & ~",
		"/hiddenroom [on/off] - Makes a room hidden. Hidden rooms are visible to % and up, and inherit global ranks. Requires: \u2606 & ~",
		"/publicroom - Makes a room public. Requires: \u2606 & ~"],

	officialchatroom: 'officialroom',
	officialroom: function (target, room, user) {
		if (!this.can('makeroom')) return;
		if (!room.chatRoomData) {
			return this.errorReply(`/officialroom - This room can't be made official`);
		}
		if (target === 'off') {
			if (!room.isOfficial) return this.errorReply(`This chat room is already unofficial.`);
			delete room.isOfficial;
			this.addModCommand(`${user.name} made this chat room unofficial.`);
			delete room.chatRoomData.isOfficial;
			Rooms.global.writeChatRoomData();
		} else {
			if (room.isOfficial) return this.errorReply(`This chat room is already official.`);
			room.isOfficial = true;
			this.addModCommand(`${user.name} made this chat room official.`);
			room.chatRoomData.isOfficial = true;
			Rooms.global.writeChatRoomData();
		}
	},

	psplwinnerroom: function (target, room, user) {
		if (!this.can('makeroom')) return;
		if (!room.chatRoomData) {
			return this.errorReply(`/psplwinnerroom - This room can't be marked as a PSPL Winner room`);
		}
		if (target === 'off') {
			if (!room.pspl) return this.errorReply(`This chat room is already not a PSPL Winner room.`);
			delete room.pspl;
			this.addModCommand(`${user.name} made this chat room no longer a PSPL Winner room.`);
			delete room.chatRoomData.pspl;
			Rooms.global.writeChatRoomData();
		} else {
			if (room.pspl) return this.errorReply("This chat room is already a PSPL Winner room.");
			room.pspl = true;
			this.addModCommand(`${user.name} made this chat room a PSPL Winner room.`);
			room.chatRoomData.pspl = true;
			Rooms.global.writeChatRoomData();
		}
	},

	roomdesc: function (target, room, user) {
		if (!target) {
			if (!this.runBroadcast()) return;
			if (!room.desc) return this.sendReply(`This room does not have a description set.`);
			this.sendReplyBox(Chat.html`The room description is: ${room.desc}`);
			return;
		}
		if (!this.can('declare')) return false;
		if (target.length > 80) return this.errorReply(`Error: Room description is too long (must be at most 80 characters).`);
		let normalizedTarget = ' ' + target.toLowerCase().replace('[^a-zA-Z0-9]+', ' ').trim() + ' ';

		if (normalizedTarget.includes(' welcome ')) {
			return this.errorReply(`Error: Room description must not contain the word "welcome".`);
		}
		if (normalizedTarget.slice(0, 9) === ' discuss ') {
			return this.errorReply(`Error: Room description must not start with the word "discuss".`);
		}
		if (normalizedTarget.slice(0, 12) === ' talk about ' || normalizedTarget.slice(0, 17) === ' talk here about ') {
			return this.errorReply(`Error: Room description must not start with the phrase "talk about".`);
		}

		room.desc = target;
		this.sendReply(`(The room description is now: ${target})`);

		this.privateModCommand(`(${user.name} changed the roomdesc to: "${target}".)`);

		if (room.chatRoomData) {
			room.chatRoomData.desc = room.desc;
			Rooms.global.writeChatRoomData();
		}
	},

	topic: 'roomintro',
	roomintro: function (target, room, user, connection, cmd) {
		if (!target) {
			if (!this.runBroadcast()) return;
			if (!room.introMessage) return this.sendReply("This room does not have an introduction set.");
			this.sendReply('|raw|<div class="infobox infobox-limited">' + room.introMessage.replace(/\n/g, '') + '</div>');
			if (!this.broadcasting && user.can('declare', null, room) && cmd !== 'topic') {
				this.sendReply('Source:');
				this.sendReplyBox(
					'<code>/roomintro ' + Chat.escapeHTML(room.introMessage).split('\n').map(line => {
						return line.replace(/^(\t+)/, (match, $1) => '&nbsp;'.repeat(4 * $1.length)).replace(/^(\s+)/, (match, $1) => '&nbsp;'.repeat($1.length));
					}).join('<br />') + '</code>'
				);
			}
			return;
		}
		if (!this.can('declare', null, room)) return false;
		if (target === 'off' || target === 'disable' || target === 'delete') return this.errorReply('Did you mean "/deleteroomintro"?');
		target = this.canHTML(target);
		if (!target) return;
		if (!/</.test(target)) {
			// not HTML, do some simple URL linking
			let re = /(https?:\/\/(([\w.-]+)+(:\d+)?(\/([\w/_.]*(\?\S+)?)?)?))/g;
			target = target.replace(re, '<a href="$1">$1</a>');
		}
		if (target.substr(0, 11) === '/roomintro ') target = target.substr(11);

		room.introMessage = target.replace(/\r/g, '');
		this.sendReply("(The room introduction has been changed to:)");
		this.sendReply('|raw|<div class="infobox infobox-limited">' + room.introMessage.replace(/\n/g, '') + '</div>');

		this.privateModCommand(`(${user.name} changed the roomintro.)`);
		this.logEntry(room.introMessage.replace(/\n/g, ''));

		if (room.chatRoomData) {
			room.chatRoomData.introMessage = room.introMessage;
			Rooms.global.writeChatRoomData();
		}
	},
	deletetopic: 'deleteroomintro',
	deleteroomintro: function (target, room, user) {
		if (!this.can('declare', null, room)) return false;
		if (!room.introMessage) return this.errorReply("This room does not have a introduction set.");

		this.privateModCommand(`(${user.name} deleted the roomintro.)`);
		this.logEntry(target);

		delete room.introMessage;
		if (room.chatRoomData) {
			delete room.chatRoomData.introMessage;
			Rooms.global.writeChatRoomData();
		}
	},

	stafftopic: 'staffintro',
	staffintro: function (target, room, user, connection, cmd) {
		if (!target) {
			if (!this.can('mute', null, room)) return false;
			if (!room.staffMessage) return this.sendReply("This room does not have a staff introduction set.");
			this.sendReply('|raw|<div class="infobox">' + room.staffMessage.replace(/\n/g, '') + '</div>');
			if (user.can('ban', null, room) && cmd !== 'stafftopic') {
				this.sendReply('Source:');
				this.sendReplyBox(
					'<code>/staffintro ' + Chat.escapeHTML(room.staffMessage).split('\n').map(line => {
						return line.replace(/^(\t+)/, (match, $1) => '&nbsp;'.repeat(4 * $1.length)).replace(/^(\s+)/, (match, $1) => '&nbsp;'.repeat($1.length));
					}).join('<br />') + '</code>'
				);
			}
			return;
		}
		if (!this.can('ban', null, room)) return false;
		if (!this.canTalk()) return;
		if (target === 'off' || target === 'disable' || target === 'delete') return this.errorReply('Did you mean "/deletestaffintro"?');
		target = this.canHTML(target);
		if (!target) return;
		if (!/</.test(target)) {
			// not HTML, do some simple URL linking
			let re = /(https?:\/\/(([\w.-]+)+(:\d+)?(\/([\w/_.]*(\?\S+)?)?)?))/g;
			target = target.replace(re, '<a href="$1">$1</a>');
		}
		if (target.substr(0, 12) === '/staffintro ') target = target.substr(12);

		room.staffMessage = target.replace(/\r/g, '');
		this.sendReply("(The staff introduction has been changed to:)");
		this.sendReply('|raw|<div class="infobox">' + target.replace(/\n/g, '') + '</div>');

		this.privateModCommand(`(${user.name} changed the staffintro.)`);
		this.logEntry(room.staffMessage.replace(/\n/g, ''));

		if (room.chatRoomData) {
			room.chatRoomData.staffMessage = room.staffMessage;
			Rooms.global.writeChatRoomData();
		}
	},
	deletestafftopic: 'deletestaffintro',
	deletestaffintro: function (target, room, user) {
		if (!this.can('ban', null, room)) return false;
		if (!room.staffMessage) return this.errorReply("This room does not have a staff introduction set.");

		this.privateModCommand(`(${user.name} deleted the staffintro.)`);
		this.logEntry(target);

		delete room.staffMessage;
		if (room.chatRoomData) {
			delete room.chatRoomData.staffMessage;
			Rooms.global.writeChatRoomData();
		}
	},

	roomalias: function (target, room, user) {
		if (!target) {
			if (!this.runBroadcast()) return;
			if (!room.aliases || !room.aliases.length) return this.sendReplyBox("This room does not have any aliases.");
			return this.sendReplyBox(`This room has the following aliases: ${room.aliases.join(", ")}`);
		}
		if (!this.can('makeroom')) return false;
		if (target.includes(',')) {
			this.errorReply(`Invalid room alias: ${target.trim()}`);
			return this.parse('/help roomalias');
		}

		let alias = toId(target);
		if (!alias.length) return this.errorReply("Only alphanumeric characters are valid in an alias.");
		if (Rooms(alias) || Rooms.aliases.has(alias)) return this.errorReply("You cannot set an alias to an existing room or alias.");
		if (room.isPersonal) return this.errorReply("Personal rooms can't have aliases.");

		Rooms.aliases.set(alias, room.id);
		this.privateModCommand(`(${user.name} added the room alias '${target.trim()}'.)`);

		if (!room.aliases) room.aliases = [];
		room.aliases.push(alias);
		if (room.chatRoomData) {
			room.chatRoomData.aliases = room.aliases;
			Rooms.global.writeChatRoomData();
		}
	},
	roomaliashelp: [
		"/roomalias - displays a list of all room aliases of the room the command was entered in.",
		"/roomalias [alias] - adds the given room alias to the room the command was entered in. Requires: & ~",
	],

	removeroomalias: function (target, room, user) {
		if (!room.aliases) return this.errorReply("This room does not have any aliases.");
		if (!this.can('makeroom')) return false;
		if (target.includes(',')) {
			this.errorReply(`Invalid room alias: ${target.trim()}`);
			return this.parse('/help removeroomalias');
		}

		let alias = toId(target);
		if (!alias || !Rooms.aliases.has(alias)) return this.errorReply("Please specify an existing alias.");
		if (Rooms.aliases.get(alias) !== room.id) return this.errorReply("You may only remove an alias from the current room.");

		this.privateModCommand(`(${user.name} removed the room alias '${target}'.)`);

		let aliasIndex = room.aliases.indexOf(alias);
		if (aliasIndex >= 0) {
			room.aliases.splice(aliasIndex, 1);
			Rooms.aliases.delete(alias);
			Rooms.global.writeChatRoomData();
		}
	},
	removeroomaliashelp: ["/removeroomalias [alias] - removes the given room alias of the room the command was entered in. Requires: & ~"],

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

		if (!this.can('makeroom')) return false;

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
				return this.errorReply(`/${cmd} - Access denied for promoting/demoting from ${(Config.groups[currentGroup] ? Config.groups[currentGroup].name : "an undefined group")}.`);
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

		if (!buffer.length) {
			connection.popup("The room '" + targetRoom.title + "' has no auth." + userLookup);
			return;
		}
		if (targetRoom !== room) buffer.unshift("" + targetRoom.title + " room auth:");
		connection.popup(buffer.join("\n\n") + userLookup);
	},

	'!userauth': true,
	userauth: function (target, room, user, connection) {
		let targetId = toId(target) || user.userid;
		let targetUser = Users.getExact(targetId);
		let targetUsername = (targetUser ? targetUser.name : target);

		let buffer = [];
		let innerBuffer = [];
		let group = Users.usergroups[targetId];
		if (group) {
			buffer.push('Global auth: ' + group.charAt(0));
		}
		Rooms.rooms.forEach((curRoom, id) => {
			if (!curRoom.auth || curRoom.isPrivate) return;
			group = curRoom.auth[targetId];
			if (!group) return;
			innerBuffer.push(group + id);
		});
		if (innerBuffer.length) {
			buffer.push('Room auth: ' + innerBuffer.join(', '));
		}
		if (targetId === user.userid || user.can('lock')) {
			innerBuffer = [];
			Rooms.rooms.forEach((curRoom, id) => {
				if (!curRoom.auth || !curRoom.isPrivate) return;
				if (curRoom.isPrivate === true) return;
				let auth = curRoom.auth[targetId];
				if (!auth) return;
				innerBuffer.push(auth + id);
			});
			if (innerBuffer.length) {
				buffer.push('Hidden room auth: ' + innerBuffer.join(', '));
			}
		}
		if (targetId === user.userid || user.can('makeroom')) {
			innerBuffer = [];
			for (const chatRoom of Rooms.global.chatRooms) {
				if (!chatRoom.auth || !chatRoom.isPrivate) continue;
				if (chatRoom.isPrivate !== true) continue;
				let auth = chatRoom.auth[targetId];
				if (!auth) continue;
				innerBuffer.push(auth + chatRoom.id);
			}
			if (innerBuffer.length) {
				buffer.push('Private room auth: ' + innerBuffer.join(', '));
			}
		}
		if (!buffer.length) {
			buffer.push("No global or room auth.");
		}

		buffer.unshift("" + targetUsername + " user auth:");
		connection.popup(buffer.join("\n\n"));
	},

	rb: 'ban',
	roomban: 'ban',
	b: 'ban',
	ban: function (target, room, user, connection) {
		if (!target) return this.parse('/help ban');
		if (!this.canTalk()) return;

		target = this.splitTarget(target);
		let targetUser = this.targetUser;
		if (!targetUser) return this.errorReply("User '" + this.targetUsername + "' not found.");
		if (target.length > MAX_REASON_LENGTH) {
			return this.errorReply("The reason is too long. It cannot exceed " + MAX_REASON_LENGTH + " characters.");
		}
		if (!this.can('ban', targetUser, room)) return false;
		let name = targetUser.getLastName();
		let userid = targetUser.getLastId();

		if (Punishments.isRoomBanned(targetUser, room.id) && !target) {
			let problem = " but was already banned";
			return this.privateModCommand("(" + name + " would be banned by " + user.name + problem + ".)");
		}

		if (targetUser.trusted && room.isPrivate !== true && !room.isPersonal) {
			Monitor.log("[CrisisMonitor] Trusted user " + targetUser.name + (targetUser.trusted !== targetUser.userid ? " (" + targetUser.trusted + ")" : "") + " was roombanned from " + room.id + " by " + user.name + ", and should probably be demoted.");
		}

		if (targetUser in room.users || user.can('lock')) {
			targetUser.popup(
				"|modal||html|<p>" + Chat.escapeHTML(user.name) + " has banned you from the room " + room.id + ".</p>" + (target ? "<p>Reason: " + Chat.escapeHTML(target) + "</p>" : "") +
				"<p>To appeal the ban, PM the staff member that banned you" + (!room.battle && room.auth ? " or a room owner. </p><p><button name=\"send\" value=\"/roomauth " + room.id + "\">List Room Staff</button></p>" : ".</p>")
			);
		}

		const reason = (target ? ` (${target})` : ``);
		this.addModCommand(`${name} was banned from ${room.title} by ${user.name}.${reason}`, ` (${targetUser.latestIp})`);

		let affected = Punishments.roomBan(room, targetUser, null, null, target);

		if (!room.isPrivate && room.chatRoomData) {
			let acAccount = (targetUser.autoconfirmed !== userid && targetUser.autoconfirmed);
			if (affected.length > 1) {
				this.privateModCommand("(" + name + "'s " + (acAccount ? " ac account: " + acAccount + ", " : "") + "banned alts: " + affected.slice(1).map(user => user.getLastName()).join(", ") + ")");
			} else if (acAccount) {
				this.privateModCommand("(" + name + "'s ac account: " + acAccount + ")");
			}
		}
		this.add('|unlink|hide|' + userid);
		if (userid !== toId(this.inputUsername)) this.add('|unlink|hide|' + toId(this.inputUsername));

		if (!room.isPrivate && room.chatRoomData) {
			this.globalModlog("ROOMBAN", targetUser, " by " + user.name + (target ? ": " + target : ""));
		}
		return true;
	},
	banhelp: ["/roomban [username], [reason] - Bans the user from the room you are in. Requires: @ # & ~"],

	unroomban: 'unban',
	roomunban: 'unban',
	unban: function (target, room, user, connection) {
		if (!target) return this.parse('/help unban');
		if (!this.can('ban', null, room)) return false;

		let name = Punishments.roomUnban(room, target);

		if (name) {
			this.addModCommand("" + name + " was unbanned from " + room.title + " by " + user.name + ".");
			if (!room.isPrivate && room.chatRoomData) {
				this.globalModlog("UNROOMBAN", name, " by " + user.name);
			}
		} else {
			this.errorReply("User '" + target + "' is not banned.");
		}
	},
	unbanhelp: ["/roomunban [username] - Unbans the user from the room you are in. Requires: @ # & ~"],

	'!autojoin': true,
	autojoin: function (target, room, user, connection) {
		let targets = target.split(',');
		if (targets.length > 11 || connection.inRooms.size > 1) return;
		Rooms.global.autojoinRooms(user, connection);
		let autojoins = [];
		for (const target of targets) {
			if (user.tryJoinRoom(target, connection) === null) {
				autojoins.push(target);
			}
		}
		connection.autojoins = autojoins.join(',');
	},

	'!join': true,
	joim: 'join',
	j: 'join',
	join: function (target, room, user, connection) {
		if (!target) return this.parse('/help join');
		if (target.startsWith('http://')) target = target.slice(7);
		if (target.startsWith('https://')) target = target.slice(8);
		if (target.startsWith('play.pokemonshowdown.com/')) target = target.slice(25);
		if (target.startsWith('psim.us/')) target = target.slice(8);
		if (user.tryJoinRoom(target, connection) === null) {
			connection.sendTo(target, "|noinit|namerequired|The room '" + target + "' does not exist or requires a login to join.");
		}
	},
	joinhelp: ["/join [roomname] - Attempt to join the room [roomname]."],

	'!part': true,
	leave: 'part',
	part: function (target, room, user, connection) {
		let targetRoom = target ? Rooms.search(target) : room;
		if (!targetRoom || targetRoom === Rooms.global) {
			return this.errorReply("The room '" + target + "' does not exist.");
		}
		user.leaveRoom(targetRoom, connection);
	},

	/*********************************************************
	 * Moderating: Punishments
	 *********************************************************/

	kick: 'warn',
	k: 'warn',
	warn: function (target, room, user) {
		if (!target) return this.parse('/help warn');
		if (!this.canTalk()) return;
		if (room.isPersonal && !user.can('warn')) return this.errorReply("Warning is unavailable in group chats.");

		target = this.splitTarget(target);
		let targetUser = this.targetUser;
		if (!targetUser || !targetUser.connected) return this.errorReply("User '" + this.targetUsername + "' not found.");
		if (!(targetUser in room.users)) {
			return this.errorReply("User " + this.targetUsername + " is not in the room " + room.id + ".");
		}
		if (target.length > MAX_REASON_LENGTH) {
			return this.errorReply("The reason is too long. It cannot exceed " + MAX_REASON_LENGTH + " characters.");
		}
		if (!this.can('warn', targetUser, room)) return false;

		this.addModCommand("" + targetUser.name + " was warned by " + user.name + "." + (target ? " (" + target + ")" : ""));
		targetUser.send('|c|~|/warn ' + target);
		let userid = targetUser.getLastId();
		this.add('|unlink|' + userid);
		if (userid !== toId(this.inputUsername)) this.add('|unlink|' + toId(this.inputUsername));
	},
	warnhelp: ["/warn OR /k [username], [reason] - Warns a user showing them the Pok\u00e9mon Showdown Rules and [reason] in an overlay. Requires: % @ # & ~"],

	redirect: 'redir',
	redir: function (target, room, user, connection) {
		if (!target) return this.parse('/help redirect');
		if (room.isPrivate || room.isPersonal) return this.errorReply("Users cannot be redirected from private or personal rooms.");

		target = this.splitTarget(target);
		let targetUser = this.targetUser;
		let targetRoom = Rooms.search(target);
		if (!targetRoom || targetRoom.modjoin) {
			return this.errorReply("The room '" + target + "' does not exist.");
		}
		if (!this.can('warn', targetUser, room) || !this.can('warn', targetUser, targetRoom)) return false;
		if (!targetUser || !targetUser.connected) {
			return this.errorReply("User " + this.targetUsername + " not found.");
		}
		if (targetRoom.id === "global") return this.errorReply("Users cannot be redirected to the global room.");
		if (targetRoom.isPrivate || targetRoom.isPersonal) {
			return this.parse('/msg ' + this.targetUsername + ', /invite ' + targetRoom.id);
		}
		if (targetRoom.users[targetUser.userid]) {
			return this.errorReply("User " + targetUser.name + " is already in the room " + targetRoom.title + "!");
		}
		if (!room.users[targetUser.userid]) {
			return this.errorReply("User " + this.targetUsername + " is not in the room " + room.id + ".");
		}
		if (targetUser.joinRoom(targetRoom.id) === false) return this.errorReply("User " + targetUser.name + " could not be joined to room " + targetRoom.title + ". They could be banned from the room.");
		this.addModCommand("" + targetUser.name + " was redirected to room " + targetRoom.title + " by " + user.name + ".");
		targetUser.leaveRoom(room);
	},
	redirhelp: ["/redirect OR /redir [username], [roomname] - Attempts to redirect the user [username] to the room [roomname]. Requires: % @ & ~"],

	m: 'mute',
	mute: function (target, room, user, connection, cmd) {
		if (!target) return this.parse('/help mute');
		if (!this.canTalk()) return;

		target = this.splitTarget(target);
		let targetUser = this.targetUser;
		if (!targetUser) return this.errorReply("User '" + this.targetUsername + "' not found.");
		if (target.length > MAX_REASON_LENGTH) {
			return this.errorReply("The reason is too long. It cannot exceed " + MAX_REASON_LENGTH + " characters.");
		}

		let muteDuration = ((cmd === 'hm' || cmd === 'hourmute') ? HOURMUTE_LENGTH : MUTE_LENGTH);
		if (!this.can('mute', targetUser, room)) return false;
		let canBeMutedFurther = ((room.getMuteTime(targetUser) || 0) <= (muteDuration * 5 / 6));
		if (targetUser.locked || (room.isMuted(targetUser) && !canBeMutedFurther) || Punishments.isRoomBanned(targetUser, room.id)) {
			let problem = " but was already " + (targetUser.locked ? "locked" : room.isMuted(targetUser) ? "muted" : "room banned");
			if (!target) {
				return this.privateModCommand("(" + targetUser.name + " would be muted by " + user.name + problem + ".)");
			}
			return this.addModCommand("" + targetUser.name + " would be muted by " + user.name + problem + "." + (target ? " (" + target + ")" : ""));
		}

		if (targetUser in room.users) targetUser.popup("|modal|" + user.name + " has muted you in " + room.id + " for " + Chat.toDurationString(muteDuration) + ". " + target);
		this.addModCommand("" + targetUser.name + " was muted by " + user.name + " for " + Chat.toDurationString(muteDuration) + "." + (target ? " (" + target + ")" : ""));
		if (targetUser.autoconfirmed && targetUser.autoconfirmed !== targetUser.userid) this.privateModCommand("(" + targetUser.name + "'s ac account: " + targetUser.autoconfirmed + ")");
		let userid = targetUser.getLastId();
		this.add('|unlink|' + userid);
		if (userid !== toId(this.inputUsername)) this.add('|unlink|' + toId(this.inputUsername));

		room.mute(targetUser, muteDuration, false);
	},
	mutehelp: ["/mute OR /m [username], [reason] - Mutes a user with reason for 7 minutes. Requires: % @ * # & ~"],

	hm: 'hourmute',
	hourmute: function (target) {
		if (!target) return this.parse('/help hourmute');
		this.run('mute');
	},
	hourmutehelp: ["/hourmute OR /hm [username], [reason] - Mutes a user with reason for an hour. Requires: % @ * # & ~"],

	um: 'unmute',
	unmute: function (target, room, user) {
		if (!target) return this.parse('/help unmute');
		target = this.splitTarget(target);
		if (!this.canTalk()) return;
		if (!this.can('mute', null, room)) return false;

		let targetUser = this.targetUser;
		let successfullyUnmuted = room.unmute(targetUser ? targetUser.userid : this.targetUsername, "Your mute in '" + room.title + "' has been lifted.");

		if (successfullyUnmuted) {
			this.addModCommand("" + (targetUser ? targetUser.name : successfullyUnmuted) + " was unmuted by " + user.name + ".");
		} else {
			this.errorReply("" + (targetUser ? targetUser.name : this.targetUsername) + " is not muted.");
		}
	},
	unmutehelp: ["/unmute [username] - Removes mute from user. Requires: % @ * # & ~"],

	forcelock: 'lock',
	l: 'lock',
	ipmute: 'lock',
	wl: 'lock',
	weeklock: 'lock',
	lock: function (target, room, user, connection, cmd) {
		let week = cmd === 'wl' || cmd === 'weeklock';

		if (!target) {
			if (week) return this.parse('/help weeklock');
			return this.parse('/help lock');
		}

		target = this.splitTarget(target);
		let targetUser = this.targetUser;
		if (!targetUser && !Punishments.search(toId(this.targetUsername))[0].length) return this.errorReply(`User '${this.targetUsername}' not found.`);
		if (target.length > MAX_REASON_LENGTH) {
			return this.errorReply(`The reason is too long. It cannot exceed ${MAX_REASON_LENGTH} characters.`);
		}
		if (!this.can('lock', targetUser)) return false;

		let name, userid;

		if (targetUser) {
			name = targetUser.getLastName();
			userid = targetUser.getLastId();

			if (targetUser.locked && !target) {
				return this.privateModCommand(`(${name} would be locked by ${user.name} but was already locked.)`);
			}

			if (targetUser.trusted) {
				if (cmd === 'forcelock') {
					let from = targetUser.distrust();
					Monitor.log(`[CrisisMonitor] ${name} was locked by ${user.name} and demoted from ${from.join(", ")}.`);
					this.globalModlog("CRISISDEMOTE", targetUser, ` from ${from.join(", ")}`);
				} else {
					return this.sendReply(`${name} is a trusted user. If you are sure you would like to lock them use /forcelock.`);
				}
			} else if (cmd === 'forcelock') {
				return this.errorReply(`Use /lock; ${name} is not a trusted user.`);
			}

			let roomauth = [];
			Rooms.rooms.forEach((curRoom, id) => {
				if (id === 'global' || !curRoom.auth) return;
				// Destroy personal rooms of the locked user.
				if (curRoom.isPersonal && curRoom.auth[userid] === '#') {
					curRoom.destroy();
				} else {
					if (curRoom.isPrivate || curRoom.battle) return;

					let group = curRoom.auth[userid];

					if (group) roomauth.push(`${group}${id}`);
				}
			});

			if (roomauth.length) Monitor.log(`[CrisisMonitor] Locked user ${name} has public roomauth (${roomauth.join(', ')}), and should probably be demoted.`);
		} else {
			name = this.targetUsername;
			userid = toId(this.targetUsername);
		}

		let proof = '';
		let userReason = target;
		let targetLowercase = target.toLowerCase();
		if (target && (targetLowercase.includes('spoiler:') || targetLowercase.includes('spoilers:'))) {
			let proofIndex = (targetLowercase.includes('spoilers:') ? targetLowercase.indexOf('spoilers:') : targetLowercase.indexOf('spoiler:'));
			let bump = (targetLowercase.includes('spoilers:') ? 9 : 8);
			proof = `(PROOF: ${target.substr(proofIndex + bump, target.length).trim()}) `;
			userReason = target.substr(0, proofIndex).trim();
		}

		let weekMsg = week ? ' for a week' : '';

		if (targetUser) {
			targetUser.popup(`|modal|${user.name} has locked you from talking in chats, battles, and PMing regular users${weekMsg}.` + (userReason ? `\n\nReason: ${userReason}` : "") + `\n\nIf you feel that your lock was unjustified, you can still PM staff members (%, @, &, and ~) to discuss it` + (Config.appealurl ? ` or you can appeal:\n${Config.appealurl}` : ".") + `\n\nYour lock will expire in a few days.`);
		}

		let lockMessage = `${name} was locked from talking${weekMsg} by ${user.name}.` + (userReason ? ` (${userReason})` : "");

		this.addModCommand(lockMessage, ` ${proof}` + (targetUser ? `(${targetUser.latestIp})` : ''));

		// Notify staff room when a user is locked outside of it.
		if (room.id !== 'staff' && Rooms('staff')) {
			Rooms('staff').addLogMessage(user, `<<${room.id}>> ${lockMessage}`);
		}

		// Use default time for locks.
		let duration = week ? Date.now() + 7 * 24 * 60 * 60 * 1000 : null;
		let affected = [];

		if (targetUser) {
			affected = Punishments.lock(targetUser, duration, null, userReason);
		} else {
			affected = Punishments.lock(null, duration, userid, userReason);
		}

		let acAccount = (targetUser && targetUser.autoconfirmed !== userid && targetUser.autoconfirmed);
		if (affected.length > 1) {
			this.privateModCommand(`(${name}'s ` + (acAccount ? ` ac account: ${acAccount}, ` : "") + `locked alts: ${affected.slice(1).map(user => user.getLastName()).join(", ")})`);
		} else if (acAccount) {
			this.privateModCommand(`(${name}'s ac account: ${acAccount})`);
		}
		this.add(`|unlink|hide|${userid}`);
		if (userid !== toId(this.inputUsername)) this.add(`|unlink|hide|${toId(this.inputUsername)}`);

		const globalReason = (target ? `: ${userReason} ${proof}` : ``);
		this.globalModlog((week ? "WEEKLOCK" : "LOCK"), targetUser || userid, ` by ${user.name}${globalReason}`);
		return true;
	},
	lockhelp: [
		"/lock OR /l [username], [reason] - Locks the user from talking in all chats. Requires: % @ * & ~",
		"/weeklock OR /wl [username], [reason] - Same as /lock, but locks users for a week.",
		"/lock OR /l [username], [reason] spoiler: [proof] - Marks proof in modlog only.",
	],

	unlock: function (target, room, user) {
		if (!target) return this.parse('/help unlock');
		if (!this.can('lock')) return false;

		let targetUser = Users.get(target);
		if (targetUser && targetUser.namelocked) {
			return this.errorReply(`User ${targetUser.name} is namelocked, not locked. Use /unnamelock to unnamelock them.`);
		}
		let reason = '';
		if (targetUser && targetUser.locked && targetUser.locked.charAt(0) === '#') {
			reason = ' (' + targetUser.locked + ')';
		}

		let unlocked = Punishments.unlock(target);

		if (unlocked) {
			const unlockMessage = unlocked.join(", ") + " " + ((unlocked.length > 1) ? "were" : "was") +
				" unlocked by " + user.name + "." + reason;
			this.addModCommand(unlockMessage);
			// Notify staff room when a user is unlocked outside of it.
			if (!reason && room.id !== 'staff' && Rooms('staff')) {
				Rooms('staff').addLogMessage(user, "<<" + room.id + ">> " + unlockMessage);
			}
			if (!reason) this.globalModlog("UNLOCK", target, " by " + user.name);
			if (targetUser) targetUser.popup("" + user.name + " has unlocked you.");
		} else {
			this.errorReply("User '" + target + "' is not locked.");
		}
	},
	unlockhelp: ["/unlock [username] - Unlocks the user. Requires: % @ * & ~"],

	forceglobalban: 'globalban',
	gban: 'globalban',
	globalban: function (target, room, user, connection, cmd) {
		if (!target) return this.parse('/help globalban');

		target = this.splitTarget(target);
		let targetUser = this.targetUser;
		if (!targetUser) return this.errorReply("User '" + this.targetUsername + "' not found.");
		if (target.length > MAX_REASON_LENGTH) {
			return this.errorReply("The reason is too long. It cannot exceed " + MAX_REASON_LENGTH + " characters.");
		}
		if (!target) {
			return this.errorReply("Global bans require a reason.");
		}
		if (!this.can('ban', targetUser)) return false;
		let name = targetUser.getLastName();
		let userid = targetUser.getLastId();

		if (targetUser.trusted) {
			if (cmd === 'forceglobalban') {
				let from = targetUser.distrust();
				Monitor.log("[CrisisMonitor] " + name + " was globally banned by " + user.name + " and demoted from " + from.join(", ") + ".");
				this.globalModlog("CRISISDEMOTE", targetUser, " from " + from.join(", "));
			} else {
				return this.sendReply("" + name + " is a trusted user. If you are sure you would like to ban them use /forceglobalban.");
			}
		} else if (cmd === 'forceglobalban') {
			return this.errorReply("Use /globalban; " + name + " is not a trusted user.");
		}

		// Destroy personal rooms of the banned user.
		targetUser.inRooms.forEach(roomid => {
			if (roomid === 'global') return;
			let targetRoom = Rooms.get(roomid);
			if (targetRoom.isPersonal && targetRoom.auth[userid] === '#') {
				targetRoom.destroy();
			}
		});

		let proof = '';
		let userReason = target;
		let targetLowercase = target.toLowerCase();
		if (target && (targetLowercase.includes('spoiler:') || targetLowercase.includes('spoilers:'))) {
			let proofIndex = (targetLowercase.includes('spoilers:') ? targetLowercase.indexOf('spoilers:') : targetLowercase.indexOf('spoiler:'));
			let bump = (targetLowercase.includes('spoilers:') ? 9 : 8);
			proof = `(PROOF: ${target.substr(proofIndex + bump, target.length).trim()}) `;
			userReason = target.substr(0, proofIndex).trim();
		}

		targetUser.popup("|modal|" + user.name + " has globally banned you." + (userReason ? "\n\nReason: " + userReason : "") + (Config.appealurl ? "\n\nIf you feel that your ban was unjustified, you can appeal:\n" + Config.appealurl : "") + "\n\nYour ban will expire in a few days.");

		let banMessage = "" + name + " was globally banned by " + user.name + "." + (userReason ? " (" + userReason + ")" : "");
		this.addModCommand(banMessage, ` ${proof}(${targetUser.latestIp})`);

		// Notify staff room when a user is banned outside of it.
		if (room.id !== 'staff' && Rooms('staff')) {
			Rooms('staff').addLogMessage(user, "<<" + room.id + ">> " + banMessage);
		}

		let affected = Punishments.ban(targetUser, null, null, userReason);
		let acAccount = (targetUser.autoconfirmed !== userid && targetUser.autoconfirmed);
		if (affected.length > 1) {
			let guests = affected.length - 1;
			affected = affected.slice(1).map(user => user.getLastName()).filter(alt => alt.substr(0, 7) !== '[Guest ');
			guests -= affected.length;
			this.privateModCommand("(" + name + "'s " + (acAccount ? " ac account: " + acAccount + ", " : "") + "banned alts: " + affected.join(", ") + (guests ? " [" + guests + " guests]" : "") + ")");
			for (const user of affected) {
				this.add('|unlink|' + toId(user));
			}
		} else if (acAccount) {
			this.privateModCommand("(" + name + "'s ac account: " + acAccount + ")");
		}

		this.add('|unlink|hide|' + userid);
		if (userid !== toId(this.inputUsername)) this.add('|unlink|hide|' + toId(this.inputUsername));

		const globalReason = (target ? `: ${userReason} ${proof}` : ``);
		this.globalModlog("BAN", targetUser, ` by ${user.name}${globalReason}`);
		return true;
	},
	globalbanhelp: [
		"/globalban OR /gban [username], [reason] - Kick user from all rooms and ban user's IP address with reason. Requires: @ * & ~",
		"/globalban OR /gban [username], [reason] spoiler: [proof] - Marks proof in modlog only.",
	],

	globalunban: 'unglobalban',
	unglobalban: function (target, room, user) {
		if (!target) return this.parse(`/help unglobalban`);
		if (!this.can('ban')) return false;

		let name = Punishments.unban(target);

		let unbanMessage = `${name} was globally unbanned by ${user.name}.`;

		if (name) {
			this.addModCommand(unbanMessage);
			// Notify staff room when a user is unbanned outside of it.
			if (room.id !== 'staff' && Rooms('staff')) {
				Rooms('staff').addLogMessage(user, `<<${room.id}>> ${unbanMessage}`);
			}
			this.globalModlog("UNBAN", name, ` by ${user.name}`);
		} else {
			this.errorReply(`User '${target}' is not globally banned.`);
		}
	},
	unglobalbanhelp: ["/unglobalban [username] - Unban a user. Requires: @ * & ~"],

	unbanall: function (target, room, user) {
		if (!this.can('rangeban')) return false;
		if (!target) {
			user.lastCommand = '/unbanall';
			this.errorReply("THIS WILL UNBAN AND UNLOCK ALL USERS.");
			this.errorReply("To confirm, use: /unbanall confirm");
			return;
		}
		if (user.lastCommand !== '/unbanall' || target !== 'confirm') {
			return this.parse('/help unbanall');
		}
		user.lastCommand = '';
		Punishments.userids.clear();
		Punishments.ips.clear();
		Punishments.savePunishments();
		this.addModCommand("All bans and locks have been lifted by " + user.name + ".");
	},
	unbanallhelp: ["/unbanall - Unban all IP addresses. Requires: & ~"],

	deroomvoiceall: function (target, room, user) {
		if (!this.can('editroom', null, room)) return false;
		if (!room.auth) return this.errorReply("Room does not have roomauth.");
		if (!target) {
			user.lastCommand = '/deroomvoiceall';
			this.errorReply("THIS WILL DEROOMVOICE ALL ROOMVOICED USERS.");
			this.errorReply("To confirm, use: /deroomvoiceall confirm");
			return;
		}
		if (user.lastCommand !== '/deroomvoiceall' || target !== 'confirm') {
			return this.parse('/help deroomvoiceall');
		}
		user.lastCommand = '';
		let count = 0;
		for (let userid in room.auth) {
			if (room.auth[userid] === '+') {
				delete room.auth[userid];
				if (userid in room.users) room.users[userid].updateIdentity(room.id);
				count++;
			}
		}
		if (!count) {
			return this.sendReply("(This room has zero roomvoices)");
		}
		if (room.chatRoomData) {
			Rooms.global.writeChatRoomData();
		}
		this.addModCommand("All " + count + " roomvoices have been cleared by " + user.name + ".");
	},
	deroomvoiceallhelp: ["/deroomvoiceall - Devoice all roomvoiced users. Requires: # & ~"],

	rangeban: 'banip',
	banip: function (target, room, user) {
		target = this.splitTargetText(target);
		let targetIp = this.targetUsername.trim();
		if (!targetIp || !/^[0-9.]+(?:\.\*)?$/.test(targetIp)) return this.parse('/help banip');
		if (!target) return this.errorReply("/banip requires a ban reason");

		if (!this.can('rangeban')) return false;
		const targetDesc = "IP " + (targetIp.endsWith('*') ? "range " : "") + targetIp;

		const curPunishment = Punishments.ipSearch(targetIp);
		if (curPunishment && curPunishment[0] === 'BAN') {
			return this.errorReply(`The ${targetDesc} is already temporarily banned.`);
		}
		Punishments.banRange(targetIp, target);
		this.addModCommand(`${user.name} hour-banned the ${targetDesc}: ${target}`);
	},
	baniphelp: ["/banip [ip] - Globally bans this IP or IP range for an hour. Accepts wildcards to ban ranges. Existing users on the IP will not be banned. Requires: & ~"],

	unrangeban: 'unbanip',
	unbanip: function (target, room, user) {
		target = target.trim();
		if (!target) {
			return this.parse('/help unbanip');
		}
		if (!this.can('rangeban')) return false;
		if (!Punishments.ips.has(target)) {
			return this.errorReply("" + target + " is not a locked/banned IP or IP range.");
		}
		Punishments.ips.delete(target);
		this.addModCommand("" + user.name + " unbanned the " + (target.charAt(target.length - 1) === '*' ? "IP range" : "IP") + ": " + target);
	},
	unbaniphelp: ["/unbanip [ip] - Unbans. Accepts wildcards to ban ranges. Requires: & ~"],

	rangelock: 'lockip',
	lockip: function (target, room, user) {
		target = this.splitTargetText(target);
		let targetIp = this.targetUsername.trim();
		if (!targetIp || !/^[0-9.]+(?:\.\*)?$/.test(targetIp)) return this.parse('/help lockip');
		if (!target) return this.errorReply("/lockip requires a lock reason");

		if (!this.can('rangeban')) return false;
		const targetDesc = "IP " + (targetIp.endsWith('*') ? "range " : "") + targetIp;

		const curPunishment = Punishments.ipSearch(targetIp);
		if (curPunishment && (curPunishment[0] === 'BAN' || curPunishment[0] === 'LOCK')) {
			const punishDesc = curPunishment[0] === 'BAN' ? `temporarily banned` : `temporarily locked`;
			return this.errorReply(`The ${targetDesc} is already ${punishDesc}.`);
		}

		Punishments.lockRange(targetIp, target);
		this.addModCommand(`${user.name} hour-locked the ${targetDesc}: ${target}`);
	},
	lockiphelp: ["/lockip [ip] - Globally locks this IP or IP range for an hour. Accepts wildcards to ban ranges. Existing users on the IP will not be banned. Requires: & ~"],

	unrangelock: 'unlockip',
	rangeunlock: 'unlockip',
	unlockip: function (target, room, user) {
		target = target.trim();
		if (!target) {
			return this.parse('/help unbanip');
		}
		if (!this.can('rangeban')) return false;
		if (!Punishments.ips.has(target)) {
			return this.errorReply("" + target + " is not a locked/banned IP or IP range.");
		}
		Punishments.ips.delete(target);
		this.addModCommand("" + user.name + " unlocked the " + (target.charAt(target.length - 1) === '*' ? "IP range" : "IP") + ": " + target);
	},

	/*********************************************************
	 * Moderating: Other
	 *********************************************************/

	mn: 'modnote',
	modnote: function (target, room, user, connection) {
		if (!target) return this.parse('/help modnote');
		if (!this.canTalk()) return;

		if (target.length > MAX_REASON_LENGTH) {
			return this.errorReply("The note is too long. It cannot exceed " + MAX_REASON_LENGTH + " characters.");
		}
		if (!this.can('receiveauthmessages', null, room)) return false;
		return this.privateModCommand("(" + user.name + " notes: " + target + ")");
	},
	modnotehelp: ["/modnote [note] - Adds a moderator note that can be read through modlog. Requires: % @ * # & ~"],

	globalpromote: 'promote',
	promote: function (target, room, user, connection, cmd) {
		if (!target) return this.parse('/help promote');

		target = this.splitTarget(target, true);
		let targetUser = this.targetUser;
		let userid = toId(this.targetUsername);
		let name = targetUser ? targetUser.name : this.targetUsername;

		if (!userid) return this.parse('/help promote');

		let currentGroup = ((targetUser && targetUser.group) || Users.usergroups[userid] || ' ')[0];
		let nextGroup = target;
		if (target === 'deauth') nextGroup = Config.groupsranking[0];
		if (!nextGroup) {
			return this.errorReply("Please specify a group such as /globalvoice or /globaldeauth");
		}
		if (!Config.groups[nextGroup]) {
			return this.errorReply(`Group '${nextGroup}' does not exist.`);
		}
		if (!cmd.startsWith('global')) {
			let groupid = Config.groups[nextGroup].id;
			if (!groupid && nextGroup === Config.groupsranking[0]) groupid = 'deauth';
			if (Config.groups[nextGroup].globalonly) return this.errorReply(`Did you mean "/global${groupid}"?`);
			if (Config.groups[nextGroup].roomonly) return this.errorReply(`Did you mean "/room${groupid}"?`);
			return this.errorReply(`Did you mean "/room${groupid}" or "/global${groupid}"?`);
		}
		if (Config.groups[nextGroup].roomonly || Config.groups[nextGroup].battleonly) {
			return this.errorReply(`Group '${nextGroup}' does not exist as a global rank.`);
		}

		let groupName = Config.groups[nextGroup].name || "regular user";
		if (currentGroup === nextGroup) {
			return this.errorReply(`User '${name}' is already a ${groupName}`);
		}
		if (!user.canPromote(currentGroup, nextGroup)) {
			return this.errorReply(`/${cmd} - Access denied.`);
		}

		if (!Users.isUsernameKnown(userid)) {
			return this.errorReply(`/globalpromote - WARNING: '${name}' is offline and unrecognized. The username might be misspelled (either by you or the person who told you) or unregistered. Use /forcepromote if you're sure you want to risk it.`);
		}
		if (targetUser && !targetUser.registered) {
			return this.errorReply(`User '${name}' is unregistered, and so can't be promoted.`);
		}
		Users.setOfflineGroup(name, nextGroup);
		if (Config.groups[nextGroup].rank < Config.groups[currentGroup].rank) {
			this.privateModCommand(`(${name} was demoted to ${groupName} by ${user.name}.)`);
			if (targetUser) targetUser.popup(`You were demoted to ${groupName} by ${user.name}.`);
		} else {
			this.addModCommand(`${name} was promoted to ${groupName} by ${user.name}.`);
			if (targetUser) targetUser.popup(`You were promoted to ${groupName} by ${user.name}.`);
		}

		if (targetUser) targetUser.updateIdentity();
	},
	promotehelp: ["/promote [username], [group] - Promotes the user to the specified group. Requires: & ~"],

	confirmuser: 'trustuser',
	trustuser: function (target) {
		if (!target) return this.parse('/help trustuser');
		if (!this.can('promote')) return;

		target = this.splitTarget(target, true);
		let targetUser = this.targetUser;
		let userid = toId(this.targetUsername);
		let name = targetUser ? targetUser.name : this.targetUsername;

		if (!userid) return this.parse('/help trustuser');
		if (!targetUser) return this.errorReply("User '" + name + "' is not online.");

		if (targetUser.trusted) return this.errorReply("User '" + name + "' is already trusted.");

		targetUser.setGroup(Config.groupsranking[0], true);
		this.sendReply("User '" + name + "' is now trusted.");
	},
	trustuserhelp: ["/trustuser [username] - Trusts the user (makes them immune to locks). Requires: & ~"],

	globaldemote: 'demote',
	demote: function (target) {
		if (!target) return this.parse('/help demote');
		this.run('promote');
	},
	demotehelp: ["/demote [username], [group] - Demotes the user to the specified group. Requires: & ~"],

	forcepromote: function (target, room, user) {
		// warning: never document this command in /help
		if (!this.can('forcepromote')) return false;
		target = this.splitTarget(target, true);
		let name = this.targetUsername;
		let nextGroup = target;
		if (!Config.groups[nextGroup]) return this.errorReply("Group '" + nextGroup + "' does not exist.");
		if (Config.groups[nextGroup].roomonly || Config.groups[nextGroup].battleonly) return this.errorReply(`Group '${nextGroup}' does not exist as a global rank.`);

		if (Users.isUsernameKnown(name)) {
			return this.errorReply("/forcepromote - Don't forcepromote unless you have to.");
		}
		Users.setOfflineGroup(name, nextGroup);

		this.addModCommand("" + name + " was promoted to " + (Config.groups[nextGroup].name || "regular user") + " by " + user.name + ".");
	},

	devoice: 'deauth',
	deauth: function (target, room, user) {
		return this.parse('/demote ' + target + ', deauth');
	},

	deglobalvoice: 'globaldeauth',
	deglobalauth: 'globaldeauth',
	globaldevoice: 'globaldeauth',
	globaldeauth: function (target, room, user) {
		return this.parse('/globaldemote ' + target + ', deauth');
	},

	deroomvoice: 'roomdeauth',
	roomdevoice: 'roomdeauth',
	deroomauth: 'roomdeauth',
	roomdeauth: function (target, room, user) {
		return this.parse('/roomdemote ' + target + ', deauth');
	},

	declare: function (target, room, user) {
		if (!target) return this.parse('/help declare');
		if (!this.can('declare', null, room)) return false;
		if (!this.canTalk()) return;
		if (target.length > 2000) return this.errorReply("Declares should not exceed 2000 characters.");

		this.add(`|notify|${room.title} announcement!|${target}`);
		this.add(Chat.html`|raw|<div class="broadcast-blue"><b>${target}</b></div>`);
		this.logModCommand(`${user.name} declared: ${target}`);
	},
	declarehelp: ["/declare [message] - Anonymously announces a message. Requires: # * & ~"],

	htmldeclare: function (target, room, user) {
		if (!target) return this.parse('/help htmldeclare');
		if (!this.can('gdeclare', null, room)) return false;
		if (!this.canTalk()) return;
		target = this.canHTML(target);
		if (!target) return;

		this.add(`|notify|${room.title} announcement!|${Chat.stripHTML(target)}`);
		this.add(`|raw|<div class="broadcast-blue"><b>${target}</b></div>`);
		this.logModCommand(`${user.name} HTML-declared: ${target}`);
	},
	htmldeclarehelp: ["/htmldeclare [message] - Anonymously announces a message using safe HTML. Requires: ~"],

	gdeclare: 'globaldeclare',
	globaldeclare: function (target, room, user) {
		if (!target) return this.parse('/help globaldeclare');
		if (!this.can('gdeclare')) return false;
		target = this.canHTML(target);
		if (!target) return;

		Rooms.rooms.forEach((curRoom, id) => {
			if (id !== 'global') curRoom.addRaw(`<div class="broadcast-blue"><b>${target}</b></div>`).update();
		});
		Users.users.forEach(u => {
			if (u.connected) u.send(`|pm|~|${u.group}${u.name}|/raw <div class="broadcast-blue"><b>${target}</b></div>`);
		});
		this.logModCommand(`${user.name} globally declared: ${target}`);
	},
	globaldeclarehelp: ["/globaldeclare [message] - Anonymously announces a message to every room on the server. Requires: ~"],

	cdeclare: 'chatdeclare',
	chatdeclare: function (target, room, user) {
		if (!target) return this.parse('/help chatdeclare');
		if (!this.can('gdeclare')) return false;
		target = this.canHTML(target);
		if (!target) return;

		Rooms.rooms.forEach((curRoom, id) => {
			if (id !== 'global' && curRoom.type !== 'battle') curRoom.addRaw(`<div class="broadcast-blue"><b>${target}</b></div>`).update();
		});
		this.logModCommand(`${user.name} declared to all chat rooms: ${target}`);
	},
	chatdeclarehelp: ["/cdeclare [message] - Anonymously announces a message to all chatrooms on the server. Requires: ~"],

	'!announce': true,
	wall: 'announce',
	announce: function (target, room, user) {
		if (!target) return this.parse('/help announce');

		if (room && !this.can('announce', null, room)) return false;

		target = this.canTalk(target);
		if (!target) return;

		return '/announce ' + target;
	},
	announcehelp: ["/announce OR /wall [message] - Makes an announcement. Requires: % @ * # & ~"],

	fr: 'forcerename',
	forcerename: function (target, room, user) {
		if (!target) return this.parse('/help forcerename');

		let reason = this.splitTarget(target, true);
		let targetUser = this.targetUser;
		if (!targetUser) {
			this.splitTarget(target);
			if (this.targetUser) {
				return this.errorReply("User has already changed their name to '" + this.targetUser.name + "'.");
			}
			return this.errorReply("User '" + target + "' not found.");
		}
		if (!this.can('forcerename', targetUser)) return false;

		let entry = targetUser.name + " was forced to choose a new name by " + user.name + (reason ? ": " + reason : "");
		this.privateModCommand("(" + entry + ")");
		Ladders.matchmaker.cancelSearch(targetUser);
		targetUser.resetName(true);
		targetUser.send("|nametaken||" + user.name + " considers your name inappropriate" + (reason ? ": " + reason : "."));
		return true;
	},
	forcerenamehelp: ["/forcerename OR /fr [username], [reason] - Forcibly change a user's name and shows them the [reason]. Requires: % @ * & ~"],

	nl: 'namelock',
	namelock: function (target, room, user) {
		if (!target) return this.parse('/help namelock');

		let reason = this.splitTarget(target, true);
		let targetUser = this.targetUser;

		if (!targetUser) {
			return this.errorReply(`User '${this.targetUsername}' not found.`);
		}
		if (!this.can('forcerename', targetUser)) return false;
		if (targetUser.namelocked) return this.errorReply(`User '${targetUser.name}' is already namelocked.`);

		const reasonText = reason ? ` (${reason})` : `.`;
		const lockMessage = `${targetUser.name} was namelocked by ${user.name}${reasonText}`;
		this.privateModCommand(`(${lockMessage})`, ` (${targetUser.latestIp})`);

		// Notify staff room when a user is locked outside of it.
		if (room.id !== 'staff' && Rooms('staff')) {
			Rooms('staff').addLogMessage(user, "<<" + room.id + ">> " + lockMessage);
		}

		this.globalModlog("NAMELOCK", targetUser, ` by ${user.name}${reasonText}`);
		Ladders.matchmaker.cancelSearch(targetUser);
		Punishments.namelock(targetUser, null, null, reason);
		targetUser.popup(`|modal|${user.name} has locked your name and you can't change names anymore${reasonText}`);
		return true;
	},
	namelockhelp: ["/namelock OR /nl [username], [reason] - Name locks a user and shows them the [reason]. Requires: % @ * & ~"],

	unl: 'unnamelock',
	unnamelock: function (target, room, user) {
		if (!target) return this.parse('/help unnamelock');
		if (!this.can('forcerename')) return false;

		let targetUser = Users.get(target);
		let reason = '';
		if (targetUser && targetUser.namelocked) {
			reason = ' (' + targetUser.namelocked + ')';
		}

		let unlocked = Punishments.unnamelock(target);

		if (unlocked) {
			this.addModCommand(unlocked + " was unnamelocked by " + user.name + "." + reason);
			if (!reason) this.globalModlog("UNNAMELOCK", target, " by " + user.name);
			if (targetUser) targetUser.popup("" + user.name + " has unnamelocked you.");
		} else {
			this.errorReply("User '" + target + "' is not namelocked.");
		}
	},
	unnamelockhelp: ["/unnamelock [username] - Unnamelocks the user. Requires: % @ * & ~"],

	hidetextalts: 'hidetext',
	hidealttext: 'hidetext',
	hidealtstext: 'hidetext',
	hidetext: function (target, room, user, connection, cmd) {
		if (!target) return this.parse('/help hidetext');

		this.splitTarget(target);
		let targetUser = this.targetUser;
		let name = this.targetUsername;
		if (!targetUser) return this.errorReply("User '" + name + "' not found.");
		let userid = targetUser.getLastId();
		let hidetype = '';
		if (!user.can('lock', targetUser) && !this.can('ban', targetUser, room)) return false;

		if (targetUser.locked || Punishments.isRoomBanned(targetUser, room.id) || user.can('rangeban')) {
			hidetype = 'hide|';
		} else {
			return this.errorReply("User '" + name + "' is not banned from this room or locked.");
		}

		if (cmd === 'hidealtstext' || cmd === 'hidetextalts' || cmd === 'hidealttext') {
			this.addModCommand(`${targetUser.name}'s alts' messages were cleared from ${room.title} by ${user.name}.`);
			this.add(`|unlink|${hidetype}${userid}`);

			const alts = targetUser.getAltUsers(true);
			for (const alt of alts) {
				this.add(`|unlink|${hidetype}${alt.name}`);
			}
			for (const name in targetUser.prevNames) {
				this.add(`|unlink|${hidetype}${targetUser.prevNames[name]}`);
			}
		} else {
			this.addModCommand("" + targetUser.name + "'s messages were cleared from  " + room.title + " by " + user.name + ".");
			this.add('|unlink|' + hidetype + userid);
			if (userid !== toId(this.inputUsername)) this.add('|unlink|' + hidetype + toId(this.inputUsername));
		}
	},
	hidetexthelp: [
		"/hidetext [username] - Removes a locked or banned user's messages from chat (includes users banned from the room). Requires: % (global only), @ * # & ~",
		"/hidealtstext [username] - Removes a locked or banned user's messages, and their alternate account's messages from the chat (includes users banned from the room).  Requires: % (global only), @ * # & ~",
	],

	ab: 'blacklist',
	blacklist: function (target, room, user) {
		if (!target) return this.parse('/help blacklist');
		if (!this.canTalk()) return;
		if (toId(target) === 'show') return this.errorReply("You're looking for /showbl");

		target = this.splitTarget(target);
		const targetUser = this.targetUser;
		if (!targetUser) return this.errorReply("User '" + this.targetUsername + "' not found.");
		if (!this.can('editroom', targetUser, room)) return false;
		if (!room.chatRoomData) {
			return this.errorReply("This room is not going to last long enough for a blacklist to matter - just ban the user");
		}
		let punishment = Punishments.isRoomBanned(targetUser, room.id);
		if (punishment && punishment[0] === 'BLACKLIST') {
			return this.errorReply("This user is already blacklisted from this room.");
		}

		if (!target) {
			return this.errorReply("Blacklists require a reason.");
		}
		if (target.length > MAX_REASON_LENGTH) {
			return this.errorReply("The reason is too long. It cannot exceed " + MAX_REASON_LENGTH + " characters.");
		}
		const name = targetUser.getLastName();
		const userid = targetUser.getLastId();

		if (targetUser.trusted && room.isPrivate !== true) {
			Monitor.log("[CrisisMonitor] Trusted user " + targetUser.name + (targetUser.trusted !== targetUser.userid ? " (" + targetUser.trusted + ")" : "") + " was blacklisted from " + room.id + " by " + user.name + ", and should probably be demoted.");
		}

		if (targetUser in room.users || user.can('lock')) {
			targetUser.popup(
				"|modal||html|<p>" + Chat.escapeHTML(user.name) + " has blacklisted you from the room " + room.id + ".</p>" + (target ? "<p>Reason: " + Chat.escapeHTML(target) + "</p>" : "") +
				"<p>To appeal the ban, PM the staff member that blacklisted you" + (!room.battle && room.auth ? " or a room owner. </p><p><button name=\"send\" value=\"/roomauth " + room.id + "\">List Room Staff</button></p>" : ".</p>")
			);
		}

		this.addModCommand(`${name} was blacklisted from ${room.title} by ${user.name}. ${(target ? ` (${target})` : ``)}`, ` (${targetUser.latestIp})`);

		let affected = Punishments.roomBlacklist(room, targetUser, null, null, target);

		if (!room.isPrivate && room.chatRoomData) {
			let acAccount = (targetUser.autoconfirmed !== userid && targetUser.autoconfirmed);
			if (affected.length > 1) {
				this.privateModCommand("(" + name + "'s " + (acAccount ? " ac account: " + acAccount + ", " : "") + "blacklisted alts: " + affected.slice(1).map(user => user.getLastName()).join(", ") + ")");
			} else if (acAccount) {
				this.privateModCommand("(" + name + "'s ac account: " + acAccount + ")");
			}
		}
		this.add('|unlink|hide|' + userid);
		if (userid !== toId(this.inputUsername)) this.add('|unlink|hide|' + toId(this.inputUsername));

		if (!room.isPrivate && room.chatRoomData) {
			this.globalModlog("BLACKLIST", targetUser, " by " + user.name + (target ? ": " + target : ""));
		}
		return true;
	},
	blacklisthelp: ["/blacklist [username], [reason] - Blacklists the user from the room you are in for a year. Requires: # & ~"],

	nameblacklist: 'blacklistname',
	blacklistname: function (target, room, user) {
		if (!target) return this.parse('/help blacklistname');
		if (!this.canTalk()) return;
		if (!this.can('editroom', null, room)) return false;
		if (!room.chatRoomData) {
			return this.errorReply("This room is not going to last long enough for a blacklist to matter - just ban the user");
		}

		let [targetStr, reason] = target.split('|').map(val => val.trim());
		if (!(targetStr && reason)) return this.errorReply("Usage: /blacklistname name1, name2, ... | reason");

		let targets = targetStr.split(',').map(s => toId(s));

		let duplicates = targets.filter(userid => {
			let punishment = Punishments.roomUserids.nestedGet(room.id, userid);
			return punishment && punishment[0] === 'BLACKLIST';
		});
		if (duplicates.length) {
			return this.errorReply(`[${duplicates.join(', ')}] ${Chat.plural(duplicates, "are", "is")} already blacklisted.`);
		}

		for (const userid of targets) {
			Punishments.roomBlacklist(room, null, null, userid, reason);

			let trusted = Users.isTrusted(userid);
			if (trusted && room.isPrivate !== true) {
				Monitor.log("[CrisisMonitor] Trusted user " + userid + (trusted !== userid ? " (" + trusted + ")" : "") + " was nameblacklisted from " + room.id + " by " + user.name + ", and should probably be demoted.");
			}
		}

		this.addModCommand(`${targets.join(', ')}${(targets.length > 1 ? " were" : " was")} nameblacklisted from ${room.title} by ${user.name}.`);
		return true;
	},
	blacklistnamehelp: ["/blacklistname OR /nameblacklist [username1, username2, etc.] | reason - Blacklists the given username(s) from the room you are in for a year. Requires: # & ~"],

	unab: 'unblacklist',
	unblacklist: function (target, room, user) {
		if (!target) return this.parse('/help unblacklist');
		if (!this.can('editroom', null, room)) return false;

		const name = Punishments.roomUnblacklist(room, target);

		if (name) {
			this.addModCommand("" + name + " was unblacklisted by " + user.name + ".");
			if (!room.isPrivate && room.chatRoomData) {
				this.globalModlog("UNBLACKLIST", name, " by " + user.name);
			}
		} else {
			this.errorReply("User '" + target + "' is not blacklisted.");
		}
	},
	unblacklisthelp: ["/unblacklist [username] - Unblacklists the user from the room you are in. Requires: # & ~"],

	unblacklistall: function (target, room, user) {
		if (!this.can('editroom', null, room)) return false;

		if (!target) {
			user.lastCommand = '/unblacklistall';
			this.errorReply("THIS WILL UNBLACKLIST ALL BLACKLISTED USERS IN THIS ROOM.");
			this.errorReply("To confirm, use: /unblacklistall confirm");
			return;
		}
		if (user.lastCommand !== '/unblacklistall' || target !== 'confirm') {
			return this.parse('/help unblacklistall');
		}
		user.lastCommand = '';
		let unblacklisted = Punishments.roomUnblacklistAll(room);
		if (!unblacklisted) return this.errorReply("No users are currently blacklisted in this room to unblacklist.");
		this.addModCommand(`All blacklists in this room have been lifted by ${user.name}.`);
		this.logEntry(`Unblacklisted users: ${unblacklisted.join(', ')}`);
	},
	unblacklistallhelp: ["/unblacklistall - Unblacklists all blacklisted users in the current room. Requires #, &, ~"],

	expiringbls: 'showblacklist',
	expiringblacklists: 'showblacklist',
	blacklists: 'showblacklist',
	showbl: 'showblacklist',
	showblacklist: function (target, room, user, connection, cmd) {
		if (target) room = Rooms.search(target);
		if (!room) return this.errorReply(`The room "${target}" was not found.`);
		if (!this.can('mute', null, room)) return false;
		const SOON_EXPIRING_TIME = 3 * 30 * 24 * 60 * 60 * 1000; // 3 months

		if (!room.chatRoomData) return this.errorReply("This room does not support blacklists.");

		const subMap = Punishments.roomUserids.get(room.id);
		if (!subMap || subMap.size === 0) {
			return this.sendReply("This room has no blacklisted users.");
		}
		let blMap = new Map();
		let ips = '';

		subMap.forEach((punishment, userid) => {
			const [punishType, id, expireTime] = punishment;
			if (punishType === 'BLACKLIST') {
				if (!blMap.has(id)) blMap.set(id, [expireTime]);
				if (id !== userid) blMap.get(id).push(userid);
			}
		});

		if (user.can('ban')) {
			const subMap = Punishments.roomIps.get(room.id);

			if (subMap) {
				ips = '/ips';
				subMap.forEach((punishment, ip) => {
					const [punishType, id] = punishment;
					if (punishType === 'BLACKLIST') {
						if (!blMap.has(id)) blMap.set(id, []);
						blMap.get(id).push(ip);
					}
				});
			}
		}

		let soonExpiring = (cmd === 'expiringblacklists' || cmd === 'expiringbls');
		let buf = Chat.html`Blacklist for ${room.title}${soonExpiring ? ` (expiring within 3 months)` : ``}:<br />`;

		blMap.forEach((data, userid) => {
			const [expireTime, ...alts] = data;
			if (soonExpiring && expireTime > Date.now() + SOON_EXPIRING_TIME) return;
			const expiresIn = new Date(expireTime).getTime() - Date.now();
			const expiresDays = Math.round(expiresIn / 1000 / 60 / 60 / 24);
			buf += `- <strong>${userid}</strong>, for ${expiresDays} day${Chat.plural(expiresDays)}`;
			if (alts.length) buf += `, alts${ips}: ${alts.join(', ')}`;
			buf += `<br />`;
		});

		this.sendReplyBox(buf);
	},
	showblacklisthelp: [
		"/showblacklist OR /showbl - show a list of blacklisted users in the room. Requires: % @ # & ~",
		"/expiringblacklists OR /expiringbls - show a list of blacklisted users from the room whose blacklists are expiring in 3 months or less. Requires: % @ # & ~",
	],

	markshared: function (target, room, user) {
		if (!target) return this.parse('/help markshared');
		if (!this.can('ban')) return false;
		let [ip, note] = this.splitOne(target);
		if (!/^[0-9.*]+$/.test(ip)) return this.errorReply("Please enter a valid IP address.");

		if (Punishments.sharedIps.has(ip)) return this.errorReply("This IP is already marked as shared.");

		Punishments.addSharedIp(ip, note);
		if (note) note = ` (${note})`;
		return this.addModCommand(`The IP '${ip}' was marked as shared by ${user.name}.${note}`);
	},
	marksharedhelp: ["/markshared [ip] - Marks an IP address as shared. Requires @, &, ~"],

	unmarkshared: function (target, room, user) {
		if (!target) return this.parse('/help unmarkshared');
		if (!this.can('ban')) return false;
		if (!/^[0-9.*]+$/.test(target)) return this.errorReply("Please enter a valid IP address.");

		if (!Punishments.sharedIps.has(target)) return this.errorReply("This IP isn't marked as shared.");

		Punishments.removeSharedIp(target);
		return this.addModCommand(`The IP '${target}' was unmarked as shared by ${user.name}.`);
	},
	unmarksharedhelp: ["/unmarkshared [ip] - Unmarks a shared IP address. Requires @, &, ~"],

	/*********************************************************
	 * Server management commands
	 *********************************************************/

	hotpatch: function (target, room, user) {
		if (!target) return this.parse('/help hotpatch');
		if (!this.can('hotpatch')) return;

		const lock = Monitor.hotpatchLock;
		const hotpatches = ['chat', 'tournaments', 'formats', 'loginserver', 'punishments', 'dnsbl'];

		try {
			if (target === 'all') {
				if (lock['all']) return this.errorReply(`Hot-patching all has been disabled by ${lock['all'].by} (${lock['all'].reason})`);
				if (Config.disablehotpatchall) return this.errorReply("This server does not allow for the use of /hotpatch all");

				for (const hotpatch of hotpatches) {
					this.parse(`/hotpatch ${hotpatch}`);
				}
			} else if (target === 'chat' || target === 'commands') {
				if (lock['chat']) return this.errorReply(`Hot-patching chat has been disabled by ${lock['chat'].by} (${lock['chat'].reason})`);

				const ProcessManagers = require('./process-manager').cache;
				for (let PM of ProcessManagers.keys()) {
					if (PM.isChatBased) {
						PM.unspawn();
						ProcessManagers.delete(PM);
					}
				}

				Chat.uncacheTree('./chat');
				delete require.cache[require.resolve('./chat-commands')];
				delete require.cache[require.resolve('./chat-plugins/info')];
				global.Chat = require('./chat');

				let runningTournaments = Tournaments.tournaments;
				Chat.uncacheTree('./tournaments');
				global.Tournaments = require('./tournaments');
				Tournaments.tournaments = runningTournaments;
				this.sendReply("Chat commands have been hot-patched.");
			} else if (target === 'tournaments') {
				if (lock['tournaments']) return this.errorReply(`Hot-patching tournaments has been disabled by ${lock['tournaments'].by} (${lock['tournaments'].reason})`);

				let runningTournaments = Tournaments.tournaments;
				Chat.uncacheTree('./tournaments');
				global.Tournaments = require('./tournaments');
				Tournaments.tournaments = runningTournaments;
				this.sendReply("Tournaments have been hot-patched.");
			} else if (target === 'battles') {
				if (lock['battles']) return this.errorReply(`Hot-patching battles has been disabled by ${lock['battles'].by} (${lock['battles'].reason})`);
				if (lock['formats']) return this.errorReply(`Hot-patching formats has been disabled by ${lock['formats'].by} (${lock['formats'].reason})`);

				Rooms.SimulatorProcess.respawn();
				this.sendReply("Battles have been hot-patched. Any battles started after now will use the new code; however, in-progress battles will continue to use the old code.");
			} else if (target === 'formats') {
				if (lock['formats']) return this.errorReply(`Hot-patching formats has been disabled by ${lock['formats'].by} (${lock['formats'].reason})`);
				if (lock['battles']) return this.errorReply(`Hot-patching battles has been disabled by ${lock['battles'].by} (${lock['battles'].reason})`);
				if (lock['validator']) return this.errorReply(`Hot-patching the validator has been disabled by ${lock['validator'].by} (${lock['validator'].reason})`);

				// uncache the sim/dex.js dependency tree
				Chat.uncacheTree('./sim/dex');
				// reload sim/dex.js
				global.Dex = require('./sim/dex'); // note: this will lock up the server for a few seconds
				// rebuild the formats list
				delete Rooms.global.formatList;
				// respawn validator processes
				TeamValidator.PM.respawn();
				// respawn simulator processes
				Rooms.SimulatorProcess.respawn();
				// broadcast the new formats list to clients
				Rooms.global.send(Rooms.global.formatListText);

				this.sendReply("Formats have been hot-patched.");
			} else if (target === 'loginserver') {
				FS('config/custom.css').unwatch();
				Chat.uncacheTree('./loginserver');
				global.LoginServer = require('./loginserver');
				this.sendReply("The login server has been hot-patched. New login server requests will use the new code.");
			} else if (target === 'learnsets' || target === 'validator') {
				if (lock['validator']) return this.errorReply(`Hot-patching the validator has been disabled by ${lock['validator'].by} (${lock['validator'].reason})`);
				if (lock['formats']) return this.errorReply(`Hot-patching formats has been disabled by ${lock['formats'].by} (${lock['formats'].reason})`);

				TeamValidator.PM.respawn();
				this.sendReply("The team validator has been hot-patched. Any battles started after now will have teams be validated according to the new code.");
			} else if (target === 'punishments') {
				if (lock['punishments']) return this.errorReply(`Hot-patching punishments has been disabled by ${lock['punishments'].by} (${lock['punishments'].reason})`);

				delete require.cache[require.resolve('./punishments')];
				global.Punishments = require('./punishments');
				this.sendReply("Punishments have been hot-patched.");
			} else if (target === 'dnsbl' || target === 'datacenters') {
				Dnsbl.loadDatacenters();
				this.sendReply("Dnsbl has been hot-patched.");
			} else if (target.startsWith('disable')) {
				this.sendReply("Disabling hot-patch has been moved to its own command:");
				return this.parse('/help nohotpatch');
			} else {
				return this.errorReply("Your hot-patch command was unrecognized.");
			}
		} catch (e) {
			Rooms.global.notifyRooms(['development', 'staff', 'upperstaff'], `|c|${user.getIdentity()}|/log ${user.name} used /hotpatch ${target} - but something failed while trying to hot-patch.`);
			return this.errorReply(`Something failed while trying to hot-patch ${target}: \n${e.stack}`);
		}
		Rooms.global.notifyRooms(['development', 'staff', 'upperstaff'], `|c|${user.getIdentity()}|/log ${user.name} used /hotpatch ${target}`);
	},
	hotpatchhelp: [
		"Hot-patching the game engine allows you to update parts of Showdown without interrupting currently-running battles. Requires: ~",
		"Hot-patching has greater memory requirements than restarting.",
		"You can disable various hot-patches with /nohotpatch. For more information on this, see /help nohotpatch",
		"/hotpatch chat - reload chat-commands.js and the chat-plugins",
		"/hotpatch battles - spawn new simulator processes",
		"/hotpatch validator - spawn new team validator processes",
		"/hotpatch formats - reload the sim/dex.js tree, rebuild and rebroad the formats list, and spawn new simulator and team validator processes",
		"/hotpatch dnsbl - reloads Dnsbl datacenters",
		"/hotpatch punishments - reloads new punishments code",
		"/hotpatch tournaments - reloads new tournaments code",
		"/hotpatch all - hot-patches chat, tournaments, formats, login server, punishments, and dnsbl",
	],

	hotpatchlock: 'nohotpatch',
	nohotpatch: function (target, room, user) {
		if (!this.can('hotpatch')) return;
		if (!target) return this.parse('/help nohotpatch');

		const separator = ' ';

		const hotpatch = toId(target.substr(0, target.indexOf(separator)));
		const reason = target.substr(target.indexOf(separator), target.length).trim();
		if (!reason || !target.includes(separator)) return this.parse('/help nohotpatch');

		let lock = Monitor.hotpatchLock;
		const validDisable = ['chat', 'battles', 'formats', 'validator', 'tournaments', 'punishments', 'all'];

		if (validDisable.includes(hotpatch)) {
			if (lock[hotpatch]) return this.errorReply(`Hot-patching ${hotpatch} has already been disabled by ${lock[hotpatch].by} (${lock[hotpatch].reason})`);
			lock[hotpatch] = {
				by: user.name,
				reason: reason,
			};
			this.sendReply(`You have disabled hot-patching ${hotpatch}.`);
		} else {
			return this.errorReply("This hot-patch is not an option to disable.");
		}
		Rooms.global.notifyRooms(['development', 'staff', 'upperstaff'], `|c|${user.getIdentity()}|/log ${user.name} has disabled hot-patching ${hotpatch}.`);
	},
	nohotpatchhelp: ["/nohotpatch [chat|formats|battles|validator|tournaments|punishments|all] [reason] - Disables hotpatching the specified part of the simulator. Requires: ~"],

	savelearnsets: function (target, room, user) {
		if (!this.can('hotpatch')) return false;
		this.sendReply("saving...");
		FS('data/learnsets.js').write(`'use strict';\n\nexports.BattleLearnsets = {\n` +
			Object.entries(Dex.data.Learnsets).map(([k, v]) => (
				`\t${k}: {learnset: {\n` +
				Object.entries(v.learnset).sort(
					(a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0)
				).map(([k, v]) => (
					`\t\t${k}: ["` + v.join(`", "`) + `"],\n`
				)).join('') +
				`\t}},\n`
			)).join('') +
		`};\n`).then(() => {
			this.sendReply("learnsets.js saved.");
		});
	},

	widendatacenters: 'adddatacenters',
	adddatacenters: function (target, room, user, connection, cmd) {
		if (!this.can('hotpatch')) return false;
		// should be in the format: IP, IP, name, URL
		let widen = (cmd === 'widendatacenters');

		FS('config/datacenters.csv').readTextIfExists().then(data => {
			let datacenters = [];
			for (const row of data.split("\n")) {
				if (!row) continue;
				const rowSplit = row.split(',');
				const rowData = [
					Dnsbl.ipToNumber(rowSplit[0]),
					Dnsbl.ipToNumber(rowSplit[1]),
					Dnsbl.urlToHost(rowSplit[3]),
					row,
				];
				datacenters.push(rowData);
			}

			data = String(target).split("\n");
			let successes = 0;
			let identicals = 0;
			let widenSuccesses = 0;
			for (let row of data) {
				if (!row) continue;
				let rowSplit = row.split(',');
				let rowData = [
					Dnsbl.ipToNumber(rowSplit[0]),
					Dnsbl.ipToNumber(rowSplit[1]),
					Dnsbl.urlToHost(rowSplit[3]),
					row,
				];
				if (rowData[1] < rowData[0]) {
					this.errorReply('invalid range: ' + row);
					continue;
				}

				let iMin = 0;
				let iMax = datacenters.length;
				while (iMin < iMax) {
					let i = Math.floor((iMax + iMin) / 2);
					if (rowData[0] > datacenters[i][0]) {
						iMin = i + 1;
					} else {
						iMax = i;
					}
				}
				if (iMin < datacenters.length) {
					let next = datacenters[iMin];
					if (rowData[0] === next[0] && rowData[1] === next[1]) {
						identicals++;
						continue;
					}
					if (rowData[0] <= next[0] && rowData[1] >= next[1]) {
						if (widen === true) {
							widenSuccesses++;
							datacenters.splice(iMin, 1, rowData);
							continue;
						}
						this.errorReply('too wide: ' + row);
						this.errorReply('intersects with: ' + next[3]);
						continue;
					}
					if (rowData[1] >= next[0]) {
						this.errorReply('could not insert: ' + row);
						this.errorReply('intersects with: ' + next[3]);
						continue;
					}
				}
				if (iMin > 0) {
					let prev = datacenters[iMin - 1];
					if (rowData[0] >= prev[0] && rowData[1] <= prev[1]) {
						this.errorReply('too narrow: ' + row);
						this.errorReply('intersects with: ' + prev[3]);
						continue;
					}
					if (rowData[0] <= prev[1]) {
						this.errorReply('could not insert: ' + row);
						this.errorReply('intersects with: ' + prev[3]);
						continue;
					}
				}
				successes++;
				datacenters.splice(iMin, 0, rowData);
			}

			let output = datacenters.map(r => r[3]).join('\n') + '\n';
			FS('config/datacenters.csv').write(output);
			this.sendReply(`done: ${successes} successes, ${identicals} unchanged`);
			if (widenSuccesses) this.sendReply(`${widenSuccesses} widens`);
		});
	},

	disableladder: function (target, room, user) {
		if (!this.can('disableladder')) return false;
		if (Ladders.disabled) {
			return this.errorReply(`/disableladder - Ladder is already disabled.`);
		}

		Ladders.disabled = true;

		this.logModCommand(`The ladder was disabled by ${user.name}.`);
		Monitor.log(`The ladder was disabled by ${user.name}.`);

		const innerHTML = (
			`<b>Due to high server load, the ladder has been temporarily disabled.</b><br />` +
			`Rated games will no longer update the ladder. It will be back momentarily.`
		);

		Rooms.rooms.forEach((curRoom, id) => {
			if (curRoom.type === 'battle') curRoom.rated = false;
			if (id !== 'global') curRoom.addRaw(`<div class="broadcast-red">${innerHTML}</div>`).update();
		});
		Users.users.forEach(u => {
			if (u.connected) u.send(`|pm|~|${u.group}${u.name}|/raw <div class="broadcast-red">${innerHTML}</div>`);
		});
	},

	enableladder: function (target, room, user) {
		if (!this.can('disableladder')) return false;
		if (!Ladders.disabled) {
			return this.errorReply(`/enable - Ladder is already enabled.`);
		}
		Ladders.disabled = false;

		this.logModCommand(`The ladder was enabled by ${user.name}.`);
		Monitor.log(`The ladder was enabled by ${user.name}.`);

		const innerHTML = (
			`<b>The ladder is now back.</b><br />` +
			`Rated games will update the ladder now..`
		);

		Rooms.rooms.forEach((curRoom, id) => {
			if (id !== 'global') curRoom.addRaw(`<div class="broadcast-green">${innerHTML}</div>`).update();
		});
		Users.users.forEach(u => {
			if (u.connected) u.send(`|pm|~|${u.group}${u.name}|/raw <div class="broadcast-green">${innerHTML}</div>`);
		});
	},

	lockdown: function (target, room, user) {
		if (!this.can('lockdown')) return false;

		Rooms.global.startLockdown();

		this.logEntry(user.name + " used /lockdown");
	},
	lockdownhelp: ["/lockdown - locks down the server, which prevents new battles from starting so that the server can eventually be restarted. Requires: ~"],

	autolockdown: 'autolockdownkill',
	autolockdownkill: function (target, room, user) {
		if (!this.can('lockdown')) return false;
		if (Config.autolockdown === undefined) Config.autolockdown = true;

		if (target === 'on' || target === 'enable') {
			if (Config.autolockdown) return this.errorReply("The server is already set to automatically kill itself upon the final battle finishing.");
			Config.autolockdown = true;
			this.sendReply("The server is now set to automatically kill itself upon the final battle finishing.");
			this.logEntry(`${user.name} used /autolockdownkill on`);
		} else if (target === 'off' || target === 'disable') {
			if (!Config.autolockdown) return this.errorReply("The server is already set to not automatically kill itself upon the final battle finishing.");
			Config.autolockdown = false;
			this.sendReply("The server is now set to not automatically kill itself upon the final battle finishing.");
			this.logEntry(`${user.name} used /autolockdownkill off`);
		} else {
			return this.parse('/help autolockdownkill');
		}
	},
	autolockdownkillhelp: [
		"/autolockdownkill on - Turns on the setting to enable the server to automatically kill itself upon the final battle finishing. Requires ~",
		"/autolockdownkill off - Turns off the setting to enable the server to automatically kill itself upon the final battle finishing. Requires ~",
	],

	prelockdown: function (target, room, user) {
		if (!this.can('lockdown')) return false;
		Rooms.global.lockdown = 'pre';
		this.sendReply("Tournaments have been disabled in preparation for the server restart.");
		this.logEntry(user.name + " used /prelockdown");
	},

	slowlockdown: function (target, room, user) {
		if (!this.can('lockdown')) return false;

		Rooms.global.startLockdown(undefined, true);

		this.logEntry(user.name + " used /slowlockdown");
	},

	endlockdown: function (target, room, user) {
		if (!this.can('lockdown')) return false;

		if (!Rooms.global.lockdown) {
			return this.errorReply("We're not under lockdown right now.");
		}
		if (Rooms.global.lockdown === true) {
			Rooms.rooms.forEach((curRoom, id) => {
				if (id !== 'global') curRoom.addRaw("<div class=\"broadcast-green\"><b>The server restart was canceled.</b></div>").update();
			});
		} else {
			this.sendReply("Preparation for the server shutdown was canceled.");
		}
		Rooms.global.lockdown = false;

		this.logEntry(user.name + " used /endlockdown");
	},

	emergency: function (target, room, user) {
		if (!this.can('lockdown')) return false;

		if (Config.emergency) {
			return this.errorReply("We're already in emergency mode.");
		}
		Config.emergency = true;
		Rooms.rooms.forEach((curRoom, id) => {
			if (id !== 'global') curRoom.addRaw("<div class=\"broadcast-red\">The server has entered emergency mode. Some features might be disabled or limited.</div>").update();
		});

		this.logEntry(user.name + " used /emergency");
	},

	endemergency: function (target, room, user) {
		if (!this.can('lockdown')) return false;

		if (!Config.emergency) {
			return this.errorReply("We're not in emergency mode.");
		}
		Config.emergency = false;
		Rooms.rooms.forEach((curRoom, id) => {
			if (id !== 'global') curRoom.addRaw("<div class=\"broadcast-green\"><b>The server is no longer in emergency mode.</b></div>").update();
		});

		this.logEntry(user.name + " used /endemergency");
	},

	kill: function (target, room, user) {
		if (!this.can('lockdown')) return false;

		if (Rooms.global.lockdown !== true) {
			return this.errorReply("For safety reasons, /kill can only be used during lockdown.");
		}

		if (Chat.updateServerLock) {
			return this.errorReply("Wait for /updateserver to finish before using /kill.");
		}

		Sockets.workers.forEach(worker => worker.kill());

		if (!room.destroyLog) {
			process.exit();
			return;
		}
		room.logEntry(user.name + " used /kill");
		room.destroyLog(() => {
			process.exit();
		});

		// Just in the case the above never terminates, kill the process
		// after 10 seconds.
		setTimeout(() => {
			process.exit();
		}, 10000);
	},
	killhelp: ["/kill - kills the server. Can't be done unless the server is in lockdown state. Requires: ~"],

	loadbanlist: function (target, room, user, connection) {
		if (!this.can('hotpatch')) return false;

		connection.sendTo(room, "Loading ipbans.txt...");
		Punishments.loadBanlist().then(
			() => connection.sendTo(room, "ipbans.txt has been reloaded."),
			error => connection.sendTo(room, "Something went wrong while loading ipbans.txt: " + error)
		);
	},
	loadbanlisthelp: ["/loadbanlist - Loads the bans located at ipbans.txt. The command is executed automatically at startup. Requires: ~"],

	refreshpage: function (target, room, user) {
		if (!this.can('hotpatch')) return false;
		Rooms.global.send('|refresh|');
		this.logEntry(user.name + " used /refreshpage");
	},

	updateserver: function (target, room, user, connection) {
		if (!user.hasConsoleAccess(connection)) {
			return this.errorReply("/updateserver - Access denied.");
		}

		if (Chat.updateServerLock) {
			return this.errorReply("/updateserver - Another update is already in progress.");
		}

		Chat.updateServerLock = true;

		let logQueue = [];
		logQueue.push(user.name + " used /updateserver");

		connection.sendTo(room, "updating...");

		let exec = require('child_process').exec;
		exec(`git fetch && git rebase --autostash FETCH_HEAD`, (error, stdout, stderr) => {
			for (let s of ("" + stdout + stderr).split("\n")) {
				connection.sendTo(room, s);
				logQueue.push(s);
			}
			for (let line of logQueue) {
				room.logEntry(line);
			}
			Chat.updateServerLock = false;
		});
	},

	crashfixed: function (target, room, user) {
		if (Rooms.global.lockdown !== true) {
			return this.errorReply('/crashfixed - There is no active crash.');
		}
		if (!this.can('hotpatch')) return false;

		Rooms.global.lockdown = false;
		if (Rooms.lobby) {
			Rooms.lobby.modchat = false;
			Rooms.lobby.addRaw("<div class=\"broadcast-green\"><b>We fixed the crash without restarting the server!</b><br />You may resume talking in the lobby and starting new battles.</div>").update();
		}
		this.logEntry(user.name + " used /crashfixed");
	},
	crashfixedhelp: ["/crashfixed - Ends the active lockdown caused by a crash without the need of a restart. Requires: ~"],

	memusage: 'memoryusage',
	memoryusage: function (target) {
		if (!this.can('hotpatch')) return false;
		let memUsage = process.memoryUsage();
		let results = [memUsage.rss, memUsage.heapUsed, memUsage.heapTotal];
		let units = ["B", "KiB", "MiB", "GiB", "TiB"];
		for (let i = 0; i < results.length; i++) {
			let unitIndex = Math.floor(Math.log2(results[i]) / 10); // 2^10 base log
			results[i] = "" + (results[i] / Math.pow(2, 10 * unitIndex)).toFixed(2) + " " + units[unitIndex];
		}
		this.sendReply("||[Main process] RSS: " + results[0] + ", Heap: " + results[1] + " / " + results[2]);
	},

	bash: function (target, room, user, connection) {
		if (!user.hasConsoleAccess(connection)) {
			return this.errorReply("/bash - Access denied.");
		}
		if (!target) return this.parse('/help bash');

		connection.sendTo(room, "$ " + target);
		require('child_process').exec(target, (error, stdout, stderr) => {
			connection.sendTo(room, ("" + stdout + stderr));
		});
	},
	bashhelp: ["/bash [command] - Executes a bash command on the server. Requires: ~ console access"],

	eval: function (target, room, user, connection) {
		if (!user.hasConsoleAccess(connection)) {
			return this.errorReply("/eval - Access denied.");
		}
		if (!this.runBroadcast()) return;

		if (!this.broadcasting) this.sendReply('||>> ' + target);
		try {
			/* eslint-disable no-unused-vars */
			let battle = room.battle;
			let me = user;
			this.sendReply('||<< ' + eval(target));
			/* eslint-enable no-unused-vars */
		} catch (e) {
			this.sendReply('|| << ' + ('' + e.stack).replace(/\n *at CommandContext\.exports\.commands(\.[a-z0-9]+)*\.eval [\s\S]*/m, '').replace(/\n/g, '\n||'));
		}
	},

	evalbattle: function (target, room, user, connection) {
		if (!user.hasConsoleAccess(connection)) {
			return this.errorReply("/evalbattle - Access denied.");
		}
		if (!this.runBroadcast()) return;
		if (!room.battle) {
			return this.errorReply("/evalbattle - This isn't a battle room.");
		}

		room.battle.send('eval', target.replace(/\n/g, '\f'));
	},

	ebat: 'editbattle',
	editbattle: function (target, room, user) {
		if (!this.can('forcewin')) return false;
		if (!target) return this.parse('/help editbattle');
		if (!room.battle) {
			this.errorReply("/editbattle - This is not a battle room.");
			return false;
		}
		let cmd;
		let spaceIndex = target.indexOf(' ');
		if (spaceIndex > 0) {
			cmd = target.substr(0, spaceIndex).toLowerCase();
			target = target.substr(spaceIndex + 1);
		} else {
			cmd = target.toLowerCase();
			target = '';
		}
		if (cmd.charAt(cmd.length - 1) === ',') cmd = cmd.slice(0, -1);
		let targets = target.split(',');
		function getPlayer(input) {
			let player = room.battle.players[toId(input)];
			if (player) return player.slot;
			if (input.includes('1')) return 'p1';
			if (input.includes('2')) return 'p2';
			return 'p3';
		}
		function getPokemon(input) {
			if (/^[0-9]+$/.test(input)) {
				return '.pokemon[' + (parseInt(input) - 1) + ']';
			}
			return ".pokemon.find(p => p.speciesid==='" + toId(targets[1]) + "')";
		}
		switch (cmd) {
		case 'hp':
		case 'h':
			room.battle.send('eval', "let p=" + getPlayer(targets[0]) + getPokemon(targets[1]) + ";p.sethp(" + parseInt(targets[2]) + ");if (p.isActive)battle.add('-damage',p,p.getHealth);");
			break;
		case 'status':
		case 's':
			room.battle.send('eval', "let pl=" + getPlayer(targets[0]) + ";let p=pl" + getPokemon(targets[1]) + ";p.setStatus('" + toId(targets[2]) + "');if (!p.isActive){battle.add('','please ignore the above');battle.add('-status',pl.active[0],pl.active[0].status,'[silent]');}");
			break;
		case 'pp':
			room.battle.send('eval', "let pl=" + getPlayer(targets[0]) + ";let p=pl" + getPokemon(targets[1]) + ";p.moveset[p.moves.indexOf('" + toId(targets[2]) + "')].pp = " + parseInt(targets[3]));
			break;
		case 'boost':
		case 'b':
			room.battle.send('eval', "let p=" + getPlayer(targets[0]) + getPokemon(targets[1]) + ";battle.boost({" + toId(targets[2]) + ":" + parseInt(targets[3]) + "},p)");
			break;
		case 'volatile':
		case 'v':
			room.battle.send('eval', "let p=" + getPlayer(targets[0]) + getPokemon(targets[1]) + ";p.addVolatile('" + toId(targets[2]) + "')");
			break;
		case 'sidecondition':
		case 'sc':
			room.battle.send('eval', "let p=" + getPlayer(targets[0]) + ".addSideCondition('" + toId(targets[1]) + "')");
			break;
		case 'fieldcondition': case 'pseudoweather':
		case 'fc':
			room.battle.send('eval', "battle.addPseudoWeather('" + toId(targets[0]) + "')");
			break;
		case 'weather':
		case 'w':
			room.battle.send('eval', "battle.setWeather('" + toId(targets[0]) + "')");
			break;
		case 'terrain':
		case 't':
			room.battle.send('eval', "battle.setTerrain('" + toId(targets[0]) + "')");
			break;
		default:
			this.errorReply("Unknown editbattle command: " + cmd);
			break;
		}
	},
	editbattlehelp: ["/editbattle hp [player], [pokemon], [hp]",
		"/editbattle status [player], [pokemon], [status]",
		"/editbattle pp [player], [pokemon], [move], [pp]",
		"/editbattle boost [player], [pokemon], [stat], [amount]",
		"/editbattle volatile [player], [pokemon], [volatile]",
		"/editbattle sidecondition [player], [sidecondition]",
		"/editbattle fieldcondition [fieldcondition]",
		"/editbattle weather [weather]",
		"/editbattle terrain [terrain]",
		"Short forms: /ebat h OR s OR pp OR b OR v OR sc OR fc OR w OR t",
		"[player] must be a username or number, [pokemon] must be species name or number (not nickname), [move] must be move name"],

	/*********************************************************
	 * Battle commands
	 *********************************************************/

	forfeit: function (target, room, user) {
		if (!room.game) return this.errorReply("This room doesn't have an active game.");
		if (!room.game.forfeit) {
			return this.errorReply("This kind of game can't be forfeited.");
		}
		if (!room.game.forfeit(user)) {
			return this.errorReply("Forfeit failed.");
		}
	},

	choose: function (target, room, user) {
		if (!room.game) return this.errorReply("This room doesn't have an active game.");
		if (!room.game.choose) return this.errorReply("This game doesn't support /choose");

		room.game.choose(user, target);
	},

	mv: 'move',
	attack: 'move',
	move: function (target, room, user) {
		if (!room.game) return this.errorReply("This room doesn't have an active game.");
		if (!room.game.choose) return this.errorReply("This game doesn't support /choose");

		room.game.choose(user, 'move ' + target);
	},

	sw: 'switch',
	switch: function (target, room, user) {
		if (!room.game) return this.errorReply("This room doesn't have an active game.");
		if (!room.game.choose) return this.errorReply("This game doesn't support /choose");

		room.game.choose(user, 'switch ' + parseInt(target));
	},

	team: function (target, room, user) {
		if (!room.game) return this.errorReply("This room doesn't have an active game.");
		if (!room.game.choose) return this.errorReply("This game doesn't support /choose");

		room.game.choose(user, 'team ' + target);
	},

	undo: function (target, room, user) {
		if (!room.game) return this.errorReply("This room doesn't have an active game.");
		if (!room.game.undo) return this.errorReply("This game doesn't support /undo");

		room.game.undo(user, target);
	},

	uploadreplay: 'savereplay',
	savereplay: function (target, room, user, connection) {
		if (!room || !room.battle) return;
		// retrieve spectator log (0) if there are privacy concerns
		let logidx = room.battle.ended ? 3 : 0;
		let data = room.getLog(logidx).join("\n");
		let datahash = crypto.createHash('md5').update(data.replace(/[^(\x20-\x7F)]+/g, '')).digest('hex');
		let players = room.battle.playerNames;
		LoginServer.request('prepreplay', {
			id: room.id.substr(7),
			loghash: datahash,
			p1: players[0],
			p2: players[1],
			format: room.format,
			hidden: room.isPrivate ? '1' : '',
		}, success => {
			if (success && success.errorip) {
				connection.popup("This server's request IP " + success.errorip + " is not a registered server.");
				return;
			}
			connection.send('|queryresponse|savereplay|' + JSON.stringify({
				log: data,
				id: room.id.substr(7),
			}));
		});
	},

	addplayer: function (target, room, user) {
		if (!target) return this.parse('/help addplayer');
		if (!room.battle) return this.errorReply("You can only do this in battle rooms.");
		if (room.rated) return this.errorReply("You can only add a Player to unrated battles.");

		target = this.splitTarget(target, true);
		let targetUser = this.targetUser;
		let name = this.targetUsername;

		if (!targetUser) return this.errorReply("User " + name + " not found.");
		if (targetUser.can('joinbattle', null, room)) {
			return this.sendReply("" + name + " can already join battles as a Player.");
		}
		if (!this.can('joinbattle', null, room)) return;

		room.auth[targetUser.userid] = '\u2606';
		this.addModCommand("" + name + " was promoted to Player by " + user.name + ".");
	},
	addplayerhelp: ["/addplayer [username] - Allow the specified user to join the battle as a player."],

	joinbattle: 'joingame',
	joingame: function (target, room, user) {
		if (!room.game) return this.errorReply("This room doesn't have an active game.");
		if (!room.game.joinGame) return this.errorReply("This game doesn't support /joingame");

		room.game.joinGame(user);
	},

	leavebattle: 'leavegame',
	partbattle: 'leavegame',
	leavegame: function (target, room, user) {
		if (!room.game) return this.errorReply("This room doesn't have an active game.");
		if (!room.game.leaveGame) return this.errorReply("This game doesn't support /leavegame");

		room.game.leaveGame(user);
	},

	kickbattle: 'kickgame',
	kickgame: function (target, room, user) {
		if (!room.battle) return this.errorReply("You can only do this in battle rooms.");
		if (room.battle.tour || room.battle.rated) return this.errorReply("You can only do this in unrated non-tour battles.");

		target = this.splitTarget(target);
		let targetUser = this.targetUser;
		if (!targetUser || !targetUser.connected) {
			return this.errorReply("User " + this.targetUsername + " not found.");
		}
		if (!this.can('kick', targetUser)) return false;

		if (room.game.leaveGame(targetUser)) {
			this.addModCommand("" + targetUser.name + " was kicked from a battle by " + user.name + (target ? " (" + target + ")" : ""));
		} else {
			this.errorReply("/kickbattle - User isn't in battle.");
		}
	},
	kickbattlehelp: ["/kickbattle [username], [reason] - Kicks a user from a battle with reason. Requires: % @ * & ~"],

	kickinactive: function (target, room, user) {
		this.parse(`/timer on`);
	},

	timer: function (target, room, user) {
		target = toId(target);
		if (!room.game || !room.game.timer) {
			return this.errorReply(`You can only set the timer from inside a battle room.`);
		}
		const timer = room.game.timer;
		if (!timer.timerRequesters) {
			return this.sendReply(`This game's timer is managed by a different command.`);
		}
		if (!target) {
			if (!timer.timerRequesters.size) {
				return this.sendReply(`The game timer is OFF`);
			}
			return this.sendReply(`The game timer is ON (requested by ${[...timer.timerRequesters].join(', ')})`);
		}
		const force = user.can('timer', null, room);
		if (!force && !room.game.players[user]) {
			return this.errorReply(`Access denied`);
		}
		if (target === 'off' || target === 'false' || target === 'stop') {
			if (timer.timerRequesters.size) {
				timer.stop(force ? undefined : user);
				if (force) room.send(`|inactiveoff|Timer was turned off by staff. Please do not turn it back on until our staff say it's okay.`);
			} else {
				this.errorReply(`The timer is already off`);
			}
		} else if (target === 'on' || target === 'true') {
			timer.start(user);
		} else {
			this.errorReply(`"${target}" is not a recognized timer state.`);
		}
	},

	autotimer: 'forcetimer',
	forcetimer: function (target, room, user) {
		target = toId(target);
		if (!this.can('autotimer')) return;
		if (target === 'off' || target === 'false' || target === 'stop') {
			Config.forcetimer = false;
			this.addModCommand("Forcetimer is now OFF: The timer is now opt-in. (set by " + user.name + ")");
		} else if (target === 'on' || target === 'true' || !target) {
			Config.forcetimer = true;
			this.addModCommand("Forcetimer is now ON: All battles will be timed. (set by " + user.name + ")");
		} else {
			this.errorReply("'" + target + "' is not a recognized forcetimer setting.");
		}
	},

	forcetie: 'forcewin',
	forcewin: function (target, room, user) {
		if (!this.can('forcewin')) return false;
		if (!room.battle) {
			this.errorReply("/forcewin - This is not a battle room.");
			return false;
		}

		room.battle.endType = 'forced';
		if (!target) {
			room.battle.tie();
			this.logModCommand(user.name + " forced a tie.");
			return false;
		}
		let targetUser = Users.getExact(target);
		if (!targetUser) return this.errorReply("User '" + target + "' not found.");

		target = targetUser ? targetUser.userid : '';

		if (target) {
			room.battle.win(targetUser);
			this.logModCommand(user.name + " forced a win for " + target + ".");
		}
	},
	forcewinhelp: ["/forcetie - Forces the current match to end in a tie. Requires: & ~",
		"/forcewin [user] - Forces the current match to end in a win for a user. Requires: & ~"],

	/*********************************************************
	 * Challenging and searching commands
	 *********************************************************/

	'!search': true,
	search: function (target, room, user) {
		if (target) {
			if (Config.laddermodchat) {
				let userGroup = user.group;
				if (Config.groupsranking.indexOf(userGroup) < Config.groupsranking.indexOf(Config.laddermodchat)) {
					let groupName = Config.groups[Config.laddermodchat].name || Config.laddermodchat;
					this.popupReply("On this server, you must be of rank " + groupName + " or higher to search for a battle.");
					return false;
				}
			}
			Ladders.matchmaker.searchBattle(user, target);
		} else {
			Ladders.matchmaker.cancelSearches(user);
		}
	},

	'!cancelsearch': true,
	cancelsearch: function (target, room, user) {
		if (target) {
			Ladders.matchmaker.cancelSearch(user, target);
		} else {
			Ladders.matchmaker.cancelSearches(user);
		}
	},

	'!challenge': true,
	chall: 'challenge',
	challenge: function (target, room, user, connection) {
		target = this.splitTarget(target);
		let targetUser = this.targetUser;
		if (!targetUser || !targetUser.connected) {
			return this.popupReply("The user '" + this.targetUsername + "' was not found.");
		}
		if (user.locked && !targetUser.locked) {
			return this.popupReply("You are locked and cannot challenge unlocked users.");
		}
		if (targetUser.blockChallenges && !user.can('bypassblocks', targetUser)) {
			return this.popupReply("The user '" + this.targetUsername + "' is not accepting challenges right now.");
		}
		if (user.challengeTo) {
			return this.popupReply("You're already challenging '" + user.challengeTo.to + "'. Cancel that challenge before challenging someone else.");
		}
		if (Config.pmmodchat) {
			let userGroup = user.group;
			if (Config.groupsranking.indexOf(userGroup) < Config.groupsranking.indexOf(Config.pmmodchat)) {
				let groupName = Config.groups[Config.pmmodchat].name || Config.pmmodchat;
				this.popupReply("Because moderated chat is set, you must be of rank " + groupName + " or higher to challenge users.");
				return false;
			}
		}
		if (targetUser === user) {
			return this.popupReply("You can't battle yourself. The best you can do is open PS in Private Browsing (or another browser) and log into a different username, and battle that username.");
		}
		user.prepBattle(Dex.getFormat(target).id, 'challenge', connection).then(validTeam => {
			if (validTeam === false) return;
			user.makeChallenge(targetUser, target, validTeam);
		});
	},

	'!blockchallenges': true,
	bch: 'blockchallenges',
	blockchall: 'blockchallenges',
	blockchalls: 'blockchallenges',
	blockchallenges: function (target, room, user) {
		if (user.blockChallenges) return this.errorReply("You are already blocking challenges!");
		user.blockChallenges = true;
		this.sendReply("You are now blocking all incoming challenge requests.");
	},
	blockchallengeshelp: ["/blockchallenges - Blocks challenges so no one can challenge you. Unblock them with /unblockchallenges."],

	'!allowchallenges': true,
	unbch: 'allowchallenges',
	unblockchall: 'allowchallenges',
	unblockchalls: 'allowchallenges',
	unblockchallenges: 'allowchallenges',
	allowchallenges: function (target, room, user) {
		if (!user.blockChallenges) return this.errorReply("You are already available for challenges!");
		user.blockChallenges = false;
		this.sendReply("You are available for challenges from now on.");
	},
	allowchallengeshelp: ["/unblockchallenges - Unblocks challenges so you can be challenged again. Block them with /blockchallenges."],

	'!cancelchallenge': true,
	cchall: 'cancelChallenge',
	cancelchallenge: function (target, room, user) {
		user.cancelChallengeTo(target);
	},

	'!accept': true,
	accept: function (target, room, user, connection) {
		let userid = toId(target);
		if (!userid && this.pmTarget) userid = this.pmTarget.userid;
		let format = '';
		if (user.challengesFrom[userid]) format = user.challengesFrom[userid].format;
		if (!format) {
			this.popupReply(target + " isn't challenging you - maybe they cancelled before you could accept?");
			return false;
		}
		user.prepBattle(Dex.getFormat(format).id, 'challenge', connection).then(validTeam => {
			if (validTeam === false) return;
			user.acceptChallengeFrom(userid, validTeam);
		});
	},

	'!reject': true,
	reject: function (target, room, user) {
		let userid = toId(target);
		if (!userid && this.pmTarget) userid = this.pmTarget.userid;
		user.rejectChallengeFrom(userid);
	},

	'!useteam': true,
	saveteam: 'useteam',
	utm: 'useteam',
	useteam: function (target, room, user) {
		user.team = target;
	},

	'!vtm': true,
	vtm: function (target, room, user, connection) {
		if (Monitor.countPrepBattle(connection.ip, connection)) {
			return;
		}
		if (!target) return this.errorReply("Provide a valid format.");
		let originalFormat = Dex.getFormat(target);
		// Note: The default here of [Gen 7] Pokebank Anything Goes isn't normally hit; since the web client will send a default format
		let format = originalFormat.effectType === 'Format' ? originalFormat : Dex.getFormat('[Gen 7] Pokebank Anything Goes');
		if (format.effectType !== 'Format') return this.popupReply("Please provide a valid format.");

		TeamValidator(format.id).prepTeam(user.team).then(result => {
			let matchMessage = (originalFormat === format ? "" : "The format '" + originalFormat.name + "' was not found.");
			if (result.charAt(0) === '1') {
				connection.popup("" + (matchMessage ? matchMessage + "\n\n" : "") + "Your team is valid for " + format.name + ".");
			} else {
				connection.popup("" + (matchMessage ? matchMessage + "\n\n" : "") + "Your team was rejected for the following reasons:\n\n- " + result.slice(1).replace(/\n/g, '\n- '));
			}
		});
	},

	/*********************************************************
	 * Low-level
	 *********************************************************/

	'!crq': true,
	cmd: 'crq',
	query: 'crq',
	crq: function (target, room, user, connection) {
		// In emergency mode, clamp down on data returned from crq's
		let trustable = (!Config.emergency || (user.named && user.registered));
		let spaceIndex = target.indexOf(' ');
		let cmd = target;
		if (spaceIndex > 0) {
			cmd = target.substr(0, spaceIndex);
			target = target.substr(spaceIndex + 1);
		} else {
			target = '';
		}
		if (cmd === 'userdetails') {
			let targetUser = Users.get(target);
			if (!trustable || !targetUser) {
				connection.send('|queryresponse|userdetails|' + JSON.stringify({
					userid: toId(target),
					rooms: false,
				}));
				return false;
			}
			let roomList = {};
			targetUser.inRooms.forEach(roomid => {
				if (roomid === 'global') return;
				let targetRoom = Rooms.get(roomid);
				if (!targetRoom) return; // shouldn't happen
				let roomData = {};
				if (targetRoom.isPrivate) {
					if (!user.inRooms.has(roomid) && !user.games.has(roomid)) return;
					roomData.isPrivate = true;
				}
				if (targetRoom.battle) {
					let battle = targetRoom.battle;
					roomData.p1 = battle.p1 ? ' ' + battle.p1.name : '';
					roomData.p2 = battle.p2 ? ' ' + battle.p2.name : '';
				}
				if (targetRoom.auth && targetUser.userid in targetRoom.auth) {
					roomid = targetRoom.auth[targetUser.userid] + roomid;
				}
				roomList[roomid] = roomData;
			});
			if (!targetUser.connected) roomList = false;
			let userdetails = {
				userid: targetUser.userid,
				avatar: targetUser.avatar,
				group: targetUser.group,
				rooms: roomList,
			};
			connection.send('|queryresponse|userdetails|' + JSON.stringify(userdetails));
		} else if (cmd === 'roomlist') {
			if (!trustable) return false;
			connection.send('|queryresponse|roomlist|' + JSON.stringify({
				rooms: Rooms.global.getRoomList(target),
			}));
		} else if (cmd === 'rooms') {
			if (!trustable) return false;
			connection.send('|queryresponse|rooms|' + JSON.stringify(
				Rooms.global.getRooms(user)
			));
		} else if (cmd === 'laddertop') {
			if (!trustable) return false;
			Ladders(target).getTop().then(result => {
				connection.send('|queryresponse|laddertop|' + JSON.stringify(result));
			});
		} else {
			// default to sending null
			connection.send('|queryresponse|' + cmd + '|null');
		}
	},

	'!trn': true,
	trn: function (target, room, user, connection) {
		if (target === user.name) return false;

		let commaIndex = target.indexOf(',');
		let targetName = target;
		let targetRegistered = false;
		let targetToken = '';
		if (commaIndex >= 0) {
			targetName = target.substr(0, commaIndex);
			target = target.substr(commaIndex + 1);
			commaIndex = target.indexOf(',');
			targetRegistered = target;
			if (commaIndex >= 0) {
				targetRegistered = !!parseInt(target.substr(0, commaIndex));
				targetToken = target.substr(commaIndex + 1);
			}
		}
		user.rename(targetName, targetToken, targetRegistered, connection);
	},

	a: function (target, room, user) {
		if (!this.can('rawpacket')) return false;
		// secret sysop command
		room.add(target);
	},

	/*********************************************************
	 * Help commands
	 *********************************************************/

	'!help': true,
	commands: 'help',
	h: 'help',
	'?': 'help',
	man: 'help',
	help: function (target, room, user) {
		if (!this.runBroadcast()) return;
		target = target.toLowerCase();

		// overall
		if (target === 'help' || target === 'h' || target === '?' || target === 'commands') {
			this.sendReply("/help OR /h OR /? - Gives you help.");
		} else if (!target) {
			this.sendReply("COMMANDS: /msg, /reply, /logout, /challenge, /search, /rating, /whois");
			this.sendReply("OPTION COMMANDS: /nick, /avatar, /ignore, /away, /back, /timestamps, /highlight");
			this.sendReply("INFORMATIONAL COMMANDS: /data, /dexsearch, /movesearch, /itemsearch, /groups, /faq, /rules, /intro, /formatshelp, /othermetas, /learn, /analysis, /calc (replace / with ! to broadcast. Broadcasting requires: + % @ * # & ~)");
			if (user.group !== Config.groupsranking[0]) {
				this.sendReply("DRIVER COMMANDS: /warn, /mute, /hourmute, /unmute, /alts, /forcerename, /modlog, /modnote, /lock, /unlock, /announce, /redirect");
				this.sendReply("MODERATOR COMMANDS: /ban, /unban, /ip, /modchat");
				this.sendReply("LEADER COMMANDS: /declare, /forcetie, /forcewin, /promote, /demote, /banip, /host, /unbanall");
			}
			this.sendReply("For an overview of room commands, use /roomhelp");
			this.sendReply("For details of a specific command, use something like: /help data");
		} else {
			let altCommandHelp;
			let helpCmd;
			let targets = target.split(' ');
			let allCommands = Chat.commands;
			if (typeof allCommands[target] === 'string') {
				// If a function changes with command name, help for that command name will be searched first.
				altCommandHelp = target + 'help';
				if (altCommandHelp in allCommands) {
					helpCmd = altCommandHelp;
				} else {
					helpCmd = allCommands[target] + 'help';
				}
			} else if (targets.length > 1 && typeof allCommands[targets[0]] === 'object') {
				// Handle internal namespace commands
				let helpCmd = targets.pop() + 'help';
				let namespace = allCommands[targets.shift()];
				for (const t of targets) {
					if (!namespace[t]) return this.errorReply("Help for the command '" + target + "' was not found. Try /help for general help");
					namespace = namespace[t];
				}
				if (typeof namespace[helpCmd] === 'object') return this.sendReply(namespace[helpCmd].join('\n'));
				if (typeof namespace[helpCmd] === 'function') return this.run(namespace[helpCmd]);
				return this.errorReply("Help for the command '" + target + "' was not found. Try /help for general help");
			} else {
				helpCmd = target + 'help';
			}
			if (helpCmd in allCommands) {
				if (typeof allCommands[helpCmd] === 'function') {
					// If the help command is a function, parse it instead
					this.run(allCommands[helpCmd]);
				} else if (Array.isArray(allCommands[helpCmd])) {
					this.sendReply(allCommands[helpCmd].join('\n'));
				}
			} else {
				this.errorReply("Help for the command '" + target + "' was not found. Try /help for general help");
			}
		}
	},

};

process.nextTick(() => {
	// We might want to migrate most of this to a JSON schema of command attributes.
	Chat.multiLinePattern.register(
		'>>>? ', '/(?:room|staff)intro ', '/(?:staff)?topic ', '/(?:add|widen)datacenters ', '/bash ', '!code ', '/code '
	);
});