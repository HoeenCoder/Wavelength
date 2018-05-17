/************************
 * Rock Paper Scissors	*
 * for Pokemon Showdown *
 * Made by sparkychild	*
 * Refactored by Insist *
 ************************/

"use strict";

if (!Rooms.global.RPS) {
	Rooms.global.RPS = {
		searches: {},
		games: {},
		gameId: 0,
	};
}

let choiceNames = {
	"R": "Rock",
	"P": "Paper",
	"S": "Scissors",
	"L": "Lizard",
	"SP": "Spock",
};

class RPSGame {
	constructor(player1, player2, gameType) {
		this.p1 = player1;
		this.p2 = player2;
		this.p1choice = null;
		this.p2choice = null;
		Rooms.global.RPS.gameId++;
		this.gameId = `RPS-${Rooms.global.RPS.gameId}`;
		this.gameType = gameType;
		// set inactivity timer
		this.timer = setTimeout(function () {
			this.onEnd(true);
		}.bind(this), 60000);
		this.onInit();
	}

	onInit() {
		// set game
		Rooms.global.RPS.games[this.gameId] = this;

		// delete searches
		delete Rooms.global.RPS.searches[this.p1.userid];
		delete Rooms.global.RPS.searches[this.p2.userid];

		// change users
		this.p1.RPSgame = this.gameId;
		this.p2.RPSgame = this.gameId;

		// send popups
		this.sendGameInformation(this.p1, this.p2);
		this.sendGameInformation(this.p2, this.p1);
	}

	sendGameInformation(player, opponent) {
		let pmPost = `/html <div class="broadcast-green"><center>You have been matched up with ${WL.nameColor(opponent.name, true)}<br />`;
		pmPost += `<strong>What is your choice?</strong><br />`;
		pmPost += `<button name="send" value="/rps choose R ${this.gameId}"><i class="fa fa-hand-rock-o"></i>Rock</button>`;
		pmPost += `<button name="send" value="/rps choose P ${this.gameId}"><i class="fa fa-hand-paper-o"></i> Paper</button>`;
		pmPost += `<button name="send" value="/rps choose S ${this.gameId}"><i class="fa fa-hand-scissors-o"></i>Scissors</button>`;
		if (this.gameType === "ladderRPSLS") {
			pmPost += `<button name="send" value="/rpsls choose L ${this.gameId}"><i class="fa fa-hand-lizard-o"></i>Lizard</button>`;
			pmPost += `<button name="send" value="/rpsls choose SP ${this.gameId}"><i class="fa fa-hand-spock-o"></i>Spock</button>`;
		}
		pmPost += `</center><br /><br />`;
		pmPost += `You have 60 seconds to make your choice.</center></div>`;
		player.send(`|pm|~Rock/Paper/Scissors${this.gameType !== "ladderRPSLS" ? `` : `/Lizard/Spock`} Host|${player.userid}|${pmPost}`);
	}

	updateUsers() {
		// get the latest user...
		this.p1 = Users.get(this.p1.userid);
		this.p2 = Users.get(this.p2.userid);
	}

	onChoose(user, choice) {
		this.updateUsers();
		if (user.userid !== this.p1.userid && user.userid !== this.p2.userid) return false;
		let playerChoice = user.userid === this.p1.userid ? "p1choice" : "p2choice";
		if (this[playerChoice]) return user.send(`|pm|~Rock/Paper/Scissors${this.gameType !== "ladderRPSLS" ? `` : `/Lizard/Spock`} Host|${user.userid}|/html <p style="color: red">You have already chose your move!</p>`);
		this[playerChoice] = choice;
		user.send(`|pm|~Rock/Paper/Scissors${this.gameType !== "ladderRPSLS" ? `` : `/Lizard/Spock`} Host|${user.userid}|/html <strong>You have chose: ${choiceNames[choice]}.</strong>`);
		if (this.p1choice && this.p2choice) this.onEnd();
	}

	onEnd(inactivity) {
		clearTimeout(this.timer);
		// in the case of inactivity
		if (inactivity) {
			// determine winner
			if (this.p1choice && !this.p2choice) {
				this.p2.send(`|pm|~Rock/Paper/Scissors${this.gameType !== "ladderRPSLS" ? `` : `/Lizard/Spock`} Host|${this.p2.userid}|/html You have lost due to inactivity.`);
				this.parseWin(this.p1, this.p2, true);
			} else if (!this.p1choice && this.p2choice) {
				this.p1.send(`|pm|~Rock/Paper/Scissors${this.gameType !== "ladderRPSLS" ? `` : `/Lizard/Spock`} Host|${this.p1.userid}|/html You have lost due to inactivity.`);
				this.parseWin(this.p2, this.p1, true);
			} else {
				this.p1.send(`|pm|~Rock/Paper/Scissors${this.gameType !== "ladderRPSLS" ? `` : `/Lizard/Spock`} Host|${this.p1.userid}|/html You have lost due to inactivity.`);
				this.p2.send(`|pm|~Rock/Paper/Scissors${this.gameType !== "ladderRPSLS" ? `` : `/Lizard/Spock`} Host|${this.p2.userid}|/html You have lost due to inactivity.`);
			}
			this.p1.RPSgame = null;
			this.p2.RPSgame = null;
			delete Rooms.global.RPS.games[this.gameId];
			return;
		}
		let resultTable = {
			"rr": "pp",
			"rp": "p2",
			"rs": "p1",
			"rsp": "p1",
			"rl": "p1",
			"pp": "pp",
			"pr": "p1",
			"ps": "p2",
			"psp": "p1",
			"pl": "p2",
			"ss": "pp",
			"sp": "p1",
			"sr": "p2",
			"ssp": "p2",
			"sl": "p1",
			"spsp": "pp",
			"spr": "p1",
			"spp": "p2",
			"sps": "p1",
			"spl": "p2",
			"ll": "pp",
			"lr": "p2",
			"lp": "p1",
			"ls": "p2",
			"lsp": "p1",
		};
		let winner, loser;
		let gameResult = resultTable[this.p1choice.toLowerCase() + this.p2choice.toLowerCase()];
		if (gameResult === "pp") {
			// tie
			this.p1.send(`|pm|~Rock/Paper/Scissors${this.gameType !== "ladderRPSLS" ? `` : `/Lizard/Spock`} Host|${this.p1.userid}|/html The game with ${WL.nameColor(this.p2.name, true)} was a tie! ${WL.nameColor(this.p2.name, true)} has chose ${choiceNames[this.p2choice]}.`);
			this.p2.send(`|pm|~Rock/Paper/Scissors${this.gameType !== "ladderRPSLS" ? `` : `/Lizard/Spock`} Host|${this.p2.userid}|/html The game with ${WL.nameColor(this.p1.name, true)} was a tie! ${WL.nameColor(this.p1.name, true)} has chose ${choiceNames[this.p1choice]}.`);
			if (this.gameType === "bucks") {
				// return their 3 bucks each
				Economy.writeMoney(this.p1.userid, 3);
				Economy.writeMoney(this.p2.userid, 3);
				Economy.logTransaction(`${this.p1.name} had a tie with ${this.p2.name} resulting in both getting their buy-in fee (of 3 ${currencyPlural}} back.`);
			}
		} else if (gameResult === "p1") {
			winner = this.p1;
			loser = this.p2;
			this.parseWin(winner, loser);
		} else if (gameResult === "p2") {
			winner = this.p2;
			loser = this.p1;
			this.parseWin(winner, loser);
		}
		// destroy this object
		this.p1.RPSgame = null;
		this.p2.RPSgame = null;
		delete Rooms.global.RPS.games[this.gameId];
	}

	parseWin(winner, loser, inactivity) {
		winner.send(`|pm|~Rock/Paper/Scissors${this.gameType !== "ladderRPSLS" ? `` : `/Lizard/Spock`} Host|${winner.userid}|/html You have won the game against ${WL.nameColor(loser.name, true)}! ${(!inactivity ? `${WL.nameColor(loser.name, true)} has chose ${choiceNames[(winner.userid === this.p1.userid ? this.p2choice : this.p1choice)]}.` : ``)}`);
		loser.send(`|pm|~Rock/Paper/Scissors${this.gameType !== "ladderRPSLS" ? `` : `/Lizard/Spock`} Host|${loser.userid}|/html You have lost the game against ${WL.nameColor(winner.name, true)}! ${(!inactivity ? `${WL.nameColor(winner.name, true)} has chose ${choiceNames[(loser.userid === this.p1.userid ? this.p2choice : this.p1choice)]}.` : ``)}`);
		if (this.gameType === "bucks") {
			// set but bucks
			Economy.writeMoney(winner.userid, 6);
			Economy.logTransaction(`${winner.name} has won a game of RPS against ${loser.name} and gained 6 ${currencyPlural}.`);
			winner.send(`|pm|~Rock/Paper/Scissors${this.gameType !== "ladderRPSLS" ? `` : `/Lizard/Spock`} Host|${winner.userid}|/html You have also won 6 ${currencyPlural}.`);
		} else {
			let file = Db.rpsrank;
			if (this.gameType === "ladderRPSLS") file = Db.rpslsrank;
			// do rank change
			let winnerPoints = file.get(winner.userid, 1000);
			let loserPoints = file.get(loser.userid, 1000);
			let difference = Math.abs(winnerPoints - loserPoints);
			let winnerPointGain, loserPointGain;
			let pointGain = ~~(difference / 4) + 8;
			if (winnerPoints > loserPoints) {
				pointGain = 12;
			}
			winnerPointGain = pointGain;
			loserPointGain = -1 * pointGain;

			// give points to the winner;
			if (winnerPoints < 1050) {
				winnerPointGain = winnerPointGain >= 23 ? winnerPointGain : 23;
			}
			if (winnerPoints < 1125) {
				winnerPointGain *= 2;
			}
			// limit gains
			if (winnerPointGain < 12) winnerPointGain = 12;
			if (winnerPointGain > 75) winnerPointGain = 75;
			let winnerFinalPoints = winnerPoints + winnerPointGain;
			file.set(winner.userid, winnerFinalPoints);

			// deduct points from loser
			if (winnerPoints > loserPoints) {
				loserPointGain = Math.ceil(loserPointGain / 2);
			}
			// limit losses
			if (loserPointGain > -6) loserPointGain = -6;
			if (loserPointGain < -50) loserPointGain = -50;
			let loserFinalPoints = loserPoints + loserPointGain;
			// unable to go below 1000;
			if (loserFinalPoints < 1000) loserFinalPoints = 1000;
			file.set(loser.userid, loserFinalPoints);

			// announce the change in rank
			winner.send(`|pm|~Rock/Paper/Scissors${this.gameType !== "ladderRPSLS" ? `` : `/Lizard/Spock`} Host|${winner.userid}|/html ${WL.nameColor(winner.name, true)}: ${winnerPoints} --> ${winnerFinalPoints}<br />${WL.nameColor(loser.name, true)}: ${loserPoints} --> ${loserFinalPoints}`);
			loser.send(`|pm|~Rock/Paper/Scissors${this.gameType !== "ladderRPSLS" ? `` : `/Lizard/Spock`} Host|${loser.userid}|/html ${WL.nameColor(winner.name, true)}: ${winnerPoints} --> ${winnerFinalPoints}<br />${WL.nameColor(loser.name, true)}: ${loserPoints} --> ${loserFinalPoints}`);
		}
	}
}

function newSearch(user, gameTypeId) {
	for (let search in Rooms.global.RPS.searches) {
		if (Rooms.global.RPS.searches[search] === gameTypeId) {
			// same IP check
			if (Users.get(search).latestIp === user.latestIp && ["ladderRPS", "ladderRPSLS"].includes(gameTypeId)) continue;
			delete Rooms.global.RPS.searches[search];
			return new RPSGame(user, Users.get(search), gameTypeId);
		}
	}
	// no search found
	Rooms.global.RPS.searches[user.userid] = gameTypeId;
	return false;
}

function updateSearches() {
	let updatedSearches = {};
	for (let userid in Rooms.global.RPS.searches) {
		let user = Users.get(userid);
		if (user && user.connected) {
			// get user's latest userid
			updatedSearches[user.userid] = Rooms.global.RPS.searches[userid];
		} else {
			// return bucks if it's a search for bucks
			if (updatedSearches[user.userid] === "bucks") {
				Economy.writeMoney(userid, 3);
				Economy.logTransaction(`${user.name} was refunded their join fee of 3 ${currencyPlural} from their RPS buy-in matches.`);
			}
		}
	}
	Rooms.global.RPS.searches = updatedSearches;
}

exports.commands = {
	rockpaperscissors: "rps",
	rpsls: "rps",
	rps: {
		searchladder: "search",
		searchgame: "search",
		searchrpsls: "search",
		search: function (target, room, user, connection, cmd) {
			if (user.RPSgame) return this.errorReply(`You are already in a game or searching for a game of Rock/Paper/Scissors!`);
			updateSearches();
			let gameType = "ladderRPS";
			if (target && target === "bucks") {
				Economy.readMoney(user.userid, money => {
					if (money < 3) return this.errorReply(`You do not have 3 ${currencyPlural} to play a bucks match.`);
					gameType = "bucks";
					Economy.writeMoney(user.userid, -3);
					Economy.logTransaction(`${user.name} has paid a 3 ${currencyPlural} buy-in fee to play a RPS bucks match.`);
				});
			}
			user.RPSgame = `searching`;
			if (cmd === "searchrpsls") {
				gameType = "ladderRPSLS";
				user.RPSgame = `searchingRPSLS`;
			}
			newSearch(user, gameType);
			this.sendReply(`You are now searching for a game of Rock/Paper/Scissors${cmd !== "searchrpsls" ? `` : `/Lizard/Spock`} (${gameType}).`);
		},

		cancel: "endsearch",
		cancelsearch: "endsearch",
		stop: "stopsearch",
		stopsearch: "endsearch",
		end: "endsearch",
		endsearch: function (target, room, user) {
			if (!user.RPSgame || !["searching", "searchingRPSLS"].includes(user.RPSgame)) return this.errorReply("You are not searching for a game of Rock/Paper/Scissors!");
			updateSearches();
			if (Rooms.global.RPS.searches[user.userid] === "bucks") {
				Economy.writeMoney(user.userid, 3);
				Economy.logTransaction(`${user.name} has cancelled their search for a Rock/Paper/Scissors${user.RPSgame === "searching" ? `` : `/Lizard/Spock`} match and was refunded their 3 ${currencyPlural} buy-in fee.`);
			}
			delete Rooms.global.RPS.searches[user.userid];
			user.RPSgame = null;
			this.sendReply(`You have cancelled your search for a game of Rock/Paper/Scissors.`);
		},

		select: "choose",
		choose: function (target, room, user) {
			if (!target || !user.RPSgame) return false;
			let parts = target.split(" ");
			if (parts.length !== 2) return false;
			let choice = parts[0].toUpperCase();
			let gameId = parts[1];
			if (gameId !== user.RPSgame) return false;
			if (Rooms.global.RPS.games[gameId]) {
				if (Rooms.global.RPS.games[gameId].gameType !== "ladderRPSLS") {
					if (["R", "P", "S"].indexOf(choice) === -1) return false;
					Rooms.global.RPS.games[gameId].onChoose(user, choice);
				} else {
					if (["R", "P", "S", "L", "SP"].indexOf(choice) === -1) return false;
					Rooms.global.RPS.games[gameId].onChoose(user, choice);
				}
			}
		},

		"!rank": true,
		rpslspoints: "rank",
		points: "rank",
		rpslsranking: "rank",
		ranking: "rank",
		rpslsrank: "rank",
		rank: function (target, room, user, connection, cmd) {
			if (!this.runBroadcast()) return false;
			if (!target) target = user.userid;
			target = toId(target);
			let rpslsCommands = ["rpslsrank", "rpslsranking", "rpslspoints"];
			let file = Db.rpsrank;
			if (rpslsCommands.includes(cmd)) file = Db.rpslsrank;
			let userRank = file.get(toId(target), 1000);
			this.sendReplyBox(`<strong>Rank - ${WL.nameColor(target, true)}: ${userRank}</strong>`);
		},

		"!ladder": true,
		rpslsleaderboard: "ladder",
		rpsleaderboard: "ladder",
		leaderboard: "ladder",
		rpslsladder: "ladder",
		rpsladder: "ladder",
		ladder: function (target, room, user, connection, cmd) {
			if (!this.runBroadcast()) return false;
			let rpslsCommands = ["rpslsleaderboard", "rpslsladder"];
			let file = Db.rpsrank;
			if (rpslsCommands.includes(cmd)) file = Db.rpslsrank;
			if (!target) target = 100;
			target = Number(target);
			if (isNaN(target)) target = 100;
			let keys = file.keys().map(name => {
				return {name: name, points: file.get(name)};
			});
			if (!keys.length) return this.errorReply(`There is currently no ranked data for RPS${!rpslsCommands.includes(cmd) ? `` : `LS`} at this moment.`);
			keys.sort(function (a, b) { return b.points - a.points; });
			this.sendReplyBox(rankLadder(`RPS${!rpslsCommands.includes(cmd) ? `` : `LS`} Ladder`, "Points", keys.slice(0, target), "points"));
		},

		"": "help",
		help: function () {
			this.parse("/help rps");
		},
	},

	rpshelp: [
		`/rps search [bucks] - Searches for a game of Rock/Paper/Scissors for ladder points or bucks; defaults to ladder points.
		/rps searchrpsls - Searches a game of Rock/Paper/Scissors/Lizard/Spock for ladder points.
		/rps endsearch - Stop searching for a game of Rock/Paper/Scissors.
		/rps choose [choice] - Selects your move in Rock/Paper/Scissors.
		/rps rank [user] - Shows [user]'s rank for Rock/Paper/Scissors; defaults to yourself.
		/rps rpslsrank [user] - Shows [user]'s rank for Rock/Paper/Scissors/Lizard/Spock; defaults to yourself.
		/rps ladder - Shows Top 100 on the RPS ladder.
		/rps rpslsladder - Shows Top 100 on the RPSLS ladder.
		/rps help - Displays the list of RPS(LS) commands.`,
	],
};
