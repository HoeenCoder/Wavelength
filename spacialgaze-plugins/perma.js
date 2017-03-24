/*************************
  Permalock / Permaban
  for side servers
  coded by HoeenHero
**************************/

'use strict';

exports.commands = {
	forceofflinepermalock: 'permalock',
	offlinepermalock: 'permalock',
	forcepermalock: 'permalock',
	permalock: function (target, room, user, connection, cmd) {
		if (!this.can('lockdown')) return;
		if (!toId(target)) return this.parse('/help permalock');
		let tarUser = Users(target);
		if (!tarUser && (cmd !== 'offlinepermalock' && cmd !== 'forceofflinepermalock')) return this.errorReply('User ' + target + ' not found. If your sure you want to permalock them, use /offlinepermalock.');
		if (tarUser && (cmd === 'offlinepermalock' || cmd === 'forceofflinepermalock')) return this.parse('/permalock ' + target);
		if (cmd === 'offlinepermalock' || cmd === 'forceofflinepermalock') {
			target = toId(target);
			if (Db.perma.get(target, 0) === 5) return this.errorReply(target + ' is already permalocked.');
			if (Users.usergroups[target] && cmd !== 'forceofflinepermalock') return this.errorReply(target + ' is a trusted user. If your sure you want to permalock them, please use /forceofflinepermalock');
			Db.perma.set(target, 5);
			if (Users.usergroups[target]) {
				Users.setOfflineGroup(target, ' ');
				Monitor.log('[CrisisMonitor] Trusted user ' + target + ' was permalocked by ' + user.name + ' and was automatically demoted from ' + Users.usergroups[target].substr(0, 1) + '.');
			}
			if (Rooms('upperstaff')) Rooms('upperstaff').add('[Perma Monitor] ' + user.name + ' has (offline) permalocked ' + target + '.').update();
			return this.addModCommand(target + ' was permalocked by ' + user.name + '.');
		}
		if (!tarUser.registered) return this.errorReply('Only registered users can be permalocked.');
		if (Db.perma.get(tarUser.userid, 0) >= 5) {
			if (Db.perma.get(tarUser.userid, 0) === 5) return this.errorReply(tarUser.name + ' is already permalocked.');
			if (cmd !== 'forcepermalock') return this.errorReply(tarUser.name + ' is permabanned and cannot be permalocked. If you want to change thier permaban to a permalock, please use /forcepermalock');
		}
		if (tarUser.trusted && cmd !== 'forcepermalock') return this.errorReply(tarUser.name + ' is a trusted user. If your sure you want to permalock them, please use /forcepermalock');
		Db.perma.set(tarUser.userid, 5);
		if (!Punishments.userids.get(tarUser.userid) || Punishments.userids.get(tarUser.userid)[0] !== 'BAN') Punishments.lock(tarUser, Date.now() + (1000 * 60 * 60 * 24 * 30), tarUser.userid, `Permalocked as ${tarUser.userid}`);
		tarUser.popup('You have been permalocked by ' + user.name + '.\nUnlike permalocks issued by the main server, this permalock only effects this server.');
		if (tarUser.trusted) Monitor.log('[CrisisMonitor] Trusted user ' + tarUser.userid + ' was permalocked by ' + user.name + ' and was automatically demoted from ' + tarUser.distrust() + '.');
		if (Rooms('upperstaff')) Rooms('upperstaff').add('[Perma Monitor] ' + user.name + ' has permalocked ' + tarUser.name + '.').update();
		return this.addModCommand(tarUser.name + ' was permalocked by ' + user.name + '.');
	},
	permalockhelp: ['/permalock user - Permalock a user. Requires: ~'],

	unpermalock: function (target, room, user, connection, cmd) {
		if (!this.can('lockdown')) return;
		if (!toId(target)) return this.parse('/help unpermalock');
		target = toId(target);
		if (Db.perma.get(target, 0) < 5) return this.errorReply(target + ' is not permalocked.');
		if (Db.perma.get(target, 0) === 6) return this.errorReply(target + ' is permabanned. If you want to unpermaban them, use /unpermaban');
		Db.perma.set(target, 0);
		Punishments.unlock(target);
		if (Users(target)) Users(target).popup('Your permalock was lifted by ' + user.name + '.');
		if (Rooms('upperstaff')) Rooms('upperstaff').add('[Perma Monitor] ' + user.name + ' has unpermalocked ' + target + '.').update();
		return this.addModCommand(target + ' was unpermalocked by ' + user.name + '.');
	},
	unpermalockhelp: ['/unpermalock user - Unpermalock a user. Requires: ~'],

	forceofflinepermaban: 'permaban',
	offlinepermaban: 'permaban',
	forcepermaban: 'permaban',
	permaban: function (target, room, user, connection, cmd) {
		if (!this.can('lockdown')) return;
		if (!toId(target)) return this.parse('/help permaban');
		let tarUser = Users(target);
		if (!tarUser && (cmd !== 'offlinepermaban' && cmd !== 'forceofflinepermaban')) return this.errorReply('User ' + target + ' not found. If your sure you want to permaban them, use /offlinepermaban.');
		if (tarUser && (cmd === 'offlinepermaban' || cmd === 'forceofflinepermaban')) return this.parse('/permaban ' + target);
		if (cmd === 'offlinepermaban' || cmd === 'forceofflinepermaban') {
			target = toId(target);
			if (Db.perma.get(target, 0) === 6) return this.errorReply(target + ' is already permabanned.');
			if (Users.usergroups[target] && cmd !== 'forceofflinepermaban') return this.errorReply(target + ' is a trusted user. If your sure you want to permaban them, please use /forceofflinepermaban');
			Db.perma.set(target, 6);
			if (Users.usergroups[target]) {
				Users.setOfflineGroup(target, ' ');
				Monitor.log('[CrisisMonitor] Trusted user ' + target + ' was permabanned by ' + user.name + ' and was automatically demoted from ' + Users.usergroups[target].substr(0, 1) + '.');
			}
			if (Rooms('upperstaff')) Rooms('upperstaff').add('[Perma Monitor] ' + user.name + ' has (offline) permabanned ' + target + '.').update();
			return this.addModCommand(target + ' was permabanned by ' + user.name + '.');
		}
		if (!tarUser.registered) return this.errorReply('Only registered users can be permalocked.');
		if (Db.perma.get(tarUser.userid, 0) === 6) return this.errorReply(tarUser.name + ' is already permabanned.');
		if (tarUser.trusted && cmd !== 'forcepermaban') return this.errorReply(tarUser.name + ' is a trusted user. If your sure you want to permaban them, please use /forcepermaban');
		Db.perma.set(tarUser.userid, 6);
		tarUser.popup('You have been permabanned by ' + user.name + '.\nUnlike permabans issued by the main server, this permaban only effects this server.');
		Punishments.ban(tarUser, Date.now() + (1000 * 60 * 60 * 24 * 30), tarUser.userid, `Permabanned as ${tarUser.userid}`);
		if (tarUser.trusted) Monitor.log('[CrisisMonitor] Trusted user ' + tarUser.userid + ' was permabanned by ' + user.name + ' and was automatically demoted from ' + tarUser.distrust() + '.');
		if (Rooms('upperstaff')) Rooms('upperstaff').add('[Perma Monitor] ' + user.name + ' has permabanned ' + tarUser.name + '.').update();
		return this.addModCommand(tarUser.name + ' was permabanned by ' + user.name + '.');
	},
	permabanhelp: ['/permaban user - Permaban a user. Requires: ~'],
	unpermaban: function (target, room, user, connection, cmd) {
		if (!this.can('lockdown')) return;
		if (!toId(target)) return this.parse('/help unpermaban');
		target = toId(target);
		if (Db.perma.get(target, 0) !== 6) return this.errorReply(target + ' is not permabanned.');
		Db.perma.set(target, 0);
		Punishments.unban(target);
		if (Rooms('upperstaff')) Rooms('upperstaff').add('[Perma Monitor] ' + user.name + ' has unpermabanned ' + target + '.').update();
		return this.addModCommand(target + ' was unpermabanned by ' + user.name + '.');
	},
	unpermabanhelp: ['/unpermaban user - Unpermaban a user. Requires: ~'],
};
