'use strict';

let typeSuppressantBerries = ['occaberry', 'wacanberry', 'passhoberry', 'chilanberry', 'chopleberry', 'yacheberry', 'rindoberry', 'kasibberry', 'kebiaberry', 'shucaberry', 'cobaberry', 'chartiberry', 'tangaberry', 'payapaberry', 'habanberry', 'colburberry', 'babiriberry'];

function typeSupBer_Val(pokemon, ability, item) {
	if (typeSuppressantBerries.indexOf(item.id) > -1 && pokemon.ability === 'gluttony') {
		return 0.25;
	} else {
		return 0.5;
	}
}

exports.BattleItems = {
	"aguavberry": {
		id: "aguavberry",
		name: "Aguav Berry",
		isBerry: true,
		inherit: true,
		onUpdate: function (pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 4 || (pokemon.hp <= pokemon.maxhp / 2 && pokemon.hasAbility('gluttony'))) {
				pokemon.eatItem();
			}
		},
		onTryEatItem: function (item, pokemon) {
			if (!this.runEvent('TryHeal', pokemon)) return false;
		},
		onEat: function (pokemon) {
			if (pokemon.hasAbility('gluttony')) this.heal(pokemon.maxhp / 2);
			this.heal(pokemon.maxhp / 2);
			if (pokemon.getNature().minus === 'spd') {
				pokemon.addVolatile('confusion');
			}
		},
		desc: "Restores 1/2 max HP at 1/4 max HP or less; confuses if -SpD Nature. Single use.",
	},
	"apicotberry": {
		id: "apicotberry",
		name: "Apicot Berry",
		isBerry: true,
		inherit: true,
		onUpdate: function (pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 4 || (pokemon.hp <= pokemon.maxhp / 2 && pokemon.hasAbility('gluttony'))) {
				pokemon.eatItem();
			}
		},
		onEat: function (pokemon) {
			if (pokemon.hasAbility('gluttony')) this.boost({spd:1});
			this.boost({spd:1});
		},
		desc: "Raises holder's Sp. Def by 1 stage when at 1/4 max HP or less. Single use.",
	},

	"occaberry": {
		isBerry: true,
		inherit: true,
		onSourceModifyDamage: function (damage, source, target, move) {
			if (move.type === 'Fire' && move.typeMod > 0 && (!target.volatiles['substitute'] || move.flags['authentic'] || (move.infiltrates && this.gen >= 6))) {
				let item = target.getItem();
				if (target.eatItem()) {
					this.debug('-50% reduction');
					this.add('-enditem', target, this.effect, '[weaken]');
					return this.chainModify(typeSupBer_Val(target, target.getAbility(), item));
				}
			}
		},
		onEat: function () {},
		desc: "Halves damage taken from a supereffective Fire-type attack. Single use.",
		shortDesc: "Halves damage taken from a supereffective Fire-type attack. Single use.",
	},
	"passhoberry": {
		isBerry: true,
		inherit: true,
		onSourceModifyDamage: function (damage, source, target, move) {
			let item = target.getItem();
			if (move.type === 'Water' && move.typeMod > 0 && (!target.volatiles['substitute'] || move.flags['authentic'] || (move.infiltrates && this.gen >= 6))) {
				if (target.eatItem()) {
					this.debug('-50% reduction');
					this.add('-enditem', target, this.effect, '[weaken]');
					return this.chainModify(typeSupBer_Val(target, target.getAbility(), item));
				}
			}
		},
		onEat: function () {},
		desc: "Halves damage taken from a supereffective Water-type attack. Single use.",
		shortDesc: "Halves damage taken from a supereffective Water-type attack. Single use.",
	},
	"wacanberry": {
		isBerry: true,
		inherit: true,
		onSourceModifyDamage: function (damage, source, target, move) {
			let item = target.getItem();
			if (move.type === 'Electric' && move.typeMod > 0 && (!target.volatiles['substitute'] || move.flags['authentic'] || (move.infiltrates && this.gen >= 6))) {
				if (target.eatItem()) {
					this.debug('-50% reduction');
					this.add('-enditem', target, this.effect, '[weaken]');
					return this.chainModify(typeSupBer_Val(target, target.getAbility(), item));
				}
			}
		},
		onEat: function () {},
		desc: "Halves damage taken from a supereffective Electric-type attack. Single use.",
		shortDesc: "Halves damage taken from a supereffective Electric-type attack. Single use.",
	},
	"rindoberry": {
		isBerry: true,
		inherit: true,
		onSourceModifyDamage: function (damage, source, target, move) {
			let item = target.getItem();
			if (move.type === 'Grass' && move.typeMod > 0 && (!target.volatiles['substitute'] || move.flags['authentic'] || (move.infiltrates && this.gen >= 6))) {
				if (target.eatItem()) {
					this.debug('-50% reduction');
					this.add('-enditem', target, this.effect, '[weaken]');
					return this.chainModify(typeSupBer_Val(target, target.getAbility(), item));
				}
			}
		},
		onEat: function () {},
		desc: "Halves damage taken from a supereffective Grass-type attack. Single use.",
		shortDesc: "Halves damage taken from a supereffective Grass-type attack. Single use.",
	},
	"yacheberry": {
		isBerry: true,
		inherit: true,
		onSourceModifyDamage: function (damage, source, target, move) {
			let item = target.getItem();
			if (move.type === 'Ice' && move.typeMod > 0 && (!target.volatiles['substitute'] || move.flags['authentic'] || (move.infiltrates && this.gen >= 6))) {
				if (target.eatItem()) {
					this.debug('-50% reduction');
					this.add('-enditem', target, this.effect, '[weaken]');
					return this.chainModify(typeSupBer_Val(target, target.getAbility(), item));
				}
			}
		},
		onEat: function () {},
		desc: "Halves damage taken from a supereffective Ice-type attack. Single use.",
		shortDesc: "Halves damage taken from a supereffective Ice-type attack. Single use.",
	},
	"chopleberry": {
		isBerry: true,
		inherit: true,
		onSourceModifyDamage: function (damage, source, target, move) {
			let item = target.getItem();
			if (move.type === 'Fighting' && move.typeMod > 0 && (!target.volatiles['substitute'] || move.flags['authentic'] || (move.infiltrates && this.gen >= 6))) {
				if (target.eatItem()) {
					this.debug('-50% reduction');
					this.add('-enditem', target, this.effect, '[weaken]');
					return this.chainModify(typeSupBer_Val(target, target.getAbility(), item));
				}
			}
		},
		onEat: function () {},
		desc: "Halves damage taken from a supereffective Fighting-type attack. Single use.",
		shortDesc: "Halves damage taken from a supereffective Fighting-type attack. Single use.",
	},
	"kebiaberry": {
		isBerry: true,
		inherit: true,
		onSourceModifyDamage: function (damage, source, target, move) {
			let item = target.getItem();
			if (move.type === 'Poison' && move.typeMod > 0 && (!target.volatiles['substitute'] || move.flags['authentic'] || (move.infiltrates && this.gen >= 6))) {
				if (target.eatItem()) {
					this.debug('-50% reduction');
					this.add('-enditem', target, this.effect, '[weaken]');
					return this.chainModify(typeSupBer_Val(target, target.getAbility(), item));
				}
			}
		},
		onEat: function () {},
		desc: "Halves damage taken from a supereffective Poison-type attack. Single use.",
		shortDesc: "Halves damage taken from a supereffective Poison-type attack. Single use.",
	},
	"shucaberry": {
		isBerry: true,
		inherit: true,
		onSourceModifyDamage: function (damage, source, target, move) {
			let item = target.getItem();
			if (move.type === 'Ground' && move.typeMod > 0 && (!target.volatiles['substitute'] || move.flags['authentic'] || (move.infiltrates && this.gen >= 6))) {
				if (target.eatItem()) {
					this.debug('-50% reduction');
					this.add('-enditem', target, this.effect, '[weaken]');
					return this.chainModify(typeSupBer_Val(target, target.getAbility(), item));
				}
			}
		},
		onEat: function () {},
		desc: "Halves damage taken from a supereffective Ground-type attack. Single use.",
		shortDesc: "Halves damage taken from a supereffective Ground-type attack. Single use.",
	},
	"cobaberry": {
		isBerry: true,
		inherit: true,
		onSourceModifyDamage: function (damage, source, target, move) {
			let item = target.getItem();
			if (move.type === 'Flying' && move.typeMod > 0 && (!target.volatiles['substitute'] || move.flags['authentic'] || (move.infiltrates && this.gen >= 6))) {
				if (target.eatItem()) {
					this.debug('-50% reduction');
					this.add('-enditem', target, this.effect, '[weaken]');
					return this.chainModify(typeSupBer_Val(target, target.getAbility(), item));
				}
			}
		},
		onEat: function () {},
		desc: "Halves damage taken from a supereffective Flying-type attack. Single use.",
		shortDesc: "Halves damage taken from a supereffective Flying-type attack. Single use.",
	},
	"payapaberry": {
		isBerry: true,
		inherit: true,
		onSourceModifyDamage: function (damage, source, target, move) {
			let item = target.getItem();
			if (move.type === 'Psychic' && move.typeMod > 0 && (!target.volatiles['substitute'] || move.flags['authentic'] || (move.infiltrates && this.gen >= 6))) {
				if (target.eatItem()) {
					this.debug('-50% reduction');
					this.add('-enditem', target, this.effect, '[weaken]');
					return this.chainModify(typeSupBer_Val(target, target.getAbility(), item));
				}
			}
		},
		onEat: function () {},
		desc: "Halves damage taken from a supereffective Psychic-type attack. Single use.",
		shortDesc: "Halves damage taken from a supereffective Psychic-type attack. Single use.",
	},
	"tangaberry": {
		isBerry: true,
		inherit: true,
		onSourceModifyDamage: function (damage, source, target, move) {
			let item = target.getItem();
			if (move.type === 'Bug' && move.typeMod > 0 && (!target.volatiles['substitute'] || move.flags['authentic'] || (move.infiltrates && this.gen >= 6))) {
				if (target.eatItem()) {
					this.debug('-50% reduction');
					this.add('-enditem', target, this.effect, '[weaken]');
					return this.chainModify(typeSupBer_Val(target, target.getAbility(), item));
				}
			}
		},
		onEat: function () {},
		desc: "Halves damage taken from a supereffective Bug-type attack. Single use.",
		shortDesc: "Halves damage taken from a supereffective Bug-type attack. Single use.",
	},
	"chartiberry": {
		isBerry: true,
		inherit: true,
		onSourceModifyDamage: function (damage, source, target, move) {
			let item = target.getItem();
			if (move.type === 'Rock' && move.typeMod > 0 && (!target.volatiles['substitute'] || move.flags['authentic'] || (move.infiltrates && this.gen >= 6))) {
				if (target.eatItem()) {
					this.debug('-50% reduction');
					this.add('-enditem', target, this.effect, '[weaken]');
					return this.chainModify(typeSupBer_Val(target, target.getAbility(), item));
				}
			}
		},
		onEat: function () {},
		desc: "Halves damage taken from a supereffective Rock-type attack. Single use.",
		shortDesc: "Halves damage taken from a supereffective Bug-type attack. Single use.",
	},
	"chilanberry": {
		isBerry: true,
		inherit: true,
		onSourceModifyDamage: function (damage, source, target, move) {
			let item = target.getItem();
			if (move.type === 'Normal' && move.typeMod > 0 && (!target.volatiles['substitute'] || move.flags['authentic'] || (move.infiltrates && this.gen >= 6))) {
				if (target.eatItem()) {
					this.debug('-50% reduction');
					this.add('-enditem', target, this.effect, '[weaken]');
					return this.chainModify(typeSupBer_Val(target, target.getAbility(), item));
				}
			}
		},
		onEat: function () {},
		desc: "Halves damage taken from a supereffective Normal-type attack. Single use.",
		shortDesc: "Halves damage taken from a supereffective Normal-type attack. Single use.",
	},
	"kasibberry": {
		isBerry: true,
		inherit: true,
		onSourceModifyDamage: function (damage, source, target, move) {
			let item = target.getItem();
			if (move.type === 'Ghost' && move.typeMod > 0 && (!target.volatiles['substitute'] || move.flags['authentic'] || (move.infiltrates && this.gen >= 6))) {
				if (target.eatItem()) {
					this.debug('-50% reduction');
					this.add('-enditem', target, this.effect, '[weaken]');
					return this.chainModify(typeSupBer_Val(target, target.getAbility(), item));
				}
			}
		},
		onEat: function () {},
		desc: "Halves damage taken from a supereffective Ghost-type attack. Single use.",
		shortDesc: "Halves damage taken from a supereffective Ghost-type attack. Single use.",
	},
	"habanberry": {
		isBerry: true,
		inherit: true,
		onSourceModifyDamage: function (damage, source, target, move) {
			let item = target.getItem();
			if (move.type === 'Fire' && move.typeMod > 0 && (!target.volatiles['substitute'] || move.flags['authentic'] || (move.infiltrates && this.gen >= 6))) {
				if (target.eatItem()) {
					this.debug('-50% reduction');
					this.add('-enditem', target, this.effect, '[weaken]');
					return this.chainModify(typeSupBer_Val(target, target.getAbility(), item));
				}
			}
		},
		onEat: function () {},
		desc: "Halves damage taken from a supereffective Dragon-type attack. Single use.",
		shortDesc: "Halves damage taken from a supereffective Dragon-type attack. Single use.",
	},
	"colburberry": {
		isBerry: true,
		inherit: true,
		onSourceModifyDamage: function (damage, source, target, move) {
			let item = target.getItem();
			if (move.type === 'Dark' && move.typeMod > 0 && (!target.volatiles['substitute'] || move.flags['authentic'] || (move.infiltrates && this.gen >= 6))) {
				if (target.eatItem()) {
					this.debug('-50% reduction');
					this.add('-enditem', target, this.effect, '[weaken]');
					return this.chainModify(typeSupBer_Val(target, target.getAbility(), item));
				}
			}
		},
		onEat: function () {},
		desc: "Halves damage taken from a supereffective Dark-type attack. Single use.",
		shortDesc: "Halves damage taken from a supereffective Dark-type attack. Single use.",
	},
	"babiriberry": {
		isBerry: true,
		inherit: true,
		onSourceModifyDamage: function (damage, source, target, move) {
			let item = target.getItem();
			if (move.type === 'Steel' && move.typeMod > 0 && (!target.volatiles['substitute'] || move.flags['authentic'] || (move.infiltrates && this.gen >= 6))) {
				if (target.eatItem()) {
					this.debug('-50% reduction');
					this.add('-enditem', target, this.effect, '[weaken]');
					return this.chainModify(typeSupBer_Val(target, target.getAbility(), item));
				}
			}
		},
		onEat: function () {},
		desc: "Halves damage taken from a supereffective Steel-type attack. Single use.",
		shortDesc: "Halves damage taken from a supereffective Steel-type attack. Single use.",
	},
	"roseliberry": {
		isBerry: true,
		inherit: true,
		onSourceModifyDamage: function (damage, source, target, move) {
			let item = target.getItem();
			if (move.type === 'Fairy' && move.typeMod > 0 && (!target.volatiles['substitute'] || move.flags['authentic'] || (move.infiltrates && this.gen >= 6))) {
				if (target.eatItem()) {
					this.debug('-50% reduction');
					this.add('-enditem', target, this.effect, '[weaken]');
					return this.chainModify(typeSupBer_Val(target, target.getAbility(), item));
				}
			}
		},
		onEat: function () {},
		desc: "Halves damage taken from a supereffective Fairy-type attack. Single use.",
		shortDesc: "Halves damage taken from a supereffective Fairy-type attack. Single use.",
	},
	"enigmaberry": {
		id: "enigmaberry",
		name: "Enigma Berry",
		inherit: true,
		onHit: function (target, source, move) {
			if (move && move.typeMod > 0) {
				if (target.eatItem()) {
					if (target.hasAbility('gluttony')) this.heal(target.maxhp / 2);
					this.heal(target.maxhp / 2);
				}
			}
		},
		onTryEatItem: function (item, pokemon) {
			if (!this.runEvent('TryHeal', pokemon)) return false;
		},
		onEat: function () { },
		desc: "Restores 1/2 max HP after holder is hit by a supereffective move. Single use.",
	},
	"figyberry": {
		id: "figyberry",
		name: "Figy Berry",
		inherit: true,
		onUpdate: function (pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 4 || (pokemon.hp <= pokemon.maxhp / 2 && pokemon.hasAbility('gluttony'))) {
				pokemon.eatItem();
			}
		},
		onTryEatItem: function (item, pokemon) {
			if (!this.runEvent('TryHeal', pokemon)) return false;
		},
		onEat: function (pokemon) {
			if (pokemon.hasAbility('gluttony')) this.heal(pokemon.maxhp / 2);
			this.heal(pokemon.maxhp / 2);
			if (pokemon.getNature().minus === 'atk') {
				pokemon.addVolatile('confusion');
			}
		},
		desc: "Restores 1/2 max HP at 1/4 max HP or less; confuses if -Atk Nature. Single use.",
	},
	"ganlonberry": {
		id: "ganlonberry",
		name: "Ganlon Berry",
		inherit: true,
		onUpdate: function (pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 4 || (pokemon.hp <= pokemon.maxhp / 2 && pokemon.hasAbility('gluttony'))) {
				pokemon.eatItem();
			}
		},
		onEat: function (pokemon) {
			if (pokemon.hasAbility('gluttony')) this.boost({def:1});
			this.boost({def:1});
		},
		desc: "Raises holder's Defense by 1 stage when at 1/4 max HP or less. Single use.",
	},
	"iapapaberry": {
		id: "iapapaberry",
		name: "Iapapa Berry",
		inherit: true,
		onUpdate: function (pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 4 || (pokemon.hp <= pokemon.maxhp / 2 && pokemon.hasAbility('gluttony'))) {
				pokemon.eatItem();
			}
		},
		onTryEatItem: function (item, pokemon) {
			if (!this.runEvent('TryHeal', pokemon)) return false;
		},
		onEat: function (pokemon) {
			if (pokemon.hasAbility('gluttony')) this.heal(pokemon.maxhp / 2);
			this.heal(pokemon.maxhp / 2);
			if (pokemon.getNature().minus === 'def') {
				pokemon.addVolatile('confusion');
			}
		},
		desc: "Restores 1/2 max HP at 1/4 max HP or less; confuses if -Def Nature. Single use.",
	},
	"keeberry": {
		id: "keeberry",
		name: "Kee Berry",
		inherit: true,
		onAfterMoveSecondary: function (target, source, move) {
			if (move.category === 'Physical') {
				target.eatItem();
			}
		},
		onEat: function (pokemon) {
			if (pokemon.hasAbility('gluttony')) this.boost({def: 1});
			this.boost({def: 1});
		},
		desc: "Raises holder's Defense by 1 stage after it is hit by a physical attack. Single use.",
	},
	"leppaberry": {
		id: "leppaberry",
		name: "Leppa Berry",
		inherit: true,
		onUpdate: function (pokemon) {
			if (!pokemon.hp) return;
			let move = pokemon.getMoveData(pokemon.lastMove);
			if (move && move.pp === 0) {
				pokemon.addVolatile('leppaberry');
				pokemon.volatiles['leppaberry'].move = move;
				pokemon.eatItem();
			}
		},
		onEat: function (pokemon) {
			let move;
			if (pokemon.volatiles['leppaberry']) {
				move = pokemon.volatiles['leppaberry'].move;
				pokemon.removeVolatile('leppaberry');
			} else {
				let pp = 99;
				for (let moveid in pokemon.moveset) {
					if (pokemon.moveset[moveid].pp < pp) {
						move = pokemon.moveset[moveid];
						pp = move.pp;
					}
				}
			}
			move.pp += 10;
			if (pokemon.hasAbility('gluttony')) move.pp += 10;
			if (move.pp > move.maxpp) move.pp = move.maxpp;
			this.add('-activate', pokemon, 'item: Leppa Berry', move.move);
			if (pokemon.item !== 'leppaberry') {
				let foeActive = pokemon.side.foe.active;
				let foeIsStale = false;
				for (let i = 0; i < foeActive.length; i++) {
					if (foeActive[i].hp && foeActive[i].isStale >= 2) {
						foeIsStale = true;
						break;
					}
				}
				if (!foeIsStale) return;
			}
			pokemon.isStale = 2;
			pokemon.isStaleSource = 'useleppa';
		},
		desc: "Restores 20 PP to the first of the holder's moves to reach 0 PP. Single use.",
	},
	"liechiberry": {
		id: "liechiberry",
		name: "Liechi Berry",
		inherit: true,
		onUpdate: function (pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 4 || (pokemon.hp <= pokemon.maxhp / 2 && pokemon.hasAbility('gluttony'))) {
				pokemon.eatItem();
			}
		},
		onEat: function (pokemon) {
			if (pokemon.hasAbility('gluttony')) this.boost({atk:1});
			this.boost({atk:1});
		},
		desc: "Raises holder's Attack by 2 stages when at 1/4 max HP or less. Single use.",
	},
	"magoberry": {
		id: "magoberry",
		name: "Mago Berry",
		inherit: true,
		onUpdate: function (pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 4 || (pokemon.hp <= pokemon.maxhp / 2 && pokemon.hasAbility('gluttony'))) {
				pokemon.eatItem();
			}
		},
		onTryEatItem: function (item, pokemon) {
			if (!this.runEvent('TryHeal', pokemon)) return false;
		},
		onEat: function (pokemon) {
			if (pokemon.hasAbility('gluttony')) this.heal(pokemon.maxhp / 2);
			this.heal(pokemon.maxhp / 2);
			if (pokemon.getNature().minus === 'spe') {
				pokemon.addVolatile('confusion');
			}
		},
		desc: "Restores 1/2 max HP at 1/4 max HP or less; confuses if -Spe Nature. Single use.",
	},
	"marangaberry": {
		id: "marangaberry",
		name: "Maranga Berry",
		inherit: true,
		onAfterMoveSecondary: function (target, source, move) {
			if (move.category === 'Special') {
				target.eatItem();
			}
		},
		onEat: function (pokemon) {
			if (pokemon.hasAbility('gluttony')) this.boost({spd: 1});
			this.boost({spd: 1});
		},
		desc: "Raises holder's Sp. Def by 1 stage after it is hit by a special attack. Single use.",
	},
	"micleberry": {
		id: "micleberry",
		name: "Micle Berry",
		inherit: true,
		onResidual: function (pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 4 || (pokemon.hp <= pokemon.maxhp / 2 && pokemon.hasAbility('gluttony'))) {
				pokemon.eatItem();
			}
		},
		onEat: function (pokemon) {
			pokemon.addVolatile('micleberry');
		},
		effect: {
			duration: 2,
			onSourceModifyAccuracy: function (accuracy, target, source) {
				this.add('-enditem', source, 'Micle Berry');
				source.removeVolatile('micleberry');
				if (typeof accuracy === 'number') {
					if (source.hasAbility('gluttony')) return accuracy * (1.2 * 2);
					return accuracy * 1.2;
				}
			},
		},
		desc: "Holder's next move has 1.2x accuracy when at 1/4 max HP or less. Single use.",
	},
	"oranberry": {
		id: "oranberry",
		name: "Oran Berry",
		inherit: true,
		onUpdate: function (pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 2) {
				pokemon.eatItem();
			}
		},
		onTryEatItem: function (item, pokemon) {
			if (!this.runEvent('TryHeal', pokemon)) return false;
		},
		onEat: function (pokemon) {
			if (pokemon.hasAbility('gluttony')) this.heal(10);
			this.heal(10);
		},
		desc: "Restores 10 HP when at 1/2 max HP or less. Single use.",
	},
	"petayaberry": {
		id: "petayaberry",
		name: "Petaya Berry",
		inherit: true,
		onUpdate: function (pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 4 || (pokemon.hp <= pokemon.maxhp / 2 && pokemon.hasAbility('gluttony'))) {
				pokemon.eatItem();
			}
		},
		onEat: function (pokemon) {
			if (pokemon.hasAbility('gluttony')) this.boost({spa: 1});
			this.boost({spa:1});
		},
		desc: "Raises holder's Sp. Atk by 1 stage when at 1/4 max HP or less. Single use.",
	},
	"rowapberry": {
		id: "rowapberry",
		name: "Rowap Berry",
		inherit: true,
		onAfterDamage: function (damage, target, source, move) {
			if (source && source !== target && move && move.category === 'Special') {
				if (target.eatItem()) {
					if (target.hasAbility('gluttony')) this.damage(source.maxhp / 8, source, target);
					this.damage(source.maxhp / 8, source, target);
				}
			}
		},
		onEat: function () { },
		desc: "If holder is hit by a special move, attacker loses 1/8 of its max HP. Single use.",
	},
	"salacberry": {
		id: "salacberry",
		name: "Salac Berry",
		inherit: true,
		onUpdate: function (pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 4 || (pokemon.hp <= pokemon.maxhp / 2 && pokemon.hasAbility('gluttony'))) {
				pokemon.eatItem();
			}
		},
		onEat: function (pokemon) {
			if (pokemon.hasAbility('gluttony')) this.boost({spe: 1});
			this.boost({spe:1});
		},
		desc: "Raises holder's Speed by 1 stage when at 1/4 max HP or less. Single use.",
	},
	"sitrusberry": {
		id: "sitrusberry",
		name: "Sitrus Berry",
		inherit: true,
		onUpdate: function (pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 2) {
				pokemon.eatItem();
			}
		},
		onTryEatItem: function (item, pokemon) {
			if (!this.runEvent('TryHeal', pokemon)) return false;
		},
		onEat: function (pokemon) {
			if (pokemon.hasAbility('gluttony')) this.heal(pokemon.maxhp / 4);
			this.heal(pokemon.maxhp / 4);
		},
		desc: "Restores 1/4 max HP when at 1/2 max HP or less. Single use.",
	},
	"starfberry": {
		id: "starfberry",
		name: "Starf Berry",
		inherit: true,
		onUpdate: function (pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 4 || (pokemon.hp <= pokemon.maxhp / 2 && pokemon.hasAbility('gluttony'))) {
				pokemon.eatItem();
			}
		},
		onEat: function (pokemon) {
			let stats = [];
			for (let stat in pokemon.boosts) {
				if (stat !== 'accuracy' && stat !== 'evasion' && pokemon.boosts[stat] < 6) {
					stats.push(stat);
				}
			}
			if (stats.length) {
				let randomStat = stats[this.random(stats.length)];
				let boost = {};
				boost[randomStat] = 2;
				if (pokemon.hasAbility('gluttony')) boost[randomStat] = 4;
				this.boost(boost);
			}
		},
		desc: "Raises a random stat by 4 stages when at 1/4 max HP or less (not acc/eva). Single use.",
	},
	"wikiberry": {
		id: "wikiberry",
		name: "Wiki Berry",
		inherit: true,
		onUpdate: function (pokemon) {
			if (pokemon.hp <= pokemon.maxhp / 4 || (pokemon.hp <= pokemon.maxhp / 2 && pokemon.hasAbility('gluttony'))) {
				pokemon.eatItem();
			}
		},
		onTryEatItem: function (item, pokemon) {
			if (!this.runEvent('TryHeal', pokemon)) return false;
		},
		onEat: function (pokemon) {
			if (pokemon.hasAbility('gluttony')) this.heal(pokemon.maxhp / 2);
			this.heal(pokemon.maxhp / 2);
			if (pokemon.getNature().minus === 'spa') {
				pokemon.addVolatile('confusion');
			}
		},
		desc: "Restores 1/2 max HP at 1/4 max HP or less; confuses if -SpA Nature. Single use.",
	},
	"souldew": {
		inherit: true,
		onModifySpAPriority: 1,
		onModifySpA: function (spa, pokemon) {
			if (pokemon.hasType('Psychic')) {
				return this.chainModify([0x1333, 0x1000]);
			}
		},
		onModifySpDPriority: 2,
		onModifySpD: function (spd, pokemon) {
			if (pokemon.hasType('Psychic')) {
				return this.chainModify([0x1333, 0x1000]);
			}
		},
		desc: "If holder's a Psychic Type, its Special Attack and Special Defense is raised by 1.2x. If holder's a Latias/Latios, its Dragon- and Psychic-type moves have 1.2x power.",
		shortDesc: "If holder's a Psychic Type, its Special Attack and Special Defense is raised by 1.2x. If holder's a Latias/Latios, its Dragon- and Psychic-type moves have 1.2x power.",
	},
	"lightball": {
		inherit: true,
		onModifySpAPriority: 1,
		onModifySpA: function (spa, pokemon) {
			if (pokemon.hasType('Electric')) {
				return this.chainModify(1.1);
			}
			if (pokemon.baseTemplate.baseSpecies === 'Pikachu' || pokemon.baseTemplate.baseSpecies === 'Raichu' || pokemon.baseTemplate.baseSpecies === 'Pichu' || pokemon.baseTemplate.baseSpecies === 'Plusle' || pokemon.baseTemplate.baseSpecies === 'Minun' || pokemon.baseTemplate.baseSpecies === 'Dedenne' || pokemon.baseTemplate.baseSpecies === 'Emolga' || pokemon.baseTemplate.baseSpecies === 'Pachirisu') {
				return this.chainModify(1.4);
			}
		},
		onModifyAtk: function (atk, pokemon) {
			if (pokemon.hasType('Electric')) {
				return this.chainModify(1.1);
			}
			if (pokemon.baseTemplate.baseSpecies === 'Pikachu' || pokemon.baseTemplate.baseSpecies === 'Raichu' || pokemon.baseTemplate.baseSpecies === 'Pichu' || pokemon.baseTemplate.baseSpecies === 'Plusle' || pokemon.baseTemplate.baseSpecies === 'Minun' || pokemon.baseTemplate.baseSpecies === 'Dedenne' || pokemon.baseTemplate.baseSpecies === 'Emolga' || pokemon.baseTemplate.baseSpecies === 'Pachirisu') {
				return this.chainModify(1.4);
			}
		},
		onModifySpe: function (spe, pokemon) {
			if (pokemon.hasType('Electric')) {
				return this.chainModify(1.1);
			}
		},
		desc: "Light Ball now increases the Attack, Special Attack and Speed of all Electric type Pokemon by 1.1x. If the holder is anyone in the Pikachu evolution line, Plusle/Minun, Pachirisu, Emolga or Dedenne, all of their attacks do 1.4x extra damage.",
		shortDesc: "Light Ball now increases the Attack, Special Attack and Speed of all Electric type Pokemon by 1.1x. If the holder is anyone in the Pikachu evolution line, Plusle/Minun, Pachirisu, Emolga or Dedenne, all of their attacks do 1.4x extra damage.",
	},
	"thickclub": {
		inherit: true,
		onModifySpAPriority: 1,
		onModifySpA: function (spa, pokemon) {
			if (pokemon.hasType('Ground')) {
				return this.chainModify(1.3);
			}
			if (pokemon.baseTemplate.baseSpecies === 'Riolu' || pokemon.baseTemplate.baseSpecies === 'Lucario') {
				return this.chainModify(1.3);
			}
			if (pokemon.baseTemplate.baseSpecies === 'Cubone' || pokemon.baseTemplate.baseSpecies === 'Marowak') {
				return this.chainModify(2);
			}
		},
		onModifyAtk: function (atk, pokemon) {
			if (pokemon.hasType('Ground')) {
				return this.chainModify(1.3);
			}
			if (pokemon.baseTemplate.baseSpecies === 'Riolu' || pokemon.baseTemplate.baseSpecies === 'Lucario') {
				return this.chainModify(1.3);
			}
			if (pokemon.baseTemplate.baseSpecies === 'Cubone' || pokemon.baseTemplate.baseSpecies === 'Marowak') {
				return this.chainModify(2);
			}
		},
		desc: "Thick Club now increases the attack of all Ground type Pokemon and Riolu/Lucario by 1.3x. If the holder is a Cubone or Marowak, it's attack is doubled.",
		shortDesc: "Thick Club now increases the attack of all Ground type Pokemon and Riolu/Lucario by 1.3x. If the holder is a Cubone or Marowak, it's attack is doubled.",
	},
	"metalcoat": {
		onModifyDefPriority: 1,
		onModifyDef: function (def, pokemon) {
			if (pokemon.hasType('Steel')) {
				return this.chainModify(2);
			}
		},
		onStart: function (pokemon) {
			this.boost({spe: -1});
		},
		onTakeItem: false,
		inherit: true,
		desc: "Metal Coat now doubles the Defense of all Steel-type Pokemon who hold this. It cannot be knocked off. It retains it's usual effect of increasing the attacking power of Steel-type attacks by 1.2x. The Speed of the holder is decreased by one stage while holding it.",
		shortDesc: "Metal Coat now doubles the Defense of all Steel-type Pokemon who hold this. It cannot be knocked off. It retains it's usual effect of increasing the attacking power of Steel-type attacks by 1.2x. The Speed of the holder is decreased by one stage while holding it.",
	},
	"scopelens": {
		inherit: true,
		onStart: function (pokemon) {
			this.boost({accuracy: 1});
		},
		desc: "Scope Lens now increases accuracy by one stage in addition to it's usual effect.",
		shortDesc: "Scope Lens now increases accuracy by one stage in addition to it's usual effect.",
	},
	"razorclaw": {
		inherit: true,
		onModifyDamage: function (damage, target, source, move) {
			if (move.flags['contact']) {
				this.chainModify(1.2);
			}
		},
		desc: "Holder's critical hit ratio is raised by 1 stage; holder's contact moves deal 1.2x more damage.",
	},
	"skyplate": {
		inherit: true,
		onTakeItem: function (item, pokemon, source) {
			if ((source && source.baseTemplate.num === 493) || pokemon.baseTemplate.num === 493 || (source && source.baseTemplate.num === 206) || pokemon.baseTemplate.num === 206) {
				return false;
			}
			return true;
		},
		onStart: function (pokemon) {
			if (pokemon.baseTemplate.baseSpecies === 'Arceus' || pokemon.baseTemplate.baseSpecies === 'Dunsparce') {
				let stats = [];
				for (let stat in pokemon.boosts) {
					if (stat !== 'accuracy' && stat !== 'evasion') {
						stats.push(stat);
					}
				}
				if (stats.length) {
					let randomStat = stats[this.random(stats.length)];
					let boost = {};
					boost[randomStat] = 1.5;
					return this.chainModify(boost);
				}
				this.add('-activate', pokemon, 'item: Sky Plate');
			}
		},
		desc: "Holder's Flying-type attacks have 1.2x power. Judgment is Flying type. If the holder is an Arceus or a Dunsparce, this Pokemon has a random stat raised by one stage.",
	},
	"toxicplate": {
		inherit: true,
		onTakeItem: function (item, pokemon, source) {
			if ((source && source.baseTemplate.num === 493) || pokemon.baseTemplate.num === 493 || (source && source.baseTemplate.num === 206) || pokemon.baseTemplate.num === 206) {
				return false;
			}
			return true;
		},
		onStart: function (pokemon) {
			if (pokemon.baseTemplate.baseSpecies === 'Arceus' || pokemon.baseTemplate.baseSpecies === 'Dunsparce') {
				let stats = [];
				for (let stat in pokemon.boosts) {
					if (stat !== 'accuracy' && stat !== 'evasion') {
						stats.push(stat);
					}
				}
				if (stats.length) {
					let randomStat = stats[this.random(stats.length)];
					let boost = {};
					boost[randomStat] = 1.5;
					return this.chainModify(boost);
				}
				this.add('-activate', pokemon, 'item: Toxic Plate');
			}
		},
		desc: "Holder's Poison-type attacks have 1.2x power. Judgment is Poison type. If the holder is an Arceus or a Dunsparce, this Pokemon has a random stat raised by one stage.",
	},
	"dracoplate": {
		inherit: true,
		onTakeItem: function (item, pokemon, source) {
			if ((source && source.baseTemplate.num === 493) || pokemon.baseTemplate.num === 493 || (source && source.baseTemplate.num === 206) || pokemon.baseTemplate.num === 206) {
				return false;
			}
			return true;
		},
		onStart: function (pokemon) {
			if (pokemon.baseTemplate.baseSpecies === 'Arceus' || pokemon.baseTemplate.baseSpecies === 'Dunsparce') {
				let stats = [];
				for (let stat in pokemon.boosts) {
					if (stat !== 'accuracy' && stat !== 'evasion') {
						stats.push(stat);
					}
				}
				if (stats.length) {
					let randomStat = stats[this.random(stats.length)];
					let boost = {};
					boost[randomStat] = 1.5;
					return this.chainModify(boost);
				}
				this.add('-activate', pokemon, 'item: Draco Plate');
			}
		},
		desc: "Holder's Dragon-type attacks have 1.2x power. Judgment is Dragon type. If the holder is an Arceus or a Dunsparce, this Pokemon has a random stat raised by one stage.",
	},
	"meadowplate": {
		inherit: true,
		onTakeItem: function (item, pokemon, source) {
			if ((source && source.baseTemplate.num === 493) || pokemon.baseTemplate.num === 493 || (source && source.baseTemplate.num === 206) || pokemon.baseTemplate.num === 206) {
				return false;
			}
			return true;
		},
		onStart: function (pokemon) {
			if (pokemon.baseTemplate.baseSpecies === 'Arceus' || pokemon.baseTemplate.baseSpecies === 'Dunsparce') {
				let stats = [];
				for (let stat in pokemon.boosts) {
					if (stat !== 'accuracy' && stat !== 'evasion') {
						stats.push(stat);
					}
				}
				if (stats.length) {
					let randomStat = stats[this.random(stats.length)];
					let boost = {};
					boost[randomStat] = 1.5;
					return this.chainModify(boost);
				}
				this.add('-activate', pokemon, 'item: Meadow Plate');
			}
		},
		desc: "Holder's Grass-type attacks have 1.2x power. Judgment is Grass type. If the holder is an Arceus or a Dunsparce, this Pokemon has a random stat raised by one stage.",
	},
	"ironplate": {
		inherit: true,
		onTakeItem: function (item, pokemon, source) {
			if ((source && source.baseTemplate.num === 493) || pokemon.baseTemplate.num === 493 || (source && source.baseTemplate.num === 206) || pokemon.baseTemplate.num === 206) {
				return false;
			}
			return true;
		},
		onStart: function (pokemon) {
			if (pokemon.baseTemplate.baseSpecies === 'Arceus' || pokemon.baseTemplate.baseSpecies === 'Dunsparce') {
				let stats = [];
				for (let stat in pokemon.boosts) {
					if (stat !== 'accuracy' && stat !== 'evasion') {
						stats.push(stat);
					}
				}
				if (stats.length) {
					let randomStat = stats[this.random(stats.length)];
					let boost = {};
					boost[randomStat] = 1.5;
					return this.chainModify(boost);
				}
				this.add('-activate', pokemon, 'item: Iron Plate');
			}
		},
		desc: "Holder's Steel-type attacks have 1.2x power. Judgment is Steel type. If the holder is an Arceus or a Dunsparce, this Pokemon has a random stat raised by one stage.",
	},
	"flameplate": {
		inherit: true,
		onTakeItem: function (item, pokemon, source) {
			if ((source && source.baseTemplate.num === 493) || pokemon.baseTemplate.num === 493 || (source && source.baseTemplate.num === 206) || pokemon.baseTemplate.num === 206) {
				return false;
			}
			return true;
		},
		onStart: function (pokemon) {
			if (pokemon.baseTemplate.baseSpecies === 'Arceus' || pokemon.baseTemplate.baseSpecies === 'Dunsparce') {
				let stats = [];
				for (let stat in pokemon.boosts) {
					if (stat !== 'accuracy' && stat !== 'evasion') {
						stats.push(stat);
					}
				}
				if (stats.length) {
					let randomStat = stats[this.random(stats.length)];
					let boost = {};
					boost[randomStat] = 1.5;
					return this.chainModify(boost);
				}
				this.add('-activate', pokemon, 'item: Flame Plate');
			}
		},
		desc: "Holder's Fire-type attacks have 1.2x power. Judgment is Fire type. If the holder is an Arceus or a Dunsparce, this Pokemon has a random stat raised by one stage.",
	},
	"pixieplate": {
		inherit: true,
		onTakeItem: function (item, pokemon, source) {
			if ((source && source.baseTemplate.num === 493) || pokemon.baseTemplate.num === 493 || (source && source.baseTemplate.num === 206) || pokemon.baseTemplate.num === 206) {
				return false;
			}
			return true;
		},
		onStart: function (pokemon) {
			if (pokemon.baseTemplate.baseSpecies === 'Arceus' || pokemon.baseTemplate.baseSpecies === 'Dunsparce') {
				let stats = [];
				for (let stat in pokemon.boosts) {
					if (stat !== 'accuracy' && stat !== 'evasion') {
						stats.push(stat);
					}
				}
				if (stats.length) {
					let randomStat = stats[this.random(stats.length)];
					let boost = {};
					boost[randomStat] = 1.5;
					return this.chainModify(boost);
				}
				this.add('-activate', pokemon, 'item: Pixie Plate');
			}
		},
		desc: "Holder's Fairy-type attacks have 1.2x power. Judgment is Fairy type. If the holder is an Arceus or a Dunsparce, this Pokemon has a random stat raised by one stage.",
	},
	"mindplate": {
		inherit: true,
		onTakeItem: function (item, pokemon, source) {
			if ((source && source.baseTemplate.num === 493) || pokemon.baseTemplate.num === 493 || (source && source.baseTemplate.num === 206) || pokemon.baseTemplate.num === 206) {
				return false;
			}
			return true;
		},
		onStart: function (pokemon) {
			if (pokemon.baseTemplate.baseSpecies === 'Arceus' || pokemon.baseTemplate.baseSpecies === 'Dunsparce') {
				let stats = [];
				for (let stat in pokemon.boosts) {
					if (stat !== 'accuracy' && stat !== 'evasion') {
						stats.push(stat);
					}
				}
				if (stats.length) {
					let randomStat = stats[this.random(stats.length)];
					let boost = {};
					boost[randomStat] = 1.5;
					return this.chainModify(boost);
				}
				this.add('-activate', pokemon, 'item: Mind Plate');
			}
		},
		desc: "Holder's Psychic-type attacks have 1.2x power. Judgment is Psychic type. If the holder is an Arceus or a Dunsparce, this Pokemon has a random stat raised by one stage.",
	},
	"insectplate": {
		inherit: true,
		onTakeItem: function (item, pokemon, source) {
			if ((source && source.baseTemplate.num === 493) || pokemon.baseTemplate.num === 493 || (source && source.baseTemplate.num === 206) || pokemon.baseTemplate.num === 206) {
				return false;
			}
			return true;
		},
		onStart: function (pokemon) {
			if (pokemon.baseTemplate.baseSpecies === 'Arceus' || pokemon.baseTemplate.baseSpecies === 'Dunsparce') {
				let stats = [];
				for (let stat in pokemon.boosts) {
					if (stat !== 'accuracy' && stat !== 'evasion') {
						stats.push(stat);
					}
				}
				if (stats.length) {
					let randomStat = stats[this.random(stats.length)];
					let boost = {};
					boost[randomStat] = 1.5;
					return this.chainModify(boost);
				}
				this.add('-activate', pokemon, 'item: Insect Plate');
			}
		},
		desc: "Holder's Bug-type attacks have 1.2x power. Judgment is Bug type. If the holder is an Arceus or a Dunsparce, this Pokemon has a random stat raised by one stage.",
	},
	"icicleplate": {
		inherit: true,
		onTakeItem: function (item, pokemon, source) {
			if ((source && source.baseTemplate.num === 493) || pokemon.baseTemplate.num === 493 || (source && source.baseTemplate.num === 206) || pokemon.baseTemplate.num === 206) {
				return false;
			}
			return true;
		},
		onStart: function (pokemon) {
			if (pokemon.baseTemplate.baseSpecies === 'Arceus' || pokemon.baseTemplate.baseSpecies === 'Dunsparce') {
				let stats = [];
				for (let stat in pokemon.boosts) {
					if (stat !== 'accuracy' && stat !== 'evasion') {
						stats.push(stat);
					}
				}
				if (stats.length) {
					let randomStat = stats[this.random(stats.length)];
					let boost = {};
					boost[randomStat] = 1.5;
					return this.chainModify(boost);
				}
				this.add('-activate', pokemon, 'item: Icicle Plate');
			}
		},
		desc: "Holder's Ice-type attacks have 1.2x power. Judgment is Ice type. If the holder is an Arceus or a Dunsparce, this Pokemon has a random stat raised by one stage.",
	},
	"fistplate": {
		inherit: true,
		onTakeItem: function (item, pokemon, source) {
			if ((source && source.baseTemplate.num === 493) || pokemon.baseTemplate.num === 493 || (source && source.baseTemplate.num === 206) || pokemon.baseTemplate.num === 206) {
				return false;
			}
			return true;
		},
		onStart: function (pokemon) {
			if (pokemon.baseTemplate.baseSpecies === 'Arceus' || pokemon.baseTemplate.baseSpecies === 'Dunsparce') {
				let stats = [];
				for (let stat in pokemon.boosts) {
					if (stat !== 'accuracy' && stat !== 'evasion') {
						stats.push(stat);
					}
				}
				if (stats.length) {
					let randomStat = stats[this.random(stats.length)];
					let boost = {};
					boost[randomStat] = 1.5;
					return this.chainModify(boost);
				}
				this.add('-activate', pokemon, 'item: Fist Plate');
			}
		},
		desc: "Holder's Fighting-type attacks have 1.2x power. Judgment is Fighting type. If the holder is an Arceus or a Dunsparce, this Pokemon has a random stat raised by one stage.",
	},
	"earthplate": {
		inherit: true,
		onTakeItem: function (item, pokemon, source) {
			if ((source && source.baseTemplate.num === 493) || pokemon.baseTemplate.num === 493 || (source && source.baseTemplate.num === 206) || pokemon.baseTemplate.num === 206) {
				return false;
			}
			return true;
		},
		onStart: function (pokemon) {
			if (pokemon.baseTemplate.baseSpecies === 'Arceus' || pokemon.baseTemplate.baseSpecies === 'Dunsparce') {
				let stats = [];
				for (let stat in pokemon.boosts) {
					if (stat !== 'accuracy' && stat !== 'evasion') {
						stats.push(stat);
					}
				}
				if (stats.length) {
					let randomStat = stats[this.random(stats.length)];
					let boost = {};
					boost[randomStat] = 1.5;
					return this.chainModify(boost);
				}
				this.add('-activate', pokemon, 'item: Earth Plate');
			}
		},
		desc: "Holder's Ground-type attacks have 1.2x power. Judgment is Ground type. If the holder is an Arceus or a Dunsparce, this Pokemon has a random stat raised by one stage.",
	},
	"dreadplate": {
		inherit: true,
		onTakeItem: function (item, pokemon, source) {
			if ((source && source.baseTemplate.num === 493) || pokemon.baseTemplate.num === 493 || (source && source.baseTemplate.num === 206) || pokemon.baseTemplate.num === 206) {
				return false;
			}
			return true;
		},
		onStart: function (pokemon) {
			if (pokemon.baseTemplate.baseSpecies === 'Arceus' || pokemon.baseTemplate.baseSpecies === 'Dunsparce') {
				let stats = [];
				for (let stat in pokemon.boosts) {
					if (stat !== 'accuracy' && stat !== 'evasion') {
						stats.push(stat);
					}
				}
				if (stats.length) {
					let randomStat = stats[this.random(stats.length)];
					let boost = {};
					boost[randomStat] = 1.5;
					return this.chainModify(boost);
				}
				this.add('-activate', pokemon, 'item: Dread Plate');
			}
		},
		desc: "Holder's Dark-type attacks have 1.2x power. Judgment is Dark type. If the holder is an Arceus or a Dunsparce, this Pokemon has a random stat raised by one stage.",
	},
	"splashplate": {
		inherit: true,
		onTakeItem: function (item, pokemon, source) {
			if ((source && source.baseTemplate.num === 493) || pokemon.baseTemplate.num === 493 || (source && source.baseTemplate.num === 206) || pokemon.baseTemplate.num === 206) {
				return false;
			}
			return true;
		},
		onStart: function (pokemon) {
			if (pokemon.baseTemplate.baseSpecies === 'Arceus' || pokemon.baseTemplate.baseSpecies === 'Dunsparce') {
				let stats = [];
				for (let stat in pokemon.boosts) {
					if (stat !== 'accuracy' && stat !== 'evasion') {
						stats.push(stat);
					}
				}
				if (stats.length) {
					let randomStat = stats[this.random(stats.length)];
					let boost = {};
					boost[randomStat] = 1.5;
					return this.chainModify(boost);
				}
				this.add('-activate', pokemon, 'item: Splash Plate');
			}
		},
		desc: "Holder's Water-type attacks have 1.2x power. Judgment is Water type. If the holder is an Arceus or a Dunsparce, this Pokemon has a random stat raised by one stage.",
	},
	"spookyplate": {
		inherit: true,
		onTakeItem: function (item, pokemon, source) {
			if ((source && source.baseTemplate.num === 493) || pokemon.baseTemplate.num === 493 || (source && source.baseTemplate.num === 206) || pokemon.baseTemplate.num === 206) {
				return false;
			}
			return true;
		},
		onStart: function (pokemon) {
			if (pokemon.baseTemplate.baseSpecies === 'Arceus' || pokemon.baseTemplate.baseSpecies === 'Dunsparce') {
				let stats = [];
				for (let stat in pokemon.boosts) {
					if (stat !== 'accuracy' && stat !== 'evasion') {
						stats.push(stat);
					}
				}
				if (stats.length) {
					let randomStat = stats[this.random(stats.length)];
					let boost = {};
					boost[randomStat] = 1.5;
					return this.chainModify(boost);
				}
				this.add('-activate', pokemon, 'item: Spooky Plate');
			}
		},
		desc: "Holder's Ghost-type attacks have 1.2x power. Judgment is Ghost type. If the holder is an Arceus or a Dunsparce, this Pokemon has a random stat raised by one stage.",
	},
	"stoneplate": {
		inherit: true,
		onTakeItem: function (item, pokemon, source) {
			if ((source && source.baseTemplate.num === 493) || pokemon.baseTemplate.num === 493 || (source && source.baseTemplate.num === 206) || pokemon.baseTemplate.num === 206) {
				return false;
			}
			return true;
		},
		onStart: function (pokemon) {
			if (pokemon.baseTemplate.baseSpecies === 'Arceus' || pokemon.baseTemplate.baseSpecies === 'Dunsparce') {
				let stats = [];
				for (let stat in pokemon.boosts) {
					if (stat !== 'accuracy' && stat !== 'evasion') {
						stats.push(stat);
					}
				}
				if (stats.length) {
					let randomStat = stats[this.random(stats.length)];
					let boost = {};
					boost[randomStat] = 1.5;
					return this.chainModify(boost);
				}
				this.add('-activate', pokemon, 'item: Stone Plate');
			}
		},
		desc: "Holder's Rock-type attacks have 1.2x power. Judgment is Rock type. If the holder is an Arceus or a Dunsparce, this Pokemon has a random stat raised by one stage.",
	},
	"zapplate": {
		inherit: true,
		onTakeItem: function (item, pokemon, source) {
			if ((source && source.baseTemplate.num === 493) || pokemon.baseTemplate.num === 493 || (source && source.baseTemplate.num === 206) || pokemon.baseTemplate.num === 206) {
				return false;
			}
			return true;
		},
		onStart: function (pokemon) {
			if (pokemon.baseTemplate.baseSpecies === 'Arceus' || pokemon.baseTemplate.baseSpecies === 'Dunsparce') {
				let stats = [];
				for (let stat in pokemon.boosts) {
					if (stat !== 'accuracy' && stat !== 'evasion') {
						stats.push(stat);
					}
				}
				if (stats.length) {
					let randomStat = stats[this.random(stats.length)];
					let boost = {};
					boost[randomStat] = 1.5;
					return this.chainModify(boost);
				}
				this.add('-activate', pokemon, 'item: Zap Plate');
			}
		},
		desc: "Holder's Electric-type attacks have 1.2x power. Judgment is Electric type. If the holder is an Arceus or a Dunsparce, this Pokemon has a random stat raised by one stage.",
	},
};
