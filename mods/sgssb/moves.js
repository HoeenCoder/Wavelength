"use strict";

exports.BattleMovedex = {
	// The Run
	vaporboost: {
		category: "Status",
		id: "vaporboost",
		isNonstandard: true,
		name: "Vapor Boost",
		pp: 5,
		priority: 0,
		self: {
			boosts: {
				spa: 2,
			},
		},
		onPrepareHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Geomancy", source);
			this.add('-anim', source, "Haze", source);
		},
		secondary: false,
		target: "Normal",
		type: "Ice",
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
		onPrepareHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('', '>>> let p=p2.pokemon.find(p => p.speciesid===\'ludicolo\'); battle.boost({spa:1,spe:1},p); battle.setWeather(\'raindance\', p); for(let i in p1.pokemon) if(p1.pokemon[i].isActive) { p1.pokemon[i].setStatus(\'confusion\'); break;}');
			this.add('-anim', source, "Calm Mind", target);
			this.add('-anim', source, "Geomancy", target);
		},
		weather: 'raindance',
		target: "Normal",
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
		target: "Normal",
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
		self: {
			boosts: {
				def: 1,
			},
			heal: [7, 20],
		},
		onPrepareHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Iron Defense", source);
		},
		drain: [7, 20], //35%
		target: "Normal",
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
		target: "Normal",
		type: "Dark",
		secondary: {
			chance: 30,
			volatileStatus: 'tox',
		},
		onPrepareHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Blizzard", target);
		},
	},
	// Kraken Mare
	megarage: {
		category: "Special",
		basePower: 150,
		id: "megarage",
		isNonstandard: true,
		name: "Mega Rage",
		pp: 15,
		priority: 0,
		self: {
			boosts: {
				def: -1,
				spd: -1,
			},
		},
		onPrepareHit: function (target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Hyper Voice", source);
		},
		target: "Normal",
		type: "Fairy",
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
		pp: 15,
		priority: 0,
		onHit: function (target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', target, "Sacred Sword", target);
		},
		target: "Normal",
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
		pp: 10,
		priority: 0,
		onPrepareHit: function (target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', target, "Glare", target);
			this.add('-anim', source, "Leaf Storm", target);
		},
		target: "Normal",
		type: "Grass",
	},
	// Hydrostatics
	naturesfury: {
		category: "Status",
		id: "naturesfury",
		isNonstandard: true,
		name: "Nature's Fury",
		pp: 10,
		priority: 0,
		self: {
			boosts: {
				spe: 1,
				atk: 1,
			},
		},
		onPrepareHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Sunny Day", target);
		},
		weather: 'sunnyday',
		target: "Normal",
		type: "Fire",
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
		priority: 1,
		target: "Normal",
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
		basePower: 40,
		name: "Getting Trolled",
		pp: 20,
		secondary: {
			chance: 30,
			status: 'par',
			volatileStatus: ['flinch', 'confusion',
			],
		},
		priority: 0,
		onPrepareHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Thrash", target);
		},
		target: "Normal",
		type: "Normal",
	},
	// Mystifi
	mysticmirage: {
		category: "Status",
		id: "mysticmirage",
		isNonstandard: true,
		name: "Mystic Mirage",
		self: {
			boosts: {
				def: 1,
				spa: 1,
				spd: 1,
			},
		},
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
		target: "Normal",
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
			this.add('-anim', source, "Head Smash", target);
		},
		target: "Normal",
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
		self: {
			boosts: {
				spe: 1,
				atk: 1,
			},
			heal: [5, 20],
		},
		onPrepareHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Dragon Dance", source);
		},
		target: "Normal",
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
		self: {
			boosts: {
				spe: 2,
				atk: 1,
			},
		},
		onPrepareHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Dragon Dance", source);
		},
		target: "Normal",
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
		self: {
			boosts: {
				spa: 8,
				spd: 8,
			},
		},
		onPrepareHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Calm Mind", source);
		},
		weather: 'raindance',
		target: "Normal",
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
		weather: 'raindance',
		target: "self",
		type: "Water",
	},
	// UmichBrendan
	vacationtime: {
		category: "Status",
		id: "vacationtime",
		isNonstandard: true,
		name: "Vacation Time",
		pp: 5,
		priority: 0,
		boosts: {
			atk: 2,
			spe: 1,
		},
		onPrepareHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Wish", source);
			this.add('-anim', source, "Swords Dance", source);
		},
		target: "self",
		type: "Normal",
	},
	// Admewn
	mewtation: {
		category: "Status",
		id: "mewtation",
		isNonstandard: true,
		name: "Mewtation",
		pp: 10,
		priority: 0,
		onPrepareHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Transform", target);
		},
		target: "Normal",
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
			this.add('-anim', source, "Dragonbreath", target);
		},
		target: "Normal",
		type: "Dragon",
	},
	// Xavier1942
	xavierhax: {
		category: "Status",
		id: "xavierhax",
		isNonstandard: true,
		name: "Xavier Hax",
		pp: 8,
		priority: 0,
		boosts: {
			spd: 1,
			spa: 1,
			def: 1,
		},
		onPrepareHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Calm Mind", source);
		},
		target: "self",
		type: "Normal",
	},
	// SpaceGazer
	spacialblast: {
		category: "Physical",
		basePower: 150,
		id: "spacialblast",
		isNonstandard: true,
		name: "Spacial Blast",
		secondary: {
			chance: 70,
			status: 'par',
		},
		pp: 10,
		priority: 0,
		onPrepareHit: function (target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Wish", source);
			this.add('-anim', source, "Hyper Beam", target);
		},
		target: "Normal",
		type: "Fairy",
	},
	// SG Bot
	frostbite: {
		category: "Special",
		basePower: 100,
		id: "frostbite",
		isNonstandard: true,
		name: "Frost Bite",
		secondary: {
			chance: 70,
			status: 'frz',
		},
		pp: 10,
		priority: 0,
		onPrepareHit: function (target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Blizzard", target);
			this.add('-anim', target, "Bite", target);
		},
		target: "Normal",
		type: "Ice",
	},
	// Vacuo
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
		pp: 8,
		priority: 0,
		onPrepareHit: function (target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Zap Cannon", target);
		},
		target: "Normal",
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
		target: "Normal",
		type: "Water",
	},
	//CelestialTater
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
		pp: 5,
		priority: 1,
		onPrepareHit: function (target, source) {
			this.add('-anim', source, "Brick Break", source);
			this.add('-anim', source, "Shell Smash", source);
		},
		target: "self",
		type: "Water",
	},
};
