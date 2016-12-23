/*Dice Game plugin by SilverTactic (Silveee)*/

'use strict';

const INACTIVE_END_TIME = 1 * 60 * 1000; // 1 minute
//const TAX = 0.10; // 10%
const TAX = 0;

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
		this.startMessage = '<div class="infobox"><b style="font-size: 14pt; color: #24678d"><center><span style="color: ' + SG.hashColor(starter) + '">' + Chat.escapeHTML(starter) + '</span> has started a game of dice for <span style = "color: green">' + amount + '</span> ' + buck + '!</center></b><br>' +
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
			this.room.add('|uhtmlchange|' + this.room.diceCount + '|' + this.startMessage + '<center>' + SG.nameColor(user.name) + ' has joined the game!</center></div>').update();
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
					this.room.add('|uhtmlchange|' + this.room.diceCount + '|' + this.startMessage + '<center>' + this.players.map(user => SG.nameColor(user.name)) + ' has joined the game!</center>').update();
					return;
				}
				let players = this.players.map(user => SG.nameColor(user.name)).join(' and ');
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
						SG.nameColor(p1.name, true) + ' rolled ' + (roll1 + 1) + '!<br />' +
						SG.nameColor(p2.name, true) + ' rolled ' + (roll2 + 1) + '!<br />' +
						SG.nameColor(winner.name, true) + ' has won <b style="color:green">' + (this.bet - taxedAmt) + '</b> ' + buck + '!<br />' +
						'Better luck next time, ' + SG.nameColor(loser.name) + '!'
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

exports.commands = {
	startdice: 'dicegame',
	dicegame: function (target, room, user) {
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

	dicejoin: 'joindice',
	joindice: function (target, room, user) {
		if (room.id === 'lobby') return this.errorReply("This command cannot be used in the Lobby.");
		if ((user.locked || room.isMuted(user)) && !user.can('bypassall')) return this.sendReply("You cannot use this command while unable to talk.");
		if (!room.dice) return this.errorReply('There is no game of dice going on in this room.');

		room.dice.join(user, this);
	},

	diceleave: 'leavedice',
	leavedice: function (target, room, user) {
		if (room.id === 'lobby') return this.errorReply("This command cannot be used in the Lobby.");
		if (!room.dice) return this.errorReply('There is no game of dice going on in this room.');

		room.dice.leave(user, this);
	},

	diceend: 'enddice',
	enddice: function (target, room, user) {
		if (room.id === 'lobby') return this.errorReply("This command cannot be used in the Lobby.");
		if ((user.locked || room.isMuted(user)) && !user.can('bypassall')) return this.sendReply("You cannot use this command while unable to talk.");
		if (!room.dice) return this.errorReply('There is no game of dice going on in this room.');
		if (!user.can('broadcast', null, room) && !room.dice.players.includes(user)) return this.errorReply("You must be ranked + or higher in this room to end a game of dice.");

		room.dice.end(user);
	},
	dicegamehelp: [
		'/startdice or /dicegame [amount] - Starts a game of dice in the room for a given number of bucks, 1 by default (NOTE: There is a 10% tax on bucks you win from dice games).',
		'/joindice - Joins the game of dice. You cannot use this command if you don\'t have the number of bucks the game is for.',
		'/leavedice - Leaves the game of dice.',
		'/enddice - Ends the game of dice. Requires + or higher to use.',
	],
};
