'use strict';

exports.BattleStatuses = {
	dunsparce: {
		onSwitchInPriority: 101,
		onSwitchIn: function (pokemon) {
			let type = 'Normal';
			if (pokemon.ability === 'multitype') {
				type = pokemon.getItem().onPlate;
				if (!type || type === true) {
					type = 'Normal';
				}
			}
			pokemon.setType(type, true);
		},
	},
};
