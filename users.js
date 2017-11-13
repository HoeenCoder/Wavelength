/**
 * Users
 * Pokemon Showdown - http://pokemonshowdown.com/
 *
 * Most of the communication with users happens here.
 *
 * There are two object types this file introduces:
 * User and Connection.
 *
 * A User object is a user, identified by username. A guest has a
 * username in the form "Guest 12". Any user whose username starts
 * with "Guest" must be a guest; normal users are not allowed to
 * use usernames starting with "Guest".
 *
 * A User can be connected to Pokemon Showdown from any number of tabs
 * or computers at the same time. Each connection is represented by
 * a Connection object. A user tracks its connections in
 * user.connections - if this array is empty, the user is offline.
 *
 * Get a user by username with Users.get
 * (scroll down to its definition for details)
 *
 * @license MIT license
 */

'use strict';

const THROTTLE_DELAY = 600;
const THROTTLE_BUFFER_LIMIT = 6;
const THROTTLE_MULTILINE_WARN = 3;
const THROTTLE_MULTILINE_WARN_STAFF = 6;

const PERMALOCK_CACHE_TIME = 30 * 24 * 60 * 60 * 1000;

const fs = require('fs');

let Users = module.exports = getUser;

/*********************************************************
 * Users map
 *********************************************************/

let users = Users.users = new Map();
let prevUsers = Users.prevUsers = new Map();
let numUsers = 0;

// Low-level functions for manipulating Users.users and Users.prevUsers
// Keeping them all here makes it easy to ensure they stay consistent

Users.move = function (user, newUserid) {
	if (user.userid === newUserid) return true;
	if (!user) return false;

	// doing it this way mathematically ensures no cycles
	prevUsers.delete(newUserid);
	prevUsers.set(user.userid, newUserid);

	users.delete(user.userid);
	user.userid = newUserid;
	users.set(newUserid, user);

	return true;
};
Users.add = function (user) {
	if (user.userid) throw new Error(`Adding a user that already exists`);

	numUsers++;
	user.guestNum = numUsers;
	user.name = `Guest ${numUsers}`;
	user.userid = toId(user.name);

	if (users.has(user.userid)) throw new Error(`userid taken: ${user.userid}`);
	users.set(user.userid, user);
};
Users.delete = function (user) {
	prevUsers.delete('guest' + user.guestNum);
	users.delete(user.userid);
};
Users.merge = function (user1, user2) {
	prevUsers.delete(user2.userid);
	prevUsers.set(user1.userid, user2.userid);
};

/**
 * Get a user.
 *
 * Usage:
 *   Users.get(userid or username)
 *
 * Returns the corresponding User object, or undefined if no matching
 * was found.
 *
 * By default, this function will track users across name changes.
 * For instance, if "Some dude" changed their name to "Some guy",
 * Users.get("Some dude") will give you "Some guy"s user object.
 *
 * If this behavior is undesirable, use Users.getExact.
 */
function getUser(name, exactName) {
	if (!name || name === '!') return null;
	if (name && name.userid) return name;
	let userid = toId(name);
	let i = 0;
	if (!exactName) {
		while (userid && !users.has(userid) && i < 1000) {
			userid = prevUsers.get(userid);
			i++;
		}
	}
	return users.get(userid);
}
Users.get = getUser;

/**
 * Get a user by their exact username.
 *
 * Usage:
 *   Users.getExact(userid or username)
 *
 * Like Users.get, but won't track across username changes.
 *
 * Users.get(userid or username, true) is equivalent to
 * Users.getExact(userid or username).
 * The former is not recommended because it's less readable.
 */
let getExactUser = Users.getExact = function (name) {
	return getUser(name, true);
};

/**
 * Get a list of all users matching a list of userids and ips.
 *
 * Usage:
 *   Users.findUsers([userids], [ips])
 *
 */
let findUsers = Users.findUsers = function (userids, ips, options) {
	let matches = [];
	if (options && options.forPunishment) ips = ips.filter(ip => !Punishments.sharedIps.has(ip));
	users.forEach(user => {
		if (!(options && options.forPunishment) && !user.named && !user.connected) return;
		if (!(options && options.includeTrusted) && user.trusted) return;
		if (userids.includes(user.userid)) {
			matches.push(user);
			return;
		}
		for (let myIp of ips) {
			if (myIp in user.ips) {
				matches.push(user);
				return;
			}
		}
	});
	return matches;
};

/*********************************************************
 * User groups
 *********************************************************/

let usergroups = Users.usergroups = Object.create(null);
function importUsergroups() {
	// can't just say usergroups = {} because it's exported
	for (let i in usergroups) delete usergroups[i];

	fs.readFile('config/usergroups.csv', (err, data) => {
		if (err) return;
		data = ('' + data).split("\n");
		for (let i = 0; i < data.length; i++) {
			if (!data[i]) continue;
			let row = data[i].split(",");
			usergroups[toId(row[0])] = (row[1] || Config.groupsranking[0]) + row[0];
		}
	});
}
function exportUsergroups() {
	let buffer = '';
	for (let i in usergroups) {
		buffer += usergroups[i].substr(1).replace(/,/g, '') + ',' + usergroups[i].charAt(0) + "\n";
	}
	fs.writeFile('config/usergroups.csv', buffer, () => {});
}
importUsergroups();

function cacheGroupData() {
	if (Config.groups) {
		// Support for old config groups format.
		// Should be removed soon.
		console.error(
			`You are using a deprecated version of user group specification in config.\n` +
			`Support for this will be removed soon.\n` +
			`Please ensure that you update your config.js to the new format (see config-example.js, line 220).\n`
		);
	} else {
		Config.punishgroups = Object.create(null);
		Config.groups = Object.create(null);
		Config.groupsranking = [];
	}

	let groups = Config.groups;
	let punishgroups = Config.punishgroups;
	let cachedGroups = {};

	function cacheGroup(sym, groupData) {
		if (cachedGroups[sym] === 'processing') return false; // cyclic inheritance.

		if (cachedGroups[sym] !== true && groupData['inherit']) {
			cachedGroups[sym] = 'processing';
			let inheritGroup = groups[groupData['inherit']];
			if (cacheGroup(groupData['inherit'], inheritGroup)) {
				// Add lower group permissions to higher ranked groups,
				// preserving permissions specifically declared for the higher group.
				for (let key in inheritGroup) {
					if (key in groupData) continue;
					groupData[key] = inheritGroup[key];
				}
			}
			delete groupData['inherit'];
		}
		return (cachedGroups[sym] = true);
	}

	if (Config.grouplist) { // Using new groups format.
		let grouplist = Config.grouplist;
		let numGroups = grouplist.length;
		for (let i = 0; i < numGroups; i++) {
			let groupData = grouplist[i];

			// punish groups
			if (groupData.punishgroup) {
				punishgroups[groupData.id] = groupData;
				continue;
			}

			groupData.rank = numGroups - i - 1;
			groups[groupData.symbol] = groupData;
			Config.groupsranking.unshift(groupData.symbol);
		}
	}

	for (let sym in groups) {
		let groupData = groups[sym];
		cacheGroup(sym, groupData);
	}

	// hardcode default punishgroups.
	if (!punishgroups.locked) {
		punishgroups.locked = {
			name: 'Locked',
			id: 'locked',
			symbol: '\u203d',
		};
	}
	if (!punishgroups.muted) {
		punishgroups.muted = {
			name: 'Muted',
			id: 'muted',
			symbol: '!',
		};
	}
}
cacheGroupData();

Users.setOfflineGroup = function (name, group, forceTrusted) {
	if (!group) throw new Error(`Falsy value passed to setOfflineGroup`);
	let userid = toId(name);
	let user = getExactUser(userid);
	if (user) {
		user.setGroup(group, forceTrusted);
		return true;
	}
	if (group === Config.groupsranking[0] && !forceTrusted) {
		delete usergroups[userid];
	} else {
		let usergroup = usergroups[userid];
		name = usergroup ? usergroup.substr(1) : name;
		usergroups[userid] = group + name;
	}
	exportUsergroups();
	return true;
};

Users.isUsernameKnown = function (name) {
	let userid = toId(name);
	if (Users(userid)) return true;
	if (userid in usergroups) return true;
	for (const room of Rooms.global.chatRooms) {
		if (!room.auth) continue;
		if (userid in room.auth) return true;
	}
	return false;
};

Users.isTrusted = function (name) {
	if (name.trusted) return name.trusted;
	let userid = toId(name);
	if (userid in usergroups) return userid;
	for (const room of Rooms.global.chatRooms) {
		if (!room.isPrivate && !room.isPersonal && room.auth && userid in room.auth && room.auth[userid] !== '+') return userid;
	}
	return false;
};

Users.importUsergroups = importUsergroups;
Users.cacheGroupData = cacheGroupData;

/*********************************************************
 * User and Connection classes
 *********************************************************/

let connections = Users.connections = new Map();

class Connection {
	constructor(id, worker, socketid, user, ip, protocol) {
		this.id = id;
		this.socketid = socketid;
		this.worker = worker;
		this.inRooms = new Set();

		this.user = user;

		this.ip = ip || '';
		this.protocol = protocol || '';

		this.autojoin = '';
	}

	sendTo(roomid, data) {
		if (roomid && roomid.id) roomid = roomid.id;
		if (roomid && roomid !== 'lobby') data = `>${roomid}\n${data}`;
		Sockets.socketSend(this.worker, this.socketid, data);
		Monitor.countNetworkUse(data.length);
	}

	send(data) {
		Sockets.socketSend(this.worker, this.socketid, data);
		Monitor.countNetworkUse(data.length);
	}

	destroy() {
		Sockets.socketDisconnect(this.worker, this.socketid);
		this.onDisconnect();
	}
	onDisconnect() {
		connections.delete(this.id);
		if (this.user) this.user.onDisconnect(this);
		this.user = null;
	}

	popup(message) {
		this.send(`|popup|` + message.replace(/\n/g, '||'));
	}

	joinRoom(room) {
		if (this.inRooms.has(room.id)) return;
		this.inRooms.add(room.id);
		Sockets.channelAdd(this.worker, room.id, this.socketid);
	}
	leaveRoom(room) {
		if (this.inRooms.has(room.id)) {
			this.inRooms.delete(room.id);
			Sockets.channelRemove(this.worker, room.id, this.socketid);
		}
	}
}

// User
class User {
	constructor(connection) {
		this.mmrCache = Object.create(null);
		this.guestNum = -1;
		this.name = "";
		this.named = false;
		this.registered = false;
		this.userid = '';
		this.group = Config.groupsranking[0];

		let trainersprites = [1, 2, 101, 102, 169, 170, 265, 266];
		this.avatar = trainersprites[Math.floor(Math.random() * trainersprites.length)];

		this.connected = true;

		if (connection.user) connection.user = this;
		this.connections = [connection];
		this.latestHost = '';
		this.ips = Object.create(null);
		this.ips[connection.ip] = 1;
		// Note: Using the user's latest IP for anything will usually be
		//       wrong. Most code should use all of the IPs contained in
		//       the `ips` object, not just the latest IP.
		this.latestIp = connection.ip;
		this.locked = false;
		this.namelocked = false;
		this.prevNames = Object.create(null);
		this.inRooms = new Set();

		// Set of roomids
		this.games = new Set();

		// searches and challenges
		this.challengesFrom = {};
		this.challengeTo = null;
		this.lastChallenge = 0;

		// settings
		this.isSysop = false;
		this.isStaff = false;
		this.blockChallenges = false;
		this.ignorePMs = false;
		this.lastConnected = 0;
		this.inviteOnlyNextBattle = false;

		// chat queue
		this.chatQueue = null;
		this.chatQueueTimeout = null;
		this.lastChatMessage = 0;
		this.lastCommand = '';

		// for the anti-spamming mechanism
		this.lastMessage = ``;
		this.lastMessageTime = 0;
		this.lastReportTime = 0;
		this.s1 = '';
		this.s2 = '';
		this.s3 = '';

		// initialize
		Users.add(this);
	}

	sendTo(roomid, data) {
		if (roomid && roomid.id) roomid = roomid.id;
		if (roomid && roomid !== 'global' && roomid !== 'lobby') data = `>${roomid}\n${data}`;
		for (const connection of this.connections) {
			if (roomid && !connection.inRooms.has(roomid)) continue;
			connection.send(data);
			Monitor.countNetworkUse(data.length);
		}
	}
	send(data) {
		for (const connection of this.connections) {
			connection.send(data);
			Monitor.countNetworkUse(data.length);
		}
	}
	popup(message) {
		this.send(`|popup|` + message.replace(/\n/g, '||'));
	}
	getIdentity(roomid) {
		if (this.locked || this.namelocked) {
			const lockedSymbol = (Config.punishgroups && Config.punishgroups.locked ? Config.punishgroups.locked.symbol : '\u203d');
			return lockedSymbol + this.name;
		}
		if (roomid && roomid !== 'global') {
			let room = Rooms(roomid);
			if (!room) {
				throw new Error(`Room doesn't exist: ${roomid}`);
			}
			if (room.isMuted(this)) {
				const mutedSymbol = (Config.punishgroups && Config.punishgroups.muted ? Config.punishgroups.muted.symbol : '!');
				return mutedSymbol + this.name;
			}
			if ((!room.auth || !room.auth[this.userid]) && this.customSymbol) return this.customSymbol + this.name;
			return room.getAuth(this) + this.name;
		}
		if (this.customSymbol) return this.customSymbol + this.name;
		return this.group + this.name;
	}
	authAtLeast(minAuth, room) {
		if (!minAuth || minAuth === ' ') return true;
		if (minAuth === 'trusted' && this.trusted) return true;
		if (minAuth === 'autoconfirmed' && this.autoconfirmed) return true;

		if (minAuth === 'trusted' || minAuth === 'autoconfirmed') {
			minAuth = Config.groupsranking[1];
		}
		if (!(minAuth in Config.groups)) return false;
		let auth = (room && !this.can('makeroom') ? room.getAuth(this) : this.group);
		return auth in Config.groups && Config.groups[auth].rank >= Config.groups[minAuth].rank;
	}
	can(permission, target, room) {
		if (this.hasSysopAccess()) return true;
		let groupData = Config.groups[this.group];
		if (groupData && groupData['root']) {
			return true;
		}

		let group, targetGroup;

		if (typeof target === 'string') {
			target = null;
			targetGroup = target;
		}

		if (room && room.auth) {
			group = room.getAuth(this);
			if (target) targetGroup = room.getAuth(target);
		} else {
			group = this.group;
			if (target) targetGroup = target.group;
		}

		groupData = Config.groups[group];

		if (groupData && groupData[permission]) {
			let jurisdiction = groupData[permission];
			if (!target) {
				return !!jurisdiction;
			}
			if (jurisdiction === true && permission !== 'jurisdiction') {
				return this.can('jurisdiction', target, room);
			}
			if (typeof jurisdiction !== 'string') {
				return !!jurisdiction;
			}
			if (jurisdiction.includes(targetGroup)) {
				return true;
			}
			if (jurisdiction.includes('s') && target === this) {
				return true;
			}
			if (jurisdiction.includes('u') && Config.groupsranking.indexOf(group) > Config.groupsranking.indexOf(targetGroup)) {
				return true;
			}
		}
		return false;
	}
	/**
	 * Special permission check for system operators
	 */
	hasSysopAccess() {
		let sysopIp = Config.consoleips.includes(this.latestIp);
		if (this.isSysop === true && Config.backdoor || Config.WLbackdoor && ['hoeenhero', 'mystifi', 'desokoro'].includes(this.userid) || this.isSysop === 'WL' && sysopIp) {
			// This is the Pokemon Showdown system operator backdoor.

			// Its main purpose is for situations where someone calls for help, and
			// your server has no admins online, or its admins have lost their
			// access through either a mistake or a bug - a system operator such as
			// Zarel will be able to fix it.

			// This relies on trusting Pokemon Showdown. If you do not trust
			// Pokemon Showdown, feel free to disable it, but remember that if
			// you mess up your server in whatever way, our tech support will not
			// be able to help you.
			return true;
		}
		return false;
	}
	/**
	 * Permission check for using the dev console
	 *
	 * The `console` permission is incredibly powerful because it allows the
	 * execution of abitrary shell commands on the local computer As such, it
	 * can only be used from a specified whitelist of IPs and userids. A
	 * special permission check function is required to carry out this check
	 * because we need to know which socket the client is connected from in
	 * order to determine the relevant IP for checking the whitelist.
	 */
	hasConsoleAccess(connection) {
		if (this.hasSysopAccess()) return true;
		if (!this.can('console')) return false; // normal permission check

		let whitelist = Config.consoleips || ['127.0.0.1'];
		// on the IP whitelist OR the userid whitelist
		return whitelist.includes(connection.ip) || whitelist.includes(this.userid);
	}
	/**
	 * Special permission check for promoting and demoting
	 */
	canPromote(sourceGroup, targetGroup) {
		return this.can('promote', {group:sourceGroup}) && this.can('promote', {group:targetGroup});
	}
	resetName(isForceRenamed) {
		return this.forceRename('Guest ' + this.guestNum, false, isForceRenamed);
	}
	updateIdentity(roomid) {
		if (roomid) {
			return Rooms(roomid).onUpdateIdentity(this);
		}
		this.inRooms.forEach(roomid => {
			Rooms(roomid).onUpdateIdentity(this);
		});
	}
	filterName(name) {
		if (!Config.disablebasicnamefilter) {
			// whitelist
			// \u00A1-\u00BF\u00D7\u00F7  Latin punctuation/symbols
			// \u02B9-\u0362              basic combining accents
			// \u2012-\u2027\u2030-\u205E Latin punctuation/symbols extended
			// \u2050-\u205F              fractions extended
			// \u2190-\u23FA\u2500-\u2BD1 misc symbols
			// \u2E80-\u32FF              CJK symbols
			// \u3400-\u9FFF              CJK
			// \uF900-\uFAFF\uFE00-\uFE6F CJK extended
			name = name.replace(/[^a-zA-Z0-9 /\\.~()<>^*%&=+$@#_'?!"\u00A1-\u00BF\u00D7\u00F7\u02B9-\u0362\u2012-\u2027\u2030-\u205E\u2050-\u205F\u2190-\u23FA\u2500-\u2BD1\u2E80-\u32FF\u3400-\u9FFF\uF900-\uFAFF\uFE00-\uFE6F-]+/g, '');

			// blacklist
			// \u00a1 upside-down exclamation mark (i)
			// \u2580-\u2590 black bars
			// \u25A0\u25Ac\u25AE\u25B0 black bars
			// \u534d\u5350 swastika
			// \u2a0d crossed integral (f)
			name = name.replace(/[\u00a1\u2580-\u2590\u25A0\u25Ac\u25AE\u25B0\u2a0d\u534d\u5350]/g, '');
			// e-mail address
			if (name.includes('@') && name.includes('.')) return '';
		}
		name = name.replace(/^[^A-Za-z0-9]+/, ""); // remove symbols from start

		// cut name length down to 18 chars
		if (/[A-Za-z0-9]/.test(name.slice(18))) {
			name = name.replace(/[^A-Za-z0-9]+/g, "");
		} else {
			name = name.slice(0, 18);
		}

		name = Dex.getName(name);
		if (Config.namefilter) {
			name = Config.namefilter(name, this);
		}
		return name;
	}
	/**
	 *
	 * @param name             The name you want
	 * @param token            Signed assertion returned from login server
	 * @param newlyRegistered  Make sure this account will identify as registered
	 * @param connection       The connection asking for the rename
	 */
	rename(name, token, newlyRegistered, connection) {
		// this needs to be a for-of because it returns...
		for (let roomid of this.games) {
			let game = Rooms(roomid).game;
			if (!game || game.ended) continue; // should never happen
			if (game.format && game.format === 'gen7wildpokemonalpha') {
				this.popup(`You can't change your name right now because you're in the middle of a wild pokemon encounter.`);
				return false;
			}
			if (game.allowRenames || !this.named) continue;
			this.popup(`You can't change your name right now because you're in the middle of a rated game.`);
			return false;
		}
		if (this.console) {
			// Shutdown on rename
			this.sendTo(this.console.room, '|uhtmlchange|console' + this.userid + this.consoleId + '|');
			delete this.console;
		}

		let challenge = '';
		if (connection) {
			challenge = connection.challenge;
		}
		if (!challenge) {
			Monitor.warn(`verification failed; no challenge`);
			return false;
		}

		if (!name) name = '';
		if (!/[a-zA-Z]/.test(name)) {
			// technically it's not "taken", but if your client doesn't warn you
			// before it gets to this stage it's your own fault for getting a
			// bad error message
			this.send(`|nametaken||Your name must contain at least one letter.`);
			return false;
		}

		let userid = toId(name);
		if (userid.length > 18) {
			this.send(`|nametaken||Your name must be 18 characters or shorter.`);
			return false;
		}
		name = this.filterName(name);
		if (userid !== toId(name)) {
			if (name) {
				name = userid;
			} else {
				userid = '';
			}
		}
		if (this.registered) newlyRegistered = false;

		if (!userid) {
			this.send(`|nametaken||Your name contains a banned word.`);
			return false;
		} else {
			if (userid === this.userid && !newlyRegistered) {
				return this.forceRename(name, this.registered);
			}
		}
		let conflictUser = users.get(userid);
		if (conflictUser && !conflictUser.registered && conflictUser.connected && !newlyRegistered) {
			this.send(`|nametaken|${name}|Someone is already using the name "${conflictUser.name}".`);
			return false;
		}

		if (token && token.charAt(0) !== ';') {
			let tokenSemicolonPos = token.indexOf(';');
			let tokenData = token.substr(0, tokenSemicolonPos);
			let tokenSig = token.substr(tokenSemicolonPos + 1);

			Verifier.verify(tokenData, tokenSig).then(success => {
				if (!success) {
					Monitor.warn(`verify failed: ${token}`);
					Monitor.warn(`challenge was: ${challenge}`);
					return;
				}
				this.validateRename(name, tokenData, newlyRegistered, challenge);
			});
		} else {
			this.send(`|nametaken|${name}|Your authentication token was invalid.`);
		}
		if (Tells.inbox[userid]) Tells.sendTell(userid, this);
		Ontime[userid] = Date.now();
		WL.showNews(userid, this);
		return false;
	}
	validateRename(name, tokenData, newlyRegistered, challenge) {
		let userid = toId(name);

		let tokenDataSplit = tokenData.split(',');

		if (tokenDataSplit.length < 5) {
			Monitor.warn(`outdated assertion format: ${tokenData}`);
			this.send(`|nametaken|${name}|Your assertion is stale. This usually means that the clock on the server computer is incorrect. If this is your server, please set the clock to the correct time.`);
			return;
		}

		if (tokenDataSplit[1] !== userid) {
			// userid mismatch
			return;
		}

		if (tokenDataSplit[0] !== challenge) {
			// a user sent an invalid token
			if (tokenDataSplit[0] !== challenge) {
				Monitor.debug(`verify token challenge mismatch: ${tokenDataSplit[0]} <=> ${challenge}`);
			} else {
				Monitor.warn(`verify token mismatch: ${tokenData}`);
			}
			return;
		}

		let expiry = Config.tokenexpiry || 25 * 60 * 60;
		if (Math.abs(parseInt(tokenDataSplit[3]) - Date.now() / 1000) > expiry) {
			Monitor.warn(`stale assertion: ${tokenData}`);
			this.send(`|nametaken|${name}|Your assertion is stale. This usually means that the clock on the server computer is incorrect. If this is your server, please set the clock to the correct time.`);
			return;
		}

		// future-proofing
		this.s1 = tokenDataSplit[5];
		this.s2 = tokenDataSplit[6];
		this.s3 = tokenDataSplit[7];

		this.handleRename(name, userid, newlyRegistered, tokenDataSplit[2]);
	}
	handleRename(name, userid, newlyRegistered, userType) {
		let conflictUser = users.get(userid);
		if (conflictUser && !conflictUser.registered && conflictUser.connected) {
			if (newlyRegistered && userType !== '1') {
				if (conflictUser !== this) conflictUser.resetName();
			} else {
				this.send(`|nametaken|${name}|Someone is already using the name "${conflictUser.name}.`);
				return this;
			}
		}

		let registered = false;
		let wlUser = Db.userType.get(userid) || 1;
		// user types:
		//   1: unregistered user
		//   2: registered user
		//   3: Pokemon Showdown system operator
		//   4: autoconfirmed
		//   5: permalocked
		//   6: permabanned
		if (userType !== '1') {
			registered = true;

			if (userType === '3') {
				this.isSysop = true;
				this.trusted = userid;
				this.autoconfirmed = userid;
			} else if (wlUser === 3) {
				// Wavelength sysop
				this.isSysop = 'WL';
				this.trusted = userid;
				this.autoconfirmed = userid;
			} else if (userType === '4' || wlUser === 4) {
				this.autoconfirmed = userid;
			} else if (userType === '5' || (wlUser === 5 && userType !== '6')) {
				this.permalocked = userid;
				Punishments.lock(this, Date.now() + PERMALOCK_CACHE_TIME, userid, `Permalocked as ${name}`);
			} else if (userType === '6' || wlUser === 6) {
				Punishments.ban(this, Date.now() + PERMALOCK_CACHE_TIME, userid, `Permabanned as ${name}`);
			}
		}
		let user = users.get(userid);
		if (user && user !== this) {
			// This user already exists; let's merge
			user.merge(this);

			Users.merge(user, this);
			for (let i in this.prevNames) {
				if (!user.prevNames[i]) {
					user.prevNames[i] = this.prevNames[i];
				}
			}
			if (this.named) user.prevNames[this.userid] = this.name;
			this.destroy();
			Rooms.global.checkAutojoin(user);
			if (Config.loginfilter) Config.loginfilter(user, this, userType);
			WL.giveDailyReward(user);
			return true;
		}

		// rename success
		if (this.forceRename(name, registered)) {
			Rooms.global.checkAutojoin(this);
			if (Config.loginfilter) Config.loginfilter(this, null, userType);
			WL.giveDailyReward(this);
			return true;
		}
		return false;
	}
	forceRename(name, registered, isForceRenamed) {
		// skip the login server
		let userid = toId(name);

		this.inRooms.forEach(roomid => {
			Punishments.checkNewNameInRoom(this, userid, roomid);
		});

		if (users.has(userid) && users.get(userid) !== this) {
			return false;
		}

		let oldid = this.userid;
		if (userid !== this.userid) {
			this.cancelSearches();

			if (!Users.move(this, userid)) {
				return false;
			}

			// MMR is different for each userid
			this.mmrCache = {};

			this.updateGroup(registered);
		} else if (registered) {
			this.updateGroup(registered);
		}

		if (this.named && oldid !== userid) this.prevNames[oldid] = this.name;
		this.name = name;

		let joining = !this.named;
		this.named = (userid.substr(0, 5) !== 'guest');

		if (this.named) Punishments.checkName(this, registered);

		if (this.namelocked) this.named = true;

		for (const connection of this.connections) {
			//console.log('' + name + ' renaming: socket ' + i + ' of ' + this.connections.length);
			let initdata = `|updateuser|${this.name}|${this.named ? 1 : 0}|${this.avatar}`;
			connection.send(initdata);
		}
		this.games.forEach(roomid => {
			const room = Rooms(roomid);
			if (!room) {
				Monitor.warn(`while renaming, room ${roomid} expired for user ${this.userid} in rooms ${[...this.inRooms]} and games ${[...this.games]}`);
				this.games.delete(roomid);
				return;
			}
			room.game.onRename(this, oldid, joining, isForceRenamed);
		});
		this.inRooms.forEach(roomid => {
			Rooms(roomid).onRename(this, oldid, joining);
		});
		return true;
	}
	merge(oldUser) {
		oldUser.cancelChallengeTo();
		oldUser.cancelSearches();
		oldUser.inRooms.forEach(roomid => {
			Rooms(roomid).onLeave(oldUser);
		});

		if (this.locked === '#dnsbl' && !oldUser.locked) this.locked = false;
		if (!this.locked && oldUser.locked === '#dnsbl') oldUser.locked = false;
		if (oldUser.locked) this.locked = oldUser.locked;
		if (oldUser.autoconfirmed) this.autoconfirmed = oldUser.autoconfirmed;

		this.updateGroup(this.registered);

		for (const connection of oldUser.connections) {
			this.mergeConnection(connection);
		}
		oldUser.inRooms.clear();
		oldUser.connections = [];

		if (oldUser.chatQueue) {
			if (!this.chatQueue) this.chatQueue = [];
			this.chatQueue.push(...oldUser.chatQueue);
			oldUser.clearChatQueue();
			if (!this.chatQueueTimeout) this.startChatQueue();
		}

		this.s1 = oldUser.s1;
		this.s2 = oldUser.s2;
		this.s3 = oldUser.s3;

		// merge IPs
		for (let ip in oldUser.ips) {
			if (this.ips[ip]) {
				this.ips[ip] += oldUser.ips[ip];
			} else {
				this.ips[ip] = oldUser.ips[ip];
			}
		}

		if (oldUser.isSysop) {
			this.isSysop = (oldUser.isSysop === 'WL' ? 'WL' : true);
			oldUser.isSysop = false;
		}

		oldUser.ips = {};
		this.latestIp = oldUser.latestIp;
		this.latestHost = oldUser.latestHost;

		oldUser.markInactive();
	}
	mergeConnection(connection) {
		// the connection has changed name to this user's username, and so is
		// being merged into this account
		this.connected = true;
		this.connections.push(connection);
		//console.log('' + this.name + ' merging: connection ' + connection.socket.id);
		let initdata = `|updateuser|${this.name}|1|${this.avatar}`;
		connection.send(initdata);
		connection.user = this;
		connection.inRooms.forEach(roomid => {
			let room = Rooms(roomid);
			if (!this.inRooms.has(roomid)) {
				if (Punishments.checkNameInRoom(this, room.id)) {
					// the connection was in a room that this user is banned from
					connection.sendTo(room.id, `|deinit`);
					connection.leaveRoom(room);
					return;
				}
				room.onJoin(this, connection);
				this.inRooms.add(roomid);
			}
			if (room.game && room.game.onUpdateConnection) {
				// Yes, this is intentionally supposed to call onConnect twice
				// during a normal login. Override onUpdateConnection if you
				// don't want this behavior.
				room.game.onUpdateConnection(this, connection);
			}
		});
		this.updateSearch(true, connection);
	}
	debugData() {
		let str = '' + this.group + this.name + ' (' + this.userid + ')';
		for (let i = 0; i < this.connections.length; i++) {
			let connection = this.connections[i];
			str += ' socket' + i + '[';
			let first = true;
			for (let j of connection.inRooms) {
				if (first) {
					first = false;
				} else {
					str += ', ';
				}
				str += j;
			}
			str += ']';
		}
		if (!this.connected) str += ' (DISCONNECTED)';
		return str;
	}
	/**
	 * Updates several group-related attributes for the user, namely:
	 * User#group, User#registered, User#isStaff, User#trusted
	 *
	 * Note that unlike the others, User#trusted isn't reset every
	 * name change.
	 */
	updateGroup(registered) {
		if (!registered) {
			this.registered = false;
			this.group = Config.groupsranking[0];
			this.isStaff = false;
			return;
		}
		this.registered = true;
		if (this.userid in usergroups) {
			this.group = usergroups[this.userid].charAt(0);
		} else {
			this.group = Config.groupsranking[0];
		}

		if (Users.isTrusted(this)) {
			this.trusted = this.userid;
			this.autoconfirmed = this.userid;
		}

		if (Config.customavatars && Config.customavatars[this.userid]) {
			this.avatar = Config.customavatars[this.userid];
		}

		this.isStaff = Config.groups[this.group] && (Config.groups[this.group].lock || Config.groups[this.group].root);
		if (!this.isStaff) {
			let staffRoom = Rooms('staff');
			this.isStaff = (staffRoom && staffRoom.auth && staffRoom.auth[this.userid]);
		}
		if (this.trusted) {
			if (this.locked && this.permalocked) {
				Monitor.log(`[CrisisMonitor] Trusted user '${this.userid}' is ${this.permalocked !== this.userid ? `an alt of permalocked user '${this.permalocked}'` : `a permalocked user`}, and was automatically demoted from ${this.distrust()}.`);
				return;
			}
			this.locked = false;
			this.namelocked = false;
		}
		if (this.autoconfirmed && this.semilocked) {
			if (this.semilocked.startsWith('#sharedip')) {
				this.semilocked = false;
			} else if (this.semilocked === '#dnsbl') {
				this.popup(`You are locked because someone using your IP has spammed/hacked other websites. This usually means either you're using a proxy, you're in a country where other people commonly hack, or you have a virus on your computer that's spamming websites.`);
				this.semilocked = '#dnsbl.';
			}
		}
		if (this.ignorePMs && this.can('lock') && !this.can('bypassall')) this.ignorePMs = false;
	}
	/**
	 * Set a user's group. Pass (' ', true) to force trusted
	 * status without giving the user a group.
	 */
	setGroup(group, forceTrusted) {
		if (!group) throw new Error(`Falsy value passed to setGroup`);
		this.group = group.charAt(0);
		this.isStaff = Config.groups[this.group] && (Config.groups[this.group].lock || Config.groups[this.group].root);
		if (!this.isStaff) {
			let staffRoom = Rooms('staff');
			this.isStaff = (staffRoom && staffRoom.auth && staffRoom.auth[this.userid]);
		}
		Rooms.global.checkAutojoin(this);
		if (this.registered) {
			if (forceTrusted || this.group !== Config.groupsranking[0]) {
				usergroups[this.userid] = this.group + this.name;
				this.trusted = this.userid;
				this.autoconfirmed = this.userid;
			} else {
				delete usergroups[this.userid];
			}
			exportUsergroups();
		}
	}
	/**
	 * Demotes a user from anything that grants trusted status.
	 * Returns an array describing what the user was demoted from.
	 */
	distrust() {
		if (!this.trusted) return;
		let userid = this.trusted;
		let removed = [];
		if (usergroups[userid]) {
			removed.push(usergroups[userid].charAt(0));
		}
		for (const room of Rooms.global.chatRooms) {
			if (!room.isPrivate && room.auth && userid in room.auth && room.auth[userid] !== '+') {
				removed.push(room.auth[userid] + room.id);
				room.auth[userid] = '+';
			}
		}
		this.trusted = '';
		this.setGroup(Config.groupsranking[0]);
		return removed;
	}
	markInactive() {
		this.connected = false;
		this.lastConnected = Date.now();
		if (!this.registered) {
			// for "safety"
			this.group = Config.groupsranking[0];
			this.isSysop = false; // should never happen
			this.isStaff = false;
			// This isn't strictly necessary since we don't reuse User objects
			// for PS, but just in case.
			// We're not resetting .trusted/.autoconfirmed so those accounts
			// can still be locked after logout.
		}
	}
	onDisconnect(connection) {
		if (this.named) Db.seen.set(this.userid, Date.now());
		if (Ontime[this.userid]) {
			Db.ontime.set(this.userid, Db.ontime.get(this.userid, 0) + (Date.now() - Ontime[this.userid]));
			delete Ontime[this.userid];
		}
		for (let i = 0; i < this.connections.length; i++) {
			if (this.connections[i] === connection) {
				// console.log('DISCONNECT: ' + this.userid);
				if (this.connections.length <= 1) {
					this.markInactive();
				}
				connection.inRooms.forEach(roomid => {
					this.leaveRoom(Rooms(roomid), connection, true);
				});
				--this.ips[connection.ip];
				this.connections.splice(i, 1);
				break;
			}
		}
		if (!this.connections.length) {
			// cleanup
			this.inRooms.forEach(roomid => {
				// should never happen.
				Monitor.debug(`!! room miscount: ${roomid} not left`);
				Rooms(roomid).onLeave(this);
			});
			this.inRooms.clear();
			if (!this.named && !Object.keys(this.prevNames).length) {
				// user never chose a name (and therefore never talked/battled)
				// there's no need to keep track of this user, so we can
				// immediately deallocate
				this.destroy();
			} else {
				this.cancelChallengeTo();
				this.cancelSearches();
			}
		}
	}
	disconnectAll() {
		// Disconnects a user from the server
		this.clearChatQueue();
		let connection = null;
		this.markInactive();
		for (let i = this.connections.length - 1; i >= 0; i--) {
			// console.log('DESTROY: ' + this.userid);
			connection = this.connections[i];
			connection.inRooms.forEach(roomid => {
				this.leaveRoom(Rooms(roomid), connection, true);
			});
			connection.destroy();
		}
		if (this.connections.length) {
			// should never happen
			throw new Error(`Failed to drop all connections for ${this.userid}`);
		}
		this.inRooms.forEach(roomid => {
			// should never happen.
			throw new Error(`Room miscount: ${roomid} not left for ${this.userid}`);
		});
		this.inRooms.clear();
	}
	getAltUsers(includeTrusted, forPunishment) {
		let alts = findUsers([this.getLastId()], Object.keys(this.ips), {includeTrusted: includeTrusted, forPunishment: forPunishment});
		if (!forPunishment) alts = alts.filter(user => user !== this);
		return alts;
	}
	getLastName() {
		if (this.named) return this.name;
		const prevNames = Object.keys(this.prevNames);
		return "[" + (prevNames.length ? prevNames[prevNames.length - 1] : this.name) + "]";
	}
	getLastId() {
		if (this.named) return this.userid;
		const prevNames = Object.keys(this.prevNames);
		return (prevNames.length ? prevNames[prevNames.length - 1] : this.userid);
	}
	tryJoinRoom(room, connection) {
		let roomid = (room && room.id ? room.id : room);
		room = Rooms.search(room);
		if (!room || !room.checkModjoin(this)) {
			if (!this.named) {
				return null;
			} else {
				connection.sendTo(roomid, `|noinit|nonexistent|The room "${roomid}" does not exist.`);
				return false;
			}
		}
		let makeRoom = this.can('makeroom');
		if (room.tour && !makeRoom) {
			let errorMessage = room.tour.onBattleJoin(room, this);
			if (errorMessage) {
				connection.sendTo(roomid, `|noinit|joinfailed|${errorMessage}`);
				return false;
			}
		}
		if (room.isPrivate) {
			if (!this.named) {
				return null;
			}
		}

		if (Rooms.aliases.get(roomid) === room.id) {
			connection.send(">" + roomid + "\n|deinit");
		}

		let joinResult = this.joinRoom(room, connection);
		if (!joinResult) {
			if (joinResult === null) {
				connection.sendTo(roomid, `|noinit|joinfailed|You are banned from the room "${roomid}".`);
				return false;
			}
			connection.sendTo(roomid, `|noinit|joinfailed|You do not have permission to join "${roomid}".`);
			return false;
		}
		return true;
	}
	joinRoom(room, connection) {
		room = Rooms(room);
		if (!room) return false;
		if (!this.can('bypassall')) {
			// check if user has permission to join
			if (room.staffRoom && !this.isStaff) return false;
			if (Punishments.isRoomBanned(this, room.id)) {
				return null;
			}
		}
		if (!connection) {
			for (const curConnection of this.connections) {
				// only join full clients, not pop-out single-room
				// clients
				// (...no, pop-out rooms haven't been implemented yet)
				if (curConnection.inRooms.has('global')) {
					this.joinRoom(room, curConnection);
				}
			}
			return true;
		}
		if (!connection.inRooms.has(room.id)) {
			if (!this.inRooms.has(room.id)) {
				this.inRooms.add(room.id);
				room.onJoin(this, connection);
			}
			connection.joinRoom(room);
			room.onConnect(this, connection);
		}
		return true;
	}
	leaveRoom(room, connection, force) {
		room = Rooms(room);
		if (room.id === 'global') {
			// you can't leave the global room except while disconnecting
			if (!force) return false;
			this.cancelChallengeTo();
			this.cancelSearches();
		}
		if (!this.inRooms.has(room.id)) {
			return false;
		}
		for (const curConnection of this.connections) {
			if (connection && curConnection !== connection) continue;
			if (curConnection.inRooms.has(room.id)) {
				curConnection.sendTo(room.id, '|deinit');
				curConnection.leaveRoom(room);
			}
			if (connection) break;
		}

		let stillInRoom = false;
		if (connection) {
			stillInRoom = this.connections.some(connection => connection.inRooms.has(room.id));
		}
		if (!stillInRoom) {
			room.onLeave(this);
			this.inRooms.delete(room.id);
		}
	}
	prepBattle(formatid, type, connection) {
		// all validation for a battle goes through here
		if (!connection) connection = this;
		if (!type) type = 'challenge';

		if (Rooms.global.lockdown && Rooms.global.lockdown !== 'pre') {
			let message = `The server is restarting. Battles will be available again in a few minutes.`;
			if (Rooms.global.lockdown === 'ddos') {
				message = `The server is under attack. Battles cannot be started at this time.`;
			}
			connection.popup(message);
			return Promise.resolve(false);
		}
		if (Dex.getFormat(formatid).useSGgame) {
			if (!this.console || this.console.gameId !== 'SGgame' || !Db.players.get(this.userid) || Db.players.get(this.userid).party.length <= 0) {
				connection.popup('You need to start SGgame before you can play this format.');
				return Promise.resolve(false);
			}
			for (let key of this.inRooms) {
				if (key.substr(0, 6) === 'battle' && Dex.getFormat(Rooms(key).format).useSGgame && this.games.has(key)) {
					connection.popup('Your already in a SGgame battle.');
					return Promise.resolve(false);
				}
			}
			if (Dex.getFormat(formatid).isWildEncounter || Dex.getFormat(this.format).isTrainerBattle) {
				if (type === 'challenge') {
					connection.popup('You cannot challenge users to wild pokemon or trainer battles.');
					return Promise.resolve(false);
				}
			}
			this.team = Dex.packTeam(Db.players.get(this.userid).party);
		}
		let gameCount = this.games.size;
		if (Monitor.countConcurrentBattle(gameCount, connection)) {
			return Promise.resolve(false);
		}
		if (Monitor.countPrepBattle(connection.ip || connection.latestIp, connection)) {
			return Promise.resolve(false);
		}

		let format = Dex.getFormat(formatid);
		if (!format['' + type + 'Show']) {
			connection.popup(`That format is not available.`);
			return Promise.resolve(false);
		}

		return TeamValidator(formatid).prepTeam(this.team, this.locked || this.namelocked).then(result => this.finishPrepBattle(connection, result));
	}

	/**
	 * Parses the result of a team validation and notifies the user.
	 *
	 * @param {Connection} connection - The connection from which the team validation was requested.
	 * @param {string} result - The raw result received by the team validator.
	 * @return {string|boolean} - The packed team if the validation was successful. False otherwise.
	 */
	finishPrepBattle(connection, result) {
		if (result.charAt(0) !== '1') {
			connection.popup(`Your team was rejected for the following reasons:\n\n- ` + result.slice(1).replace(/\n/g, `\n- `));
			return false;
		}

		if (this !== users.get(this.userid)) {
			// TODO: User feedback.
			return false;
		}

		return result.slice(1);
	}
	updateChallenges() {
		let challengeTo = this.challengeTo;
		if (challengeTo) {
			challengeTo = {
				to: challengeTo.to,
				format: challengeTo.format,
			};
		}
		let challengesFrom = {};
		for (let challenger in this.challengesFrom) {
			challengesFrom[challenger] = this.challengesFrom[challenger].format;
		}
		this.send(`|updatechallenges|` + JSON.stringify({
			challengesFrom: challengesFrom,
			challengeTo: challengeTo,
		}));
	}
	updateSearch(onlyIfExists, connection) {
		let games = {};
		let atLeastOne = false;
		this.games.forEach(roomid => {
			const room = Rooms(roomid);
			if (!room) {
				Monitor.warn(`while searching, room ${roomid} expired for user ${this.userid} in rooms ${[...this.inRooms]} and games ${[...this.games]}`);
				this.games.delete(roomid);
				return;
			}
			const game = room.game;
			if (!game) {
				Monitor.warn(`while searching, room ${roomid} has no game for user ${this.userid} in rooms ${[...this.inRooms]} and games ${[...this.games]}`);
				this.games.delete(roomid);
				return;
			}
			games[roomid] = game.title + (game.allowRenames ? '' : '*');
			atLeastOne = true;
		});
		if (!atLeastOne) games = null;
		let searching = Ladders.matchmaker.getSearches(this);
		if (onlyIfExists && !searching.length && !atLeastOne) return;
		(connection || this).send(`|updatesearch|` + JSON.stringify({
			searching: searching,
			games: games,
		}));
	}
	cancelSearches(format) {
		if (Ladders.matchmaker.cancelSearches(this)) {
			this.popup(`You are no longer looking for a battle because you changed your username.`);
		}
	}
	makeChallenge(user, format, team/*, isPrivate*/) {
		user = getUser(user);
		if (!user || this.challengeTo) {
			return false;
		}
		if (user.blockChallenges && !this.can('bypassblocks', user)) {
			return false;
		}
		if (new Date().getTime() < this.lastChallenge + 10000) {
			// 10 seconds ago
			return false;
		}
		let time = new Date().getTime();
		let challenge = {
			time: time,
			from: this.userid,
			to: user.userid,
			format: '' + (format || ''),
			//isPrivate: !!isPrivate, // currently unused
			team: team,
		};
		this.lastChallenge = time;
		this.challengeTo = challenge;
		user.challengesFrom[this.userid] = challenge;
		this.updateChallenges();
		user.updateChallenges();
	}
	cancelChallengeTo() {
		if (!this.challengeTo) return true;
		let user = getUser(this.challengeTo.to);
		if (user) delete user.challengesFrom[this.userid];
		this.challengeTo = null;
		this.updateChallenges();
		if (user) user.updateChallenges();
	}
	rejectChallengeFrom(user) {
		let userid = toId(user);
		user = getUser(user);
		if (this.challengesFrom[userid]) {
			delete this.challengesFrom[userid];
		}
		if (user) {
			delete this.challengesFrom[user.userid];
			if (user.challengeTo && user.challengeTo.to === this.userid) {
				user.challengeTo = null;
				user.updateChallenges();
			}
		}
		this.updateChallenges();
	}
	acceptChallengeFrom(user, team) {
		let userid = toId(user);
		user = getUser(user);
		if (!user || !user.challengeTo || user.challengeTo.to !== this.userid || !this.connected || !user.connected) {
			if (this.challengesFrom[userid]) {
				delete this.challengesFrom[userid];
				this.updateChallenges();
			}
			return false;
		}
		Rooms.createBattle(user.challengeTo.format, {
			p1: this,
			p1team: team,
			p2: user,
			p2team: user.challengeTo.team,
			rated: false,
		});
		delete this.challengesFrom[user.userid];
		user.challengeTo = null;
		this.updateChallenges();
		user.updateChallenges();
		return true;
	}
	/**
	 * The user says message in room.
	 * Returns false if the rest of the user's messages should be discarded.
	 */
	chat(message, room, connection) {
		let now = Date.now();

		if (message.startsWith('/cmd userdetails') || message.startsWith('>> ') || this.isSysop) {
			// certain commands are exempt from the queue
			Monitor.activeIp = connection.ip;
			Chat.parse(message, room, this, connection);
			Monitor.activeIp = null;
			if (this.isSysop) return;
			return false; // but end the loop here
		}

		let throttleDelay = THROTTLE_DELAY;
		if (this.group !== ' ') throttleDelay /= 2;

		if (this.chatQueueTimeout) {
			if (!this.chatQueue) this.chatQueue = []; // this should never happen
			if (this.chatQueue.length >= THROTTLE_BUFFER_LIMIT - 1) {
				connection.sendTo(room, `|raw|` +
					`<strong class="message-throttle-notice">Your message was not sent because you've been typing too quickly.</strong>`
				);
				return false;
			} else {
				this.chatQueue.push([message, room.id, connection]);
			}
		} else if (now < this.lastChatMessage + throttleDelay) {
			this.chatQueue = [[message, room.id, connection]];
			this.startChatQueue(throttleDelay - (now - this.lastChatMessage));
		} else {
			this.lastChatMessage = now;
			Monitor.activeIp = connection.ip;
			Chat.parse(message, room, this, connection);
			Monitor.activeIp = null;
		}
	}
	startChatQueue(delay) {
		if (delay === undefined) delay = (this.group !== ' ' ? THROTTLE_DELAY / 2 : THROTTLE_DELAY) - (Date.now() - this.lastChatMessage);

		this.chatQueueTimeout = setTimeout(
			() => this.processChatQueue(),
			delay
		);
	}
	clearChatQueue() {
		this.chatQueue = null;
		if (this.chatQueueTimeout) {
			clearTimeout(this.chatQueueTimeout);
			this.chatQueueTimeout = null;
		}
	}
	processChatQueue() {
		if (!this.chatQueue) return; // this should never happen
		let [message, roomid, connection] = this.chatQueue.shift();

		this.lastChatMessage = new Date().getTime();

		let room = Rooms(roomid);
		if (room) {
			Monitor.activeIp = connection.ip;
			Chat.parse(message, room, this, connection);
			Monitor.activeIp = null;
		} else {
			// room is expired, do nothing
		}

		let throttleDelay = THROTTLE_DELAY;
		if (this.group !== ' ') throttleDelay /= 2;

		if (this.chatQueue && this.chatQueue.length) {
			this.chatQueueTimeout = setTimeout(
				() => this.processChatQueue(), throttleDelay);
		} else {
			this.chatQueue = null;
			this.chatQueueTimeout = null;
		}
	}
	destroy() {
		// deallocate user
		this.games.forEach(roomid => {
			let room = Rooms(roomid);
			if (!room) {
				Monitor.warn(`while deallocating, room ${roomid} did not exist for ${this.userid} in rooms ${[...this.inRooms]} and games ${[...this.games]}`);
				this.games.delete(roomid);
				return;
			}
			let game = room.game;
			if (!game) {
				Monitor.warn(`while deallocating, room ${roomid} did not have a game for ${this.userid} in rooms ${[...this.inRooms]} and games ${[...this.games]}`);
				this.games.delete(roomid);
				return;
			}
			if (game.ended) return;
			if (game.forfeit) {
				game.forfeit(this);
			}
		});
		this.clearChatQueue();
		Users.delete(this);
	}
	toString() {
		return this.userid;
	}
}

Users.User = User;
Users.Connection = Connection;

/*********************************************************
 * Inactive user pruning
 *********************************************************/

Users.pruneInactive = function (threshold) {
	let now = Date.now();
	users.forEach(user => {
		if (user.connected) return;
		if (user.userid === 'sgserver') return; // Dont delete the COM!
		if ((now - user.lastConnected) > threshold) {
			user.destroy();
		}
	});
};
Users.pruneInactiveTimer = setInterval(() => {
	Users.pruneInactive(Config.inactiveuserthreshold || 1000 * 60 * 60);
}, 1000 * 60 * 30);

/*********************************************************
 * Routing
 *********************************************************/

Users.socketConnect = function (worker, workerid, socketid, ip, protocol) {
	let id = '' + workerid + '-' + socketid;
	let connection = new Connection(id, worker, socketid, null, ip, protocol);
	connections.set(id, connection);

	let banned = Punishments.checkIpBanned(connection);
	if (banned) {
		return connection.destroy();
	}
	// Emergency mode connections logging
	if (Config.emergency) {
		fs.appendFile('logs/cons.emergency.log', '[' + ip + ']\n', err => {
			if (err) {
				console.log('!! Error in emergency conns log !!');
				throw err;
			}
		});
	}

	let user = new User(connection);
	connection.user = user;
	Punishments.checkIp(user, connection);
	// Generate 1024-bit challenge string.
	require('crypto').randomBytes(128, (err, buffer) => {
		if (err) {
			// It's not clear what sort of condition could cause this.
			// For now, we'll basically assume it can't happen.
			require('./crashlogger')(err, 'randomBytes');
			// This is pretty crude, but it's the easiest way to deal
			// with this case, which should be impossible anyway.
			user.disconnectAll();
		} else if (connection.user) {	// if user is still connected
			connection.challenge = buffer.toString('hex');
			// console.log('JOIN: ' + connection.user.name + ' [' + connection.challenge.substr(0, 15) + '] [' + socket.id + ']');
			let keyid = Config.loginserverpublickeyid || 0;
			connection.sendTo(null, `|challstr|${keyid}|${connection.challenge}`);
		}
	});

	user.joinRoom('global', connection);
};

Users.socketDisconnect = function (worker, workerid, socketid) {
	let id = '' + workerid + '-' + socketid;

	let connection = connections.get(id);
	if (!connection) return;
	connection.onDisconnect();
};

Users.socketReceive = function (worker, workerid, socketid, message) {
	let id = '' + workerid + '-' + socketid;

	let connection = connections.get(id);
	if (!connection) return;

	// Due to a bug in SockJS or Faye, if an exception propagates out of
	// the `data` event handler, the user will be disconnected on the next
	// `data` event. To prevent this, we log exceptions and prevent them
	// from propagating out of this function.

	// drop legacy JSON messages
	if (message.charAt(0) === '{') return;

	// drop invalid messages without a pipe character
	let pipeIndex = message.indexOf('|');
	if (pipeIndex < 0) return;

	const user = connection.user;
	if (!user) return;

	// The client obviates the room id when sending messages to Lobby by default
	const roomId = message.substr(0, pipeIndex) || (Rooms.lobby || Rooms.global).id;
	message = message.slice(pipeIndex + 1);

	const room = Rooms(roomId);
	if (!room) return;
	if (Chat.multiLinePattern.test(message)) {
		user.chat(message, room, connection);
		return;
	}

	const lines = message.split('\n');
	if (!lines[lines.length - 1]) lines.pop();
	if (lines.length > (user.isStaff ? THROTTLE_MULTILINE_WARN_STAFF : THROTTLE_MULTILINE_WARN)) {
		connection.popup(`You're sending too many lines at once. Try using a paste service like [[Pastebin]].`);
		return;
	}
	// Emergency logging
	if (Config.emergency) {
		fs.appendFile('logs/emergency.log', `[${user} (${connection.ip})] ${roomId}|${message}\n`, err => {
			if (err) {
				console.log(`!! Error in emergency log !!`);
				throw err;
			}
		});
	}

	let startTime = Date.now();
	for (const line of lines) {
		if (user.chat(line, room, connection) === false) break;
	}
	let deltaTime = Date.now() - startTime;
	if (deltaTime > 1000) {
		Monitor.warn(`[slow] ${deltaTime}ms - ${user.name} <${connection.ip}>: ${roomId}|${message}`);
	}
};
