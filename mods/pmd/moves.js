"use strict";

exports.BattleMovedex = {
	//Oran Berry
	oranberry: {
		accuracy: true,
		category: "Status",
		id: "oranberry",
		isNonstandard: true,
		name: "Oran Berry",
		pp: 1,
		noPPBoosts: true,
		desc: "Restores 1/4 max HP.",
		priority: 0,
		flags: {
			heal: 1,
			snatch: 1,
		},
		secondary: false,
		heal: [1, 4],
		target: "self",
		type: "Normal",
		onPrepareHit: function (target, source) {
			this.attrLastMove('[still]');
		},
	},
	//Apple
	apple: {
		accuracy: true,
		category: "Status",
		id: "apple",
		isNonstandard: true,
		name: "Apple",
		pp: 1,
		noPPBoosts: true,
		priority: 0,
		flags: {
			snatch: 1,
		},
		boosts: {
			spe: 2,
		},
		secondary: false,
		heal: [1, 10],
		target: "self",
		type: "Normal",
		onPrepareHit: function (target, source) {
			this.attrLastMove('[still]');
		},
		desc: "Restores 1/10 max HP, raises Speed by two stages.",
	},
	//Blast Seed
	blastseed: {
		accuracy: 100,
		basePower: 250,
		category: "Special",
		id: "blastseed",
		isNonstandard: true,
		name: "Blast Seed",
		pp: 1,
		noPPBoosts: true,
		priority: 0,
		flags: {
			protect: 1,
			bullet: 1,
		},
		secondary: false,
		onPrepareHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Bullet Seed", target);
		},
		target: "normal",
		type: "Normal",
		desc: "No additional effects.",
	},
	//Gravelrock
	gravelrock: {
		accuracy: 100,
		category: "Special",
		basePower: 20,
		id: "gravelrock",
		isNonstandard: true,
		name: "Gravelrock",
		pp: 1,
		noPPBoosts: true,
		priority: 0,
		flags: {
			protect: 1,
			distance: 1,
			gravity: 1,
		},
		multihit: [4, 7],
		onPrepareHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Rock Blast", target);
		},
		desc: "Hits 4-7 times.",
		secondary: false,
		target: "normal",
		type: "Rock",
	},
	//Heal Seed
	healseed: {
		accuracy: true,
		category: "Status",
		id: "healseed",
		isNonstandard: true,
		name: "Heal Seed",
		pp: 1,
		noPPBoosts: true,
		priority: 0,
		flags: {
			snatch: 1,
		},
		onPrepareHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Refresh", target);
		},
		onHit: function (pokemon) {
			pokemon.cureStatus();
		},
		desc: "Cures user of any status effects.",
		secondary: false,
		target: "self",
		type: "Normal",
	},
	//Trap Orb
	traporb: {
		accuracy: true,
		//basePower: 0,
		category: "Status",
		id: "traporb",
		isNonstandard: true,
		name: "Trap Orb",
		pp: 1,
		noPPBoosts: true,
		priority: 0,
		flags: {
			reflectable: 1,
			nonsky: 1,
		},
		sideCondition: 'stealthrock',
		onPrepareHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Stealth Rock", target);
		},
		desc: "Places Stealth Rocks on foe's field.",
		secondary: false,
		target: "foeSide",
		type: "Ground",
	},
	//TrapBust Orb
	trapbustorb: {
		accuracy: true,
		//basePower: 0,
		category: "Status",
		id: "trapbustorb",
		isNonstandard: true,
		name: "TrapBust Orb",
		pp: 1,
		noPPBoosts: true,
		priority: 0,
		onPrepareHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Defog", target);
		},
		onHit: function (target, source) {
			let removeAll = {
				spikes: 1,
				toxicspikes: 1,
				stealthrock: 1,
				stickyweb: 1,
			};
			for (let sideCondition in removeAll) {
				if (source.side.removeSideCondition(sideCondition)) {
					this.add('-sideend', source.side, this.getEffect(sideCondition).name, '[from] move: TrapBust Orb', '[of] ' + source);
				}
			}
		},
		desc: "Removes some types of hazards.",
		secondary: false,
		target: "normal",
		type: "Normal",
	},
	//Stun Seed
	stunseed: {
		accuracy: true,
		category: "Status",
		id: "stunseed",
		isNonstandard: true,
		name: "Stun Seed",
		pp: 1,
		noPPBoosts: true,
		priority: 0,
		flags: {
			authentic: 1,
			bullet: 1,
			snatch: 1,
		},
		onPrepareHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Bullet Seed", target);
		},
		desc: "Ignores Immunities, paralyzes target.",
		status: 'par',
		ignoreImmunity: true,
		target: "normal",
		type: "Normal",
	},
	//Totter Seed
	totterseed: {
		accuracy: true,
		category: "Status",
		id: "totterseed",
		isNonstandard: true,
		name: "Totter Seed",
		pp: 1,
		noPPBoosts: true,
		priority: 0,
		flags: {
			authentic: 1,
			bullet: 1,
			snatch: 1,
		},
		onPrepareHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Bullet Seed", target);
		},
		volatileStatus: 'confusion',
		desc: "Confuses target.",
		secondary: false,
		target: "normal",
		type: "Normal",
	},
	//Vile Seed
	vileseed: {
		accuracy: true,
		category: "Status",
		id: "vileseed",
		isNonstandard: true,
		name: "Vile Seed",
		pp: 1,
		noPPBoosts: true,
		priority: 0,
		flags: {
			authentic: 1,
			bullet: 1,
			snatch: 1,
		},
		onPrepareHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Bullet Seed", target);
		},
		boosts: {
			def: -1,
			spd: -1,
		},
		desc: "Lowers target's Defense and Special Defense by one stage.",
		target: "normal",
		type: "Normal",
	},
	//Violent Seed
	violentseed: {
		accuracy: true,
		category: "Status",
		id: "violentseed",
		isNonstandard: true,
		name: "Violent Seed",
		pp: 1,
		noPPBoosts: true,
		priority: 0,
		flags: {
			authentic: 1,
			bullet: 1,
			snatch: 1,
		},
		onPrepareHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Bullet Seed", target);
		},
		boosts: {
			atk: 1,
			spa: 1,
		},
		desc: "Raises user's Attack and Special Attack by one stage.",
		target: "self",
		type: "Normal",
	},
	//Rainy Orb
	rainyorb: {
		accuracy: true,
		category: "Status",
		id: "rainyorb",
		isNonstandard: true,
		name: "Rainy Orb",
		pp: 1,
		noPPBoosts: true,
		priority: 0,
		onPrepareHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Rain Dance", target);
		},
		weather: 'Rain Dance',
		desc: "Sets the weather to Rain Dance.",
		secondary: false,
		target: "all",
		type: "Water",
	},
	//Sunny Orb
	sunnyorb: {
		accuracy: true,
		category: "Status",
		id: "sunnyorb",
		isNonstandard: true,
		name: "Sunny Orb",
		pp: 1,
		noPPBoosts: true,
		priority: 0,
		onPrepareHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Sunny Day", target);
		},
		desc: "Sets weather to Sunny Day.",
		weather: 'Sunny Day',
		secondary: false,
		target: "all",
		type: "Fire",
	},
	//Sandy Orb
	sandyorb: {
		accuracy: true,
		category: "Status",
		id: "sandyorb",
		isNonstandard: true,
		name: "Sandy Orb",
		pp: 1,
		noPPBoosts: true,
		priority: 0,
		onPrepareHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Sandstorm", target);
		},
		desc: "Sets weather to Sandstorm.",
		weather: 'Sandstorm',
		secondary: false,
		target: "all",
		type: "Ground",
	},
	//Hail Orb
	hailorb: {
		accuracy: true,
		category: "Status",
		id: "hailorb",
		isNonstandard: true,
		name: "Hail Orb",
		pp: 1,
		noPPBoosts: true,
		priority: 0,
		onPrepareHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Hail", target);
		},
		desc: "Sets weather to Hail.",
		weather: 'Hail',
		secondary: false,
		target: "all",
		type: "Ice",
	},
	//One Shot Orb
	oneshotorb: {
		accuracy: 30,
		category: "Physical",
		basePower: 10000,
		id: "oneshotorb",
		isNonstandard: true,
		name: "One Shot Orb",
		pp: 1,
		noPPBoosts: true,
		priority: 0,
		flags: {
			protect: 1,
		},
		onPrepareHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Water Spout", target);
		},
		desc: "Ignores Immunities.",
		ignoreImmunity: true,
		secondary: false,
		target: "normal",
		type: "Normal",
	},
	//Warp Orb
	warporb: {
		accuracy: true,
		category: "Status",
		id: "warporb",
		isNonstandard: true,
		name: "Warp Orb",
		pp: 1,
		noPPBoosts: true,
		priority: -6,
		onPrepareHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Defog", target);
		},
		desc: "Ignores immunities, forces foe to switch.",
		forceSwitch: true,
		ignoreImmunity: true,
		secondary: false,
		target: "normal",
		type: "Psychic",
	},
	//Escape Orb
	escapeorb: {
		accuracy: true,
		category: "Status",
		id: "escapeorb",
		isNonstandard: true,
		name: "Escape Orb",
		pp: 1,
		noPPBoosts: true,
		priority: 1,
		onPrepareHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Teleport", target);
		},
		desc: "Ignores Immunities, Copies stats and gives them to whatever the user swaps in.",
		selfSwitch: 'copyvolatile',
		ignoreImmunity: true,
		secondary: false,
		target: "self",
		type: "Psychic",
	},
	//Stick
	stick: {
		accuracy: 100,
		category: "Special",
		basePower: 15,
		id: "stick",
		isNonstandard: true,
		name: "Stick",
		pp: 1,
		noPPBoosts: true,
		priority: 0,
		flags: {
			protect: 1,
			gravity: 1,
		},
		multihit: [5, 10],
		onPrepareHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Pin Missle", target);
		},
		desc: "Hits 5-10 times.",
		secondary: false,
		target: "normal",
		type: "Normal",
	},
	//Iron Thorn
	ironthorn: {
		accuracy: 100,
		category: "Special",
		basePower: 25,
		id: "ironthorn",
		isNonstandard: true,
		name: "Iron Thorn",
		pp: 1,
		noPPBoosts: true,
		priority: 0,
		flags: {
			protect: 1,
			gravity: 1,
		},
		multihit: [4, 7],
		onPrepareHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Flash Cannon", target);
		},
		desc: "Hits 4-7 times.",
		secondary: false,
		target: "normal",
		type: "Steel",
	},
	//Evasion Orb
	evasionorb: {
		accuracy: true,
		category: "Status",
		id: "evasionorb",
		isNonstandard: true,
		name: "Evasion Orb",
		pp: 1,
		noPPBoosts: true,
		priority: 0,
		flags: {
			snatch: 1,
		},
		boosts: {
			evasion: 1,
		},
		onPrepareHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Calm Mind", target);
		},
		desc: "Boosts user's Evasion by one stage.",
		secondary: false,
		target: "self",
		type: "Psychic",
	},
	//Mug Orb
	mugorb: {
		accuracy: 100,
		category: "Status",
		id: "mugorb",
		isNonstandard: true,
		name: "Mug Orb",
		pp: 1,
		noPPBoosts: true,
		priority: 4,
		flags: {
			authentic: 1,
		},
		volatileStatus: 'snatch',
		onPrepareHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Snatch", target);
		},
		effect: {
			duration: 1,
			onStart: function (pokemon) {
				this.add('-singleturn', pokemon, 'Snatch');
			},
			onAnyTryMove: function (source, target, move) {
				if (move && move.flags['snatch'] && move.sourceEffect !== 'snatch') {
					let snatchUser = this.effectData.source;
					snatchUser.removeVolatile('snatch');
					this.add('-activate', snatchUser, 'Snatch', '[of] ' + source);
					this.useMove(move.id, snatchUser);
					return null;
				}
			},
		},
		desc: "Snatches a move, if the target's move has the Snatch flag.",
		secondary: false,
		pressureTarget: "foeSide",
		target: "self",
		type: "Dark",
	},
	//Wonder Orb
	wonderorb: {
		accuracy: true,
		category: "Status",
		id: "wonderorb",
		isNonstandard: true,
		name: "Wonder Orb",
		pp: 1,
		noPPBoosts: true,
		priority: 0,
		onPrepareHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Defog", target);
		},
		onHit: function (target, source) {
			let moves = ['Oran Berry', 'Apple', 'Blast Seed', 'Gravelrock', 'Heal Seed', 'Trap Orb', 'TrapBust Orb', 'Stun Seed', 'Totter Seed', 'Vile Seed', 'Violent Seed', 'Rainy Orb', 'Sunny Orb', 'Sandy Orb', 'Hail Orb', 'One Shot Orb', 'Warp Orb', 'Escape Orb', 'Stick', 'Iron Thorn', 'Mug Orb'];
			let toUse = moves[Math.floor(Math.random() * moves.length)];
			this.add('message', source.name + '\'s wonder orb let it use a ' + toUse + '!');
			this.useMove(toUse, target);
		},
		desc: "Randomly chooses a PMD move.",
		secondary: false,
		target: "self",
		type: "Fairy",
	},
	//Awakening
	awakening: {
		accuracy: true,
		category: "status",
		id: "awakening",
		isNonstandard: true,
		name: "Awakening",
		pp: 1,
		noPPBoosts: true,
		priority: 6,
		onPrepareHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Calm Mind", source);
			this.add('-anim', source, "Geomancy", source);
		},
		/*onHit: function (target, source, move) {
			this.add('message', source.name + '\'s full potential has awoken!');
			if (source.maxhp / 3 < source.hp) {
				this.directDamage(source.maxhp / 3, source, source);
			} else if(source.hp !== 1) {
				this.directDamage(source.hp - 1, source, source);
			}
		},*/
		boosts: {
			atk: 1,
			def: 1,
			spa: 1,
			spd: 1,
		},
		desc: "Boosts user's Atk, Def, SpA, and SpD by one stage.",
		secondary: false,
		target: "self",
		type: "Fairy",
	},
	//Sleep Seed
	sleepseed: {
		accuracy: true,
		category: "Status",
		id: "sleepseed",
		isNonstandard: true,
		name: "Sleep Seed",
		basePower: 0,
		pp: 1,
		noPPBoosts: true,
		priority: 0,
		flags: {authentic: 1, bullet: 1, snatch: 1},
		onPrepareHit: function (target, source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Bullet Seed", target);
			this.add('-anim', target, "Rest", target);
		},
		desc: "Puts target to sleep.",
		status: 'slp',
		target: "normal",
		type: "Normal",
	},
	//Quick Seed
	quickseed: {
		id: "quickseed",
		name: "Quick Seed",
		accuracy: true,
		category: "Status",
		isNonstandard: true,
		pp: 1,
		noPPBoosts: true,
		flags: {snatch: 1},
		onPrepareHit: function (source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Agility", source);
		},
		boosts: {spe: 2},
		desc: "Boosts user's Speed by 2 stages.",
		basePower: 0,
		priority: 0,
		secondary: false,
		target: "self",
		type: "Grass",
	},
	//Blinker Seed
	blinkerseed: {
		id: "blinkerseed",
		name: "Blinker Seed",
		accuracy: true,
		basePower: 0,
		category: "Status",
		isNonstandard: true,
		pp: 1,
		noPPBoosts: true,
		flags: {snatch: 1},
		onPrepareHit: function (source, target) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Smokescreen", target);
		},
		desc: "Lower's targets accuracy by one stage.",
		boosts: {accuracy: -1},
		priority: 0,
		secondary: false,
		target: "normal",
		type: "Grass",
	},
	//X-Eye Seed
	xeyeseed: {
		id: "xeyeseed",
		name: "X-Eye Seed",
		accuracy: true,
		basePower: 0,
		category: "Status",
		isNonstandard: true,
		pp: 1,
		noPPBoosts: true,
		priority: 0,
		secondary: false,
		flags: {snatch: 1},
		onPrepareHit: function (source, target) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Confuse Ray", target);
			this.add('-anim', source, "Substitute", source);
		},
		self: {
			volatileStatus: "substitute",
		},
		volatileStatus: "confusion",
		target: "normal",
		desc: "Confuses target, and employs the user in a substitute.",
		type: "Grass",
	},
	//Slip Seed
	slipseed: {
		accuracy: 100,
		basePower: 0,
		category: "Status",
		desc: "Causes self to become a Water type.",
		shortDesc: "Changes the self's type to Water.",
		id: "slipseed",
		name: "Slip Seed",
		pp: 1,
		noPPBoosts: true,
		priority: 0,
		flags: {protect: 1, reflectable: 1, mirror: 1, mystery: 1},
		onHit: function (target) {
			if (!target.setType('Water')) return false;
			this.add('-start', target, 'typechange', 'Water');
		},
		onPrepareHit: function (source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Soak", source);
		},
		secondary: false,
		target: "self",
		type: "Water",
	},
	//Decoy Orb
	decoyorb: {
		accuracy: true,
		basePower: 0,
		category: "Status",
		pp: 1,
		noPPBoosts: true,
		id: "decoyorb",
		name: "Decoy Orb",
		priority: 0,
		//Substitute
		volatileStatus: 'Substitute',
		desc: "Employs the user into a Substitute.",
		secondary: false,
		flags: {snatch: 1},
		onPrepareHit: function (source) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Substitute", source);
		},
		target: "self",
		type: "Normal",
	},
	//Pounce Orb
	pounceorb: {
		accuracy: true,
		basePower: 60,
		pp: 1,
		noPPBoosts: true,
		category: "Special",
		id: "pounceorb",
		name: "Pounce Orb",
		priority: 0,
		secondary: false,
		flags: {protect: 1},
		//Makes the target switch out
		forceSwitch: true,
		onPrepareHit: function (source, target) {
			this.attrLastMove('[still]');
			this.add('-anim', source, "Roar", target);
			this.add('-anim', source, "Dragon Tail", target);
		},
		desc: "Makes the target swap out.",
		target: "normal",
		type: "Normal",
	},
	//Sizebust Orb
	sizebustorb: {
		id: "sizebustorb",
		name: "Sizebust Orb",
		pp: 1,
		noPPBoosts: true,
		basePower: 0,
		basePowerCallback: function (pokemon, target) {
			let targetWeight = target.getWeight();
			if (targetWeight >= 200) {
				this.debug('120 bp');
				return 120;
			}
			if (targetWeight >= 100) {
				this.debug('100 bp');
				return 100;
			}
			if (targetWeight >= 50) {
				this.debug('80 bp');
				return 80;
			}
			if (targetWeight >= 25) {
				this.debug('60 bp');
				return 60;
			}
			if (targetWeight >= 10) {
				this.debug('40 bp');
				return 40;
			}
			this.debug('20 bp');
			return 20;
		},
		desc: "Does damage according to the target's weight, the more heavy more damage.",
		category: "Special",
		priority: 0,
		accuracy: true,
		flags: {protect: 1},
		target: "normal",
		type: "Grass",
	},
	//Transfer Orb
	transferorb: {
		id: "transferorb",
		name: "Transfer Orb",
		pp: 1,
		noPPBoosts: true,
		basePower: 0,
		//Makes target transfer into user
		onHit: function (target, pokemon) {
			if (!target.transformInto(pokemon, target)) {
				return false;
			}
		},
		desc: "Makes the target transform into the user.",
		accuracy: true,
		flags: {snatch: 1},
		priority: 0,
		category: "Status",
		target: "normal",
		type: "Normal",
	},
};

