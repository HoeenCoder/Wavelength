'use strict';

exports.BattleAbilities = {
	//Ashley the Pikachu
	primalsurge: {
		name: 'Primal Surge',
		id: 'primalsurge',
		onStart: function (source) {
			this.setWeather('primordialsea');
			this.setTerrain('electricterrain');
			this.terrainData.duration = 0;
		},
		onModifySpe: function (spe) {
			return this.chainModify(2);
		},
		onAnySetWeather: function (target, source, weather) {
			if (this.getWeather().id === 'primordialsea' && !(weather.id in {desolateland:1, primordialsea:1, deltastream:1})) return false;
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
			this.setTerrain('');
		},
	},
};
