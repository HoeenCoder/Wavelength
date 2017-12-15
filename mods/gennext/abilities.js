'use strict';

exports.BattleAbilities = {
	"swiftswim": {
		inherit: true,
		onModifySpe: function (spe, pokemon) {
			if (this.isWeather(['raindance', 'primordialsea'])) {
				return this.chainModify(1.5);
			}
		},
		shortDesc: "If Rain Dance is active, this Pokemon's Speed is multiplied by 1.5.",
	},
	"chlorophyll": {
		inherit: true,
		onModifySpe: function (spe) {
			if (this.isWeather(['sunnyday', 'desolateland'])) {
				return this.chainModify(1.5);
			}
		},
		shortDesc: "If Sunny Day is active, this Pokemon's Speed is multiplied by 1.5.",
	},
	"sandrush": {
		inherit: true,
		onModifySpe: function (spe, pokemon) {
			if (this.isWeather('sandstorm')) {
				return this.chainModify(1.5);
			}
		},
		shortDesc: "If Sandstorm is active, this Pokemon's Speed is multiplied by 1.5.",
	},
	"slushrush": {
		inherit: true,
		onModifySpe: function (spe, pokemon) {
			if (this.isWeather('hail')) {
				return this.chainModify(1.5);
			}
		},
		shortDesc: "If Hail is active, this Pokemon's Speed is multiplied by 1.5.",
	},
	"forecast": {
		inherit: true,
		onModifyMove: function (move) {
			if (move.weather) {
				let weather = move.weather;
				move.weather = null;
				move.onHit = function (target, source) {
					this.setWeather(weather, source, this.getAbility('forecast'));
					this.weatherData.duration = 0;
				};
				move.target = 'self';
			}
		},
		desc: "If this Pokemon is a Castform, its type changes to the current weather condition's type, except Sandstorm. Weather moves last forever.",
		shortDesc: "Castform's type changes to the current weather condition's type, except Sandstorm; weather moves last forever.",
	},
	"thickfat": {
		inherit: true,
		onImmunity: function (type, pokemon) {
			if (type === 'hail') return false;
		},
		onSourceModifyAtk: function (atk, attacker, defender, move) {
			if (move.type === 'Ice' || move.type === 'Fire' || move.type === 'Fighting') {
				this.add('-message', "The attack was weakened by Thick Fat!");
				return this.chainModify(0.5);
			}
		},
		onSourceModifySpA: function (atk, attacker, defender, move) {
			if (move.type === 'Ice' || move.type === 'Fire' || move.type === 'Fighting') {
				this.add('-message', "The attack was weakened by Thick Fat!");
				return this.chainModify(0.5);
			}
		},
		desc: "If a Pokemon uses a Fire- or Ice- or Fighting-type attack against this Pokemon, that Pokemon's attacking stat is halved when calculating the damage to this Pokemon. This Pokemon takes no damage from Hail.",
		shortDesc: "Fire/Ice/Fighting-type moves against this Pokemon deal damage with a halved attacking stat; immunity to Hail.",
	},
	"marvelscale": {
		inherit: true,
		onImmunity: function (type, pokemon) {
			if (type === 'hail') return false;
		},
		desc: "If this Pokemon has a major status condition, its Defense is multiplied by 1.5. This Pokemon takes no damage from Hail.",
		shortDesc: "If this Pokemon is statused, its Defense is 1.5x; immunity to Hail.",
	},
	"snowcloak": {
		inherit: true,
		onSourceBasePower: function (basePower) {
			if (this.isWeather('hail')) {
				return basePower * 3 / 4;
			}
			return basePower * 7 / 8;
		},
		onModifyAccuracy: function () {},
		desc: "If Hail is active, attacks against this Pokemon do 25% less than normal. If Hail is not active, attacks against this Pokemon do 12.5% less than normal. This Pokemon takes no damage from Hail.",
		shortDesc: "If Hail is active, attacks against this Pokemon do 25% less; immunity to Hail.",
	},
	"sandveil": {
		inherit: true,
		desc: "If Sandstorm is active, attacks against this Pokemon do 25% less than normal. If Sandstorm is not active, attacks against this Pokemon do 12.5% less than normal. This Pokemon takes no damage from Sandstorm.",
		shortDesc: "If Sandstorm is active, attacks against this Pokemon do 25% less; immunity to Sandstorm.",
		onSourceBasePower: function (basePower) {
			if (this.isWeather('sandstorm')) {
				return basePower * 4 / 5;
			}
		},
		onModifyAccuracy: function () {},
	},
	"waterveil": {
		inherit: true,
		onSourceBasePower: function (basePower) {
			if (this.isWeather(['raindance', 'primordialsea'])) {
				return basePower * 3 / 4;
			}
			return basePower * 7 / 8;
		},
		desc: "If Rain Dance is active, attacks against this Pokemon do 25% less than normal. This Pokemon cannot be burned. Gaining this Ability while burned cures it.",
		shortDesc: "If Rain Dance is active, attacks against this Pokemon do 25% less; This Pokemon cannot be burned.",
	},
	"icebody": {
		inherit: true,
		desc: "This Pokemon restores 1/16 of its maximum HP, rounded down, at the end of each turn. This Pokemon takes no damage from Hail. There is a 30% chance a Pokemon making contact with this Pokemon will be frozen.",
		shortDesc: "This Pokemon heals 1/16 of its max HP each turn; immunity to Hail; 30% chance a Pokemon making contact with this Pokemon will be frozen.",
		onResidual: function (target, source, effect) {
			this.heal(target.maxhp / 16);
		},
		onAfterDamage: function (damage, target, source, move) {
			if (move && move.flags['contact'] && this.isWeather('hail')) {
				if (this.random(10) < 3) {
					source.trySetStatus('frz', target);
				}
			}
		},
		onWeather: function () {},
	},
	"flamebody": {
		inherit: true,
		onImmunity: function (type, pokemon) {
			if (type === 'hail') return false;
		},
		shortDesc: "30% chance a Pokemon making contact with this Pokemon will be burned; immunity to Hail.",
	},
	"static": {
		inherit: true,
		onAfterDamage: function (damage, target, source, move) {
			if (move && move.flags['contact']) {
				source.trySetStatus('par', target);
			}
		},
		shortDesc: "100% chance a Pokemon making contact with this Pokemon will be paralyzed.",
	},
	"cutecharm": {
		inherit: true,
		onAfterDamage: function (damage, target, source, move) {
			if (move && move.flags['contact']) {
				source.addVolatile('Attract', target);
			}
		},
		desc: "There is a 100% chance a Pokemon making contact with this Pokemon will become infatuated if it is of the opposite gender.",
		shortDesc: "100% chance of infatuating Pokemon of the opposite gender if they make contact.",
	},
	"poisonpoint": {
		inherit: true,
		onAfterDamage: function (damage, target, source, move) {
			if (move && move.flags['contact']) {
				source.trySetStatus('psn', target);
			}
		},
		shortDesc: "100% chance a Pokemon making contact with this Pokemon will be poisoned.",
	},
	"flowergift": {
		inherit: true,
		onModifyMove: function (move) {
			if (move.id === 'sunnyday') {
				let weather = move.weather;
				move.weather = null;
				move.onHit = function (target, source) {
					this.setWeather(weather, source, this.getAbility('flowergift'));
					this.weatherData.duration = 0;
				};
				move.target = 'self';
				move.sideCondition = 'flowergift';
			}
		},
		onUpdate: function (pokemon) {
			if (this.isWeather(['sunnyday', 'desolateland'])) {
				if (pokemon.isActive && pokemon.speciesid === 'cherrim' && this.effectData.forme !== 'Sunshine') {
					this.effectData.forme = 'Sunshine';
					this.add('-formechange', pokemon, 'Cherrim-Sunshine', '[msg]');
					this.boost({spd: 1});
				}
			} else if (pokemon.isActive && pokemon.speciesid === 'cherrim' && this.effectData.forme) {
				delete this.effectData.forme;
				this.add('-formechange', pokemon, 'Cherrim', '[msg]');
			}
		},
		effect: {
			onSwitchInPriority: 1,
			onSwitchIn: function (target) {
				if (!target.fainted) {
					this.boost({spd: 1}, target, target, this.getAbility('flowergift'));
				}
				target.side.removeSideCondition('flowergift');
			},
		},
		desc: "If this Pokemon is a Cherrim and Sunny Day is active, it changes to Sunshine Form and the Special Defense of it is multiplied by 1.5. The next Pokemon that switches in gets its Special Defense also multiplied by 1.5.",
		shortDesc: "If user is Cherrim and Sunny Day is active, its Sp. Def is multiplied by 1.5; the next switch-in also gets its SpD multiplied by 1.5.",
	},
	"slowstart": {
		inherit: true,
		effect: {
			duration: 3,
			onStart: function (target) {
				this.add('-start', target, 'Slow Start');
			},
			onModifyAtk: function (atk, pokemon) {
				if (pokemon.ability !== 'slowstart') {
					pokemon.removeVolatile('slowstart');
					return;
				}
				return atk / 2;
			},
			onModifySpe: function (spe, pokemon) {
				if (pokemon.ability !== 'slowstart') {
					pokemon.removeVolatile('slowstart');
					return;
				}
				return spe / 2;
			},
			onEnd: function (target) {
				this.add('-end', target, 'Slow Start');
			},
		},
		shortDesc: "On switch-in, this Pokemon's Attack and Speed are halved for 3 turns.",
	},
	"compoundeyes": {
		inherit: true,
		desc: "The accuracy of this Pokemon's moves receives a 60% increase; for example, a 50% accurate move becomes 80% accurate.",
		shortDesc: "This Pokemon's moves have their Accuracy boosted to 1.6x.",
		onSourceModifyAccuracy: function (accuracy) {
			if (typeof accuracy !== 'number') return;
			this.debug('compoundeyes - enhancing accuracy');
			return accuracy * 1.6;
		},
	},
	"keeneye": {
		inherit: true,
		desc: "The accuracy of this Pokemon's moves receives a 60% increase; for example, a 50% accurate move becomes 80% accurate.",
		shortDesc: "This Pokemon's moves have their Accuracy boosted to 1.6x.",
		onModifyMove: function (move) {
			if (typeof move.accuracy !== 'number') return;
			this.debug('keeneye - enhancing accuracy');
			move.accuracy *= 1.6;
		},
	},
	"solidrock": {
		inherit: true,
		shortDesc: "This Pokemon receives 1/2 damage from supereffective attacks.",
		onSourceModifyDamage: function (damage, attacker, defender, move) {
			if (move.typeMod > 0) {
				this.add('-message', "The attack was weakened by Solid Rock!");
				return this.chainModify(0.5);
			}
		},
	},
	"filter": {
		inherit: true,
		shortDesc: "This Pokemon receives 1/2 damage from supereffective attacks.",
		onSourceModifyDamage: function (damage, attacker, defender, move) {
			if (move.typeMod > 0) {
				this.add('-message', "The attack was weakened by Filter!");
				return this.chainModify(0.5);
			}
		},
	},
	"heatproof": {
		inherit: true,
		desc: "The user is completely immune to Fire-type moves and burn damage.",
		shortDesc: "The user is immune to Fire type attacks and burn damage.",
		onImmunity: function (type, pokemon) {
			if (type === 'Fire' || type === 'brn') return false;
		},
	},
	"reckless": {
		inherit: true,
		onBasePower: function (basePower, attacker, defender, move) {
			if (move.recoil || move.hasCustomRecoil || attacker.item === 'lifeorb') {
				this.debug('Reckless boost');
				return basePower * 12 / 10;
			}
		},
		desc: "This Pokemon's attacks with recoil or crash damage or if the user is holding a Life Orb have their power multiplied by 1.2. Does not affect Struggle.",
		shortDesc: "This Pokemon's attacks with recoil or crash damage or the user's item is Life Orb have 1.2x power; not Struggle.",
	},
	"clearbody": {
		inherit: true,
		onBoost: function (boost, target, source) {
			for (let i in boost) {
				if (boost[i] < 0) {
					delete boost[i];
					this.add("-message", target.name + "'s stats were not lowered! (placeholder)");
				}
			}
		},
		shortDesc: "Prevents any negative stat changes on this Pokemon.",
	},
	"whitesmoke": {
		inherit: true,
		onBoost: function (boost, target, source) {
			for (let i in boost) {
				if (boost[i] < 0) {
					delete boost[i];
					this.add("-message", target.name + "'s stats were not lowered! (placeholder)");
				}
			}
		},
		shortDesc: "Prevents any negative stat changes on this Pokemon.",
	},
	"rockhead": {
		inherit: true,
		onDamage: function (damage, target, source, effect) {
			if (effect && ['lifeorb', 'recoil'].includes(effect.id)) return false;
		},
		desc: "This Pokemon does not take recoil damage besides Struggle, and crash damage.",
		shortDesc: "This Pokemon does not take recoil damage besides Struggle/crash damage.",
	},
	"download": {
		inherit: true,
		onStart: function (pokemon) {
			if (pokemon.template.baseSpecies === 'Genesect') {
				if (!pokemon.getItem().onDrive) return;
			}
			let foeactive = pokemon.side.foe.active;
			let totaldef = 0;
			let totalspd = 0;
			for (let i = 0; i < foeactive.length; i++) {
				if (!foeactive[i] || foeactive[i].fainted) continue;
				totaldef += foeactive[i].stats.def;
				totalspd += foeactive[i].stats.spd;
			}
			if (totaldef && totaldef >= totalspd) {
				this.boost({spa: 1});
			} else if (totalspd) {
				this.boost({atk: 1});
			}
		},
		desc: "On switch-in, this Pokemon's Attack or Special Attack is raised by 1 stage based on the weaker combined defensive stat of all opposing Pokemon. Attack is raised if their Defense is lower, and Special Attack is raised if their Special Defense is the same or lower. If the user is a Genesect, this will not have effect unless it holds a Drive.",
		shortDesc: "On switch-in, Attack or Sp. Atk is raised 1 stage based on the foes' weaker Defense; Genesect must hold a plate for the effect to work.",
	},
	"victorystar": {
		inherit: true,
		onAllyModifyMove: function (move) {
			if (typeof move.accuracy === 'number') {
				move.accuracy *= 1.5;
			}
		},
		shortDesc: "This Pokemon's moves' accuracy is multiplied by 1.5.",
	},
	"shellarmor": {
		inherit: true,
		onDamage: function (damage, target, source, effect) {
			if (effect && effect.effectType === 'Move') {
				this.add('-message', "Its damage was reduced by Shell Armor!");
				damage -= target.maxhp / 10;
				if (damage < 0) damage = 0;
				return damage;
			}
		},
		onHit: function (target, source, move) {
			if (move.id === 'shellsmash') {
				target.setAbility('');
			}
		},
		desc: "This Pokemon cannot be struck by a critical hit. This ability also reduces incoming move damage by 1/10 of the user's max HP.  If the user uses Shell Smash, this ability's effect ends.",
		shortDesc: "This Pokemon can't be struck critical hit; reduces incoming move damage by 1/10 of the user's max HP.",
	},
	"prismarmor": {
		inherit: true,
		onDamage: function (damage, target, source, effect) {
			if (effect && effect.effectType === 'Move') {
				this.add('-message', "Its damage was reduced by Prism Armor!");
				damage -= target.maxhp / 10;
				if (damage < 0) damage = 0;
				return damage;
			}
		},
		desc: "This Pokemon receives 3/4 damage from supereffective attacks. Moongeist Beam, Sunsteel Strike, and the Abilities Mold Breaker, Teravolt, and Turboblaze cannot ignore this Ability. This ability also reduces incoming move damage by 1/10 of the user's max HP.",
		shortDesc: "This Pokemon receives 3/4 damage from supereffective attacks; reduces incoming move damage by 1/10 of the user's max HP.",
	},
	"battlearmor": {
		inherit: true,
		onDamage: function (damage, target, source, effect) {
			if (effect && effect.effectType === 'Move') {
				this.add('-message', "Its damage was reduced by Battle Armor!");
				damage -= target.maxhp / 10;
				if (damage < 0) damage = 0;
				return damage;
			}
		},
		desc: "This Pokemon cannot be struck by a critical hit. This ability also reduces incoming move damage by 1/10 of the user's max HP.",
		shortDesc: "This Pokemon can't be struck critical hit; reduces incoming move damage by 1/10 of the user's max HP.",
	},
	"weakarmor": {
		inherit: true,
		onDamage: function (damage, target, source, effect) {
			if (effect && effect.effectType === 'Move') {
				this.add('-message', "Its damage was reduced by Weak Armor!");
				damage -= target.maxhp / 10;
				if (damage < 0) damage = 0;
				target.setAbility('');
				this.boost({spe: 1});
				return damage;
			}
		},
		onAfterDamage: function () {},
		desc: "This ability reduces incoming move damage by 1/10 of the user's max HP and increases the user's Speed for the first hit after switch-in (and does not activate again until the next switch-in).",
		shortDesc: "Reduces incoming move damage by 1/10 of the user's max HP and increases the user's Spe for the 1st hit after switch-in (doesn't activate until next switch-in).",
	},
	"magmaarmor": {
		inherit: true,
		onImmunity: function (type, pokemon) {
			if (type === 'hail') return false;
			if (type === 'frz') return false;
		},
		onDamage: function (damage, target, source, effect) {
			if (effect && effect.effectType === 'Move') {
				damage -= target.maxhp / 10;
				if (damage < 0) damage = 0;
				if (effect.type === 'Ice' || effect.type === 'Water') {
					this.add('-activate', target, 'ability: Magma Armor');
					target.setAbility('battlearmor');
					damage = 0;
				} else {
					this.add('-message', "Its damage was reduced by Magma Armor!");
				}
				return damage;
			}
		},
		desc: "This ability reduces incoming move damage by 1/10 of the user's max HP, provides immunity to Hail and freeze, and provides a one-time immunity to Water and Ice (after which it turns into Battle Armor).",
		shortDesc: "Reduces incoming move damage by 1/10 of the user's max HP, provides immunity to Hail & Frz, and provides a 1 time immunity to Water and Ice.",
	},
	"multiscale": {
		inherit: true,
		onSourceModifyDamage: function (damage, source, target, move) {
			if (target.hp >= target.maxhp) {
				this.add('-message', "The attack was slightly weakened by Multiscale!");
				return this.chainModify(2 / 3);
			}
		},
		shortDesc: "If this Pokemon is at full HP, damage taken from attacks is lessened by 1/3.",
	},
	"ironfist": {
		inherit: true,
		onBasePower: function (basePower, attacker, defender, move) {
			if (move.flags['punch']) {
				return basePower * 1.33;
			}
		},
		desc: "This Pokemon's punch-based attacks have their power multiplied by 1.33.",
		shortDesc: "This Pokemon's punch-based attacks have 1.33x power. Sucker Punch is not boosted.",
	},
	"stench": {
		inherit: true,
		onModifyMove: function (move) {
			if (move.category !== "Status") {
				this.debug('Adding Stench flinch');
				if (!move.secondaries) move.secondaries = [];
				for (let i = 0; i < move.secondaries.length; i++) {
					if (move.secondaries[i].volatileStatus === 'flinch') return;
				}
				move.secondaries.push({
					chance: 40,
					volatileStatus: 'flinch',
				});
			}
		},
		shortDesc: "This Pokemon's attacks without a chance to flinch have a 40% chance to flinch.",
	},
	"aftermath": {
		inherit: true,
		onAfterDamage: function (damage, target, source, move) {
			if (source && source !== target && move && !target.hp) {
				this.damage(source.maxhp / 3, source, target, null, true);
			}
		},
		desc: "If this Pokemon is knocked out, that move's user loses 1/4 of its maximum HP, rounded down. If any active Pokemon has the Ability Damp, this effect is prevented.",
		shortDesc: "If this Pokemon is KOed, that move's user loses 1/4 its max HP.",
	},
	"cursedbody": {
		desc: "When this Pokemon faints, attacker is Cursed.",
		shortDesc: "When this Pokemon faints, attacker is Cursed.",
		onFaint: function (target, source, effect) {
			if (effect && effect.effectType === 'Move' && source) {
				source.addVolatile('curse');
			}
		},
		id: "cursedbody",
		name: "Cursed Body",
		rating: 3,
		num: 130,
	},
	"gluttony": {
		inherit: true,
		onResidualOrder: 26,
		onResidualSubOrder: 1,
		onResidual: function (pokemon) {
			if (!pokemon.gluttonyFlag && !pokemon.item && this.getItem(pokemon.lastItem).isBerry) {
				pokemon.gluttonyFlag = true;
				pokemon.setItem(pokemon.lastItem);
				this.add("-item", pokemon, pokemon.item, '[from] ability: Gluttony');
			}
		},
		shortDesc: "When this Pokemon has 1/2 or less of its maximum HP, it uses certain Berries early. Each berry has 2 uses.",
	},
	"guts": {
		inherit: true,
		onDamage: function (damage, attacker, defender, effect) {
			if (effect && (effect.id === 'brn' || effect.id === 'psn' || effect.id === 'tox')) {
				return damage / 2;
			}
		},
		desc: "If this Pokemon has a major status condition, its Attack is multiplied by 1.5; burn's physical damage halving is ignored; takes half damage from burn/poison/toxic.",
		shortDesc: "If this Pokemon is statused, its Attack is 1.5x; ignores burn halving physical damage; takes 1/2 damage from brn/psn/tox.",
	},
	"quickfeet": {
		inherit: true,
		onDamage: function (damage, attacker, defender, effect) {
			if (effect && (effect.id === 'brn' || effect.id === 'psn' || effect.id === 'tox')) {
				return damage / 2;
			}
		},
		desc: "If this Pokemon has a major status condition, its Speed is multiplied by 1.5; the Speed drop from paralysis is ignored; takes half damage from burn/poison/toxic.",
		shortDesc: "If this Pokemon is statused, its Speed is 1.5x; ignores Speed drop from paralysis; takes 1/2 damage from brn/psn/tox.",
	},
	"toxicboost": {
		inherit: true,
		onDamage: function (damage, attacker, defender, effect) {
			if (effect && (effect.id === 'psn' || effect.id === 'tox')) {
				return damage / 2;
			}
		},
		desc: "While this Pokemon is poisoned, the power of its physical attacks is multiplied by 1.5; takes half damage from poison/toxic.",
		shortDesc: "While this Pokemon is poisoned, its physical attacks have 1.5x power; takes 1/2 damage from psn/tox.",
	},
	"truant": {
		inherit: true,
		onBeforeMove: function () {},
		onModifyMove: function (move, pokemon) {
			if (!move.self) move.self = {};
			if (!move.self.volatileStatus) move.self.volatileStatus = 'truant';
		},
		effect: {
			duration: 2,
			onStart: function (pokemon) {
				this.add('-start', pokemon, 'Truant');
			},
			onBeforeMovePriority: 99,
			onBeforeMove: function (pokemon, target, move) {
				if (pokemon.removeVolatile('truant')) {
					this.add('cant', pokemon, 'ability: Truant');
					this.heal(pokemon.maxhp / 3);
					return false;
				}
			},
		},
		shortDesc: "This Pokemon will not be able to move the turn after a successful move; heals 1/3 of its max HP on its Truant turn.",
	},
	"flareboost": {
		inherit: true,
		onDamage: function (damage, defender, attacker, effect) {
			if (effect && (effect.id === 'brn')) {
				return damage / 2;
			}
		},
		desc: "While this Pokemon is burned, the power of its special attacks is multiplied by 1.5; takes half damage from burns.",
		shortDesc: "While this Pokemon is burned, its special attacks have 1.5x power; takes 1/2 damage from brn.",
	},
	"telepathy": {
		inherit: true,
		onStart: function (target) {
			this.add('-start', target, 'move: Imprison');
		},
		onFoeDisableMove: function (pokemon) {
			for (const moveSlot of this.effectData.target.moveSlots) {
				pokemon.disableMove(moveSlot.id, 'hidden');
			}
			pokemon.maybeDisabled = true;
		},
		onFoeBeforeMove: function (attacker, defender, move) {
			if (move.id !== 'struggle' && this.effectData.target.hasMove(move.id)) {
				this.add('cant', attacker, 'move: Imprison', move);
				return false;
			}
		},
		shortDesc: "This Pokemon does not take damage from attacks made by its allies; imprisons the target upon entry.",
	},
	"speedboost": {
		inherit: true,
		onResidualPriority: -1,
		onResidual: function (pokemon) {
			if (pokemon.activeTurns && !pokemon.volatiles.stall) {
				this.boost({spe: 1});
			}
		},
		desc: "This Pokemon's Speed is raised by 1 stage at the end of each full turn it has been on the field. This ability does not activate on turns Protect, Detect, Endure, etc are used.",
	},
	"parentalbond": {
		inherit: true,
		onModifyMove: function (move, pokemon, target) {
			if (move.category !== 'Status' && !move.selfdestruct && !move.multihit && ((target.side && target.side.active.length < 2) || ['any', 'normal', 'randomNormal'].includes(move.target))) {
				move.multihit = 2;
				move.accuracy = true;
				pokemon.addVolatile('parentalbond');
			}
		},
		effect: {
			duration: 1,
			onBasePowerPriority: 8,
			onBasePower: function (basePower) {
				return this.chainModify(0.5);
			},
		},
		desc: "This Pokemon's damaging moves become multi-hit moves that hit twice. Both hits' damage are halved. Does not affect multi-hit moves or moves that have multiple targets. The moves that are affected will never miss.",
		shortDesc: "This Pokemon's damaging moves hit twice. Both hits have their damage halved. Moves affected have -- accuracy.",
	},
	"swarm": {
		inherit: true,
		onFoeBasePower: function (basePower, attacker, defender, move) {
			if (defender.hasType('Flying')) {
				if (move.type === 'Rock' || move.type === 'Electric' || move.type === 'Ice') {
					this.add('-message', "The attack was weakened by Swarm!");
					return basePower / 2;
				}
			}
		},
		onDamage: function (damage, defender, attacker, effect) {
			if (defender.hasType('Flying')) {
				if (effect && effect.id === 'stealthrock') {
					return damage / 2;
				}
			}
		},
		desc: "When this Pokemon has 1/3 or less of its maximum HP, rounded down, its attacking stat is multiplied by 1.5 while using a Bug-type attack. The user takes half damage from Rock, Ice, Electric moves, and Stealth Rock if they are Flying type.",
		shortDesc: "When this Pokemon has 1/3 or less of its max HP, its Bug attacks do 1.5x damage. The user takes 1/2 damage from Rock/Ice/Electric moves, and Stealth Rock, if the user is Flying type.",
	},
	"adaptability": {
		inherit: true,
		onModifyMove: function (move) {},
		onBasePower: function (power, attacker, defender, move) {
			if (!attacker.hasType(move.type)) {
				return this.chainModify(1.33);
			}
		},
		desc: "This Pokemon's moves that don't match one of its types have an attack bonus of 1.33.",
		shortDesc: "This Pokemon's non-STAB moves is 1.33x.",
	},
	"shadowtag": {
		desc: "For the first turn after this Pokemon switches in, prevent adjacent opposing Pokemon from choosing to switch out unless they are immune to trapping or also have this Ability.",
		shortDesc: "Prevents adjacent foes from choosing to switch for one turn.",
		inherit: true,
		onStart: function (pokemon) {
			pokemon.addVolatile('shadowtag');
		},
		effect: {
			duration: 2,
			onFoeTrapPokemon: function (pokemon) {
				if (pokemon.ability !== 'shadowtag') {
					pokemon.tryTrap(true);
				}
			},
		},
		onBeforeMovePriority: 15,
		onBeforeMove: function (pokemon) {
			pokemon.removeVolatile('shadowtag');
		},
		onFoeMaybeTrapPokemon: function (pokemon, source) {
			if (!source) source = this.effectData.target;
			if (pokemon.ability !== 'shadowtag' && !source.volatiles.shadowtag) {
				pokemon.maybeTrapped = true;
			}
		},
		onFoeTrapPokemon: function (pokemon) {},
	},
};
