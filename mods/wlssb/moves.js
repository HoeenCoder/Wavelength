"use strict";

exports.BattleMovedex = {
	// The Run
	timespacerush: {
		category: "Special",
		desc: "This move can bypass protect, however using this move will boost Special Attack by 1 and lower Speed by 1.",
		shortDesc: "Boosts SpA and lowers Spe by 1.",
		id: "timespacerush",
		isNonstandard: true,
		name: "Time-Space Rush",
		accuracy: 85,
		basePower: 130,
		pp: 5,
		priority: 0,
		self: {
			boosts: {
				spa: 1,
				spe: -1,
			},
		},
		onPrepareHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Dark Void", source);
			this.add('-anim', source, "Psychic", source);
			this.add('-anim', source, "Extreme Speed", target);
		},
		secondary: false,
		target: "normal",
		type: "Psychic",
	},
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
	// Vulcaron
	troll: {
		category: "Status",
		id: "troll",
		isNonstandard: true,
		name: "Troll",
		pp: 10,
		secondary: {
			chance: 100,
			volatileStatus: 'confusion',
		},
		desc: "Confuses foe, Raises user's Evasion by 1 stage, and heals by 6/20 of maximum health",
		priority: 0,
		self: {
			boosts: {
				evasion: 1,
			},
			heal: [6, 20],
		},
		onHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Taunt", target);
			this.add('-anim', source, "Double Team", source);
		},
		target: "normal",
		type: "Dark",
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
	// Mimiroppu
	charmup: {
		category: "Status",
		id: "charmup",
		isNonstandard: true,
		name: "Charm Up",
		pp: 10,
		secondary: {
			volatileStatus: 'attract',
		},
		desc: "Attempts to attract foe, and boosts user's Attack by one stage",
		priority: 0,
		self: {
			boosts: {
				atk: 1,
			},
		},
		onPrepareHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Charm", source);
		},
		target: "normal",
		type: "Normal",
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
	// Spacial Bot
	ancientritual: {
		category: "Status",
		id: "ancientritual",
		isNonstandard: true,
		name: "Ancient Ritual",
		pp: 10,
		priority: 0,
		boosts: {
			spe: 2,
			atk: 1,
		},
		desc: "Boosts user's Atk by 1 stage, and Spe by 2 stages",
		onPrepareHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Stone Edge", source);
			this.add('-anim', source, "Geomancy", source);
		},
		target: "self",
		type: "Rock",
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
	// Hurricane'd
	rainbustorb: {
		category: "Status",
		id: "rainbustorb",
		isNonstandard: true,
		name: "Rainbust Orb",
		pp: 10,
		priority: 0,
		boosts: {
			spa: 2,
			def: 2,
		},
		onPrepareHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Bulk Up", source);
		},
		desc: "Boosts user's SpA and Def by 2 stages, and then sets Rain Dance",
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
	// Ranfen
	outripper: {
		category: "Physical",
		id: "outripper",
		basePower: 100,
		isNonstandard: true,
		name: "Out Ripper",
		pp: 10,
		critRatio: 2,
		priority: 0,
		onPrepareHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Blue Flare", source);
			this.add('-anim', source, "Recover", source);
			this.add('-anim', source, "Precipice Blades", target);
		},
		desc: "High Crit Ratio",
		target: "normal",
		type: "Dragon",
	},
	// SpaceGazer
	spacialblast: {
		category: "Physical",
		basePower: 150,
		id: "spacialblast",
		isNonstandard: true,
		name: "Spacial Blast",
		secondary: {
			chance: 60,
			status: 'brn',
		},
		desc: "60% chance to burn",
		pp: 10,
		priority: 0,
		onPrepareHit: function (target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Wish", source);
			this.add('-anim', source, "Diamond Storm", target);
		},
		target: "normal",
		type: "Fairy",
	},
	// SG Bot
	frostbite: {
		category: "Special",
		basePower: 100,
		id: "frostbite",
		isNonstandard: true,
		name: "Frostbite",
		secondary: {
			chance: 60,
			status: 'frz',
		},
		desc: "60% chance to freeze, supereffective on Water.",
		pp: 10,
		priority: 0,
		onEffectiveness: function (typeMod, type) {
			if (type === 'Water') return 1;
		},
		onPrepareHit: function (target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Blizzard", target);
			this.add('-anim', target, "Bite", target);
		},
		target: "normal",
		type: "Ice",
	},
	// Clue
	mechanicaldysfunction: {
		category: "Special",
		basePower: 110,
		accuracy: 90,
		id: "mechanicaldysfunction",
		isNonstandard: true,
		name: "Mechanical Dysfunction",
		secondary: {
			chance: 50,
			status: 'par',
		},
		desc: "50% chance to paralyze",
		pp: 5,
		priority: 0,
		onPrepareHit: function (target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Zap Cannon", target);
		},
		target: "normal",
		type: "Electric",
	},
	// Desokoro
	tsunamicrash: {
		category: "Physical",
		basePower: 150,
		id: "tsunamicrash",
		isNonstandard: true,
		name: "Tsunami Crash",
		secondary: {
			chance: 35,
			volatileStatus: 'flinch',
		},
		pp: 5,
		priority: 0,
		onPrepareHit: function (target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Water Pledge", source);
			this.add('-anim', source, "Waterfall", target);
		},
		desc: "35% chance to flinch",
		target: "normal",
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
	altstorm: {
		accuracy: 100,
		basePower: 30,
		category: "Physical",
		onPrepareHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Uproar", target);
		},
		desc: "Hits 3-5 times. Confuses the target after.",
		id: "altstorm",
		isNonStandard: true,
		name: "Alt Storm",
		pp: 10,
		priority: 0,
		flags: {protect: 1, mirror: 1},
		multihit: [3, 5],
		secondary: {
			chance: 100,
			volatileStatus: 'confusion',
		},
		target: "normal",
		type: "Fairy",
		zMovePower: 100,
		contestType: "Cool",
	},
	// Lycanium Z
	wreakhavoc: {
		accuracy: true,
		basePower: 0,
		category: "Status",
		id: "wreakhavoc",
		isNonstandard: true,
		name: "Wreak Havoc",
		shortDesc: "Changes the pokemon's ability to Virus.",
		pp: 1,
		isZ: "notthelycaniumziswear",
		noPPBoosts: true,
		priority: 0,
		flags: {authentic: 1},
		onHit: function (pokemon) {
			let oldAbility = pokemon.setAbility('virus');
			if (oldAbility) {
				this.add('-ability', pokemon, 'Virus', '[from] move: Wreak Havoc');
				return;
			}
			return false;
		},
		secondary: false,
		target: "normal",
		type: "Fairy",
	},
	// Insist
	aquasubscribe: {
		id: "aquasubscribe",
		name: "Aqua Subscribe",
		priority: 1,
		self: {
			boosts: {
				spa: 1,
				spe: 1,
			},
		},
		flags: {
			protect: 1,
			mirror: 1,
		},
		desc: "Boosts user's SpA and Spe by 1 stage",
		secondary: false,
		category: "Special",
		onHit: function (target, source, move) {
			this.add('c|+Insist|Subscribe to http://youtube.com/DeathlyPlays');
		},
		onPrepareHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Hydro Pump", target);
		},
		basePower: 90,
		pp: 15,
		accuracy: 100,
		target: "normal",
		type: "Water",
		zMovePower: 140,
		contestType: "Cool",
	},
	//Insist
	"exiledfromallothers": {
		id: "exiledfromallothers",
		name: "Exiled From All Others",
		basePower: 150,
		accuracy: 100,
		pp: 1,
		noPPBoosts: true,
		secondary: false,
		category: "Special",
		isNonStandard: true,
		isZ: "playniumz",
		priority: 1,
		flags: {
			protect: 1,
		},
		onHit: function (target, source, move) {
			this.add('c|+Insist|Exiled from all others, we shall become greater than ever before.');
		},
		onPrepareHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Hydro Pump", target);
		},
		target: "normal",
		type: "Water",
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
	"ruregi": {
		id: "ruregi",
		name: "R U Regi",
		basePower: 60,
		priority: 2,
		desc: "Drains 1/3 of the damage dealt.",
		category: "Physical",
		drain: [1, 3],
		onPrepareHit: function (target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Quick Attack", target);
		},
		secondary: false,
		pp: 10,
		flags: {protect: 1, contact: 1, mirror: 1},
		target: "normal",
		type: "Fighting",
	},
};
