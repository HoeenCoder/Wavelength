/************************
 * Ping Pong for PS!	*
 * Created by Insist	*
 ************************/

"use strict";

/* global PINGPONG_GAMES */
if (!global.PINGPONG_GAMES) global.PINGPONG_GAMES = {ID: 1};

class PingPong extends Console.Console {
	constructor(user, muted) {
		super(user, `background: url(https://media.giphy.com/media/l41lO5QYsXKGi911C/giphy.gif) no-repeat; background-size: cover; background-color: green`, `<center><h2 style="color: #FFF">Ping Pong</h2><br /><button class="button" name="send" value="/pingpong create">Host a Game</button><br /><br /><button class="button" name="send" value="/pingpong join">Join a Game</button></center>`, null, muted);
		this.title = "Ping Pong";
		this.gameId = "pingpong";
		this.version = "1.0";
		this.game = null;
		this.user = user;
		this.screen = "home";
		this.back = null; // If you can go back, and where back goes
		// Game Functions
		this.team = null;
	}

	buildScreen(screen, options = {}) {
		let css = ``, html = ``, base = this.defaultBottomHTML;
		let game = this.game ? (PINGPONG_GAMES[this.game] || null) : null;
		this.back = null;
		switch (screen) {
		case "home":
			// Home menu - return default HTML
			break;
		case "search":
			html += `<table class="ladder" style="color: #FFF; margin-left: auto; margin-right: auto"><tbody><tr><th colspan="6"><h2 style="margin: 5px auto; text-align: center; font-weight: bold">Ping Pong Games:</h2></th></tr><tr><th>Host</th><th>Players</th><th>Points to Win</th><th>PIN</th><th>Action</th></tr>`;
			for (let id in PINGPONG_GAMES) {
				if (id === "ID") continue;
				let game = PINGPONG_GAMES[id];
				// Only show non-bot games & games that haven't started
				if (game.state !== "signups" || !game.options.pvp) continue;
				html += `<tr><td>${WL.nameColor(game.host.name, true, true)}</td><td${game.players.length >= game.options.cap ? ` style="color: red"` : ``}>${game.players.length}/${game.options.cap}</td><td>${game.options.pointsToWin}</td><td>${game.options.pin ? `<i class="fa fa-lock"></i>` : `<i class="fa fa-unlock"></i>`}</td><td><button class="button${game.players.length >= game.options.cap ? ` disabled"` : `" name="send" value="/pingpong join ${id}"`}>Join Game</button></td></tr>`;
			}
			html += `</tbody></table>`;
			base += `<center><button class="button" name="send" value="/pingpong back">Back</button></center>`;
			this.back = "home";
			break;
		case "setup":
			html += `<h2 style="text-align: center; color: #FFF">Setup Game</h2>`;
			html += `<br /> <strong style="color: #FFF">Fight A Bot (1v1 Only):</strong> <button class="button${!game.options.pvp ? ` disabled"` : `" name="send" value="/pingpong options pvp, off"`}>ON</button> <button class="button${game.options.pvp ? ` disabled"` : `" name="send" value="/pingpong options pvp, on"`}>OFF</button>`;
			// Bot VS Player fights are always 1v1
			if (game.options.pvp) {
				html += `<br /><strong style="color: #FFF">Player Cap:</strong> `;
				for (let i = 2; i <= 4; i++) {
					if (i % 2 !== 0) continue;
					html += `<button class="button${game.options.cap === i ? ` disabled"` : `" name="send" value="/pingpong options cap, ${i}"`}>${i}</button> `;
				}
			}
			html += `<br /> <strong style="color: #FFF">Points To Win:</strong> `;
			for (let i = 7; i <= 21; i++) {
				// Must be an odd number
				if (i % 2 === 0) continue;
				html += `<button class="button${game.options.pointsToWin === i ? ` disabled"` : `" name="send" value="/pingpong options pointsToWin, ${i}"`}>${i}</button> `;
			}
			html += `<br /> <strong style="color: #FFF">Timer (in seconds):</strong> `;
			for (let i = 5; i <= 15; i++) {
				html += `<button class="button${game.options.timer === i ? ` disabled"` : `" name="send" value="/pingpong options timer, ${i}"`}>${i}</button> `;
			}
			// Bot VS Player fights PIN won't matter anyways
			if (game.options.pvp) html += `<br /> <strong style="color: #FFF">PIN (Password to join the game):</strong> ${game.options.pin ? `${`<strong style="color: #FFF;">${game.options.pin}</strong> <button class="button" name="send" value="/pingpong options pin, remove">Remove PIN</button>`}` : `<strong style="color: #FFF;">None.</strong> <button class="button" name="send" value="/pingpong options pin">Set a PIN</button>`}`;
			html += `<br /><br /> <button class="button" name="send" value="/pingpong options lock">Confirm Settings</button>`;
			base += `<center><button class="button" name="send" value="/pingpong back">Leave</button></center>`;
			this.back = "/pingpong leave";
			break;
		case "awaitingPlayers":
			html += `<table class="ladder" style="color: #FFF; margin-left: auto; margin-right: auto"><tbody><tr><th colspan="2"><h2 style="margin: 5px auto">Waiting for players...</h2></th></tr>`;
			for (let i = 0; i < game.options.cap; i++) {
				if (i % 2 === 0) html += `<tr>`;
				html += `<td style="font-weight: bold">${game.players[i] ? WL.nameColor(Users(game.players[i]).name, true, true) : `Waiting...`}</td>`;
				if (i % 2 !== 0) html += `</tr>`;
			}
			html += `</tbody></table>`;
			base += `<center>`;
			if (game.host.userid === this.userid) base += `<button class="button${game.players.length % 2 === 0 ? `" name="send" value="/pingpong start"` : ` disabled"`}>Start Game</button>`;
			base += ` <button class="button" name="send" value="/pingpong back">Leave</button>`;
			this.back = `/pingpong leave`;
			break;
		case "pin":
			html += `<table class="ladder" style="color: #FFF; margin-left: auto; margin-right: auto"><tbody><tr><th colspan="3"><h2 style="margin: 5px auto">${toId(options.cmd).startsWith("pin") ? "Enter the PIN" : "Setup a PIN"}</h2></th></tr>`;
			html += `<tr><th colspan="3">${options.pin || "-"}</th></tr>`;
			for (let i = 1; i < 13; i++) {
				if (i % 3 === 1) html += `<tr>`;
				if (i >= 10) {
					// 10 - delete, 11 - 0, 12 - cancel
					if (i === 10) html += `<td><button class="button${(options.pin && options.pin.toString().length > 0) ? `" name="send" value="/pingpong ${options.cmd} ${options.pin.toString().substring(0, (options.pin.toString().length - 1))}"` : ` disabled"`}><i class="fa fa-eraser"></i></button></td>`;
					if (i === 11) html += `<td><button class="button" name="send" value="/pingpong ${options.cmd} ${options.pin ? options.pin.toString() + "0" : "0"}">0</button></td>`;
					if (i === 12) html += `<td><button class="button" name="send" value="/pingpong ${options.cmd} cancel"><i class="fa fa-ban"></i></button></td>`;
				} else {
					html += `<td><button class="button" name="send" value="/pingpong ${options.cmd} ${options.pin ? options.pin.toString() + i.toString() : i.toString()}">${i}</button></td>`;
				}
				if (i % 3 === 0) html += `</tr>`;
			}
			html += `</tbody></table>`;
			break;
		case "play":
			if (!game) return;
			html += `<h2 style="text-align: center; color: #FFF">Time to Play!</h2>`;
			// Bold the user's team
			if (this.user.console.team === "alpha") html += `<h3 style="text-align: center; color: #FFF">POINTS: <strong>Team Alpha (${game.teams["alpha"].points}/${game.options.pointsToWin})</strong> VS Team Bravo (${game.teams["bravo"].points}/${game.options.pointsToWin})</h3>`;
			if (this.user.console.team === "bravo") html += `<h3 style="text-align: center; color: #FFF">POINTS: Team Alpha (${game.teams["alpha"].points}/${game.options.pointsToWin}) VS <strong>Team Bravo (${game.teams["bravo"].points}/${game.options.pointsToWin})</strong></h3>`;
			if (options.text) html += `<h4 style="text-align: center; color: #FFF; font-weight: bold">${options.text}</h4>`;
			base += `<center><button class="button${game.state === "awaitingServe" && game.hasBall === this.userid ? `" name="send" value="/pingpong serve"` : ` disabled"`}>Serve!</button><button class="button${game.state === "awaitingHit" && game.hasBall === this.userid ? `" name="send" value="/pingpong hit"` : ` disabled"`}>Hit The Ball!</button></center>`;
			break;
		default:
			throw new Error(`Ping Pong: Couldn't find screen "${screen}".`);
		}
		return [css, html, base];
	}

	onKill() {
		if (this.game) {
			let game = PINGPONG_GAMES[this.game];
			if (!game) return;
			let isHost = game.host.userid === this.userid;
			if (isHost && !game.options.pvp) return game.endGame(null);
			game.leave(Users(this.userid), true);
		}
	}
}

class PingPongGame {
	constructor(host, id) {
		this.host = host;
		this.id = id;
		this.players = [host.userid];
		this.state = "pre-signups";
		this.teams = {
			"alpha": {name: "Alpha", id: "alpha", players: [], points: 0},
			"bravo": {name: "Bravo", id: "bravo", players: [], points: 0},
		};
		this.options = {
			pointsToWin: 21,
			cap: 4,
			timer: 5,
			pin: null,
			pvp: true,
		};
		this.hasBall = null;
		this.timeToHit = this.options.timer * 1000;
		this.timer = null;
	}

	start() {
		// Must have an even number of players if you are playing PvP (bot games don't matter)
		if (this.options.pvp && this.players.length % 2 !== 0) return false;
		this.state = "inProgress";
		if (!this.options.pvp) {
			this.setUpCom();
		} else {
			this.setUpPvP();
		}
	}

	join(user, pin) {
		if (this.state !== "signups" || this.options.cap <= this.players.length || !this.options.pvp) return false;
		if (this.options.pin) {
			// PIN locked game - authenticate
			pin = parseInt(pin);
			if (isNaN(pin) || pin.toString().length !== 4) return user.console.update(...user.console.buildScreen("pin", {cmd: `pin ${this.id},`}));
			if (pin !== this.options.pin) return user.console.update(...user.console.buildScreen("error", {text: "The provided PIN was incorrect."}));
		}
		this.players.push(user.userid);
		user.console.game = this.id;
		this.updateAll("awaitingPlayers");
	}

	leave(user, force) {
		if (!["pre-signups", "signups"].includes(this.state) && !force && this.options.pvp) return false;
		if (!this.players.includes(user.userid)) return false;
		this.players.splice(this.players.indexOf(user.userid), 1);
		if (!["pre-signups", "signups"].includes(this.state) && this.options.pvp && user.console.team) {
			this.teams[user.console.team].players.splice(this.teams[user.console.team].players.indexOf(user.userid), 1);
			if (this.teams["alpha"].players.length < 1 || this.teams["bravo"].players.length < 1 || this.players.length < 2) return this.endGame(null); // End the game since there is no competition
			if (this.hasBall === user.userid) {
				if (user.console.team === "alpha") {
					let team = this.teams["alpha"].players;
					let randomTeammate = team[Math.floor(Math.random() * team.length)];
					this.hasBall = randomTeammate;
					this.updateAll("play", {text: `${WL.nameColor(user.name, true, true)} has left the game of Ping Pong whilst having the ball, so their teammate ${WL.nameColor(randomTeammate, true, true)} was given the ball!`});
					this.setTimer(randomTeammate);
				} else {
					let team = this.teams["bravo"].players;
					let randomTeammate = team[Math.floor(Math.random() * team.length)];
					this.hasBall = randomTeammate;
					this.updateAll("play", {text: `${WL.nameColor(user.name, true, true)} has left the game of Ping Pong whilst having the ball, so their teammate ${WL.nameColor(randomTeammate, true, true)} was given the ball!`});
					this.setTimer(randomTeammate);
				}
			}
		}
		if (!["pre-signups", "signups"].includes(this.state) && !this.options.pvp) return this.endGame(null);
		user.console.game = null;
		if (this.state === "pre-signups" && this.host.userid === user.userid) {
			delete PINGPONG_GAMES[this.id];
			if (user && user.console) {
				user.send(`>view-gameconsole\n|deinit`);
				delete user.console;
			}
		}
		// Only send the players back to the awaitingPlayers screen if they were still in signups state
		if (this.state === "signups") this.updateAll("awaitingPlayers");
	}

	setUpCom() {
		// Allow host to have the first serve (the bot won't mind I promise)
		this.hasBall = this.host.userid;
		this.state = "awaitingServe";
		this.teams["alpha"].players.push(this.host.userid);
		Users(this.host).console.team = "alpha";
		this.teams["bravo"].players.push("COM");
		this.updateAll("play", {text: `${WL.nameColor(this.hasBall, true, true)} has been given the ball!`});
		this.setTimer(this.host.userid);
	}

	setUpPvP() {
		let randomPlayer = this.players[Math.floor(Math.random() * this.players.length)];
		this.hasBall = randomPlayer;
		let list = Dex.shuffle(this.players.slice());
		for (let i = 0; i < list.length; i++) {
			let user = Users(list[i]);
			if (!user || !user.console || user.console.gameId !== "pingpong") throw new Error(`Ping Pong: User not found: ${list[i]}`);
			if (i % 2 === 0) {
				this.teams["bravo"].players.push(user.userid);
				user.console.team = "bravo";
				user.popup(`|html|<strong>You have been assigned to Team Bravo!</strong>`);
			} else {
				this.teams["alpha"].players.push(user.userid);
				user.console.team = "alpha";
				user.popup(`|html|<strong>You have been assigned to Team Alpha!</strong>`);
			}
		}
		this.state = "awaitingServe";
		this.updateAll("play", {text: `${WL.nameColor(randomPlayer, true, true)}, from Team ${Users(randomPlayer).console.team === "alpha" ? "Alpha" : "Bravo"}, has first serve!`});
		this.setTimer(randomPlayer);
	}

	serve(user) {
		if (this.state !== "awaitingServe") return false;
		if (this.hasBall !== user.userid) return false;
		this.state = "awaitingHit";
		// Randomly serve towards one of the opponents
		if (this.teams["alpha"].players.includes(user.userid)) {
			let otherTeam = this.teams["bravo"].players;
			let randomOpponent = otherTeam[Math.floor(Math.random() * otherTeam.length)];
			this.hasBall = randomOpponent;
			this.updateAll("play", {text: `${WL.nameColor(user.name, true, true)} has served the ball towards ${WL.nameColor(randomOpponent, true, true)}!`});
			this.setTimer(randomOpponent);
		} else {
			let otherTeam = this.teams["alpha"].players;
			let randomOpponent = otherTeam[Math.floor(Math.random() * otherTeam.length)];
			this.hasBall = randomOpponent;
			this.updateAll("play", {text: `${WL.nameColor(user.name, true, true)} has served the ball towards ${WL.nameColor(randomOpponent, true, true)}!`});
			this.setTimer(randomOpponent);
		}
	}

	comAction() {
		if (!PINGPONG_GAMES[this.id]) return;
		if (this.options.pvp) return false;
		if (this.hasBall !== "COM") return;
		// Slight delay so the player can see the updateAll() messages they send so it doesn't look like they do nothing at times
		setTimeout(() => {
			if (this.state === "awaitingServe") {
				this.hasBall = this.host.userid;
				this.state = "awaitingHit";
				this.updateAll("play", {text: `The COM has served the ball towards ${WL.nameColor(this.hasBall, true, true)}! Hit the ball back!`});
				this.setTimer(this.host.userid);
			}
			let hitChance = Math.floor(Math.random() * 100) > 30;
			if (this.state === "awaitingHit") {
				if (hitChance) {
					this.hasBall = this.host.userid;
					this.state = "awaitingHit";
					this.updateAll("play", {text: `The COM hit the ball towards ${WL.nameColor(this.hasBall, true, true)}! Hit the ball back!`});
					this.setTimer(this.host.userid);
				} else {
					this.state = "awaitingServe";
					this.hasBall = this.host.userid;
					// The COM missed!
					this.score("alpha");
					this.updateAll("play", {text: `The COM missed! You earned a point! ${WL.nameColor(this.hasBall, true, true)} was given the ball to serve!`});
					this.setTimer(this.host.userid);
				}
			}
		}, 3000);
	}

	hit(user) {
		if (this.state !== "awaitingHit") return false;
		if (this.hasBall !== user.userid) return false;
		let hitChance = Math.floor(Math.random() * 100) > 30;
		if (hitChance) {
			// Continue to keep the state awaitingHit (successfully hit the ball back)
			if (this.teams["alpha"].players.includes(user.userid)) {
				let otherTeam = this.teams["bravo"].players;
				let randomOpponent = otherTeam[Math.floor(Math.random() * otherTeam.length)];
				this.hasBall = randomOpponent;
				this.updateAll("play", {text: `${WL.nameColor(user.name, true, true)} has hit the ball towards ${WL.nameColor(randomOpponent, true, true)}!`});
				this.setTimer(randomOpponent);
			} else {
				let otherTeam = this.teams["alpha"].players;
				let randomOpponent = otherTeam[Math.floor(Math.random() * otherTeam.length)];
				this.hasBall = randomOpponent;
				this.updateAll("play", {text: `${WL.nameColor(user.name, true, true)} has hit the ball towards ${WL.nameColor(randomOpponent, true, true)}!`});
				this.setTimer(randomOpponent);
			}
		} else {
			// The player missed.
			this.state = "awaitingServe";
			if (user.console.team === "alpha") {
				this.score("bravo");
				let randomOpponent = this.teams["bravo"].players[Math.floor(Math.random() * this.teams["bravo"].players.length)];
				this.hasBall = randomOpponent;
				this.updateAll("play", {text: `${WL.nameColor(user.name, true, true)} has missed while trying to hit the ball! Team Bravo gained a point, and ${WL.nameColor(randomOpponent, true, true)} now has the ball to serve!`});
				this.setTimer(randomOpponent);
			} else {
				this.score("alpha");
				let randomOpponent = this.teams["alpha"].players[Math.floor(Math.random() * this.teams["alpha"].players.length)];
				this.hasBall = randomOpponent;
				this.updateAll("play", {text: `${WL.nameColor(user.name, true, true)} has missed while trying to hit the ball! Team Alpha gained a point, and ${WL.nameColor(randomOpponent, true, true)} now has the ball to serve!`});
				this.setTimer(randomOpponent);
			}
		}
	}

	updateAll(screen, options = {}) {
		if (!PINGPONG_GAMES[this.id]) return;
		for (let player of this.players) {
			let u = Users(player);
			if (!u) throw new Error(`Ping Pong: Player not found ${player}.`);
			if (!u.console) {
				console.log(`Ping Pong: Player ${player} does not have a console!`);
				continue;
			}
			u.console.update(...u.console.buildScreen(screen, options));
		}
	}

	setTimer(player) {
		if (!PINGPONG_GAMES[this.id]) return;
		clearTimeout(this.timer);
		// No need in setting the timer, the game will just be ended anyways
		if (this.players.length < 2 && this.options.pvp) return;
		if (!this.options.pvp && player === "COM") return this.comAction();
		this.timer = setTimeout(() => {
			if (this.teams["alpha"].players.includes(Users(player).userid)) {
				this.score("bravo");
				let otherTeam = this.teams["bravo"].players;
				let randomOpponent = otherTeam[Math.floor(Math.random() * otherTeam.length)];
				this.hasBall = randomOpponent;
				let missingAction = this.state;
				this.state = "awaitingServe";
				this.updateAll("play", {text: `${WL.nameColor(player, true, true)}, from Team Alpha, has failed to ${missingAction !== "awaitingHit" ? `serve` : `hit`} the ball, so the ball was given to ${WL.nameColor(randomOpponent, true, true)}, from Team Bravo!`});
				if (randomOpponent === "COM" && !this.options.pvp) return this.comAction();
			} else {
				this.score("alpha");
				let otherTeam = this.teams["alpha"].players;
				let randomOpponent = otherTeam[Math.floor(Math.random() * otherTeam.length)];
				this.hasBall = randomOpponent;
				let missingAction = this.state;
				this.state = "awaitingServe";
				this.updateAll("play", {text: `${WL.nameColor(player, true, true)}, from Team Bravo, has failed to ${missingAction !== "awaitingHit" ? `serve` : `hit`} the ball, so the ball was given to ${WL.nameColor(randomOpponent, true, true)}, from Team Alpha!`});
				if (randomOpponent === "COM" && !this.options.pvp) return this.comAction();
			}
		}, this.timeToHit);
	}

	score(team) {
		if (!PINGPONG_GAMES[this.id]) return;
		if (!["alpha", "bravo"].includes(team)) return false; // Should never happen
		this.teams[team].points++;
		// Check if the points need to be incremented by 2
		let semifinalRound = this.options.pointsToWin - 1;
		let newPointsToWin = this.options.pointsToWin + 2;
		if (this.teams["alpha"].points === this.teams["bravo"].points && semifinalRound === this.teams[team].points) this.options.pointsToWin = newPointsToWin;
		if (team === "alpha" && this.teams[team].points === this.options.pointsToWin) return this.endGame(true);
		if (team === "bravo" && this.teams[team].points === this.options.pointsToWin) return this.endGame(false);
	}

	endGame(win) {
		if (!PINGPONG_GAMES[this.id]) return;
		clearTimeout(this.timer);
		// Only give rewards if its a non-bot fight
		if (this.options.pvp) {
			if (win) {
				for (let alphaTeam of this.teams["alpha"].players) {
					alphaTeam = Users(alphaTeam);
					if (alphaTeam && alphaTeam.connected) Users(alphaTeam).popup(`|html|<center>You have won the game of Ping Pong! Congratulations, you and your teammates have earned 5 EXP and 2 ${currencyPlural}.<br /><button class="button" name="send" value="/pingpong init">Play Another Game!</button></center>`);
					WL.ExpControl.addExp(alphaTeam.userid, null, 5);
					Economy.writeMoney(alphaTeam.userid, 2);
					Economy.logTransaction(`${alphaTeam.name} has won 2 ${currencyPlural} and 5 EXP for winning a game of Ping Pong!`);
				}
			} else {
				for (let bravoTeam of this.teams["bravo"].players) {
					bravoTeam = Users(bravoTeam);
					if (bravoTeam && bravoTeam.connected) Users(bravoTeam).popup(`|html|<center>You have won the game of Ping Pong! Congratulations, you and your teammates have earned 5 EXP and 2 ${currencyPlural}.<br /><button class="button" name="send" value="/pingpong init">Play Another Game!</button></center>`);
					WL.ExpControl.addExp(bravoTeam.userid, null, 5);
					Economy.writeMoney(bravoTeam.userid, 2);
					Economy.logTransaction(`${bravoTeam.name} has won 2 ${currencyPlural} and 5 EXP for winning a game of Ping Pong!`);
				}
			}
		} else {
			if (win) {
				if (Users(this.host) && Users(this.host).connected) Users(this.host).popup(`|html|<center>Congratulations, you beat the COM!<br /><button class="button" name="send" value="/pingpong init">Play Another Game!</button></center>`);
			} else {
				if (Users(this.host) && Users(this.host).connected) Users(this.host).popup(`|html|<center>RIP, you lost to the COM :(<br /><button class="button" name="send" value="/pingpong init">Play Another Game!</button></center>`);
			}
		}
		for (let player of this.players) {
			player = Users(player);
			if (player && player.console) {
				player.send(`>view-gameconsole\n|deinit`);
				delete player.console; // Delete the console, they can reinitialize it if they want to
			}
		}
		delete PINGPONG_GAMES[this.id];
	}
}

exports.box = {
	startCommand: "/pingpong init",
	name: "Ping Pong",
};

exports.commands = {
	pingpong: {
		"": "init",
		initalize: "init",
		init: function (target, room, user) {
			// initalize the user's game console
			if (user.console) this.parse("/console kill");
			user.console = new PingPong(user, !!target);
			user.console.init();
		},

		back: function (target, room, user) {
			if (!user.console || user.console.gameId !== "pingpong") return false;
			if (!user.console.back) return;
			if (user.console.back.startsWith("/")) return this.parse(user.console.back);
			user.console.update(...user.console.buildScreen(user.console.back));
		},

		host: "create",
		create: function (target, room, user) {
			if (!user.console || user.console.gameId !== "pingpong") return false;
			if (user.console.game) return;
			let id = PINGPONG_GAMES.ID;
			PINGPONG_GAMES.ID++;
			user.console.game = id;
			PINGPONG_GAMES[id] = new PingPongGame(user, id);
			user.console.update(...user.console.buildScreen("setup"));
		},

		option: "options",
		options: function (target, room, user) {
			if (!user.console || user.console.gameId !== "pingpong") return false;
			let game = PINGPONG_GAMES[user.console.game];
			if (!game || game.host.userid !== user.userid || game.state !== "pre-signups") return;
			target = target.split(",").map(x => { return x.trim(); });
			switch (target.shift()) {
			case "cap":
				target = parseInt(target[0]);
				if (isNaN(target) || target < 2 || target > 4 || target % 2 !== 0) return false;
				game.options.cap = target;
				user.console.update(...user.console.buildScreen("setup"));
				break;
			case "pointsToWin":
				let num = parseInt(target.shift());
				if (isNaN(num) || num < 7 || num > 21 || num % 2 === 0) return false;
				game.options.pointsToWin = num;
				user.console.update(...user.console.buildScreen("setup"));
				break;
			case "timer":
				if (isNaN(num) || num < 5 || num > 15) return false;
				game.options.timer = num;
				user.console.update(...user.console.buildScreen("setup"));
				break;
			case "pvp":
				if (!this.meansYes(target[0]) && !this.meansNo(target[0])) return false;
				game.options.pvp = (target[0] === "on");
				// Set the Ping Pong match to default bot settings
				if (this.meansNo(target[0])) {
					game.options.cap = 2;
					game.options.pin = null;
				}
				user.console.update(...user.console.buildScreen("setup"));
				break;
			case "pin":
				if (!target[0]) {
					// start pin setup
					user.console.update(...user.console.buildScreen("pin", {cmd: "options pin,"}));
				} else if (game.options.pin !== null) {
					if (target[0] !== "remove") return false;
					game.options.pin = null;
					user.console.update(...user.console.buildScreen("setup"));
				} else {
					if (target[0] === "cancel") return user.console.update(...user.console.buildScreen("setup"));
					let pin = parseInt(target[0]);
					if (isNaN(pin) || pin.toString().length > 4) return false;
					if (pin.toString().length < 4) return user.console.update(...user.console.buildScreen("pin", {cmd: "options pin,", pin: pin}));
					game.options.pin = pin;
					user.console.update(...user.console.buildScreen("setup"));
				}
				break;
			case "lock":
				if (game.options.pvp) {
					game.state = "signups";
					user.console.update(...user.console.buildScreen("awaitingPlayers"));
				} else {
					// Bot VS Host doesn't require players
					game.start();
				}
				break;
			}
		},

		s: "serve",
		serve: function (target, room, user) {
			if (!user.console || user.console.gameId !== "pingpong") return false;
			let game = PINGPONG_GAMES[user.console.game];
			if (!game) return;
			game.serve(user);
		},

		h: "hit",
		hit: function (target, room, user) {
			if (!user.console || user.console.gameId !== "pingpong") return false;
			let game = PINGPONG_GAMES[user.console.game];
			if (!game) return;
			game.hit(user);
		},

		j: "join",
		join: function (target, room, user) {
			if (!user.console || user.console.gameId !== "pingpong") return false;
			if (user.console.game) return;
			target = target.split(",").map(x => { return x.trim(); });
			if (!target[0]) {
				// search for a game
				return user.console.update(...user.console.buildScreen("search"));
			} else {
				// join specified user's game
				let game = PINGPONG_GAMES[target[0]];
				if (!game || target === "ID") return false;
				game.join(user, target[1]);
			}
		},

		part: "leave",
		l: "leave",
		leave: function (target, room, user) {
			if (!user.console || user.console.gameId !== "pingpong") return false;
			if (!user.console.game) return false;
			let game = PINGPONG_GAMES[user.console.game];
			if (!game || !["signups", "pre-signups"].includes(game.state)) return false;
			game.leave(user);
		},

		pin: function (target, room, user) {
			if (!user.console || user.console.gameId !== "pingpong") return false;
			if (user.console.game) return;
			target = target.split(",").map(x => { return x.trim(); });
			if (target[0] === "ID") return false;
			let game = PINGPONG_GAMES[target.shift()];
			if (!game || game.host.userid === user.userid || game.state !== "signups" || !game.options.pin) return false;
			if (target[0]) {
				if (target[0] === "cancel") return user.console.update(...user.console.buildScreen("home"));
				let pin = parseInt(target[0]);
				if (isNaN(pin) || pin.toString().length > 4) return false;
				if (pin.toString().length < 4) return user.console.update(...user.console.buildScreen("pin", {cmd: `pin ${game.id},`, pin: pin}));
				// Attempt to join again
				this.parse(`/pingpong join ${game.id}, ${pin}`);
			} else {
				user.console.update(user.console.buildScreen("pin", {cmd: "pin"}));
			}
		},

		startgame: "start",
		start: function (target, room, user) {
			if (!user.console || user.console.gameId !== "pingpong") return false;
			let game = PINGPONG_GAMES[user.console.game];
			if (!game || game.host.userid !== user.userid) return;
			game.start();
		},

		kill: function () {
			this.parse("/console kill");
		},

		help: function () {
			this.parse("/pingponghelp");
		},
	},

	pingponghelp: [
		`/pingpong init - Initializes your console with a game of Ping Pong.
		/pingpong create - Creates a game as the Host.
		/pingpong options [cap | pointsToWin | timer | pvp | pin], [setting] - Sets the settings for the game of Ping Pong. Must be the Host (and in the setup stage).
		/pingpong serve - Serves the Ping Pong ball to your opponent (Must have the ball and the ball cannot have already been served (use /pingpong hit)).
		/pingpong hit - Hits the Ping Pong ball back to your opponent (Must have the ball being served/hit towards you).
		/pingpong join [optional ID] - Joins the specified ID of the game. Defaults to the search screen (if you have a console open with Ping Pong).
		/pingpong pin [PIN for the game] - Enters the PIN for he game you are trying to join.
		/pingpong start - Starts the Ping Pong match. Must be the Host.
		/pingpong kill - Kills your Ping Pong console.
		/pingpong help - Displays the help commands.`,
	],
};
