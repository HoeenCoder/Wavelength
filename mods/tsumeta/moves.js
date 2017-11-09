/*List of flags and their descriptions:authentic: Ignores a target's substitute.bite: Power is multiplied by 1.5 when used by a Pokemon with the Ability Strong Jaw.bullet: Has no effect on Pokemon with the Ability Bulletproof.charge: The user is unable to make a move between turns.contact: Makes contact.defrost: Thaws the user if executed successfully while the user is frozen.distance: Can target a Pokemon positioned anywhere in a Triple Battle.gravity: Prevented from being executed or selected during Gravity's effect.heal: Prevented from being executed or selected during Heal Block's effect.mirror: Can be copied by Mirror Move.nonsky: Prevented from being executed or selected in a Sky Battle.powder: Has no effect on Grass-type Pokemon, Pokemon with the Ability Overcoat, and Pokemon holding Safety Goggles.protect: Blocked by Detect, Protect, Spiky Shield, and if not a Status move, King's Shield.pulse: Power is multiplied by 1.5 when used by a Pokemon with the Ability Mega Launcher.punch: Power is multiplied by 1.2 when used by a Pokemon with the Ability Iron Fist.recharge: If this move is successful, the user must recharge on the following turn and cannot make a move.reflectable: Bounced back to the original user by Magic Coat or the Ability Magic Bounce.snatch: Can be stolen from the original user and instead used by another Pokemon using Snatch.sound: Has no effect on Pokemon with the Ability Soundproof.*/

'use strict';

exports.BattleMovedex = {
	"aircutter": {
		inherit: true,
		basePower: 110,
		critRatio: 1,
		accuracy: 85,
		//UNABLE TO DO 1.2x IF HITTING SINGLE FOE.
	},
	"razorwind": {
		inherit: true,
		type: "Flying",
		critRatio: 1,
		flags: {
			protect: 1,
			mirror: 1,
		},
		desc: "Has a 10% chance to lower the foes special defense by 1.",
		shortDesc: "10% chance to lower foes spd by 1.",
		secondary: {
			chance: 10,
			target: {
				boosts: {
					spd: -1,
				},
			},
		},
	},
	"focusblast": {
		inherit: true,
		basePower: 100,
		accuracy: 100,
	},
	"aurasphere": {
		inherit: true,
		def: "High crit ratio",
		critRate: 2,
		desc: "High crit ratio",
		shortDesc: "High crit ratio",
	},
	"forcepalm": {
		inherit: true,
		basePower: 90,
		def: "15% chance to paralyze target",
		secondary: {
			chance: 15,
			status: "par",
		},
		desc: "15% chance to paralyze target",
		shortDesc: "15% chance to paralyze target",
	},
	"closecombat": {
		inherit: true,
		basePower: 150,
		self: {
			boosts: {
				def: -1,
				spd: -1,
				spe: -1,
			},
		},
		desc: "Lowers Defense, Special Defense, and Speed by one stage",
		shortDesc: "Lowers Def + SpD + Spe by 1 stage",
	},
	"extremespeed": {
		inherit: true,
		flags: {contact: 1},
		onTryHitPriority: 3,
		onTryHit: function (target, source, move) {
			let chance = Math.floor(Math.random() * 99);
			if (target.lastMove !== 'detect') {
				if (chance < 30 && (target.volatiles['banefulbunker'] || target.volatiles['kingsshield'] || target.side.sideConditions['matblock'] || target.volatiles['protect'] || target.volatiles['spikyshield'])) {
					return true; // just a safety check.
				} else {
					if (target.volatiles['banefulbunker'] || target.volatiles['kingsshield'] || target.side.sideConditions['matblock'] || target.volatiles['protect'] || target.volatiles['spikyshield']) {
						this.add('-hint', 'The opposing ' + target.name + ' protected itself!');
						return null;
					}
				}
			} else if (target.lastMove === 'detect' && target.volatiles['protect']) {
				this.add('-hint', 'The opposing ' + target.name + ' protected itself!');
				return null;
			}
		},
		desc: "If protecting move is not detect, 30% chance to break protect",
		shortDesc: "If protecting move is not detect, 30% chance to break protect",
	},
	"toxic": {
		inherit: true,
		accuracy: 80,
	},
	"wildcharge": {
		inherit: true,
		basePower: 120,
		desc: "1/3 of damage dealt is inflicted on user.",
		shortDesc: "1/3 of damage dealt is inflicted on user.",
		recoil: [1, 3],
	},
	"xscissor": {
		inherit: true,
		basePower: 100,
		desc: "High Crit Ratio.",
		shortDesc: "High Crit Ratio.",
		critRatio: 2,
	},
	"dragonrush": {
		inherit: true,
		basePower: 135,
		accuracy: 85,
		recoil: [1, 4],
		desc: "10% chance to flinch target, 1/4 damage dealt to target inflicts user",
		shortDesc: "10% chance to flinch target, 1/4 damage dealt to target inflicts user",
		secondary: {
			chance: 10,
			volatileStatus: 'flinch',
		},
	},
	"sandattack": {
		inherit: true,
		category: "Physical",
		basePower: 30,
		accuracy: 75,
		desc: "30% chance to lower target's accuracy by one stage",
		shortDesc: "30% chance to lower target's accuracy by one stage",
		secondary: {
			chance: 30,
			boost: {
				accuracy: -1,
			},
		},
	},
	"disarmingvoice": {
		inherit: true,
		basePower: 90,
		secondary: {
			chance: 20,
			boost: {
				atk: -1,
				spa: -1,
			},
		},
		desc: "20% chance to lower foe's Attack and Special Attack by one stage",
		shortDesc: "20% chance to lower foe's Attack and Special Attack by one stage",
	},
	"dazzlinggleam": {
		inherit: true,
		basePower: 105,
		accuracy: true,
		onTryHit: function (target) {
			if (target.item === 'blackglasses' || target.item === 'wiseglasses' || target.item === 'safetygoggles') {
				this.add('-immune', this);
				return false;
			}
		},
		desc: "If opponent is holding Black Glasses, Wise Glasses, or Safety Googles this has no effect.",
		shortDesc: "If opponent is holding Black Glasses, Wise Glasses, or Safety Googles this has no effect.",
	},
	"shadowball": {
		inherit: true,
		basePower: 100,
		secondary: {
			chance: 10,
			volatileStatus: 'curse',
		},
		desc: "10% chance to inflict a curse on the target.",
		shortDesc: "10% chance to inflict a curse on the target.",
	},
};
