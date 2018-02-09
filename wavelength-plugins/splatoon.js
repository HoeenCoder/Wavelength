/***************************
 * Splatoon Plug-in for PS	*
 * Created by Insist			*
 * Assisted by HoeenHero	*
 ***************************/

"use strict";

let SPLATFEST = {alpha: null, bravo: null, active: false};

let weapons = [".52 Gal", ".52 Gal Deco", ".96 Gal", "Aerospray MG", "Aerospray RG", "Bamboozler 14 Mk I", "Bamboozler 14 Mk II", "Blaster", "Carbon Roller", "Clash Blaster", "Clash Blaster Neo", "Classic Squiffer", "Custom Blaster", "Custom E-Liter 4K", "Custom E-Liter 4K Scope", "Custom Goo Tuber", "Custom Hydra Splatling", "Custom Jet Squelcher", "Custom Range Blaster", "Custom Splattershot Jr.", "Dapple Dualies", "Dapple Dualies Nouveau", "Dark Tetra Dualies", "Dualie Squelchers", "Dynamo Roller", "E-Liter 4K", "E-Liter 4K Scope", "Enperry Splat Dualies", "Firefin Splat Charger", "Firefine Splatterscope", "Flingza Roller", "Foil Flingza Roller", "Forge Splattershot Pro", "Foil Squeezer", "Glooga Dualies", "Glooga Dualies Deco", "Gold Dynamo Roller", "Goo Tuber", "H-3 Nozzlenose", "Heavy Splatling", "Heavy Splatling Deco", "Hero Blaster Replica", "Hero Brella Replica", "Hero Charger Replica", "Hero Dualie Replica", "Hero Roller Replica", "Hero Shot Replica", "Hero Slosher Replica", "Hero Splatling Replica", "Herobrush Replica", "Hydra Splatling", "Inkbrush", "Inkbrush Nouveau", "Jet Squelcher", "Krak-On Splat Roller", "L-3 Nozzlenose", "L-3 Nozzlenose D", "Light Tetra Dualies", "Luna Blaster", "Luna Blaster Neo", "Mini Splatling", "Neo Splash-o-matic", "Neo Sploosh-o-matic", "New Squiffer", "N-ZAP '85", "N-ZAP '89", "Octobrush", "Octobrush Nouveau", "Range Blaster", "Rapid Blaster", "Rapid Blaster Deco", "Rapid Blaster Pro", "Slosher", "Slosher Deco", "Sloshing Machine", "Sloshing Machine Neo", "Sorella Brella", "Splash-o-matic", "Splat Brella", "Splat Charger", "Splat Dualies", "Splat Roller", "Splatterscope", "Splattershot", "Splattershot Jr.", "Splattershot Pro", "Sploosh-o-matic", "Squeezer", "Tenta Brella", "Tentatek Splattershot", "Tri-Slosher", "Tri-Slosher Nouveau", "Undercover Brella", "Zink Mini Splatling"];

exports.commands = {
	"spl2n": "splatoon",
	"splatoon2": "splatoon",
	splatoon: {
		ranking: "rank",
		ranks: "rank",
		rank: {
			clamblitz: "cb",
			cb: function (target, room, user) {
				if (!target) return this.parse("/splatoonhelp");
				target = target.trim().toUpperCase();
				let splatProfile = Db.splatoon.get(user.userid, {ranks: {}});
				if (!["C-", "C", "C+", "B-", "B", "B+", "A-", "A", "A+", "S", "S+"].includes(target)) return this.errorReply(`Invalid Ranking; check your spelling?`);
				splatProfile.ranks.cb = target;
				Db.splatoon.set(user.userid, splatProfile);
				return this.sendReply(`You have successfully set your Clam Blitz ranking to "${target}".`);
			},

			rainmaker: "rm",
			rm: function (target, room, user) {
				if (!target) return this.parse("/splatoonhelp");
				target = target.trim().toUpperCase();
				let splatProfile = Db.splatoon.get(user.userid, {ranks: {}});
				if (!["C-", "C", "C+", "B-", "B", "B+", "A-", "A", "A+", "S", "S+"].includes(target)) return this.errorReply(`Invalid Ranking; check your spelling?`);
				splatProfile.ranks.rm = target;
				Db.splatoon.set(user.userid, splatProfile);
				return this.sendReply(`You have successfully set your Rainmaker ranking to "${target}".`);
			},

			splatzones: "sz",
			splatzone: "sz",
			sz: function (target, room, user) {
				if (!target) return this.parse("/splatoonhelp");
				target = target.trim().toUpperCase();
				let splatProfile = Db.splatoon.get(user.userid, {ranks: {}});
				if (!["C-", "C", "C+", "B-", "B", "B+", "A-", "A", "A+", "S", "S+"].includes(target)) return this.errorReply(`Invalid Ranking; check your spelling?`);
				splatProfile.ranks.sz = target;
				Db.splatoon.set(user.userid, splatProfile);
				return this.sendReply(`You have successfully set your Splat Zones ranking to "${target}".`);
			},

			towercontrol: "tc",
			tc: function (target, room, user) {
				if (!target) return this.parse("/splatoonhelp");
				target = target.trim().toUpperCase();
				let splatProfile = Db.splatoon.get(user.userid, {ranks: {}});
				if (!["C-", "C", "C+", "B-", "B", "B+", "A-", "A", "A+", "S", "S+"].includes(target)) return this.errorReply(`Invalid Ranking; check your spelling?`);
				splatProfile.ranks.tc = target;
				Db.splatoon.set(user.userid, splatProfile);
				return this.sendReply(`You have successfully set your Tower Control ranking to "${target}".`);
			},

			salmonrun: "sr",
			sr: function (target, room, user) {
				if (!target) return this.parse("/splatoonhelp");
				target = target.trim().split("-").map(x => x.charAt(0).toUpperCase() + x.slice(1).toLowerCase()).join("-");
				let splatProfile = Db.splatoon.get(user.userid, {ranks: {}});
				if (!["Intern", "Apprentice", "Part-Timer", "Go-Getter", "Overachiever", "Profreshional"].includes(target)) return this.errorReply(`Invalid Ranking; check your spelling?`);
				splatProfile.ranks.sr = target;
				Db.splatoon.set(user.userid, splatProfile);
				return this.sendReply(`You have successfully set your Salmon Run ranking as "${target}".`);
			},

			"": "help",
			help: function (target, room, user) {
				this.parse(`/splatrankshelp`);
			},
		},

		weapon: function (target, room, user) {
			if (!target) return this.parse(`/splatoonhelp`);
			let splatProfile = Db.splatoon.get(user.userid, {ranks: {}});
			if (!weapons.includes(target)) return this.errorReply(`Invalid weapon; check your spelling? [case sensitive]`);
			splatProfile.weapon = target;
			Db.splatoon.set(user.userid, splatProfile);
			return this.sendReply(`Your Splatoon 2 weapon has been set to "${target}".`);
		},

		randweapon: "randomweapon",
		randomweapon: function (target, room, user) {
			if (!this.runBroadcast()) return;
			return this.sendReplyBox(`<strong>Randomly Generated Weapon:</strong> ${weapons[Math.floor(Math.random() * weapons.length)]}`);
		},

		splatfest: {
			enable: "on",
			start: "on",
			new: "on",
			make: "on",
			on: function (target, room, user) {
				if (!this.can("ban", null, room)) return this.errorReply(`You must be a Room Moderator or higher to use this command.`);
				if (room.id !== "splatoon") return this.errorReply(`This command only works in the Splatoon room.`);
				let [team1, team2] = target.split(",").map(p => p.trim());
				if (!(team1 && team2)) return this.parse("/splatoonhelp");
				if (SPLATFEST.active) return this.errorReply(`Splatfest is already active.`);
				SPLATFEST.active = true;
				if (Rooms("splatoon")) {
					Rooms("splatoon").addRaw(`${WL.nameColor(user.name, true)} has enabled Splatfest. The teams of this Splatfest are: ${team1} and ${team2}.`);
				}
				// Set Splatfest Teams
				SPLATFEST.alpha = team1;
				SPLATFEST.bravo = team2;
			},

			disable: "off",
			end: "off",
			cancel: "off",
			remove: "off",
			off: function (target, room, user) {
				if (!this.can("ban", null, room)) return this.errorReply(`You must be a Room Moderator or higher to use this command.`);
				if (room.id !== "splatoon") return this.errorReply(`This command only works in the Splatoon room.`);
				if (!SPLATFEST.active) return this.errorReply(`Splatfest is not currently active.`);
				SPLATFEST.active = false;
				let splatfestUsers = Db.splatoon.keys();
				for (let u of splatfestUsers) {
					let splatProfile = Db.splatoon.get(u, {ranks: {}});
					if (splatProfile.splatfest) {
						delete splatProfile.splatfest;
						Db.splatoon.set(u, splatProfile);
					}
				}
				if (Rooms("splatoon")) {
					Rooms("splatoon").addRaw(`${WL.nameColor(user.name, true)} has disabled Splatfest.`);
				}
				// Clear splatfest teams
				SPLATFEST.alpha = null;
				SPLATFEST.bravo = null;
			},

			j: "join",
			setteam: "join",
			jointeam: "join",
			join: function (target, room, user) {
				if (!target) return this.parse(`/splatoonhelp`);
				if (!SPLATFEST.active) return this.errorReply(`There is currently not a Splatfest. :(`);
				if (toId(SPLATFEST.alpha) !== toId(target) && toId(SPLATFEST.bravo) !== toId(target)) return this.errorReply(`This is not a Splatfest team.`);
				let splatProfile = Db.splatoon.get(user.userid);
				splatProfile.splatfest = (toId(target) === toId(SPLATFEST.alpha) ? SPLATFEST.alpha : SPLATFEST.bravo);
				Db.splatoon.set(user.userid, splatProfile);
				return this.sendReply(`You have successfully joined Splatfest Team "${target}".`);
			},

			teams: "team",
			team: function (target, room, user) {
				if (!this.runBroadcast()) return;
				if (!SPLATFEST.active) return this.errorReply(`There is currently not a Splatfest. :(`);
				return this.sendReplyBox(`<strong>Splatfest Teams:</strong> ${SPLATFEST.alpha} and ${SPLATFEST.bravo}`);
			},

			"": "help",
			help: function (target, room, user) {
				this.parse(`/splatfesthelp`);
			},
		},

		name: "ign",
		ingamename: "ign",
		ign: function (target, room, user) {
			if (!this.canTalk()) return false;
			if (!target || !target.trim() || target.length > 10) return this.errorReply(`Your IGN must be between 1-10 characters long.`);
			let splatProfile = Db.splatoon.get(user.userid, {ranks: {}});
			splatProfile.ign = target;
			Db.splatoon.set(user.userid, splatProfile);
			return this.sendReply(`Your In-Game Name has been set as: "${target}".`);
		},

		lvl: "level",
		level: function (target, room, user) {
			target = parseInt(target);
			if (isNaN(target) || target > 99 || target < 1) return this.errorReply(`Your level must be a number between 1-99 (no decimals).`);
			let splatProfile = Db.splatoon.get(user.userid, {ranks: {}});
			splatProfile.level = target;
			Db.splatoon.set(user.userid, splatProfile);
			return this.sendReply(`Your Level has been set to: Level ${target}.`);
		},

		profile: function (target, room, user) {
			if (!this.runBroadcast()) return;
			if (!target) target = user.userid;
			target = toId(target);
			if (target.length > 18) return this.errorReply("Usernames cannot exceed 18 characters.");
			let targetUser = Users.get(target);
			let username = (targetUser ? targetUser.name : target);
			let splatProfile = Db.splatoon.get(toId(username), {ranks: {}});

			let profile = `<div><strong>Name:</strong> ${WL.nameColor(toId(username), true, true)}`;
			if (splatProfile.ign) profile += ` <strong>In-game Name</strong>: ${splatProfile.ign}`;
			if (splatProfile.level) profile += ` <strong>Level</strong>: ${splatProfile.level}`;
			profile += `<br />`;
			if (Db.switchfc.has(toId(username))) {
				profile += `<strong>Switch Friend Code:</strong> SW-${Db.switchfc.get(toId(username))}<br />`;
			}
			if (splatProfile.weapon) {
				profile += `<strong>Weapon:</strong> ${splatProfile.weapon}<br />`;
			}
			if (splatProfile.splatfest && SPLATFEST.active) {
				profile += `<strong>Splatfest Team:</strong> ${splatProfile.splatfest}<br />`;
			}
			if (splatProfile.ranks.cb) {
				profile += `<strong>Clam Blitz:</strong> ${splatProfile.ranks.cb}<br />`;
			}
			if (splatProfile.ranks.rm) {
				profile += `<strong>Rainmaker:</strong> ${splatProfile.ranks.rm}<br />`;
			}
			if (splatProfile.ranks.sz) {
				profile += `<strong>Splat Zones:</strong> ${splatProfile.ranks.sz}<br />`;
			}
			if (splatProfile.ranks.tc) {
				profile += `<strong>Tower Control:</strong> ${splatProfile.ranks.tc}<br />`;
			}
			if (splatProfile.ranks.sr) {
				profile += `<strong>Salmon Run:</strong> ${splatProfile.ranks.sr}<br />`;
			}
			profile += `</div>`;
			this.sendReplyBox(profile);
		},

		"": "help",
		help: function (target, room, user) {
			this.parse("/splatoonhelp");
		},
	},

	splatoonhelp: [
		`/splatoon rank [Clam Blitz | Rainmaker | Splat Zones | Tower Control | Salmon Run] [rank] - Sets your Splatoon 2 Ranked Battle rank.
		/splatoon weapon [weapon] - Sets your Splatoon 2 Weapon.
		/splatoon IGN [Splatoon IGN] - Sets your Splatoon 2 IGN.
		/splatoon level [level] - Sets your Splatoon 2 Level.
		/splatoon splatfest start [1st Splatfest team name], [2nd Splatfest team name] - Initiates a Splatfest of the two teams.  Must have Room Moderator or higher in the Splatoon room. Requires @, &, #, ~.
		/splatoon splatfest end - Ends the Splatfest. Requires @, &, #, ~.
		/splatoon splatfest join [Splatfest team name] - Joins the specified Splatfest team.
		/splatoon splatfest teams - Shows the Splatfest teams.
		/splatoon randomweapon - Sends a random weapon from Splatoon 2 into chat.
		/splatoon profile [optional target] - Displays the specified user's Splatoon 2 Profile. Defaults to yourself.`,
	],

	splatrankshelp: [
		`/splatoon rank [Clam Blitz | Rainmaker | Splat Zones | Tower Control | Salmon Run] [rank] - Sets your Splatoon 2 Ranked Battle rank.`,
	],

	splatfesthelp: [
		`/splatoon splatfest start [1st Splatfest team name], [2nd Splatfest team name] - Initiates a Splatfest of the two teams.  Must have Room Moderator or higher in the Splatoon room. Requires @, &, #, ~.
		/splatoon splatfest end - Ends the Splatfest. Requires @, &, #, ~.
		/splatoon splatfest join [Splatfest team name] - Joins the specified Splatfest team.
		/splatoon splatfest teams - Shows the Splatfest teams.`,
	],
};
