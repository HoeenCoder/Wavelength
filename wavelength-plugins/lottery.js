/****************************************
 * Lottery Plug-in for Pokémon Showdown
 *            Created by:
 *         HoeenHero and Insist
 ****************************************/

"use strict";

class Lottery {
	constructor(room, user) {
		this.players = [];
		this.room = room;
		room.lottoNumber = room.lottoNumber ? room.lottoNumber++ : 1;
		this.lottoNumber = room.lottoNumber;
		this.costToJoin = 3;
		this.room.add(`|uhtml|lottery-${this.lottoNumber}|<div class="broadcast-blue"><p style="font-size: 14pt; text-align: center">A new <strong>Lottery drawing</strong> is starting!</p><p style="font-size: 9pt; text-align: center"><button name="send" value="/lotto join">Join</button><br /><strong>Joining costs ${this.costToJoin} ${currencyPlural}</strong></p></div>`, true);
		this.timer = setTimeout(() => {
			if (this.players.length < 2) {
				this.room.add('|uhtmlchange|lottery-' + this.lottoNumber + '|<div class="broadcast-red"><p style="text-align: center; font-size: 14pt>This Lottery drawing has ended due to lack of users.</p></div>');
				return this.end();
			}
			this.drawWinner();
		}, 1000 * 60 * 60 * 24);
	}

	onConnect(user, connection, room) {
		user.sendTo(this.room, '|uhtml|lottery-' + this.lottoNumber + '|<div class="broadcast-blue"><p style="text-align: center; font-size: 14pt>A Lottery Drawing has started looking for players!<hr /><br />For the price of 3 ' + currencyPlural + ', you can earn 5 ' + currencyPlural + ' plus one ' + currencyName + ' per user who joins.</p><br /><button name="send" value="/lottery join">Click here to join the Lottery</button></div>');
	}

	drawWinner() {
		let winner = this.players[Math.floor(Math.random() * this.players.length)];
		let lottoPrize = 5 + this.players.length + this.costToJoin;
		this.room.add(`|html|<div class="infobox"><center><strong>Congratulations</strong> ${WL.nameColor(winner, true)}!!! You have won the reward of ${lottoPrize} ${currencyPlural}</center></div>`);
		Economy.writeMoney(winner, lottoPrize);
		Economy.logTransaction(`${winner} has won the Lottery prize of ${lottoPrize} ${currencyPlural}`);
		this.end();
	}

	joinLottery(user) {
		if (this.players.includes(user.userid)) return user.sendTo(this.room, 'You have already joined the lottery');
		Economy.readMoney(user.userid, money => {
			if (money < this.costToJoin) {
				user.sendTo(this.room, 'You do not have enough ' + currencyPlural + ' to join.');
				return;
			}
			Economy.writeMoney(user.userid, -this.costToJoin, () => {
				Economy.readMoney(user.userid, money => {
					Economy.logTransaction(user.name + " entered a Lottery drawing for " + this.costToJoin + " " + currencyPlural + ".");
				});
			});
			this.players.push(user.userid);
			user.sendTo(this.room, 'You have joined the lottery.');
		});
	}

	leaveLottery(user) {
		if (!this.players.includes(user.userid)) return user.sendTo(this.room, `You are not currently in the Lottery drawing in this room..`);
		Economy.writeMoney(user.userid, this.costToJoin, () => {
			this.players.splice(this.players.indexOf(user.userid), 1);
			user.sendTo(this.room, 'You have left the lottery and have been refunded ' + this.costToJoin + '.');
			Economy.logTransaction(user.userid + " has left the Lottery drawing, and has been refunded their " + this.costToJoin + " " + currencyPlural + ".");
		});
	}

	end() {
		this.room.add(`|uhtmlchange|lottery-${this.lottoNumber}|<div class="infobox">This Lottery Drawing has ended.</div>`).update();
		clearTimeout(this.timer);
		delete this.room.lottery;
	}
}

exports.commands = {
	lotto: "lottery",
	lottery: {
		create: "new",
		make: "new",
		new: function (target, room, user) {
			if (room.lottery) return this.sendReply("A join-able Lottery drawing is already active.");
			if (!this.can('mute', null, room)) return false;
			if (!room.isOfficial) return this.sendReply('Lottery drawings can only be created in Official Chatrooms.');
			this.modlog(`LOTTERY`, null, `created`);
			this.privateModAction(`(A new Lottery drawing has been created.)`);
			room.lottery = new Lottery(room, user);
		},
		j: "join",
		join: function (target, room, user) {
			if (!room.lottery) return this.sendReply("There is no join-able Lottery drawing going on right now.");
			if (!this.canTalk()) return this.sendReply("You must be able to talk to join a Lottery drawing.");
			if (!user.registered) return this.sendReply("To join the Lottery, you must be on a registered account.");
			room.lottery.joinLottery(user);
		},
		part: "leave",
		l: "leave",
		leave: function (target, room, user) {
			if (!room.lottery) return this.sendReply("There is no active Lottery drawing in this room.");
			room.lottery.leaveLottery(user);
		},
		players: function (target, room, user) {
			if (!room.lottery) return this.sendReply("There is no active Lottery drawing in this room.");
			return this.sendReply('There are ' + room.lottery.players.length + ' users in the lottery.');
		},
		forcestart: "start",
		begin: "start",
		start: function (target, room, user) {
			if (!this.can('mute', null, room)) return;
			if (!room.lottery) return this.sendReply("There is not any Lottery drawing available to be started.");
			if (room.lottery.players.length < 2) return this.sendReply("You can't start a Lottery drawing without at least two users joining.");
			this.modlog(`LOTTERY`, null, `started early`);
			this.privateModAction(`(The Lottery drawing has been started early.)`);
			room.lottery.drawWinner();
		},
		cancel: "end",
		end: function (target, room, user) {
			if (!this.can('mute', null, room)) return;
			if (!room.lottery) return this.sendReply("There is no Lottery drawing going on right now.");
			this.modlog(`LOTTERY`, null, `forcefully ended`);
			this.privateModAction(`(The Lottery drawing was forcefully ended.)`);
			room.lottery.end();
		},
	},
	lotteryhelp: [
		"Another alias for /lottery is /lotto.",
		"/lottery new - Creates a new Lottery drawing. Must be a Room Driver or higher.",
		"/lottery join - Join a Lottery drawing. Requires " + this.costToJoin + " " + currencyPlural + ".",
		"/lottery leave - Leaves a Lottery drawing.",
		"/lottery start - Forcefully starts a Lottery drawing (instead of starting automatically in 24 hours from creation). Must be a Room Driver or higher.",
		"/lottery end - Forcefully ends a Lottery drawing. Must be a Room Driver or higher.",
	],
};
