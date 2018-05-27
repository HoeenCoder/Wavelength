'use strict';

exports.BattleItems = {
	//Tidal Wave Bot
	guardiansamulet: {
		id: "guardiansamulet",
		name: "Guardian's Amulet",
		onModifyDefPriority: 2,
		onModifyDef: function (def, pokemon) {
			if (pokemon.baseTemplate.nfe) {
				return this.chainModify(1.5);
			}
		},
		onModifySpDPriority: 2,
		onModifySpD: function (spd, pokemon) {
			if (pokemon.baseTemplate.nfe) {
				return this.chainModify(1.5);
			}
		},
		onModifyDamage: function (damage, source, target, move) {
			return this.chainModify([0x14CC, 0x1000]);
		},
		onAfterMoveSecondarySelf: function (source, target, move) {
			if (source && source !== target && move && move.category !== 'Status' && !move.ohko) {
				this.damage(source.maxhp / 10, source, source, this.getItem('lifeorb'));
			}
		},
	},
	// SSBN-640
	"lycantiumz": {
		id: "lycantiumz",
		name: "Lycantium Z",
		spritenum: 689,
		onTakeItem: false,
		zMove: "Going Down",
		zMoveFrom: "ALL Delete",
		zMoveUser: ["Rockruff"],
		desc: "If held by a Rockruff with ALL Delete, it can use Going Down.",
	},
};
