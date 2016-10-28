"use strict";

exports.BattleMovedex = {
  race: {
    category: "Status",
    accuracy: 100,
    id: "race",
    name: "Race",
    isNonstandard: true,
    onPrepareHit: function (target, source, move) {
        this.attrLastMove('[still]');
        this.add('-anim', source, "Extreme Speed", target);
        //Now for some fun stuff
        this.add('raw', '<h3>Vroom Vroom!</h3>');
        let fun = Math.round(Math.random() * 4);
        switch (fun) {
          case 0:
            this.add('-anim', source, 'Fire Blast', source);
            this.add('-anim', source, 'Explosion', source);
            this.add('raw', '<h4>What do you thing happens when you drive into lava?</h4>')
            break;
          case 1:
            this.add('-anim', source, 'Draco Meteor', target);
            this.add('raw', '<h4>Triple Shells!!</h4>')
            break;
          case 2:
            if (Math.round(Math.random() * 3) !== 1) {
              this.add('-anim', source, 'Extreme Speed', target);
              this.add('-anim', source, 'Extreme Speed', target);
              this.add('raw', '<h4>Taken the lead!</h4>');
            } else {
              this.add('-anim', source, 'Geomancy', source);
              this.add('raw', '<img src="http://giant.gfycat.com/GiddyAcidicEuropeanfiresalamander.gif">');
              this.add('raw', '<h1>GOAL!! Wait what does this have to do with mariokart?</h1>');
            }
            break;
          case 3:
            this.add('-anim', source, 'Fusion Bolt', target);
            this.add('raw', '<h4>BEEP BEEP BEEP BOOM!</h4>');
            this.add('raw', '<h4>Don\'t you love blue shells?</h4>');
            break;
          case 4:
            this.add('-anim', source, 'Extreme Speed', target);
            this.add('raw', '<h4>... well what were you expecting to happen? Something funny?</h4>');
            break;
          default:
            this.add('', 'You shoudln\'t be seeing this message.');
        }
    },
    pp: 1000000,
    self: {boosts: {spe: 1}},
    target: "Self",
    type: "Normal"
  },
};
