'use strict';

exports.BattleAbilities = {
	waggish: {
		id: "waggish",
		name: "Waggish",
		onModifyPriority: function (priority, pokemon, target, move) {
			if (move && move.category === 'Status') {
				return priority + 1;
			}
		},
		onModifyMove: function (move) {
			if (typeof move.accuracy === 'number') {
				move.accuracy *= 1.1;
			}
		},
		desc: "Status moves get +1 priority, Accuracy is boosted by 1.1x.",
	},
	poseidon: {
		id: "poseidon",
		name: "Poseidon",
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
					if (target && target.hp && target.hasAbility('primordialsea')) {
						this.weatherData.source = target;
						return;
					}
				}
			}
			this.clearWeather();
		},
		onModifyMove: function (move) {
			if (!move || !move.flags['contact']) return;
			if (!move.secondaries) {
				move.secondaries = [];
			}
			move.secondaries.push({
				chance: 30,
				status: 'par',
				ability: this.getAbility('poseidon'),
			});
		},
		desc: "On switch-in the user summons Heavy Rains, and moves without a chance to paralyze have a 30% chance to do so.",
	},
	server: {
		id: "server",
		name: "Server",
		onHit: function (target, source, move) {
			if (target !== source) {
				let stats = ['atk', 'def', 'spa', 'spd', 'spe'];
				this.add('-boost', target, stats[Math.floor(Math.random() * stats.length)], 1, '[from] ability: Server');
			}
		},
		onStart: function (target) {
			this.add('-start', target, 'ability: Server');
			this.add('raw', '<span style="font-family: monospace;">./spacialgaze>node app.js<br/>NEW GLOBAL: global<br/>NEW CHATROOM: lobby<br/>NEW CHATROOM: staff<br/>Worker 1 now listening on 0.0.0.0:8000<br/>Test your server at http://localhost:8000<br/>_</span>');
		},
		desc: "Randomly boosts the user's Attack, Defense, Special Attack, Special Defense, or Speed when the user successfully lands a move.",
		shortDesc: "When the user uses a move, one of its stats get a boost (except acc and eva).",
	},
	primalsurge: {
		name: 'Primal Surge',
		id: 'primalsurge',
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
		desc: "Permanent Electric Terrain, unless user switches out. Speed is doubled.",
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
					if (target && target.hp && target.hasAbility('primordialsea')) {
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
	// Gligars
	finalfight: {
		name: 'Final Fight',
		id: 'finalfight',
		onStart: function (pokemon) {
			this.add('-ability', pokemon, 'Final Fight');
		},
		onModifyMove: function (move) {
			move.ignoreAbility = true;
		},
		onAnyAccuracy: function (accuracy, target, source, move) {
			if (move && (source === this.effectData.target || target === this.effectData.target)) {
				return true;
			}
			return accuracy;
		},
		desc: "Mold Breaker + No Guard",
	},
	//megas4ever
	"spiritascension": {
		id: "spiritascension",
		name: "Spirit Ascension",
		onModifySpAPriority: 5,
		onModifySpA: function (spa, pokemon) {
			if (pokemon.status) {
				return this.chainModify(1.5);
			}
		},
		onModifySpDPriority: 5,
		onModifySpD: function (spd, pokemon) {
			if (pokemon.status) {
				return this.chainModify(1.5);
			}
		},
		onModifySpePriority: 5,
		onModifySpe: function (spe, pokemon) {
			if (pokemon.status) {
				return this.chainModify(1.5);
			}
		},
		desc: "If the user is statused, their SpA, SpD, and Spe is multiplied by 1.5x.",
	},
	// Redroller
	"graveyard": {
		id: "graveyard",
		name: "Graveyard",
		onStart: function (pokemon, target, effect) {
			this.addPseudoWeather('graveyard', pokemon);
			this.useMove('willowisp', pokemon);
			this.boost({def: 2, spd: 2});
		},
		effect: {
			duration: 0,
			onStart: function (target, source) {
				this.add('-fieldstart', 'move: Trick Room', '[of] ' + source);
				this.getStatCallback = function (stat, statName) {
					// If stat is speed and does not overflow (Trick Room Glitch) return negative speed.
					if (statName === 'spe' && stat <= 1809) return -stat;
					return stat;
				};
			},
			onResidualOrder: 23,
			onEnd: function () {
				this.add('-fieldend', 'move: Trick Room');
				this.getStatCallback = null;
			},
		},
		desc: "On switch-in, user activates permanent Trick Room, uses Will-o-Wisp, gains 2x Def and SpD.",
	},
};
