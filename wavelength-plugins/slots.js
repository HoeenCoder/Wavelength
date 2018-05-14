/********************
 * Slots for PS!	*
 * Made by Dragotic	*
 * Refactored by	*
 * AlfaStorm and	*
 * Insist			*
 ********************/

"use strict";

// Available slots for the game
const slots = {
	"bulbasaur": 3,
	"squirtle": 6,
	"charmander": 9,
	"pikachu": 12,
	"eevee": 15,
	"snorlax": 18,
	"dragonite": 21,
	"mew": 24,
	"mewtwo": 27,
};

// Trozei sprites for each pokemon
const slotsTrozei = {
	"bulbasaur": "http://www.pokestadium.com/assets/img/sprites/misc/trozei/bulbasaur.gif",
	"squirtle": "http://www.pokestadium.com/assets/img/sprites/misc/trozei/squirtle.gif",
	"charmander": "http://www.pokestadium.com/assets/img/sprites/misc/trozei/charmander.gif",
	"pikachu": "http://www.pokestadium.com/assets/img/sprites/misc/trozei/pikachu.gif",
	"eevee": "http://www.pokestadium.com/assets/img/sprites/misc/trozei/eevee.gif",
	"snorlax": "http://www.pokestadium.com/assets/img/sprites/misc/trozei/snorlax.gif",
	"dragonite": "http://www.pokestadium.com/assets/img/sprites/misc/trozei/dragonite.gif",
	"mew": "http://www.pokestadium.com/assets/img/sprites/misc/trozei/mew.gif",
	"mewtwo": "http://www.pokestadium.com/assets/img/sprites/misc/trozei/mewtwo.gif",
};

const availableSlots = Object.keys(slots);

function spin() {
	return availableSlots[Math.floor(Math.random() * availableSlots.length)];
}

function rng() {
	return Math.floor(Math.random() * 100);
}

function display(result, user, slotOne, slotTwo, slotThree) {
	let display = `<div style="padding: 3px; background: #000000; padding: 5px; border-radius: 5px; text-align: center;">`;
	display += `<center><img src="http://i.imgur.com/p2nObtE.gif" width="300" height="70"></center><br />`;
	display += `<center><img style="padding: 3px; border: 1px inset gold; border-radius: 5px; box-shadow: inset 1px 1px 5px white;" src="${slotsTrozei[slotOne]}"; title="${slotOne}">&nbsp;&nbsp;&nbsp;`;
	display += `<img style="padding: 3px; border: 1px inset gold; border-radius: 5px; box-shadow: inset 1px 1px 5px white;" src="${slotsTrozei[slotTwo]}"; title="${slotTwo}">&nbsp;&nbsp;&nbsp;`;
	display += `<img style="padding: 3px; border: 1px inset gold; border-radius: 5px; box-shadow: inset 1px 1px 5px white;" src="${slotsTrozei[slotThree]}"; title="${slotThree}"></center>`;
	display += `<font style="color: white;"><br />`;
	if (!result) {
		display += `Aww... bad luck, ${Server.nameColor(user, true)}. Better luck next time!`;
	} else {
		display += `Congratulations, ${Server.nameColor(user, true)}. You have won ${slots[slotOne]} ${moneyPlural}!`;
	}
	return display + `</font></div>`;
}

exports.commands = {
	slots: {
		start: "spin",
		spin: function (target, room, user) {
			if (room.id !== "casino") return this.errorReply(`Casino games can only be played in the "Casino".`);
			if (!this.runBroadcast()) return;
			if (!this.canTalk()) return false;

			Economy.readMoney(user.userid, money => {
				if (money < 3) {
					this.errorReply(`You do not have 3 ${moneyPlural} to spin the slots.`);
					return;
				}
				Economy.writeMoney(user.userid, -3, () => {
					Economy.logTransaction(`${user.name} spent 3 ${moneyPlural} to spin the slots.`);
				});

				const result = spin();
				const chancePercentage = rng();
				const chancesGenerated = 70 + availableSlots.indexOf(result) * 3;

				if (chancePercentage >= chancesGenerated) {
					Economy.writeMoney(user.userid, slots[result]);
					Economy.logTransaction(`${user.name} has won ${slots[result]} ${moneyPlural} from playing slots.`);
					return this.sendReplyBox(display(true, user.name, result, result, result));
				}

				// Incase all outcomes are same, it'll resort to changing the first one.
				let outcomeOne = spin();
				let outcomeTwo = spin();
				let outcomeThree = spin();

				while (outcomeOne === outcomeTwo && outcomeOne === outcomeThree) {
					outcomeOne = spin();
				}

				return this.sendReplyBox(display(false, user.name, outcomeOne, outcomeTwo, outcomeThree));
			});
		},

		results: "rewards",
		prizes: "rewards",
		rewards: function (target) {
			if (!this.runBroadcast()) return;
			if (!target) {
				let display = `The Slot Winnings for the Following Pokemon are (in ${moneyPlural}):<br />`;
				for (let slot of availableSlots) {
					display += `${Dex.getTemplate(slot).species}: ${slots[slot]}<br />`;
				}
				this.sendReplyBox(display);
			} else {
				target = Dex.getTemplate(target);
				if (!slots[target.id]) return this.errorReply(`There are no rewards for a streak of ${target.exists ? target.species : target}.`);
				this.sendReplyBox(`<strong>The reward for getting a streak of ${target.species} is ${slots[target.id]} ${moneyPlural}.</strong>`);
			}
		},

		"": "help",
		"help": function () {
			return this.parse("/help slots");
		},
	},

	slotshelp: [
		`Slots is a Casino game that awards the user with varying amount of ${moneyPlural} depending on the streak of Pokemon the user gets.
		/slots spin - Spins the Slot Machine. Requires 3 ${moneyPlural}.
		/slots rewards - Lists the rewards for getting specific Pokemon streaks.
		/slots help - Displays the list of Slot-related commands.`,
	],
};
