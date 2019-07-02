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
		if (!this.can('perma')) return;
		if (!toId(target)) return this.parse('/help permalock');
		let tarUser = Users(target);
		if (!tarUser && (cmd !== 'offlinepermalock' && cmd !== 'forceofflinepermalock')) return this.errorReply('User ' + target + ' not found. If your sure you want to permalock them, use /offlinepermalock.');
		if (tarUser && (cmd === 'offlinepermalock' || cmd === 'forceofflinepermalock')) return this.parse('/permalock ' + target);
		if (cmd === 'offlinepermalock' || cmd === 'forceofflinepermalock') {
			target = toId(target);
			if (Db.userType.get(target, 0) === 5) return this.errorReply(target + ' is already permalocked.');
			if (Users.usergroups[target] && cmd !== 'forceofflinepermalock') return this.errorReply(target + ' is a trusted user. If your sure you want to permalock them, please use /forceofflinepermalock');
			Db.userType.set(target, 5);
			if (Users.usergroups[target]) {
				Users.setOfflineGroup(target, ' ');
				Monitor.log('[CrisisMonitor] Trusted user ' + target + ' was permalocked by ' + user.name + ' and was automatically demoted from ' + Users.usergroups[target].substr(0, 1) + '.');
			}
			if (Rooms('upperstaff')) Monitor.adminlog('[PermaMonitor] ' + user.name + ' has (offline) permalocked ' + target + '.');
			this.globalModlog("PERMALOCK", target, " by " + user.name);
			return this.addModAction(target + ' was permalocked by ' + user.name + '.');
		}
		if (!tarUser.registered) return this.errorReply('Only registered users can be permalocked.');
		if (Db.userType.get(tarUser.userid, 0) >= 5) {
			if (Db.userType.get(tarUser.userid, 0) === 5) return this.errorReply(tarUser.name + ' is already permalocked.');
			if (cmd !== 'forcepermalock') return this.errorReply(tarUser.name + ' is permabanned and cannot be permalocked. If you want to change their permaban to a permalock, please use /forcepermalock');
		}
		if (tarUser.trusted && cmd !== 'forcepermalock') return this.errorReply(tarUser.name + ' is a trusted user. If your sure you want to permalock them, please use /forcepermalock');
		Db.userType.set(tarUser.userid, 5);
		if (!Punishments.userids.get(tarUser.userid) || Punishments.userids.get(tarUser.userid)[0] !== 'BAN') Punishments.lock(tarUser, Date.now() + (1000 * 60 * 60 * 24 * 30), tarUser.userid, `Permalocked as ${tarUser.userid}`);
		tarUser.popup('You have been permalocked by ' + user.name + '.\nUnlike permalocks issued by the main server, this permalock only eaffcts this server.');
		if (tarUser.trusted) Monitor.log('[CrisisMonitor] Trusted user ' + tarUser.userid + ' was permalocked by ' + user.name + ' and was automatically demoted from ' + tarUser.distrust() + '.');
		if (Rooms('upperstaff')) Monitor.adminlog('[PermaMonitor] ' + user.name + ' has permalocked ' + tarUser.name + '.');
		this.globalModlog("PERMALOCK", tarUser, " by " + user.name);
		return this.addModAction(tarUser.name + ' was permalocked by ' + user.name + '.');
	},
	permalockhelp: ['/permalock [user] - Permanently lock a user. Requires: ~'],

	unpermalock: function (target, room, user, connection, cmd) {
		if (!this.can('perma')) return;
		if (!toId(target)) return this.parse('/help unpermalock');
		target = toId(target);
		if (Db.userType.get(target, 0) < 5) return this.errorReply(target + ' is not permalocked.');
		if (Db.userType.get(target, 0) === 6) return this.errorReply(target + ' is permabanned. If you want to unpermaban them, use /unpermaban');
		Db.userType.set(target, 0);
		Punishments.unlock(target);
		if (Users(target)) Users(target).popup('Your permalock was lifted by ' + user.name + '.');
		if (Rooms('upperstaff')) Monitor.adminlog('[PermaMonitor] ' + user.name + ' has unpermalocked ' + target + '.');
		this.globalModlog("UNPERMALOCK", (Users(target) || target), " by " + user.name);
		return this.addModAction(target + ' was unpermalocked by ' + user.name + '.');
	},
	unpermalockhelp: ['/unpermalock [user] - Undo a permanent lock. Requires: ~'],

	forceofflinepermaban: 'permaban',
	offlinepermaban: 'permaban',
	forcepermaban: 'permaban',
	permaban: function (target, room, user, connection, cmd) {
		if (!this.can('perma')) return;
		if (!toId(target)) return this.parse('/help permaban');
		let tarUser = Users(target);
		if (!tarUser && (cmd !== 'offlinepermaban' && cmd !== 'forceofflinepermaban')) return this.errorReply('User ' + target + ' not found. If your sure you want to permaban them, use /offlinepermaban.');
		if (tarUser && (cmd === 'offlinepermaban' || cmd === 'forceofflinepermaban')) return this.parse('/permaban ' + target);
		if (cmd === 'offlinepermaban' || cmd === 'forceofflinepermaban') {
			target = toId(target);
			if (Db.userType.get(target, 0) === 6) return this.errorReply(target + ' is already permabanned.');
			if (Users.usergroups[target] && cmd !== 'forceofflinepermaban') return this.errorReply(target + ' is a trusted user. If your sure you want to permaban them, please use /forceofflinepermaban');
			Db.userType.set(target, 6);
			if (Users.usergroups[target]) {
				Users.setOfflineGroup(target, ' ');
				Monitor.log('[CrisisMonitor] Trusted user ' + target + ' was permabanned by ' + user.name + ' and was automatically demoted from ' + Users.usergroups[target].substr(0, 1) + '.');
			}
			if (Rooms('upperstaff')) Monitor.adminlog('[PermaMonitor] ' + user.name + ' has (offline) permabanned ' + target + '.');
			this.globalModlog("PERMABAN", target, " by " + user.name);
			return this.addModAction(target + ' was permabanned by ' + user.name + '.');
		}
		if (!tarUser.registered) return this.errorReply('Only registered users can be permalocked.');
		if (Db.userType.get(tarUser.userid, 0) === 6) return this.errorReply(tarUser.name + ' is already permabanned.');
		if (tarUser.trusted && cmd !== 'forcepermaban') return this.errorReply(tarUser.name + ' is a trusted user. If your sure you want to permaban them, please use /forcepermaban');
		Db.userType.set(tarUser.userid, 6);
		tarUser.popup('You have been permabanned by ' + user.name + '.\nUnlike permabans issued by the main server, this permaban only affects this server.');
		Punishments.ban(tarUser, Date.now() + (1000 * 60 * 60 * 24 * 30), tarUser.userid, `Permabanned as ${tarUser.userid}`);
		if (tarUser.trusted) Monitor.log('[CrisisMonitor] Trusted user ' + tarUser.userid + ' was permabanned by ' + user.name + ' and was automatically demoted from ' + tarUser.distrust() + '.');
		if (Rooms('upperstaff')) Monitor.adminlog('[PermaMonitor] ' + user.name + ' has permabanned ' + tarUser.name + '.');
		this.globalModlog("PERMABAN", tarUser, " by " + user.name);
		return this.addModAction(tarUser.name + ' was permabanned by ' + user.name + '.');
	},
	permabanhelp: ['/permaban [user] - Permanently ban a user. Requires: ~'],
	unpermaban: function (target, room, user, connection, cmd) {
		if (!this.can('perma')) return;
		if (!toId(target)) return this.parse('/help unpermaban');
		target = toId(target);
		if (Db.userType.get(target, 0) !== 6) return this.errorReply(target + ' is not permabanned.');
		Db.userType.set(target, 0);
		Punishments.unban(target);
		if (Rooms('upperstaff')) Monitor.adminlog('[PermaMonitor] ' + user.name + ' has unpermabanned ' + target + '.');
		this.globalModlog("UNPERMABAN", target, " by " + user.name);
		return this.addModAction(target + ' was unpermabanned by ' + user.name + '.');
	},
	unpermabanhelp: ['/unpermaban [user] - Undo a permanent ban. Requires: ~'],
};
