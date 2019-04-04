/**
 * Scavengers Plugin
 * Pokemon Showdown - http://pokemonshowdown.com/
 *
 * This is a game plugin to host scavenger games specifically in the Scavengers room,
 * where the players will race answer several hints.
 *
 * @license MIT license
 */

'use strict';

const FS = require('../../.lib-dist/fs').FS;

const RATED_TYPES = ['official', 'regular', 'mini'];
const DEFAULT_POINTS = {
	official: [20, 15, 10, 5, 1],
};
const DEFAULT_BLITZ_POINTS = {
	official: 10,
};
const DEFAULT_HOST_POINTS = 4;
const DEFAULT_TIMER_DURATION = 120;

const DATA_FILE = 'config/chat-plugins/scavdata.json';
const HOST_DATA_FILE = 'config/chat-plugins/scavhostdata.json';
const PLAYER_DATA_FILE = 'config/chat-plugins/scavplayerdata.json';

const SCAVENGE_REGEX = /^((?:\s)?(?:\/{2,}|[^\w/]+)|\s\/)?(?:\s)?(?:s\W?cavenge|s\W?cav(?:engers)? guess|d\W?t|d\W?ata|d\W?etails|g\W?(?:uess)?|v)\b/i; // a regex of some of all the possible slips for leaks.
const FILTER_LENIENCY = 7;

const HISTORY_PERIOD = 6; // months

const ScavengerGames = require("./scavenger-games");

// convert points stored in the old format
const scavsRoom = Rooms('scavengers');
if (scavsRoom && Array.isArray(scavsRoom.winPoints)) {
	scavsRoom.winPoints = {official: scavsRoom.winPoints.slice()};
	scavsRoom.blitzPoints = {official: scavsRoom.blitzPoints};
	if (scavsRoom.chatRoomData) {
		scavsRoom.chatRoomData.winPoints = scavsRoom.winPoints;
		scavsRoom.chatRoomData.blitzPoints = scavsRoom.blitzPoints;
		Rooms.global.writeChatRoomData();
	}
}

class Ladder {
	constructor(file) {
		this.file = file;
		this.data = {};

		this.load();
	}

	load() {
		const json = FS(this.file).readIfExistsSync();
		if (json) this.data = JSON.parse(json);
	}

	addPoints(name, aspect, points, noUpdate) {
		let userid = toId(name);

		if (!userid || userid === 'constructor' || !points) return this;
		if (!this.data[userid]) this.data[userid] = {name: name};

		if (!this.data[userid][aspect]) this.data[userid][aspect] = 0;
		this.data[userid][aspect] += points;

		if (!noUpdate) this.data[userid].name = name; // always keep the last used name

		return this; // allow chaining
	}

	reset() {
		this.data = {};
		return this; // allow chaining
	}

	write() {
		FS(this.file).writeUpdate(() => JSON.stringify(this.data));
	}

	visualize(sortBy, userid) {
		// return a promise for async sorting - make this less exploitable
		return new Promise((resolve, reject) => {
			let lowestScore = Infinity;
			let lastPlacement = 1;

			let ladder = Object.keys(this.data)
				.filter(k => this.data[k][sortBy])
				.sort((a, b) => this.data[b][sortBy] - this.data[a][sortBy])
				.map((u, i) => {
					u = this.data[u];
					if (u[sortBy] !== lowestScore) {
						lowestScore = u[sortBy];
						lastPlacement = i + 1;
					}
					return Object.assign(
						{rank: lastPlacement},
						u
					);
				}); // identify ties
			if (userid) {
				let rank = ladder.find(entry => toId(entry.name) === userid);
				resolve(rank);
			} else {
				resolve(ladder);
			}
		});
	}
}

class PlayerLadder extends Ladder {
	constructor(file) {
		super(file);
	}

	addPoints(name, aspect, points, noUpdate) {
		if (aspect.indexOf('cumulative-') !== 0) {
			this.addPoints(name, `cumulative-${aspect}`, points, noUpdate);
		}
		let userid = toId(name);

		if (!userid || userid === 'constructor' || !points) return this;
		if (!this.data[userid]) this.data[userid] = {name: name};

		if (!this.data[userid][aspect]) this.data[userid][aspect] = 0;
		this.data[userid][aspect] += points;

		if (!noUpdate) this.data[userid].name = name; // always keep the last used name

		return this; // allow chaining
	}

	// add the different keys to the history - async for larger leaderboards
	softReset() {
		return new Promise((resolve, reject) => {
			for (let u in this.data) {
				let userData = this.data[u];
				for (let a in userData) {
					if (/^(?:cumulative|history)-/i.test(a) || a === 'name') continue; // cumulative does not need to be soft reset
					let historyKey = 'history-' + a;

					if (!userData[historyKey]) userData[historyKey] = [];

					userData[historyKey].unshift(userData[a]);
					userData[historyKey] = userData[historyKey].slice(0, HISTORY_PERIOD);

					userData[a] = 0; // set it back to 0
					// clean up if history is all 0's
					if (!userData[historyKey].some(p => p)) {
						delete userData[a];
						delete userData[historyKey];
					}
				}
			}
			resolve();
		});
	}

	hardReset() {
		this.data = {};
		return this; // allow chaining
	}
}

let Leaderboard = new Ladder(DATA_FILE);
let HostLeaderboard = new PlayerLadder(HOST_DATA_FILE);
let PlayerLeaderboard = new PlayerLadder(PLAYER_DATA_FILE);

function formatQueue(queue = [], viewer, room, broadcasting) {
	const showStaff = viewer.can('mute', null, room) && !broadcasting;
	const queueDisabled = room.scavQueueDisabled;
	const timerDuration = room.defaultScavTimer || DEFAULT_TIMER_DURATION;
	let buffer;
	if (queue.length) {
		buffer = queue.map((item, index) => `<tr${(!item.hosts.some(h => h.userid === viewer.userid) && viewer.userid !== item.staffHostId ? ` style="background-color: lightgray"` : "")}><td><button name="send" value="/scav dequeue ${index}" style="color: red; background-color: transparent; border: none; padding: 1px;">[x]</button><button name="send" value="/scav next ${index}" style="color: green; background-color: transparent; border: none; padding: 1px;">[start]</button>&nbsp;${Chat.escapeHTML(Chat.toListString(item.hosts.map(h => h.name)))}${item.hosts.every(h => h.userid !== item.staffHostId) ? ` / ${item.staffHostId}` : ''}</td><td>${(!broadcasting && (item.hosts.some(h => h.userid === viewer.userid) || viewer.userid === item.staffHostId) ? item.questions.map((q, i) => i % 2 ? `<span style="color: green"><em>[${Chat.escapeHTML(q.join(' / '))}]</em></span><br />` : Chat.escapeHTML(q)).join(" ") : `[${item.questions.length / 2} hidden questions]`)}</td></tr>`).join("");
	} else {
		buffer = `<tr><td colspan=3>The scavenger queue is currently empty.</td></tr>`;
	}
	let template = `<div class="ladder"><table style="width: 100%"><tr><th>By</th><th>Questions</th></tr>${showStaff ? buffer : buffer.replace(/<button.*?>.+?<\/button>/gi, '')}</table></div>`;
	if (showStaff) template += `<table style="width: 100%"><tr><td style="text-align: left;">Auto Timer Duration: ${timerDuration} minutes</td><td>Auto Dequeue: <button class="button${!queueDisabled ? '" name="send" value="/scav disablequeue"' : ' disabled" style="font-weight:bold; color:#575757; font-weight:bold; background-color:#d3d3d3;"'}>OFF</button>&nbsp;<button class="button${queueDisabled ? '" name="send" value="/scav enablequeue"' : ' disabled" style="font-weight:bold; color:#575757; font-weight:bold; background-color:#d3d3d3;"'}>ON</button></td><td style="text-align: right;"><button class="button" name="send" value="/scav next 0">Start the next hunt</button></td></tr></table>`;
	return template;
}

function formatOrder(place) {
	// anything between 10 and 20 should always end with -th
	let remainder = place % 100;
	if (remainder >= 10 && remainder <= 20) return place + 'th';

	// follow standard rules with -st, -nd, -rd, and -th
	remainder = place % 10;
	if (remainder === 1) return place + 'st';
	if (remainder === 2) return place + 'nd';
	if (remainder === 3) return place + 'rd';
	return place + 'th';
}

class ScavengerHunt extends Rooms.RoomGame {
	constructor(room, staffHost, hosts, gameType, questions, parentGame) {
		super(room);

		this.allowRenames = true;
		this.gameType = gameType;
		this.playerCap = Infinity;

		this.state = 'signups';
		this.joinedIps = [];

		this.startTime = Date.now();
		this.questions = [];
		this.completed = [];

		this.leftHunt = {};

		this.parentGame = parentGame || null;

		this.hosts = hosts;

		this.staffHostId = staffHost.userid;
		this.staffHostName = staffHost.name;
		this.cacheUserIps(staffHost); // store it in case of host subbing

		this.gameid = 'scavengerhunt';
		this.title = 'Scavenger Hunt';
		this.scavGame = true;

		this.onLoad(questions);
	}

	// alert new users that are joining the room about the current hunt.
	onConnect(user, connection) {
		// send the fact that a hunt is currently going on.
		connection.sendTo(this.room, `|raw|<div class="broadcast-blue"><strong>${['official', 'unrated'].includes(this.gameType) ? 'An' : 'A'} ${this.gameType} Scavenger Hunt by <em>${Chat.escapeHTML(Chat.toListString(this.hosts.map(h => h.name)))}</em> has been started${(this.hosts.some(h => h.userid === this.staffHostId) ? '' : ` by <em>${Chat.escapeHTML(this.staffHostName)}</em>`)}.<br />The first hint is: ${Chat.formatText(this.questions[0].hint)}</strong></div>`);
	}

	joinGame(user) {
		if (this.hosts.some(h => h.userid === user.userid) || user.userid === this.staffHostId) return user.sendTo(this.room, "You cannot join your own hunt! If you wish to view your questions, use /viewhunt instead!");
		if (Object.keys(user.ips).some(ip => this.joinedIps.includes(ip))) return user.sendTo(this.room, "You already have one alt in the hunt.");
		if (this.addPlayer(user)) {
			this.cacheUserIps(user);
			delete this.leftHunt[user.userid];
			user.sendTo("You joined the scavenger hunt! Use the command /scavenge to answer.");
			this.onSendQuestion(user);
			return true;
		}
		user.sendTo(this.room, "You have already joined the hunt.");
		return false;
	}

	cacheUserIps(user) {
		// limit to 1 IP in every game.
		if (!user.ips) return; // ghost user object cached from queue
		for (let ip in user.ips) {
			this.joinedIps.push(ip);
		}
	}

	leaveGame(user) {
		let player = this.players[user.userid];

		if (!player) return user.sendTo(this.room, "You have not joined the scavenger hunt.");
		if (player.completed) return user.sendTo(this.room, "You have already completed this scavenger hunt.");

		this.joinedIps = this.joinedIps.filter(ip => !player.joinIps.includes(ip));
		this.removePlayer(user);
		this.leftHunt[user.userid] = 1;
		user.sendTo(this.room, "You have left the scavenger hunt.");
	}

	// overwrite the default makePlayer so it makes a ScavengerHuntPlayer instead.
	makePlayer(user) {
		return new ScavengerHuntPlayer(user, this);
	}

	onLoad(q) {
		for (let i = 0; i < q.length; i += 2) {
			let hint = q[i];
			let answer = q[i + 1];

			this.questions.push({hint: hint, answer: answer});
		}

		this.announce(`A new ${this.gameType} Scavenger Hunt by <em>${Chat.escapeHTML(Chat.toListString(this.hosts.map(h => h.name)))}</em> has been started${(this.hosts.some(h => h.userid === this.staffHostId) ? '' : ` by <em>${Chat.escapeHTML(this.staffHostName)}</em>`)}.<br />The first hint is: ${Chat.formatText(this.questions[0].hint)}`);
	}

	onEditQuestion(number, question_answer, value) {
		if (question_answer === 'question') question_answer = 'hint';
		if (!['hint', 'answer'].includes(question_answer)) return false;

		if (question_answer === 'answer') {
			if (value.includes(',')) return false;
			value = value.split(';').map(p => p.trim());
		}

		if (!number || number < 1 || number > this.questions.length || !value) return false;

		number--; // indexOf starts at 0

		this.questions[number][question_answer] = value;
		this.announce(`The ${question_answer} for question ${number + 1} has been edited.`);
		if (question_answer === 'hint') {
			for (let p in this.players) {
				this.players[p].onNotifyChange(number);
			}
		}
		return true;
	}

	setTimer(minutes) {
		minutes = Number(minutes);

		if (this.timer) {
			clearTimeout(this.timer);
			delete this.timer;
			this.timerEnd = null;
		}

		if (minutes && minutes > 0) {
			this.timer = setTimeout(() => this.onEnd(), minutes * 60000);
			this.timerEnd = Date.now() + minutes * 60000;
		}

		return minutes || 'off';
	}

	onSubmit(user, value) {
		if (!(user.userid in this.players)) {
			if (!this.parentGame && !this.joinGame(user)) return false;
			if (this.parentGame && !this.parentGame.joinGame(user)) return false;
		}
		value = toId(value);

		let player = this.players[user.userid];
		if (player.completed) return false;

		this.validatePlayer(player);

		if (player.verifyAnswer(value)) {
			player.sendRoom("Congratulations! You have gotten the correct answer.");
			player.currentQuestion++;
			if (player.currentQuestion === this.questions.length) {
				this.onComplete(player);
			} else {
				this.onSendQuestion(user);
			}
		} else {
			player.sendRoom("That is not the answer - try again!");
		}
	}

	onSendQuestion(user) {
		if (!(user.userid in this.players) || this.hosts.some(h => h.userid === user.userid)) return false;

		let player = this.players[user.userid];
		if (player.completed) return false;

		let current = player.getCurrentQuestion();

		player.sendRoom(`|raw|You are on ${(current.number === this.questions.length ? "final " : "")}hint #${current.number}: ${Chat.formatText(current.question.hint)}`);
		return true;
	}

	onViewHunt(user) {
		let qLimit = 0;
		if (this.hosts.some(h => h.userid === user.userid) || user.userid === this.staffHostId)	{
			qLimit = this.questions.length;
		} else if (user.userid in this.players) {
			let player = this.players[user.userid];
			qLimit = player.currentQuestion;
		}

		user.sendTo(this.room, `|raw|<div class="ladder"><table style="width: 100%"><tr><th style="width: 10%;">#</th><th>Hint</th><th>Answer</th></tr>${(qLimit ? this.questions.slice(0, qLimit).map((q, i) => `<tr><td>${(i + 1)}</td><td>${Chat.formatText(q.hint)}</td><td>${Chat.escapeHTML(q.answer.join(' / '))}</td></tr>`).join("") : '<tr><td colspan="3">You have not completed any of the questions yet!</td></tr>')}</table><div>`);
	}

	onComplete(player) {
		if (player.completed) return false;

		let now = Date.now();
		let time = Chat.toDurationString(now - this.startTime, {hhmmss: true});

		let blitz = (((this.room.blitzPoints && this.room.blitzPoints[this.gameType]) || DEFAULT_BLITZ_POINTS[this.gameType]) && now - this.startTime <= 60000);

		player.completed = true;
		this.completed.push({name: player.name, time: time, blitz: blitz});
		let place = formatOrder(this.completed.length);

		this.announce(`<em>${Chat.escapeHTML(player.name)}</em> has finished the hunt in ${place} place! (${time}${(blitz ? " - BLITZ" : "")})`);
		if (this.parentGame) this.parentGame.onCompleteEvent(player);
		player.destroy(); // remove from user.games;
	}

	onEnd(reset, endedBy) {
		if (this.parentGame) this.parentGame.onBeforeEndHunt();
		if (!endedBy && (this.preCompleted ? this.preCompleted.length : this.completed.length) === 0) {
			reset = true;
		}
		if (!reset) {
			// give points for winning and blitzes in official games

			const winPoints = (this.room.winPoints && this.room.winPoints[this.gameType]) || DEFAULT_POINTS[this.gameType];
			const blitzPoints = (this.room.blitzPoints && this.room.blitzPoints[this.gameType]) || DEFAULT_BLITZ_POINTS[this.gameType];
			// only regular hunts give host points
			let hostPoints;
			if (this.gameType === 'regular') {
				hostPoints = this.room.hasOwnProperty('hostPoints') ? this.room.hostPoints : DEFAULT_HOST_POINTS;
			}

			let didSomething = false;
			if (winPoints || blitzPoints) {
				for (const [i, completed] of this.completed.entries()) {
					if (!completed.blitz && i >= winPoints.length) break; // there won't be any more need to keep going
					let name = completed.name;
					if (winPoints[i]) Leaderboard.addPoints(name, 'points', winPoints[i]);
					if (blitzPoints && completed.blitz) Leaderboard.addPoints(name, 'points', blitzPoints);
				}
				didSomething = true;
			}
			if (hostPoints) {
				if (this.hosts.length === 1) {
					Leaderboard.addPoints(this.hosts[0].name, 'points', hostPoints, this.hosts[0].noUpdate);
					didSomething = true;
				} else {
					this.room.sendMods('|notify|A scavenger hunt with multiple hosts needs points!');
					this.room.sendMods('(A scavenger hunt with multiple hosts has ended.)');
				}
			}
			if (didSomething) Leaderboard.write();

			let sliceIndex = this.gameType === 'official' ? 5 : 3;

			this.announce(
				`The ${this.gameType ? `${this.gameType} ` : ""}scavenger hunt was ended ${(endedBy ? "by " + Chat.escapeHTML(endedBy.name) : "automatically")}.<br />` +
				`${this.completed.slice(0, sliceIndex).map((p, i) => `${formatOrder(i + 1)} place: <em>${Chat.escapeHTML(p.name)}</em> <span style="color: lightgreen;">[${p.time}]</span>.<br />`).join("")}${this.completed.length > sliceIndex ? `Consolation Prize: ${this.completed.slice(sliceIndex).map(e => `<em>${Chat.escapeHTML(e.name)}</em> <span style="color: lightgreen;">[${e.time}]</span>`).join(', ')}<br />` : ''}<br />` +
				`<details style="cursor: pointer;"><summary>Solution: </summary><br />${this.questions.map((q, i) => `${i + 1}) ${Chat.formatText(q.hint)} <span style="color: lightgreen">[<em>${Chat.escapeHTML(q.answer.join(' / '))}</em>]</span>`).join("<br />")}</details>`
			);

			if (this.parentGame) this.parentGame.onEndEvent();

			this.onTallyLeaderboard();

			this.tryRunQueue(this.room.id);
		} else if (endedBy) {
			this.announce(`The scavenger hunt has been reset by ${endedBy.name}.`);
		} else {
			this.announce("The hunt has been reset automatically, due to the lack of finishers.");
			if (this.parentGame) this.parentGame.onEndEvent();
			this.tryRunQueue(this.room.id);
		}
		if (this.parentGame) this.parentGame.onAfterEndHunt();
		this.destroy();
	}

	onTallyLeaderboard() {
		// update player leaderboard with the statistics
		for (let p in this.players) {
			let player = this.players[p];
			PlayerLeaderboard.addPoints(player.name, 'join', 1);
			if (player.completed) PlayerLeaderboard.addPoints(player.name, 'finish', 1);
		}
		for (let id in this.leftHunt) {
			if (id in this.players) continue; // this should never happen, but just in case;

			PlayerLeaderboard.addPoints(id, 'join', 1, true);
		}
		if (this.gameType !== 'practice') {
			for (const host of this.hosts) {
				HostLeaderboard.addPoints(host.name, 'points', 1, host.noUpdate).write();
			}
		}
		PlayerLeaderboard.write();
	}

	tryRunQueue(roomid) {
		if (this.parentGame || this.room.scavQueueDisabled) return; // don't run the queue for child games.
		// prepare the next queue'd game
		if (this.room.scavQueue && this.room.scavQueue.length) {
			setTimeout(() => {
				let room = Rooms(roomid);
				if (!room || room.game || !room.scavQueue.length) return;

				let next = room.scavQueue.shift();
				let duration = room.defaultScavTimer || DEFAULT_TIMER_DURATION;
				room.game = new ScavengerHunt(room, {userid: next.staffHostId, name: next.staffHostName}, next.hosts, 'regular', next.questions);
				room.game.setTimer(duration); // auto timer for queue'd games.

				room.add(`|c|~|[ScavengerManager] A scavenger hunt by ${Chat.toListString(next.hosts.map(h => h.name))} has been automatically started. It will automatically end in ${duration} minutes.`).update(); // highlight the users with "hunt by"

				// update the saved queue.
				if (room.chatRoomData) {
					room.chatRoomData.scavQueue = room.scavQueue;
					Rooms.global.writeChatRoomData();
				}
			}, 2 * 60000); // 2 minute cooldown
		}
	}

	// modify destroy to get rid of any timers in the current roomgame.
	destroy() {
		if (this.timer) {
			clearTimeout(this.timer);
		}
		for (let i in this.players) {
			this.players[i].destroy();
		}
		// destroy this game
		if (this.parentGame) {
			this.parentGame.onDestroyEvent();
		} else {
			delete this.room.game;
			this.room = null;
		}
	}

	announce(msg) {
		this.room.add(`|raw|<div class="broadcast-blue"><strong>${msg}</strong></div>`).update();
	}

	validatePlayer(player) {
		if (player.infracted) return false;
		if (this.hosts.some(h => h.userid === player.userid) || player.userid === this.staffHostId) {
			// someone joining on an alt then going back to their original userid
			player.sendRoom("You have been caught for doing your own hunt; staff has been notified.");

			// notify staff
			let staffMsg = `(${player.name} has been caught trying to do their own hunt.)`;
			let logMsg = `([${player.userid}] has been caught trying to do their own hunt.)`;
			this.room.sendMods(staffMsg);
			this.room.roomlog(staffMsg);
			this.room.modlog(`(${this.room.id}) ${logMsg}`);

			PlayerLeaderboard.addPoints(player.name, 'infraction', 1);
			player.infracted = true;
		}

		let uniqueConnections = this.getUniqueConnections(Users(player.userid));
		if (uniqueConnections > 1 && this.room.scavmod && this.room.scavmod.ipcheck) {
			// multiple users on one alt
			player.sendRoom("You have been caught for attempting a hunt with multiple connections on your account.  Staff has been notified.");

			// notify staff
			let staffMsg = `(${player.name} has been caught attempting a hunt with ${uniqueConnections} connections on the account. The user has also been given 1 infraction point on the player leaderboard.)`;
			let logMsg = `([${player.userid}] has been caught attempting a hunt with ${uniqueConnections} connections on the account. The user has also been given 1 infraction point on the player leaderboard.)`;

			this.room.sendMods(staffMsg);
			this.room.roomlog(staffMsg);
			this.room.modlog(`(${this.room.id}) ${logMsg}`);

			PlayerLeaderboard.addPoints(player.name, 'infraction', 1);
			player.infracted = true;
		}
	}

	eliminate(userid) {
		if (!(userid in this.players)) return false;
		let player = this.players[userid];

		if (player.completed) return true; // do not remove players that have completed - they should still get to see the answers

		player.destroy();
		delete this.players[userid];
		return true;
	}

	onUpdateConnection() {}

	onChatMessage(msg) {
		let msgId = toId(msg);

		let commandMatch = msg.match(SCAVENGE_REGEX);
		if (commandMatch) msgId = msgId.slice(toId(commandMatch[0]).length);

		let filtered = this.questions.some(q => {
			return q.answer.some(a => {
				a = toId(a);
				let md = Math.ceil((a.length - 5) / FILTER_LENIENCY);
				if (Dex.levenshtein(msgId, a, md) <= md) return true;
				return false;
			});
		});

		if (filtered) return "Please do not leak the answer. Use /scavenge [guess] to submit your guess instead.";
	}

	hasFinished(user) {
		return this.players[user.userid] && this.players[user.userid].completed;
	}

	getUniqueConnections(user) {
		let ips = user.connections.map(c => c.ip);
		return ips.filter((ip, index) => ips.indexOf(ip) === index).length;
	}

	static parseHosts(hostsArray, room, allowOffline) {
		let hosts = hostsArray.map(u => {
			let id = toId(u);
			let user = Users.getExact(id);
			if (!allowOffline && (!user || !user.connected || !(user.userid in room.users))) return null;

			if (!user) return {name: id, userid: id, noUpdate: true}; // simply stick the ID's in there - dont keep any benign symbols passed by the hunt maker

			return {userid: '' + user.userid, name: '' + user.name};
		});
		if (!hosts.every(host => host)) return null;
		return hosts;
	}

	static parseQuestions(questionArray) {
		if (questionArray.length % 2 === 1) return {err: "Your final question is missing an answer"};
		if (questionArray.length < 6) return {err: "You must have at least 3 hints and answers"};

		for (let [i, question] of questionArray.entries()) {
			if (i % 2) {
				question = question.split(';').map(p => p.trim());
				questionArray[i] = question;
				if (!question.length || question.some(a => !toId(a))) return {err: "Empty answer - only alphanumeric characters will count in answers."};
			} else {
				question = question.trim();
				questionArray[i] = question;
				if (!question) return {err: "Empty question."};
			}
		}

		return {result: questionArray};
	}
}

class ScavengerHuntPlayer extends Rooms.RoomGamePlayer {
	constructor(user, game) {
		super(user, game);

		this.joinIps = Object.keys(user.ips);

		this.currentQuestion = 0;
		this.completed = false;
	}

	getCurrentQuestion() {
		return {
			question: this.game.questions[this.currentQuestion],
			number: this.currentQuestion + 1,
		};
	}

	verifyAnswer(value) {
		let answer = this.getCurrentQuestion().question.answer;
		value = toId(value);

		return answer.some(a => toId(a) === value);
	}

	onNotifyChange(num) {
		if (num === this.currentQuestion) {
			this.sendRoom(`|raw|<strong>The hint has been changed to:</strong> ${Chat.formatText(this.game.questions[num].hint)}`);
		}
	}

	destroy() {
		let user = Users.getExact(this.userid);
		if (user && !this.game.parentGame) {
			user.games.delete(this.game.id);
			user.updateSearch();
		}
	}
}

let commands = {
	/**
	 * Player commands
	 */
	""() {
		this.parse("/join scavengers");
	},

	guess(target, room, user) {
		if (!room.game || !room.game.scavGame) return this.errorReply("There is no scavenger game currently running.");
		if (!this.canTalk()) return this.errorReply("You cannot participate in the scavenger hunt when you are unable to talk.");

		room.game.onSubmit(user, target);
	},

	join(target, room, user) {
		if (!room.game || !room.game.scavGame) return this.errorReply("There is no scavenger game currently running.");
		if (!this.canTalk()) return this.errorReply("You cannot join the scavenger hunt when you are unable to talk.");

		room.game.joinGame(user);
	},

	leave(target, room, user) {
		if (!room.game || !room.game.scavGame) return this.errorReply("There is no scavenger game currently running.");
		room.game.leaveGame(user);
	},

	/**
	 * Scavenger Games
	 * --------------
	 * Individual game commands for each Scavenger Game
	 */
	game: 'games',
	games: {
		knockoutgames: 'kogames',
		kogames(target, room, user) {
			if (room.id !== 'scavengers' && !(room.parent && room.parent.id === 'scavengers')) return this.errorReply("Scavenger games can only be created in the scavengers room.");
			if (!this.can('mute', null, room)) return false;
			if (room.game) return this.errorReply(`There is already a game in this room - ${room.game.title}.`);

			room.game = new ScavengerGames.KOGame(room);
			room.game.announce("A new Knockout Games has been started!");
		},

		jumpstart: {
			""(target, room, user) {
				if (room.id !== 'scavengers' && !(room.parent && room.parent.id === 'scavengers')) return this.errorReply("Scavenger games can only be created in the scavengers room.");
				if (!this.can('mute', null, room)) return false;
				if (room.game) return this.errorReply(`There is already a game in this room - ${room.game.title}.`);

				room.game = new ScavengerGames.JumpStart(room);
				room.game.announce("A new Jump Start game has been started!");
				this.sendReply('Please use /starthunt to set the first hunt.');
			},

			set(target, room, user) {
				if (!this.can('mute', null, room)) return false;
				if (!room.game || room.game.gameid !== "jumpstart") return this.errorReply("There is no Jump Start game currently running.");

				let error = room.game.setJumpStart(target.split(','));
				if (error) return this.errorReply(error);
			},
		},

		scav: 'scavengergames',
		scavengergames(target, room, user) {
			if (room.id !== 'scavengers' && !(room.parent && room.parent.id === 'scavengers')) return this.errorReply("Scavenger games can only be created in the scavengers room.");
			if (!this.can('mute', null, room)) return false;
			if (room.game) return this.errorReply(`There is already a game in this room - ${room.game.title}.`);

			room.game = new ScavengerGames.ScavengerGames(room);
			room.game.announce("A new Scavenger Games has been started!");
		},

		pointrally(target, room, user) {
			if (room.id !== 'scavengers' && !(room.parent && room.parent.id === 'scavengers')) return this.errorReply("Scavenger games can only be created in the scavengers room.");
			if (!this.can('mute', null, room)) return false;
			if (room.game) return this.errorReply(`There is already a game in this room - ${room.game.title}.`);

			room.game = new ScavengerGames.PointRally(room);
			room.game.announce("A new Point Rally game has been started!");
		},

		incog: 'incognito',
		incognitomode: 'incognito',
		incognito(target, room, user) {
			if (room.id !== 'scavengers' && !(room.parent && room.parent.id === 'scavengers')) return this.errorReply("Scavenger games can only be created in the scavengers room.");
			if (!this.can('mute', null, room)) return false;
			if (room.game) return this.errorReply(`There is already a game in this room - ${room.game.title}.`);

			let [details, hostsArray, ...params] = target.split('|'), blind, official;
			details = details.split(' ').map(toId);
			if (details.includes('blind')) blind = true;
			let gameType = 'regular';
			if (details.includes('official')) {
				gameType = 'official';
			} else if (details.includes('mini')) {
				gameType = 'mini';
			}

			if (gameType === 'regular' && !blind) {
				params = [hostsArray, ...params];
				hostsArray = details.join(' ');
			}
			if (!hostsArray) return this.errorReply("The user(s) you specified as the host is not online, or is not in the room.");
			let hosts = ScavengerHunt.parseHosts(hostsArray.split(/[,;]/), room, official);
			if (!hosts) return this.errorReply("The user(s) you specified as the host is not online, or is not in the room.");

			params = ScavengerHunt.parseQuestions(params);
			if (params.err) return this.errorReply(params.err);

			room.game = new ScavengerGames.Incognito(room, blind, gameType, user, hosts, params.result);
		},
		/**
		 * General game commands
		 */
		end(target, room, user) {
			if (!this.can('mute', null, room)) return false;
			if (!room.game || !room.game.scavParentGame) return this.errorReply(`There is no scavenger game currently running.`);

			this.privateModAction(`The ${room.game.title} has been forcibly ended by ${user.name}.`);
			this.modlog('SCAVENGER', null, 'ended the hunt');
			room.game.announce(`The ${room.game.title} has been forcibly ended.`);
			room.game.destroy();
		},

		kick(target, room, user) {
			if (!this.can('mute', null, room)) return false;
			if (!room.game || !room.game.scavParentGame) return this.errorReply(`There is no scavenger game currently running.`);

			let targetId = toId(target);
			if (targetId === 'constructor' || !targetId) return this.errorReply("Invalid player.");

			let success = room.game.eliminate(targetId);
			if (success) {
				this.addModAction(`User '${targetId}' has been kicked from the ${room.game.title}.`);
				this.modlog('SCAVENGERS', target, `kicked from the ${room.game.title}`);
			} else {
				this.errorReply(`Unable to kick user '${targetId}'.`);
			}
		},

		points: 'leaderboard',
		score: 'leaderboard',
		scoreboard: 'leaderboard',
		leaderboard(target, room, user) {
			if (!room.game || !room.game.scavParentGame) return this.errorReply(`There is no scavenger game currently running.`);
			if (!room.game.leaderboard) return this.errorReply("This scavenger game does not have a leaderboard.");
			if (!this.runBroadcast()) return false;

			room.game.leaderboard.htmlLadder().then(html => {
				this.sendReply(`|raw|${html}`);
				if (this.broadcasting) setImmediate(() => room.update()); // make sure the room updates for broadcasting since this is async.
			});
		},

		rank(target, room, user) {
			if (!room.game || !room.game.scavParentGame) return this.errorReply(`There is no scavenger game currently running.`);
			if (!room.game.leaderboard) return this.errorReply("This scavenger game does not have a leaderboard.");
			if (!this.runBroadcast()) return false;

			let targetId = toId(target) || user.userid;

			room.game.leaderboard.visualize('points', targetId).then(rank => {
				if (!rank) return this.sendReplyBox(`User '${targetId}' does not have any points on the scavenger games leaderboard.`);

				this.sendReplyBox(`User '${Chat.escapeHTML(rank.name)}' is #${rank.rank} on the scavenger games leaderboard with ${rank.points} points.`);
			});
		},
	},

	/**
	 * Creation / Moderation commands
	 */
	createpractice: 'create',
	createofficial: 'create',
	createunrated: 'create',
	createmini: 'create',
	create(target, room, user, connection, cmd) {
		if (room.id !== 'scavengers' && !(room.parent && room.parent.id === 'scavengers')) return this.errorReply("Scavenger hunts can only be created in the scavengers room.");
		if (!this.can('mute', null, room)) return false;
		if (room.game && !room.game.scavParentGame) return this.errorReply(`There is already a game in this room - ${room.game.title}.`);
		let gameType = 'regular';
		if (cmd.includes('practice')) {
			gameType = 'practice';
		} else if (cmd.includes('official')) {
			gameType = 'official';
		} else if (cmd.includes('mini')) {
			gameType = 'mini';
		} else if (cmd.includes('unrated')) {
			gameType = 'unrated';
		}
		if (gameType === 'regular' && room.scavQueue && room.scavQueue.length && !(room.game && room.scavParentGame)) return this.errorReply("There are currently hunts in the queue! If you would like to start the hunt anyways, use /forcestarthunt.");

		let [hostsArray, ...params] = target.split('|');
		let hosts = ScavengerHunt.parseHosts(hostsArray.split(/[,;]/), room, gameType === 'official');
		if (!hosts) return this.errorReply("The user(s) you specified as the host is not online, or is not in the room.");

		params = ScavengerHunt.parseQuestions(params);
		if (params.err) return this.errorReply(params.err);

		if (room.game && room.game.scavParentGame) {
			let success = room.game.createHunt(room, user, hosts, gameType, params.result);
			if (!success) return;
		} else {
			room.game = new ScavengerHunt(room, user, hosts, gameType, params.result);
		}
		this.privateModAction(`(A new scavenger hunt was created by ${user.name}.)`);
		this.modlog('SCAV NEW', null, `${gameType.toUpperCase()}: creators - ${hosts.map(h => h.userid)}`);
	},

	status(target, room, user) {
		if (!room.game || !room.game.scavGame) return this.errorReply(`There is no scavenger game currently running.`);

		let game = room.game.childGame || room.game;
		if (!('questions' in game)) return this.errorReply('There is currently no hunt going on.');

		const elapsedMsg = Chat.toDurationString(Date.now() - game.startTime, {hhmmss: true});
		const gameTypeMsg = game.gameType ? `<em>${game.gameType}</em> ` : '';
		const hostersMsg = Chat.toListString(game.hosts.map(h => h.name));
		const hostMsg = game.hosts.some(h => h.userid === game.staffHostId) ? '' : Chat.html` (started by - ${game.staffHostName})`;
		const finishers = Chat.html`${game.completed.map(u => u.name).join(', ')}`;
		const buffer = `<div class="infobox" style="margin-top: 0px;">The current ${gameTypeMsg}scavenger hunt by <em>${hostersMsg}${hostMsg}</em> has been up for: ${elapsedMsg}<br />${!game.timerEnd ? 'The timer is currently off.' : `The hunt ends in: ${Chat.toDurationString(game.timerEnd - Date.now(), {hhmmss: true})}`}<br />Completed (${game.completed.length}): ${finishers}</div>`;

		if (game.hosts.some(h => h.userid === user.userid) || game.staffHostId === user.userid) {
			let str = `<div class="ladder" style="overflow-y: scroll; max-height: 300px;"><table style="width: 100%"><th><b>Question</b></th><th><b>Users on this Question</b></th>`;
			for (let i = 0; i < game.questions.length; i++) {
				let questionNum = i + 1;
				let players = Object.values(game.players).filter(player => player.currentQuestion === i && !player.completed);
				if (!players.length) {
					str += `<tr><td>${questionNum}</td><td>None</td>`;
				} else {
					str += Chat.html`<tr><td>${questionNum}</td><td>${players.map(pl => pl.name).join(", ")}`;
				}
			}
			let completed = game.preCompleted ? game.preCompleted : game.completed;
			str += Chat.html`<tr><td>Completed</td><td>${completed.length ? completed.map(pl => pl.name).join(", ") : 'None'}`;
			return this.sendReply(`|raw|${str}</table></div>${buffer}`);
		}
		this.sendReply(`|raw|${buffer}`);
	},

	hint(target, room, user) {
		if (!room.game || !room.game.scavGame) return this.errorReply(`There is no scavenger game currently running.`);
		if (!room.game.onSendQuestion(user)) this.errorReply("You are not currently participating in the hunt.");
	},

	timer(target, room, user) {
		if (!this.can('mute', null, room)) return false;
		if (!room.game || !room.game.scavGame) return this.errorReply(`There is no scavenger game currently running.`);

		let result = room.game.setTimer(target);
		let message = `The scavenger timer has been ${(result === 'off' ? "turned off" : `set to ${result} minutes`)}`;

		room.add(message + '.');
		this.privateModAction(`(${message} by ${user.name}.)`);
		this.modlog('SCAV TIMER', null, (result === 'off' ? 'OFF' : `${result} minutes`));
	},

	inherit(target, room, user) {
		if (!this.can('mute', null, room)) return false;
		if (!room.game || !room.game.scavGame) return this.errorReply(`There is no scavenger game currently running.`);

		let game = room.game.childGame || room.game;
		if (!('questions' in game)) return this.errorReply('There is currently no hunt going on.');

		if (game.staffHostId === user.userid) return this.errorReply('You already have staff permissions for this hunt.');

		game.staffHostId = '' + user.userid;
		game.staffHostName = '' + user.name;

		// clear user's game progress and prevent user from ever entering again
		game.eliminate(user.userid);
		game.cacheUserIps(user);

		this.privateModAction(`(${user.name} has inherited staff permissions for the current hunt.)`);
		this.modlog('SCAV INHERIT');
	},

	reset(target, room, user) {
		if (!this.can('mute', null, room)) return false;
		if (!room.game || !room.game.scavGame) return this.errorReply(`There is no scavenger game currently running.`);

		room.game.onEnd(true, user);
		this.privateModAction(`(${user.name} has reset the scavenger hunt.)`);
		this.modlog('SCAV RESET');
	},

	forceend: 'end',
	end(target, room, user) {
		if (!this.can('mute', null, room)) return false;
		if (!room.game || !room.game.scavGame) return this.errorReply(`There is no scavenger game currently running.`);
		if (room.game.scavParentGame && !room.game.childGame) return this.parse('/scav games end');

		let game = room.game.childGame || room.game;
		let completed = game.preCompleted ? game.preCompleted : game.completed;

		if (!this.cmd.includes('force')) {
			if (!completed.length) {
				return this.errorReply('No one has finished the hunt yet.  Use /forceendhunt if you want to end the hunt and reveal the answers.');
			}
		} else if (completed.length) {
			return this.errorReply(`This hunt has ${Chat.count(completed, "finishers")}; use /endhunt`);
		}

		room.game.onEnd(null, user);
		this.privateModAction(`(${user.name} has ended the scavenger hunt.)`);
		this.modlog('SCAV END');
	},

	viewhunt(target, room, user) {
		if (!room.game || !room.game.scavGame) return this.errorReply(`There is no scavenger game currently running.`);

		let game = room.game.childGame || room.game;
		if (!('onViewHunt' in game)) return this.errorReply('There is currently no hunt to be viewed.');

		game.onViewHunt(user);
	},

	edithunt(target, room, user) {
		if (!room.game || !room.game.scavGame) return this.errorReply(`There is no scavenger game currently running.`);
		let game = room.game.childGame || room.game;
		if ((!game.hosts.some(h => h.userid === user.userid) || !user.can('broadcast', null, room)) && game.staffHostId !== user.userid) return this.errorReply("You cannot edit the hints and answers if you are not the host.");

		let [question, type, ...value] = target.split(',');
		if (!game.onEditQuestion(parseInt(question), toId(type), value.join(',').trim())) {
			return this.sendReply("/scavengers edithunt [question number], [hint | answer], [value] - edits the current scavenger hunt.");
		}
	},

	kick(target, room, user) {
		if (!room.game || !room.game.scavGame) return this.errorReply(`There is no scavenger game currently running.`);

		let targetId = toId(target);
		if (targetId === 'constructor' || !targetId) return this.errorReply("Invalid player.");

		let game = room.game.childGame || room.game;
		let success = game.eliminate(null, targetId);
		if (success) {
			this.modlog('SCAV KICK', targetId);
			return this.privateModAction(`(${user.name} has kicked '${targetId}' from the scavenger hunt.)`);
		}
		this.errorReply(`Unable to kick '${targetId}' from the scavenger hunt.`);
	},

	/**
	 * Hunt queuing
	 */
	queue(target, room, user) {
		if (room.id !== 'scavengers' && !(room.parent && room.parent.id === 'scavengers')) return this.errorReply("This command can only be used in the scavengers room.");
		if (!target) return commands.viewqueue.call(this, target, room, user);

		if (!this.can('mute', null, room)) return false;

		let [hostsArray, ...params] = target.split('|');
		let hosts = ScavengerHunt.parseHosts(hostsArray.split(/[,;]/), room);
		if (!hosts) return this.errorReply("The user(s) you specified as the host is not online, or is not in the room.");

		params = ScavengerHunt.parseQuestions(params);
		if (params.err) return this.errorReply(params.err);

		if (!room.scavQueue) room.scavQueue = [];

		room.scavQueue.push({hosts: hosts, questions: params.result, staffHostId: user.userid, staffHostName: user.name});
		this.privateModAction(`(${user.name} has added a scavenger hunt to the queue.)`);

		if (room.chatRoomData) {
			room.chatRoomData.scavQueue = room.scavQueue;
			Rooms.global.writeChatRoomData();
		}
	},

	dequeue(target, room, user) {
		if (room.id !== 'scavengers' && !(room.parent && room.parent.id === 'scavengers')) return this.errorReply("This command can only be used in the scavengers room.");
		if (!this.can('mute', null, room)) return false;
		let id = parseInt(target);

		if (!room.scavQueue || isNaN(id) || id < 0 || id >= room.scavQueue.length) return false; // this command should be using the display to manage anyways.

		let removed = room.scavQueue.splice(id, 1)[0];
		this.privateModAction(`(${user.name} has removed a scavenger hunt created by [${removed.hosts.map(u => u.userid).join(", ")}] from the queue.)`);
		this.sendReply(`|uhtmlchange|scav-queue|${formatQueue(room.scavQueue, user, room)}`);

		if (room.chatRoomData) {
			room.chatRoomData.scavQueue = room.scavQueue;
			Rooms.global.writeChatRoomData();
		}
	},

	viewqueue(target, room, user) {
		if (room.id !== 'scavengers' && !(room.parent && room.parent.id === 'scavengers')) return this.errorReply("This command can only be used in the scavengers room.");
		if (!this.runBroadcast()) return false;

		this.sendReply(`|uhtml|scav-queue|${formatQueue(room.scavQueue, user, room, this.broadcasting)}`);
	},

	next(target, room, user) {
		if (room.id !== 'scavengers' && !(room.parent && room.parent.id === 'scavengers')) return this.errorReply("This command can only be used in the scavengers room.");
		if (!this.can('mute', null, room)) return false;

		if (!room.scavQueue || !room.scavQueue.length) return this.errorReply("The scavenger hunt queue is currently empty.");
		if (room.game) return this.errorReply(`There is already a game in this room - ${room.game.title}.`);

		target = parseInt(target) || 0;

		if (!room.scavQueue[target]) return false; // no need for an error reply - this is done via UI anyways

		let next = room.scavQueue.splice(target, 1)[0]; // returns [ hunt ]
		room.game = new ScavengerHunt(room, {userid: next.staffHostId, name: next.staffHostName}, next.hosts, 'regular', next.questions);

		if (target) this.sendReply(`|uhtmlchange|scav-queue|${formatQueue(room.scavQueue, user, room)}`);
		this.modlog('SCAV NEW', null, `from queue: creators - ${next.hosts.map(h => h.userid)}`);

		// update the saved queue.
		if (room.chatRoomData) {
			room.chatRoomData.scavQueue = room.scavQueue;
			Rooms.global.writeChatRoomData();
		}
	},

	enablequeue: 'disablequeue',
	disablequeue(target, room, user) {
		if (room.id !== 'scavengers' && !(room.parent && room.parent.id === 'scavengers')) return this.errorReply("This command can only be used in the scavengers room.");
		if (!this.can('mute', null, room)) return;

		const state = this.cmd === 'disablequeue';
		if ((room.scavQueueDisabled || false) === state) return this.errorReply(`The queue is already ${state ? 'disabled' : 'enabled'}.`);

		room.scavQueueDisabled = state;
		if (room.chatRoomData) {
			room.chatRoomData.scavQueueDisabled = room.scavQueueDisabled;
			Rooms.global.writeChatRoomData();
		}
		this.sendReply(`|uhtmlchange|scav-queue|${formatQueue(room.scavQueue, user, room)}`);
		this.privateModAction(`(The queue has been ${state ? 'disabled' : 'enabled'} by ${user.name}.)`);
		this.modlog('SCAV QUEUE', null, (state ? 'disabled' : 'enabled'));
	},

	defaulttimer(target, room, user) {
		if (room.id !== 'scavengers' && !(room.parent && room.parent.id === 'scavengers')) return this.errorReply("This command can only be used in the scavengers room.");
		if (!this.can('declare', null, room)) return;

		if (!target) return this.sendReply(`The default scavenger timer is currently set at: ${room.defaultScavTimer || DEFAULT_TIMER_DURATION} minutes.`);
		const duration = parseInt(target);

		if (!duration || duration < 0) return this.errorReply('The default timer must be an integer greater than zero, in minutes.');

		room.defaultScavTimer = duration;
		if (room.chatRoomData) {
			room.chatRoomData.defaultScavTimer = room.defaultScavTimer;
			Rooms.global.writeChatRoomData();
		}
		this.privateModAction(`(The default scavenger timer has been set to ${duration} minutes by ${user.name}.)`);
		this.modlog('SCAV DEFAULT TIMER', null, `${duration} minutes`);
	},

	/**
	 * Leaderboard Commands
	 */
	addpoints(target, room, user) {
		if (room.id !== 'scavengers') return this.errorReply("This command can only be used in the scavengers room.");
		if (!this.can('mute', null, room)) return false;

		let [targetId, points] = target.split(',');
		targetId = toId(targetId);
		points = parseInt(points);

		if (!targetId || targetId === 'constructor' || targetId.length > 18) return this.errorReply("Invalid username.");
		if (!points || points < 0 || points > 1000) return this.errorReply("Points must be an integer between 1 and 1000.");

		Leaderboard.addPoints(targetId, 'points', points, true).write();

		this.privateModAction(`(${targetId} was given ${points} points on the monthly scavengers ladder by ${user.name}.)`);
		this.modlog('SCAV ADDPOINTS', targetId, points);
	},

	removepoints(target, room, user) {
		if (room.id !== 'scavengers') return this.errorReply("This command can only be used in the scavengers room.");
		if (!this.can('mute', null, room)) return false;

		let [targetId, points] = target.split(',');
		targetId = toId(targetId);
		points = parseInt(points);

		if (!targetId || targetId === 'constructor' || targetId.length > 18) return this.errorReply("Invalid username.");
		if (!points || points < 0 || points > 1000) return this.errorReply("Points must be an integer between 1 and 1000.");

		Leaderboard.addPoints(targetId, 'points', -points, true).write();

		this.privateModAction(`(${user.name} has taken ${points} points from ${targetId} on the monthly scavengers ladder.)`);
		this.modlog('SCAV REMOVEPOINTS', targetId, points);
	},

	resetladder(target, room, user) {
		if (room.id !== 'scavengers') return this.errorReply("This command can only be used in the scavengers room.");
		if (!this.can('declare', null, room)) return false;

		Leaderboard.reset().write();

		this.privateModAction(`(${user.name} has reset the monthly scavengers ladder.)`);
		this.modlog('SCAV RESETLADDER');
	},
	top: 'ladder',
	ladder(target, room, user) {
		if (room.id !== 'scavengers' && !(room.parent && room.parent.id === 'scavengers')) return this.errorReply("This command can only be used in the scavengers room.");
		if (!this.runBroadcast()) return false;

		const isChange = (!this.broadcasting && target);
		const hideStaff = (!this.broadcasting && this.meansNo(target));

		Leaderboard.visualize('points').then(ladder => {
			this.sendReply(`|uhtml${isChange ? 'change' : ''}|scavladder|<div class="ladder" style="overflow-y: scroll; max-height: 300px;"><table style="width: 100%"><tr><th>Rank</th><th>Name</th><th>Points</th></tr>${ladder.map(entry => {
				let isStaff = room.auth && room.auth[toId(entry.name)];
				if (isStaff && hideStaff) return '';
				return `<tr><td>${entry.rank}</td><td>${(isStaff ? `<em>${Chat.escapeHTML(entry.name)}</em>` : (entry.rank <= 5 ? `<strong>${Chat.escapeHTML(entry.name)}</strong>` : Chat.escapeHTML(entry.name)))}</td><td>${entry.points}</td></tr>`;
			}).join('')}</table></div><div style="text-align: center"><button class="button" name="send" value="/scav top ${hideStaff ? 'yes' : 'no'}">${hideStaff ? "Show" : "Hide"} Auth</button></div>`);
			if (this.broadcasting) setImmediate(() => room.update()); // make sure the room updates for broadcasting since this is async.
		});
	},

	rank(target, room, user) {
		if (room.id !== 'scavengers' && !(room.parent && room.parent.id === 'scavengers')) return this.errorReply("This command can only be used in the scavengers room.");
		if (!this.runBroadcast()) return false;

		let targetId = toId(target) || user.userid;

		Leaderboard.visualize('points', targetId).then(rank => {
			if (!rank) return this.sendReplyBox(`User '${targetId}' does not have any points on the scavengers leaderboard.`);

			this.sendReplyBox(`User '${Chat.escapeHTML(rank.name)}' is #${rank.rank} on the scavengers leaderboard with ${rank.points} points.`);
			if (this.broadcasting) setImmediate(() => room.update()); // make sure the room updates for broadcasting since this is async.
		});
	},

	/**
	 * Leaderboard Point Distribution Editing
	 */
	setblitz(target, room, user) {
		if (room.id !== 'scavengers' && !(room.parent && room.parent.id === 'scavengers')) return this.errorReply("This command can only be used in the scavengers room.");
		if (!this.can('mute', null, room)) return false; // perms for viewing only

		if (!target) {
			let points = [];
			const source = Object.entries(Object.assign(DEFAULT_BLITZ_POINTS, room.blitzPoints || {}));
			for (const entry of source) {
				points.push(`${entry[0]}: ${entry[1]}`);
			}
			return this.sendReplyBox(`The points rewarded for winning hunts within a minute is:<br />${points.join('<br />')}`);
		}

		if (!this.can('declare', null, room)) return false; // perms for editing

		let [type, blitzPoints] = target.split(',');
		blitzPoints = parseInt(blitzPoints);
		type = toId(type);
		if (!RATED_TYPES.includes(type)) return this.errorReply(`You cannot set blitz points for ${type} hunts.`);

		if (isNaN(blitzPoints) || blitzPoints < 0 || blitzPoints > 1000) return this.errorReply("The points value awarded for blitz must be an integer bewteen 0 and 1000.");
		if (!room.blitzPoints) room.blitzPoints = {};
		room.blitzPoints[type] = blitzPoints;

		if (room.chatRoomData) {
			room.chatRoomData.blitzPoints = room.blitzPoints;
			Rooms.global.writeChatRoomData();
		}
		this.privateModAction(`(${user.name} has set the points awarded for blitz for ${type} hunts to ${blitzPoints}.)`);
		this.modlog('SCAV BLITZ', null, `${type}: ${blitzPoints}`);

		// double modnote in scavs room if it is a subroomgroupchat
		if (room.parent && !room.chatRoomData) {
			scavsRoom.modlog(`(scavengers) SCAV BLITZ: by ${user.userid}: ${type}: ${blitzPoints}`);
			scavsRoom.sendMods(`(${user.name} has set the points awarded for blitz for ${type} hunts to ${blitzPoints} in <<${room.id}>>.)`);
			scavsRoom.roomlog(`(${user.name} has set the points awarded for blitz for ${type} hunts to ${blitzPoints} in <<${room.id}>>.)`);
		}
	},

	sethostpoints(target, room, user) {
		if (room.id !== 'scavengers' && !(room.parent && room.parent.id === 'scavengers')) return this.errorReply("This command can only be used in the scavengers room.");
		if (!this.can('mute', null, room)) return false; // perms for viewing only
		if (!target) return this.sendReply(`The points rewarded for hosting a regular hunt are ${room.hasOwnProperty('hostPoints') ? room.hostPoints : DEFAULT_HOST_POINTS}`);

		if (!this.can('declare', null, room)) return false; // perms for editting
		const points = parseInt(target);
		if (isNaN(points)) return this.errorReply(`${target} is not a valid number of points.`);
		room.hostPoints = points;
		if (room.chatRoomData) {
			room.chatRoomData.hostPoints = room.hostPoints;
			Rooms.global.writeChatRoomData();
		}
		this.privateModAction(`(${user.name} has set the points awarded for hosting regular scavenger hunts to ${points})`);
		this.modlog('SCAV SETHOSTPOINTS', null, points);

		// double modnote in scavs room if it is a subroomgroupchat
		if (room.parent && !room.chatRoomData) {
			scavsRoom.modlog(`(scavengers) SCAV SETHOSTPOINTS: [room: ${room.id}] by ${user.userid}: ${points}`);
			scavsRoom.sendMods(`(${user.name} has set the points awarded for hosting regular scavenger hunts to - ${points} in <<${room.id}>>)`);
			scavsRoom.roomlog(`(${user.name} has set the points awarded for hosting regular scavenger hunts to - ${points} in <<${room.id}>>)`);
		}
	},
	setpoints(target, room, user) {
		if (room.id !== 'scavengers' && !(room.parent && room.parent.id === 'scavengers')) return this.errorReply("This command can only be used in the scavengers room.");
		if (!this.can('mute', null, room)) return false; // perms for viewing only

		if (!target) {
			let points = [];
			const source = Object.entries(Object.assign({}, DEFAULT_POINTS, room.winPoints || {}));
			for (const entry of source) {
				points.push(`${entry[0]}: ${entry[1].map((p, i) => `(${(i + 1)}) ${p}`).join(', ')}`);
			}
			return this.sendReplyBox(`The points rewarded for winning hunts is:<br />${points.join('<br />')}`);
		}

		if (!this.can('declare', null, room)) return false; // perms for editting

		let [type, ...pointsSet] = target.split(',');
		type = toId(type);
		if (!RATED_TYPES.includes(type)) return this.errorReply(`You cannot set win points for ${type} hunts.`);
		let winPoints = pointsSet.map(p => parseInt(p));

		if (winPoints.some(p => isNaN(p) || p < 0 || p > 1000) || !winPoints.length) return this.errorReply("The points value awarded for winning a scavenger hunt must be an integer between 0 and 1000.");

		if (!room.winPoints) room.winPoints = {};
		room.winPoints[type] = winPoints;

		if (room.chatRoomData) {
			room.chatRoomData.winPoints = room.winPoints;
			Rooms.global.writeChatRoomData();
		}
		const pointsDisplay = winPoints.map((p, i) => `(${(i + 1)}) ${p}`).join(', ');
		this.privateModAction(`(${user.name} has set the points awarded for winning ${type} scavenger hunts to - ${pointsDisplay})`);
		this.modlog('SCAV SETPOINTS', null, `${type}: ${pointsDisplay}`);

		// double modnote in scavs room if it is a subroomgroupchat
		if (room.parent && !room.chatRoomData) {
			scavsRoom.modlog(`(scavengers) SCAV SETPOINTS: [room: ${room.id}] by ${user.userid}: ${type}: ${pointsDisplay}`);
			scavsRoom.sendMods(`(${user.name} has set the points awarded for winning ${type} scavenger hunts to - ${pointsDisplay} in <<${room.id}>>)`);
			scavsRoom.roomlog(`(${user.name} has set the points awarded for winning ${type} scavenger hunts to - ${pointsDisplay} in <<${room.id}>>)`);
		}
	},

	/**
	 * Scavenger statistic tracking
	 */
	huntcount: 'huntlogs',
	huntlogs(target, room, user) {
		if (room.id !== 'scavengers') return this.errorReply("This command can only be used in the scavengers room.");
		if (!this.can('mute', null, room)) return false;

		if (target === 'RESET') {
			if (!this.can('declare', null, room)) return false;
			HostLeaderboard.softReset().then(() => {
				HostLeaderboard.write();
				this.privateModAction(`(${user.name} has reset the host log leaderboard into the next month.)`);
				this.modlog('SCAV HUNTLOGS', null, 'RESET');
			});
			return;
		} else if (target === 'HARD RESET') {
			if (!this.can('declare', null, room)) return false;
			HostLeaderboard.hardReset().write();
			this.privateModAction(`(${user.name} has hard reset the host log leaderboard.)`);
			this.modlog('SCAV HUNTLOGS', null, 'HARD RESET');
			return;
		}

		let [sortMethod, isUhtmlChange] = target.split(',');

		const sortingFields = ['points', 'cumulative-points'];

		if (!sortingFields.includes(sortMethod)) sortMethod = 'points'; // default sort method

		HostLeaderboard.visualize(sortMethod).then(data => {
			this.sendReply(`|${isUhtmlChange ? 'uhtmlchange' : 'uhtml'}|scav-huntlogs|<div class="ladder" style="overflow-y: scroll; max-height: 300px;"><table style="width: 100%"><tr><th>Rank</th><th>Name</th><th>Hunts Created</th><th>Total Hunts Created</th><th>History</th></tr>${
				data.map(entry => {
					let userid = toId(entry.name);

					let auth = room.auth && room.auth[userid] ? room.auth[userid] : Users.usergroups[userid] ? Users.usergroups[userid].charAt(0) : '&nbsp;';
					let color = room.auth && userid in room.auth ? 'inherit' : 'gray';

					return `<tr><td>${entry.rank}</td><td><span style="color: ${color}">${auth}</span>${Chat.escapeHTML(entry.name)}</td>` +
						`<td style="text-align: right;">${(entry.points || 0)}</td>` +
						`<td style="text-align: right;">${(entry['cumulative-points'] || 0)}</td>` +
						`<td style="text-align: left;">${entry['history-points'] ? `<span style="color: gray">{ ${entry['history-points'].join(', ')} }</span>` : ''}</td>` +
						`</tr>`;
				}).join('')
			}</table></div><div style="text-align: center">${sortingFields.map(f => `<button class="button${f === sortMethod ? ' disabled' : ''}" name="send" value="/scav huntlogs ${f}, 1">${f}</button>`).join(' ')}</div>`);
		});
	},

	playlogs(target, room, user) {
		if (room.id !== 'scavengers') return this.errorReply("This command can only be used in the scavengers room.");
		if (!this.can('mute', null, room)) return false;

		if (target === 'RESET') {
			if (!this.can('declare', null, room)) return false;
			PlayerLeaderboard.softReset().then(() => {
				PlayerLeaderboard.write();
				this.privateModAction(`(${user.name} has reset the player log leaderboard into the next month.)`);
				this.modlog('SCAV PLAYLOGS', null, 'RESET');
			});
			return;
		} else if (target === 'HARD RESET') {
			if (!this.can('declare', null, room)) return false;
			PlayerLeaderboard.hardReset().write();
			this.privateModAction(`(${user.name} has hard reset the player log leaderboard.)`);
			this.modlog('SCAV PLAYLOGS', null, 'HARD RESET');
			return;
		}

		let [sortMethod, isUhtmlChange] = target.split(',');

		const sortingFields = ['join', 'cumulative-join', 'finish', 'cumulative-finish', 'infraction', 'cumulative-infraction'];

		if (!sortingFields.includes(sortMethod)) sortMethod = 'finish'; // default sort method

		PlayerLeaderboard.visualize(sortMethod).then(raw => {
			new Promise((resolve, reject) => {
				// apply ratio
				raw = raw.map(d => {
					d.ratio = (((d.finish || 0) / (d.join || 1)) * 100).toFixed(2); // always have at least one for join to get a value of 0 if both are 0 or non-existent
					d['cumulative-ratio'] = (((d['cumulative-finish'] || 0) / (d['cumulative-join'] || 1)) * 100).toFixed(2);
					return d;
				});
				resolve(raw);
			}).then(data => {
				this.sendReply(`|${isUhtmlChange ? 'uhtmlchange' : 'uhtml'}|scav-playlogs|<div class="ladder" style="overflow-y: scroll; max-height: 300px;"><table style="width: 100%"><tr><th>Rank</th><th>Name</th><th>Finished Hunts</th><th>Joined Hunts</th><th>Ratio</th><th>Infractions</th></tr>${
					data.map(entry => {
						let userid = toId(entry.name);

						let auth = room.auth && room.auth[userid] ? room.auth[userid] : Users.usergroups[userid] ? Users.usergroups[userid].charAt(0) : '&nbsp;';
						let color = room.auth && userid in room.auth ? 'inherit' : 'gray';

						return `<tr><td>${entry.rank}</td><td><span style="color: ${color}">${auth}</span>${Chat.escapeHTML(entry.name)}</td>` +
							`<td style="text-align: right;">${(entry.finish || 0)} <span style="color: blue">(${(entry['cumulative-finish'] || 0)})</span>${(entry['history-finish'] ? `<br /><span style="color: gray">(History: ${entry['history-finish'].join(', ')})</span>` : '')}</td>` +
							`<td style="text-align: right;">${(entry.join || 0)} <span style="color: blue">(${(entry['cumulative-join'] || 0)})</span>${(entry['history-join'] ? `<br /><span style="color: gray">(History: ${entry['history-join'].join(', ')})</span>` : '')}</td>` +
							`<td style="text-align: right;">${entry.ratio}%<br /><span style="color: blue">(${(entry['cumulative-ratio'] || "0.00")}%)</span></td>` +
							`<td style="text-align: right;">${(entry.infraction || 0)} <span style="color: blue">(${(entry['cumulative-infraction'] || 0)})</span>${(entry['history-infraction'] ? `<br /><span style="color: gray">(History: ${entry['history-infraction'].join(', ')})</span>` : '')}</td>` +
							`</tr>`;
					}).join('')
				}</table></div><div style="text-align: center">${sortingFields.map(f => `<button class="button${f === sortMethod ? ' disabled' : ''}" name="send" value="/scav playlogs ${f}, 1">${f}</button>`).join(' ')}</div>`);
			});
		});
	},

	uninfract: "infract",
	infract(target, room, user) {
		if (room.id !== 'scavengers') return this.errorReply("This command can only be used in the scavengers room.");
		if (!this.can('mute', null, room)) return false;

		let targetId = toId(target);
		if (!targetId) return this.errorReply(`Please include the name of the user to ${this.cmd}.`);
		let change = this.cmd === 'infract' ? 1 : -1;

		PlayerLeaderboard.addPoints(targetId, 'infraction', change, true).write();

		this.privateModAction(`(${user.name} has ${(change > 0 ? 'given' : 'taken')} one infraction point ${(change > 0 ? 'to' : 'from')} '${targetId}'.)`);
		this.modlog(`SCAV ${this.cmd.toUpperCase()}`, user);
	},

	modsettings: {
		'': 'update',
		'update'(target, room, user) {
			if (!this.can('declare', null, room) || room.id !== 'scavengers' && !(room.parent && room.parent.id === 'scavengers')) return false;
			let settings = room.scavmod || {};

			this.sendReply(`|uhtml${this.cmd === 'update' ? 'change' : ''}|scav-modsettings|<div class=infobox><strong>Scavenger Moderation Settings:</strong><br /><br />` +
				`<button name=send value='/scav modsettings ipcheck toggle'><i class="fa fa-power-off"></i></button> Multiple connection verification: ${settings.ipcheck ? 'ON' : 'OFF'}` +
				`</div>`);
		},

		'ipcheck'(target, room, user) {
			if (!this.can('declare', null, room) || room.id !== 'scavengers' && !(room.parent && room.parent.id === 'scavengers')) return false;

			let settings = room.scavmod || {};
			target = toId(target);

			let setting = {
				'on': true,
				'off': false,
				'toggle': !settings.ipcheck,
			};

			if (!(target in setting)) return this.sendReply('Invalid setting - ON, OFF, TOGGLE');

			settings.ipcheck = setting[target];
			room.scavmod = settings;

			if (room.chatRoomData) {
				room.chatRoomData.scavmod = room.scavmod;
				Rooms.global.writeChatRoomData();
			}

			this.privateModAction(`(${user.name} has set multiple connections verification to ${setting[target] ? 'ON' : 'OFF'}.)`);
			this.modlog('SCAV MODSETTINGS IPCHECK', null, setting[target] ? 'ON' : 'OFF');

			this.parse('/scav modsettings update');
		},
	},
};

exports.commands = {
	// general
	scav: 'scavengers',
	scavengers: commands,

	// old game aliases
	scavenge: commands.guess,
	startpracticehunt: 'starthunt',
	startofficialhunt: 'starthunt',
	startminihunt: 'starthunt',
	startunratedhunt: 'starthunt',
	forcestarthunt: 'starthunt',
	starthunt: commands.create,
	joinhunt: commands.join,
	leavehunt: commands.leave,
	resethunt: commands.reset,
	forceendhunt: 'endhunt',
	endhunt: commands.end,
	edithunt: commands.edithunt,
	viewhunt: commands.viewhunt,
	inherithunt: commands.inherit,
	scavengerstatus: commands.status,
	scavengerhint: commands.hint,

	nexthunt: commands.next,

	// point aliases
	scavaddpoints: 'scavengeraddpoints',
	scavengersaddpoints: commands.addpoints,

	scavrmpoints: 'scavengersremovepoints',
	scavengersrmpoints: 'scavengersremovepoints',
	scavremovepoints: 'scavengersremovepoints',
	scavengersremovepoints: commands.addpoints,

	scavresetlb: 'scavengersresetlb',
	scavengersresetlb: commands.resetladder,

	scavrank: commands.rank,
	scavladder: 'scavtop',
	scavtop: commands.ladder,
	scavengerhelp: 'scavengershelp',
	scavhelp: 'scavengershelp',
	scavengershelp(target, room, user) {
		if (!room || room.id !== 'scavengers' && !(room.parent && room.parent.id === 'scavengers')) return this.errorReply("This command can only be used in the scavengers room.");
		if (!this.runBroadcast()) return false;

		const userCommands = [
			"<strong>Player commands:</strong>",
			"- /scavengers - joins the scavengers room.",
			"- /joinhunt - joins the current scavenger hunt.",
			"- /leavehunt - leaves the current scavenger hunt.",
			"- /scavenge <em>[guess]</em> - submits your answer to the current hint.",
			"- /scavengerstatus - checks your status in the current game.",
			"- /scavengerhint - views your latest hint in the current game.",
			"- /scavladder - views the monthly scavenger leaderboard.",
			"- /scavrank <em>[user]</em> - views the rank of the user on the monthly scavenger leaderboard.  Defaults to the user if no name is provided.",
		].join('<br />');
		const staffCommands = [
			"<strong>Staff commands:</strong>",
			"- /starthunt <em>[host] | [hint] | [answer] | [hint] | [answer] | [hint] | [answer] | ...</em> - creates a new scavenger hunt. (Requires: % @ * # & ~)",
			"- /start(official/practice/mini/unrated)hunt <em>[host] | [hint] | [answer] | [hint] | [answer] | [hint] | [answer] | ...</em> - creates a new scavenger hunt, giving points if assigned.  Blitz and wins will count towards the leaderboard. (Requires: % @ * # & ~)",
			"- /edithunt <em>[question number], [hint | answer], [value]</em> - edits the current scavenger hunt. Only the host(s) can edit the hunt.",
			"- /resethunt - resets the current scavenger hunt without revealing the hints and answers. (Requires: % @ * # & ~)",
			"- /endhunt - ends the current scavenger hunt and announces the winners and the answers. (Requires: % @ * # & ~)",
			"- /viewhunt - views the current scavenger hunt.  Only the user who started the hunt can use this command. Only the host(s) can view the hunt.",
			"- /inherithunt - becomes the staff host, gaining staff permissions to the current hunt. (Requires: % @ * # & ~)",
			"- /scav timer <em>[minutes | off]</em> - sets a timer to automatically end the current hunt. (Requires: % @ * # & ~)",
			"- /scav addpoints <em>[user], [amount]</em> - gives the user the amount of scavenger points towards the monthly ladder. (Requires: % @ * # & ~)",
			"- /scav removepoints <em>[user], [amount]</em> - takes the amount of scavenger points from the user towards the monthly ladder. (Requires: % @ * # & ~)",
			"- /scav resetladder - resets the monthly scavenger leaderboard. (Requires: # & ~)",
			"- /scav setpoints [1st place], [2nd place], [3rd place], [4th place], [5th place], ... - sets the point values for the wins. Use `/scav setpoints` to view what the current point values are. (Requires: # & ~)",
			"- /scav setblitz [value] ... - sets the blitz award to `value`. Use `/scav setblitz` to view what the current blitz value is. (Requires: # & ~)",
			"- /scav queue <em>[host] | [hint] | [answer] | [hint] | [answer] | [hint] | [answer] | ...</em> - queues a scavenger hunt to be started after the current hunt is finished. (Requires: % @ * # & ~)",
			"- /scav viewqueue - shows the list of queued scavenger hunts to be automatically started, as well as the option to remove hunts from the queue. (Requires: % @ * # & ~)",
			"- /scav defaulttimer [value] - sets the default timer applied to automatically started hunts from the queue.",
			"- /nexthunt - starts the next hunt in the queue.",
		].join('<br />');

		const gamesCommands = [
			"<strong>Game commands:</strong>",
			"- /scav game <em>[kogames | jumpstart | pointrally | scavengergames]</em> - starts a new scripted scavenger game. (Requires: % @ * # & ~)",
			"- /scav game end - ends the current scavenger game. (Requires: % @ * # & ~)",
			"- /scav game kick <em>[user]</em> - kicks the user from the current scavenger game. (Requires: % @ * # & ~)",
			"- /scav game score - shows the current scoreboard for any game with a leaderboard.",
			"- /scav game rank <em>[user]</em> - shows a user's rank in the current scavenger game leaderboard.",
		].join('<br />');

		target = toId(target);

		let display = target === 'all' ? `${userCommands}<br /><br />${staffCommands}<br /><br />${gamesCommands}` : target === 'staff' ? staffCommands : target === 'games' || target === 'game' ? gamesCommands : userCommands;

		this.sendReplyBox(display);
	},
};

Rooms.ScavengerHunt = ScavengerHunt;
