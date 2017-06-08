'use strict';

class SGgame extends Console.Console {
	constructor(user, room, muted) {
		super(user, room, 'background: linear-gradient(green, white);', '<center><br/><br/><br/><br/><img src="http://i.imgur.com/tfYS6TN.png"/></center><!--split-->', '<center><!--mutebutton--><button name="send" value="/console sound" class="button">' + (muted ? 'Unmute' : 'Mute') + '</button><!--endmute-->  <button name="send" value="/console shift" class="button">Shift</button>', muted);
		// Lines of text to be displayed
		this.gameId = 'SGgame';
		this.queue = [];
		this.queueAction = null;
		this.lastNextAction = null;
		this.curPane = null;
		this.callback = false;
		this.location = null;
		this.session = Date.now();
		this.nextSymbol = '\u2605';
	}
	buildMap(location) {
		// TODO locations, and actual map, ect
		return this.defaultHTML;
	}
	next(hideButton) {
		let base = this.buildMap();
		if (!this.queue.length) return base;
		let msg = this.queue.shift(), type = msg.split('|')[0], parts = null;
		switch (type) {
		case 'text':
			switch (msg.split('|')[2]) {
			case 'hide':
				hideButton = true;
				this.lastNextAction = 'hide';
				msg = msg.split('|')[1];
				break;
			case 'callback':
				this.callback();
				this.lastNextAction = 'callback';
				msg = msg.split('|')[1];
				break;
			default:
				this.lastNextAction = null;
				msg = msg.split('|')[1];
			}
			parts = base.split('<!--split-->');
			return parts.shift() + '<div style="display: inline-block; position: absolute; bottom: 0; overflow: hidden; border: 0.2em solid #000; border-radius: 5px; width: 99%; color: #000;">' + msg + (hideButton ? '' : '<button style="border: none; background: none; color: purple; cursor: pointer;" name="send" value="/sggame next"><u>&#9733;</u></button>') + '</div>' + parts.join('');
			//break;
		case 'callback':
			this.callback();
			this.lastNextAction = 'callback';
			return base;
		case 'learn':
			if (this.queueAction) {
				this.queue.unshift(msg);
				return base;
			}
			let poke = Db.players.get(this.userid).party[Number(msg.split('|')[1])];
			if (poke.moves.length < 4) {
				// Automatically learn the move
				let obj = Db.players.get(this.userid);
				obj.party[Number(msg.split('|')[1])].moves.push(toId(msg.split('|')[2]));
				Db.players.set(this.userid, obj);
				parts = base.split('<!--split-->');
				return parts.shift() + '<div style="display: inline-block; position: absolute; bottom: 0; overflow: hidden; border: 0.2em solid #000; border-radius: 5px; width: 99%; color: #000;">' + (poke.name || poke.species) + ' learned ' + msg.split('|')[2] + '! <button style="border: none; background: none; color: purple; cursor: pointer;" name="send" value="/sggame next"><u>&#9733;</u></button></div>' + parts.join('');
			}
			this.queueAction = msg;
			parts = base.split('<!--split-->');
			return parts.shift() + '<div style="display: inline-block; position: absolute; bottom: 0; overflow: hidden; border: 0.2em solid #000; border-radius: 5px; width: 99%; color: #000;"><center>' + (poke.name || poke.species) + ' wants to learn the move ' + msg.split('|')[2] + '.<br/>Should a move be forgotten for ' + msg.split('|')[2] + '<br/><button name="send" value="/sggame learn" style="border: none; background: none; color: grey">Forget a move</button> <button name="send" value="/sggame learn reject" style="border: none; background: none; color: grey">Keep old moves</button></center></div>' + parts.join('');
			//break;
		case 'evo':
			if (this.queueAction) {
				this.queue.unshift(msg);
				return base;
			}
			return base; // TODO
			//break;
		default:
			console.log('Invalid type: ' + type + '. While running (console).next()');
			return base;
		}
	}
	bag(menu, item) {
		menu = toId(menu);
		item = toId(item);
		let player = Db.players.get(this.userid);
		if (!menu || !(menu in player.bag)) menu = 'items';
		let output = '<div style="display: inline-block; position: absolute; bottom: 0; overflow: hidden; border: 0.2em solid #000; border-radius: 5px; width: 99%; height: 98%; color: #000; background-color: rgba(255, 255, 255, 0.8);"><center>';
		for (let p in player.bag) {
			output += (p === menu ? '<button class="button disabled">' + p.substring(0, 1).toUpperCase() + p.substring(1) + '</button> ' : '<button class="button" name="send" value="/sggame bag ' + p + '">' + p.substring(0, 1).toUpperCase() + p.substring(1) + '</button> ');
		}
		output += '</center><div style="height: 91%; border-top: 0.2em solid black; overflow: scroll; display: block;"><div><b style="float: left">Item</b><b style="float: right">#</b></div><br>';
		for (let i in player.bag[menu]) {
			if (player.bag[menu][i] > 0) {
				if (item && item === i) {
					output += '<button style="background: #0B9; border: none; border-top: 0.1em solid #001; width: 100%;"><span style="float: left">' + SG.getItem(i).name + '</span><span style="float: right">' + player.bag[menu][i] + '</span></button>';
				} else {
					output += '<button name="send" value="/sggame bag ' + menu + ', ' + i + '" style="background: none; border: none; border-top: 0.1em solid #001; width: 100%;"><span style="float: left">' + SG.getItem(i).name + '</span><span style="float: right">' + player.bag[menu][i] + '</span></button>';
				}
			}
		}
		output += '</div></div>';
		return output;
	}
	pc(box, slot, action) {
		if (this.curPane && this.curPane !== 'pc') return this.buildMap();
		this.curPane = 'pc';
		if (action === 'close') {
			this.curPane = null;
			return this.buildMap();
		}
		let targetParty = (box.split('|')[0] === 'party');
		if (targetParty) box = box.split('|')[1];
		if (!box || isNaN(Number(box)) || box < 0 || box > Db.players.get(this.userid).pc.length) box = 1;
		box = Number(box);
		slot = Number(slot);
		let user = Db.players.get(this.userid);
		let pokemon;
		switch (action) {
		case 'deposit':
			if (user.party.length <= 1) break;
			pokemon = user.party[slot];
			user.boxPoke([pokemon], box);
			user.party.splice(slot, 1);
			Db.players.set(this.userid, user);
			slot = null;
			break;
		case 'withdraw':
			if (user.party.length > 5) break;
			pokemon = user.pc[box - 1][slot];
			user.unBoxPoke(box, slot);
			user.party = user.party.concat(Dex.fastUnpackTeam(pokemon));
			Db.players.set(this.userid, user);
			slot = null;
			break;
		case 'release':
			// Falls through
			break;
		case 'confirmrelease':
			if (targetParty) {
				if (user.party.length <= 1) break;
				user.party.splice(slot, 1);
				Db.players.set(this.userid, user);
				slot = null;
			} else {
				user.pc[box - 1].splice(slot, 1);
				Db.players.set(this.userid, user);
				slot = null;
			}
			break;
		default:
			// Unhandled
		}
		// Build output
		let output = this.buildMap();
		output += '<div style="display: inline-block; position: absolute; bottom: 0; overflow: hidden; border: 0.2em solid #000; border-radius: 5px; width: 99%; height: 98%; color: #000; background-color: rgba(255, 255, 255, 0.8);">';
		output += '<div style="display: inline-block; float: left; width: 70%; height: 100%;"><center><button class="button" name="send" value="/sggame pc ' + (box - 1 <= 0 ? user.pc.length : box - 1) + '">&#8592;</button> <b>Box ' + box + '</b> <button class="button" name="send" value="/sggame pc ' + (box + 1 > user.pc.length ? 1 : box + 1) + '">&#8594;</button><hr/></center><table style="width: 100%; height: 80%">';
		let count = 0;
		for (let i = 0; i < 5; i++) {
			output += '<tr style="width: 100%;">';
			for (let j = 0; j < 6; j++) {
				let bg = user.pc[(box - 1)][count];
				let species;
				if (bg) species = (user.pc[(box - 1)][count].split('|')[1] ? user.pc[(box - 1)][count].split('|')[1] : user.pc[(box - 1)][count].split('|')[0]);
				bg = (bg ? SG.getPokemonIcon(species) : 'background: none');
				output += '<td style="width: 15%; height: 20%;"><button style="' + bg + '; width: 50px; height: 32px; border: 1px solid #AAA; border-radius: 5px;" name="send" value="/sggame pc ' + box + ', ' + count + '"></button></td>';
				count++;
			}
			output += "</tr>";
		}
		output += '</table></div><div style="display: inline-block; float: right; width: 30%; height: 100%; text-align: center;"><center style="height: 8.6%;"><b>Party</b></center><hr/>';
		let fullSlot = false;
		if (targetParty) {
			fullSlot = !!user.party[slot];
		} else {
			fullSlot = !!user.pc[box - 1][slot];
		}
		if ((slot || slot === 0) && fullSlot) {
			if (targetParty) {
				if (isNaN(slot) || slot < 0 || slot > 5) return output + 'Error</div></div>';
				let bg = 'background: none;';
				if (user.party[slot]) {
					let species = Dex.getTemplate(user.party[slot].species).spriteid;
					bg = 'background: url(//play.pokemonshowdown.com/sprites/xyani' + (user.party[slot].shiny ? '-shiny' : '') + '/' + species + '.gif) no-repeat top center;';
				}
				output += '<div style="width: 100%; height: 85%; ' + bg + ' text-align: center;"><br/><br/><br/><br/><br/><br/><b>' + ((user.party[slot].name && user.party[slot].name !== user.party[slot].species) ? user.party[slot].name + '<br/>(' + user.party[slot].species + ')' : user.party[slot].species) + '</b> Lvl ' + (user.party[slot].level) + '<br/>';
				if (action === 'release') {
					output += 'Are you sure you want to release this pokemon?<br/>This cannot be undone.<br/><button class="button" name="send" value="/sggame pc party|' + box + ', ' + slot + ', confirmrelease">Yes, release this pokemon</button>';
				} else {
					output += '<b>Ability</b>: ' + user.party[slot].ability + '<br/><b>Item</b>: ' + (user.party[slot].item || 'none') + '<br/><b>Moves</b>:<br/>';
					for (let i = 0; i < user.party[slot].moves.length; i++) {
						output += user.party[slot].moves[i] + '<br/>';
					}
				}
				output += '</div>';
			} else {
				if (isNaN(slot) || slot < 0 || slot > 29) return output + 'Error</div></div>';
				let data = Dex.fastUnpackTeam(user.pc[(box - 1)][slot])[0];
				if (!data) return output + 'Error</div></div>';
				let bg = 'background: none;';
				if (data) {
					let species = Dex.getTemplate(data.species).spriteid;
					bg = 'background: url(//play.pokemonshowdown.com/sprites/xyani' + (data.shiny ? '-shiny' : '') + '/' + species + '.gif) no-repeat top center;';
				}
				output += '<div style="width: 100%; height: 85%; ' + bg + ' text-align: center;"><br/><br/><br/><br/><br/><br/><b>' + ((data.name && data.name !== data.species) ? data.name + '<br/>(' + data.species + ')' : data.species) + '</b> Lvl ' + (data.level) + '<br/>';
				if (action === 'release') {
					output += 'Are you sure you want to release this pokemon?<br/>This cannot be undone.<br/><button class="button" name="send" value="/sggame pc ' + box + ', ' + slot + ', confirmrelease">Yes, release this pokemon</button>';
				} else {
					output += '<b>Ability</b>: ' + data.ability + '<br/><b>Item</b>: ' + (data.item || 'none') + '<br/><b>Moves</b>:<br/>';
					for (let i = 0; i < data.moves.length; i++) {
						output += data.moves[i] + '<br/>';
					}
				}
				output += '</div>';
			}
		} else {
			// Show the users party
			for (let i = 0; i < 6; i++) {
				let bg = 'background: none';
				if (user.party[i]) bg = SG.getPokemonIcon(user.party[i].species);
				output += '<button name="send" value="/sggame pc party|' + box + ', ' + i + '" style="' + bg + '; width: 50px; height: 32px; border: 1px solid #AAA; border-radius: 5px; margin-bottom: 0.4em;"></button> ';
			}
		}
		output += '</div></div>';
		return output;
	}
	summary(section, pokemon, details) {
		let output = this.buildMap();
		let player = Db.players.get(this.userid);
		switch (section) {
		case 'pokemon':
		case 'summary':
			if (!pokemon) return '<div style="color:red">An error has occured</div>';
			let template = Dex.getTemplate(pokemon.species);
			if (!template.exists) return '<div style="color:red">An error has occured</div>';
			output += '<div style="display: inline-block; position: absolute; bottom: 0; overflow: hidden; border: 0.2em solid #000; border-radius: 5px; width: 99%; height: 98%; color: #000; background-color: rgba(255, 255, 255, 0.8);">';
			output += '<div style="display: inline-block; float: left; width: 50%; height: 100%;">';
			output += '<center><img src="http://pokemonshowdown.com/sprites/xyani' + (pokemon.shiny ? '-shiny' : '') + '/' + toId(pokemon.species) + '.gif" alt="' + pokemon.species + '"/><br/>';
			output += '<b>Name</b>:' + (pokemon.name && pokemon.name !== pokemon.species ? pokemon.name + '(' + pokemon.species + ')' : pokemon.species) + '<br/>';
			output += '<b>Type</b>: <img src="http://play.pokemonshowdown.com/sprites/types/' + template.types[0] + '.png" alt="' + template.types[0] + '"/>' + (template.types[1] ? ' <img src="http://play.pokemonshowdown.com/sprites/types/' + template.types[1] + '.png" alt="' + template.types[1] + '"/>' : '') + '<br/>';
			output += '<b>Ability</b>: ' + pokemon.ability + '<br/>';
			output += '<b>Item</b>:' + (pokemon.item ? pokemon.item : 'None') + '<br/>';
			output += '<b>OT</b>:' + pokemon.ot + '<br/>';
			output += '<b>Level</b>:' + pokemon.level + '<br/>';
			let nextLevel = SG.calcExp(pokemon.species, pokemon.level + 1), curLevel = SG.calcExp(pokemon.species, pokemon.level);
			output += '<b>Exp</b>:' + Math.round(pokemon.exp) + ' / ' + Math.round(nextLevel) + '<br/>';
			output += '<progress max="' + (nextLevel - curLevel) + '" value="' + (pokemon.exp - curLevel) + '"></progress>';
			output += '<br/><button class="button" name="send" value="/sggame pokemon stats, ' + details + '">Evs &amp; Ivs</button></center></div>';
			let move = null;
			output += '<div style="display: inline-block; float: right; width: 50%; height: 100%; text-align: center;"><div class="movemenu"><center>';
			for (let m = 0; m < pokemon.moves.length; m++) {
				move = Dex.getMove(pokemon.moves[m]);
				output += '<button name="send" value="/dt ' + move.id + '" class="type-' + move.type + '">' + move.name + '<br/><small class="type">' + move.type + '</small> <small class="pp">' + move.pp + '/' + move.pp + '</small>&nbsp;</button><br/><br/><br/>';
			}
			output += '</center></div></div></div>';
			break;
		case 'stats':
			if (!pokemon) return '<div style="color:red">An error has occured</div>';
			let evs = pokemon.evs || {hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0};
			let totalEvs = 0;
			output += '<div style="display: inline-block; position: absolute; bottom: 0; overflow: hidden; border: 0.2em solid #000; border-radius: 5px; width: 99%; height: 98%; color: #000; background-color: rgba(255, 255, 255, 0.8);">';
			output += '<div style="display: inline-block; float: left; width: 50%; height: 100%; text-align: center;">';
			output += '<br/><b>' + (pokemon.name && pokemon.name !== pokemon.species ? pokemon.name + '(' + pokemon.species + ')' : pokemon.species) + '\'s Evs</b><br/>';
			for (let ev in evs) {
				output += '<b>' + ev + '</b>: ' + evs[ev] + ' / 255<br/>';
				totalEvs += evs[ev];
			}
			output += '<br/><b>Total Evs</b>: ' + totalEvs + ' / 510<br/>';
			output += '<progress max="510" value="' + totalEvs + '"></progress></div>';
			output += '<div style="display: inline-block; float: right; width: 50%; height: 100%; text-align: center;">';
			output += '<br/><b>' + (pokemon.name && pokemon.name !== pokemon.species ? pokemon.name + '(' + pokemon.species + ')' : pokemon.species) + '\'s Ivs</b><br/>';
			for (let iv in pokemon.ivs) {
				output += '<b>' + iv + '</b>: ' + pokemon.ivs[iv] + ' / 255<br/>';
			}
			output += '</div></div>';
			break;
		case 'move':
			output += '<div style="display: inline-block; position: absolute; bottom: 0; overflow: hidden; border: 0.2em solid #000; border-radius: 5px; width: 99%; height: 98%; color: #000; background-color: rgba(255, 255, 255, 0.8);">';
			output += '<div style="display: inline-block; float: left; width: 50%; height: 100%; text-align: center;"><br/><b>Select ' + (details ? 'second' : 'first') + ' pokemon</b><br/>&nbsp;';
			let pmon = null;
			for (let i = 0; i < 6; i += 2) {
				if (i !== 0) output += '<br/><br/>&nbsp;';
				pmon = player.party[i];
				if (pmon) {
					output += '<button name="send" value="/sggame pokemon move, ' + (details ? details + ', ' : '') + i + '" style="border: 2px solid #000; border-radius: 5px; background-color: #0B9; width: 85%; height: 25%">';
					output += '<div style="' + SG.getPokemonIcon(pmon.species) + '; width: 35px; height: 50%; display: inline-block; float: left;"></div>';
					output += '<b>' + (pmon.name && pmon.name !== pmon.species ? pmon.name + '(' + pmon.species + ')' : pmon.species) + '</b> Lvl ' + (pmon.level || '?') + '<br/>' + (pmon.item ? '(' + pmon.item + ')' : '(no item)');
					output += '</button>';
				} else {
					output += '<button style="border: 2px solid #000; border-radius: 5px; background-color: #0B9; width: 85%; height: 25%">EMPTY</button>';
				}
			}
			output += '</div>';
			output += '<div style="display: inline-block; float: right; width: 50%; height: 100%; text-align: center;"><br/><br/>&nbsp;';
			for (let i = 1; i < 6; i += 2) {
				if (i !== 1) output += '<br/><br/>&nbsp;';
				pmon = player.party[i];
				if (pmon) {
					output += '<button name="send" value="/sggame pokemon move, ' + (details ? details + ', ' : '') + i + '" style="border: 2px solid #000; border-radius: 5px; background-color: #0B9; width: 85%; height: 25%">';
					output += '<div style="' + SG.getPokemonIcon(pmon.species) + '; width: 35px; height: 50%; display: inline-block; float: left;"></div>';
					output += '<b>' + (pmon.name && pmon.name !== pmon.species ? pmon.name + '(' + pmon.species + ')' : pmon.species) + '</b> Lvl ' + (pmon.level || '?') + '<br/>' + (pmon.item ? '(' + pmon.item + ')' : '(no item)');
					output += '</button>';
				} else {
					output += '<button name="send" style="border: 2px solid #000; border-radius: 5px; background-color: #0B9; width: 85%; height: 25%">EMPTY</button>';
				}
			}
			output += '</div></div>';
			break;
		case 'learn':
			if (!pokemon) return '<div style="color:red">An error has occured</div>';
			let template2 = Dex.getTemplate(pokemon.species);
			if (!template2.exists) return '<div style="color:red">An error has occured</div>';
			output += '<div style="display: inline-block; position: absolute; bottom: 0; overflow: hidden; border: 0.2em solid #000; border-radius: 5px; width: 99%; height: 98%; color: #000; background-color: rgba(255, 255, 255, 0.8);">';
			output += '<div style="display: inline-block; float: left; width: 50%; height: 100%;">';
			output += '<center><img src="http://pokemonshowdown.com/sprites/xyani' + (pokemon.shiny ? '-shiny' : '') + '/' + toId(pokemon.species) + '.gif" alt="' + pokemon.species + '"/><br/>';
			output += '<b>Name</b>:' + (pokemon.name && pokemon.name !== pokemon.species ? pokemon.name + '(' + pokemon.species + ')' : pokemon.species) + '<br/>';
			output += '<b>Type</b>: <img src="http://play.pokemonshowdown.com/sprites/types/' + template2.types[0] + '.png" alt="' + template2.types[0] + '"/>' + (template2.types[1] ? ' <img src="http://play.pokemonshowdown.com/sprites/types/' + template2.types[1] + '.png" alt="' + template2.types[1] + '"/>' : '') + '<br/>';
			output += '<b>Ability</b>: ' + pokemon.ability + '<br/>';
			output += '<b>Item</b>:' + (pokemon.item ? pokemon.item : 'None') + '<br/>';
			output += '<b>OT</b>:' + pokemon.ot + '<br/>';
			output += '<b>Level</b>:' + pokemon.level + '<br/>';
			let nextLevel2 = SG.calcExp(pokemon.species, pokemon.level + 1), curLevel2 = SG.calcExp(pokemon.species, pokemon.level);
			output += '<b>Exp</b>:' + Math.round(pokemon.exp) + ' / ' + Math.round(nextLevel2) + '<br/>';
			output += '<progress max="' + (nextLevel2 - curLevel2) + '" value="' + (pokemon.exp - curLevel2) + '"></progress></center></div>';
			let move2 = null;
			output += '<div style="display: inline-block; float: right; width: 50%; height: 100%; text-align: center;"><div class="movemenu"><center>';
			for (let m = 0; m < pokemon.moves.length; m++) {
				move2 = Dex.getMove(pokemon.moves[m]);
				output += '<button name="send" value="/sggame learn ' + move2.id + '" class="type-' + move2.type + '">' + move2.name + '<br/><small class="type">' + move2.type + '</small> <small class="pp">' + move2.pp + '/' + move2.pp + '</small>&nbsp;</button><br/><br/><br/>';
			}
			move2 = Dex.getMove(details);
			output += '<button name="send" value="/sggame learn cancel" class="type-' + move2.type + '">' + move2.name + '<br/><small class="type">' + move2.type + '</small> <small class="pp">' + move2.pp + '/' + move2.pp + '</small>&nbsp;</button><br/><br/><br/>';
			output += '</center></div></div></div>';
			break;
		case 'use':
			output += '<div style="display: inline-block; position: absolute; bottom: 0; overflow: hidden; border: 0.2em solid #000; border-radius: 5px; width: 99%; height: 98%; color: #000; background-color: rgba(255, 255, 255, 0.8);">';
			output += '<div style="display: inline-block; float: left; width: 50%; height: 100%; text-align: center;"><br/>&nbsp;';
			let pmon2 = null;
			for (let i = 0; i < 6; i += 2) {
				if (i !== 0) output += '<br/><br/>&nbsp;';
				pmon2 = player.party[i];
				if (pmon2) {
					output += '<button name="send" value="/sggame bag ' + details + ', ' + i + '" style="border: 2px solid #000; border-radius: 5px; background-color: #0B9; width: 85%; height: 25%">';
					output += '<div style="' + SG.getPokemonIcon(pmon2.species) + '; width: 35px; height: 50%; display: inline-block; float: left;"></div>';
					output += '#' + (i + 1) + ' <b>' + (pmon2.name && pmon2.name !== pmon2.species ? pmon2.name + ' (' + pmon2.species + ')' : pmon2.species) + '</b> Lvl ' + (pmon2.level || '?') + '<br/>' + (pmon2.item ? '(' + pmon2.item + ')' : '(no item)');
					output += '</button>';
				} else {
					output += '<button style="border: 2px solid #000; border-radius: 5px; background-color: #0B9; width: 85%; height: 25%">EMPTY</button>';
				}
			}
			output += '</div>';
			output += '<div style="display: inline-block; float: right; width: 50%; height: 100%; text-align: center;"><br/>&nbsp;';
			for (let i = 1; i < 6; i += 2) {
				if (i !== 1) output += '<br/><br/>&nbsp;';
				pmon2 = player.party[i];
				if (pmon2) {
					output += '<button name="send" value="/sggame bag ' + details + ', ' + i + '" style="border: 2px solid #000; border-radius: 5px; background-color: #0B9; width: 85%; height: 25%">';
					output += '<div style="' + SG.getPokemonIcon(pmon2.species) + '; width: 35px; height: 50%; display: inline-block; float: left;"></div>';
					output += '#' + (i + 1) + ' <b>' + (pmon2.name && pmon2.name !== pmon2.species ? pmon2.name + ' (' + pmon2.species + ')' : pmon2.species) + '</b> Lvl ' + (pmon2.level || '?') + '<br/>' + (pmon2.item ? '(' + pmon2.item + ')' : '(no item)');
					output += '</button>';
				} else {
					output += '<button name="send" style="border: 2px solid #000; border-radius: 5px; background-color: #0B9; width: 85%; height: 25%">EMPTY</button>';
				}
			}
			output += '</div></div>';
			break;
		case 'pp':
			if (!pokemon) return '<div style="color:red">An error has occured</div>';
			let tempalte2 = Dex.getTemplate(pokemon.species);
			if (!tempalte2.exists) return '<div style="color:red">An error has occured</div>';
			output += '<div style="display: inline-block; position: absolute; bottom: 0; overflow: hidden; border: 0.2em solid #000; border-radius: 5px; width: 99%; height: 98%; color: #000; background-color: rgba(255, 255, 255, 0.8);">';
			output += '<div style="display: inline-block; float: left; width: 50%; height: 100%;">';
			output += '<center><img src="http://pokemonshowdown.com/sprites/xyani' + (pokemon.shiny ? '-shiny' : '') + '/' + toId(pokemon.species) + '.gif" alt="' + pokemon.species + '"/><br/>';
			output += '<b>Name</b>:' + (pokemon.name && pokemon.name !== pokemon.species ? pokemon.name + '(' + pokemon.species + ')' : pokemon.species) + '<br/>';
			output += '<b>Type</b>: <img src="http://play.pokemonshowdown.com/sprites/types/' + tempalte2.types[0] + '.png" alt="' + tempalte2.types[0] + '"/>' + (tempalte2.types[1] ? ' <img src="http://play.pokemonshowdown.com/sprites/types/' + tempalte2.types[1] + '.png" alt="' + tempalte2.types[1] + '"/>' : '') + '<br/>';
			output += '<b>Ability</b>: ' + pokemon.ability + '<br/>';
			output += '<b>Item</b>:' + (pokemon.item ? pokemon.item : 'None') + '<br/>';
			output += '<b>OT</b>:' + pokemon.ot + '<br/>';
			output += '<b>Level</b>:' + pokemon.level + '<br/>';
			let nextLevel3 = SG.calcExp(pokemon.species, pokemon.level + 1), curLevel3 = SG.calcExp(pokemon.species, pokemon.level);
			output += '<b>Exp</b>:' + Math.round(pokemon.exp) + ' / ' + Math.round(nextLevel3) + '<br/>';
			output += '<progress max="' + (nextLevel3 - curLevel3) + '" value="' + (pokemon.exp - curLevel3) + '"></progress>';
			output += '<br/><button class="button" name="send" value="/sggame pokemon stats, ' + details + '">Evs &amp; Ivs</button></center></div>';
			let move3 = null;
			output += '<div style="display: inline-block; float: right; width: 50%; height: 100%; text-align: center;"><div class="movemenu"><center><b>Restore PP to which move?</b><br/>';
			for (let m = 0; m < pokemon.moves.length; m++) {
				move3 = Dex.getMove(pokemon.moves[m]);
				output += '<button name="send" value="/sggame bag ' + details + ', ' + m + '" class="type-' + move3.type + '">' + move3.name + '<br/><small class="type">' + move3.type + '</small> <small class="pp">?/' + move3.pp + '</small>&nbsp;</button><br/><br/><br/>';
			}
			output += '</center></div></div></div>';
			break;
		default:
			// Show party
			output += '<div style="display: inline-block; position: absolute; bottom: 0; overflow: hidden; border: 0.2em solid #000; border-radius: 5px; width: 99%; height: 98%; color: #000; background-color: rgba(255, 255, 255, 0.8);">';
			output += '<div style="display: inline-block; float: left; width: 50%; height: 100%; text-align: center;"><br/>&nbsp;';
			let mon = null;
			for (let i = 0; i < 6; i += 2) {
				if (i !== 0) output += '<br/><br/>&nbsp;';
				mon = player.party[i];
				if (mon) {
					output += '<button name="send" value="/sggame pokemon summary, ' + i + '" style="border: 2px solid #000; border-radius: 5px; background-color: #0B9; width: 85%; height: 25%">';
					output += '<div style="' + SG.getPokemonIcon(mon.species) + '; width: 35px; height: 50%; display: inline-block; float: left;"></div>';
					output += '#' + (i + 1) + ' <b>' + (mon.name && mon.name !== mon.species ? mon.name + ' (' + mon.species + ')' : mon.species) + '</b> Lvl ' + (mon.level || '?') + '<br/>' + (mon.item ? '(' + mon.item + ')' : '(no item)');
					output += '</button>';
				} else {
					output += '<button style="border: 2px solid #000; border-radius: 5px; background-color: #0B9; width: 85%; height: 25%">EMPTY</button>';
				}
			}
			output += '</div>';
			output += '<div style="display: inline-block; float: right; width: 50%; height: 100%; text-align: center;"><br/>&nbsp;';
			for (let i = 1; i < 6; i += 2) {
				if (i !== 1) output += '<br/><br/>&nbsp;';
				mon = player.party[i];
				if (mon) {
					output += '<button name="send" value="/sggame pokemon summary, ' + i + '" style="border: 2px solid #000; border-radius: 5px; background-color: #0B9; width: 85%; height: 25%">';
					output += '<div style="' + SG.getPokemonIcon(mon.species) + '; width: 35px; height: 50%; display: inline-block; float: left;"></div>';
					output += '#' + (i + 1) + ' <b>' + (mon.name && mon.name !== mon.species ? mon.name + ' (' + mon.species + ')' : mon.species) + '</b> Lvl ' + (mon.level || '?') + '<br/>' + (mon.item ? '(' + mon.item + ')' : '(no item)');
					output += '</button>';
				} else {
					output += '<button name="send" style="border: 2px solid #000; border-radius: 5px; background-color: #0B9; width: 85%; height: 25%">EMPTY</button>';
				}
			}
			output += '</div></div>';
		}
		return output;
	}
	wild(pokemon) {
		if (!pokemon) return '<div style="color:red"><b>An error has occured when trying to preview a wild pokemon</b></div>';
		if (typeof pokemon === 'string') pokemon = Dex.fastUnpackTeam(pokemon)[0];
		let output = this.buildMap();
		output += '<div style="display: inline-block; position: absolute; bottom: 0; overflow: hidden; border: 0.2em solid #000; border-radius: 5px; width: 99%; height: 98%; color: #000; background-color: rgba(255, 255, 255, 0.8);"><center>';
		output += '<img src="http://pokemonshowdown.com/sprites/xyani' + (pokemon.shiny ? '-shiny' : '') + '/' + toId(pokemon.species) + '.gif" alt="' + pokemon.species + '"/><br/>';
		output += '<b>A wild ' + (pokemon.shiny ? 'SHINY' : '') + ' ' + pokemon.species + ' appeared!<br/>(Level: ' + pokemon.level + ', Gender: ' + (pokemon.gender || 'N') + ')<br/>';
		output += (pokemon.species !== 'missingno' ? '<button class="button"  name="send" value="/wild battle">Battle!</button>' : '<b>You shouldn\'t battle an error!</b>') + ' <button class="button" name="send" value="/wild flee">Flee!</button></div>';
		return output;
	}
	buildBase(addOn, data) {
		if (!addOn) return this.defaultBottomHTML;
		let output = this.defaultBottomHTML + "<br/>";
		let checkButton = function (title, prop, command) {
			if (data[prop]) {
				return '<button class="button" name="send" value="' + (data[prop] === true ? command : data[prop]) + '">' + title + '</button>';
			} else {
				return '<button class="button disabled">' + title + '</button>';
			}
		};
		switch (addOn) {
		case "pc":
			output += '<center>' + checkButton('Deposit', 'deposit', '/sggame pc ' + data.box + ', ' + data.slot + ', deposit') + ' ' + checkButton('Withdraw', 'withdraw', '/sggame pc ' + data.box + ', ' + data.slot + ', withdraw') + ' ';
			output += checkButton('Release', 'release', '/sggame pc ' + data.box + ', ' + data.slot + ', release') + ' ' + checkButton('Back', 'back', '/sggame back') + ' ';
			output += '<button name="send" value="/sggame pc ,,close" class="button">Close</button></center>';
			break;
		case "pokemon":
			output += '<center>' + checkButton('Swap', 'move') + ' ' + checkButton('Take Item', 'take') + ' ' + checkButton('Change Nickname', 'nick') + ' ' + checkButton('Back', 'back') + ' ' + checkButton('Cancel', 'cancel') + ' ';
			output += '<button class="button" name="send" value="/sggame pokemon close">Close</button></center>';
			break;
		case "bag":
			output += '<center>' + checkButton('Use', 'use') + ' ' + checkButton('Give', 'give') + ' ' + checkButton('Back', 'back') + ' ';
			output += '<button class="button" name="send" value="/sggame bag close">Close</button></center>';
			break;
		}
		return output;
	}
	onKill() {
		let user = Users(this.userid);
		for (let key of user.inRooms) {
			if (Rooms.get(key).type === 'battle' && Dex.getFormat(Rooms(key).format).useSGgame && user.games.has(key)) {
				// FORCE FORFEIT
				Rooms(key).game.forfeit(user);
			}
		}
		let player = Db.players.get(this.userid);
		if (!player) return;
		player.time += (Date.now() - this.session);
		Db.players.set(this.userid, player);
	}
}

class Player {
	constructor(user, starter) {
		this.game = 'SGgame - Alpha';
		this.userid = user.userid;
		this.poke = 0; // Currency
		this.time = 0;
		this.bag = {items: {leafstone: 1, firestone: 1, waterstone: 1, thunderstone: 1}, medicine: {potion: 5, rarecandy: 3}, pokeballs: {pokeball: 50, greatball: 25, ultraball: 10, masterball: 1}, berries: {oranberry: 5, lumberry: 2}, tms: {}, keyitems: {}};
		// Array of boxes (arrays), max of 30 boxes, 30 pokemon per box, stored as strings
		this.pc = [[], [], [], [], [], [], ["HoeenHero|ludicolo|||scald,gigadrain,icebeam,raindance|Jolly||M|20,30,23,3,30,28||50|0"], [], [], []];
		this.party = starter;
		this.pokedex = {};
		// More to come...
	}
	test() {
		return true;
	}
	nickname(name, slot) {
		if (!this.party[slot]) return false;
		name = name.trim();
		name = name.replace(/[^A-Za-z0-9]+/g, '');
		if (Config.nicknameFilter) {
			if (!Config.nicknameFilter(name)) return false;
		}
		this.party[slot].name = name;
		return true;
	}
	boxPoke(pokemon, box) {
		if (typeof pokemon !== 'string') {
			pokemon = Dex.packTeam(pokemon);
			if (!pokemon) return false;
		}
		let count = 0, first = false;
		for (let i = 0; i < this.pc.length; i++) {
			if (this.pc[i].length > 0) count++;
			if (this.pc[i].length >= 30) continue;
			if (!first) first = i;
		}
		if (first === false) return false; // PC is full
		if (!box || isNaN(Number(box)) || box > 30 || box < 0 || this.pc[box - 1].length >= 30) box = first + 1;
		if (count >= this.pc.length && this.pc.length < 30) {
			// Increase PC size
			for (let i = 0; i < 7; i++) {
				if (this.pc.length >= 30) break;
				this.pc.push([]);
			}
		}
		this.pc[box - 1].push(pokemon);
		return box;
	}
	unBoxPoke(box, slot) {
		box = Number(box);
		slot = Number(slot);
		if (!box || isNaN(box) || box > 30 || box <= 0 || this.pc[box - 1].length >= 30) return false;
		if ((!slot && slot !== 0) || isNaN(slot) || slot > 30 || slot < 0) return false;
		this.pc[box - 1].splice(slot, 1);
		return true;
	}
}

exports.box = {
	startCommand: '/playalpha',
	name: 'SGgame - Alpha',
};

exports.commands = {
	confirmresetalpha: 'playalpha',
	resetalpha: 'playalpha',
	continuealpha: 'playalpha',
	playalpha: function (target, room, user, connection, cmd) {
		if (cmd === 'resetalpha' && user.console) return user.console.update(false, '<h2><center>Are You sure ?<br /><button class="button" name="send" value="/confirmresetalpha">Yes</button> <button class="button" name="send" value="/sggame back">No</button>', false);
		if (cmd === 'resetalpha') return; // User didnt have a console setup.
		if (user.console) this.parse('/console kill');
		user.console = new SGgame(user, room, !!target);
		if (cmd === 'playalpha') {
			let htm = '<center>';
			if (Db.players.has(user.userid)) htm += '<button name="send" value="/continuealpha" style="display: block; border: 5px solid #AAA; background: #FFF; font-family: monospace; border-radius: 5px; width: 90%; text-align: left;"><b>CONTINUE</b><br/><br/><span style="color: #4286f4">PLAYER ' + user.name + '<br/><br/>TIME ' + (Chat.toDurationString(Db.players.get(user.userid).time, {precision: 2}) || '0 Seconds') + '<br/><br/>POKEDEX ' + Object.keys(Db.players.get(user.userid).pokedex).length + '</span></button>';
			htm += '<button name="send" value="/confirmresetalpha" style="display: block; border: 5px solid #AAA; background: #FFF; font-family: monospace; border-radius: 5px; width: 90%; text-align: left;"><b>NEW GAME</b></button></center>';
			user.console.init();
			user.console.update('background-color: #6688AA;', htm, null);
		} else if (cmd === 'confirmresetalpha') {
			// New Game
			user.console.queue = ['text|Welcome to the world of Pokemon!<br/>I\'m HoeenHero, one of the programmers for the game. (click the star to continue)',
				'text|Were not done creating the game yet so its limited as to what you can do.<br/>But you can help out by testing whats here, and reporting any issues you find!',
				'text|Lets get you setup.<br/>Pick a starter:'];
			let msg = '';
			let starters = [['Bulbasaur', 'Chikorita', 'Treecko', 'Turtwig', 'Snivy', 'Chespin', 'Rowlet'], ['Charmander', 'Cyndaquil', 'Torchic', 'Chimchar', 'Tepig', 'Fennekin', 'Litten'], ['Squirtle', 'Totodile', 'Mudkip', 'Piplup', 'Oshawott', 'Froakie', 'Popplio'], ['Pikachu'], ['Eevee']];
			for (let i = 0; i < starters.length; i++) {
				let color = (i === 0 ? 'green' : (i === 1 ? 'red' : (i === 2 ? 'blue' : (i === 3 ? '#E5DA2A' : '#B08257'))));
				for (let j = 0; j < starters[i].length; j++) {
					msg += '<button name="send" value="/pickstarter ' + starters[i][j] + '" style="border: none; background: none; color: ' + color + '"><u>' + starters[i][j] + '</u></button> ';
				}
				msg += (i + 1 < starters.length ? '<br/>' : '');
			}
			user.console.queue.push('text|' + msg + '|hide');
			user.console.callback = function () {
				user.console.defaultBottomHTML = '<center><!--mutebutton--><button name="send" value="/console sound" class="button">' + (user.console.muted ? 'Unmute' : 'Mute') + '</button><!--endmute--> <button name="send" value="/console shift" class="button">Shift</button> <button class="button" name="send" value="/sggame pokemon">Pokemon</button> <button class="button" name="send" value="/sggame bag">Bag</button> <button class="button" name="send" value="/sggame pc">PC Boxes</button> <button name="send" value="/wild" class="button">Battle!</button> <button name="send" value="/resetalpha" class="button">Reset</button>';
				user.console.callback = null;
			};
			user.console.queue.push('text|Great choice! <button style="border: none; background: none; color: purple; cursor: pointer;" name="send" value="/help sggame nickname">Click here for instructions on how to give it a nickname</button><br/>I\'ll leave you to your game now.|callback');
			user.console.init();
			this.parse('/sggame next');
		} else {
			// Continue
			if (!Db.players.has(user.userid)) return this.parse('/confirmresetalpha');
			try {
				Db.players.get(user.userid).test();
			} catch (e) {
				let newObj = new Player(user.userid, Dex.fastUnpackTeam(SG.makeWildPokemon(false, false, {name: "ERROR!", species: "Mudkip", level: 10, ability: 0})));
				Object.assign(newObj, Db.players.get(user.userid));
				Db.players.set(user.userid, newObj);
			}
			user.console.queue = ['text|Welcome back to the alpha, tell me if you like the game or find any bugs!'];
			user.console.defaultBottomHTML = '<center><!--mutebutton--><button name="send" value="/console sound" class="button">' + (user.console.muted ? 'Unmute' : 'Mute') + '</button><!--endmute--> <button name="send" value="/console shift" class="button">Shift</button> <button class="button" name="send" value="/sggame pokemon">Pokemon</button> <button class="button" name="send" value="/sggame bag">Bag</button> <button class="button" name="send" value="/sggame pc">PC Boxes</button> <button name="send" value="/wild" class="button">Battle!</button> <button name="send" value="/resetalpha" class="button">Reset</button>';
			user.console.init();
			this.parse('/sggame next');
		}
	},
	wild: function (target, room, user) {
		if (user.console.queue.length) return;
		if (user.console.curPane && user.console.curPane !== 'wild') return;
		user.console.curPane = 'wild';
		if (!Users('sgserver')) SG.makeCOM();
		if (!toId(target)) {
			for (let key of user.inRooms) {
				if (key.substr(0, 6) === 'battle' && Dex.getFormat(Rooms(key).format).useSGgame && user.games.has(key)) {
					user.console.curPane = null;
					return;
				}
			}
			Users('sgserver').wildTeams[user.userid] = SG.makeWildPokemon(false, SG.teamAverage(Db.players.get(user.userid).party));
			return user.console.update(null, user.console.wild(Users('sgserver').wildTeams[user.userid]), null);
		} else {
			if (!Users('sgserver')) return;
			target = toId(target);
			if (target === 'battle') {
				if (!Users('sgserver').wildTeams[user.userid]) return this.parse('/wild');
				user.console.curPane = null;
				user.console.update();
				this.parse('/search gen7wildpokemonalpha');
			} else {
				Users('sgserver').wildTeams[user.userid] = null;
				user.console.curPane = null;
				user.console.update();
			}
		}
	},
	sggame: {
		next: function (target, room, user, connection, cmd) {
			if (!user.console || user.console.gameId !== 'SGgame') return;
			if (user.console.lastNextAction === 'hide') return;
			return user.console.update(null, user.console.next(), null);
		},
		learn: function (target, room, user) {
			if (!user.console || user.console.gameId !== 'SGgame' || !user.console.queueAction) return;
			target = toId(target);
			let action = user.console.queueAction.split('|');
			if (action[0] !== 'learn') return;
			let pokemon = Db.players.get(user.userid).party[Number(action[1])];
			if (!target) {
				// Pull up move selection menu to pick what to forget
				user.console.curPane = 'learn'; // Force override any open pane
				return user.console.update(null, user.console.summary('learn', pokemon, action[2]), null);
			} else if (target === 'reject') {
				// Cancel the move learning.
				user.console.queueAction = null;
				user.console.queue.unshift('text|' + (pokemon.name || pokemon.species) + ' did not learn ' + action[2] + '.');
				user.console.lastNextAction = null;
				user.console.curPane = null;
				return this.parse('/sggame next');
			} else if (target === 'cancel') {
				// Step back
				user.console.queue.unshift(user.console.queueAction);
				user.console.queueAction = null;
				user.console.lastNextAction = null;
				user.console.curPane = null;
				return this.parse('/sggame next');
			} else {
				// Attempt to forget the specified move, and learn action[2]
				if (pokemon.moves.indexOf(toId(target)) === -1) return false; // The pokemon dosent know this move.
				let obj = Db.players.get(user.userid);
				obj.party[Number(action[1])].moves.splice(pokemon.moves.indexOf(toId(target)), 1);
				obj.party[Number(action[1])].moves.push(toId(action[2]));
				Db.players.set(user.userid, obj);
				user.console.queueAction = null;
				user.console.queue.unshift('text|1, 2, 3 and... POOF!<br/>' + (pokemon.name || pokemon.species) + ' forgot ' + target + ' and learned ' + action[2] + '!');
				user.console.lastNextAction = null;
				user.console.curPane = null;
				return this.parse('/sggame next');
			}
		},
		bag: function (target, room, user, connection, cmd) {
			if (!user.console || user.console.gameId !== 'SGgame') return;
			if (user.console.queue.length) return;
			if (!target) target = "items";
			target = target.split(',');
			target = target.map(data => {
				return data.trim();
			});
			let inBattle = false;
			for (let key of user.inRooms) {
				if (key.substr(0, 6) === 'battle' && Dex.getFormat(Rooms(key).format).useSGgame && user.games.has(key) && !Dex.getFormat(Rooms(key).format).noBag) inBattle = Rooms(key);
			}
			if (target[0] === 'close') {
				user.console.curPane = null;
				return user.console.update(null, user.console.buildMap(), null);
			}
			if (user.console.curPane && user.console.curPane !== 'bag') return;
			user.console.curPane = 'bag';
			let data = {};
			let player = Db.players.get(user.userid);
			if (!player) return this.errorReplay("You need to advance farther in the game first!");
			let item = SG.getItem(target[1]);
			if (target[0] && !player.bag[target[0]]) target[0] = 'items';
			if (target[1] && player.bag[target[0]][target[1]] && !target[2]) {
				if (!item) return this.parse('/sggame bag ' + target[0]);
				if (inBattle) {
					if (!item.use.noBattle) data.use = '/sggame bag ' + target[0] + ', ' + target[1] + ', use';
				} else {
					if (Dex.getItem(target[1]).exists) data.give = '/sggame bag ' + target[0] + ', ' + target[1] + ', give';
					if (!item.use.battleOnly) data.use = '/sggame bag ' + target[0] + ', ' + target[1] + ', use';
					//data.toss = '/sggame bag ' + target[0] + ', ' + target[1] + ', toss';
				}
				data.back = '/sggame bag ' + target[0];
			}
			if (target[2] && !target[3]) {
				if (!item) return this.parse('/sggame bag ' + target[0]);
				if (item.use.isBall) {
					if (inBattle) {
						return Chat.parse("/throwpokeball " + item.id, inBattle, user, user.connections[0]);
					} else if (target[2] === 'use') {
						return this.parse('/sggame bag ' + target[0] + ', ' + target[1]);
					}
				}
				data.back = '/sggame bag ' + target[0] + ', ' + target[1];
				// Display summary popup to use item
				return user.console.update(null, user.console.summary('use', null, target[0] + ', ' + target[1] + ', ' + target[2]), user.console.buildBase('bag', data));
			}
			if (target[3]) {
				// Execute action
				if (target[2] === 'use' && !item.use) return this.parse('/sggame bag ' + target[0] + ', ' + target[1]); // This item cannot be 'used'
				let mon = player.party[target[3]];
				if (!mon) return this.parse('/sggame bag ' + target[0] + ', ' + target[1]);
				if (target[2] === 'give' && !inBattle) {
					if (!Dex.getItem(target[1]).exists) return this.parse('/sggame bag ' + target[0] + ', ' + target[1]);
					let old = mon.item;
					if (old) {
						let slot = player.bag[SG.getItem(old).slot];
						if (!slot[old]) slot[old] = 0;
						slot[old]++;
					}
					player.bag[target[0]][target[1]]--;
					mon.item = target[1];
					Db.players.set(user.userid, player);
					data.give = '/sggame bag ' + target[0] + ', ' + target[1] + ', give';
					if (!item.use.battleOnly) data.use = '/sggame bag ' + target[0] + ', ' + target[1] + ', use';
					data.back = '/sggame bag ' + target[0];
				} else { // 'use'
					if (inBattle) {
						if (item.use.revive) return this.errorReply("Reviving items are disabled at this time.");
						if (item.use.healPP && !target[4]) {
							// We need more information!
							return user.console.update(null, user.console.summary('pp', player.party[target[3]], target[0] + ', ' + target[1] + ', ' + target[2] + ', ' + target[3]), user.console.buildBase('bag', data));
						}
						if (item.use.noBattle) return this.parse('/sggame bag ' + target[0] + ', ' + target[1]);
						if (item.use.isBall) return Chat.parse("/throwpokeball " + item.id, inBattle, user, user.connections[0]); // Shouldn't happen, but just in case
						let toSend = user.userid + "|" + item.id + "|" + target[3] + (target[4] ? "|" + target[4] : '');
						inBattle.battle.send('useitem', toSend.replace(/\n/g, '\f'));
					} else {
						if (item.use.onlyBattle) return this.parse('/sggame bag ' + target[0] + ', ' + target[1]);
						let hadEffect = false;
						if (item.use.level) {
							let pokemon = Dex.getTemplate(player.party[target[3]].species);
							if (player.party[target[3]] && player.party[target[3]].level < 100) {
								let olvl = player.party[target[3]].level;
								let lvl = olvl += item.use.level;
								if (lvl > 100) lvl = 100;
								player.party[target[3]].level = lvl;
								player.party[target[3]].exp = SG.calcExp(player.party[target[3]].species, lvl);
								user.console.queue.push('text|' + player.party[target[3]].name + ' was elevated to level ' + player.party[target[3]].level + '!');
								// New Moves
								let baseSpecies = null;
								let canReturn = true;
								if (pokemon.baseSpecies) baseSpecies = Dex.getTemplate(pokemon.baseSpecies);
								if (!pokemon.learnset && baseSpecies && baseSpecies.learnset) {
									pokemon.learnset = baseSpecies.learnset;
								}
								let used = [];
								for (let move in pokemon.learnset) {
									for (let learned in pokemon.learnset[move]) {
										if (pokemon.learnset[move][learned].substr(0, 2) in {'7L': 1} && parseInt(pokemon.learnset[move][learned].substr(2)) > olvl && parseInt(pokemon.learnset[move][learned].substr(2)) <= lvl && !used[move]) {
											user.console.queue.push("learn|" + target[3] + "|" + move);
											canReturn = false;
											used.push(move);
										}
									}
								}
								// Evolution
								// TODO
								if (!canReturn) {
									user.console.curPane = null;
								} else {
									let org = user.console.queue.shift();
									org += '<br/><button style="border: none; background: none; color: purple; cursor: pointer;" name="send" value="/sggame bag ' + target[0] + ', ' + target[1] + '">Return to bag</button>';
									user.console.queue.unshift(org);
								}
								player.bag[target[0]][target[1]]--;
								Db.players.set(user.userid, player);
								return user.console.update(user.console.curScreen[0], user.console.next(canReturn), null);
							}
						}
						if (item.use.triggerEvo) {
							user.console.queue.push('text|But it would have no effect... (Evolution isnt coded yet!)<br/><button style="border: none; background: none; color: purple; cursor: pointer;" name="send" value="/sggame bag ' + target[0] + ', ' + target[1] + '">Return to bag</button>');
						} else if (!hadEffect) {
							user.console.queue.push('text|But it would have no effect...<br/><button style="border: none; background: none; color: purple; cursor: pointer;" name="send" value="/sggame bag ' + target[0] + ', ' + target[1] + '">Return to bag</button>');
						} else {
							player.bag[target[0]][target[1]]--;
							Db.players.set(user.userid, player);
						}
						return user.console.update(user.console.curScreen[0], user.console.next(true), null);
					}
				}
			}
			return user.console.update(null, user.console.bag(target[0], target[1]), user.console.buildBase('bag', data));
		},
		pokemon: function (target, room, user, connection, cmd) {
			if (!user.console || user.console.gameId !== 'SGgame') return;
			if (user.console.queue.length) return;
			target = target.split(',');
			target = target.map(data => {
				return data.trim();
			});
			for (let key of user.inRooms) {
				if (key.substr(0, 6) === 'battle' && Dex.getFormat(Rooms(key).format).useSGgame && user.games.has(key) && target[0] !== 'close') return false;
			}
			if (target[0] === 'close') {
				user.console.curPane = null;
				return user.console.update(null, user.console.buildMap(), null);
			}
			if (user.console.curPane && user.console.curPane !== 'pokemon') return;
			user.console.curPane = 'pokemon';
			let data = {};
			let player = Db.players.get(user.userid);
			let detail = null;
			if (!target[0]) {
				data = {move: '/sggame pokemon move'};
				return user.console.update(null, user.console.summary(), user.console.buildBase('pokemon', data));
			}
			if (target[0] === 'take') {
				if (!player.party[target[1]]) return this.parse('/sggame pokemon');
				let item = SG.getItem(player.party[target[1]].item);
				if (!item) return this.parse('/sggame pokemon summary, ' + target[1]);
				if (!player.bag[item.slot][item.id]) player.bag[item.slot][item.id] = 0;
				player.bag[item.slot][item.id]++;
				player.party[target[1]].item = false;
				return this.parse('/sggame pokemon summary, ' + target[1]);
			}
			if (target[0] === 'pokemon' || target[0] === 'summary' || target[0] === 'stats') {
				detail = Number(target[1]);
				target[1] = player.party[detail] || null;
				data.back = (target[0] === 'stats' ? '/sggame pokemon summary, ' + detail : '/sggame pokemon');
				data.nick = '/help sggame nickname';
				if (player.party[detail].item) data.take = '/sggame pokemon take, ' + detail;
			}
			if (target[0] === 'move') {
				if (target[1] && target[2]) {
					target[1] = Number(target[1]);
					target[2] = Number(target[2]);
					if (isNaN(target[1]) || isNaN(target[2]) || !player.party[target[1]] || !player.party[target[2]]) return this.parse('/sggame pokemon');
					let holding = player.party[target[1]];
					player.party[target[1]] = player.party[target[2]];
					player.party[target[2]] = holding;
					Db.players.set(user.userid, player);
					return this.parse('/sggame pokemon');
				} else {
					data.cancel = '/sggame pokemon';
					return user.console.update(null, user.console.summary(target[0], null, target[1] || null), user.console.buildBase('pokemon', data));
				}
			}
			return user.console.update(null, user.console.summary(target[0], target[1], detail), user.console.buildBase('pokemon', data));
		},
		pokedex: function (target, room, user, connection, cmd) {
			if (!user.console || user.console.gameId !== 'SGgame') return;
			return this.sendReply('Not Avaliable');
		},
		back: function (target, room, user) {
			if (!user.console || user.console.gameId !== 'SGgame') return;
			user.console.update(user.console.prevScreen[0], user.console.prevScreen[1], user.console.prevScreen[2]);
		},
		pc: function (target, room, user, connection, cmd) {
			if (!user.console || user.console.gameId !== 'SGgame') return;
			if (user.console.queue.length) return; // No PC while talking
			target = target.split(',');
			target = target.map(data => {
				return data.trim();
			});
			if (user.console.curPane && user.console.curPane !== 'pc') return;
			for (let key of user.inRooms) {
				if (key.substr(0, 6) === 'battle' && Dex.getFormat(Rooms(key).format).useSGgame && user.games.has(key) && target[2] !== 'close') return false; // No PC while battling
			}
			let slot = target[1];
			let box = (target[0].split('|')[0] === 'party' ? target[0].split('|')[1] : target[0]);
			let orders = {};
			if (target[0].split('|')[0] === 'party' && slot && Db.players.get(user.userid).party.length > 1 && !isNaN(Number(slot)) && Number(slot) > -1 && Number(slot) < 6 && !target[2]) {
				orders = {deposit: true, release: true, back: true};
			}
			if (slot && !isNaN(Number(slot)) && Number(slot) > -1 && Number(slot) < 30 && Db.players.get(user.userid).pc[Number(box) - 1][Number(slot)] && !target[2] && target[0].split('|')[0] !== 'party') {
				orders = {withdraw: (Db.players.get(user.userid).party.length < 6), release: true, back: true};
			}
			if (target[2] === 'release') orders.back = true;
			if ((slot || Number(slot) === 0) && !target[2]) orders.back = true;
			switch (target[2]) {
			case 'withdraw':
				if (target[0].split('|')[0] === 'party') {
					target[2] = '';
					orders = {deposit: (Db.players.get(user.userid).party.length > 1), release: (Db.players.get(user.userid).party.length > 1), back: true};
				}
				break;
			case 'deposit':
				if (target[0].split('|')[0] !== 'party') {
					target[2] = '';
					orders = {withdraw: (Db.players.get(user.userid).party.length < 6), release: true, back: true};
				}
				break;
			case 'release':
			case 'confirmrelease':
				if (target[0].split('|')[0] === 'party' && Db.players.get(user.userid).party.length <= 1) {
					target[2] = '';
					orders = {back: true};
				}
				break;
			}
			orders.box = target[0];
			orders.slot = slot;
			let base = ((target[2] === 'close' || (user.console.curPane && user.console.curPane !== 'pc')) ? user.console.buildBase() : user.console.buildBase('pc', orders));
			return user.console.update(user.console.curScreen[0], user.console.pc(target[0], slot, target[2]), base);
		},
		nickname: function (target, room, user) {
			if (!user.console || user.console.gameId !== 'SGgame') return;
			if (!target) return this.parse('/help sggame nickname');
			target = target.split(',');
			target[0] = Number(toId(target[0]));
			if (isNaN(target[0])) return this.errorReply("[party slot] should be a number between 1 and 6.");
			target[0] -= 1; // array offset
			let player = Db.players.get(user.userid);
			if (!player) return this.errorReply("You need to advance farther in the game before you can use this command!");
			if (!player.party[target[0]]) return this.errorReply("There is no pokemon in slot #" + (target[0] + 1) + " in your party.");
			if (target[1].trim().length > 12) return this.errorReply("Nicknames cannot be more than 12 characters.");
			if (player.party[target[0]].ot !== user.userid) return this.errorReply("You can't change the nickname of a pokemon that your not the original trainer of!");
			let result = player.nickname(target[1], target[0]);
			if (!result) {
				return this.errorReply("The nickname you choose is not allowed.");
			} else {
				return this.sendReply("Your " + player.party[target[0]].species + "'s nickname has been set to: \"" + player.party[target[0]].name + "\".");
			}
		},
		nicknamehelp: ["/sggame nickname [party slot], [new nickname] - Set a pokemon's nickname. The pokemon needs to be in your party, and party slot should be the number of the slot the pokemon is in (1-6)."],
	},
	confirmpickstarter: 'pickstarter',
	pickstarter: function (target, room, user, connection, cmd) {
		if (!user.console || user.console.gameId !== 'SGgame') return;
		let starters = ['Bulbasaur', 'Chikorita', 'Treecko', 'Turtwig', 'Snivy', 'Chespin', 'Rowlet', 'Charmander', 'Cyndaquil', 'Torchic', 'Chimchar', 'Tepig', 'Fennekin', 'Litten', 'Squirtle', 'Totodile', 'Mudkip', 'Piplup', 'Oshawott', 'Froakie', 'Popplio', 'Pikachu', 'Eevee'];
		if (!target || starters.indexOf(target) === -1) return false;
		let type, typeColor;
		if (starters.indexOf(target) <= 6) {
			type = "Grass";
			typeColor = "green";
		} else if (starters.indexOf(target) >= 7 && starters.indexOf(target) <= 13) {
			type = "Fire";
			typeColor = "red";
		} else if (starters.indexOf(target) >= 14 && starters.indexOf(target) <= 20) {
			type = "Water";
			typeColor = "blue";
		} else if (starters.indexOf(target) === 21) {
			type = "Electric";
			typeColor = "yellow";
		} else {
			type = "Normal";
			typeColor = "#B08257";
		}
		switch (cmd) {
		case 'pickstarter':
			user.console.update(null, "<br /><br /><br /><br /><br /><div style='background-color:rgba(0, 0, 0, 0.4); border-radius:8px; text-align:center'><b><font size='3'>Do You Want to Pick <font color='" + typeColor + "'>" + type + " type " + target + " </font></b>?<br /><img src='http://play.pokemonshowdown.com/sprites/xyani/" + toId(target) + ".gif'><br /><button class='button' name='send' value='/confirmpickstarter " + target + "'>Yes</button>&nbsp;&nbsp;<button class='button' name='send' value='/sggame back'>No</button></div>", null);
			break;
		case 'confirmpickstarter':
			let obj = new Player(user, Dex.fastUnpackTeam(SG.makeWildPokemon(false, false, {species: target, level: 10, ability: 0, ot: user.userid})));
			Db.players.set(user.userid, obj);
			user.console.lastNextAction = null;
			this.parse('/sggame next');
		}
	},
	throwpokeball: function (target, room, user) {
		if (!user.console || user.console.gameId !== 'SGgame') return;
		if (!room.battle || toId(room.battle.format) !== 'gen7wildpokemonalpha') return this.errorReply('You can\'t throw a pokeball here!');
		if (room.battle.ended) return this.errorReply('The battle is already over, you can\'t throw a pokeball.');
		target = toId(target);
		if (['pokeball', 'greatball', 'ultraball', 'masterball'].indexOf(target) === -1) return this.errorReply('Thats not a pokeball, or at least not one we support.');
		let obj = Db.players.get(user.userid);
		if (!obj) return false;
		if (!obj.bag.pokeballs[target]) return this.errorReply("You don't have any " + target + "'s");
		let side = (toId(room.battle.p1.name) === toId(user) ? "p1" : "p2");
		if (room.battle.ended) return this.errorReply('The battle has already ended.');
		if (toId(room.battle[side].name) !== user.userid) return this.errorReply('You cant throw a pokeball because your not the trainer here!');
		// Taking the pokeball is handled after throwing it in the battle process
		let data = target + "|" + user.name;
		room.battle.send('pokeball', data.replace(/\n/g, '\f'));
	},
};
