/**
 * A lot of Gen 1 moves have to be updated due to different mechanics.
 * Some moves have had major changes, such as Bite's typing.
 */
'use strict';

exports.BattleMovedex = {
	/*************************
		Custom Moves
	*************************/
	supergigadrain: {
		accuracy: 100,
		basePower: 100,
		category: "Special",
		id: "supergigadrain",
		name: "Super Giga Drain",
		isNonstandard: true,
		pp: 10,
		priority: 0,
		flags: {
			protect: 1,
			heal: 1,
			mirror: 1,
		},
		volatileStatus: 'leechseed',
		effect: {
			onStart: function (target) {
				this.add('-start', target, 'move: Leech Seed');
			},
			onResidualOrder: 8,
			onResidual: function (pokemon) {
				let target = this.effectData.source.side.active[pokemon.volatiles['leechseed'].sourcePosition];
				if (!target || target.fainted || target.hp <= 0) {
					this.debug('Nothing to leech into');
					return;
				}
				let damage = this.damage(pokemon.maxhp / 8, pokemon, target);
				if (damage) {
					this.heal(damage, target, pokemon);
				}
			},
		},
		drain: [1, 2],
		secondary: false,
		onPrepareHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Giga Drain", target);
			this.add('-anim', source, "Leech Seed", target);
		},
		target: "normal",
		type: "Grass",
	},
	boostmonlee: {
		accuracy: 100,
		category: "Status",
		id: "boostmonlee",
		name: "Boostmonlee",
		isNonstandard: true,
		pp: 10,
		priority: 0,
		flags: {
			snatch: 1,
			mirror: 1,
		},
		self: {
			boosts: {
				spe: 1,
				atk: 1,
				def: -1,
				spd: -1,
				spa: -1,
			},
			heal: [1, 5],
		},
		onPrepareHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Bulk Up", target);
		},
		secondary: false,
		target: "normal",
		type: "Fighting",
	},
	codehax: {
		accuracy: 100,
		category: "Status",
		id: "codehax",
		name: "Code Hax",
		isNonstandard: true,
		pp: 10,
		priority: 0,
		flags: {
			snatch: 1,
			mirror: 1,
		},
		boosts: {
			atk: 1,
			spa: 1,
			spd: 1,
		},
		secondary: false,
		target: "self",
		type: "Fire",
	},
	abusepower: {
		accuracy: 100,
		category: "Status",
		id: 'abusepower',
		name: "Abuse Power",
		isNonstandard: true,
		pp: 10,
		priority: 0,
		boosts: {
			atk: 6,
			def: 6,
			spa: 6,
			spd: 6,
			spe: 6,
		},
		heal: [1, 10],
		secondary: false,
		target: "self",
		type: "Bug",
	},
	naturesfury: {
		accuracy: 100,
		category: "Status",
		id: 'naturesfury',
		name: "Natures Fury",
		isNonstandard: true,
		pp: 10,
		priority: 0,
		flags: {},
		boosts: {
			atk: 1,
			spa: 1,
			spe: 1,
		},
		heal: [1, 10],
		secondary: false,
		target: "self",
		type: "Fire",
	},
	dragonsstrike: {
		accuracy: 100,
		basePower: 90,
		category: "Physical",
		id: 'dragonsstrike',
		name: "Dragons Strike",
		isNonstandard: true,
		pp: 10,
		priority: 0,
		self: {
			boosts: {
				atk: 1,
			},
		},
		flags: {
			protect: 1,
			mirror: 1,
		},
		secondary: false,
		target: "normal",
		type: "Dragon",
	},
	flyingstrike: {
		accuracy: 100,
		basePower: 120,
		category: "Physical",
		id: 'dragonsstrike',
		name: "Dragons Strike",
		isNonstandard: true,
		pp: 10,
		priority: 0,
		self: {
			boosts: {
				atk: 1,
				spe: 1,
				spa: -1,
				spd: -1,
				def: -1,
			},
		},
		flags: {
			protect: 1,
			mirror: 1,
		},
		secondary: false,
		target: "normal",
		type: "Dragon",
	},
	buildingrage: {
		accuracy: 100,
		category: "Status",
		id: 'buildingrage',
		name: "Building Rage",
		isNonstandard: true,
		pp: 10,
		priority: 0,
		flags: {},
		boosts: {
			atk: 1,
			def: 1,
		},
		secondary: false,
		target: "self",
		type: "Fire",
	},
	psyburst: {
		accuracy: 100,
		basePower: 85,
		category: "Special",
		id: 'psyburst',
		name: "Psyburst",
		isNonstandard: true,
		pp: 10,
		priority: 0,
		flags: {
			protect: 1,
			mirror: 1,
		},
		secondary: {
			chance: 30,
			volatileStatus: 'flinch',
		},
		target: "normal",
		type: "Psychic",
	},
	icespirit: {
		accuracy: 90,
		basePower: 70,
		category: "Special",
		id: 'icespirit',
		name: "Ice Spirit",
		isNonstandard: true,
		pp: 10,
		priority: 0,
		flags: {
			protect: 1,
			mirror: 1,
		},
		secondary: false,
		self: {
			boosts: {
				spe: 1,
			},
		},
		target: "normal",
		type: "Ice",
	},
	doubleassist: {
		accuracy: 100,
		category: "Status",
		id: "doubleassist",
		name: "Double Assist",
		isNonstandard: true,
		pp: 10,
		priority: 1,
		boosts: {
			atk: 2,
		},
		target: "self",
		type: "Normal",
	},
	poisonshock: {
		accuracy: 95,
		basePower: 80,
		category: "Special",
		id: 'poisonshock',
		name: "Poison Shock",
		isNonstandard: true,
		pp: 10,
		priority: 0,
		flags: {
			protect: 1,
			mirror: 1,
		},
		secondary: {
			chance: 20,
			status: 'psn',
		},
		target: "normal",
		type: "Poison",
	},
	metalbomb: {
		accuracy: 100,
		basePower: 120,
		category: "Physical",
		id: 'metalbomb',
		name: "Metal Bomb",
		isNonstandard: true,
		pp: 10,
		priority: -1,
		flags: {
			protect: 1,
			mirror: 1,
		},
		secondary: {
			chance: 50,
			status: 'par',
		},
		target: "normal",
		type: "Normal",
	},
	turtleboost: {
		accuracy: 100,
		category: "Status",
		id: "turtleboost",
		name: "Turtle Boost",
		isNonstandard: true,
		pp: 10,
		priority: 0,
		secondary: false,
		boosts: {
			spa: 1,
			spd: 1,
		},
		target: "self",
		type: "Water",
	},
	nibble: {
		accuracy: 100,
		category: "Status",
		id: 'nibble',
		name: "Nibble",
		pp: 10,
		priority: 3,
		flags: {
			protect: 1,
			mirror: 1,
		},
		secondary: {
			chance: 100,
			status: 'par',
		},
		target: "normal",
		type: "Normal",
	},
	rapidroll: {
		accuracy: 100,
		category: "Physical",
		basePower: 60,
		id: 'rapidroll',
		name: 'Rapid Roll',
		pp: 10,
		priority: 1,
		flags: {
			protect: 1,
			mirror: 1,
		},
		secondary: false,
		target: "normal",
		type: "Rock",
	},
	coldrevenge: {
		accuracy: 95,
		category: "Special",
		basePower: 60,
		id: 'coldrevenge',
		name: 'Cold Revenge',
		pp: 10,
		priority: 0,
		flags: {
			protect: 1,
			mirror: 1,
		},
		secondary: {
			chance: 20,
			self: {
				boosts: {
					def: 1,
					spa: 1,
					spd: 1,
				},
			},
		},
		target: "normal",
		type: "Ice",
	},
	minimumpower: {
		accuracy: 100,
		category: "Special",
		basePower: 70,
		id: 'minimumpower',
		name: 'Minimum Power',
		pp: 10,
		priority: 1,
		flags: {
			protect: 1,
			mirror: 1,
		},
		secondary: false,
		target: "normal",
		type: "Electric",
	},
	spikerelease: {
		accuracy: 95,
		category: "Special",
		basePower: 60,
		id: 'spikerelease',
		name: 'Spike Relase',
		pp: 10,
		priority: 1,
		flags: {
			protect: 1,
			mirror: 1,
		},
		self: {
			boosts: {
				spa: 1,
				spd: 1,
			},
		},
		secondary: false,
		target: "normal",
		type: "Ground",
	},
	crisis: {
		accuracy: 100,
		basePower: 100,
		category: "Special",
		id: 'crisis',
		name: "Crisis",
		pp: 10,
		priority: 0,
		flags: {
			protect: 1,
			mirror: 1,
		},
		secondary: {
			chance: 70,
			status: 'par',
		},
		target: "normal",
		type: "Ghost",
	},
	starlight: {
		accuracy: 100,
		category: "Status",
		id: 'starlight',
		name: "Starlight",
		pp: 10,
		priority: 0,
		boosts: {
			def: 1,
			spa: 1,
			spd: 1,
			spe: 1,
		},
		secondary: false,
		target: "self",
		type: "Psychic",
	},
};
