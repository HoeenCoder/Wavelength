'use strict';

exports.BattleAbilities = {
  waggish: {
    id: "waggish",
		name: "Waggish",
    onModifyPriority: function (priority, pokemon, target, move) {
      if (move && move.category === 'Status') {
        return priority + 1;
      }
    },
    onModifyMove: function (move) {
      if (typeof move.accuracy === 'number') {
        move.accuracy *= 1.1;
      }
    }
  }

}
