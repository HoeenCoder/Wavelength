'use strict';

exports.BattleAbilities = {
	//Ashley the Pikachu
	primalsurge: {
		name: "Primal Surge",
		id: "primalsurge",
		isNonStandard: true,
		desc: "Permanent Electric Terrain, Speed is doubled",
		onStart: function (source) {
			this.setTerrain('electricterrain');
			this.terrainData.duration = 0;
		},
		onModifySpe: function (spe) {
			return this.chainModify(2);
		},
		onEnd: function (pokemon) {
			if (this.terrainData.source !== pokemon) return;
			for (let i = 0; i < this.sides.length; i++) {
				for (let j = 0; j < this.sides[i].active.length; j++) {
					let target = this.sides[i].active[j];
					if (target === pokemon) continue;
					if (target && target.hp && target.hasAbility('primalsurge')) {
						this.terrainData.source = target;
						return;
					}
				}
			}
			this.setTerrain('');
		},
	},
	//Desokoro
	wavecall: {
		id: "wavecall",
		name: "Wave Call",
		desc: "Water Attacks damage is 2x if the user is status'ed or HP is less than 1/2",
		onStart: function (pokemon) {
			pokemon.addVolatile('wavecall');
		},
		onEnd: function (pokemon) {
			delete pokemon.volatiles['wavecall'];
			this.add('-end', pokemon, 'Wave Call', '[silent]');
		},
		effect: {
			duration: 3,
			onStart: function (target) {
				this.add('-start', target, 'ability: Wave Call');
			},
			onSourceModifyDamage: function (damage, source, target, move) {
				if (target !== source && move.type === 'Electric') {
					return this.chainModify(0.1);
				}
			},
			onModifyPriority: function (priority, pokemon, target, move) {
				if (move.id === 'tsunamicrash') {
					return priority + 0.1;
				}
			},
			onEnd: function (target) {
				this.add('-end', target, 'Wave Call');
			},
		},
		onModifyAtkPriority: 5,
		onModifyAtk: function (atk, pokemon, move, attacker) {
			if (pokemon.status && move.type === 'Water' || move.type === 'Water' && attacker.hp <= attacker.maxhp / 2) {
				return this.chainModify(2);
			}
		},
		onModifySpePriority: 5,
		onModifySpe: function (spe, pokemon, move, attacker) {
			if (pokemon.status || attacker.hp <= attacker.maxhp / 2) {
				return this.chainModify(2);
			}
		},
	},
	//Tidal Wave Bot
	loading: {
		id: "loading",
		name: "Loading...",
		desc: "Boosts user's Attack by 4 stages, and Spe by 2 stages on switch in. Also uses Magnet Rise on entry.",
		onStart: function (pokemon) {
			this.add('-start', pokemon, 'typechange', 'Electric/Steel');
			pokemon.types = ["Electric", "Steel"];
			this.boost({atk: 4, spe: 2});
			this.useMove('magnetrise', pokemon);
		},
	},
	//Kraken Mare
	krakensboost: {
		id: "krakensboost",
		name: "Kraken's Boost",
		desc: "Moody + No Guard",
		onResidual: function (pokemon) {
			let stats = [];
			let boost = {};
			for (let statPlus in pokemon.boosts) {
				if (pokemon.boosts[statPlus] < 6) {
					stats.push(statPlus);
				}
			}
			let randomStat = stats.length ? stats[this.random(stats.length)] : "";
			if (randomStat) boost[randomStat] = 2;

			stats = [];
			for (let statMinus in pokemon.boosts) {
				if (pokemon.boosts[statMinus] > -6 && statMinus !== randomStat) {
					stats.push(statMinus);
				}
			}
			randomStat = stats.length ? stats[this.random(stats.length)] : "";
			if (randomStat) boost[randomStat] = -1;

			this.boost(boost);
		},
		onAnyAccuracy: function (accuracy, target, source, move) {
			if (move && (source === this.effectData.target || target === this.effectData.target)) {
				return true;
			}
			return accuracy;
		},
	},
	//HoeenHero
	programmersdomain: {
		id: "programmersdomain",
		name: "Programmer's Domain",
		desc: "Primordial Sea + Rain Dish + Swift Swim + Adaptability",
		onStart: function (source) {
			this.setWeather('primordialsea');
		},
		onAnySetWeather: function (target, source, weather) {
			if (this.getWeather().id === 'primordialsea' && !(weather.id in {
				desolateland: 1,
				primordialsea: 1,
				deltastream: 1,
			})) return false;
		},
		onEnd: function (pokemon) {
			if (this.weatherData.source !== pokemon) return;
			for (let i = 0; i < this.sides.length; i++) {
				for (let j = 0; j < this.sides[i].active.length; j++) {
					let target = this.sides[i].active[j];
					if (target === pokemon) continue;
					if (target && target.hp && target.hasAbility('primordialsea') || target && target.hp && target.hasAbility('programmersdomain') || target && target.hp && target.hasAbility('cripplingdepression')) {
						this.weatherData.source = target;
						return;
					}
				}
			}
			this.clearWeather();
		},
		onWeather: function (target, source, effect) {
			if (effect.id === 'raindance' || effect.id === 'primordialsea') {
				this.heal(target.maxhp / 16);
			}
		},
		onModifySpe: function (spe, pokemon) {
			if (this.isWeather(['raindance', 'primordialsea'])) {
				return this.chainModify(2);
			}
		},
		onModifyMove: function (move) {
			move.stab = 2;
		},
	},
	//Stabby the Krabby
	readytostab: {
		id: "readytostab",
		name: "Ready to Stab",
		desc: "Boosts user's Atk and Spe by 1 stage",
		onStart: function (pokemon) {
			this.boost({atk: 1, spe: 1});
		},
	},
	//Serperiorater
	unnamable: {
		id: "unnamable",
		name: "Unnamable",
		desc: "Boosts user's SpA by 1 stage and attacks that are super effective against the target do 1.2x damage.",
		onStart: function (pokemon) {
			this.boost({spa: 1});
		},
		onModifyDamage: function (damage, source, target, move) {
			if (move && move.typeMod > 0) {
				return this.chainModify([0x1333, 0x1000]);
			}
		},
	},
	// Volco
	shadowfist: {
		shortDesc: "On switch-in, This pokemon is a ghost/fighting type.",
		onStart: function (pokemon) {
			this.add('-start', pokemon, 'typechange', 'Fighting/Ghost');
			pokemon.types = ["Fighting", "Ghost"];
		},
		onBasePowerPriority: 8,
		onBasePower: function (basePower, attacker, defender, move) {
			if (move.flags['punch']) {
				return this.chainModify([0x1333, 0x1000]);
			}
		},
		id: "shadowfist",
		name: "Shadow Fist",
	},
	// MechSteelix
	sandbox: {
		id: "sandbox",
		name: "Sandbox",
		desc: "Sets up Trick Room, Sandstorm & Gravity on switch in.",
		onStart: function (pokemon) {
			this.useMove('trickroom', pokemon);
			this.useMove('gravity', pokemon);
			this.setWeather('sandstorm');
		},
	},
	//TheRittz
	paradoxicalprowess: {
		id: "paradoxicalprowess",
		name: " Paradoxical Prowess",
		desc: "Sets up Safeguard, Lucky Chant, has same effects of Magic Guard, has same effects of Sticky Hold, and has same effects of Oblivious",
		//Magic Guard
		onDamage: function (damage, target, source, effect) {
			if (effect.effectType !== 'Move') {
				return false;
			}
		},
		//Sticky Hold
		onTakeItem: function (item, pokemon, source) {
			if (this.suppressingAttackEvents() && pokemon !== this.activePokemon || !pokemon.hp || pokemon.item === 'stickybarb') return;
			if ((source && source !== pokemon) || this.activeMove.id === 'knockoff') {
				this.add('-activate', pokemon, 'ability: Paradoxical Prowess');
				return false;
			}
		},
		//Oblivious
		onUpdate: function (pokemon) {
			if (pokemon.volatiles['attract']) {
				this.add('-activate', pokemon, 'ability: Paradoxical Prowess');
				pokemon.removeVolatile('attract');
				this.add('-end', pokemon, 'move: Attract', '[from] ability: Paradoxical Prowess');
			}
			if (pokemon.volatiles['taunt']) {
				this.add('-activate', pokemon, 'ability: Paradoxical Prowess');
				pokemon.removeVolatile('taunt');
				// Taunt's volatile already sends the -end message when removed
			}
		},
		onImmunity: function (type, pokemon) {
			if (type === 'attract') return false;
		},
		onTryHit: function (pokemon, target, move) {
			if (move.id === 'attract' || move.id === 'captivate' || move.id === 'taunt') {
				this.add('-immune', pokemon, '[msg]', '[from] ability: Paradoxical Prowess');
				return null;
			}
		},
	},
	//Perison
	deathboost: {
		id: "deathboost",
		name: "Death Boost",
		desc: "Simple + Puts foe to sleep on entry.",
		onStart: function (pokemon) {
			this.useMove('hypnosis', pokemon);
		},
		onBoost: function (boost, target, source, effect) {
			if (effect && effect.id === 'zpower') return;
			for (let i in boost) {
				boost[i] *= 2;
			}
		},
	},
	//xcmr
	felinefury: {
		id: "felinefury",
		name: "Feline Fury",
		desc: "+2 Attack on switch in + Scrappy",
		onStart: function (pokemon) {
			this.boost({atk: 2});
		},
		onModifyMovePriority: -5,
		onModifyMove: function (move) {
			if (!move.ignoreImmunity) move.ignoreImmunity = {};
			if (move.ignoreImmunity !== true) {
				move.ignoreImmunity['Fighting'] = true;
				move.ignoreImmunity['Normal'] = true;
			}
		},
	},
	//Mosmero
	mosmicpower: {
		id: "mosmicpower",
		name: "Mosmic Power",
		desc: "Boosts user's Special and Spe by 1 stages on switch in. Also uses Magnet Rise on entry.",
		onStart: function (pokemon) {
			this.boost({spa: 1, spe: 1});
			this.useMove('magnetrise', pokemon);
		},
	},
	// Cubsfan38
	nightowl: {
		id: "nightowl",
		name: "Night Owl",
		desc: "Doubles user's Attack and Speed if the opponent is a ghost or dark type.",
		onModifyAtk: function (atk, pokemon) {
			let target = pokemon.side.foe.active[0];
			if (!target) return;
			if (target.hasType('Ghost') || target.hasType('Dark')) {
				return this.chainModify(2);
			}
		},
		onModifySpe: function (spe, pokemon) {
			let target = pokemon.side.foe.active[0];
			if (!target) return;
			if (target.hasType('Ghost') || target.hasType('Dark')) {
				return this.chainModify(2);
			}
		},
	},
	//bunnery5
	muscles: {
		id: "muscles",
		name: "Muscles",
		desc: "+1 defense, +1 Special defense, -3 attack, +2 special attack on switch in + simple.",
		onStart: function (pokemon) {
			this.boost({atk: -4, def: 1, spa: 2, spd: 1});
		},
		onBoost: function (boost, target, source, effect) {
			if (effect && effect.id === 'zpower') return;
			for (let i in boost) {
				boost[i] *= 2;
			}
		},
	},
	//LycaniumZ
	"supershield": {
		onEffectiveness: function () {
			return -2;
		},
		desc: "All moves are 4x resistant against this pokemon.",
		id: "supershield",
		name: "Super Shield",
	},
	//SnorlaxTheRain
	"scraroom": {
		id: "scraroom",
		name: "Scraroom",
		desc: "Combination of Trick Room & Scrappy",
		shortDesc: "Trick Room + Scrappy",
		onStart: function (pokemon) {
			this.useMove('trickroom', pokemon);
		},
		onModifyMovePriority: -5,
		onModifyMove: function (move) {
			if (!move.ignoreImmunity) move.ignoreImmunity = {};
			if (move.ignoreImmunity !== true) {
				move.ignoreImmunity['Fighting'] = true;
				move.ignoreImmunity['Normal'] = true;
			}
		},
	},
	//Finny
	"clinicaldepression": {
		desc: "This Pokemon has a random stat raised by 2 stages and another stat lowered by 1 stage at the end of each turn.",
		shortDesc: "Raises a random stat by 2 and lowers another stat by 1 at the end of each turn.",
		onResidualOrder: 26,
		onResidualSubOrder: 1,
		onResidual: function (pokemon) {
			let stats = [];
			let boost = {};
			for (let statPlus in pokemon.boosts) {
				if (pokemon.boosts[statPlus] < 6 && statPlus !== 'accuracy' && statPlus !== 'evasion') {
					stats.push(statPlus);
				}
			}
			let randomStat = stats.length ? stats[this.random(stats.length)] : "";
			if (randomStat) boost[randomStat] = 2;

			stats = [];
			for (let statMinus in pokemon.boosts) {
				if (pokemon.boosts[statMinus] > -6 && statMinus !== randomStat && statMinus !== 'accuracy' && statMinus !== 'evasion') {
					stats.push(statMinus);
				}
			}
			randomStat = stats.length ? stats[this.random(stats.length)] : "";
			if (randomStat) boost[randomStat] = -1;

			this.boost(boost);
		},
		id: "clinicaldepression",
		name: "Clinical Depression",
	},
	//Alfastorm
	"addendum": {
		desc: "Causes adjacent opposing Pokemon to lose 7% of their maximum HP, rounded down, at the end of each turn if they are cursed.",
		shortDesc: "Causes cursed adjacent foes to lose 7% of their max HP at the end of each turn.",
		onResidualOrder: 999,
		onResidualSubOrder: 1,
		id: "addendum",
		name: "Addendum",
		onResidual: function (pokemon) {
			if (!pokemon.hp) return;
			for (let i = 0; i < pokemon.side.foe.active.length; i++) {
				let target = pokemon.side.foe.active[i];
				if (!target || !target.hp) continue;
				if (target.volatiles['curse']) {
					this.damage(target.maxhp / 14, target, pokemon);
				}
			}
		},
	},
	//The Dazzler Joe
	speedygonzales: {
		id: "speedygonzales",
		name: "Speedy Gonzales",
		desc: "Boosts user's Speed by 1 stages.",
		onStart: function (pokemon) {
			this.boost({spe: 2});
		},
	},
};
