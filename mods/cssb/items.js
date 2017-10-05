'use strict';
exports.BattleItems = {
	// VXN
	"wondergummi": {
		id: "wondergummi",
		name: "Wonder Gummi",
		spritenum: 538,
		naturalGift: {
			basePower: 200,
			type: "???",
		},
		isNonStandard: true,
		onUpdate: function (pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 4 || (pokemon.hp <= pokemon.maxhp / 2 && pokemon.hasAbility('gluttony'))) {
				pokemon.eatItem();
			}
		},
		onTryEatItem: function (item, pokemon) {
			if (!this.runEvent('TryHeal', pokemon)) return false;
		},
		onEat: function (pokemon) {
			let fakecheck = this.random(1000);
			if (fakecheck <= 850) {
				this.add('message', 'Its belly felt full!');
				this.heal(pokemon.maxhp / 2);
				this.add('message', 'Its IQ rose!');
				this.boost({
					spd: 2,
				});
				this.boost({
					def: 2,
				});
			} else {
				this.add('message', 'Wait... Its a WANDER Gummi!');
				this.heal(pokemon.maxhp / 100);
				this.add('message', 'It gained the blinker status!');
				this.boost({
					accuracy: -6,
				});
			}
		},
		desc: "Either heals the user's max HP by 1/2, boosts the user's SpD and Def by 2 stages, or heals 1% of their health, but drops accuracy by six stages, when at 1/4 max HP or less, 1/2 if the user's ability is Gluttony. Single use.",
	},
	// Gligars
	"gravitysuit": {
		id: "gravitysuit",
		name: "Gravity Suit",
		spritenum: 581,
		fling: {
			basePower: 30,
		},
		onStart: function (pokemon) {
			this.useMove('Gravity', pokemon);
			this.useMove('Trick Room', pokemon);
		},
		isNonStandard: true,
		desc: "Uses Gravity and Trick Room on Switch-in.",
	},
	//megas4ever
	"spiritorb": {
		id: "spiritorb",
		name: "Spirit Orb",
		spritenum: 459,
		fling: {
			basePower: 30,
		},
		onBasePowerPriority: 6,
		onBasePower: function (basePower, user, target, move) {
			if (move && (move.type === 'Psychic')) {
				return this.chainModify([0x1333, 0x1000]);
			}
		},
		onModifySpAPriority: 1,
		onModifySpA: function (spa) {
			return this.chainModify(1.5);
		},
		onModifySpDPriority: 1,
		onModifySpD: function (spd) {
			return this.chainModify(1.5);
		},
		desc: "1.5x SpA & SpD + Psychic moves do 1.3x more.",
	},
	//Insist
	playniumz: {
		spritenum: 656,
		onTakeItem: false,
		id: "playniumz",
		name: "Playnium Z",
		isNonStandard: true,
		zMove: "Exiled From All Others",
		zMoveFrom: "Debugging",
		zMoveUser: ["Ludicolo"],
		desc: "If holder is a Ludicolo with Debugging, it can use Exiled From All Others.",
	},
};
