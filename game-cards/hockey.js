/**********************************
 * Hockey Console Game Plug-In	  *
 * Coded by HoeenHero and Insist  *
 **********************************/

"use strict";

/* global HOCKEY_GAMES */
if (!global.HOCKEY_GAMES) global.HOCKEY_GAMES = {ID: 1};

const PERIOD_LENGTH = 1000 * 60 * 5; // 5 Minutes
const STEAL_COOLDOWN = 1000 * 10; // 10 seconds
const GRAB_COOLDOWN = 1000 * 5; // 5 seconds
const BLOCK_COOLDOWN = 1000 * 60; // 1 minute
const BLOCK_DURATION = 1000 * 30; // 30 seconds
const FREEZE_DURATION = 1000 * 60; // 1 minute

let VERSION = 1.0;

const names = {
	hurricanes: {
		name: "Hurricanes",
		id: "hurricanes",
		location: "Carolina",
		conference: "Eastern",
		division: "Metropolis",
		color: "#CC0000",
		icon: "",
	},
	bluejackets: {
		name: "Blue Jackets",
		id: "bluejackets",
		location: "Columbus",
		conference: "Eastern",
		division: "Metropolis",
		color: "#002654",
		icon: "",
	},
	devils: {
		name: "Devils",
		id: "devils",
		location: "New Jersey",
		conference: "Eastern",
		division: "Metropolis",
		color: "#CE1126",
		icon: "",
	},
	islanders: {
		name: "Islanders",
		id: "islanders",
		location: "New York",
		conference: "Eastern",
		division: "Metropolis",
		color: "#00468B",
		icon: "",
	},
	rangers: {
		name: "Rangers",
		id: "rangers",
		location: "New York",
		conference: "Eastern",
		division: "Metropolis",
		color: "#0038A8",
		icon: "",
	},
	flyers: {
		name: "Flyers",
		id: "flyers",
		location: "Philadelphia",
		conference: "Eastern",
		division: "Metropolis",
		color: "#F74902",
		icon: "",
	},
	penguins: {
		name: "Penguins",
		id: "penguins",
		location: "Pittsburgh",
		conference: "Eastern",
		division: "Metropolis",
		color: "#000000",
		icon: "",
	},
	capitals: {
		name: "Capitals",
		id: "capitals",
		location: "Washington",
		conference: "Eastern",
		division: "Metropolis",
		color: "#041E41",
		icon: "",
	},
	bruins: {
		name: "Bruins",
		id: "bruins",
		location: "Boston",
		conference: "Eastern",
		division: "Atlantic",
		color: "#FCB514",
		icon: "",
	},
	sabres: {
		name: "Sabres",
		id: "sabres",
		location: "Buffalo",
		conference: "Eastern",
		division: "Atlantic",
		color: "#002654",
		icon: "",
	},
	redwings: {
		name: "Red Wings",
		id: "redwings",
		location: "Detroit",
		conference: "Eastern",
		division: "Atlantic",
		color: "#CE1126",
		icon: "",
	},
	panthers: {
		name: "Panthers",
		id: "panthers",
		location: "Florida",
		conference: "Eastern",
		division: "Atlantic",
		color: "#C8102E",
		icon: "",
	},
	canadiens: {
		name: "Canadiens",
		id: "canadiens",
		location: "Montreal",
		conference: "Eastern",
		division: "Atlantic",
		color: "#AF1E2D",
		icon: "",
	},
	senators: {
		name: "Senators",
		id: "senators",
		location: "Ottawa",
		conference: "Eastern",
		division: "Atlantic",
		color: "#E31837",
		icon: "",
	},
	lightning: {
		name: "Lightning",
		id: "lightning",
		location: "Tampa Bay",
		conference: "Eastern",
		division: "Atlantic",
		color: "#002868",
		icon: "",
	},
	mapleleafs: {
		name: "Maple Leafs",
		id: "mapleleafs",
		location: "Toronto",
		conference: "Eastern",
		division: "Atlantic",
		color: "#003E7E",
		icon: "",
	},
	blackhawks: {
		name: "Black Hawks",
		id: "blackhawks",
		location: "Chicago",
		conference: "Western",
		division: "Central",
		color: "#CF0A2C",
		icon: "",
	},
	avalanche: {
		name: "Avalanche",
		id: "avalanche",
		location: "Colorado",
		conference: "Western",
		division: "Central",
		color: "#6F263D",
		icon: "",
	},
	stars: {
		name: "Stars",
		id: "stars",
		location: "Dallas",
		conference: "Western",
		division: "Central",
		color: "#006847",
		icon: "",
	},
	wild: {
		name: "Wild",
		id: "wild",
		location: "Minnesota",
		conference: "Western",
		division: "Central",
		color: "#C51230",
		icon: "",
	},
	predators: {
		name: "Predators",
		id: "predators",
		location: "Nashville",
		conference: "Western",
		division: "Central",
		color: "#FFB81C",
		icon: "",
	},
	blues: {
		name: "Blues",
		id: "blues",
		location: "St. Louis",
		conference: "Western",
		division: "Central",
		color: "#002F87",
		icon: "",
	},
	jets: {
		name: "Jets",
		id: "jets",
		location: "Winnipeg",
		conference: "Western",
		division: "Central",
		color: "#041E41",
		icon: "",
	},
	ducks: {
		name: "Ducks",
		id: "ducks",
		location: "Anaheim",
		conference: "Western",
		division: "Pacific",
		color: "#F95602",
		icon: "",
	},
	coyotes: {
		name: "Coyotes",
		id: "coyotes",
		location: "Arizona",
		conference: "Western",
		division: "Pacific",
		color: "#8C2633",
		icon: "",
	},
	flames: {
		name: "Flames",
		id: "flames",
		location: "Calgary",
		conference: "Western",
		division: "Pacific",
		color: "#B72B35",
		icon: "",
	},
	oilers: {
		name: "Oilers",
		id: "oilers",
		location: "Edmonton",
		conference: "Western",
		division: "Pacific",
		color: "#041E41",
		icon: "",
	},
	kings: {
		name: "Kings",
		id: "kings",
		location: "Los Angeles",
		conference: "Western",
		division: "Pacific",
		color: "#111111",
		icon: "",
	},
	sharks: {
		name: "Sharks",
		id: "sharks",
		location: "San Jose",
		conference: "Western",
		division: "Pacific",
		color: "#006D75",
		icon: "",
	},
	canucks: {
		name: "Canucks",
		id: "canucks",
		location: "Vancouver",
		conference: "Western",
		division: "Pacific",
		color: "#001F5C",
		icon: "",
	},
	goldenknights: {
		name: "Golden Knights",
		id: "goldenknights",
		location: "Las Vegas",
		conference: "Western",
		division: "Pacific",
		color: "#B4975A",
		icon: "",
	},
};

class Hockey extends Console.Console {
	constructor(user, muted) {
		super(user, `background: url(https://campus.plymouth.edu/arena/wp-content/uploads/sites/142/2010/07/Hockey-stick-and-ball-wallpaper.jpg) no-repeat; background-size: cover;`, `<center><h2 style="color: #FFF">Hockey</h2><br /><button class="button" name="send" value="/hockey create">Host a Game</button><br /><br /><button class="button" name="send" value="/hockey join">Join a Game</button></center>`, null, muted);
		this.title = "Hockey";
		this.gameId = "hockey";
		this.version = VERSION;
		this.game = null;
		this.user = user;
		this.screen = "home";
		this.back = null; // If you can go back, and where back goes
		// Game info
		this.position = null; // forwards, defensemen, goalie
		this.zone = null; // center, zone1, or zone2
		this.team = null; // Team the player is on
		this.stealCooldown = null; // The user's steal cooldown for stealing the puck from a user
		this.grabCooldown = null; // The user's cooldown for grabbing the puck
	}

	buildScreen(screen, options = {}) {
		let css = ``, html = ``, base = this.defaultBottomHTML;
		let game = this.game ? (HOCKEY_GAMES[this.game] || null) : null;
		this.back = null;
		switch (screen) {
		case "home":
			// Home menu - return default HTML
			break;
		case "search":
			// Searching for a game to join
			html += `<table class="ladder" style="color: #FFF; margin-left: auto; margin-right: auto"><tbody><tr><th colspan="6"><h2 style="margin: 5px auto; text-align: center; font-weight: bold">Hockey Games:</h2></th></tr><tr><th>Host</th><th>Players</th><th>Team Names</th><th>Random Team</th><th>PIN</th><th>Action</th></tr>`;
			for (let id in HOCKEY_GAMES) {
				if (id === "ID") continue;
				let game = HOCKEY_GAMES[id];
				if (game.phase === "pre-signups") continue;
				html += `<tr><td>${WL.nameColor(game.host.name, true, true)}</td><td${game.players.length >= game.options.cap ? ` style="color: red"` : ``}>${game.players.length}/${game.options.cap}</td><td><strong style="color: ${names[game.options.names[0]].color}">${names[game.options.names[0]].name}</strong> VS <strong style="color: ${names[game.options.names[1]].color}">${names[game.options.names[1]].name}</strong></td><td>${game.options.randomTeams}</td><td>${game.options.pin ? `<i class="fa fa-lock"></i>` : `<i class="fa fa-unlock"></i>`}</td><td><button class="button${game.players.length >= game.options.cap || game.phase !== "signups" ? ` disabled"` : `" name="send" value="/hockey join ${id}"`}>Join Game</button><button class="button" name="send" value="/hockey spectate ${id}">Spectate</button></td></tr>`;
			}
			html += `</tbody></table>`;
			base += `<center><button class="button" name="send" value="/hockey back">Back</button></center>`;
			this.back = "home";
			break;
		case "setup":
			html += `<h2 style="text-align: center; color: #FFF">Setup Game</h2> <strong style="color: #FFF">Player Cap:</strong> `;
			for (let i = 2; i < 13; i++) {
				if (i % 2 !== 0) continue;
				html += `<button class="button${game.options.cap === i ? ` disabled"` : `" name="send" value="/hockey options cap, ${i}"`}>${i}</button> `;
			}
			html += `<br /> <strong style="color: #FFF">Team Names:</strong> <button class="button" name="send" value="/hockey options teamName, 0">${names[game.options.names[0]] ? names[game.options.names[0]].name : "Random"}</button> <strong style="color: #FFF">@</strong> <button class="button" name="send" value="/hockey options teamName, 1">${names[game.options.names[1]] ? names[game.options.names[1]].name : "Random"}</button> <strong style="color: #FFF">(click to change)</strong>`;
			html += `<br /> <strong style="color: #FFF">Randomize Teams:</strong> <button class="button${game.options.randomTeams ? ` disabled"` : `" name="send" value="/hockey options randomTeams, on"`}>ON</button> <button class="button${!game.options.randomTeams ? ` disabled"` : `" name="send" value="/hockey options randomTeams, off"`}>OFF</button>`;
			html += `<br /> <strong style="color: #FFF">Game Periods:</strong> `;
			for (let i = 1; i < 7; i++) {
				html += `<button class="button${game.options.periods === i ? ` disabled"` : `" name="send" value="/hockey options periods, ${i}"`}>${i}</button> `;
			}
			html += `<br /> <strong style="color: #FFF">Penalties:</strong> <button class="button${game.options.penalties ? ` disabled"` : `" name="send" value="/hockey options penalties, on"`}>ON</button> <button class="button${!game.options.penalties ? ` disabled"` : `" name="send" value="/hockey options penalties, off"`}>OFF</button>`;
			html += `<br /> <strong style="color: #FFF">Enforce Offside:</strong> <button class="button${game.options.enforceOffside ? ` disabled"` : `" name="send" value="/hockey options offside, on"`}>ON</button> <button class="button${!game.options.enforceOffside ? ` disabled"` : `" name="send" value="/hockey options offside, off"`}>OFF</button>`;
			html += `<br /> <strong style="color: #FFF">PIN (Password to join the game):</strong> ${game.options.pin ? `${`<strong style="color: #FFF;">${game.options.pin}</strong> <button class="button" name="send" value="/hockey options pin, remove">Remove PIN</button>`}` : `<strong style="color: #FFF;">None.</strong> <button class="button" name="send" value="/hockey options pin">Set a PIN</button>`}`;
			html += `<br /><br /> <button class="button" name="send" value="/hockey options lock">Confirm Settings</button>`;
			base += `<center><button class="button" name="send" value="/hockey back">Leave</button></center>`;
			this.back = "/hockey leave";
			break;
		case "teamName":
			let curName = game.options.names[options.slot];
			html += `<h2 style="text-align: center; color: #FFF">Setup - Choose Team Name</h2><center>`;
			let onLine = 0;
			let keys = Object.keys(names);
			for (let i = 0; i < keys.length; i++) {
				onLine++;
				html += ` <button class="button${names[keys[i]].name === curName ? ` disabled"` : `" name="send" value="/hockey options teamName, ${options.slot}, ${names[keys[i]].name}"`}>${names[keys[i]].name}</button>${onLine >= 3 ? `<br />` : ``}`;
				if (onLine >= 3) onLine = 0;
			}
			html += ` <button class="button${curName === "random" ? ` disabled"` : `" name="send" value="/hockey options teamName, ${options.slot}, random"`}>Random</button></center>`;
			base += `<center><button class="button" name="send" value="/hockey back">Back</button></center>`;
			this.back = "setup";
			break;
		case "pin":
			html += `<table class="ladder" style="color: #FFF; margin-left: auto; margin-right: auto"><tbody><tr><th colspan="3"><h2 style="margin: 5px auto">${toId(options.cmd).startsWith("pin") ? "Enter the PIN" : "Setup a PIN"}</h2></th></tr>`;
			html += `<tr><th colspan="3">${options.pin || "-"}</th></tr>`;
			for (let i = 1; i < 13; i++) {
				if (i % 3 === 1) html += `<tr>`;
				if (i >= 10) {
					// 10 - delete, 11 - 0, 12 - cancel
					if (i === 10) html += `<td><button class="button${(options.pin && options.pin.toString().length > 0) ? `" name="send" value="/hockey ${options.cmd} ${options.pin.toString().substring(0, (options.pin.toString().length - 1))}"` : ` disabled"`}><i class="fa fa-eraser"></i></button></td>`;
					if (i === 11) html += `<td><button class="button" name="send" value="/hockey ${options.cmd} ${options.pin ? options.pin.toString() + "0" : "0"}">0</button></td>`;
					if (i === 12) html += `<td><button class="button" name="send" value="/hockey ${options.cmd} cancel"><i class="fa fa-ban"></i></button></td>`;
				} else {
					html += `<td><button class="button" name="send" value="/hockey ${options.cmd} ${options.pin ? options.pin.toString() + i.toString() : i.toString()}">${i}</button></td>`;
				}
				if (i % 3 === 0) html += `</tr>`;
			}
			html += `</tbody></table>`;
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
			if (game.host.userid === this.userid) base += `<button class="button${game.players.length % 2 === 0 ? `" name="send" value="/hockey start"` : ` disabled"`}>Start Game</button>`;
			base += ` <button class="button" name="send" value="/hockey back">Leave</button>`;
			this.back = `/hockey leave`;
			break;
		case "setTeams":
			html += `<h2 style="text-align: center; color: #FFF">Setup Game - Set Teams</h2>`;
			// If you are the host, allow buttons, if not, all buttons are disabled, and you simply watch the host set things up
			let isHost = game.host.userid === this.userid;
			for (let i = 0; i < game.players.length; i++) {
				let targetUser = Users(game.players[i]);
				if (isHost) html += `<p><strong style="color: #FFF">${WL.nameColor(targetUser.name, true, true)}:</strong> <button class="button${targetUser.console.team === game.options.names[0] ? ` disabled"` : `" name="send" value="/hockey setteam ${targetUser.name}, ${game.options.names[0]}"`}>${names[game.options.names[0]].name}</button> <button class="button${targetUser.console.team === game.options.names[1] ? ` disabled"` : `" name="send" value="/hockey setteam ${targetUser.name}, ${game.options.names[1]}"`}>${names[game.options.names[1]].name}</button></p>`;
			}
			if (!isHost) html += `<center><p><strong style="color: #FFF">Please wait while ${WL.nameColor(game.host.name, true, true)} assigns teams.</strong></p></center>`;
			if (isHost) html += `<center><p><strong style="color: #FFF">It is time to set teams!</strong></p></center>`;
			if (isHost) base += `<center><button class="button" name="send" value="/hockey confirmteams">Begin The Game!</button></center>`;
			break;
		case "confirmLeave":
			html += this.curScreen[1] + `<div style="z-index: 1; display: inline-block; position: absolute; bottom: 0; overflow: hidden; border: 0.2em solid #000; border-radius: 5px; width: 99%; height: 98%; color: #000; background-color: rgba(255, 255, 255, 0.8);"><h2 style="text-align: center; color: #000">Are you sure?</h2><p style="text-align: center; font-weight: bold">All players will be kicked.</p>`;
			html += `</div>`;
			base = `<center><button class="button" name="send" value="/hockey confirmleave">Yes, I'm sure I want to leave the game.</button> <button class="button" name="send" value="/hockey back">Back</button></center>`;
			this.back = "prev";
			break;
		case "rink":
			let team = game.teams[this.user.console.team];
			let userTeam = this.user.console.team;
			let userZone = this.user.console.zone;
			let offensive;
			if (game.teams[game.options.names[0]].players.includes(this.userid)) offensive = game.teams[game.options.names[1]].home;
			if (game.teams[game.options.names[1]].players.includes(this.userid)) offensive = game.teams[game.options.names[0]].home;
			html += `<h3 style="text-align: center; color: #FFF"><strong style="color: ${names[game.options.names[0]].color}">${names[game.options.names[0]].name}</strong> VS <strong style="color: ${names[game.options.names[1]].color}">${names[game.options.names[1]].name}</strong>!</h2>`;
			html += `<h3 style="text-align: center; color: #FFF; font-weight: bold">PERIOD: ${game.period} | SCORE: ${game.teams[game.options.names[0]].score} - ${game.teams[game.options.names[1]].score}</h3>`;
			let puckZone;
			if (game.puck.zone === "zone1") {
				if (offensive === "zone1") puckZone = "Offensive";
				if (offensive === "zone2") puckZone = "Defensive";
			} else if (game.puck.zone === "zone2") {
				if (offensive === "zone1") puckZone = "Defensive";
				if (offensive === "zone2") puckZone = "Offensive";
			} else {
				puckZone = "Center";
			}
			if (game.puck.holder && game.puck.holder !== this.userid) html += `<center><strong style="color: #FFF">${WL.nameColor(game.puck.holder, true, true)}, from <strong style="color: ${names[Users(game.puck.holder).console.team].color}">Team ${names[Users(game.puck.holder).console.team].name}</strong>, has the puck! (ZONE: ${puckZone})</strong></center><br />`;
			if (game.puck.holder && game.puck.holder === this.userid) html += `<center><strong style="color: #FFF">You have the puck! ${userZone === offensive ? `You can shoot the puck!` : `You need to move to the Offensive Zone to shoot!`}</strong></center><br />`;
			if (!game.puck.holder) html += `<center><strong style="color: #FFF">No one currently has the puck! Go to the ${puckZone} Zone to grab it!</strong></center><br />`;
			// Only show buttons and team specific data to players (Spectator fix)
			if (userTeam && team.blocking && team.goalie) html += `<center><strong style="color: #FFF">Your goalie is blocking your goal!</strong></center><br />`;
			if (userTeam) html += `<center><strong style="color: #FFF">You are on <strong style="color: ${names[userTeam].color}">Team ${names[userTeam].name}</strong>!</strong></center><br />`;
			html += `<h4 style="text-align: center; color: #FFF; font-weight: bold">${team.home === "zone1" ? `Defensive` : `Offensive`} Zone:</h4>`;
			for (let zone1 of game.players) {
				if (Users(zone1).console.zone === "zone1") {
					html += `<div style="border-radius: 100%; background-color: ${names[Users(zone1).console.team].color}; height: 25px; width: 25px; display: inline-block"; title="${Users(zone1).console.userid}"></div>`;
				}
			}
			if (game.puck.zone === "zone1" && !game.puck.holder) html += `<div style="border-radius: 100%; background-color: #000; height: 25px; width: 25px; display: inline-block"; title="puck"></div>`;
			html += `<br />`;
			html += `<h4 style="text-align: center; color: #FFF; font-weight: bold">Center Zone:</h4>`;
			for (let center of game.players) {
				if (Users(center).console.zone === "center") {
					html += `<div style="border-radius: 100%; background-color: ${names[Users(center).console.team].color}; height: 25px; width: 25px; display: inline-block"; title="${Users(center).console.userid}"></div>`;
				}
			}
			if (game.puck.zone === "center" && !game.puck.holder) html += `<div style="border-radius: 100%; background-color: #000; height: 25px; width: 25px; display: inline-block"; title="puck"></div>`;
			html += `<br />`;
			html += `<h4 style="text-align: center; color: #FFF; font-weight: bold">${team.home === "zone1" ? `Offensive` : `Defensive`} Zone:</h4>`;
			for (let zone2 of game.players) {
				if (Users(zone2).console.zone === "zone2") {
					html += `<div style="border-radius: 100%; background-color: ${names[Users(zone2).console.team].color}; height: 25px; width: 25px; display: inline-block"; title="${Users(zone2).console.userid}"></div>`;
				}
			}
			if (game.puck.zone === "zone2" && !game.puck.holder) html += `<div style="border-radius: 100%; background-color: #000; height: 25px; width: 25px; display: inline-block"; title="puck"></div>`;
			// Commands for all players
			if (this.user.console.team) base += `<center><button class="button${game.puck.holder === this.userid && userZone === offensive ? `" name="send" value="/hockey shoot"` : ` disabled"`}>Shoot</button><button class="button${!game.puck.holder || game.puck.holder === this.userid || Users(game.puck.holder).console.team === team || game.puck.zone !== userZone || Date.now() - this.user.console.stealCooldown < STEAL_COOLDOWN ? ` disabled"` : `" name="send" value="/hockey steal ${game.puck.holder}"`}>Steal Puck</button><button class="button${game.puck.holder || Date.now() - this.user.console.grabCooldown < GRAB_COOLDOWN || game.puck.zone !== userZone ? ` disabled"` : `" name="send" value="/hockey grab"`}>Grab Puck</button></center>`;
			// Only non-goalie commands
			if (this.user.console.position !== "goalie") base += `<center><button class="button${userZone === "center" ? ` disabled"` : `" name="send" value="/hockey move center"`}>Move to the Center</button><button class="button${userZone === team.home || userZone === offensive ? ` disabled"` : `" name="send" value="/hockey move ${offensive}"`}>Move to the Offense</button><button class="button${userZone === offensive || userZone === team.home ? ` disabled"` : `" name="send" value="/hockey move ${team.home}"`}>Move to the Defense</button></center>`;
			// Goalie only commands
			if (this.user.console.position === "goalie") base += `<center><button class="button${team.blocking || Date.now() - team.lastBlock < BLOCK_COOLDOWN ? ` disabled"` : `" name="send" value="/hockey block"`}>Block!</button></center>`;
			break;
		case "frozen":
			html += `<h2 style="text-align: center; color: #FFF; font-weight: bold">The referee has frozen the puck!</h2>`;
			html += `<strong style="text-align: center; color: #FFF">The game will continue momentarily.</strong>`;
			break;
		case "error":
			html += this.curScreen[1] + `<div style="z-index: 1; display: inline-block; position: absolute; bottom: 0; overflow: hidden; border: 0.2em solid #000; border-radius: 5px; width: 99%; height: 98%; color: #000; background-color: rgba(255, 255, 255, 0.8); text-align: center"><h2>${options.text || `An error has occurred.`}</h2><br /><button class="button" name="send" value="/hockey back">Return to Home Menu</button></div>`;
			this.back = "home";
			break;
		case "prev":
			// Special case, return the previous console screen.
			return this.prevScreen;
		default:
			throw new Error(`Hockey: unknown screen ${screen}.`);
		}
		return [css, html, base];
	}

	onKill() {
		if (this.game) {
			let game = HOCKEY_GAMES[this.game];
			if (!game) return;
			let isHost = game.host.userid === this.userid;
			if (isHost) {
				game.end(true);
			}
			game.leave(Users(this.userid), true);
		}
	}
}

class HockeyGame {
	constructor(host, id) {
		this.id = id;
		this.host = host;
		this.period = 0;
		this.players = [host.userid];
		this.spectators = [];
		this.teams = {};
		this.phase = "pre-signups";
		this.timeLeft = PERIOD_LENGTH;
		this.timer = null;
		this.frozen = false;
		this.options = {
			names: ["random", "random"],
			cap: 12,
			randomTeams: true,
			penalties: true,
			enforceOffside: true,
			periods: 3,
			pin: null,
		};
		this.puck = {holder: null, zone: "center"};
	}

	open() {
		if (this.phase !== "pre-signups") return;
		for (let i = 0; i < this.options.names.length; i++) {
			while (this.options.names[i] === "random" || this.options.names[0] === this.options.names[1]) {
				this.options.names[i] = names[Object.keys(names)[Math.floor(Math.random() * Object.keys(names).length)]].id;
			}
		}
		this.phase = "signups";
	}

	join(user, pin) {
		if (this.phase !== "signups" || this.options.cap <= this.players.length) return;
		if (this.players.includes(user.userid)) return false;
		// Remove the user from spectating if they want to join
		if (this.spectators.includes(user.userid)) this.spectators.splice(this.spectators.indexOf(user.userid), 1);
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

	spectate(user) {
		if (this.phase === "pre-signups") return false;
		// Users cannot spectate and play the game
		if (this.players.includes(user.userid)) return false;
		this.spectators.push(user.userid);
		user.console.game = this.id;
		if (this.phase === "signups") {
			user.console.update(...user.console.buildScreen("awaitingPlayers"));
		} else {
			user.console.update(...user.console.buildScreen("rink"));
		}
	}

	leave(user, force) {
		if (this.phase !== "signups" && !force) return false;
		if (!this.players.includes(user.userid) && !this.spectators.includes(user.userid)) return false;
		if (this.players.includes(user.userid)) this.players.splice(this.players.indexOf(user.userid), 1);
		if (this.spectators.includes(user.userid)) this.spectators.splice(this.spectators.indexOf(user.userid), 1);
		user.console.game = null;
		user.console.update(user.console.buildScreen("home"));
		// Only send the players back to the awaitingPlayers screen if they were still in signups phase
		if (this.phase === "signups") this.updateAll("awaitingPlayers");
	}

	updateAll(screen, options = {}) {
		for (let i = 0; i < this.players.length; i++) {
			let u = Users(this.players[i]);
			if (!u) throw new Error(`Hockey: Player not found ${this.players[i]}.`);
			// DEBUG
			if (!u.console) {
				console.log(`Hockey: Player ${this.players[i]} does not have a console!`); // Possibly a race condition with the console closing?
				continue;
			}
			u.console.update(...u.console.buildScreen(screen, options));
		}
		// If a spectator is missing just remove them
		for (let i = 0; i < this.spectators.length; i++) {
			let u = Users(this.spectators[i]);
			if (!u || !u.console) this.spectators.splice(this.spectators.indexOf(this.spectators[i]), 1);
			u.console.update(...u.console.buildScreen(screen, options));
		}
	}

	randomizeTeams() {
		let list = Dex.shuffle(this.players.slice());
		for (let i = 0; i < list.length; i++) {
			let user = Users(list[i]);
			if (!user || !user.console || user.console.gameId !== "hockey") throw new Error(`Hockey user not found: ${list[i]}`);
			// Determine team, then position
			/* Total positions per team relative to total players
			2: 1 forward
			4: 1 forward, 1 goalie
			6: 2 forwards, 1 goalie
			8: 2 forwards, 1 defenseman, 1 goalie
			10: 3 forwards, 1 defenseman, 1 goalie
			12: 3 forwards, 2 defensemen, 1 goalie
			*/
			let order = ["forwards", "goalie", "forwards", "defensemen", "forwards", "defensemen"];
			if (i % 2 === 0) {
				let team = this.teams[this.options.names[1]];
				team.players.push(user.userid);
				user.console.team = this.options.names[1];
				user.console.position = order[team.players.length - 1];
				if (user.console.position === "goalie") {
					team.goalie = user.userid;
					// Ideally goalie should start out at the defensive zone for their team
					user.console.zone = team.home;
				} else {
					team[user.console.position].push(user.userid);
					// Ideally every other player should start out at the center zone
					user.console.zone = "center";
				}
			} else {
				let team = this.teams[this.options.names[0]];
				team.players.push(user.userid);
				user.console.team = this.options.names[0];
				user.console.position = order[team.players.length - 1];
				if (user.console.position === "goalie") {
					team.goalie = user.userid;
					// Ideally goalie should start out at the defensive zone for their team
					user.console.zone = team.home;
				} else {
					team[user.console.position].push(user.userid);
					// Ideally every other player should start out at the center zone
					user.console.zone = "center";
				}
			}
		}
		if (this.players.length % 2 === 0 && this.teams[this.options.names[0]].players.length !== this.teams[this.options.names[1]].players.length) throw new Error(`Hockey: Teams did not get an even number of players. Total: ${this.players.length} 0: ${this.teams[this.options.names[0]].players.length} 1: ${this.teams[this.options.names[1]].players.length}`);
		this.startGame();
	}

	setupTeams() {
		this.phase = "assigningTeams";
		this.updateAll("setTeams");
	}

	start() {
		this.phase = "starting";
		this.teams[this.options.names[0]] = Object.assign(names[this.options.names[0]], {players: [], goalie: "", defensemen: [], forwards: [], score: 0, blocking: false, lastBlock: null, home: "zone1"});
		this.teams[this.options.names[1]] = Object.assign(names[this.options.names[1]], {players: [], goalie: "", defensemen: [], forwards: [], score: 0, blocking: false, lastBlock: null, home: "zone2"});
		if (this.options.randomTeams) {
			this.randomizeTeams();
		} else {
			this.setupTeams();
		}
	}

	startGame() {
		this.phase = "started";
		this.period = 1;
		this.updateAll("rink");
		this.timer = setInterval(() => {
			this.period++;
			if (this.period > this.options.periods) return this.end(false);
			this.updateAll("rink");
		}, PERIOD_LENGTH);
	}

	confirmTeams() {
		for (let i = 0; i < this.players.length; i++) {
			let player = Users(this.players[i]);
			if (!player || !player.console || player.console.gameId !== "hockey") throw new Error(`Hockey: Couldn't find Player ${this.players[i]}.`);
			// Check if the user wasn't assigned a team. If they weren't randomly assign them to one
			if (!Users(player).console.team) {
				let teams = this.options.names[Math.floor(Math.random() * this.options.names.length)];
				Users(player).console.team = teams;
				this.teams[teams].players.push(Users(player).userid);
			}
			// Assign Positions
			let order = ["forwards", "goalie", "forwards", "defensemen", "forwards", "defensemen"];
			if (i % 2 === 0) {
				let team = this.teams[this.options.names[1]];
				Users(player).console.position = order[team.players.length - 1];
				if (Users(player).console.position === "goalie") {
					team.goalie = player.userid;
					// Ideally goalie should start out at the defensive zone for their team
					Users(player).console.zone = team.home;
				} else {
					team[Users(player).console.position].push(player.userid);
					// Ideally every other player should start out at the center zone
					Users(player).console.zone = "center";
				}
			} else {
				let team = this.teams[this.options.names[0]];
				Users(player).console.position = order[team.players.length - 1];
				if (Users(player).console.position === "goalie") {
					team.goalie = player.userid;
					// Ideally goalie should start out at the defensive zone for their team
					Users(player).console.zone = team.home;
				} else {
					team[Users(player).console.position].push(player.userid);
					// Ideally every other player should start out at the center zone
					Users(player).console.zone = "center";
				}
			}
		}
		// There must be at least one player per team
		if (this.teams[this.options.names[0]].players.length < 1 || this.teams[this.options.names[1]].players.length < 1) return false;
		this.startGame();
	}

	move(user, newZone) {
		if (this.frozen) return false;
		if (!this.players.includes(user.userid)) return false;
		let validPlaces = ["center", "zone1", "zone2"];
		if (user.console.position === "goalie") return false;
		// The user can't skip two zones
		if (user.console.zone === "zone2" && newZone === "zone2" || user.console.zone === "zone1" && newZone === "zone2") return false;
		if (!validPlaces.includes(newZone)) return false;
		if (newZone === user.console.zone) return false;
		if (this.puck.holder === user.userid) this.puck.zone = newZone;
		user.console.zone = newZone;
		this.updateAll("rink");
	}

	block(user) {
		if (this.frozen) return false;
		if (!this.players.includes(user.userid)) return false;
		if (user.console.position !== "goalie") return false;
		if (Date.now() - this.teams[user.console.team].lastBlock < BLOCK_COOLDOWN) return false;
		if (this.teams[user.console.team].blocking) return false; // Should never happen but better safe than sorry
		this.teams[user.console.team].blocking = true;
		this.teams[user.console.team].lastBlock = Date.now();
		setTimeout(() => {
			this.teams[user.console.team].blocking = false;
		}, BLOCK_DURATION);
		let cooldown = Date.now() - this.teams[user.console.team].lastBlock + BLOCK_COOLDOWN;
		setTimeout(() => {
			// Update buttons showing the cooldown has ended
			this.updateAll("rink");
		}, cooldown);
	}

	freezePuck() {
		if (this.frozen) return false;
		// Referee blows whistle
		this.frozen = true;
		clearTimeout(this.timer);
		this.puck.holder = null;
		this.updateAll("frozen");
		setTimeout(() => {
			this.updateAll("rink");
		}, FREEZE_DURATION);
	}

	stealPuck(user, hasPuck) {
		if (this.frozen) return false;
		if (!this.players.includes(user.userid)) return false;
		if (Date.now() - user.console.stealCooldown < STEAL_COOLDOWN) return false;
		// Target must have the puck check
		if (this.puck.holder !== hasPuck) return false;
		// Check if the target is in their team/if target is themselves has the puck and deny if so
		if (Users(hasPuck).console.team === user.console.team || hasPuck === user.userid) return false;
		// Check if the user is in the same zone as target to steal
		if (Users(hasPuck).console.zone !== user.console.zone) return false;
		let steal = Math.floor(Math.random() * 50);
		// Steal Cooldown
		user.console.stealCooldown = Date.now();
		if (steal > 30) {
			// User takes puck
			this.puck.holder = user.userid;
		}
		this.updateAll("rink");
		let cooldown = Date.now() - user.console.stealCooldown + STEAL_COOLDOWN;
		setTimeout(() => {
			// Update the user's rink once their cooldown is complete so they can see the button's again
			this.updateAll("rink");
		}, cooldown);
	}

	shootPuck(user) {
		if (this.frozen) return false;
		if (!this.players.includes(user.userid)) return false;
		// Must have the puck to shoot the puck
		if (this.puck.holder !== user.userid) return false;
		let opponent;
		if (this.teams[this.options.names[0]].players.includes(user.userid)) opponent = this.teams[this.options.names[1]];
		if (this.teams[this.options.names[1]].players.includes(user.userid)) opponent = this.teams[this.options.names[0]];
		// Can only shoot in the offense zone
		if (user.console.zone !== opponent.home) return false;
		let shoot = Math.floor(Math.random() * 100);
		// They shoot the puck, so they lose the puck
		this.puck.holder = null;
		// For each player the opponent team has in the defensive zone add 5 more to the shoot RNG
		for (let opponents of opponent.players) {
			opponents = Users(opponents);
			if (!opponents || !opponents.console) continue;
			if (opponents.console.zone === opponent.home) shoot = shoot + 5;
		}
		if (shoot > 60 && !opponent.blocking) {
			// Add score to the user's team
			this.teams[user.console.team].score++;
			// Send the players back to their respective zones
			for (let player of this.players) {
				player = Users(player);
				if (!player || !player.console) continue;
				if (player.console.position === "goalie") {
					player.console.zone = this.teams[player.console.team].home;
				} else {
					player.console.zone = "center";
				}
			}
			this.puck.zone = "center";
		} else if (shoot > 90 && opponent.blocking) {
			// Add score to the user's team
			this.teams[user.console.team].score++;
			// Send the players back to their respective zones
			for (let player of this.players) {
				player = Users(player);
				if (player.console.position === "goalie") {
					player.console.zone = this.teams[player.console.team].home;
				} else {
					player.console.zone = "center";
				}
			}
			this.puck.zone = "center";
		} else {
			// BLOCKED
		}
		this.updateAll("rink");
	}

	grabPuck(user) {
		if (this.frozen) return false;
		if (!this.players.includes(user.userid)) return false;
		if (Date.now() - user.console.grabCooldown < GRAB_COOLDOWN) return false;
		// cannot grab the puck if someone else has it
		if (this.puck.holder) return false;
		if (this.puck.zone !== user.console.zone) return false;
		this.puck.holder = user.userid;
		// Steal Cooldown
		user.console.grabCooldown = Date.now();
		this.updateAll("rink");
		let cooldown = Date.now() - user.console.grabCooldown + GRAB_COOLDOWN;
		setTimeout(() => {
			// Update the user's rink once their cooldown is complete so they can see the button's again
			this.updateAll("rink");
		}, cooldown);
	}

	end(force) {
		if (force) {
			this.back = "home";
			this.updateAll("error", {text: "The game was forcibly ended because the host left."});
		}
		clearInterval(this.timer);
		for (let i = 0; i < this.players.length; i++) {
			let u = Users(this.players[i]);
			if (!u) throw new Error(`Hockey: Player not found ${this.players[i]}.`);
			// DEBUG
			if (!u.console) {
				console.log(`Hockey: Player ${this.players[i]} does not have a console!`); // Possibly a race condition with the console closing?
				continue;
			}
			delete u.console;
			u.console = new Hockey(u);
			u.console.init();
		}
		for (let spectator of this.spectators) {
			let u = Users(spectator);
			if (!u || !u.console) this.spectators.splice(this.spectators.indexOf(spectator), 1);
			delete u.console;
			u.console = new Hockey(u);
			u.console.init();
		}
		delete HOCKEY_GAMES[this.id];
	}
}

exports.box = {
	startCommand: "/hockey init",
	name: "Hockey",
};

exports.commands = {
	hockey: {
		init: function (target, room, user) {
			// initalize this user's game console
			if (user.console) this.parse("/console kill");
			user.console = new Hockey(user, !!target);
			user.console.init();
		},

		back: function (target, room, user) {
			if (!user.console || user.console.gameId !== "hockey") return false;
			if (!user.console.back) return;
			if (user.console.back.startsWith("/")) return this.parse(user.console.back);
			user.console.update(...user.console.buildScreen(user.console.back));
		},

		create: function (target, room, user) {
			if (!user.console || user.console.gameId !== "hockey") return false;
			if (user.console.game) return; // Trying to create a game while in one
			let id = HOCKEY_GAMES.ID;
			HOCKEY_GAMES.ID++;
			user.console.game = id;
			HOCKEY_GAMES[id] = new HockeyGame(user, id);
			user.console.update(...user.console.buildScreen("setup"));
		},

		options: function (target, room, user) {
			if (!user.console || user.console.gameId !== "hockey") return false;
			let game = HOCKEY_GAMES[user.console.game];
			if (!game || game.host.userid !== user.userid || game.phase !== "pre-signups") return;
			target = target.split(",").map(x => { return x.trim() });
			switch (target.shift()) {
			case "cap":
				target = parseInt(target[0]);
				if (isNaN(target) || target < 2 || target > 12 || target % 2 !== 0) return false;
				game.options.cap = target;
				user.console.update(...user.console.buildScreen("setup"));
				break;
			case "teamName":
				let slot = parseInt(target.shift());
				if (isNaN(slot) || slot < 0 || slot > 1) return false;
				if (!target[0]) {
					// Open menu to pick name
					return user.console.update(...user.console.buildScreen("teamName", {slot: slot}));
				} else {
					if (!Object.keys(names).includes(toId(target[0])) && target[0] !== "random") return false;
					game.options.names[slot] = (target[0] === "random" ? "random" : toId(target[0]));
					user.console.update(...user.console.buildScreen("setup"));
				}
				break;
			case "periods":
				let num = parseInt(target.shift());
				if (isNaN(num) || num < 1 || num > 6) return false;
				game.options.periods = num;
				user.console.update(...user.console.buildScreen("setup"));
				break;
			case "randomTeams":
				if (!["on", "off"].includes(target[0])) return false;
				game.options.randomTeams = (target[0] === "on");
				user.console.update(...user.console.buildScreen("setup"));
				break;
			case "penalties":
				if (!["on", "off"].includes(target[0])) return false;
				game.options.penalties = (target[0] === "on");
				user.console.update(...user.console.buildScreen("setup"));
				break;
			case "offside":
				if (!["on", "off"].includes(target[0])) return false;
				game.options.enforceOffside = (target[0] === "on");
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
				game.open();
				user.console.update(...user.console.buildScreen("awaitingPlayers"));
				break;
			}
		},

		pin: function (target, room, user) {
			if (!user.console || user.console.gameId !== "hockey") return false;
			if (user.console.game) return;
			target = target.split(",").map(x => { return x.trim(); });
			if (target[0] === "ID") return false;
			let game = HOCKEY_GAMES[target.shift()];
			if (!game || game.host.userid === user.userid || game.phase !== "signups" || !game.options.pin) return false;
			if (target[0]) {
				if (target[0] === "cancel") return user.console.update(...user.console.buildScreen("home"));
				let pin = parseInt(target[0]);
				if (isNaN(pin) || pin.toString().length > 4) return false;
				if (pin.toString().length < 4) return user.console.update(...user.console.buildScreen("pin", {cmd: `pin ${game.id},`, pin: pin}));
				// Attempt to join again
				this.parse(`/hockey join ${game.id}, ${pin}`);
			} else {
				user.console.update(user.console.buildScreen("pin", {cmd: "pin"}));
			}
		},

		join: function (target, room, user) {
			if (!user.console || user.console.gameId !== "hockey") return false;
			if (user.console.game) return;
			target = target.split(",").map(x => { return x.trim() });
			if (!target[0]) {
				// search for a game
				return user.console.update(...user.console.buildScreen("search"));
			} else {
				// join specified user's game
				let game = HOCKEY_GAMES[target[0]];
				if (!game || target === "ID") return false;
				game.join(user, target[1]);
			}
		},

		spectate: function (target, room, user) {
			if (!user.console || user.console.gameId !== "hockey") return false;
			if (user.console.game) return;
			if (!target) {
				// search for a game
				return user.console.update(...user.console.buildScreen("search"));
			} else {
				// join specified user's game
				let game = HOCKEY_GAMES[target];
				if (!game || target === "ID") return false;
				game.spectate(user);
			}
		},

		confirmleave: "leave",
		leave: function (target, room, user, connection, cmd) {
			if (!user.console || user.console.gameId !== "hockey") return false;
			if (!user.console.game) return false;
			let game = HOCKEY_GAMES[user.console.game];
			if (!game || !["signups", "pre-signups"].includes(game.phase)) return false;
			let isHost = (game.host.userid === user.userid);
			if (isHost && cmd !== "confirmleave") return user.console.update(...user.console.buildScreen("confirmLeave"));
			if (isHost) return game.end(true);
			game.leave(user);
		},

		start: function (target, room, user) {
			if (!user.console || user.console.gameId !== "hockey") return false;
			if (!user.console.game) return false;
			let game = HOCKEY_GAMES[user.console.game];
			if (!game || game.host.userid !== user.userid || game.phase !== "signups") return false;
			if (!game.players.length % 2 !== 0) return false;
			game.start();
		},

		move: function (target, room, user) {
			if (!user.console || user.console.gameId !== "hockey") return false;
			if (!user.console.game) return false;
			let game = HOCKEY_GAMES[user.console.game];
			target = toId(target);
			if (!game || ["signups", "pre-signups"].includes(game.phase)) return false;
			game.move(user, target);
		},

		setteam: function (target, room, user) {
			if (!user.console || user.console.gameId !== "hockey") return false;
			if (!user.console.game) return false;
			let game = HOCKEY_GAMES[user.console.game];
			target = target.split(",").map(x => { return x.trim() });
			let player = target[0];
			let team = target[1];
			if (!player || !team) return false;
			if (!game || game.phase !== "assigningTeams") return false;
			let isHost = (game.host.userid === user.userid);
			if (!isHost) return false;
			// Check if the player is not in the game
			if (!game.players.includes(Users(player).userid)) return false;
			// Check if the team is one of the two team names
			if (!game.teams[team]) return false;
			// Remove the user from previously assigned teams (assuming they had one)
			if (game.teams[game.options.names[0]].players.includes(Users(player).userid)) {
				game.teams[game.options.names[0]].players.splice(game.teams[game.options.names[0]].players.indexOf(Users(player).userid), 1);
			}
			if (game.teams[game.options.names[1]].players.includes(Users(player).userid)) {
				game.teams[game.options.names[1]].players.splice(game.teams[game.options.names[1]].players.indexOf(Users(player).userid), 1);
			}
			// Assign them to the team's players' data
			game.teams[team].players.push(Users(player).userid);
			// Assign player to the team name
			Users(player).console.team = team;
			return user.console.update(...user.console.buildScreen("setTeams"));
		},

		confirmteams: function (target, room, user) {
			if (!user.console || user.console.gameId !== "hockey") return false;
			if (!user.console.game) return false;
			let game = HOCKEY_GAMES[user.console.game];
			if (!game || game.phase !== "assigningTeams") return false;
			let isHost = (game.host.userid === user.userid);
			if (!isHost) return false;
			game.confirmTeams();
		},

		shoot: function (target, room, user) {
			if (!user.console || user.console.gameId !== "hockey") return false;
			if (!user.console.game) return false;
			let game = HOCKEY_GAMES[user.console.game];
			if (!game || game.phase !== "started") return false;
			game.shootPuck(user);
		},

		steal: function (target, room, user) {
			if (!user.console || user.console.gameId !== "hockey") return false;
			if (!user.console.game) return false;
			if (!target) return false;
			let game = HOCKEY_GAMES[user.console.game];
			if (!game || game.phase !== "started") return false;
			game.stealPuck(user, target);
		},

		block: function (target, room, user) {
			if (!user.console || user.console.gameId !== "hockey") return false;
			if (!user.console.game) return false;
			let game = HOCKEY_GAMES[user.console.game];
			if (!game || game.phase !== "started") return false;
			game.block(user);
		},

		grab: function (target, room, user) {
			if (!user.console || user.console.gameId !== "hockey") return false;
			if (!user.console.game) return false;
			let game = HOCKEY_GAMES[user.console.game];
			if (!game || game.phase !== "started") return false;
			game.grabPuck(user);
		},

		"": "help",
		help: function () {
			this.parse(`/hockeyhelp`);
		},
	},

	hockeyhelp: [
		`/hockey init - Starts up your console with Hockey.
		/hockey back - Returns to the last screen, if it has one.
		/hockey create - Creates a game as the host of Hockey.
		/hockey options [cap | team name | random teams | penalties | enforce offset | penalties | pin #] - Change settings of the game. Must be the Host.
		/hockey start - Starts the game (minimum of 2 users; must be even number of players). Must be the Host.
		/hockey pin [pin #] - Insert the PIN to the game you are trying to join (if it has one).
		/hockey join [hockey game ID] - Joins the specified game. If no ID, sends you to the search screen (if you have an open console).
		/hockey spectate [hockey game ID] - Spectates the specified game (not as a player). If no ID, sends you to the search screen (if you have an open console).
		/hockey leave - Leaves the Hockey game, if you have joined one.
		/hockey setteam [user], [team name] - Sets a user to a team. Requires user to be the Host, only works if teams aren't randomized.
		/hockey confirmteams - Confirms the Team Selection. Must be the Host.
		/hockey move [center, zone1, zone2] - Moves to the specified spot on the rink. Cannot be a goalie.
		/hockey grab - Grabs the puck if no one has it.
		/hockey shoot - Attempts to shoot the puck if you have it.
		/hockey steal - Attempts to steal the puck. Must be in the same zone as the player with the puck. Cannot steal from yourself/teammates.
		/hockey block - Blocks the puck. Must be a goalie.
		/hockey help - Shows this help command.`,
	],
};
