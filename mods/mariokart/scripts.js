// MK scripts.

'use strict';

exports.BattleScripts = {
    randomMariokartTeam: function (side) {
        var team = [];
        var variant = this.random(2);

        var sets = {
            'Kart': {
              species: 'Rhyhorn', ability: 'Illuminate', item: 'Cell Battery', gender: 'N',
              moves: ['Race'],
              evs: {atk: 252, spe: 252, hp: 4}, nature: 'Adamant',
            },
            'Shiny Kart': {
              species: 'Rhyhorn', ability: 'Illuminate', item: 'Cell Battery', gender: 'N', shiny: true,
              moves: ['Race'],
              evs: {atk: 252, spe: 252, hp: 4}, nature: 'Adamant',
            }
        };
        // convert moves to ids.
        for (var k in sets) {
            sets[k].moves = sets[k].moves.map(toId);
        }

        // Generate the team randomly.
        let pool = Object.keys(sets);
        for (let i = 0; i < 1; i++) {
          let name = this.sampleNoReplace(pool);
          let set = sets[name];
          set.level = 100;
          set.name = name;
          if (!set.ivs) {
            set.ivs = {hp:31, atk:31, def:31, spa:31, spd:31, spe:31};
          } else {
            for (let iv in {hp:31, atk:31, def:31, spa:31, spd:31, spe:31}) {
              set.ivs[iv] = iv in set.ivs ? set.ivs[iv] : 31;
            }
          }
          // Assuming the hardcoded set evs are all legal.
          if (!set.evs) set.evs = {hp:84, atk:84, def:84, spa:84, spd:84, spe:84};
          set.moves = set.moves;

          team.push(set);
        }

        return team;
    }
};
