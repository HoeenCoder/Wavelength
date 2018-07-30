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
	"epicberry": {
		id: "epicberry",
		name: "Epic Berry",
		spritenum: 217,
		isBerry: true,
		desc: "Power of a white herb, shuca berry, focus sash and pinch berry.",
		naturalGift: {
			basePower: 120,
			type: "Dark",
		},
		onDamage: function (damage, target, source, effect) {
			if (target.hp === target.maxhp && damage >= target.hp && effect && effect.effectType === 'Move' && !source.volatiles['sash']) {
				source.addVolatile('sash');
				return target.hp - 1;
			}
		},
		onSourceModifyDamage: function (damage, source, target, move) {
			if (move.type === 'Ground' && move.typeMod > 0 && (!target.volatiles['substitute'] || move.flags['authentic'] || (move.infiltrates && this.gen >= 6)) && !source.volatiles['shuca']) {
				this.debug('-50% reduction');
				this.add('-enditem', target, this.effect, '[weaken]');
				source.addVolatile('shuca');
				return this.chainModify(0.5);
			}
		},
		onUpdate: function (pokemon, source) {
			let activate = false;
			let boosts = {};
			for (let i in pokemon.boosts) {
				if (pokemon.boosts[i] < 0) {
					activate = true;
					boosts[i] = 0;
				}
			}
			if (activate && !source.volatiles['herb']) {
				pokemon.setBoost(boosts);
				this.add('-clearnegativeboost', pokemon, '[silent]');
				pokemon.addVolatile('herb');
			}
			if (pokemon.hp <= pokemon.maxhp / 4 || (pokemon.hp <= pokemon.maxhp / 2 && pokemon.hasAbility('gluttony')) && !source.volatiles['med']) {
				this.heal(pokemon.maxhp / 2);
				pokemon.addVolatile('med');
			}
			if (source.volatiles['med'] && source.volatiles['herb'] && source.volatiles['shuca'] && source.volatiles['sash']) {
				pokemon.useItem();
			}
		},
	},
};
