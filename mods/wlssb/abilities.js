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
	conflictofinterest: {
		id: "conflictofinterest",
		name: "Conflict of Interest",
		desc: "Uses Magnet Rise + Heatproof + Ghost & Dark type moves do 0.5x",
		//Since levitate cant be coded in
		onStart: function (pokemon) {
			this.useMove('magnetrise', pokemon);
		},
		//HeatProof and filter other types
		onBasePowerPriority: 7,
		onSourceBasePower: function (basePower, attacker, defender, move) {
			if (move.type === 'Fire' || move.type === 'Ghost' || move.type === 'Dark') {
				return this.chainModify(0.5);
			}
		},
		onDamage: function (damage, target, source, effect) {
			if (effect && effect.id === 'brn') {
				return damage / 2;
			}
		},
	},
	//Insist
	cripplingdepression: {
		id: "cripplingdepression",
		name: "Crippling Depression",
		isNonStandard: true,
		desc: "Primordial Sea + Rain Dish + Swift Swim",
		//primordialseas
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
		//raindish
		onWeather: function (target, source, effect) {
			if (effect.id === 'raindance' || effect.id === 'primordialsea') {
				this.heal(target.maxhp / 16);
			}
		},
		//swiftswim
		onModifySpe: function (spe, pokemon) {
			if (this.isWeather(['raindance', 'primordialsea'])) {
				return this.chainModify(2);
			}
		},
	},
	desertdragon: {
		id: "desertdragon",
		name: "DesertDragon",
		desc: "If the user makes the foe faint, the user gets +2 Atk and Spe",
		onSourceFaint: function (target, source, effect) {
			if (effect && effect.effectType === 'Move') {
				this.boost({atk:2, spe: 2}, source);
			}
		},
	},
	wavecall: {
		desc: "Water Attacks damage is 2x if the user is status'ed or HP is less than 1/2",
		onModifyAtkPriority: 5,
		onModifyAtk: function (atk, pokemon, move, attacker) {
			if (pokemon.status && move.type === 'Water' || move.type === 'Water' && attacker.hp <= attacker.maxhp / 2) {
				return this.chainModify(2);
			}
		},
		id: "wavecall",
		name: "Wave Call",
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
		onModifyAccuracy: function (accuracy, target, source, move) {
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
		desc: "Boosts user's Atk and Spe by 2 stages",
		onStart: function (pokemon) {
			this.boost({atk: 2, spe: 2});
		},
	},
	//Charon Bot
	nodebot: {
		shortDesc: "On switch-in, this Pokemon's Attack and Speed are halved for 3 turns.",
		onStart: function (pokemon) {
			pokemon.addVolatile('nodebot');
		},
		onEnd: function (pokemon) {
			delete pokemon.volatiles['nodebot'];
			this.add('-end', pokemon, 'node bot', '[silent]');
		},
		effect: {
			duration: 3,
			onStart: function (target) {
				this.add('-start', target, 'ability: node bot');
			},
			onModifyAtkPriority: 5,
			onModifyAtk: function (atk, pokemon) {
				return this.chainModify(0.5);
			},
			onModifySpe: function (spe, pokemon) {
				return this.chainModify(0.5);
			},
			onEnd: function (target) {
				this.add('-end', target, 'node bot');
			},
		},
		id: "nodebot",
		name: "node bot",
	},

	//In Tandem with Lycanium Z's Wreck Havoc Move
	virus: {
		shortDesc: "Transforms the pokemon to unown and other odd effects. Gain ability on contact with a pokemon with ability virus.",
		id: "virus",
		name: "Virus",
		onAfterDamage: function (damage, target, source, move) {
			if (source && source !== target && move && move.flags['contact']) {
				let oldAbility = source.setAbility('virus', source, 'virus', true);
				if (oldAbility) {
					this.add('-activate', target, 'ability: Virus', this.getAbility(oldAbility).name, '[of] ' + source);
				}
			}
		},
		onStart: function (source, effect) {
			this.add('-activate', source, 'ability: Virus');
			let template = this.getTemplate('Unown');
			source.formeChange(template);
			source.baseTemplate = template;
			source.ability = "virus";
			source.details = template.species + (source.level === 100 ? '' : ', L' + source.level) + (source.gender === '' ? '' : ', ' + source.gender) + (source.set.shiny ? ', shiny' : '');
			this.add('detailschange', source, source.details);
			source.addVolatile('flinch');
		},
		onBeforeMove: function (pokemon) {
			this.useMove('pound', pokemon);
			return false;
		},
		onSwitchOut: function (pokemon) {
			this.damage(pokemon.maxhp);
		},
	},
};
