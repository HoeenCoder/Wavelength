'use strict';

exports.BattleMovedex = {
    "grassyterrain": {
        inherit: true,
        onStart: function (battle, source, effect) {
			if (effect && effect.effectType === 'Ability') {
			    this.effectData.duration = 0;
		    	this.add('-fieldstart', 'move: Grassy Terrain', '[from] ability: ' + effect, '[of] ' + source);
		   	} else {
				this.add('-fieldstart', 'move: Grassy Terrain');
			}
		},
    },
    "electricterrain": {
        inherit: true,
        onStart: function (battle, source, effect) {
			if (effect && effect.effectType === 'Ability') {
			    this.effectData.duration = 0;
				this.add('-fieldstart', 'move: Electric Terrain', '[from] ability: ' + effect, '[of] ' + source);
			} else {   
			    this.add('-fieldstart', 'move: Electric Terrain');
			}
		},
    },
    "psychicterrain": {
        inherit: true,
        onStart: function (battle, source, effect) {
			if (effect && effect.effectType === 'Ability') {
			    this.effectData.duration = 0;
				this.add('-fieldstart', 'move: Psychic Terrain', '[from] ability: ' + effect, '[of] ' + source);
			} else {
			    this.add('-fieldstart', 'move: Psychic Terrain');
			}
		},
    },
    "mistyterrain": {
        inherit: true,
        onStart: function (battle, source, effect) {
			if (effect && effect.effectType === 'Ability') {
			    this.effectData.duration = 0;
				this.add('-fieldstart', 'move: Misty Terrain', '[from] ability: ' + effect, '[of] ' + source);
			} else {
				this.add('-fieldstart', 'move: Misty Terrain');
			}
		},
    },
};
