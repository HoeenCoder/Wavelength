'use strict';

/**@type {{[k: string]: ModdedTemplateData}} */
let BattlePokedex = {
	milotic: {
		inherit: true,
		evoType: 'levelExtra',
		evoCondition: 'with high Beauty',
	},
	rotomheat: {
		inherit: true,
		types: ["Electric", "Ghost"],
	},
	rotomwash: {
		inherit: true,
		types: ["Electric", "Ghost"],
	},
	rotomfrost: {
		inherit: true,
		types: ["Electric", "Ghost"],
	},
	rotomfan: {
		inherit: true,
		types: ["Electric", "Ghost"],
	},
	rotommow: {
		inherit: true,
		types: ["Electric", "Ghost"],
	},
};

exports.BattlePokedex = BattlePokedex;
