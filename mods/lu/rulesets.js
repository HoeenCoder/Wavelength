'use strict';

exports.BattleFormats = {
	standardlu: {
		effectType: 'ValidatorRule',
		name: 'Standard LU',
		desc: ["The standard ruleset for LU."],
		ruleset: ['Status Clause Mod', 'Species Clause', 'Nickname Clause', 'OHKO Clause', 'Moody Clause', 'LU Evasion Moves Clause', 'Endless Battle Clause', 'Cancel Mod'],
		banlist: ['Unreleased', 'Illegal', 'Leppa Berry'],
	},
	luevasionmovesclause: {
		effectType: 'ValidatorRule',
		name: 'Evasion Moves Clause (LU)',
		desc: ["Bans moves that consistently raise the user's evasion when used as well as Acupressure."],
		banlist: ['Minimize', 'Double Team', 'Acupressure'],
		onStart: function () {
			this.add('rule', 'Evasion Moves Clause: Evasion moves are banned');
		},
	},
	statusclausemod: {
		effectType: 'Rule',
		name: 'Status Clause Mod',
		desc: ["Prevents players from inflicting more than three of their opponent's Pok&eacute;mon to a non-volatile status at a time."],
		onStart: function () {
			this.add('rule', 'Status Clause Mod: Limit 3 pokemon to any status at one time');
		},
		onSetStatus: function (status, target, source) {
			if (source && source.side === target.side) {
				return;
			}
			let statuses = 0;
			for (let i = 0; i < target.side.pokemon.length; i++) {
				let pokemon = target.side.pokemon[i];
				if (pokemon.hp && pokemon.status) {
					statuses++;
					if ((!pokemon.statusData.source || pokemon.statusData.source.side !== pokemon.side) && statuses >= 3) {
						this.add('-message', 'Status Clause Mod activated.');
						return false;
					}
				}
			}
		},
	},
};
