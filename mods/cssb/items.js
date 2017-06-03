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
				this.add('message', pokemon, '\'s belly felt full!');
				this.heal(pokemon.maxhp / 2);
				this.add('message', pokemon, '\'s IQ rose!');
				this.boost({
					spd: 2,
				});
				this.boost({
					def: 2,
				});
			} else {
				this.add('message', 'Wait... Its a WANDER Gummi!');
				this.heal(pokemon.maxhp / 100);
				this.add('message', pokemon, 'Gained the blinker status!');
				this.boost({
					accuracy: -6,
				});
			}
		},
	},
};
