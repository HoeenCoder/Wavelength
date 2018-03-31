/**
 * UNO
 * Pokemon Showdown - http://pokemonshowdown.com/
 *
 * This plugin allows rooms to run games of scripted UNO
 *
 * Credits: sparkychild
 *
 * Pokémon Plays UNO! Coded by Lord Haji and HoeenHero
 * UNO Card Images(Card Art) by Ashley The Pikachu
 * Most sprites for Card Art ripped by Kyleboy(https://www.spriters-resource.com/game_boy_gbc/pokemontradingcardgame2/),
 * PokéDoll Sprite by Nemu(https://www.spriters-resource.com/game_boy_gbc/pokemontradingcardgame/sheet/8885/)
 *
 * @license MIT license
 */

'use strict';

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

	for (const color of colors) {
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

		// send the display of their cards again
		this.players[user.userid].sendDisplay();

		this.nextTurn();
	}

	onDrawCard(user, count) {
		if (!(user.userid in this.players)) return false;
		let drawnCards = this.drawCard(count);

		let player = this.players[user.userid];
		player.hand.push(...drawnCards);
		player.sendRoom(`|raw|You have drawn the following card${Chat.plural(drawnCards)}: ${drawnCards.map(card => `<span style="color: ${textColors[card.color]}">${card.name}</span>`).join(', ')}.`);
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
		for (let i in this.players) {
			WL.ExpControl.addExp(this.players[i].userid, this.room, 20);
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
		for (const [i, card] of this.hand.entries()) {
			if (card.name === cardName) {
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
		let hand = this.buildHand().join('');
		let players = `<p><strong>Players (${this.game.playerCount}):</strong></p>${this.game.getPlayers(true).join('<br />')}`;
		let draw = '<button class="button" style="width: 45%; background: rgba(0, 0, 255, 0.05)" name=send value="/uno draw">Draw a card!</button>';
		let pass = '<button class="button" style=" width: 45%; background: rgba(255, 0, 0, 0.05)" name=send value="/uno pass">Pass!</button>';
		let uno = `<button class="button" style=" width: 90%; background: rgba(0, 255, 0, 0.05); height: 30px; margin-top: 2px;" name=send value="/uno uno ${this.game.unoId || '0'}">UNO!</button>`;

		let top = `<strong>Top Card: <span style="color: ${textColors[this.game.topCard.changedColor || this.game.topCard.color]}">${this.game.topCard.name}</span></strong>`;

		// clear previous display and show new display
		this.sendRoom("|uhtmlchange|uno-hand|");
		this.sendRoom(
			`|uhtml|uno-hand|<div style="border: 1px solid skyblue; padding: 0 0 5px 0"><table style="width: 100%; table-layout: fixed; border-radius: 3px"><tr><td colspan=4 rowspan=2 style="padding: 5px"><div style="overflow-x: auto; white-space: nowrap; width: 100%">${hand}</div></td>${this.game.currentPlayer === this.userid ? `<td colspan=2 style="padding: 5px 5px 0 5px">${top}</td></tr>` : ""}` +
			`<tr><td colspan=2 style="vertical-align: top; padding: 0px 5px 5px 5px"><div style="overflow-y: scroll">${players}</div></td></tr></table>` +
			`${this.game.currentPlayer === this.userid ? `<div style="text-align: center">${draw}${pass}<br />${uno}</div>` : ""}</div>`
		);
	}
}

exports.commands = {
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
			this.privateModAction(`(A game of UNO was created by ${user.name}.)`);
			this.modlog('UNO CREATE');
		},

		start: function (target, room, user) {
			if (!this.can('minigame', null, room)) return;
			if (!room.game || room.game.gameid !== 'uno' || room.game.state !== 'signups') return this.errorReply("There is no UNO game in signups phase in this room.");
			if (room.game.onStart()) {
				this.privateModAction(`(The game of UNO was started by ${user.name}.)`);
				this.modlog('UNO START');
			}
		},

		stop: 'end',
		end: function (target, room, user) {
			if (!this.can('minigame', null, room)) return;
			if (!room.game || room.game.gameid !== 'uno') return this.errorReply("There is no UNO game going on in this room.");
			room.game.destroy();
			room.add("The game of UNO was forcibly ended.").update();
			this.privateModAction(`(The game of UNO was ended by ${user.name}.)`);
			this.modlog('UNO END');
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
			this.addModAction(`${user.name} has set the UNO automatic disqualification timer to ${amount} seconds.`);
			this.modlog('UNO TIMER', null, `${amount} seconds`);
		},

		dq: 'disqualify',
		disqualify: function (target, room, user) {
			if (!this.can('minigame', null, room)) return;
			if (!room.game || room.game.gameid !== 'uno') return this.errorReply("There is no UNO game going on in this room right now.");

			let disqualified = room.game.eliminate(toId(target));
			if (disqualified === false) return this.errorReply(`Unable to disqualify ${target}.`);
			this.privateModAction(`(${user.name} has disqualified ${disqualified} from the UNO game.)`);
			this.modlog('UNO DQ', toId(target));
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

			this.addModAction(`${user.name} has turned ${(state ? 'on' : 'off')} suppression of UNO game messages.`);
			this.modlog('UNO SUPRESS', null, (state ? 'ON' : 'OFF'));
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
	},

	unohelp: [
		`/uno create [player cap] - creates a new UNO game with an optional player cap (default player cap at 6). Use the command [createpublic] to force a public game or [createprivate] to force a private game. Requires: % @ * # & ~`,
		`/uno timer [amount] - sets an auto disqualification timer for [amount] seconds. Requires: % @ * # & ~`,
		`/uno end - ends the current game of UNO. Requires: % @ * # & ~`,
		`/uno start - starts the current game of UNO. Requires: % @ * # & ~`,
		`/uno disqualify [player] - disqualifies the player from the game. Requires: % @ * # & ~`,
		`/uno hand - displays your own hand.`,
		`/uno getusers - displays the players still in the game.`,
		`/uno [spectate|unspectate] - spectate / unspectate the current private UNO game.`,
		`/uno suppress [on|off] - Toggles suppression of game messages.`,
		`/uno showcase - Displays all of the Pokémon Plays UNO! Cards.`,
	],
};
