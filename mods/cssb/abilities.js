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
  },
  server: {
    id: "server",
    name: "Server",
    onHit: function (target, source, move) {
			if (target !== source) {
        let stats = ['atk', 'def', 'spa', 'spd', 'spe'];
				this.add('-boost', target, stats[Math.floor(Math.random()*stats.length)], 1, '[from] ability: Server');
			}
		},
		onStart: function (target) {
			this.add('-start', target, 'ability: Server');
      this.add('raw', '<span style="font-family: monospace;">./spacialgaze>node app.js<br/>NEW GLOBAL: global<br/>NEW CHATROOM: lobby<br/>NEW CHATROOM: staff<br/>Worker 1 now listening on 0.0.0.0:8000<br/>Test your server at http://localhost:8000<br/>_</span>');
		},
		onEnd: function (target) {
			this.add('-end', target, 'ability: Server', '[silent]');
      this.add('raw', '<span style="font-family: monospace; color: red">CRASH: MAXIMUM CALL STACK SIZE EXCEEDED<br/>Process exiting with code <b>1</b>!</span><br/><span style="font-family: monospace;">./spacialgaze>_</span>')
      this.add('raw', '<h4>By the way, this isnt a real error so dont report it.');
    },
  }
}
