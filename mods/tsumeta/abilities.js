'use strict';

exports.BattleAbilities = {
	"defeatist": {
		inherit: true,
		onModifyAtk: function (atk, pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 4) {
				return this.chainModify(0.5);
			}
		},
		onModifySpA: function (atk, pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 4) {
				return this.chainModify(0.5);
			}
		},
		desc: "Halves Attack damage when the user's health is below 1/4",
		shortDesc: "Halves Attack damage when the user's health is below 1/4",
	},
	"gluttony": {
		inherit: true,
		onEatItem: function (item, pokemon) {
			if (!pokemon.volatiles['gluttony']) pokemon.addVolatile('gluttony');
		},
		effect: {
			duration: 2,
			onStart: function (target) {
				this.add('-start', target, 'ability: Gluttony');
			},
			onModifySpe: function (spe, pokemon) {
				return this.chainModify(0.66);
			},
			onModifyAtk: function (atk, pokemon) {
				return this.chainModify(0.66);
			},
			onModifyAtkPriority: 6,
			onSourceModifyAtk: function (atk, attacker, defender, move) {
				if (move.type === 'Ice' || move.type === 'Fire') {
					this.debug('Gluttony weaken');
					return this.chainModify(0.5);
				}
			},
			onModifySpAPriority: 5,
			onSourceModifySpA: function (atk, attacker, defender, move) {
				if (move.type === 'Ice' || move.type === 'Fire') {
					this.debug('Gluttony weaken');
					return this.chainModify(0.5);
				}
			},
			onEnd: function (target) {
				this.add('-end', target, 'ability: Gluttony');
			},
		},
		desc: "Doubles berries effects upon being eaten.",
		shortDesc: "Doubles berries effects upon being eaten. Lowers users speed and atk by 1 stage for 2 turns, adds thick fat effect",
	},
	"immunity": {
		inherit: true,
		desc: "This Pokemon cannot be poisoned, burned or paralyzed. Gaining this Ability while poisoned, burned or paralyzed cures it.",
		shortDesc: "This Pokemon cannot be poisoned, burned or paralyzed. Gaining this Ability while poisoned, burned or paralyzed cures it.",
		onUpdate: function (pokemon) {
			if (pokemon.status === 'psn' || pokemon.status === 'tox' || pokemon.status === 'par' || pokemon.status === 'brn') {
				this.add('-activate', pokemon, 'ability: Immunity');
				pokemon.cureStatus();
			}
		},
		onSetStatus: function (status, target, source, effect) {
			if (status.id !== 'psn' && status.id !== 'tox' || status.id !== 'brn' || status.id !== 'par') return;
			if (!effect || !effect.status) return false;
			this.add('-immune', target, '[msg]', '[from] ability: Immunity');
			return false;
		},
	},
	"turboblaze": {
		inherit: true,
		onModifyAtkPriority: 5,
		onModifyAtk: function (atk, attacker, defender, move) {
			if (move.type === 'Fire') {
				this.debug('TurboBlaze boost');
				return this.chainModify(1.5);
			}
		},
		onModifySpAPriority: 5,
		onModifySpA: function (atk, attacker, defender, move) {
			if (move.type === 'Fire') {
				this.debug('TurboBlaze boost');
				return this.chainModify(1.5);
			}
		},
		desc: "Boosts Fire type attacks by 1.5x.",
		shortDesc: "Boosts Fire type attacks by 1.5x.",
	},
	"teravolt": {
		inherit: true,
		onModifyAtkPriority: 5,
		onModifyAtk: function (atk, attacker, defender, move) {
			if (move.type === 'Electric') {
				this.debug('Teravolt boost');
				return this.chainModify(1.5);
			}
		},
		onModifySpAPriority: 5,
		onModifySpA: function (atk, attacker, defender, move) {
			if (move.type === 'Electric') {
				this.debug('Teravolt boost');
				return this.chainModify(1.5);
			}
		},
		desc: "Boosts Electric type attacks by 1.5x.",
		shortDesc: "Boosts Electric type attacks by 1.5x.",
	},
	"moldbreaker": {
		inherit: true,
		onHit: function (target, source, move) {
			if (move && move.effectType === 'Move') {
				this.chainModify(1.33);
			}
		},
		onModifyMove: function (move, pokemon) {
			if (move.basePower < 120 && pokemon.types.indexOf(move.type) > -1) this.chainModify(1.25);
		},
		desc: "Ignores abilities, increases the power of all STAB moves at or under 120 BP by 50%. In return, damage taken is increased by 33%.",
		shortDesc: "Ignores Abilities, Boosts STAB Moves under 120 BP by 50%, but takes 33% more damage.",
	},
	"unburden": {
		inherit: true,
		onAfterUseItem: function (item, pokemon) {
			if (pokemon !== this.effectData.target) return;
			pokemon.addVolatile('unburden');
		},
		onTakeItem: function (item, pokemon) {
			pokemon.addVolatile('unburden');
		},
		onEnd: function (pokemon) {
			pokemon.removeVolatile('unburden');
		},
		effect: {
			onModifySpe: function (spe, pokemon) {
				if (!pokemon.item) {
					return this.chainModify(1.5);
				}
			},
		},
		desc: "1.5x Speed when the user loses their item.",
		shortDesc: "1.5x Speed when the user loses their item.",
	},
	"intimidate": {
		inherit: true,
		onStart: function (pokemon) {
			let foeactive = pokemon.side.foe.active;
			let activated = false;
			for (let i = 0; i < foeactive.length; i++) {
				if (!foeactive[i] || !this.isAdjacent(foeactive[i], pokemon)) continue;
				if (!activated) {
					this.add('-ability', pokemon, 'Intimidate', 'boost');
					activated = true;
				}
				if (foeactive[i].volatiles['substitute'] || foeactive[i].ability === 'intimidate') {
					this.add('-immune', foeactive[i], '[msg]');
				} else {
					this.boost({atk: -1}, foeactive[i], pokemon);
				}
				if (Math.floor(Math.random() * 99) < 20) {
					this.boost({spe: -1}, foeactive[i], pokemon);
				}
			}
		},
		desc: "Intimidate cannot affect other Intimidate users. In return, Intimidate also has a 20% chance to lower the enemies' Speed by one stage.",
		shortDesc: "Intimidaters are immune to Intimidate, Intimidaters has 20% chance to lower foe's Speed by 1 stage.",
	},
	"stickyhold": {
		inherit: true,
		onAfterDamage: function (target, source, effect, damage) {
			if (effect && effect.flags['contact']) {
				this.add('-ability', target, 'Sticky Hold');
				this.boost({
					spe: -1,
				}, source, target, null, true);
			}
		},
		desc: "User's item cannot be knocked off, and lowers Speed by one stage upon being hit by a contact move.",
		shortDesc: "User's item cannot be knocked off, and lowers Speed by one stage upon being hit by a contact move.",
	},
	"gooey": {
		inherit: true,
		onAfterDamage: function (damage, target, source, effect) {
			if (effect && effect.flags['contact']) {
				this.add('-ability', target, 'Gooey');
				this.boost({spe: -2}, source, target, null, true);
			}
		},
		desc: "If the user is hit by a contact move, the attacker's speed drops two stages.",
		shortDesc: "If the user is hit by a contact move, the attacker's speed drops two stages.",
	},
	"multitype": {
		inherit: true,
		desc: "If this Pokemon is an Arceus or Dunsparce, its type changes to match its held Plate or Z-Crystal.",
		shortDesc: "If this Pokemon is an Arceus or Dunsparce, its type changes to match its held Plate or Z-Crystal.",
	},
};
