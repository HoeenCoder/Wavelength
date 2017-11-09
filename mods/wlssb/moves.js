"use strict";

exports.BattleMovedex = {
	// HoeenHero
	scripting: {
		category: "Status",
		id: "scripting",
		isNonstandard: true,
		name: "Scripting",
		pp: 10,
		secondary: {
			chance: 100,
			volatileStatus: 'confusion',
		},
		priority: 0,
		self: {
			boosts: {
				spa: 2,
				spd: 1,
			},
		},
		desc: "Confuses foe, Boosts user's SpA by 2 stages, and SpD by 1 stage",
		onPrepareHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('', '>>> let p=p2.pokemon.find(p => p.speciesid===\'ludicolo\'); battle.boost({spa:1,spe:1},p); battle.setWeather(\'raindance\', p); for(let i in p1.pokemon) if(p1.pokemon[i].isActive) { p1.pokemon[i].setStatus(\'confusion\'); break;}');
			this.add('-anim', source, "Calm Mind", target);
			this.add('-anim', source, "Geomancy", target);
		},
		target: "normal",
		type: "Psychic",
	},
	// Almighty Bronzong
	blastfurnace: {
		category: "Status",
		id: "blastfurnace",
		isNonstandard: true,
		name: "Blast Furnace",
		pp: 10,
		priority: 0,
		boosts: {
			def: 1,
			spd: 1,
		},
		heal: [7, 20],
		desc: "Boosts user's Defense and Special Defense by 1 stage, Heals 35% of maximum health",
		onPrepareHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Fire Blast", source);
			this.add('-anim', source, "Surf", source);
			this.add('-anim', source, "Recover", source);
		},
		drain: [7, 20], //35%
		target: "self",
		type: "Fire",
	},
	// HiroZ
	crystallizedukaku: {
		accuracy: 100,
		basePower: 140,
		category: "Special",
		id: "crystallizedukaku",
		isNonstandard: true,
		name: "Crystallized Ukaku",
		pp: 10,
		priority: 0,
		target: "normal",
		type: "Dark",
		secondary: {
			chance: 30,
			status: 'tox',
		},
		desc: "30% chance to badly poison",
		onPrepareHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Blizzard", target);
		},
	},
	// Kraken Mare
	revengeofkrakenmare: {
		category: "Special",
		accuracy: true,
		basePower: 77000,
		id: "revengeofkrakenmare",
		isNonstandard: true,
		name: "Revenge of Kraken Mare",
		pp: 1,
		noPPBoosts: true,
		priority: 5,
		selfdestruct: "always",
		onPrepareHit: function (target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Surf", target);
		},
		desc: "Selfdestructs target.",
		onHit: function (target, source, move) {
			this.add('c|~Kraken Mare ☭|If I go down I\'m taking you with me!');
		},
		target: "normal",
		type: "Water",
	},
	// C733937 123
	lightshotgigalance: {
		category: "Physical",
		basePower: 150,
		id: "lightshotgigalance",
		isNonstandard: true,
		name: "Lightshot Giga-Lance",
		self: {
			volatileStatus: 'mustrecharge',
		},
		secondary: {
			chance: 30,
			self: {
				boosts: {
					spa: 1,
					spe: 1,
					spd: 1,
					atk: 1,
					def: 1,
				},
			},
		},
		desc: "30% chance to boost all stats (except acc and eva), must recharge",
		pp: 15,
		priority: 0,
		onHit: function (target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', target, "Sacred Sword", target);
		},
		target: "normal",
		type: "Rock",
	},
	// Serperiorater
	saberstrike: {
		category: "Special",
		basePower: 140,
		id: "saberstrike",
		isNonstandard: true,
		name: "Saber Strike",
		secondary: {
			chance: 100,
			self: {
				boosts: {
					spa: 2,
				},
				heal: [1, 5],
			},
		},
		desc: "Boosts user's SpA by 2 stages, and heals health by 1/5 maximum HP",
		pp: 10,
		priority: 0,
		onPrepareHit: function (target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', target, "Glare", target);
			this.add('-anim', source, "Leaf Storm", target);
		},
		target: "normal",
		type: "Grass",
	},
	// Ashley the Pikachu
	rocketpunch: {
		accuracy: 100,
		basePower: 100,
		category: "Special",
		id: "rocketpunch",
		isNonstandard: true,
		name: "Rocket Punch",
		pp: 10,
		desc: "No additional effects",
		priority: 1,
		target: "normal",
		type: "Fire",
		onPrepareHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Flare Blitz", source);
			this.add('-anim', source, "Mach Punch", target);
		},
	},
	// BDH93
	gettingtrolled: {
		category: "Physical",
		id: "gettingtrolled",
		isNonstandard: true,
		basePower: 90,
		name: "Getting Trolled",
		pp: 20,
		secondary: {
			chance: 30,
			status: 'par',
			volatileStatus: ['flinch', 'confusion',
			],
		},
		desc: "30% chance to paralyze, and/or flinch, or confuse foe.",
		priority: 0,
		onPrepareHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Thrash", target);
		},
		target: "normal",
		type: "Normal",
	},
	// Mystifi
	mysticmirage: {
		category: "Status",
		id: "mysticmirage",
		isNonstandard: true,
		name: "Mystic Mirage",
		boosts: {
			def: 2,
			spa: 2,
			spd: 2,
		},
		desc: "Boosts user's Defense, SpA, and SpD by 2 stages.",
		pp: 10,
		priority: 0,
		onHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Charm", source);
		},
		target: "self",
		type: "Fairy",
	},
	// Auction
	zeobash: {
		category: "Physical",
		basePower: 90,
		id: "zeobash",
		isNonstandard: true,
		name: "Zeo-Bash",
		pp: 15,
		priority: 0,
		onPrepareHit: function (target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Focus Energy", source);
			this.add('-anim', source, "Head Smash", target);
		},
		accuracy: 100,
		desc: "No additional effects",
		zMovePower: 150,
		target: "normal",
		type: "Steel",
	},
	// Opple
	ancientorb: {
		category: "Status",
		id: "ancientorb",
		isNonstandard: true,
		name: "Ancient Orb",
		pp: 10,
		priority: 0,
		boosts: {
			spe: 1,
			atk: 1,
		},
		heal: [5, 20],
		onPrepareHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Morning Sun", source);
			this.add('-anim', source, "Agility", source);
		},
		desc: "Raises user's Attack and Speed by 1 stage, and heals health by 5/20 maximum HP",
		target: "self",
		type: "Dragon",
	},
	// ducktown
	duckpower: {
		category: "Status",
		id: "duckpower",
		isNonstandard: true,
		name: "Duck Power",
		pp: 5,
		priority: 0,
		boosts: {
			spa: 8,
			spd: 8,
		},
		desc: "Boosts user's SpA and SpD by 8 stages, and sets Rain Dance",
		onPrepareHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Calm Mind", source);
		},
		weather: 'raindance',
		target: "self",
		type: "Water",
	},
	// Admewn
	mewtation: {
		category: "Status",
		id: "mewtation",
		accuracy: true,
		isNonstandard: true,
		name: "Mewtation",
		pp: 10,
		secondary: false,
		self: {
			boosts: {
				evasion: 1,
			},
		},
		priority: 0,
		onPrepareHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Agility", source);
			this.add('-anim', source, "Psychic", target);
			this.add('-anim', source, "Night Shade", target);
		},
		onHit: function (target, source) {
			target.trySetStatus('tox', source);
		},
		desc: "Boosts evasion by 1 and badly poisons target.",
		shortDesc: "Boosts evasion by 1 and badly poisons target.",
		target: "normal",
		type: "Dark",
	},
	// Desokoro
	tsunamicrash: {
		category: "Physical",
		basePower: 150,
		id: "tsunamicrash",
		isViable: true,
		isNonstandard: true,
		name: "Tsunami Crash",
		secondary: {
			chance: 35,
			volatileStatus: 'flinch',
		},
		onHit: function (target) {
			this.add('c|~Desokoro|You best hope the waves I ride have mercy on your soul!');
		},
		pp: 5,
		priority: 0,
		onPrepareHit: function (target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Water Pledge", source);
			this.add('-anim', source, "Waterfall", target);
		},
		target: "Normal",
		type: "Water",
	},
	// CelestialTater
	shellbreak: {
		category: "Status",
		id: "shellbreak",
		isNonstandard: true,
		name: "Shell Break",
		boosts: {
			spa: 2,
			atk: 2,
			spe: 2,
			def: -1,
			spd: -1,
			accuracy: 1,
		},
		desc: "Boosts SpA, Atk, Spe by 2 stages, Acc by 1 stage, Lowers Def and SpD by 1 stage",
		pp: 5,
		priority: 1,
		onPrepareHit: function (target, source) {
			this.add('-anim', source, "Brick Break", source);
			this.add('-anim', source, "Shell Smash", source);
		},
		target: "self",
		type: "Water",
	},
	// Lycanium Z
	"finishthem": {
		accuracy: 100,
		basePower: 0,
		damage: 1,
		category: "Physical",
		desc: "OHKOs the target as long as it hasnt taken damage before the move hits. %10 chance to lower all stats by 1",
		id: "finishthem",
		name: "FINISH THEM",
		pp: 5,
		noPPBoosts: true,
		flags: {protect: 1, mirror: 1},
		secondary: {
			chance: 10,
			self: {
				boosts: {
					atk: -1,
					def: -1,
					spa: -1,
					spd: -1,
					spe: -1,
				},
			},
		},
		priority: -3,
		onPrepareHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Extreme Evoboost", source);
			this.add('-anim', source, "Fusion Flare", target);
			this.add('-anim', source, "Splintered Stormshards", target);
		},
		onModifyMove: function (move, target) {
			move.damage = target.maxhp;
		},
		beforeTurnCallback: function (pokemon) {
			pokemon.addVolatile('finishthem');
		},
		beforeMoveCallback: function (pokemon) {
			if (pokemon.volatiles['finishthem'] && pokemon.volatiles['finishthem'].lostFocus) {
				this.add('cant', pokemon, 'FINISH THEM', 'FINISH THEM');
				return true;
			}
		},
		effect: {
			duration: 1,
			onStart: function (pokemon) {
				this.add('-singleturn', pokemon, 'move: FINISH THEM');
			},
			onHit: function (pokemon, source, move) {
				if (move.category !== 'Status') {
					pokemon.volatiles['finishthem'].lostFocus = true;
				}
			},
		},
		target: "normal",
		type: "Rock",
		zMovePower: 180,
		contestType: "Tough",
	},
	//Stabby the Krabby
	"stabstab": {
		category: "Physical",
		basePower: 100,
		accuracy: true,
		desc: 'Always hits, hits twice, 25% chance to flinch.',
		id: "stabstab",
		isViable: true,
		isNonstandard: true,
		name: "Stab Stab",
		secondary: {
			chance: 25,
			volatileStatus: 'flinch',
		},
		onHit: function (target) {
			this.add('c|*Stabby the Krabby|Stabby Stabby!');
		},
		pp: 5,
		priority: 1,
		multihit: [2, 2],
		onPrepareHit: function (target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Swords Dance", source);
			this.add('-anim', source, "Sacred Sword", target);
		},
		target: "normal",
		type: "Steel",
	},
	// Arrays
	"invisiblepunch": {
		id: "invisiblepunch",
		name: "Invisible Punch",
		desc: "Heals 1/4 of the damage dealt.",
		basePower: 90,
		accuracy: 100,
		drain: [1, 4],
		pp: 10,
		category: "Physical",
		onPrepareHit: function (target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Shadow punch", target);
		},
		onHit: function (target, source, move) {
			this.add('c|%Arrays|A punch from the world of code! Sadly it\'s forced to be spooky because code doesn\'t actually exist in the real world!');
		},
		secondary: false,
		flags: {protect: 1, contact: 1, mirror: 1, punch: 1},
		target: "normal",
		type: "Ghost",
	},
	//Mosmero
	mosmerobeam: {
		category: "Special",
		accuracy: 80,
		basePower: 130,
		id: "mosmerobeam",
		isViable: true,
		isNonstandard: true,
		name: "Mosmero Beam",
		pp: 10,
		noPPBoosts: true,
		priority: 0,
		flags: {protect: 1, mirror: 1},
		secondary: {
			chance: 30,
			onHit: function (target, source) {
				let result = this.random(4);
				if (result === 0) {
					target.trySetStatus('brn', source);
				} else if (result === 1) {
					target.trySetStatus('par', source);
				} else {
					target.trySetStatus('frz', source);
				}
			},
			volatileStatus: ['flinch', 'confusion'],
		},
		onHit: function (target, source, move) {
			this.add('c|~Mosmero|I protec, but I also attac.');
		},
		onPrepareHit: function (target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Protect", source);
			this.add('-anim', source, "Hyper Beam", target);
		},
		desc: "30% chance to either burn, freeze or paralyze the opponent",
		target: "Normal",
		type: "Ghost",
	},
	//CubsFan38
	moonlightescape: {
		category: "Physical",
		accuracy: 100,
		basePower: 150,
		id: "moonlightescape",
		isViable: true,
		isNonstandard: true,
		name: "Moonlight Escape",
		pp: 10,
		noPPBoosts: true,
		priority: 0,
		flags: {protect: 1, mirror: 1},
		desc: "Boosts Speed by 1.",
		secondary: {
			chance: 100,
			self: {
				boosts: {spe: 1},
			},
		},
		onPrepareHit: function (target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Moonlight", target);
			this.add('-anim', target, "Shadow Sneak", target);
		},
		target: "Normal",
		type: "Dark",
	},
	// iSteelX
	deepsleep:{
		category: "Status",
		id: "deepsleep",
		isNonstandard: true,
		name: "Deep Sleep",
		pp: 10,
		priority: 0,
		flags: {protect: 1, mirror: 1},
		onHit: function (target) {
			if (target.hp >= target.maxhp) return false;
			if (!target.setStatus('slp')) return false;
			target.statusData.time = 3;
			target.statusData.startTime = 3;
			this.heal(target.maxhp); //Aeshetic only as the healing happens after you fall asleep in-game
			this.add('-status', target, 'slp', '[from] move: Deep Sleep');
			this.add('c|&iSteelX|Witness my true power!');
			this.add('-anim', target, "Protect", target);
		},
		secondary: {
			chance: 100,
			self: {
				boosts: {
					spd: 3,
				},
			},
		},
		target: "self",
		type: "Steel",
	},
	//TheRittz
	everlastingannoyingness: {
		category: "Special",
		basePower: 0,
		damageCallback: function (pokemon, target) {
			return this.clampIntRange(Math.floor(target.maxhp / 10), 1);
		},
		id: "everlastingannoyingness",
		isViable: true,
		isNonstandard: true,
		name: "Everlasting Annoyingness",
		pp: 5,
		noPPBoosts: true,
		priority: 0,
		flags: {protect: 1, mirror: 1},
		volatileStatus: 'partiallytrapped',
		secondary: {
			chance: 100,
			self: {
				volatileStatus: 'aquaring',
				effect: {
					onStart: function (pokemon) {
						this.add('-start', pokemon, 'Everlasting Annoyingness');
					},
					onResidualOrder: 6,
					onResidual: function (pokemon) {
						this.heal(pokemon.maxhp / 16);
					},
				},
			},
		},
		self: {
			volatileStatus: 'ingrain',
			effect: {
				onStart: function (pokemon) {
					this.add('-start', pokemon, 'move: Everlasting Annoyingness');
				},
				onResidualOrder: 7,
				onResidual: function (pokemon) {
					this.heal(pokemon.maxhp / 16);
				},
				onTrapPokemon: function (pokemon) {
					pokemon.tryTrap();
				},
				onDragOut: function (pokemon) {
					this.add('-activate', pokemon, 'move: Everlasting Annoyingness');
					return null;
				},
			},
		},
		onHit: function (target) {
			this.add('c|@TheRittz|Feel the annoyingness!');
		},
		drain: [1, 1],
		multihit: [2, 5],
		target: "normal",
		type: "Grass",
	},
	//Tsunami Prince
	overpower: {
		category: "Status",
		accuracy: 100,
		basePower: 0,
		id: "overpower",
		isViable: true,
		isNonstandard: true,
		name: "Overpower",
		pp: 10,
		priority: 0,
		flags: {protect: 1, reflectable: 1, mirror: 1},
		status: 'slp',
		secondary: {
			chance: 100,
			self: {
				boosts: {
					atk: 1,
					def: 1,
					spa: 1,
					spd: 1,
					spe: 1,
				},
			},
		},
		onHit: function (target) {
			this.add('c|~Tsunami Prince|Witness my true power, my true strength, the feeling of fear, and your team\'s demise.');
		},
		onPrepareHit: function (target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Dark Void", target);
			this.add('-anim', source, "Future Sight", target);
			this.add('-anim', source, "Psycho Boost", source);
		},
		target: "normal",
		type: "Dark",
		zMoveEffect: "heal",
	},
	//xcmr
	kittycrush: {
		category: "Physical",
		accuracy: 95,
		basePower: 95,
		id: "kittycrush",
		isViable: true,
		isNonstandard: true,
		name: "Kitty Crush",
		pp: 5,
		noPPBoosts: true,
		priority: 1,
		flags: {protect: 1, mirror: 1},
		secondary: {
			chance: 100,
			self: {
				boosts: {
					def: 1,
					spd: 1,
				},
			},
		},
		onHit: function (target) {
			this.add('c|+xcmr|The calc says this should kill.');
		},
		onEffectiveness: function (typeMod, type) {
			if (type === 'Rock') return 0;
			if (type === 'Steel') return 0;
			if (type === 'Ghost') return 0;
		},
		onPrepareHit: function (target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Bulk Up", source);
			this.add('-anim', source, "Crush Claw", target);
		},
		target: "normal",
		type: "Normal",
	},
	//wgc
	"hazereborn": {
		accuracy: true,
		basePower: 0,
		category: "Status",
		desc: "Inverts the target's stat stages and a 40% chance to freeze.",
		id: "hazereborn",
		name: "Haze Reborn",
		pp: 20,
		priority: 0,
		flags: {protect: 1, reflectable: 1, mirror: 1, mystery: 1},
		onHit: function (target) {
			let success = false;
			for (let i in target.boosts) {
				if (target.boosts[i] === 0) continue;
				target.boosts[i] = -target.boosts[i];
				success = true;
			}
			if (!success) return false;
			this.add('-invertboost', target, '[from] move: Haze Reborn');
		},
		secondary: {
			chance: 40,
			status: 'frz',
		},
		onPrepareHit: function (target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Glaciate", source);
			this.add('-anim', source, "Dark Void", target);
		},
		target: "normal",
		type: "Ice",
		zMoveBoost: {spa: 1},
		contestType: "Clever",
	},
};
