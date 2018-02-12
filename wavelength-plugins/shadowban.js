'use strict';

const ROOM_NAME = "YouBanistan";
let room = Rooms.get(toId(ROOM_NAME));
if (!room) {
	Rooms.global.addChatRoom(ROOM_NAME);
	room = Rooms.get(toId(ROOM_NAME));

	room.isPrivate = 'hidden';
	room.staffRoom = true;
	//room.staffAutojoin = true;
	room.addedUsers = {};

	if (room.chatRoomData) {
		room.chatRoomData.isPrivate = 'hidden';
		room.chatRoomData.staffRoom = true;
		//room.chatRoomData.staffAutojoin = true;
		room.chatRoomData.addedUsers = room.addedUsers;

		Rooms.global.writeChatRoomData();
	}
}
if (Object.keys(room.addedUsers).length > 0) {
	setImmediate(function () {
		room.add("||Loaded user list: " + Object.keys(room.addedUsers).sort().join(", "));
		room.update();
	});
}
exports.room = room;

function getAllAlts(user) {
	let targets = {};
	if (typeof user === 'string') {
		targets[toId(user)] = 1;
	} else {
		user.getAltUsers().map(u => u.getLastName()).concat(user.name).forEach(function (altName) {
			let alt = Users.get(altName);
			if (!alt.named) return;

			targets[toId(alt)] = 1;
			Object.keys(alt.prevNames).forEach(function (name) {
				targets[toId(name)] = 1;
			});
		});
	}
	return targets;
}

function intersectAndExclude(a, b) {
	let intersection = [];
	let exclusionA = [];
	let exclusionB = [];

	let ai = 0;
	let bi = 0;
	while (ai < a.length && bi < b.length) {
		let difference = a[ai].localeCompare(b[bi]);
		if (difference < 0) {
			exclusionA.push(a[ai]);
			++ai;
		} else if (difference > 0) {
			exclusionB.push(b[bi]);
			++bi;
		} else {
			intersection.push(a[ai]);
			++ai;
			++bi;
		}
	}

	Array.prototype.push.apply(exclusionA, a.slice(ai));
	Array.prototype.push.apply(exclusionB, b.slice(bi));
	return {intersection: intersection, exclusionA: exclusionA, exclusionB: exclusionB};
}

let checkBannedCache = {};
exports.checkBanned = function (user) {
	let userId = toId(user);
	if (Users(userId).isStaff || Users(userId).isSysop) return false;
	if (Users(userId).shadowbanned) return true;
	if (userId in checkBannedCache) return checkBannedCache[userId];
	//console.log("Shadow ban cache miss:", userId);

	let targets = Object.keys(getAllAlts(user)).sort();
	let bannedUsers = Object.keys(room.addedUsers).sort();

	let matches = intersectAndExclude(targets, bannedUsers);
	let isBanned = matches.intersection.length !== 0;
	for (let t = 0; t < targets.length; ++t) {
		if (isBanned) room.addedUsers[targets[t]] = 1;
		checkBannedCache[targets[t]] = isBanned;
	}
	if (!isBanned) return false;

	if (matches.exclusionA.length > 0) {
		Rooms.global.writeChatRoomData();
		room.add("||Alts of " + matches.intersection[0] + " automatically added: " + matches.exclusionA.join(", "));
	}

	return true;
};

let addUser = exports.addUser = function (user) {
	let targets = getAllAlts(user);
	for (let u in targets) {
		if (room.addedUsers[u]) {
			delete targets[u];
		} else {
			room.addedUsers[u] = 1;
		}
		checkBannedCache[u] = true;
	}
	targets = Object.keys(targets).sort();

	if (targets.length > 0) {
		Rooms.global.writeChatRoomData();
		room.add("||Added users: " + targets.join(", "));
		room.update();
	}

	return targets;
};
let removeUser = exports.removeUser = function (user) {
	let targets = getAllAlts(user);
	for (let u in targets) {
		if (!room.addedUsers[u]) {
			delete targets[u];
		} else {
			delete room.addedUsers[u];
		}
		checkBannedCache[u] = false;
	}
	targets = Object.keys(targets).sort();

	if (targets.length > 0) {
		Rooms.global.writeChatRoomData();
		room.add("||Removed users: " + targets.join(", "));
		room.update();
	}

	return targets;
};

exports.addMessage = function (user, tag, message) {
	room.add('|c|' + user.getIdentity() + '|__(' + tag + ')__ ' + message);
	room.update();
};

exports.commands = {
	spam: 'shadowban',
	sban: 'shadowban',
	shadowban: function (target, room, user) {
		if (!target) return this.parse('/help shadowban');

		target = this.splitTarget(target).split(',');

		if (!this.targetUser) return this.sendReply("User '" + this.targetUsername + "' not found.");
		if (!this.can('lock', this.targetUser)) return;

		if (this.targetUser.shadowbanned) return this.errorReply(`${this.targetUser.name} is already shadow banned.`);
		this.targetUser.shadowbanned = true;
		this.modlog(`SHADOWBAN`, this.targetUser, target);
		this.privateModAction("(" + user.name + " has shadow banned: " + this.targetUser.name + (toId(target) ? " (" + target + ")" : "") + ")");
	},
	shadowbanhelp: ["/shadowban [username], (reason) - Sends all the user's messages to the shadow ban room. Requires %, @, &, ~"],

	unspam: 'unshadowban',
	unsban: 'unshadowban',
	unshadowban: function (target, room, user) {
		if (!target) return this.parse('/help unshadowban');
		this.splitTarget(target);

		if (!this.can('lock')) return;
		if (!this.targetUser) return this.errorReply(`The user "${this.targetUsername}" was not found.`);
		if (!this.targetUser.shadowbanned) return this.errorReply(`${this.targetUser.name} is not shadow banned.`);

		this.targetUser.shadowbanned = false;
		this.modlog(`UNSHADOWBAN`, this.targetUser);
		this.privateModAction("(" + user.name + " has shadow unbanned: " + this.targetUser.name + ")");
	},
	unshadowbanhelp: ['/unshadowban [user] - Undoes a shadowban. Requires %, @, &, ~'],

	permasban: 'permashadowban',
	permashadowban: function (target, room, user) {
		if (!target) return this.parse('/help permashadowban');

		target = this.splitTarget(target).split(',');

		if (!this.targetUser) return this.sendReply("User '" + this.targetUsername + "' not found.");
		if (!this.can('perma', this.targetUser)) return;

		let targets = addUser(this.targetUser);
		if (targets.length === 0) {
			return this.sendReply('||' + this.targetUsername + " is already shadow banned or isn't named.");
		}
		this.modlog(`PERMASHADOWBAN`, this.targetUser, `Additonal accounts: ${targets.join(`, `)}`);
		this.privateModAction("(" + user.name + " has permanently shadow banned: " + targets.join(", ") + (toId(target) ? " (" + target + ")" : "") + ")");
	},
	permashadowbanhelp: ['/permashadowban [user] - Permanently shadow ban a user. Requires ~'],

	unpermasban: 'unpermashadowban',
	unpermashadowban: function (target, room, user) {
		if (!target) return this.parse('/help unpermashadowban');
		this.splitTarget(target);

		if (!this.can('perma')) return;

		let targets = removeUser(this.targetUser || this.targetUsername);
		if (targets.length === 0) {
			return this.sendReply('||' + this.targetUsername + " is not shadow banned.");
		}
		this.modlog(`UNPERMASHADOWBAN`, (this.targetUser || this.targetUsername), `Additional names: ${targets.join(`, `)}`);
		this.privateModAction("(" + user.name + " has shadow unbanned: " + targets.join(", ") + ")");
	},
	unpermashadowbanhelp: ['/unpermashadowban [user] - Undo a permanent shadowban. Requires ~'],

	sbanlist: 'shadowbanlist',
	shadowbanlist: function (target, room, user) {
		if (!this.can('lock')) return false;
		if (!this.canTalk()) return this.errorReply(`You cannot do this while unable to talk.`);
		let result = [];
		let data = Rooms(toId(ROOM_NAME)).chatRoomData.addedUsers;
		for (let key in data) {
			result.push(key);
		}
		Users.get(toId(user.name)).send('|popup| Here is a list of permanently shadow banned users: \n' + result.join(', '));
	},
	sbanlisthelp: ['/shadowbanlist - List all permanently shadowbanned users. Requires %, @, &, ~'],
};

Users.ShadowBan = exports;
