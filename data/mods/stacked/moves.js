'use strict';
exports.BattleMovedex = {
	"spikes": {
		inherit: true,
		effect: {
			// this is a side condition
			onStart: function (side) {
				this.add('-sidestart', side, 'Spikes');
				this.effectData.layers = 1;
			},
			onRestart: function (side) {
				this.add('-sidestart', side, 'Spikes');
				this.effectData.layers++;
			},
			onSwitchIn: function (pokemon) {
				if (!pokemon.isGrounded()) return;
				let damageAmounts = [0, 3, 4, 6, 12, 24]; // 1/8, 1/6, 1/4, 1/2, 1/1 to infinity...
				if (this.effectData.layers > 5) this.effectData.layers = 5;
				this.damage(damageAmounts[this.effectData.layers] * pokemon.maxhp / 24);
			},
		},
	},
	"stealthrock": {
		inherit: true,
		effect: {
			// this is a side condition
			onStart: function (side) {
				this.add('-sidestart', side, 'move: Stealth Rock');
				this.effectData.layers = 1;
			},
			onRestart: function (side) {
				this.add('-sidestart', side, 'move: Stealth Rock');
				this.effectData.layers++;
			},
			onSwitchIn: function (pokemon) {
				let damageAmounts = [0, 3, 4, 6, 12, 24]; // 1/8, 1/6, 1/4, 1/2, 1/1 to infinity...
				if (this.effectData.layers > 5) this.effectData.layers = 5;
				let typeMod = this.clampIntRange(pokemon.runEffectiveness('Rock'), -6, 6);
				this.damage(damageAmounts[this.effectData.layers] * (pokemon.maxhp * Math.pow(2, typeMod) / 24));
			},
		},
	},
	"stickyweb": {
		inherit: true,
		effect: {
			onStart: function (side) {
				this.add('-sidestart', side, 'move: Sticky Web');
				this.effectData.layers = 1;
			},
			onRestart: function (side) {
				this.add('-sidestart', side, 'move: Sticky Web');
				this.effectData.layers++;
			},
			onSwitchIn: function (pokemon) {
				if (!pokemon.isGrounded()) return;
				this.add('-activate', pokemon, 'move: Sticky Web');
				this.boost({spe: (this.effectData.layers * -1)}, pokemon, pokemon.side.foe.active[0], this.getMove('stickyweb'));
			},
		},
	},
	//Just for consistency
	"toxicspikes": {
		inherit: true,
		effect: {
			onStart: function (side) {
				this.add('-sidestart', side, 'move: Toxic Spikes');
				this.effectData.layers = 1;
			},
			onRestart: function (side) {
				this.add('-sidestart', side, 'move: Toxic Spikes');
				this.effectData.layers++;
			},
			onSwitchIn: function (pokemon) {
				if (!pokemon.isGrounded()) return;
				if (!pokemon.runImmunity('Poison')) return;
				if (pokemon.hasType('Poison')) {
					this.add('-sideend', pokemon.side, 'move: Toxic Spikes', '[of] ' + pokemon);
					pokemon.side.removeSideCondition('toxicspikes');
				} else if (this.effectData.layers >= 2) {
					pokemon.trySetStatus('tox', pokemon.side.foe.active[0]);
				} else {
					pokemon.trySetStatus('psn', pokemon.side.foe.active[0]);
				}
			},
		},
	},
};
