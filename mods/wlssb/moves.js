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
		accuracy: true,
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
		accuracy: true,
		type: "Fire",
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
	shatterbreak: {
		category: "Physical",
		accuracy: 100,
		basePower: 60,
		basePowerCallback: function (pokemon, target, move) {
			return move.basePower + 10 * pokemon.positiveBoosts();
		},
		id: "shatterbreak",
		desc: "Base Power is calculated like stored power. Raises one stat randomly on ko.",
		isNonstandard: true,
		name: "Shatter Break",
		pp: 12,
		noPPBoosts: true,
		priority: 0,
		flags: {protect: 1, mirror: 1},
		secondary: false,
		onHit: function (target, pokemon) {
			pokemon.addVolatile('shatterbreak');
		},
		effect: {
			duration: 1,
			onAfterMoveSecondarySelf: function (pokemon, target, move) {
				if (!target || target.fainted || target.hp <= 0) {
					let stats = [];
					for (let stat in target.boosts) {
						if (stat !== 'accuracy' && stat !== 'evasion' && target.boosts[stat] < 6) {
							stats.push(stat);
						}
					}
					if (stats.length) {
						let randomStat = stats[this.random(stats.length)];
						let boost = {};
						boost[randomStat] = 1;
						this.boost(boost, pokemon, pokemon, move);
					} else {
						return false;
					}
				}
				pokemon.removeVolatile('shatterbreak');
			},
		},
		onEffectiveness: function (typeMod, type) {
			if (type === 'Steel') return 1;
		},
		onPrepareHit: function (target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Twinkle Tackle", target);
		},
		target: "normal",
		type: "Fairy",
	},
	// Serperiorater
	saberstrike: {
		category: "Special",
		basePower: 120,
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
		flags: {protect: 1, mirror: 1},
		desc: "Boosts user's SpA by 2 stages, and heals health by 1/5 maximum HP",
		pp: 10,
		priority: 0,
		onPrepareHit: function (target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', target, "Glare", target);
			this.add('-anim', source, "Leaf Storm", target);
		},
		target: "normal",
		accuracy: 100,
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
		priority: 0.1,
		target: "normal",
		flags: {protect: 1, mirror: 1},
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
		basePower: 60,
		name: "Getting Trolled",
		pp: 20,
		secondary: {
			chance: 30,
			status: 'par',
			volatileStatus: ['flinch', 'confusion',
			],
		},
		flags: {protect: 1, mirror: 1, contact: 1},
		desc: "30% chance to paralyze, and/or flinch, or confuse foe.",
		priority: 1,
		onPrepareHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Thrash", target);
		},
		target: "normal",
		accuracy: 100,
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
		accuracy: true,
		type: "Fairy",
	},
	// Auction
	magnetflare: {
		category: "Physical",
		basePower: 95,
		id: "magnetflare",
		isNonstandard: true,
		name: "Magnet Flare",
		pp: 15,
		priority: 0,
		onPrepareHit: function (target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Fusion Flare", source);
			this.add('-anim', source, "Head Smash", target);
		},
		flags: {protect: 1, mirror: 1, contact: 1},
		secondary: {
			chance: 30,
			Status: 'brn',
		},
		accuracy: 95,
		desc: "30% chance burn",
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
		accuracy: true,
		type: "Dragon",
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
				spa: 1,
			},
		},
		priority: 0,
		onPrepareHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Agility", source);
			this.add('-anim', source, "Psychic", target);
			this.add('-anim', source, "Night Shade", target);
		},
		flags: {protect: 1, mirror: 1, reflectable: 1, snatch: 1},
		onHit: function (target, source) {
			target.trySetStatus('tox', source);
		},
		desc: "Boosts SpA by 1 and badly poisons target.",
		target: "normal",
		type: "Dark",
	},
	// Desokoro
	tsunamicrash: {
		category: "Physical",
		basePower: 135,
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
		flags: {protect: 1, mirror: 1, contact: 1},
		priority: 0,
		desc: "35% chance flinch",
		onPrepareHit: function (target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Water Pledge", source);
			this.add('-anim', source, "Waterfall", target);
		},
		target: "Normal",
		accuracy: true,
		type: "Water",
	},
	//Tidal Wave Bot
	serverguardian: {
		category: "Status",
		id: "serverguardian",
		isViable: true,
		accuracy: true,
		isNonstandard: true,
		name: "Server Guardian",
		pp: 10,
		priority: 2,
		boosts: {
			def: 2,
			spd: 2,
		},
		onPrepareHit: function (target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Bulk Up", source);
			this.add('-anim', source, "Safeguard", source);
		},
		onHit: function (target) {
			this.add('c|*Tidal Wave Bot|Initiating Sustainability Protocol...standby.');
		},
		heal: [1, 2],
		flags: {},
		target: "self",
		type: "Normal",
	},
	// CelestialTater
	shellbreak: {
		category: "Status",
		id: "shellbreak",
		isNonstandard: true,
		name: "Shell Break",
		flags: {mirror: 1, snatch: 1},
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
			this.attrLastMove('[still]');
			this.add('-anim', source, "Brick Break", source);
			this.add('-anim', source, "Shell Smash", source);
		},
		target: "self",
		accuracy: true,
		type: "Water",
	},
	// SSBN-640
	"alldelete": {
		accuracy: 100,
		basePower: 100,
		category: "Physical",
		desc: "0.5% chance of instant death. 20% chance Encore.",
		id: "alldelete",
		name: "ALL Delete",
		pp: 5,
		priority: 0,
		onPrepareHit: function (target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Judgment", target);
		},
		onHit: function (target) {
			if (this.random(5) === 1) {
				target.addVolatile('Encore');
			}
			if (this.random(200) === 1) {
				target.addVolatile('instantdeath');
			}
		},
		flags: {protect: 1, mirror: 1},
		target: "normal",
		type: "???",
		secondary: false,
		zMovePower: 100,
		contestType: "Cool",
	},
	"goingdown": {
		accuracy: true,
		basePower: 0,
		category: "Status",
		shortDesc: "Target cannot attack for 5 turns. User faints.",
		id: "goingdown",
		name: "Going Down",
		pp: 1,
		isZ: "lycantiumz",
		priority: 999,
		flags: {authentic: 1},
		selfdestruct: "ifHit",
		sideCondition: 'goingdown',
		onPrepareHit: function (target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Taunt", target);
			this.add('-anim', source, "Memento", target);
			this.add('-anim', target, "Explosion", target);
		},
		effect: {
			duration: 4,
			onStart: function (side) {
				this.add('-sidestart', side, 'move: Going Down');
				this.add('-message', side.name + ' cannot attack for 3 turns!');
			},
			onDisableMove: function (pokemon) {
				for (const moveSlot of pokemon.moveSlots) {
					if (this.getMove(moveSlot.id).category !== 'Status' && this.getMove(moveSlot.id).id !== 'struggle') {
						pokemon.disableMove(moveSlot.id);
					}
				}
			},
			onBeforeMovePriority: 5,
			onBeforeMove: function (attacker, defender, move) {
				if (!move.isZ && move.category !== 'Status' && move.id !== 'struggle') {
					this.add('cant', attacker, 'move: Going Down', move);
					return false;
				}
			},
			onResidualOrder: 22,
			onResidualSubOrder: 4,
			onEnd: function (side) {
				this.add('-sideend', side, 'move: Going Down');
				this.add('-message', side.name + ' can attack again!');
			},
		},
		secondary: false,
		target: "normal",
		type: "Dark",
		contestType: "Tough",
	},
	"memes": {
		accuracy: true,
		basePower: 0,
		category: "Status",
		shortDesc: "Unconcentrates the Opponent.",
		id: "memes",
		name: "Memes",
		pp: 20,
		priority: 0,
		flags: {reflectable: 1},
		sideCondition: 'memes',
		onPrepareHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Nasty Plot", source);
		},
		effect: {
			// this is a side condition
			onStart: function (side) {
				this.add('-sidestart', side, 'move: Memes');
			},
			onSwitchIn: function (pokemon) {
				pokemon.addVolatile('any', '[Silent]');
			},
		},
		secondary: false,
		target: "foeSide",
		type: "Rock",
		zMoveBoost: {def: 1},
		contestType: "Cool",
	},
	//Stabby the Krabby
	"stabstab": {
		category: "Physical",
		basePower: 60,
		accuracy: 100,
		desc: 'Hits twice, 20% chance to flinch.',
		id: "stabstab",
		isViable: true,
		flags: {protect: 1, contact: 1, mirror: 1},
		isNonstandard: true,
		name: "Stab Stab",
		secondary: {
			chance: 20,
			volatileStatus: 'flinch',
		},
		onHit: function (target) {
			this.add('c|*Stabby the Krabby|Stabby Stabby!');
		},
		pp: 5,
		priority: 0.1,
		multihit: [2, 2],
		onPrepareHit: function (target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Swords Dance", source);
			this.add('-anim', source, "Sacred Sword", target);
		},
		target: "normal",
		type: "Steel",
	},
	// Volco
	"invisiblepunch": {
		id: "invisiblepunch",
		name: "Invisible Punch",
		desc: "Heals 1/4 of the damage dealt.",
		basePower: 100,
		accuracy: 100,
		drain: [1, 4],
		pp: 10,
		category: "Physical",
		onPrepareHit: function (target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Shadow punch", target);
		},
		onHit: function (target, source, move) {
			this.add('c|&Volco|You cant see this punch. It\'s very spooky!');
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
		basePower: 80,
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
	// MechSteelix
	deepsleep: {
		accuracy: true,
		category: "Status",
		id: "deepsleep",
		isNonstandard: true,
		name: "Deep Sleep",
		pp: 10,
		desc: "Rest + raises spd 2 stages. Asleep for 3 turns",
		priority: 0,
		flags: {mirror: 1, snatch: 1},
		onHit: function (target) {
			if (target.hp >= target.maxhp) return false;
			if (!target.setStatus('slp')) return false;
			target.statusData.time = 3;
			target.statusData.startTime = 3;
			this.heal(target.maxhp); //Aeshetic only as the healing happens after you fall asleep in-game
			this.add('-status', target, 'slp', '[from] move: Deep Sleep');
			this.add('c|&MechSteelix|Witness my true power!');
			this.add('-anim', target, "Protect", target);
		},
		secondary: {
			chance: 100,
			self: {
				boosts: {
					spd: 2,
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
		accuracy: 100,
		isNonstandard: true,
		name: "Everlasting Annoyingness",
		pp: 5,
		noPPBoosts: true,
		priority: 0,
		desc: "Hits 2-5 times. heals damage dealt. user gains aqua ring.",
		flags: {protect: 1, mirror: 1},
		secondary: {
			chance: 100,
			self: {
				volatileStatus: 'aquaring',
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
	//Perison
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
			chance: 50,
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
			this.add('c|~Wavelength Prince|Witness my true power, my true strength, the feeling of fear, and your team\'s demise.');
		},
		onPrepareHit: function (target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Dark Void", target);
			this.add('-anim', source, "Future Sight", target);
			this.add('-anim', source, "Psycho Boost", source);
		},
		desc: "50% chance to raise all stats by 1 and opponent falls asleep.",
		target: "normal",
		type: "Dark",
		zMoveEffect: "heal",
	},
	//xcmr
	kittycrush: {
		category: "Physical",
		accuracy: 95,
		basePower: 70,
		id: "kittycrush",
		isViable: true,
		isNonstandard: true,
		name: "Kitty Crush",
		pp: 5,
		noPPBoosts: true,
		priority: 1,
		flags: {protect: 1, mirror: 1, contact: 1},
		secondary: {
			chance: 60,
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
		desc: "Rock, steel and ghost types take normal damage. 60% chance to Boost def and spd by 1.",
		target: "normal",
		type: "Normal",
	},
	//bunnery5
	bunneryhatesyouseed: {
		category: "Status",
		id: "bunneryhatesyouseed",
		name: "Bunnery Hates You Seed",
		accuracy: 100,
		basePower: 0,
		isViable: true,
		desc: "Leech seed and gains priority boost for 7 turns.",
		isNonstandard: true,
		pp: 6,
		noPPBoosts: true,
		priority: 1,
		flags: {mirror: 1, protect: 1},
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
		onPrepareHit: function (target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Leech Seed", target);
		},
		onTryHit: function (target) {
			if (target.hasType('Grass')) {
				this.add('-immune', target, '[msg]');
				return null;
			}
		},
		onHit: function (target) {
			this.add('c|+bunnery5|People think they are good lol.');
		},
		self: {
			volatileStatus: 'priorityboost',
		},
		target: "normal",
		type: "Grass",
	},
	// Alfastorm
	"darkspiral": {
		accuracy: true,
		basePower: 0,
		category: "Status",
		shortDesc: "The target cannot switch out and cursed.",
		id: "darkspiral",
		name: "Dark Spiral",
		pp: 5,
		priority: 0,
		flags: {reflectable: 1, mirror: 1, authentic: 1},
		onPrepareHit: function (target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Night Shade", target);
		},
		onHit: function (target, source, move) {
			target.addVolatile('Curse', source);
			target.addVolatile('trapped', source, move, 'trapper');
		},
		secondary: false,
		target: "normal",
		type: "Normal",
		zMoveBoost: {spd: 1},
		contestType: "Beautiful",
	},
	//SnorlaxTheRain
	"snorlaxslam": {
		accuracy: 95,
		basePower: 120,
		category: "Physical",
		desc: "120BP, 95% Accuracy, and can be used while sleeping.",
		id: "snorlaxslam",
		name: "Snorlax Slam",
		pp: 5,
		priority: 0,
		//Stolen from Sleep Talk
		flags: {protect: 1, mirror: 1},
		sleepUsable: true,
		onPrepareHit: function (target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Body Slam", target);
		},
		onHit: function (target) {
			this.add('c|+SnorlaxTheRain|Beware of the biggest body slam u will ever seen!');
		},
		target: "normal",
		type: "Normal",
	},
	//The Dazzler Joe
	"kingscurse": {
		accuracy: 100,
		basePower: 100,
		category: "Physical",
		desc: "Traps Opponent for 4-5 turns.",
		id: "kingscurse",
		isViable: true,
		name: "King's Curse",
		pp: 5,
		priority: 0,
		flags: {protect: 1, mirror: 1},
		onPrepareHit: function (target, source, move) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Sand Tomb", target);
			this.add('-anim', source, "Stone Edge", target);
		},
		volatileStatus: 'partiallytrapped',
		target: "normal",
		type: "Rock",
		zMovePower: 185,
		contestType: "Tough",
	},
};
