'use strict';

exports.BattleScripts = {
	gen: 7,
	init: function () {
		for (let i in this.data.Learnsets) {
			this.modData('Learnsets', i).learnset.metronome = ['7M'];
		}
	},
};
