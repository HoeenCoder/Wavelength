'use strict';

const BRACKET_MINIMUM_UPDATE_INTERVAL = 2 * 1000;
const AUTO_DISQUALIFY_WARNING_TIMEOUT = 30 * 1000;
const AUTO_START_MINIMUM_TIMEOUT = 30 * 1000;
const MAX_REASON_LENGTH = 300;
const MAX_CUSTOM_NAME_LENGTH = 100;
const TOURBAN_DURATION = 14 * 24 * 60 * 60 * 1000;

Punishments.roomPunishmentTypes.set('TOURBAN', 'banned from tournaments');

let TournamentGenerators = Object.create(null);
let generatorFiles = {
	'roundrobin': 'generator-round-robin',
	'elimination': 'generator-elimination',
};
for (const type in generatorFiles) {
	TournamentGenerators[type] = require('./' + generatorFiles[type]);
}

exports.tournaments = {};

function usersToNames(users) {
	return users.map(user => user.name);
}

class Tournament {
	constructor(room, format, generator, playerCap, isRated) {
		if (room.tourNumber) {
			room.tourNumber++;
		} else {
			room.tourNumber = 1;
		}
		format = toId(format);

		this.id = room.id;
		this.room = room;
		this.title = Dex.getFormat(format).name + ' tournament';
		this.isTournament = true;
		this.allowRenames = false;
		this.players = Object.create(null);
		this.playerCount = 0;
		this.playerCap = parseInt(playerCap) || Config.tourdefaultplayercap || 0;

		this.format = format;
		this.originalFormat = format;
		this.teambuilderFormat = format;
		this.customRules = [];
		this.generator = generator;
		this.isRated = isRated;
		this.scouting = true;
		this.modjoin = false;
		this.forceTimer = false;
		this.autostartcap = false;
		if (Config.tourdefaultplayercap && this.playerCap > Config.tourdefaultplayercap) {
			Monitor.log(`[TourMonitor] Room ${room.id} starting a tour over default cap (${this.playerCap})`);
		}

		this.isBracketInvalidated = true;
		this.lastBracketUpdate = 0;
		this.bracketUpdateTimer = null;
		this.bracketCache = null;

		this.isTournamentStarted = false;
		this.availableMatches = null;
		this.inProgressMatches = null;

		this.isAvailableMatchesInvalidated = true;
		this.availableMatchesCache = null;

		this.pendingChallenges = null;
		this.autoDisqualifyTimeout = Infinity;
		this.autoDisqualifyTimer = null;
		this.autoStartTimeout = Infinity;
		this.autoStartTimer = null;

		this.isEnded = false;

		room.add(`|tournament|create|${this.format}|${generator.name}|${this.playerCap}`);
		const update = {
			format: this.format,
			generator: generator.name,
			playerCap: this.playerCap,
			isStarted: false,
			isJoined: false,
		};
		room.send(`|tournament|update|${JSON.stringify(update)}`);
		this.update();
	}
	destroy() {
		this.forceEnd();
	}

	setGenerator(generator, output) {
		if (this.isTournamentStarted) {
			output.sendReply('|tournament|error|BracketFrozen');
			return;
		}

		let isErrored = false;
		for (const user of this.generator.getUsers()) {
			let error = generator.addUser(user);
			if (typeof error === 'string') {
				output.sendReply(`|tournament|error|${error}`);
				isErrored = true;
			}
		}

		if (isErrored) return;

		this.generator = generator;
		this.room.send(`|tournament|update|${JSON.stringify({generator: generator.name})}`);
		this.isBracketInvalidated = true;
		this.update();
		return true;
	}

	setCustomRules(rules, output) {
		try {
			this.teambuilderFormat = Dex.validateFormat(`${this.originalFormat}@@@${rules}`);
		} catch (e) {
			output.errorReply(`Custom rule error: ${e.message}`);
			return false;
		}
		this.customRules = Dex.getFormat(this.teambuilderFormat, true).customRules;
		return true;
	}

	getCustomRules() {
		const bans = [];
		const unbans = [];
		const addedRules = [];
		const removedRules = [];
		for (const ban of this.customRules) {
			let charAt0 = ban.charAt(0);
			if (charAt0 === '+') {
				unbans.push(ban.substr(1));
			} else if (charAt0 === '-') {
				bans.push(ban.substr(1));
			} else if (charAt0 === '!') {
				removedRules.push(ban.substr(1));
			} else {
				addedRules.push(ban);
			}
		}
		const html = [];
		if (bans.length) html.push(`<b>Bans</b> - ${Chat.escapeHTML(bans.join(', '))}`);
		if (unbans.length) html.push(`<b>Unbans</b> - ${Chat.escapeHTML(unbans.join(', '))}`);
		if (addedRules.length) html.push(`<b>Added rules</b> - ${Chat.escapeHTML(addedRules.join(', '))}`);
		if (removedRules.length) html.push(`<b>Removed rules</b> - ${Chat.escapeHTML(removedRules.join(', '))}`);
		return html.join(`<br />`);
	}

	forceEnd() {
		if (this.isTournamentStarted) {
			if (this.autoDisqualifyTimer) clearTimeout(this.autoDisqualifyTimer);
			for (const match of this.inProgressMatches.values()) {
				if (match) {
					match.room.tour = null;
					match.room.parent = null;
					match.room.addRaw(`<div class="broadcast-red"><b>The tournament was forcefully ended.</b><br />You can finish playing, but this battle is no longer considered a tournament battle.</div>`);
				}
			}
		} else if (this.autoStartTimer) {
			clearTimeout(this.autoStartTimer);
		}
		for (const i in this.players) {
			this.players[i].destroy();
		}
		this.room.add('|tournament|forceend');
		this.isEnded = true;
	}

	updateFor(targetUser, connection) {
		if (!connection) connection = targetUser;
		if (this.isEnded) return;
		if ((!this.bracketUpdateTimer && this.isBracketInvalidated) || (this.isTournamentStarted && this.isAvailableMatchesInvalidated)) {
			this.room.add(
				"Error: update() called with a target user when data invalidated: " +
				(!this.bracketUpdateTimer && this.isBracketInvalidated) + ", " +
				(this.isTournamentStarted && this.isAvailableMatchesInvalidated) +
				"; Please report this to an admin."
			);
			return;
		}
		const isJoined = targetUser.userid in this.players;
		const update = {
			format: this.format,
			generator: this.generator.name,
			isStarted: this.isTournamentStarted,
			isJoined: isJoined,
			bracketData: this.bracketCache,
		};
		if (this.format !== this.originalFormat) update.teambuilderFormat = this.originalFormat;
		connection.sendTo(this.room, `|tournament|update|${JSON.stringify(update)}`);
		if (this.isTournamentStarted && isJoined) {
			const update2 = {
				challenges: usersToNames(this.availableMatchesCache.challenges.get(this.players[targetUser.userid])),
				challengeBys: usersToNames(this.availableMatchesCache.challengeBys.get(this.players[targetUser.userid])),
			};
			connection.sendTo(this.room, `|tournament|update|${JSON.stringify(update2)}`);

			const pendingChallenge = this.pendingChallenges.get(this.players[targetUser.userid]);
			if (pendingChallenge) {
				if (pendingChallenge.to) {
					connection.sendTo(this.room, `|tournament|update|${JSON.stringify({challenging: pendingChallenge.to.name})}`);
				} else if (pendingChallenge.from) {
					connection.sendTo(this.room, `|tournament|update|${JSON.stringify({challenged: pendingChallenge.from.name})}`);
				}
			}
		}
		connection.sendTo(this.room, '|tournament|updateEnd');
	}

	update(targetUser) {
		if (targetUser) throw new Error("Please use updateFor() to update the tournament for a specific user.");
		if (this.isEnded) return;
		if (this.isBracketInvalidated) {
			if (Date.now() < this.lastBracketUpdate + BRACKET_MINIMUM_UPDATE_INTERVAL) {
				if (this.bracketUpdateTimer) clearTimeout(this.bracketUpdateTimer);
				this.bracketUpdateTimer = setTimeout(() => {
					this.bracketUpdateTimer = null;
					this.update();
				}, BRACKET_MINIMUM_UPDATE_INTERVAL);
			} else {
				this.lastBracketUpdate = Date.now();

				this.bracketCache = this.getBracketData();
				this.isBracketInvalidated = false;
				this.room.send(`|tournament|update|${JSON.stringify({bracketData: this.bracketCache})}`);
			}
		}

		if (this.isTournamentStarted && this.isAvailableMatchesInvalidated) {
			this.availableMatchesCache = this.getAvailableMatches();
			this.isAvailableMatchesInvalidated = false;
			for (const [player, opponents] of this.availableMatchesCache.challenges) {
				player.sendRoom(`|tournament|update|${JSON.stringify({challenges: usersToNames(opponents)})}`);
			}
			for (const [player, opponents] of this.availableMatchesCache.challengeBys) {
				player.sendRoom(`|tournament|update|${JSON.stringify({challengeBys: usersToNames(opponents)})}`);
			}
		}
		this.room.send('|tournament|updateEnd');
	}

	checkBanned(user) {
		return Punishments.getRoomPunishType(this.room, toId(user)) === 'TOURBAN';
	}

	removeBannedUser(user) {
		if (!(user.userid in this.players)) return;
		if (this.isTournamentStarted) {
			if (!this.disqualifiedUsers.get(this.players[user.userid])) {
				this.disqualifyUser(user.userid, null, null);
			}
		} else {
			this.removeUser(user);
		}
		this.room.update();
	}

	addUser(user, isAllowAlts, output) {
		if (!user.named) {
			output.sendReply('|tournament|error|UserNotNamed');
			return;
		}

		if (user.userid in this.players) {
			output.sendReply('|tournament|error|UserAlreadyAdded');
			return;
		}

		if (this.playerCap && this.playerCount >= this.playerCap) {
			output.sendReply('|tournament|error|Full');
			return;
		}

		if (this.checkBanned(user) || Punishments.isBattleBanned(user)) {
			output.sendReply('|tournament|error|Banned');
			return;
		}

		let gameCount = user.games.size;
		if (gameCount > 4) {
			output.errorReply("Due to high load, you are limited to 4 games at the same time.");
			return;
		}

		if (!isAllowAlts) {
			for (let otherUser of this.generator.getUsers()) {
				if (!otherUser) continue;
				otherUser = Users(otherUser.userid);
				if (otherUser && otherUser.latestIp === user.latestIp) {
					output.sendReply('|tournament|error|AltUserAlreadyAdded');
					return;
				}
			}
		}

		let player = new Rooms.RoomGamePlayer(user, this);
		let error = this.generator.addUser(player);
		if (typeof error === 'string') {
			output.sendReply(`|tournament|error|${error}`);
			player.destroy();
			return;
		}

		this.players[user.userid] = player;
		this.playerCount++;
		this.room.add(`|tournament|join|${user.name}`);
		user.sendTo(this.room, '|tournament|update|{"isJoined":true}');
		this.isBracketInvalidated = true;
		this.update();
		if (this.playerCount === this.playerCap) {
			if (this.autostartcap === true) {
				this.startTournament(output);
			} else {
				this.room.add("The tournament is now full.");
			}
		}
	}
	removeUser(user, output) {
		if (!(user.userid in this.players)) {
			output.sendReply('|tournament|error|UserNotAdded');
			return;
		}

		const error = this.generator.removeUser(this.players[user.userid]);
		if (typeof error === 'string') {
			output.sendReply(`|tournament|error|${error}`);
			return;
		}
		this.players[user.userid].destroy();
		delete this.players[user.userid];
		this.playerCount--;
		this.room.add(`|tournament|leave|${user.name}`);
		user.sendTo(this.room, '|tournament|update|{"isJoined":false}');
		this.isBracketInvalidated = true;
		this.update();
	}
	replaceUser(user, replacementUser, output) {
		if (!(user.userid in this.players)) {
			output.sendReply('|tournament|error|UserNotAdded');
			return;
		}

		if (replacementUser.userid in this.players) {
			output.sendReply('|tournament|error|UserAlreadyAdded');
			return;
		}

		const player = new Rooms.RoomGamePlayer(replacementUser, this);
		this.generator.replaceUser(this.players[user.userid], player);
		this.players[user.userid].destroy();
		delete this.players[user.userid];
		this.players[replacementUser.userid] = player;

		this.room.add(`|tournament|replace|${user.name}|${replacementUser.name}`);
		user.sendTo(this.room, '|tournament|update|{"isJoined":false}');
		replacementUser.sendTo(this.room, '|tournament|update|{"isJoined":true}');
		this.isBracketInvalidated = true;
		this.update();
	}

	getBracketData() {
		let data = this.generator.getBracketData();
		if (data.type === 'tree') {
			if (!data.rootNode) {
				data.users = usersToNames(this.generator.getUsers().sort());
				return data;
			}
			let queue = [data.rootNode];
			while (queue.length > 0) {
				let node = queue.shift();

				if (node.state === 'available') {
					let pendingChallenge = this.pendingChallenges.get(node.children[0].team);
					if (pendingChallenge && node.children[1].team === pendingChallenge.to) {
						node.state = 'challenging';
					}

					let inProgressMatch = this.inProgressMatches.get(node.children[0].team);
					if (inProgressMatch && node.children[1].team === inProgressMatch.to) {
						node.state = 'inprogress';
						node.room = inProgressMatch.room.id;
					}
				}

				if (node.team) node.team = node.team.name;

				for (const child of node.children) {
					queue.push(child);
				}
			}
		} else if (data.type === 'table') {
			if (this.isTournamentStarted) {
				for (const [r, row] of data.tableContents.entries()) {
					let pendingChallenge = this.pendingChallenges.get(data.tableHeaders.rows[r]);
					let inProgressMatch = this.inProgressMatches.get(data.tableHeaders.rows[r]);
					if (pendingChallenge || inProgressMatch) {
						for (const [c, cell] of row.entries()) {
							if (!cell) continue;

							if (pendingChallenge && data.tableHeaders.cols[c] === pendingChallenge.to) {
								cell.state = 'challenging';
							}

							if (inProgressMatch && data.tableHeaders.cols[c] === inProgressMatch.to) {
								cell.state = 'inprogress';
								cell.room = inProgressMatch.room.id;
							}
						}
					}
				}
			}
			data.tableHeaders.cols = usersToNames(data.tableHeaders.cols);
			data.tableHeaders.rows = usersToNames(data.tableHeaders.rows);
		}
		return data;
	}

	startTournament(output) {
		if (this.isTournamentStarted) {
			output.sendReply('|tournament|error|AlreadyStarted');
			return false;
		}

		const users = this.generator.getUsers();
		if (users.length < 2) {
			output.sendReply('|tournament|error|NotEnoughUsers');
			return false;
		}

		if (this.generator.generateBracket) this.generator.generateBracket();
		this.generator.freezeBracket();

		this.availableMatches = new Map();
		this.inProgressMatches = new Map();
		this.pendingChallenges = new Map();
		this.disqualifiedUsers = new Map();
		this.autoDisqualifyWarnings = new Map();
		this.lastActionTimes = new Map();
		const now = Date.now();
		for (const user of users) {
			this.availableMatches.set(user, new Map());
			this.inProgressMatches.set(user, null);
			this.pendingChallenges.set(user, null);
			this.disqualifiedUsers.set(user, false);
			this.lastActionTimes.set(user, now);
		}

		this.isTournamentStarted = true;
		if (this.autoStartTimer) clearTimeout(this.autoStartTimer);
		if (this.autoDisqualifyTimeout !== Infinity) this.autoDisqualifyTimer = setTimeout(() => this.runAutoDisqualify(), this.autoDisqualifyTimeout);
		this.isBracketInvalidated = true;
		this.room.add('|tournament|start');
		this.room.send('|tournament|update|{"isStarted":true}');
		this.update();
		return true;
	}
	getAvailableMatches() {
		const matches = this.generator.getAvailableMatches();
		if (typeof matches === 'string') {
			this.room.add(`Unexpected error from getAvailableMatches(): ${matches}. Please report this to an admin.`);
			return;
		}

		const users = this.generator.getUsers();
		const challenges = new Map();
		const challengeBys = new Map();
		const oldAvailableMatches = new Map();

		for (const user of users) {
			challenges.set(user, []);
			challengeBys.set(user, []);

			let oldAvailableMatch = false;
			let availableMatches = this.availableMatches.get(user);
			if (availableMatches.size) {
				oldAvailableMatch = true;
				availableMatches.clear();
			}
			oldAvailableMatches.set(user, oldAvailableMatch);
		}

		for (const match of matches) {
			challenges.get(match[0]).push(match[1]);
			challengeBys.get(match[1]).push(match[0]);

			this.availableMatches.get(match[0]).set(match[1], true);
		}

		const now = Date.now();
		for (const [user, availableMatches] of this.availableMatches) {
			if (oldAvailableMatches.get(user)) continue;

			if (availableMatches.size) this.lastActionTimes.set(user, now);
		}

		return {
			challenges: challenges,
			challengeBys: challengeBys,
		};
	}

	disqualifyUser(userid, output, reason, isSelfDQ) {
		const user = Users.get(userid);
		let sendReply;
		if (output) {
			sendReply = msg => output.sendReply(msg);
		} else if (user) {
			sendReply = msg => user.sendTo(this.id, msg);
		} else {
			sendReply = () => {};
		}
		if (!this.isTournamentStarted) {
			sendReply('|tournament|error|NotStarted');
			return false;
		}

		if (!(userid in this.players)) {
			sendReply(`|tournament|error|UserNotAdded|${userid}`);
			return false;
		}

		const player = this.players[userid];
		if (this.disqualifiedUsers.get(player)) {
			sendReply(`|tournament|error|AlreadyDisqualified|${userid}`);
			return false;
		}

		const error = this.generator.disqualifyUser(player);
		if (error) {
			sendReply(`|tournament|error|${error}`);
			return false;
		}

		this.disqualifiedUsers.set(player, true);
		this.generator.setUserBusy(player, false);

		let challenge = this.pendingChallenges.get(player);
		if (challenge) {
			this.pendingChallenges.set(player, null);
			if (challenge.to) {
				this.generator.setUserBusy(challenge.to, false);
				this.pendingChallenges.set(challenge.to, null);
				challenge.to.sendRoom('|tournament|update|{"challenged":null}');
			} else if (challenge.from) {
				this.generator.setUserBusy(challenge.from, false);
				this.pendingChallenges.set(challenge.from, null);
				challenge.from.sendRoom('|tournament|update|{"challenging":null}');
			}
		}

		let matchFrom = this.inProgressMatches.get(player);
		if (matchFrom) {
			this.generator.setUserBusy(matchFrom.to, false);
			this.inProgressMatches.set(player, null);
			matchFrom.room.tour = null;
			matchFrom.room.parent = null;
			if (matchFrom.room.battle) matchFrom.room.battle.forfeit(player.userid);
		}

		let matchTo = null;
		for (const [playerFrom, match] of this.inProgressMatches) {
			if (match && match.to === player) matchTo = playerFrom;
		}
		if (matchTo) {
			this.generator.setUserBusy(matchTo, false);
			let matchRoom = this.inProgressMatches.get(matchTo).room;
			matchRoom.tour = null;
			matchRoom.parent = null;
			if (matchRoom.battle) matchRoom.battle.forfeit(player.userid);
			this.inProgressMatches.set(matchTo, null);
		}

		if (isSelfDQ) {
			this.room.add(`|tournament|leave|${player.name}`);
		} else {
			this.room.add(`|tournament|disqualify|${player.name}`);
		}
		if (user) {
			user.sendTo(this.room, '|tournament|update|{"isJoined":false}');
			if (reason !== null) user.popup(`|modal|You have been disqualified from the tournament in ${this.room.title + (reason ? ':\n\n' + reason : '.')}`);
		}
		this.isBracketInvalidated = true;
		this.isAvailableMatchesInvalidated = true;

		if (this.generator.isTournamentEnded()) {
			this.onTournamentEnd();
		} else {
			this.update();
		}

		return true;
	}

	setAutoStartTimeout(timeout, output) {
		if (this.isTournamentStarted) {
			output.sendReply('|tournament|error|AlreadyStarted');
			return false;
		}
		timeout = parseFloat(timeout);
		if (timeout < AUTO_START_MINIMUM_TIMEOUT || isNaN(timeout)) {
			output.sendReply('|tournament|error|InvalidAutoStartTimeout');
			return false;
		}

		if (this.autoStartTimer) clearTimeout(this.autoStartTimer);
		if (timeout === Infinity) {
			this.room.add('|tournament|autostart|off');
		} else {
			this.autoStartTimer = setTimeout(() => this.startTournament(output), timeout);
			this.room.add(`|tournament|autostart|on|${timeout}`);
		}
		this.autoStartTimeout = timeout;

		return true;
	}

	setAutoDisqualifyTimeout(timeout, output) {
		if (timeout < AUTO_DISQUALIFY_WARNING_TIMEOUT || isNaN(timeout)) {
			output.sendReply('|tournament|error|InvalidAutoDisqualifyTimeout');
			return false;
		}

		this.autoDisqualifyTimeout = parseFloat(timeout);
		if (this.autoDisqualifyTimeout === Infinity) {
			this.room.add('|tournament|autodq|off');
			if (this.autoDisqualifyTimer) clearTimeout(this.autoDisqualifyTimer);
			if (this.autoDisqualifyWarnings) this.autoDisqualifyWarnings.clear();
		} else {
			this.room.add(`|tournament|autodq|on|${this.autoDisqualifyTimeout}`);
			if (this.isTournamentStarted) this.runAutoDisqualify();
		}

		return true;
	}
	runAutoDisqualify(output) {
		if (!this.isTournamentStarted) {
			output.sendReply('|tournament|error|NotStarted');
			return false;
		}
		if (this.autoDisqualifyTimer) clearTimeout(this.autoDisqualifyTimer);
		const now = Date.now();
		for (const [player, time] of this.lastActionTimes) {
			let availableMatches = false;
			if (this.availableMatches.get(player).size) availableMatches = true;
			const pendingChallenge = this.pendingChallenges.get(player);

			if (!availableMatches && !pendingChallenge) {
				this.autoDisqualifyWarnings.delete(player);
				continue;
			}
			if (pendingChallenge && pendingChallenge.to) continue;

			if (now > time + this.autoDisqualifyTimeout && this.autoDisqualifyWarnings.has(player)) {
				let reason;
				if (pendingChallenge && pendingChallenge.from) {
					reason = "You failed to accept your opponent's challenge in time.";
				} else {
					reason = "You failed to challenge your opponent in time.";
				}
				this.disqualifyUser(player.userid, output, reason);
				this.room.update();
			} else if (now > time + this.autoDisqualifyTimeout - AUTO_DISQUALIFY_WARNING_TIMEOUT) {
				if (this.autoDisqualifyWarnings.has(player)) continue;
				let remainingTime = this.autoDisqualifyTimeout - now + time;
				if (remainingTime <= 0) {
					remainingTime = AUTO_DISQUALIFY_WARNING_TIMEOUT;
					this.lastActionTimes.set(player, now - this.autoDisqualifyTimeout + AUTO_DISQUALIFY_WARNING_TIMEOUT);
				}

				this.autoDisqualifyWarnings.set(player, true);
				player.sendRoom(`|tournament|autodq|target|${remainingTime}`);
			} else {
				this.autoDisqualifyWarnings.delete(player);
			}
		}
		if (!this.isEnded) this.autoDisqualifyTimer = setTimeout(() => this.runAutoDisqualify(), this.autoDisqualifyTimeout);
	}

	async challenge(user, targetUserid, output) {
		if (!this.isTournamentStarted) {
			output.sendReply('|tournament|error|NotStarted');
			return;
		}

		if (!(user.userid in this.players)) {
			output.sendReply('|tournament|error|UserNotAdded');
			return;
		}

		if (!(targetUserid in this.players)) {
			output.sendReply('|tournament|error|InvalidMatch');
			return;
		}

		const from = this.players[user.userid];
		const to = this.players[targetUserid];
		const availableMatches = this.availableMatches.get(from);
		if (!availableMatches || !availableMatches.get(to)) {
			output.sendReply('|tournament|error|InvalidMatch');
			return;
		}

		if (this.generator.getUserBusy(from) || this.generator.getUserBusy(to)) {
			this.room.add("Tournament backend breaks specifications. Please report this to an admin.");
			return;
		}

		this.generator.setUserBusy(from, true);
		this.generator.setUserBusy(to, true);

		this.isAvailableMatchesInvalidated = true;
		this.update();

		const ready = await Ladders(this.teambuilderFormat).prepBattle(output.connection);
		if (!ready) {
			this.generator.setUserBusy(from, false);
			this.generator.setUserBusy(to, false);

			this.isAvailableMatchesInvalidated = true;
			this.update();
			return;
		}

		this.lastActionTimes.set(to, Date.now());
		this.pendingChallenges.set(from, {to: to, team: ready.team});
		this.pendingChallenges.set(to, {from: from, team: ready.team});
		from.sendRoom(`|tournament|update|${JSON.stringify({challenging: to.name})}`);
		to.sendRoom(`|tournament|update|${JSON.stringify({challenged: from.name})}`);

		this.isBracketInvalidated = true;
		this.update();
	}
	cancelChallenge(user, output) {
		if (!this.isTournamentStarted) {
			if (output) output.sendReply('|tournament|error|NotStarted');
			return;
		}

		if (!(user.userid in this.players)) {
			if (output) output.sendReply('|tournament|error|UserNotAdded');
			return;
		}

		const player = this.players[user.userid];
		const challenge = this.pendingChallenges.get(player);
		if (!challenge || challenge.from) return;

		this.generator.setUserBusy(player, false);
		this.generator.setUserBusy(challenge.to, false);
		this.pendingChallenges.set(player, null);
		this.pendingChallenges.set(challenge.to, null);
		user.sendTo(this.room, '|tournament|update|{"challenging":null}');
		challenge.to.sendRoom('|tournament|update|{"challenged":null}');

		this.isBracketInvalidated = true;
		this.isAvailableMatchesInvalidated = true;
		this.update();
	}
	async acceptChallenge(user, output) {
		if (!this.isTournamentStarted) {
			output.sendReply('|tournament|error|NotStarted');
			return;
		}

		if (!(user.userid in this.players)) {
			output.sendReply('|tournament|error|UserNotAdded');
			return;
		}

		const player = this.players[user.userid];
		const challenge = this.pendingChallenges.get(player);
		if (!challenge || !challenge.from) return;

		const ready = await Ladders(this.teambuilderFormat).prepBattle(output.connection);
		if (!ready) return;

		// Prevent battles between offline users from starting
		const from = Users.get(challenge.from.userid);
		if (!from || !from.connected || !user.connected) return;

		// Prevent double accepts and users that have been disqualified while between these two functions
		if (!this.pendingChallenges.get(challenge.from)) return;
		if (!this.pendingChallenges.get(player)) return;

		const room = Rooms.createBattle(this.teambuilderFormat, {
			isPrivate: this.room.isPrivate,
			p1: from,
			p1team: challenge.team,
			p2: user,
			p2team: ready.team,
			rated: !Ladders.disabled && this.isRated,
			tour: this,
		});
		if (!room) return;

		this.pendingChallenges.set(challenge.from, null);
		this.pendingChallenges.set(player, null);
		from.sendTo(this.room, '|tournament|update|{"challenging":null}');
		user.sendTo(this.room, '|tournament|update|{"challenged":null}');

		this.inProgressMatches.set(challenge.from, {to: player, room: room});
		this.room.add(`|tournament|battlestart|${from.name}|${user.name}|${room.id}`).update();

		this.isBracketInvalidated = true;
		if (this.autoDisqualifyTimeout !== Infinity) this.runAutoDisqualify(this.room);
		if (this.forceTimer) room.battle.timer.start();
		this.update();
	}
	forfeit(user) {
		return this.disqualifyUser(user.userid, null, "You left the tournament", true);
	}
	onConnect(user, connection) {
		this.updateFor(user, connection);
	}
	onUpdateConnection(user, connection) {
		this.updateFor(user, connection);
	}
	onRename(user, oldUserid) {
		if (oldUserid in this.players) {
			if (user.userid === oldUserid) {
				this.players[user.userid].name = user.name;
			} else {
				this.players[user.userid] = this.players[oldUserid];
				this.players[user.userid].userid = user.userid;
				this.players[user.userid].name = user.name;
				delete this.players[oldUserid];
			}
		}

		this.updateFor(user);
	}
	onBattleJoin(room, user) {
		if (this.scouting || this.isEnded || user.latestIp === room.p1.latestIp || user.latestIp === room.p2.latestIp) return;
		if (user.can('makeroom')) return;
		for (const targetUser of this.generator.getUsers(true)) {
			const otherUser = Users.get(targetUser.userid);
			if (otherUser && otherUser.latestIp === user.latestIp) {
				return "Scouting is banned: tournament players can't watch other tournament battles.";
			}
		}
	}
	onBattleWin(room, winnerid) {
		room.tour = null;
		room.parent = null;

		const from = this.players[room.p1.userid];
		const to = this.players[room.p2.userid];
		const winner = this.players[winnerid];
		const score = room.battle.score || [0, 0];

		let result = 'draw';
		if (from === winner) {
			result = 'win';
		} else if (to === winner) {
			result = 'loss';
		}

		if (result === 'draw' && !this.generator.isDrawingSupported) {
			this.room.add(`|tournament|battleend|${from.name}|${to.name}|${result}|${score.join(',')}|fail|${room.id}`);

			this.generator.setUserBusy(from, false);
			this.generator.setUserBusy(to, false);
			this.inProgressMatches.set(from, null);

			this.isBracketInvalidated = true;
			this.isAvailableMatchesInvalidated = true;

			if (this.autoDisqualifyTimeout !== Infinity) this.runAutoDisqualify();
			this.update();
			return this.room.update();
		}
		if (!(this.disqualifiedUsers.get(from) || this.disqualifiedUsers.get(to))) {
			// If a player was disqualified, handle the results there
			const error = this.generator.setMatchResult([from, to], result, score);
			if (error) {
				// Should never happen
				return this.room.add(`Unexpected ${error} from setMatchResult([${room.p1.userid}, ${room.p2.userid}], ${result}, ${score}) in onBattleWin(${room.id}, ${winnerid}). Please report this to an admin.`).update();
			}
		}
		this.room.add(`|tournament|battleend|${from.name}|${to.name}|${result}|${score.join(',')}|success|${room.id}`);

		this.generator.setUserBusy(from, false);
		this.generator.setUserBusy(to, false);
		this.inProgressMatches.set(from, null);

		this.isBracketInvalidated = true;
		this.isAvailableMatchesInvalidated = true;

		if (this.generator.isTournamentEnded()) {
			if (!this.room.isPrivate && this.generator.name.includes('Elimination') && !Config.autosavereplays) {
				const uploader = Users.get(winnerid);
				if (uploader && uploader.connections[0]) {
					Chat.parse('/savereplay', room, uploader, uploader.connections[0]);
				}
			}
			this.onTournamentEnd();
		} else {
			if (this.autoDisqualifyTimeout !== Infinity) this.runAutoDisqualify();
			this.update();
		}
		this.room.update();
	}
	onTournamentEnd() {
		const update = {
			results: this.generator.getResults().map(usersToNames),
			format: this.format,
			generator: this.generator.name,
			bracketData: this.getBracketData(),
		};
		this.room.add(`|tournament|end|${JSON.stringify(update)}`);
		this.isEnded = true;
		if (this.autoDisqualifyTimer) clearTimeout(this.autoDisqualifyTimer);
		delete exports.tournaments[this.room.id];
		delete this.room.game;
		for (const i in this.players) {
			this.players[i].destroy();
		}
	}
}

function getGenerator(generator) {
	generator = toId(generator);
	switch (generator) {
	case 'elim': generator = 'elimination'; break;
	case 'rr': generator = 'roundrobin'; break;
	}
	return TournamentGenerators[generator];
}
function createTournamentGenerator(generator, args, output) {
	let Generator = getGenerator(generator);
	if (!Generator) {
		output.errorReply(`${generator} is not a valid type.`);
		const generators = Object.keys(TournamentGenerators).join(', ');
		output.errorReply(`Valid types: ${generators}`);
		return;
	}
	args.unshift(null);
	return new (Generator.bind.apply(Generator, args))();
}
function createTournament(room, format, generator, playerCap, isRated, args, output) {
	if (room.type !== 'chat') {
		output.errorReply("Tournaments can only be created in chat rooms.");
		return;
	}
	if (room.game) {
		output.errorReply(`You cannot have a tournament until the current room activity is over: ${room.game.title}`);
		return;
	}
	if (Rooms.global.lockdown) {
		output.errorReply("The server is restarting soon, so a tournament cannot be created.");
		return;
	}
	format = Dex.getFormat(format);
	if (format.effectType !== 'Format' || !format.tournamentShow) {
		output.errorReply(`${format.id} is not a valid tournament format.`);
		const formats = Object.values(Dex.formats).filter(f => f.tournamentShow).map(format => format.name).join(', ');
		output.errorReply(`Valid formats: ${formats}`);
		return;
	}
	if (!getGenerator(generator)) {
		output.errorReply(`${generator} is not a valid type.`);
		const generators = Object.keys(TournamentGenerators).join(', ');
		output.errorReply(`Valid types: ${generators}`);
		return;
	}
	if (playerCap && playerCap < 2) {
		output.errorReply("You cannot have a player cap that is less than 2.");
		return;
	}
	room.game = exports.tournaments[room.id] = new Tournament(room, format, createTournamentGenerator(generator, args, output), playerCap, isRated);
	return room.game;
}
function deleteTournament(id, output) {
	const tournament = exports.tournaments[id];
	if (!tournament) {
		output.errorReply(`${id} doesn't exist.`);
		return false;
	}
	tournament.forceEnd(output);
	delete exports.tournaments[id];
	const room = Rooms(id);
	if (room) delete room.game;
	return true;
}
function getTournament(id, output) {
	if (exports.tournaments[id]) {
		return exports.tournaments[id];
	}
}

const commands = {
	basic: {
		j: 'join',
		in: 'join',
		join(tournament, user) {
			tournament.addUser(user, false, this);
		},
		l: 'leave',
		out: 'leave',
		leave(tournament, user) {
			if (tournament.isTournamentStarted) {
				if (tournament.generator.getUsers(true).some(player => player.userid === user.userid)) {
					tournament.disqualifyUser(user.userid, this, null, true);
				} else {
					this.errorReply("You have already been eliminated from this tournament.");
				}
			} else {
				tournament.removeUser(user, this);
			}
		},
		getusers(tournament) {
			if (!this.runBroadcast()) return;
			let users = usersToNames(tournament.generator.getUsers(true).sort());
			this.sendReplyBox(`<strong>${users.length} users remain in this tournament:</strong><br />${Chat.escapeHTML(users.join(', '))}`);
		},
		getupdate(tournament, user) {
			tournament.updateFor(user);
			this.sendReply("Your tournament bracket has been updated.");
		},
		challenge(tournament, user, params, cmd) {
			if (params.length < 1) {
				return this.sendReply(`Usage: ${cmd} <user>`);
			}
			tournament.challenge(user, toId(params[0]), this);
		},
		cancelchallenge(tournament, user) {
			tournament.cancelChallenge(user, this);
		},
		acceptchallenge(tournament, user) {
			tournament.acceptChallenge(user, this);
		},
		vtm(tournament, user, params, cmd, connection) {
			if (Monitor.countPrepBattle(connection.ip, connection)) {
				return;
			}
			TeamValidatorAsync(tournament.teambuilderFormat).validateTeam(user.team).then(result => {
				if (result.charAt(0) === '1') {
					connection.popup("Your team is valid for this tournament.");
				} else {
					const formatName = Dex.getFormat(tournament.originalFormat).name;
					// split/join is the easiest way to do a find/replace with an untrusted string, sadly
					const reasons = result.slice(1).split(formatName).join('this tournament');
					connection.popup(`Your team was rejected for the following reasons:\n\n- ${reasons.replace(/\n/g, '\n- ')}`);
				}
			});
		},
		viewruleset: 'viewcustomrules',
		viewbanlist: 'viewcustomrules',
		viewrules: 'viewcustomrules',
		viewcustomrules(tournament) {
			if (!this.runBroadcast()) return;
			if (tournament.customRules.length < 1) {
				return this.errorReply("The tournament does not have any custom rules.");
			}
			this.sendReply(`|html|<div class='infobox infobox-limited'>This tournament includes:<br />${tournament.getCustomRules()}</div>`);
		},
	},
	creation: {
		settype(tournament, user, params, cmd) {
			if (params.length < 1) {
				return this.sendReply(`Usage: ${cmd} <type> [, <comma-separated arguments>]`);
			}
			const playerCap = parseInt(params.splice(1, 1));
			const generator = createTournamentGenerator(params.shift(), params, this);
			if (generator && tournament.setGenerator(generator, this)) {
				if (playerCap && playerCap >= 2) {
					tournament.playerCap = playerCap;
					if (Config.tourdefaultplayercap && tournament.playerCap > Config.tourdefaultplayercap) {
						Monitor.log(`[TourMonitor] Room ${tournament.room.id} starting a tour over default cap (${tournament.playerCap})`);
					}
					this.room.send(`|tournament|update|{"playerCap": "${playerCap}"}`);
				} else if (tournament.playerCap && !playerCap) {
					tournament.playerCap = 0;
					this.room.send(`|tournament|update|{"playerCap": "${playerCap}"}`);
				}
				const capNote = (tournament.playerCap ? ' with a player cap of ' + tournament.playerCap : '');
				this.privateModAction(`(${user.name} set tournament type to ${generator.name + capNote}.)`);
				this.modlog('TOUR SETTYPE', null, generator.name + capNote);
				this.sendReply(`Tournament set to ${generator.name + capNote}.`);
			}
		},
		cap: 'setplayercap',
		playercap: 'setplayercap',
		setcap: 'setplayercap',
		setplayercap(tournament, user, params, cmd) {
			if (params.length < 1) {
				if (tournament.playerCap) {
					return this.sendReply(`Usage: ${cmd} <cap>; The current player cap is ${tournament.playerCap}`);
				} else {
					return this.sendReply(`Usage: ${cmd} <cap>`);
				}
			}
			if (tournament.isTournamentStarted) {
				return this.errorReply("The player cap cannot be changed once the tournament has started.");
			}
			const option = params[0].toLowerCase();
			if (option === '0' || option === 'infinity' || option === 'off' || option === 'false' || option === 'stop' || option === 'remove') {
				if (!tournament.playerCap) return this.errorReply("The tournament does not have a player cap.");
				params[0] = '0';
			}
			const playerCap = parseInt(params[0]);
			if (playerCap === 0) {
				tournament.playerCap = 0;
				this.privateModAction(`(${user.name} removed the tournament's player cap.)`);
				this.modlog('TOUR PLAYERCAP', null, 'removed');
				this.sendReply("Tournament cap removed.");
			} else {
				if (isNaN(playerCap) || playerCap < 2) return this.errorReply("The tournament cannot have a player cap less than 2.");
				if (playerCap === tournament.playerCap) return this.errorReply(`The tournament's player cap is already ${playerCap}.`);
				tournament.playerCap = playerCap;
				if (Config.tourdefaultplayercap && tournament.playerCap > Config.tourdefaultplayercap) {
					Monitor.log(`[TourMonitor] Room ${tournament.room.id} starting a tour over default cap (${tournament.playerCap})`);
				}
				this.privateModAction(`(${user.name} set the tournament's player cap to ${tournament.playerCap}.)`);
				this.modlog('TOUR PLAYERCAP', null, tournament.playerCap);
				this.sendReply(`Tournament cap set to ${tournament.playerCap}.`);
			}
			this.room.send(`|tournament|update|{"playerCap": "${tournament.playerCap}"}`);
		},
		end: 'delete',
		stop: 'delete',
		delete(tournament, user) {
			if (deleteTournament(tournament.room.id, this)) {
				this.privateModAction(`(${user.name} forcibly ended a tournament.)`);
				this.modlog('TOUR END');
			}
		},
		ruleset: 'customrules',
		banlist: 'customrules',
		rules: 'customrules',
		customrules(tournament, user, params, cmd) {
			if (cmd === 'banlist') {
				return this.errorReply('The new syntax is: /tour rules -bannedthing, +unbannedthing, !removedrule, addedrule');
			}
			if (params.length < 1) {
				this.sendReply("Usage: /tour rules <list of rules>");
				this.sendReply("Rules can be: -bannedthing, +unbannedthing, !removedrule, addedrule");
				return this.parse('/tour viewrules');
			}
			if (tournament.isTournamentStarted) {
				return this.errorReply("The custom rules cannot be changed once the tournament has started.");
			}
			if (tournament.setCustomRules(params, this)) {
				this.room.addRaw(`<div class='infobox infobox-limited'>This tournament includes:<br />${tournament.getCustomRules()}</div>`);
				this.privateModAction(`(${user.name} updated the tournament's custom rules.)`);
				this.modlog('TOUR RULES', null, tournament.customRules.join(', '));
			}
		},
		clearruleset: 'clearcustomrules',
		clearbanlist: 'clearcustomrules',
		clearrules: 'clearcustomrules',
		clearcustomrules(tournament, user) {
			if (tournament.isTournamentStarted) {
				return this.errorReply("The custom rules cannot be changed once the tournament has started.");
			}
			if (tournament.customRules.length < 1) {
				return this.errorReply("The tournament does not have any custom rules.");
			}
			tournament.customRules = [];
			tournament.teambuilderFormat = tournament.originalFormat;
			this.room.addRaw(`<b>The tournament's custom rules were cleared.</b>`);
			this.privateModAction(`(${user.name} cleared the tournament's custom rules.)`);
			this.modlog('TOUR CLEARRULES');
		},
		name: 'setname',
		customname: 'setname',
		setname(tournament, user, params, cmd) {
			if (params.length < 1) {
				return this.sendReply(`Usage: ${cmd} <comma-separated arguments>`);
			}
			let name = this.canTalk(params[0].trim());
			if (!name) return;
			name = Chat.escapeHTML(name);
			if (name.length > MAX_CUSTOM_NAME_LENGTH) return this.errorReply(`The tournament's name cannot exceed ${MAX_CUSTOM_NAME_LENGTH} characters.`);
			if (name.includes('|')) return this.errorReply("The tournament's name cannot include the | symbol.");
			tournament.format = name;
			this.room.send(`|tournament|update|${JSON.stringify({format: tournament.format})}`);
			this.privateModAction(`(${user.name} set the tournament's name to ${tournament.format}.)`);
			this.modlog('TOUR NAME', null, tournament.format);
			tournament.update();
		},
		resetname: 'clearname',
		clearname(tournament, user) {
			if (tournament.format === tournament.originalFormat) return this.errorReply("The tournament does not have a name.");
			tournament.format = tournament.originalFormat;
			this.room.send(`|tournament|update|${JSON.stringify({format: tournament.format})}`);
			this.privateModAction(`(${user.name} cleared the tournament's name.)`);
			this.modlog('TOUR CLEARNAME');
			tournament.update();
		},
	},
	moderation: {
		begin: 'start',
		start(tournament, user) {
			if (tournament.startTournament(this)) {
				this.room.sendMods(`(${user.name} started the tournament.)`);
			}
		},
		dq: 'disqualify',
		disqualify(tournament, user, params, cmd) {
			if (params.length < 1) {
				return this.sendReply(`Usage: ${cmd} <user>`);
			}
			const targetUser = Users.get(params[0]) || params[0];
			const targetUserid = toId(targetUser);
			let reason = '';
			if (params[1]) {
				reason = params[1].trim();
				if (reason.length > MAX_REASON_LENGTH) return this.errorReply(`The reason is too long. It cannot exceed ${MAX_REASON_LENGTH} characters.`);
			}
			if (tournament.disqualifyUser(targetUserid, this, reason)) {
				this.privateModAction(`(${(targetUser.name || targetUserid)} was disqualified from the tournament by ${user.name} ${(reason ? ' (' + reason + ')' : '')})`);
				this.modlog('TOUR DQ', targetUser, reason);
			}
		},
		autostart: 'setautostart',
		setautostart(tournament, user, params, cmd) {
			if (params.length < 1) {
				return this.sendReply(`Usage: ${cmd} <on|minutes|off>`);
			}
			let option = params[0].toLowerCase();
			if (this.meansYes(option) || option === 'start') {
				if (tournament.isTournamentStarted) {
					return this.errorReply("The tournament has already started.");
				} else if (!tournament.playerCap) {
					return this.errorReply("The tournament does not have a player cap set.");
				} else {
					if (tournament.autostartcap) return this.errorReply("The tournament is already set to autostart when the player cap is reached.");
					tournament.autostartcap = true;
					this.room.add(`The tournament will start once ${tournament.playerCap} players have joined.`);
					this.privateModAction(`(The tournament was set to autostart when the player cap is reached by ${user.name})`);
					this.modlog('TOUR AUTOSTART', null, 'when playercap is reached');
				}
			} else {
				if (option === '0' || option === 'infinity' || this.meansNo(option) || option === 'stop' || option === 'remove') {
					if (!tournament.autostartcap && tournament.autoStartTimeout === Infinity) return this.errorReply("The automatic tournament start timer is already off.");
					params[0] = 'off';
					tournament.autostartcap = false;
				}
				const timeout = params[0].toLowerCase() === 'off' ? Infinity : params[0];
				if (tournament.setAutoStartTimeout(timeout * 60 * 1000, this)) {
					this.privateModAction(`(The tournament auto start timer was set to  ${params[0]} by ${user.name})`);
					this.modlog('TOUR AUTOSTART', null, timeout === Infinity ? 'off' : params[0]);
				}
			}
		},
		autodq: 'setautodq',
		setautodq(tournament, user, params, cmd) {
			if (params.length < 1) {
				if (tournament.autoDisqualifyTimeout !== Infinity) {
					return this.sendReply(`Usage: ${cmd} <minutes|off>; The current automatic disqualify timer is set to ${(tournament.autoDisqualifyTimeout / 1000 / 60)} minute(s)`);
				} else {
					return this.sendReply(`Usage: ${cmd} <minutes|off>`);
				}
			}
			if (params[0].toLowerCase() === 'infinity' || params[0] === '0') params[0] = 'off';
			const timeout = params[0].toLowerCase() === 'off' ? Infinity : params[0] * 60 * 1000;
			if (timeout === tournament.autoDisqualifyTimeout) return this.errorReply(`The automatic tournament disqualify timer is already set to ${params[0]} minute(s).`);
			if (tournament.setAutoDisqualifyTimeout(timeout, this)) {
				this.privateModAction(`(The tournament auto disqualify timer was set to ${params[0]} by ${user.name})`);
				this.modlog('TOUR AUTODQ', null, timeout === Infinity ? 'off' : params[0]);
			}
		},
		runautodq(tournament, user) {
			if (tournament.autoDisqualifyTimeout === Infinity) return this.errorReply("The automatic tournament disqualify timer is not set.");
			tournament.runAutoDisqualify(this);
			this.roomlog(`${user.name} used /tour runautodq`);
		},
		scout: 'setscouting',
		scouting: 'setscouting',
		setscout: 'setscouting',
		setscouting(tournament, user, params, cmd) {
			if (params.length < 1) {
				if (tournament.scouting) {
					return this.sendReply("This tournament allows spectating other battles while in a tournament.");
				} else {
					return this.sendReply("This tournament disallows spectating other battles while in a tournament.");
				}
			}

			const option = params[0].toLowerCase();
			if (this.meansYes(option) || option === 'allow' || option === 'allowed') {
				if (tournament.scouting) return this.errorReply("Scouting for this tournament is already set to allowed.");
				tournament.scouting = true;
				tournament.modjoin = false;
				this.room.add('|tournament|scouting|allow');
				this.privateModAction(`(The tournament was set to allow scouting by ${user.name})`);
				this.modlog('TOUR SCOUT', null, 'allow');
			} else if (this.meansNo(option) || option === 'disallow' || option === 'disallowed') {
				if (!tournament.scouting) return this.errorReply("Scouting for this tournament is already disabled.");
				tournament.scouting = false;
				tournament.modjoin = true;
				this.room.add('|tournament|scouting|disallow');
				this.privateModAction(`(The tournament was set to disallow scouting by ${user.name})`);
				this.modlog('TOUR SCOUT', null, 'disallow');
			} else {
				return this.sendReply(`Usage: ${cmd}<allow|disallow>`);
			}
		},
		modjoin: 'setmodjoin',
		setmodjoin(tournament, user, params, cmd) {
			if (params.length < 1) {
				if (tournament.modjoin) {
					return this.sendReply("This tournament allows players to modjoin their battles.");
				} else {
					return this.sendReply("This tournament does not allow players to modjoin their battles.");
				}
			}

			const option = params[0].toLowerCase();
			if (this.meansYes(option) || option === 'allow' || option === 'allowed') {
				if (tournament.modjoin) return this.errorReply("Modjoining is already allowed for this tournament.");
				tournament.modjoin = true;
				this.room.add("Modjoining is now allowed (Players can modjoin their tournament battles).");
				this.privateModAction(`(The tournament was set to allow modjoin by ${user.name})`);
				this.modlog('TOUR MODJOIN', null, option);
			} else if (this.meansNo(option) || option === 'disallow' || option === 'disallowed') {
				if (!tournament.modjoin) return this.errorReply("Modjoining is already not allowed for this tournament.");
				tournament.modjoin = false;
				this.room.add("Modjoining is now banned (Players cannot modjoin their tournament battles).");
				this.privateModAction(`(The tournament was set to disallow modjoin by ${user.name})`);
				this.modlog('TOUR MODJOIN', null, option);
			} else {
				return this.sendReply(`Usage: ${cmd} <allow|disallow>`);
			}
		},
		forcetimer(tournament, user, params, cmd) {
			const option = params.length ? params[0].toLowerCase() : 'on';
			if (this.meansYes(option)) {
				tournament.forceTimer = true;
				this.room.add('Forcetimer is now on for the tournament.');
				this.privateModAction(`(The timer was turned on for the tournament by ${user.name})`);
				this.modlog('TOUR FORCETIMER', null, 'ON');
			} else if (this.meansNo(option) || option === 'stop') {
				tournament.forceTimer = false;
				this.room.add('Forcetimer is now off for the tournament.');
				this.privateModAction(`(The timer was turned off for the tournament by ${user.name})`);
				this.modlog('TOUR FORCETIMER', null, 'ON');
			} else {
				return this.sendReply(`Usage: ${cmd} <on|off>`);
			}
		},
		banuser(tournament, user, params, cmd) {
			if (params.length < 1) {
				return this.sendReply(`Usage: ${cmd} <user>, <reason>`);
			}
			let targetUser = Users.get(params[0]);
			const online = !!targetUser;
			if (!online) targetUser = params[0];
			const targetUserid = toId(targetUser);
			let reason = '';
			if (params[1]) {
				reason = params[1].trim();
				if (reason.length > MAX_REASON_LENGTH) return this.errorReply(`The reason is too long. It cannot exceed ${MAX_REASON_LENGTH} characters.`);
			}

			if (tournament.checkBanned(targetUser)) return this.errorReply("This user is already banned from tournaments.");

			const punishment = ['TOURBAN', targetUserid, Date.now() + TOURBAN_DURATION, reason];
			if (online) {
				Punishments.roomPunish(this.room, targetUser, punishment);
			} else {
				Punishments.roomPunishName(this.room, targetUser, punishment);
			}
			tournament.removeBannedUser(targetUser);
			this.modlog('TOUR BAN', targetUser, reason);
			if (reason) reason = ` (${reason})`;
			this.privateModAction(`${targetUser.name || targetUserid} was banned from joining tournaments by ${user.name}.${reason}`);
		},
		unbanuser(tournament, user, params, cmd) {
			if (params.length < 1) {
				return this.sendReply(`Usage: ${cmd} <user>`);
			}
			const targetUser = Users.get(params[0]) || params[0];
			const targetUserid = toId(targetUser);

			if (!tournament.checkBanned(targetUser)) return this.errorReply("This user isn't banned from tournaments.");

			Punishments.roomUnpunish(this.room, targetUser, 'TOURBAN');
			tournament.removeBannedUser(targetUser);
			this.privateModAction(`${targetUser.name || targetUserid} was unbanned from joining tournaments by ${user.name}.`);
			this.modlog('TOUR UNBAN', targetUser, null, {noip: 1, noalts: 1});
		},
	},
};

Chat.loadPlugins();
Chat.commands.tour = 'tournament';
Chat.commands.tours = 'tournament';
Chat.commands.tournaments = 'tournament';
Chat.commands.tournament = function (paramString, room, user, connection) {
	let cmdParts = paramString.split(' ');
	let cmd = cmdParts.shift().trim().toLowerCase();
	let params = cmdParts.join(' ').split(',').map(param => param.trim());
	if (!params[0]) params = [];

	if (cmd === '') {
		if (!this.runBroadcast()) return;
		const update = Object.keys(exports.tournaments).filter(tournament => {
			tournament = exports.tournaments[tournament];
			return !tournament.room.isPrivate && !tournament.room.isPersonal && !tournament.room.staffRoom;
		}).map(tournament => {
			tournament = exports.tournaments[tournament];
			return {room: tournament.room.id, title: tournament.room.title, format: tournament.format, generator: tournament.generator.name, isStarted: tournament.isTournamentStarted};
		});
		this.sendReply(`|tournaments|info|${JSON.stringify(update)}`);
	} else if (cmd === 'help') {
		return this.parse('/help tournament');
	} else if (this.meansYes(cmd)) {
		if (!this.can('gamemanagement', null, room)) return;
		let rank = params[0];
		if (rank && rank === '@') {
			if (room.toursEnabled === true) return this.errorReply("Tournaments are already enabled for @ and above in this room.");
			room.toursEnabled = true;
			if (room.chatRoomData) {
				room.chatRoomData.toursEnabled = true;
				Rooms.global.writeChatRoomData();
			}
			return this.sendReply("Tournaments are now enabled for @ and up.");
		} else if (rank && rank === '%') {
			if (room.toursEnabled === rank) return this.errorReply("Tournaments are already enabled for % and above in this room.");
			room.toursEnabled = rank;
			if (room.chatRoomData) {
				room.chatRoomData.toursEnabled = rank;
				Rooms.global.writeChatRoomData();
			}
			return this.sendReply("Tournaments are now enabled for % and up.");
		} else {
			return this.errorReply("Tournament enable setting not recognized.  Valid options include [%|@].");
		}
	} else if (this.meansNo(cmd)) {
		if (!this.can('gamemanagement', null, room)) return;
		if (!room.toursEnabled) {
			return this.errorReply("Tournaments are already disabled.");
		}
		delete room.toursEnabled;
		if (room.chatRoomData) {
			delete room.chatRoomData.toursEnabled;
			Rooms.global.writeChatRoomData();
		}
		return this.sendReply("Tournaments are now disabled.");
	} else if (cmd === 'announce' || cmd === 'announcements') {
		if (!this.can('gamemanagement', null, room)) return;
		if (!Config.tourannouncements.includes(room.id)) {
			return this.errorReply("Tournaments in this room cannot be announced.");
		}
		if (params.length < 1) {
			if (room.tourAnnouncements) {
				return this.sendReply("Tournament announcements are enabled.");
			} else {
				return this.sendReply("Tournament announcements are disabled.");
			}
		}

		let option = params[0].toLowerCase();
		if (this.meansYes(option)) {
			if (room.tourAnnouncements) return this.errorReply("Tournament announcements are already enabled.");
			room.tourAnnouncements = true;
			this.privateModAction(`(Tournament announcements were enabled by ${user.name})`);
			this.modlog('TOUR ANNOUNCEMENTS', null, 'ON');
		} else if (this.meansNo(option)) {
			if (!room.tourAnnouncements) return this.errorReply("Tournament announcements are already disabled.");
			room.tourAnnouncements = false;
			this.privateModAction(`(Tournament announcements were disabled by ${user.name})`);
			this.modlog('TOUR ANNOUNCEMENTS', null, 'OFF');
		} else {
			return this.sendReply(`Usage: ${cmd} <on|off>`);
		}

		if (room.chatRoomData) {
			room.chatRoomData.tourAnnouncements = room.tourAnnouncements;
			Rooms.global.writeChatRoomData();
		}
	} else if (cmd === 'create' || cmd === 'new') {
		if (room.toursEnabled === true) {
			if (!this.can('tournaments', null, room)) return;
		} else if (room.toursEnabled === '%') {
			if (!this.can('gamemoderation', null, room)) return;
		} else {
			if (!user.can('gamemanagement', null, room)) {
				return this.errorReply(`Tournaments are disabled in this room (${room.id}).`);
			}
		}
		if (params.length < 2) {
			return this.sendReply(`Usage: ${cmd} <format>, <type> [, <comma-separated arguments>]`);
		}

		let tour = createTournament(room, params.shift(), params.shift(), params.shift(), Config.ratedtours, params, this);
		if (tour) {
			this.privateModAction(`(${user.name} created a tournament in ${tour.format} format.)`);
			this.modlog('TOUR CREATE', null, tour.format);
			if (room.tourAnnouncements) {
				let tourRoom = Rooms.search(Config.tourroom || 'tournaments');
				if (tourRoom && tourRoom !== room) tourRoom.addRaw(`<div class="infobox"><a href="/${room.id}" class="ilink"><strong>${Chat.escapeHTML(Dex.getFormat(tour.format).name)}</strong> tournament created in <strong>${Chat.escapeHTML(room.title)}</strong>.</a></div>`).update();
			}
		}
	} else {
		let tournament = getTournament(room.id);
		if (!tournament) {
			return this.sendReply("There is currently no tournament running in this room.");
		}

		let commandHandler = null;
		if (commands.basic[cmd]) {
			commandHandler = typeof commands.basic[cmd] === 'string' ? commands.basic[commands.basic[cmd]] : commands.basic[cmd];
		}

		if (commands.creation[cmd]) {
			if (room.toursEnabled === true) {
				if (!this.can('tournaments', null, room)) return;
			} else if (room.toursEnabled === '%') {
				if (!this.can('gamemoderation', null, room)) return;
			} else {
				if (!user.can('gamemanagement', null, room)) {
					return this.errorReply(`Tournaments are disabled in this room (${room.id}).`);
				}
			}
			commandHandler = typeof commands.creation[cmd] === 'string' ? commands.creation[commands.creation[cmd]] : commands.creation[cmd];
		}

		if (commands.moderation[cmd]) {
			if (!user.can('gamemoderation', null, room)) {
				return this.errorReply(`${cmd} -  Access denied.`);
			}
			commandHandler = typeof commands.moderation[cmd] === 'string' ? commands.moderation[commands.moderation[cmd]] : commands.moderation[cmd];
		}

		if (!commandHandler) {
			this.errorReply(`${cmd} is not a tournament command.`);
		} else {
			commandHandler.call(this, tournament, user, params, cmd, connection);
		}
	}
};
Chat.commands.tournamenthelp = function (target, room, user) {
	if (!this.runBroadcast()) return;
	return this.sendReplyBox(
		`- create/new &lt;format>, &lt;type>, [ &lt;comma-separated arguments>]: Creates a new tournament in the current room.<br />` +
		`- settype &lt;type> [, &lt;comma-separated arguments>]: Modifies the type of tournament after it's been created, but before it has started.<br />` +
		`- cap/playercap &lt;cap>: Sets the player cap of the tournament before it has started.<br />` +
		`- rules/banlist &lt;comma-separated arguments>: Sets the custom rules for the tournament before it has started.<br />` +
		`- viewrules/viewbanlist: Shows the custom rules for the tournament.<br />` +
		`- clearrules/clearbanlist: Clears the custom rules for the tournament before it has started.<br />` +
		`- name &lt;name>: Sets a custom name for the tournament.<br />` +
		`- clearname: Clears the custom name of the tournament.<br />` +
		`- end/stop/delete: Forcibly ends the tournament in the current room.<br />` +
		`- begin/start: Starts the tournament in the current room.<br />` +
		`- autostart/setautostart &lt;on|minutes|off>: Sets the automatic start timeout.<br />` +
		`- dq/disqualify &lt;user>: Disqualifies a user.<br />` +
		`- autodq/setautodq &lt;minutes|off>: Sets the automatic disqualification timeout.<br />` +
		`- runautodq: Manually run the automatic disqualifier.<br />` +
		`- scouting &lt;allow|disallow>: Specifies whether joining tournament matches while in a tournament is allowed.<br />` +
		`- modjoin &lt;allow|disallow>: Specifies whether players can modjoin their battles.<br />` +
		`- forcetimer &lt;on|off>: Turn on the timer for tournament battles.<br />` +
		`- getusers: Lists the users in the current tournament.<br />` +
		`- on/enable &lt;%|@>: Enables allowing drivers or mods to start tournaments in the current room.<br />` +
		`- off/disable: Disables allowing drivers and mods to start tournaments in the current room.<br />` +
		`- announce/announcements &lt;on|off>: Enables/disables tournament announcements for the current room.<br />` +
		`- banuser/unbanuser &lt;user>: Bans/unbans a user from joining tournaments in this room. Lasts 2 weeks.<br />` +
		`More detailed help can be found <a href="https://www.smogon.com/forums/threads/3570628/#post-6777489">here</a>`
	);
};

exports.Tournament = Tournament;
exports.TournamentGenerators = TournamentGenerators;

exports.createTournament = createTournament;
exports.deleteTournament = deleteTournament;
exports.get = getTournament;

exports.commands = commands;
