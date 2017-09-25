/*
 * roomevents.js
 * This file handles all games / events taking place in chat.
 * 
 * If you add games in, please give credit when credit is due.
 * 
 * If you have questions regarding if your plugin should be
 * in this file, feel free to contact us at wavelength.psim.us/development 
 */
 
 /* CREDITS: UNO by: SparkyChild *
  *     Dice by: SilverTactic    *
  * 	 Drafts by: Execute      *
  *     Lottery by: panpawn      */
 
'use strict';

const moment = require('moment');
const fs = require('fs');
const path = require('path');
const INACTIVE_END_TIME = 1 * 60 * 1000; // 1 minute
const TAX = 0;
let greencss = 'background:#ccffcc;padding:10px;color:#006600;border:1px solid #006600; border-radius:6px;text-align:center;';
let redcss = 'background:##ffb3b3;padding:10px;color:#ff3333;border:1px solid #ff3333;border-radius:6px;text-align:center;';
let drafts = {};
WL.lottery = {};


function diceImg(num) {
	switch (num) {
	case 0:
		return "http://i.imgur.com/nUbpLTD.png";
	case 1:
		return "http://i.imgur.com/BSt9nfV.png";
	case 2:
		return "http://i.imgur.com/eTQMVhY.png";
	case 3:
		return "http://i.imgur.com/3Y2hCAJ.png";
	case 4:
		return "http://i.imgur.com/KP3Za7O.png";
	case 5:
		return "http://i.imgur.com/lvi2ZZe.png";
	}
}

class Dice {
	constructor(room, amount, starter) {
		this.room = room;
		if (!this.room.diceCount) this.room.diceCount = 0;
		this.bet = amount;
		this.players = [];
		this.timer = setTimeout(() => {
			this.room.add('|uhtmlchange|' + this.room.diceCount + '|<div class = "infobox">(This game of dice has been ended due to inactivity.)</div>').update();
			delete this.room.dice;
		}, INACTIVE_END_TIME);

		let buck = (this.bet === 1 ? 'buck' : 'bucks');
		this.startMessage = '<div class="infobox"><b style="font-size: 14pt; color: #24678d"><center><span style="color: ' + WL.hashColor(starter) + '">' + Chat.escapeHTML(starter) + '</span> has started a game of dice for <span style = "color: green">' + amount + '</span> ' + buck + '!</center></b><br>' +
			'<center><img style="margin-right: 30px;" src = "http://i.imgur.com/eywnpqX.png" width="80" height="80">' +
			'<img style="transform:rotateY(180deg); margin-left: 30px;" src="http://i.imgur.com/eywnpqX.png" width="80" height="80"><br>' +
			'<button name="send" value="/joindice">Click to join!</button></center>';
		this.room.add('|uhtml|' + (++this.room.diceCount) + '|' + this.startMessage + '</div>').update();
	}

	join(user, self) {
		if (this.players.length >= 2) return self.errorReply("Two users have already joined this game of dice.");
		Economy.readMoney(user.userid, money => {
			if (money < this.bet) return self.sendReply('You don\'t have enough money for this game of dice.');
			if (this.players.includes(user)) return self.sendReply('You have already joined this game of dice.');
			if (this.players.length && this.players[0].latestIp === user.latestIp) return self.errorReply("You have already joined this game of dice under the alt '" + this.players[0].name + "'.");
			if (this.players.length >= 2) return self.errorReply("Two users have already joined this game of dice.");

			this.players.push(user);
			this.room.add('|uhtmlchange|' + this.room.diceCount + '|' + this.startMessage + '<center>' + WL.nameColor(user.name) + ' has joined the game!</center></div>').update();
			if (this.players.length === 2) this.play();
		});
	}

	leave(user, self) {
		if (!this.players.includes(user)) return self.sendReply('You haven\'t joined this game of dice yet.');
		if (this.players.length >= 2) return self.errorReply("You cannot leave a game of dice once it has been started.");
		this.players.splice(this.players.indexOf(user), 1);
		this.room.add('|uhtmlchange|' + this.room.diceCount + '|' + this.startMessage + '</div>');
	}

	play() {
		let p1 = this.players[0], p2 = this.players[1];
		Economy.readMoney(p1.userid, money1 => {
			Economy.readMoney(p2.userid, money2 => {
				if (money1 < this.bet || money2 < this.bet) {
					let user = (money1 < this.bet ? p1 : p2);
					let other = (user === p1 ? p2 : p1);
					user.sendTo(this.room, 'You have been removed from this game of dice, as you do not have enough money.');
					other.sendTo(this.room, user.name + ' has been removed from this game of dice, as they do not have enough money. Wait for another user to join.');
					this.players.splice(this.players.indexOf(user), 1);
					this.room.add('|uhtmlchange|' + this.room.diceCount + '|' + this.startMessage + '<center>' + this.players.map(user => WL.nameColor(user.name)) + ' has joined the game!</center>').update();
					return;
				}
				let players = this.players.map(user => WL.nameColor(user.name)).join(' and ');
				this.room.add('|uhtmlchange|' + this.room.diceCount + '|' + this.startMessage + '<center>' + players + ' have joined the game!</center></div>').update();
				let roll1, roll2;
				do {
					roll1 = Math.floor(Math.random() * 6);
					roll2 = Math.floor(Math.random() * 6);
				} while (roll1 === roll2);
				if (roll2 > roll1) this.players.reverse();
				let winner = this.players[0], loser = this.players[1];


				let taxedAmt = Math.round(this.bet * TAX);
				setTimeout(() => {
					let buck = (this.bet === 1 ? 'buck' : 'bucks');
					this.room.add('|uhtmlchange|' + this.room.diceCount + '|<div class="infobox"><center>' + players + ' have joined the game!<br /><br />' +
						'The game has been started! Rolling the dice...<br />' +
						'<img src = "' + diceImg(roll1) + '" align = "left" title = "' + Chat.escapeHTML(p1.name) + '\'s roll"><img src = "' + diceImg(roll2) + '" align = "right" title = "' + p2.name + '\'s roll"><br />' +
						WL.nameColor(p1.name, true) + ' rolled ' + (roll1 + 1) + '!<br />' +
						WL.nameColor(p2.name, true) + ' rolled ' + (roll2 + 1) + '!<br />' +
						WL.nameColor(winner.name, true) + ' has won <b style="color:green">' + (this.bet - taxedAmt) + '</b> ' + buck + '!<br />' +
						'Better luck next time, ' + WL.nameColor(loser.name) + '!'
					).update();
					Economy.writeMoney(winner.userid, (this.bet - taxedAmt), () => {
						Economy.writeMoney(loser.userid, -this.bet, () => {
							Economy.readMoney(winner.userid, winnerMoney => {
								Economy.readMoney(loser.userid, loserMoney => {
									Economy.logDice(winner.userid + " has won a dice against " + loser.userid + ". They now have " + winnerMoney + (winnerMoney === 1 ? " buck." : " bucks."));
									Economy.logDice(loser.userid + " has lost a dice against " + winner.userid + ". T hey now have " + loserMoney + (loserMoney === 1 ? " buck." : " bucks."));
									this.end();
								});
							});
						});
					});
				}, 800);
			});
		});
	}

	end(user) {
		if (user) this.room.add('|uhtmlchange|' + this.room.diceCount + '|<div class = "infobox">(This game of dice has been forcibly ended by ' + Chat.escapeHTML(user.name) + '.)</div>').update();
		clearTimeout(this.timer);
		delete this.room.dice;
	}
}

const maxTime = 120; // seconds

const textColors = {
	'Green': "rgb(0, 128, 0)",
	'Yellow': "rgb(175, 165, 40)",
	'Blue': "rgb(75, 75, 255)",
	'Red': "rgb(255, 0, 0)",
	'Black': 'inherit',
};

const cardImages = {
	'Red': {
		'0': ['https://i.imgur.com/EDkhoc3.png', 'https://i.imgur.com/KDAvqho.png'],
		'1': ['http://i.imgur.com/2CmkOfZ.png', 'http://i.imgur.com/LG5ZEBh.png'],
		'2': ['http://i.imgur.com/GnAbg2O.png', 'http://i.imgur.com/fz6dsPC.png'],
		'3': ['http://i.imgur.com/KG2DlU0.png', 'http://i.imgur.com/7WWO0O1.png'],
		'4': ['http://i.imgur.com/bL15w1H.png', 'http://i.imgur.com/SciPCET.png'],
		'5': ['http://i.imgur.com/65gLmtS.png', 'http://i.imgur.com/F9uYr0l.png'],
		'6': ['http://i.imgur.com/zO1QKIx.png', 'http://i.imgur.com/o6YgVNk.png'],
		'7': ['http://i.imgur.com/TRbnmlC.png', 'http://i.imgur.com/Zv2bImk.png'],
		'8': ['http://i.imgur.com/NgAlOvb.png', 'http://i.imgur.com/Zo7OM6q.png'],
		'9': ['http://i.imgur.com/ed4GgFY.png', 'http://i.imgur.com/nQdDcPC.png'],
		'Reverse': ['http://i.imgur.com/1II7MXH.png', 'http://i.imgur.com/PGSUrZr.png'],
		'Skip': ['http://i.imgur.com/ud1XP2T.png', 'http://i.imgur.com/gg5BUWh.png'],
		'+2': ['http://i.imgur.com/Ie83rhz.png', 'http://i.imgur.com/T4uwyQC.png'],
	},
	'Blue': {
		'0': ['https://i.imgur.com/USxkz00.png', 'https://i.imgur.com/uBpitT3.png'],
		'1': ['http://i.imgur.com/UPQtfFS.png', 'http://i.imgur.com/yhoJa5A.png'],
		'2': ['http://i.imgur.com/oda2Jgc.png', 'http://i.imgur.com/y8HkEWj.png'],
		'3': ['http://i.imgur.com/GV1KoS8.png', 'http://i.imgur.com/Y9dw9rH.png'],
		'4': ['http://i.imgur.com/YbrUZZl.png', 'hhttp://i.imgur.com/2ZOG5cE.png'],
		'5': ['http://i.imgur.com/0LNEV9u.png', 'http://i.imgur.com/ODF2g9a.png'],
		'6': ['http://i.imgur.com/sesxOUz.png', 'http://i.imgur.com/Zo6aRE3.png'],
		'7': ['http://i.imgur.com/DCXYkHE.png', 'http://i.imgur.com/vOKI7YE.png'],
		'8': ['http://i.imgur.com/sr3ycsf.png', 'http://i.imgur.com/DGDSpX2.png'],
		'9': ['http://i.imgur.com/ku26T44.png', 'http://i.imgur.com/NoGcuFG.png'],
		'Reverse': ['http://i.imgur.com/73IKBT0.png', 'http://i.imgur.com/1aqFEmr.png'],
		'Skip': ['http://i.imgur.com/ooI5g8V.png', 'http://i.imgur.com/ClaaNj3.png'],
		'+2': ['http://i.imgur.com/Kc2aYFm.png', 'http://i.imgur.com/09BhP1E.png'],
	},
	'Green': {
		'0': ['https://i.imgur.com/B4RtNx3.png', 'https://i.imgur.com/CaFXPI0.png'],
		'1': ['http://i.imgur.com/oRjVKXU.png', 'http://i.imgur.com/srixETl.png'],
		'2': ['http://i.imgur.com/GoTH1bl.png', 'http://i.imgur.com/pO8DtWo.png'],
		'3': ['http://i.imgur.com/O91W7VJ.png', 'http://i.imgur.com/LI2GTY6.png'],
		'4': ['http://i.imgur.com/nxnPhh9.png', 'http://i.imgur.com/uRBViWu.png'],
		'5': ['http://i.imgur.com/BtXeP5G.png', 'http://i.imgur.com/BgsnkQx.png'],
		'6': ['http://i.imgur.com/woHf1Ci.png', 'http://i.imgur.com/VHgXzWw.png'],
		'7': ['http://i.imgur.com/RJNDaN0.png', 'http://i.imgur.com/r8Qza9I.png'],
		'8': ['http://i.imgur.com/I5V3XaR.png', 'http://i.imgur.com/swfvqLY.png'],
		'9': ['http://i.imgur.com/1DuX0EZ.png', 'http://i.imgur.com/6WSVugH.png'],
		'Reverse': ['http://i.imgur.com/YECYXav.png', 'http://i.imgur.com/fB8PNLX.png'],
		'Skip': ['http://i.imgur.com/SxtBeO8.png', 'http://i.imgur.com/bQLW8NR.png'],
		'+2': ['http://i.imgur.com/c8dQDj1.png', 'http://i.imgur.com/Vrm9HQf.png'],
	},
	'Yellow': {
		'0': ['https://i.imgur.com/lrOTrA2.png', 'https://i.imgur.com/NTSlL01.png'],
		'1': ['http://i.imgur.com/iuBKJK3.png', 'http://i.imgur.com/gLKaoiX.png'],
		'2': ['http://i.imgur.com/CRsDiE0.png', 'http://i.imgur.com/kKiNrnG.png'],
		'3': ['http://i.imgur.com/t51aCvW.png', 'http://i.imgur.com/WMTnBrh.png'],
		'4': ['http://i.imgur.com/w7CfOhG.png', 'http://i.imgur.com/wenaxRC.png'],
		'5': ['http://i.imgur.com/il4ot0O.png', 'http://i.imgur.com/YqljaUj.png'],
		'6': ['http://i.imgur.com/TDGzvlE.png', 'http://i.imgur.com/96lpoMf.png'],
		'7': ['http://i.imgur.com/h65iQaC.png', 'http://i.imgur.com/sx1LhK9.png'],
		'8': ['http://i.imgur.com/QSTYJxq.png', 'http://i.imgur.com/zSiYPZ4.png'],
		'9': ['http://i.imgur.com/8lV4UPp.png', 'http://i.imgur.com/IKxT4a5.png'],
		'Reverse': ['http://i.imgur.com/lUPmvTW.png', 'http://i.imgur.com/65Rdy35.png'],
		'Skip': ['http://i.imgur.com/z99dERC.png', 'http://i.imgur.com/Ps7xyC1.png'],
		'+2': ['http://i.imgur.com/eMYpZI0.png', 'http://i.imgur.com/5ZVAGyW.png'],
	},
	'Black': {
		'Wild': ['https://i.imgur.com/xWy8VM5.png', 'https://i.imgur.com/wdLeyR1.png'],
		'+4': ['http://i.imgur.com/25T2j9b.png', 'http://i.imgur.com/sunITaw.png'],
	},
};

const colors = ['Red', 'Blue', 'Green', 'Yellow'];
const values = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'Reverse', 'Skip', '+2'];

function cardImg(card, fullsize) {
	let img = cardImages[card.color][card.value];
	if (!img) return null;
	img = img[(fullsize ? 1 : 0)];
	if (!img) return null;
	return img;
}

function cardHTML(card, fullsize) {
	let img = cardImg(card, fullsize);
	return `<button class="button" style="height: 135px; width: ${fullsize ? '72' : '37'}px; border-radius: 10px 2px 2px 3px; background-image: url('${img}');" name=send value="/uno play ${card.name}" title="${card.color + card.value}"></button>`;
}

function createDeck() {
	let basic = [];

	for (let i = 0; i < 4; i++) {
		let color = colors[i];
		basic.push(...values.map(v => {
			return {value: v, color: color, name: color + " " + v};
		}));
	}

	return [...basic, ...basic, // two copies of the basic stuff (total 96)
		...[0, 1, 2, 3].map(v => ({color: colors[v], value: '0', name: colors[v] + ' 0'})), // the 4 0s
		...[0, 1, 2, 3].map(v => ({color: 'Black', value: 'Wild', name: 'Wild'})), // wild cards
		...[0, 1, 2, 3].map(v => ({color: 'Black', value: '+4', name: "Wild +4"})), // wild +4 cards
	]; // 108 cards
}

class UNOgame extends Rooms.RoomGame {
	constructor(room, cap, suppressMessages) {
		super(room);

		if (room.gameNumber) {
			room.gameNumber++;
		} else {
			room.gameNumber = 1;
		}

		cap = parseInt(cap) || 6;
		if (cap < 2) cap = 2;

		this.playerCap = cap;
		this.allowRenames = true;
		this.maxTime = maxTime;

		this.gameid = 'uno';
		this.title = 'UNO';

		this.state = 'signups';

		this.currentPlayer = null;
		this.deck = Dex.shuffle(createDeck());
		this.discards = [];
		this.topCard = null;

		this.direction = 1;

		this.suppressMessages = suppressMessages || false;
		this.spectators = {};

		this.sendToRoom(`|uhtml|uno-${this.room.gameNumber}|<div class="broadcast-green"><p style="font-size: 14pt; text-align: center">A new game of <strong>UNO</strong> is starting!</p><p style="font-size: 9pt; text-align: center"><button name="send" value="/uno join">Join</button><br />Or use <strong>/uno join</strong> to join the game.</p>${(this.suppressMessages ? `<p style="font-size: 6pt; text-align: center">Game messages will be shown to only players.  If you would like to spectate the game, use <strong>/uno spectate</strong></p>` : '')}</div>`, true);
	}

	onUpdateConnection() {}

	onConnect(user, connection) {
		if (this.state === 'signups') {
			connection.sendTo(this.room, `|uhtml|uno-${this.room.gameNumber}|<div class="broadcast-green"><p style="font-size: 14pt; text-align: center">A new game of <strong>UNO</strong> is starting!</p><p style="font-size: 9pt; text-align: center"><button name="send" value="/uno join">Join</button><br />Or use <strong>/uno join</strong> to join the game.</p>${(this.suppressMessages ? `<p style="font-size: 6pt; text-align: center">Game messages will be shown to only players.  If you would like to spectate the game, use <strong>/uno spectate</strong></p>` : '')}</div>`);
		} else if (this.onSendHand(user) === false) {
			connection.sendTo(this.room, `|uhtml|uno-${this.room.gameNumber}|<div class="infobox"><p>A UNO game is currently in progress.</p>${(this.suppressMessages ? `<p style="font-size: 6pt">Game messages will be shown to only players.  If you would like to spectate the game, use <strong>/uno spectate</strong></p>` : '')}</div>`);
		}
	}

	onStart() {
		if (this.playerCount < 2) return false;
		this.sendToRoom(`|uhtmlchange|uno-${this.room.gameNumber}|<div class="infobox"><p>The game of UNO has started.</p>${(this.suppressMessages ? `<p style="font-size: 6pt">Game messages will be shown to only players.  If you would like to spectate the game, use <strong>/uno spectate</strong></p>` : '')}</div>`, true);
		this.state = 'play';

		this.onNextPlayer(); // determines the first player

		// give cards to the players
		for (let i in this.players) {
			this.players[i].hand.push(...this.drawCard(7));
		}

		// top card of the deck.
		do {
			this.topCard = this.drawCard(1)[0];
			this.discards.unshift(this.topCard);
		} while (this.topCard.color === 'Black');

		this.sendToRoom(`|raw|The top card is <span style="color: ${textColors[this.topCard.color]}">${this.topCard.name}</span>.`);

		this.onRunEffect(this.topCard.value, true);
		this.nextTurn(true);
	}

	joinGame(user) {
		if (this.state === 'signups' && this.addPlayer(user)) {
			this.sendToRoom(`|html|${WL.nameColor(user.name, true, true)} has joined the game of UNO.`);
			return true;
		}
		return false;
	}

	leaveGame(user) {
		if (this.state === 'signups' && this.removePlayer(user)) {
			this.sendToRoom(`${user.name} has left the game of UNO.`);
			return true;
		}
		return false;
	}

	// overwrite the default makePlayer so it makes a UNOgamePlayer instead.
	makePlayer(user) {
		return new UNOgamePlayer(user, this);
	}

	onRename(user, oldUserid, isJoining, isForceRenamed) {
		if (!(oldUserid in this.players) || user.userid === oldUserid) return false;
		if (!user.named && !isForceRenamed) {
			user.games.delete(this.id);
			user.updateSearch();
			return; // dont set users to their guest accounts.
		}
		this.players[user.userid] = this.players[oldUserid];
		if (user.userid !== oldUserid) delete this.players[oldUserid]; // only run if it's a rename that involves a change of userid

		// update the user's name information
		this.players[user.userid].name = user.name;
		this.players[user.userid].userid = user.userid;
		if (this.awaitUno && this.awaitUno === oldUserid) this.awaitUno = user.userid;

		if (this.currentPlayer && this.currentPlayer === oldUserid) this.currentPlayer = user.userid;
	}

	eliminate(userid) {
		if (!(userid in this.players)) return false;

		let name = this.players[userid].name;

		if (this.playerCount === 2) {
			this.removePlayer({userid: userid});
			this.onWin(this.players[Object.keys(this.players)[0]]);
			return name;
		}

		// handle current player...
		if (userid === this.currentPlayer) {
			if (this.state === 'color') {
				this.topCard.changedColor = this.discards[1].changedColor || this.discards[1].color;
				this.sendToRoom(`|raw|${Chat.escapeHTML(name)} has not picked a color, the color will stay as <span style="color: ${textColors[this.topCard.changedColor]}">${this.topCard.changedColor}</span>.`);
			}

			clearTimeout(this.timer);
			this.nextTurn();
		}

		// put that player's cards into the discard pile to prevent cards from being permanently lost
		this.discards.push(...this.players[userid].hand);

		this.removePlayer({userid: userid});
		return name;
	}

	sendToRoom(msg, overrideSuppress) {
		if (!this.suppressMessages || overrideSuppress) {
			this.room.add(msg).update();
		} else {
			// send to the players first
			for (let i in this.players) {
				this.players[i].sendRoom(msg);
			}

			// send to spectators
			for (let i in this.spectators) {
				if (i in this.players) continue; // don't double send to users already in the game.
				let user = Users.getExact(i);
				if (user) user.sendTo(this.id, msg);
			}
		}
	}

	getPlayers(showCards) {
		let playerList = Object.keys(this.players);
		if (!showCards) {
			return playerList.sort().map(id => WL.nameColor(this.players[id].name, false, true));
		}
		if (this.direction === -1) playerList = playerList.reverse();
		return playerList.map(id => `${(this.currentPlayer && this.currentPlayer === id ? "<strong>" : "")}${WL.nameColor(this.players[id].name, false, true)} (${this.players[id].hand.length}) ${(this.currentPlayer && this.currentPlayer === id ? "</strong>" : "")}`);
	}

	onAwaitUno() {
		return new Promise((resolve, reject) => {
			if (!this.awaitUno) return resolve();

			this.state = "uno";
			// the throttle for sending messages is at 600ms for non-authed users,
			// wait 750ms before sending the next person's turn.
			// this allows games to be fairer, so the next player would not spam the pass command blindly
			// to force the player to draw 2 cards.
			// this also makes games with uno bots not always turn in the bot's favour.
			// without a delayed turn, 3 bots playing will always result in a endless game
			setTimeout(() => resolve(), 750);
		});
	}

	nextTurn(starting) {
		this.onAwaitUno()
			.then(() => {
				if (!starting) this.onNextPlayer();

				clearTimeout(this.timer);
				let player = this.players[this.currentPlayer];

				this.sendToRoom(`|c:|${(Math.floor(Date.now() / 1000))}|~|${player.name}'s turn.`);
				this.state = 'play';
				if (player.cardLock) delete player.cardLock;
				player.sendDisplay();

				this.timer = setTimeout(() => {
					this.sendToRoom(`${WL.nameColor(player.name, true, true)} has been automatically disqualified.`);
					this.eliminate(this.currentPlayer);
				}, this.maxTime * 1000);
			});
	}

	onNextPlayer() {
		// if none is set
		if (!this.currentPlayer) {
			let userList = Object.keys(this.players);
			this.currentPlayer = userList[Math.floor(this.playerCount * Math.random())];
		}

		this.currentPlayer = this.getNextPlayer();
	}

	getNextPlayer() {
		let userList = Object.keys(this.players);

		let player = userList[(userList.indexOf(this.currentPlayer) + this.direction)];

		if (!player) {
			player = this.direction === 1 ? userList[0] : userList[this.playerCount - 1];
		}
		return player;
	}

	onDraw(user) {
		if (this.currentPlayer !== user.userid || this.state !== 'play') return false;
		if (this.players[user.userid].cardLock) return true;

		this.onCheckUno();

		this.sendToRoom(`|html|${WL.nameColor(user.name, true, true)} has drawn a card.`);
		let player = this.players[user.userid];

		let card = this.onDrawCard(user, 1, true);
		player.sendDisplay();
		player.cardLock = card[0].name;
	}

	onPlay(user, cardName) {
		if (this.currentPlayer !== user.userid || this.state !== 'play') return false;
		let player = this.players[user.userid];

		let card = player.hasCard(cardName);
		if (!card) return "You do not have that card.";

		// check for legal play
		if (player.cardLock && player.cardLock !== cardName) return `You can only play ${player.cardLock} after drawing.`;
		if (card.color !== 'Black' && card.color !== (this.topCard.changedColor || this.topCard.color) && card.value !== this.topCard.value) return `You cannot play this card - you can only play: Wild cards, ${(this.topCard.changedColor ? 'and' : '')} ${(this.topCard.changedColor || this.topCard.color)} cards${this.topCard.changedColor ? "" : ` and ${this.topCard.value}'s`}.`;
		if (card.value === '+4' && !player.canPlayWildFour()) return "You cannot play Wild +4 when you still have a card with the same color as the top card.";

		clearTimeout(this.timer); // reset the autodq timer.

		this.onCheckUno();

		// update the game information.
		this.topCard = card;
		player.removeCard(cardName);
		this.discards.unshift(card);

		// update the unoId here, so when the display is sent to the player when the play is made
		if (player.hand.length === 1) {
			this.awaitUno = user.userid;
			this.unoId = Math.floor(Math.random() * 100).toString();
		}

		player.sendDisplay(); // update display without the card in it for purposes such as choosing colors

		this.sendToRoom(`|raw|${WL.nameColor(player.name, true, true)} has played a <span style="color: ${textColors[card.color]}">${card.name}</span>.`);

		// handle hand size
		if (!player.hand.length) {
			this.onWin(player);
			return;
		}

		// continue with effects and next player
		this.onRunEffect(card.value);
		if (this.state === 'play') this.nextTurn();
	}

	onRunEffect(value, initialize) {
		const colorDisplay = `|uhtml|uno-hand|<table style="width: 100%; border: 1px solid black"><tr><td style="width: 50%"><button style="width: 100%; background-color: red; border: 2px solid rgba(0 , 0 , 0 , 0.59); border-radius: 5px; padding: 5px" name=send value="/uno color Red">Red</button></td><td style="width: 50%"><button style="width: 100%; background-color: blue; border: 2px solid rgba(0 , 0 , 0 , 0.59); border-radius: 5px; color: white; padding: 5px" name=send value="/uno color Blue">Blue</button></td></tr><tr><td style="width: 50%"><button style="width: 100%; background-color: green; border: 2px solid rgba(0 , 0 , 0 , 0.59); border-radius: 5px; padding: 5px" name=send value="/uno color Green">Green</button></td><td style="width: 50%"><button style="width: 100%; background-color: yellow; border: 2px solid rgba(0 , 0 , 0 , 0.59); border-radius: 5px; padding: 5px" name=send value="/uno color Yellow">Yellow</button></td></tr></table>`;

		switch (value) {
		case 'Reverse':
			this.direction *= -1;
			this.sendToRoom("The direction of the game has changed.");
			if (!initialize && this.playerCount === 2) this.onNextPlayer(); // in 2 player games, reverse sends the turn back to the player.
			break;
		case 'Skip':
			this.onNextPlayer();
			this.sendToRoom(`|html|${WL.nameColor(this.players[this.currentPlayer].name, true, true)}'s turn has been skipped.`);
			break;
		case '+2':
			this.onNextPlayer();
			this.sendToRoom(`|html|${WL.nameColor(this.players[this.currentPlayer].name, true, true)} has been forced to draw 2 cards.`);
			this.onDrawCard({userid: this.currentPlayer}, 2);
			break;
		case '+4':
			this.players[this.currentPlayer].sendRoom(colorDisplay);
			this.state = 'color';
			// apply to the next in line, since the current player still has to choose the color
			let next = this.getNextPlayer();
			this.sendToRoom(`|html|${WL.nameColor(this.players[next].name, true, true)} has been forced to draw 4 cards`);
			this.onDrawCard({userid: next}, 4);
			this.isPlusFour = true;
			this.timer = setTimeout(() => {
				this.sendToRoom(`|html|${WL.nameColor(this.players[this.currentPlayer].name, true, true)} has been automatically disqualified.`);
				this.eliminate(this.currentPlayer);
			}, this.maxTime * 1000);
			break;
		case 'Wild':
			this.players[this.currentPlayer].sendRoom(colorDisplay);
			this.state = 'color';
			this.timer = setTimeout(() => {
				this.sendToRoom(`${WL.nameColor(this.players[this.currentPlayer].name, true, true)} has been automatically disqualified.`);
				this.eliminate(this.currentPlayer);
			}, this.maxTime * 1000);
			break;
		}
		if (initialize) this.onNextPlayer();
	}

	onSelectcolor(user, color) {
		if (!['Red', 'Blue', 'Green', 'Yellow'].includes(color) || user.userid !== this.currentPlayer || this.state !== 'color') return false;
		this.topCard.changedColor = color;
		this.sendToRoom(`The color has been changed to ${color}.`);
		clearTimeout(this.timer);

		if (this.isPlusFour) {
			this.isPlusFour = false;
			this.onNextPlayer(); // handle the skipping here.
		}

		this.nextTurn();
	}

	onDrawCard(user, count) {
		if (!(user.userid in this.players)) return false;
		let drawnCards = this.drawCard(count);

		let player = this.players[user.userid];
		player.hand.push(...drawnCards);
		player.sendRoom(`|raw|You have drawn the following card${drawnCards.length > 1 ? 's' : ''}: ${drawnCards.map(card => `<span style="color: ${textColors[card.color]}">${card.name}</span>`).join(', ')}.`);
		return drawnCards;
	}

	drawCard(count) {
		count = parseInt(count);
		if (!count || count < 1) count = 1;
		let drawnCards = [];

		for (let i = 0; i < count; i++) {
			if (!this.deck.length) {
				this.deck = this.discards.length ? Dex.shuffle(this.discards) : Dex.shuffle(createDeck()); // shuffle the cards back into the deck, or if there are no discards, add another deck into the game.
				this.discards = []; // clear discard pile
			}
			drawnCards.push(this.deck.pop());
		}
		return drawnCards;
	}

	onUno(user, unoId) {
		// uno id makes spamming /uno uno impossible
		if (this.unoId !== unoId || user.userid !== this.awaitUno) return false;
		this.sendToRoom(Chat.html`|raw|<strong>UNO!</strong> ${user.name} is down to their last card!`);
		delete this.awaitUno;
		delete this.unoId;
	}

	onCheckUno() {
		if (this.awaitUno) {
			// if the previous player hasn't hit UNO before the next player plays something, they are forced to draw 2 cards;
			if (this.awaitUno !== this.currentPlayer) {
				this.sendToRoom(`${this.players[this.awaitUno].name} forgot to say UNO! and is forced to draw 2 cards.`);
				this.onDrawCard({userid: this.awaitUno}, 2);
			}
			delete this.awaitUno;
			delete this.unoId;
		}
	}

	onSendHand(user) {
		if (!(user.userid in this.players) || this.state === 'signups') return false;

		this.players[user.userid].sendDisplay();
	}

	onWin(player) {
		this.sendToRoom(Chat.html`|raw|<div class="broadcast-green">Congratulations to ${player.name} for winning the game of UNO!</div>`, true);
		let targetUserid = toId(player.name);
		let prize = 2;
		prize += Math.floor(this.playerCount / 5);
		if (Db.userBadges.has(targetUserid) && Db.userBadges.get(targetUserid).indexOf('Uno Champion') > -1) prize = Math.ceil(prize * 1.5);
		if (Users(targetUserid).unoBoost) prize *= 2;
		if (Users(targetUserid).gameBoost) prize *= 2;
		for (let i = 0; i < this.players.length; i++) {
			WL.addExp(Users(this.players[i]).userid, this.room, 20);
		}
		if (this.room.isOfficial) {
			Economy.writeMoney(targetUserid, prize, newAmount => {
				if (Users(targetUserid) && Users(targetUserid).connected) {
					Users.get(targetUserid).popup('You have received ' + prize + ' ' + (prize === 1 ? global.currencyName : global.currencyPlural) + ' from winning the game of UNO.');
				}
				Economy.logTransaction(player.name + ' has won ' + prize + ' ' + (prize === 1 ? global.currencyName : global.currencyPlural) + ' from a game of UNO.');
			});
			for (let i = 0; i < this.players.length; i++) {
				if (Users(this.players[i]).unoBoost) Users(this.players[i]).unoBoost = false;
				if (Users(this.players[i]).gameBoost) Users(this.players[i]).gameBoost = false;
			}
		}
		this.destroy();
	}

	destroy() {
		clearTimeout(this.timer);
		this.sendToRoom(`|uhtmlchange|uno-${this.room.gameNumber}|<div class="infobox">The game of UNO has ended.</div>`, true);

		// deallocate games for each player.
		for (let i in this.players) {
			this.players[i].destroy();
		}
		delete this.room.game;
	}
}

class UNOgamePlayer extends Rooms.RoomGamePlayer {
	constructor(user, game) {
		super(user, game);
		this.hand = [];
	}

	canPlayWildFour() {
		let color = (this.game.topCard.changedColor || this.game.topCard.color);

		if (this.hand.some(c => c.color === color)) return false;
		return true;
	}

	hasCard(cardName) {
		return this.hand.find(c => c.name === cardName);
	}

	removeCard(cardName) {
		for (let i = 0; i < this.hand.length; i++) {
			if (this.hand[i].name === cardName) {
				this.hand.splice(i, 1);
				break;
			}
		}
	}

	buildHand() {
		return this.hand.sort((a, b) => a.color.localeCompare(b.color) || a.value.localeCompare(b.value))
			.map((c, i) => cardHTML(c, i === this.hand.length - 1));
	}

	sendDisplay() {
		let hand = this.buildHand().join("");
		let players = `<p><strong>Players (${this.game.playerCount}):</strong></p>${this.game.getPlayers(true).join("<br />")}`;
		let draw = '<button class="button" style="width: 30%; background: rgba(0, 0, 255, 0.05)" name=send value="/uno draw">Draw a card!</button>';
		let pass = '<button class="button" style=" width: 30%; background: rgba(255, 0, 0, 0.05)" name=send value="/uno pass">Pass!</button>';
		let uno = `<button class="button" style=" width: 30%; background: rgba(0, 255, 0, 0.05)" name=send value="/uno uno ${this.game.unoId || '0'}">UNO!</button>`;

		let top = `<strong>Top Card: <span style="color: ${textColors[this.game.topCard.changedColor || this.game.topCard.color]}">${this.game.topCard.name}</span></strong>`;

		// clear previous display and show new display
		this.sendRoom("|uhtmlchange|uno-hand|");
		this.sendRoom(
			`|uhtml|uno-hand|<div style="border: 1px solid skyblue; padding: 0 0 5px 0"><table style="width: 100%; table-layout: fixed; border-radius: 3px"><tr><td colspan=4 rowspan=2 style="padding: 5px"><div style="overflow-x: auto; white-space: nowrap; width: 100%">${hand}</div></td>${this.game.currentPlayer === this.userid ? `<td colspan=2 style="padding: 5px 5px 0 5px">${top}</td></tr>` : ""}` +
			`<tr><td colspan=2 style="vertical-align: top; padding: 0px 5px 5px 5px"><div style="overflow-y: scroll">${players}</div></td></tr></table>` +
			`${this.game.currentPlayer === this.userid ? `<div style="text-align: center">${draw} <span style="padding-left: 10px;"></span> ${pass} <span style="padding-left: 10px;"></span> ${uno}</div>` : ""}</div>`
		);
	}
}

class Draft {
	constructor(room) {
		this.room = room;
		this.teams = {};
		this.turn = null;
		this.state = null;
		this.order = [];
		this.originalOrder = [];
		this.draftedMons = [];
		this.maxMons = 12;
		this.random = true;
		this.snake = true;
	}
	addTeam(teamname, manager, self) {
		if (this.teams[teamname]) return self.errorReply('There is already a team with this Team Name.');
		this.teams[teamname] = {
			'manager': toId(manager),
			'draftpicks': [],
		};
		this.originalOrder.push(teamname);
		let fileName = this.room + 'draft';
		Db[fileName].set('teams', this.teams);
		this.room.add('|html|<div style="' + greencss + '">The <b>' + teamname + '</b> are now apart of the draft and is managed by <b>' + manager + '</b></div>');
		this.log(teamname + ' is now apart of the draft and is managed by ' + manager);
	}
	removeTeam(teamname, self) {
		if (!this.teams[teamname]) return self.errorReply('There is not a team with this Team Name, thus there is no way to remove them from this draft.');
		delete this.teams[teamname];
		this.room.add('|html|<div style="' + redcss + '">The team <b>' + teamname + '</b> has been removed from this draft league.');
		for (let i = 0; i < this.originalOrder.length; i++) {
			if (this.originalOrder[i] === teamname) this.originalOrder.splice(i, 1);
			if (this.order[i] === teamname) this.order.splice(i, 1);
			continue;
		}
		let fileName = this.room + 'draft';
		Db[fileName].set('teams', this.teams);
		this.log(teamname + ' has been removed from this league.');
	}
	start(self) {
		if (this.originalOrder.length < 2) return self.errorReply('There is no point of having a draft league if there is only 1 team!');
		this.order = this.originalOrder;
		if (this.random === true) Dex.shuffle(this.order);
		this.state = 'drafting';
		this.turn = this.order[0];
		this.room.add('|html|<div style="' + greencss + '">The Draft has started!<br>The order of this draft is <b>: ' + this.order.join(', ') + '.</b></div>');
		this.room.add('|html|<div style="' + greencss + '">It is now <b>' + this.turn + '\'s</b> turn.</div>');
		this.log('The draft has started.');
	}
	Nom(pk, user, self) {
		if (this.state !== 'drafting') return self.errorReply('There is no draft at the moment.');
		if (this.teams[this.turn].manager !== user) return self.errorReply('It is not your turn to draft.');
		if (this.draftedMons.includes(pk)) return self.errorReply('This mon has already been drafted by someone else.');
		this.teams[this.turn].draftpicks.push(pk);
		let fileName = this.room + 'draft';
		Db[fileName].set('teams', this.teams);
		this.draftedMons.push(pk);
		if (this.order.length === this.order.indexOf(this.turn) + 1) {
			if (this.teams[this.turn].draftpicks.length === this.maxMons) {
				this.room.add('|html|<div style="' + greencss + '"><b>' + user + '</b> has drafted the pokemon : <b>' + pk + '</b></div>');
				this.room.add('|html|<div style="' + redcss + '">Everyone has recieved ' + this.maxMons + ' Draft Picks.<br> The Draft is over! We hope you are happy with your draft picks :)');
				this.room.add('|html|<div style="' + greencss + '"><b>Final Picks : </b><br>' + this.show() + '</div>');
				delete drafts[this.room];
				this.log('Everyone has recieved ' + this.maxMons + ' Draft Picks, therefore the draft has ended.');
			} else if (this.snake === true) {
				let reverseOrder = this.order.reverse();
				this.turn = reverseOrder[0];
				this.room.add('|html|<div style="' + greencss + '"><b>' + user + '</b> Has drafted the Pokemon : <b>' + pk + '.</b><br>It is now <b>' + this.turn + '</b>\'s turn.</div>');
				this.room.add('|html|<div style="' + greencss + '"><b>' + this.turn + '</b> currently has : ' + this.iconize(this.teams[this.turn].draftpicks) + '</div>');
				this.log(user + ' has drafted ' + pk);
			} else {
				this.turn = this.order[0];
				this.room.add('|html|<div style="' + greencss + '"><b>' + user + '</b> Has drafted the Pokemon : <b>' + pk + '.</b><br>It is now <b>' + this.turn + '</b>\'s turn.</div>');
				this.room.add('|html|<div style="' + greencss + '"><b>' + this.turn + '</b> currently has : ' + this.iconize(this.teams[this.turn].draftpicks) + '</div>');
				this.log(user + ' has drafted ' + pk);
			}
		} else {
			this.turn = this.order[this.order.indexOf(this.turn) + 1];
			this.room.add('|html|<div style="' + greencss + '"><b>' + user + '</b> Has drafted the Pokemon : <b>' + pk + '.</b><br>It is now <b>' + this.turn + '</b>\'s turn.</div>');
			this.room.add('|html|<div style="' + greencss + '"><b>' + this.turn + '</b> currently has : ' + this.iconize(this.teams[this.turn].draftpicks) + '</div>');
			this.log(user + ' has drafted ' + pk);
		}
	}
	iconize(team) {
		let display = '';
		for (let i = 0; i < team.length; i++) {
			let dex = '';
			if (Dex.data.Pokedex[team[i]].num < 100) {
				if (Dex.data.Pokedex[team[i]].num < 10) {
					dex = '00' + Dex.data.Pokedex[team[i]].num;
	                } else {
	                    dex = '0' + Dex.data.Pokedex[team[i]].num;
				}
			} else {
				dex = Dex.data.Pokedex[team[i]].num;
			}
			let url = 'http://www.serebii.net/pokedex-sm/icon/' + dex + '.png';
			display += '<img src="' + url + '" title="' + team[i] + '">';
		}
		return display;
	}
	show(self) {
		if (this.state === 'prep') return self.errorReply('The draft has not started yet.');
		let display = "<table border='1' cellspacing='0' cellpadding='5' width='100%'><tbody><tr><th>Team</th><th>Manager</th><th>Team</th></tr>";
		for (let i = 0; i < this.order.length; i++) {
			display += "<tr><td align='center'><b>" + this.order[i] + "</b></td><td align='center'><b>" + this.teams[this.order[i]].manager + "</b></td><td allign='center'>" + this.iconize(this.teams[this.order[i]].draftpicks) + "</td>";
		}
		display += "</tbody></table>";
		if (!self) return display;
		self.sendReply('|html|' + display);
	}
	log(message) {
		let file = path.join(__dirname, '../logs/' + this.room + 'DraftLogs.txt');
		let text = '[' + Date() + ']' + message + '\n';
		fs.appendFile(file, text);
	}
	overWrite(self, team, pick, mon) {
		let oldpick = this.teams[team].draftpicks[pick - 1];
		if (!this.teams[team]) return self.errorReply('This team is not apart of the draft.');
		if (!oldpick) return self.errorReply('ERROR: No pokemon with this pick has been found.');
		if (!Dex.data.Pokedex[mon]) return self.errorReply('This is not a pokemon.');
		if (this.draftedMons.includes(mon)) return self.errorReply('This pokemon has already been drafted by someone.');
		let oldpickDraftSpot = this.draftedMons.indexOf(oldpick);
		this.draftedMons[oldpickDraftSpot] = mon;
		this.teams[team].draftpicks[pick - 1] = mon;
		let fileName = this.room + 'draft';
		Db[fileName].set('teams', this.teams);
		this.room.add('|html|<div style="' + greencss + '">Change : <b>' + team + '</b> has changed their pick : <b>' + oldpick + '</b> changed to : <b>' + this.teams[team].draftpicks[pick - 1] + '</b>.<br><b>' + team + '\'s</b> Line up now looks like: ' + this.iconize(this.teams[team].draftpicks) + '</div>');
		this.log(team + ' has changed their draft pick : ' + oldpick + ' to : ' + mon);
	}
}

function loadLottery() {
	try {
		WL.lottery = JSON.parse(fs.readFileSync('config/lottery.json', 'utf8'));
	} catch (e) {
		console.log("Could not load lottery database.");
	}
}
setTimeout(function () {loadLottery();}, 1000);

function saveLottery() {
	fs.writeFileSync('config/lottery.json', JSON.stringify(WL.lottery));
}

exports.commands = {
	randomgame: function (target, room, user) {
		let game = Math.floor(Math.random() * 3); //This will change as more games are added.
		if (room.id === 'lobby') return this.errorReply("Most games are not allowed in lobby. Try <<casino>>");
		if (!user.can('broadcast', null, room) && room.id !== 'casino') return this.errorReply("You must be ranked + or higher in this room to start a game of dice outside the Casino.");
		if (room.dice || room.game) this.errorReply('There is already a game occurring in ' + room.id);
		if (game === 1) this.parse('/dice start 1');
		if (game === 2) this.parse('/lottery create, 1');
		else this.parse ('/uno create');
	},
    dice: {
	    start: 'game',
	    game: function (target, room, user) {
		    if (room.id === 'lobby') return this.errorReply("This command cannot be used in the Lobby.");
		    if (!user.can('broadcast', null, room) && room.id !== 'casino' && room.id !== 'coldfrontcasino') return this.errorReply("You must be ranked + or higher in this room to start a game of dice outside the Casino.");
		    if ((user.locked || room.isMuted(user)) && !user.can('bypassall')) return this.errorReply("You cannot use this command while unable to talk.");
		    if (room.dice) return this.errorReply("There is already a game of dice going on in this room.");

		    let amount = Number(target) || 1;
		    if (isNaN(target)) return this.errorReply('"' + target + '" isn\'t a valid number.');
		    if (target.includes('.') || amount < 1 || amount > 5000) return this.sendReply('The number of bucks must be between 1 and 5,000 and cannot contain a decimal.');
		    Economy.readMoney(user.userid, bucks => {
			    if (bucks < amount) return this.sendReply("You don't have " + amount + " " + (amount === 1 ? "buck" : "bucks") + ".");
			    room.dice = new Dice(room, amount, user.name);
			    this.parse("/joindice");
		    });
	    },

	    join: function (target, room, user) {
		    if (room.id === 'lobby') return this.errorReply("This command cannot be used in the Lobby.");
		    if ((user.locked || room.isMuted(user)) && !user.can('bypassall')) return this.sendReply("You cannot use this command while unable to talk.");
		    if (!room.dice) return this.errorReply('There is no game of dice going on in this room.');

		    room.dice.join(user, this);
	    },

	    leave: function (target, room, user) {
		    if (room.id === 'lobby') return this.errorReply("This command cannot be used in the Lobby.");
		    if (!room.dice) return this.errorReply('There is no game of dice going on in this room.');

		    room.dice.leave(user, this);
	    },

	    end: function (target, room, user) {
		    if (room.id === 'lobby') return this.errorReply("This command cannot be used in the Lobby.");
		    if ((user.locked || room.isMuted(user)) && !user.can('bypassall')) return this.sendReply("You cannot use this command while unable to talk.");
		    if (!room.dice) return this.errorReply('There is no game of dice going on in this room.');
		    if (!user.can('broadcast', null, room) && !room.dice.players.includes(user)) return this.errorReply("You must be ranked + or higher in this room to end a game of dice.");

		    room.dice.end(user);
	    },
	    dicegamehelp: [
		    '/start dice or /dice game [amount] - Starts a game of dice in the room for a given number of bucks, 1 by default (NOTE: There is a 10% tax on bucks you win from dice games).',
		    '/join dice - Joins the game of dice. You cannot use this command if you don\'t have the number of bucks the game is for.',
		    '/leave dice - Leaves the game of dice.',
		    '/end dice - Ends the game of dice. Requires + or higher to use.',
	    ],
	},
	
	uno: {
		// roomowner commands
		off: 'disable',
		disable: function (target, room, user) {
			if (!this.can('gamemanagement', null, room)) return;
			if (room.unoDisabled) {
				return this.errorReply("UNO is already disabled in this room.");
			}
			room.unoDisabled = true;
			if (room.chatRoomData) {
				room.chatRoomData.unoDisabled = true;
				Rooms.global.writeChatRoomData();
			}
			return this.sendReply("UNO has been disabled for this room.");
		},

		on: 'enable',
		enable: function (target, room, user) {
			if (!this.can('gamemanagement', null, room)) return;
			if (!room.unoDisabled) {
				return this.errorReply("UNO is already enabled in this room.");
			}
			delete room.unoDisabled;
			if (room.chatRoomData) {
				delete room.chatRoomData.unoDisabled;
				Rooms.global.writeChatRoomData();
			}
			return this.sendReply("UNO has been enabled for this room.");
		},

		// moderation commands
		new: 'create',
		make: 'create',
		createpublic: 'create',
		makepublic: 'create',
		createprivate: 'create',
		makeprivate: 'create',
		create: function (target, room, user, connection, cmd) {
			if (!this.can('minigame', null, room)) return;
			if (room.unoDisabled) return this.errorReply("UNO is currently disabled for this room.");
			if (room.game) return this.errorReply("There is already a game in progress in this room.");

			let suppressMessages = cmd.includes('private') || !(cmd.includes('public') || room.id === 'gamecorner');

			room.game = new UNOgame(room, target, suppressMessages);
			this.privateModCommand(`(A game of UNO was created by ${user.name}.)`);
		},

		start: function (target, room, user) {
			if (!this.can('minigame', null, room)) return;
			if (!room.game || room.game.gameid !== 'uno' || room.game.state !== 'signups') return this.errorReply("There is no UNO game in signups phase in this room.");
			if (room.game.onStart()) this.privateModCommand(`(The game of UNO was started by ${user.name}.)`);
		},

		stop: 'end',
		end: function (target, room, user) {
			if (!this.can('minigame', null, room)) return;
			if (!room.game || room.game.gameid !== 'uno') return this.errorReply("There is no UNO game going on in this room.");
			room.game.destroy();
			room.add("The game of UNO was forcibly ended.").update();
			this.privateModCommand(`(The game of UNO was ended by ${user.name}.)`);
		},

		timer: function (target, room, user) {
			if (!this.can('minigame', null, room)) return;
			if (!room.game || room.game.gameid !== 'uno') return this.errorReply("There is no UNO game going on in this room.");
			let amount = parseInt(target);
			if (!amount || amount < 5 || amount > 300) return this.errorReply("The amount must be a number between 5 and 300.");

			room.game.maxTime = amount;
			if (room.game.timer) {
				clearTimeout(room.game.timer);
				room.game.timer = setTimeout(() => {
					room.game.eliminate(room.game.currentPlayer);
				}, amount * 1000);
			}
			this.addModCommand(`${user.name} has set the UNO automatic disqualification timer to ${amount} seconds.`);
		},

		dq: 'disqualify',
		disqualify: function (target, room, user) {
			if (!this.can('minigame', null, room)) return;
			if (!room.game || room.game.gameid !== 'uno') return this.errorReply("There is no UNO game going on in this room right now.");

			let disqualified = room.game.eliminate(toId(target));
			if (disqualified === false) return this.errorReply(`Unable to disqualify ${target}.`);
			this.privateModCommand(`(${user.name} has disqualified ${disqualified} from the UNO game.)`);
			room.add(`|html|${WL.nameColor(target, true, true)} has been disqualified from the UNO game.`).update();
		},

		// player/user commands
		j: 'join',
		join: function (target, room, user) {
			if (!room.game || room.game.gameid !== 'uno') return this.errorReply("There is no UNO game going on in this room right now.");
			if (!this.canTalk()) return false;
			if (!room.game.joinGame(user)) return this.errorReply("Unable to join the game.");
			return this.sendReply("You have joined the game of UNO.");
		},

		l: 'leave',
		leave: function (target, room, user) {
			if (!room.game || room.game.gameid !== 'uno') return this.errorReply("There is no UNO game going on in this room right now.");
			if (!room.game.leaveGame(user)) return this.errorReply("Unable to leave the game.");
			return this.sendReply("You have left the game of UNO.");
		},

		play: function (target, room, user) {
			if (!room.game || room.game.gameid !== 'uno') return this.errorReply("There is no UNO game going on in this room right now.");
			let error = room.game.onPlay(user, target);
			if (error) this.errorReply(error);
		},

		draw: function (target, room, user) {
			if (!room.game || room.game.gameid !== 'uno') return this.errorReply("There is no UNO game going on in this room right now.");
			let error = room.game.onDraw(user);
			if (error) return this.errorReply("You have already drawn a card this turn.");
		},

		pass: function (target, room, user) {
			if (!room.game || room.game.gameid !== 'uno') return this.errorReply("There is no UNO game going on in this room right now.");
			if (room.game.currentPlayer !== user.userid) return this.errorReply("It is currently not your turn.");
			if (!room.game.players[user.userid].cardLock) return this.errorReply("You cannot pass until you draw a card.");
			if (room.game.state === 'color') return this.errorReply("You cannot pass until you choose a color.");

			room.game.sendToRoom(`|html|${WL.nameColor(user.name, true, true)} has passed.`);
			room.game.nextTurn();
		},

		color: function (target, room, user) {
			if (!room.game || room.game.gameid !== 'uno') return false;
			room.game.onSelectcolor(user, target);
		},

		uno: function (target, room, user) {
			if (!room.game || room.game.gameid !== 'uno') return false;
			room.game.onUno(user, target);
		},

		// information commands
		'': 'hand',
		hand: function (target, room, user) {
			if (!room.game || room.game.gameid !== 'uno') return this.parse("/help uno");
			room.game.onSendHand(user);
		},

		players: 'getusers',
		users: 'getusers',
		getplayers: 'getusers',
		getusers: function (target, room, user) {
			if (!room.game || room.game.gameid !== 'uno') return this.errorReply("There is no UNO game going on in this room right now.");
			if (!this.runBroadcast()) return false;

			this.sendReplyBox(`<strong>Players (${room.game.playerCount})</strong>:<br />${room.game.getPlayers().join(', ')}`);
		},

		help: function (target, room, user) {
			this.parse('/help uno');
		},

		// suppression commands
		suppress: function (target, room, user) {
			if (!room.game || room.game.gameid !== 'uno') return this.errorReply("There is no UNO game going on in this room right now.");
			if (!this.can('minigame', null, room)) return;

			target = toId(target);
			let state = target === 'on' ? true : target === 'off' ? false : undefined;

			if (state === undefined) return this.sendReply(`Suppression of UNO game messages is currently ${(room.game.suppressMessages ? 'on' : 'off')}.`);
			if (state === room.game.suppressMessages) return this.errorReply(`Suppression of UNO game messages is already ${(room.game.suppressMessages ? 'on' : 'off')}.`);

			room.game.suppressMessages = state;

			this.addModCommand(`${user.name} has turned ${(state ? 'on' : 'off')} suppression of UNO game messages.`);
		},

		spectate: function (target, room, user) {
			if (!room.game || room.game.gameid !== 'uno') return this.errorReply("There is no UNO game going on in this room right now.");

			if (!room.game.suppressMessages) return this.errorReply("The current UNO game is not suppressing messages.");
			if (user.userid in room.game.spectators) return this.errorReply("You are already spectating this game.");

			room.game.spectators[user.userid] = 1;
			this.sendReply("You are now spectating this private UNO game.");
		},

		unspectate: function (target, room, user) {
			if (!room.game || room.game.gameid !== 'uno') return this.errorReply("There is no UNO game going on in this room right now.");

			if (!room.game.suppressMessages) return this.errorReply("The current UNO game is not suppressing messages.");
			if (!(user.userid in room.game.spectators)) return this.errorReply("You are currently not spectating this game.");

			delete room.game.spectators[user.userid];
			this.sendReply("You are no longer spectating this private UNO game.");
		},
		showcase: function (target, room, user) {
			if (!this.runBroadcast()) return;
			let output = `<div class = "infobox infobox-limited">`;
			for (let i = 0; i < colors.length; i++) {
				output += `<div class="infobox" style="overflow-x: auto; white-space: nowrap; width: 100%">`;
				for (let j = 0; j < values.length; j++) {
					for (let k = 0; k < cardImages[colors[i]][values[j]].length; k++) {
						output += `<img src=${cardImages[colors[i]][values[j]][k]} />&nbsp;&nbsp;`;
					}
				}
				output += `</div><br />`;
			}
			output += `<div class="infobox" style="overflow-x: auto; white-space: nowrap; width: 100%"><img src=${cardImages['Black']['Wild'][0]} />&nbsp;&nbsp;<img src=${cardImages['Black']['Wild'][1]} />&nbsp;&nbsp;<img src=${cardImages['Black']['+4'][0]} />&nbsp;&nbsp;<img src=${cardImages['Black']['+4'][1]} />&nbsp;&nbsp;</div><br/>`;
			output += '</div>';
			this.sendReply('|raw|' + output);
		},
		unohelp: [
	    	"/uno create [player cap] - creates a new UNO game with an optional player cap (default player cap at 6). Use the command `createpublic` to force a public game or `createprivate` to force a private game. Requires: % @ * # & ~",
	    	"/uno timer [amount] - sets an auto disqualification timer for `amount` seconds. Requires: % @ * # & ~",
	    	"/uno end - ends the current game of UNO. Requires: % @ * # & ~",
	    	"/uno start - starts the current game of UNO. Requires: % @ * # & ~",
	    	"/uno disqualify [player] - disqualifies the player from the game. Requires: % @ * # & ~",
	    	"/uno hand - displays your own hand.",
	    	"/uno getusers - displays the players still in the game.",
	    	"/uno [spectate | unspectate] - spectate / unspectate the current private UNO game.",
	    	"/uno suppress [on | off] - Toggles suppression of game messages.",
	    	"/uno showcase - Displays all of the Pokémon Plays UNO! Cards.",
    	    ],
	},
		
	draft: function (target, room, user) {
		if (!target) return this.parse('/draft help');
		let parts = target.split(',');
		let cmd = parts[0].trim().toLowerCase().replace(' ', '');
		switch (cmd) {
		case 'create':
			if (!this.can('roommod', null, room)) return false;
			if (drafts[room]) return this.errorReply('There is already a draft going on in this room.');
			drafts[room] = new Draft(room);
			drafts[room].state = 'prep';
			drafts[room].log('Draft has been created in ' + room + '.');
			room.add('|html|<div style="' + greencss + '">A Draft has been started!</div>');
			break;
		case 'reset':
			if (!this.can('roommod', null, room)) return false;
			if (!drafts[room]) return this.errorReply('This room is not taking part in a draft at the moment.');
			delete drafts[room];
			room.add('|html|<div style="' + redcss + '">The data for this draft has been reset.</div>');
			break;
		case 'addteam':
			if (!this.can('roommod', null, room)) return false;
			if (parts.length < 3) return this.parse('/draft help');
			if ((!drafts[room])) return this.errorReply('This room is not drafting at the moment.');
			if (!drafts[room].state === 'prep') return this.errorReply('You may not add teams to the draft at this moment.');
			let teamName = parts[1].trim();
			let manager = parts[2].trim();
			drafts[room].addTeam(teamName, manager, this);
			break;
		case 'removeteam':
			if (!this.can('roommod', null, room)) return false;
			if (parts.length < 2) return this.parse('/draft help');
			let teamNamez = parts[1].trim();
			if ((!drafts[room])) return this.errorReply('This room is not drafting at the moment.');
			if (drafts[room].state === 'drafting') return this.errorReply('You may not add teams to the draft at this moment.');
			drafts[room].removeTeam(teamNamez, this);
			break;
		case 'start':
			if (!this.can('roommod', null, room)) return false;
			if (!drafts[room]) return this.errorReply('This room is not drafting at the moment.');
			if (drafts[room].state === 'drafting') return this.errorReply('The draft has already started.');
			drafts[room].start(this);
			break;
		case 'random':
			if (!this.can('roommod', null, room)) return false;
			if ((!drafts[room])) return this.errorReply('This room is not drafting at the moment.');
			if (!parts[1]) return this.prase('/draft help');
			let either = parts[1].trim().toLowerCase().replace(' ', '');
			if (either === 'true') {
				drafts[room].random = true;
				room.add('|html|<div style="' + greencss + '">The order of the draft is now <b>randomized!</b></div>');
				drafts[room].log('The order of this draft is now randomized.');
			} else if (either === 'false') {
				drafts[room].random = false;
				room.add('|html|<div style="' + greencss + '">The order of the draft is now not <b>randomized!</b></div>');
				drafts[room].log('The order of this draft is no longer randomized.');
			} else {
				this.parse('/draft help');
			}
			break;
		case 'snake':
			if (!this.can('roommod', null, room)) return false;
			if ((!drafts[room])) return this.errorReply('This room is not drafting at the moment.');
			if (!parts[1]) return this.prase('/draft help');
			let eitheror = parts[1].trim().toLowerCase().replace(' ', '');
			if (eitheror === 'true') {
				drafts[room].snake = true;
				room.add('|html|<div style="' + greencss + '">The order of the draft is now <b>snaked!</b></div>');
				drafts[room].log('The order of this draft is now snaked.');
			} else if (eitheror === 'false') {
				drafts[room].snake = false;
				room.add('|html|<div style="' + greencss + '">The order of the draft is now not <b>snaked!</b></div>');
				drafts[room].log('The order of this draft is no longer snaked.');
			} else {
				this.parse('/draft help');
			}
			break;
		case 'end':
			if (!this.can('roommod', null, room)) return false;
			if (!drafts[room]) return this.errorReply('This room is not drafting at the moment.');
			drafts[room].log('The draft has been ended by ' + user.name);
			delete drafts[room];
			room.add('|html|<div style="' + redcss + '">The draft has ended!<br>We hope you are happy with what you came out with :).</div>');
			break;
		case 'max':
			if (!this.can('roommod', null, room)) return false;
			if (!drafts[room]) return this.errorReply('This room is not drafting at the moment.');
			if (!parts[1]) return this.sendReply('The draft pick limit for this draft is ' + drafts[room].maxMons);
			let num = parseFloat(parts[1].trim());
			if (isNaN(num)) return this.errorReply('Must be a number.');
			drafts[room].maxMons = num;
			drafts[room].log('The draft pick limit has been set to be ' + drafts[room].maxMons + ' by ' + user.name);
			room.add('|html|<div style="' + greencss + '">The draft limit of this draft has been set to <b>' + drafts[room].maxMons + '</b></div>');
			break;
		case 'stats':
			if (!this.runBroadcast()) return;
			if (!drafts[room]) return this.errorReply('This room is not drafting at the moment.');
			drafts[room].show(this);
			break;
		case 'change':
			if (!this.can('roommod', null, room)) return false;
			if (!drafts[room]) return this.errorReply('This room is not drafting at the moment.');
			if (parts.length < 3) return this.parse('/draft help');
			let teamname = parts[1].trim();
			let draftpick = parts[2].trim();
			let pokemon = parts[3].trim().toLowerCase().replace(' ', '');
			if (isNaN(draftpick)) return this.errorReply('The draftpick is not a number.');
			drafts[room].overWrite(this, teamname, draftpick, pokemon);
			break;
		case 'drafted':
			if (!this.runBroadcast()) return;
			if (!drafts[room]) return this.errorReply('This room is not drafting at the moment.');
			this.sendReply('|html|<div style="' + greencss + '"><i><b>Drafted Pokemon : </b></i><br/>' + drafts[room].iconize(drafts[room].draftedMons));
			break;
		default:
			if (!this.runBroadcast()) return;
			this.sendReplyBox('<b><center>Drafts Management By Execute.</center></b><br/>' +
					'<b>Adminstrative Commands</b> : Requires #,&,~ <br/>' +
					'<b>/draft create</b> - Creates a draft in the room.<br/>' +
					'<b>/draft end</b> - Ends a draft.<br/>' +
					'<b>/draft addteam, (teamname), (manager)</b> - Adds a team to the draft. This allows the user the ability to take part in the draft.<br/>' +
					'<b>/draft removeteam, (teamname)</b> - Removes a team from the draft. This strips them of their ability to take part of this draft.<br/>' +
					'<b>/draft max, (max)</b> - Sets the max number of pokemon any team may draft in this draft.<br/>' +
					'<b>/draft random, (true, false)</b> - Sets the order of the draft to either be random or not. <br/>' +
					'<b>/draft snake, (true, false)</b> - Sets the order of the draft to snake or not.<br/>' +
					'<b>/draft reset</b> - Deletes all the data of a draft.<br/>' +
					'<b>/draft start</b> - Starts the draft.<br>' +
					'<b>/draft stats</b> - Displays every team participating in the draft with their respective manager, and every pokemon they have drafted up until that point.<br/>' +
					'<b>/draft change, (teamname), (draftpick), (desired Pokemon)</b> - Allows the league manager to rewrite draft data. This should be used when a particpant makes a mistake. <i>This shouldn\'t</i> ever be the case seeing as draft script automatically rejects any spelling errors in a pokemon\'s name, but this command is here if it is ever needed. <br/> ' +
					'<b>/draft drafted</b> - Displays the pool of pokemon already drafted. These pokemon are not able to be claimed by anyone else after they are drafted. <br/>' +
					'<b>/draft end</b> - Ends a draft league instantly. Unless you really need to end it, you <i>shouldn\'t</i> use this command, as the draft automatically ends when every player has finished drafting.<br><br/>' +
					'<b>/draftmon (pokemonname)</b> - Allows a draft member to draft a pokemon onto their team.');
		}
	},
		draftmon: function (target, room, user) {
			if (!drafts[room]) return this.errorReply('This room is not drafting at the moment.');
			if (drafts[room].state !== 'drafting') return this.errorReply('The draft has not started.');
			if (!target) return this.parse('/draft help');
			let pkmn = target.toLowerCase().replace(' ', '');
			if (!Dex.data.Pokedex[pkmn]) {
				return this.errorReply('Not a Pokemon.');
			} else {
				drafts[room].Nom(pkmn, user.userid, this);
			}
		},
	
	lottery: function (target, room, user) {
		let parts = target.split(',');
		for (let u in parts) parts[u] = parts[u].trim();
		if (room.id !== 'gamechamber') return this.errorReply("You must be in Game Chamber to use this command.");
		if (!Rooms.get('gamechamber')) return this.errorReply("You must have the room \"Game Chamber\" in order to use this script.");
		switch (toId(parts[0])) {
		case 'buy':
		case 'join':
			if (!WL.lottery.gameActive) return this.errorReply("The game of lottery is not currently running.");
			if (!this.canTalk()) return this.errorReply("You cannot do this while unable to talk.");
			if (parts[1]) {
				if (isNaN(Number(parts[1]))) return this.errorReply("The amount of tickets you buy must be a number.");
				if (~String(parts[1]).indexOf('.')) return this.errorReply("Cannot contain a decimal.");
				if (Number(parts[1]) < 1) return this.errorReply("Cannot be less than 1.");
				let bought = parts[1];
				if (bought > WL.lottery.maxTicketsPerUser) return this.errorReply("You cannot get this many lottery tickets.");
				if (bought * WL.lottery.ticketPrice > Economy.readMoney(user.userid)) return this.errorReply("Sorry, you do not have enough bucks to buy that many tickets.");
				if (WL.lottery.playerIPS.length > 1) {
					let filteredPlayerArray = WL.lottery.playerIPS.filter(function (ip) {
						return ip === user.latestIp;
					});
					if (Number(Object.keys(filteredPlayerArray).length) + Number(bought) > WL.lottery.maxTicketsPerUser) return this.errorReply("You cannot get more than " + WL.lottery.maxTicketsPerUser + " tickets for this game of lotto.");
				}
				WL.writeMoney(user.userid, -bought * WL.lottery.ticketPrice);
				WL.lottery.pot = Math.round(WL.lottery.pot + (WL.lottery.ticketPrice * bought * 1.5));
				Rooms.get('gamechamber').add("|raw|<b><font color=" + WL.hashColor(user.name) + ">" + user.name + "</font></b> has bought " + bought + " lottery tickets.");
				for (let x = bought; x > 0; x--) {
					WL.lottery.players.push(toId(user.name));
					WL.lottery.playerIPS.push(user.latestIp);
				}
				saveLottery();
			} else {
				if (WL.readMoney(user.userid) < WL.lottery.ticketPrice) return this.errorReply("You do not have enough bucks to partake in this game of Lottery.  Sorry.");
				if (WL.lottery.playerIPS.length > 1) {
					let filteredPlayerArray = WL.lottery.playerIPS.filter(function (ip) {
						return ip === user.latestIp;
					});
					if (filteredPlayerArray.length >= WL.lottery.maxTicketsPerUser) return this.errorReply("You cannot get more than " + WL.lottery.maxTicketsPerUser + " tickets for this game of lotto.");
				}
				WL.writeMoney(user.userid, -WL.lottery.ticketPrice);
				WL.lottery.pot = Math.round(WL.lottery.pot + (WL.lottery.ticketPrice * 1.5));
				Rooms.get('gamechamber').add("|raw|<b><font color=" + WL.hashColor(user.name) + ">" + user.name + "</font></b> has bought a lottery ticket.");
				WL.lottery.players.push(toId(user.name));
				WL.lottery.playerIPS.push(user.latestIp);
				saveLottery();
			}
			break;

		case 'new':
		case 'create':
			if (!this.can('ban', null, room)) return false;
			if (WL.lottery.gameActive) return this.errorReply("There is a game of Lottery already currently running.");
			if (!this.canTalk()) return this.errorReply("You cannot do this while unable to talk.");
			if (!parts[1]) return this.errorReply("Usage: /lottery create, [ticket cost]");
			WL.lottery.maxTicketsPerUser = 10; //default max tickets per user
			WL.lottery.maxTicketPrice = 20;
			if (isNaN(Number(parts[1]))) return this.errorReply('The pot must be a number greater than 0');
			if (parts[1] > WL.lottery.maxTicketPrice) return this.errorReply("Lottery tickets cannot cost more than " + WL.lottery.maxTicketPrice + " bucks.");
			WL.lottery.startTime = Date.now();
			WL.lottery.ticketPrice = parts[1];
			WL.lottery.gameActive = true;
			WL.lottery.pot = 0;
			WL.lottery.players = [];
			WL.lottery.playerIPS = [];
			WL.lottery.createdBy = user.name;
			let room_notification =
					"<div class=\"broadcast-green\"><center><b><font size=4 color=white>Lottery Game!</font></b><br />" +
					"<i><font color=gray>(Started by: " + Chat.escapeHTML(user.name) + ")</font></i><br />" +
					"A game of lottery has been started!  Cost to join is <b>" + WL.lottery.ticketPrice + "</b> Wavelength bucks.<br />" +
					"To buy a ticket, do <code>/lotto join</code>. (Max tickets per user: " + WL.lottery.maxTicketsPerUser + ")</center></div>";
			if (parts[2] === 'pmall') {
				if (!this.can('hotpatch')) return false;
				let loto_notification =
						"<center><font size=5 color=red><b>Lottery Game!</b></font><br />" +
						"A game of Lottery has started in <button name=\"send\" value=\"/join gamechamber\">Game Chamber</button>!<br />" +
						"The ticket cost to join is <b> " + WL.lottery.ticketPrice + "</b> Wavelength Bucks.  For every ticket bought, the server automatically matches that price towards the pot.<br />" +
						"(For more information, hop in the room and do /lotto or ask for help!)</center>";
				WL.pmall('/raw ' + loto_notification, '~WL Lottery');
				Rooms.get('gamechamber').add('|raw|' + room_notification);
			} else {
				Rooms.get('gamechamber').add('|raw|' + room_notification);
			}
			saveLottery();
			break;

		case 'end':
			if (!this.can('ban', null, room)) return false;
			if (!WL.lottery.gameActive) return this.errorReply("There is no active game of lottery currently running.");
			if (!this.canTalk()) return this.errorReply("You cannot do this while unable to talk.");
			let winner = WL.lottery.players[Math.floor(Math.random() * WL.lottery.players.length)];
			let jackpot = Math.floor(100 * Math.random()) + 1;
			if (WL.lottery.pot !== 0) {
				if (jackpot === 100) {
					Rooms.get("gamechamber").add('|raw|<b><font size="7" color="green"><blink>JACKPOT!</blink></font></b>');
					Rooms.get("gamechamber").add('|raw|<b><font size="4" color="' + WL.hashColor(winner) + '">' + winner + '</b></font><font size="4"> has won the game of lottery for <b>' + (WL.lottery.pot * 2) + '</b> bucks!</font>');
					WL.writeMoney(toId(winner), WL.lottery.pot * 2);
					WL.lottery = {};
					saveLottery();
				} else {
					WL.writeMoney(toId(winner), WL.lottery.pot);
					Rooms.get("gamechamber").add('|raw|<b><font size="4" color="' + WL.hashColor(winner) + '">' + winner + '</b></font><font size="4"> has won the game of lottery for <b>' + WL.lottery.pot + '</b> bucks!</font>');
					WL.lottery = {};
					saveLottery();
				}
			} else if (WL.lottery.pot === 0) {
				this.add('|raw|<b><font size="4">This game has been cancelled due to a lack of players by ' + Chat.escapeHTML(toId(user.name)) + '.');
				WL.lottery = {};
				saveLottery();
			}
			this.privateModCommand("(" + Chat.escapeHTML(user.name) + " has ended the game of lottery.)");
			break;

		case 'setlimit':
			if (!this.can('hotpatch')) return false;
			if (!WL.lottery.gameActive) return this.errorReply("The game of lottery is not currently running.");
			if (WL.lottery.players.length >= 1) return this.errorReply("You cannot change the limit because someone(s) have already bought a lottery ticket.");
			if (!parts[1]) return this.errorReply("Usage: /lotto setlimit, [limit of tickets per user].");
			if (isNaN(Number(parts[1]))) return this.errorReply('The pot must be a number greater than 0');
			WL.lottery.maxTicketsPerUser = parts[1];
			saveLottery();
			this.add('|raw|<b><font size="4" color="' + WL.hashColor(user.name) + '">' + Chat.escapeHTML(user.name) + '</font><font size="4"> has changed the lottery ticket cap to: ' + WL.lottery.maxTicketsPerUser + '.</font></b>');
			break;

		case 'limit':
			this.sendReply("The current cap of lottery tickets per user is: " + WL.lottery.maxTicketsPerUser);
			break;

		case 'tickets':
			if (!this.runBroadcast()) return;
			if (!WL.lottery.gameActive) return this.errorReply("There is no active game of lottery currently running.");
			this.sendReplyBox("<div style=\"max-height: 125px; overflow-y: auto; overflow-x: hidden;\" target=\"_blank\"><b>Current tickets: (" + WL.lottery.players.length + ")</b><br /> " + WL.lottery.players + "</div>");
			break;

		case 'odds':
			if (!this.runBroadcast()) return;
			if (!WL.lottery.gameActive) return this.errorReply("There is no active game of lottery currently running.");
			if (!parts[1]) parts[1] = user.name;
			let chance = 0;
			if (WL.lottery.players.length > 1) {
				let filteredPlayerArray = WL.lottery.players.filter(function (username) {
					return username === toId(parts[1]);
				});
				chance = ((filteredPlayerArray.length / WL.lottery.players.length) * 100).toFixed(1);
			}
			if (chance === 0) return this.sendReplyBox("User '" + Chat.escapeHTML(parts[1]) + "' is not in the current game of lottery.  Check spelling?");
			this.sendReplyBox("<b><font color=" + WL.hashColor(parts[1]) + ">" + Chat.escapeHTML(parts[1]) + "</font></b> has a " + chance + "% chance of winning the game of lottery right now.");
			break;

		case 'reload':
			loadLottery();
			this.sendReply("You have reloaded the lottery database.");
			break;

		case 'status':
			if (!this.runBroadcast()) return;
			if (!WL.lottery.gameActive) return this.errorReply("There is no active game of lottery currently running.");
			this.sendReplyBox(
				"<div style=\"max-height: 125px; overflow-y: auto; overflow-x: hidden;\" target=\"_blank\">" +
				"<u>Lottery Game Status:</u><br />" +
				"Game started by: <b><font color=" + WL.hashColor(WL.lottery.createdBy) + ">" + Chat.escapeHTML(WL.lottery.createdBy) + "</font></b><br />" +
				"Pot: <b>" + WL.lottery.pot + " Wavelength bucks</b><br />" +
				"Ticket price: <b>" + WL.lottery.ticketPrice + " Wavelength bucks</b><br />" +
				"Game started: <b>" + moment(WL.lottery.startTime).fromNow() + "</b><br />" +
				"Max tickets per user: <b>" + WL.lottery.maxTicketsPerUser + "</b><br />" +
				"<b>Tickets bought (" + WL.lottery.players.length + "):</b><br />" +
				WL.lottery.players + "</div>"
			);
			break;

		case 'uptime':
			if (!this.runBroadcast()) return;
			if (!WL.lottery.gameActive) return this.errorReply("There is no active game of lottery currently running.");
			this.sendReplyBox("Lottery Game Uptime: <b>" + moment(WL.lottery.startTime).fromNow() + "</b>");
			break;

		case 'pot':
			if (!this.runBroadcast()) return;
			if (!WL.lottery.gameActive) return this.errorReply("There is no active game of lottery currently running.");
			this.sendReplyBox("The current lottery pot is worth: <b>" + WL.lottery.pot + "</b> bucks.");
			break;

		case 'obj':
			if (!this.can('hotpatch')) return false;
			this.sendReplyBox(JSON.stringify(WL.lottery)); //not sure if this needs to stringify
			break;

		default:
			if (!this.runBroadcast()) return;
			this.sendReplyBox(
				"<center><b>Lottery Commands</b><br />" +
				"<code>/lotto create, [ticket price]</code> - Starts a game of lotto with the respected ticket price. (Requires @, #, &, ~)<br />" +
				"<code>/lotto create, [ticket price], pmall</code> - Starts a game of lotto with the respected ticket price AND notifies everyone. (Requires ~)<br />" +
				"<code>/lotto join</code> OR <code>/loto buy</code> - Buys 1 ticket for the current game of loto (no cap set as of now).<br />" +
				"<code>/lotto end</code> - Picks a winner of the lotto.  (Requires @, #, &, ~)<br />" +
				"<code>/lotto setlimit, [ticketcap]</code> - Sets the cap of tickets per user.  (Requires ~)<br />" +
				"<code>/lotto pot</code> - Shows the current pot of the game of lotto.<br />" +
				"<code>/lotto uptime</code> - Shows how long ago the game of lottery was started.<br />" +
				"<code>/lotto status</code> - Shows the current status of lottery.<br />" +
				"<code>/lotto odds, [user]</code> - Shows the odds of [user] winning the lottery.<br />" +
				"<code>/lotto tickets</code> - Shows all of the current tickets in the current game of lotto."
			);
		}
	},
};
