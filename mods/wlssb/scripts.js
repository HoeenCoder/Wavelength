// Custom SpacialGaze scripts.
'use strict';

exports.BattleScripts = {
	//Deny Terrain setting if Ashley is active.
	setTerrain: function (status, source, sourceEffect) {
		status = this.getEffect(status);
		if (this.getTerrain().id === 'electricterrain' && this.terrainData.duration === 0 && status.id !== '') return false;
		if (sourceEffect === undefined && this.effect) sourceEffect = this.effect;
		if (source === undefined && this.event && this.event.target) source = this.event.target;

		if (this.terrain === status.id) return false;
		if (this.terrain && !status.id) {
			let oldstatus = this.getTerrain();
			this.singleEvent('End', oldstatus, this.terrainData, this);
		}
		let prevTerrain = this.terrain;
		let prevTerrainData = this.terrainData;
		this.terrain = status.id;
		this.terrainData = {id: status.id};
		if (source) {
			this.terrainData.source = source;
			this.terrainData.sourcePosition = source.position;
		}
		if (status.duration) {
			this.terrainData.duration = status.duration;
		}
		if (status.durationCallback) {
			this.terrainData.duration = status.durationCallback.call(this, source, sourceEffect);
		}
		if (!this.singleEvent('Start', status, this.terrainData, this, source, sourceEffect)) {
			this.terrain = prevTerrain;
			this.terrainData = prevTerrainData;
			return false;
		}
		return true;
	},
	pokemon: {
		damage(d, source, effect) {
			if (!this.hp) return 0;
			if (d < 1 && d > 0) d = 1;
			d = Math.floor(d);
			if (isNaN(d)) return 0;
			if (d <= 0) return 0;
			this.hp -= d;
			if (this.hp <= 0) {
				d += this.hp;
				if (this.item === 'polkadotbow' && this.species === 'Lycanroc') {
					return this.hp;
				}
				else
					this.faint(source, effect);
			}
			return d;
		},
	},
};
