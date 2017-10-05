'use strict';

exports.BattleAbilities = {
	"data": {
		id: "data",
		name: "Data",
		desc: "If the target's ability is Vaccine the user's Attack is boosted by 1.2x, if the target's ability is Virus the user's Attack is weakened by 0.8x.",
		onBasePowerPriority: 8,
		onBasePower: function (basePower, attacker, move) {
			if (attacker.ability) {
				if (attacker.ability === 'vaccine') {
					this.debug('Data boost');
					return this.chainModify(1.2);
				} else
				if (attacker.ability === 'virus') {
					this.debug('Data weaken');
					return this.chainModify(0.8);
				}
			}
		},
	},
	"vaccine": {
		id: "vaccine",
		name: "Vaccine",
		onBasePowerPriority: 8,
		onBasePower: function (basePower, attacker, move) {
			if (attacker.ability) {
				if (attacker.ability === 'virus') {
					this.debug('Vaccine boost');
					return this.chainModify(1.2);
				} else
				if (attacker.ability === 'data') {
					this.debug('Vaccine weaken');
					return this.chainModify(0.8);
				}
			}
		},
		desc: "If the target's ability is Virus the user's Attack is boosted by 1.2x, if the target's ability is Data the user's Attack is weakened by 0.8x.",
	},
	"virus": {
		id: "virus",
		name: "Virus",
		onBasePowerPriority: 8,
		onBasePower: function (basePower, attacker, move) {
			if (attacker.ability) {
				if (attacker.ability === 'data') {
					this.debug('Virus boost');
					return this.chainModify(1.2);
				} else
				if (attacker.ability === 'vaccine') {
					this.debug('Virus weaken');
					return this.chainModify(0.8);
				}
			}
		},
		desc: "If the target's ability is Data the user's Attack is boosted by 1.2x, if the target's ability is Vaccine the user's Attack is weakened by 0.8x.",
	},
};
