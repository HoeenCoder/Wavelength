/***************************
 * Splatoon Plug-in for PS	*
 * Created by Insist			*
 * Assisted by HoeenHero	*
 ***************************/

"use strict";

let ranks = ["C-", "C", "C+", "B-", "B", "B+", "A-", "A", "A+", "S", "S+"];
let weapons = [".52 Gal", ".52 Gal Deco", ".96 Gal", "Aerospray MG", "Aerospray RG", "Bamboozler 14 Mk I", "Bamboozler 14 Mk II", "Blaster", "Carbon Roller", "Clash Blaster", "Clash Blaster Neo", "Classic Squiffer", "Custom Blaster", "Custom E-Liter 4K", "Custom E-Liter 4K Scope", "Custom Goo Tuber", "Custom Hydra Splatling", "Custom Jet Squelcher", "Custom Range Blaster", "Custom Splattershot Jr.", "Dapple Dualies", "Dapple Dualies Nouveau", "Dark Tetra Dualies", "Dualie Squelchers", "Dynamo Roller", "E-Liter 4K", "E-Liter 4K Scope", "Enperry Splat Dualies", "Firefin Splat Charger", "Firefine Splatterscope", "Flingza Roller", "Foil Flingza Roller", "Forge Splattershot Pro", "Foil Squeezer", "Glooga Dualies", "Glooga Dualies Deco", "Gold Dynamo Roller", "Goo Tuber", "H-3 Nozzlenose", "Heavy Splatling", "Heavy Splatling Deco", "Hero Blaster Replica", "Hero Brella Replica", "Hero Charger Replica", "Hero Dualie Replica", "Hero Roller Replica", "Hero Shot Replica", "Hero Slosher Replica", "Hero Splatling Replica", "Herobrush Replica", "Hydra Splatling", "Inkbrush", "Inkbrush Nouveau", "Jet Squelcher", "Krak-On Splat Roller", "L-3 Nozzlenose", "L-3 Nozzlenose D", "Light Tetra Dualies", "Luna Blaster", "Luna Blaster Neo", "Mini Splatling", "Neo Splash-o-matic", "Neo Sploosh-o-matic", "New Squiffer", "N-ZAP '85", "N-ZAP '89", "Octobrush", "Octobrush Nouveau", "Range Blaster", "Rapid Blaster", "Rapid Blaster Deco", "Rapid Blaster Pro", "Slosher", "Slosher Deco", "Sloshing Machine", "Sloshing Machine Neo", "Sorella Brella", "Splash-o-matic", "Splat Brella", "Splat Charger", "Splat Dualies", "Splat Roller", "Splatterscope", "Splattershot", "Splattershot Jr.", "Splattershot Pro", "Sploosh-o-matic", "Squeezer", "Tenta Brella", "Tentatek Splattershot", "Tri-Slosher", "Tri-Slosher Nouveau", "Undercover Brella", "Zink Mini Splatling"];
let headgears = ["18K Aviators", "Annaki Beret", "Annaki Mask", "Armor Helmet Replica", "Backwards Cap", "Bamboo Hat", "B-ball Headband", "Bike Helmet", "Black Arrowbands", "Blowfish Bell Hat", "Bobble Hat", "Bucket Hat", "Camo Mesh", "Camping Hat", "Classic Straw Boater", "Cycle King Cap", "Cycling Hat", "Designer Headphones", "Double Egg Shades", "Dust Blocker 2000", "Eminence Cuff", "Face Visor", "Fake Contacts", "Firefin Facemask", "FishFry Biscuit Bandana", "FishFry Visor", "Five-Panel Cap", "Forge Mask", "Fugu Bell Hat", "Full Moon Glasses", "Half-Rim Glasses", "Headlamp Helmet", "Hero Headphones Replica", "Hero Headset Replica", "Hickory Work Cap", "Hockey Helmet", "House-Tag Denim Cap", "Jellyvader Cap", "Jet Cap", "Jungle Hat", "King Facemask", "King Flip Mesh", "Knitted Hat", "Lightweight Cap", "Matte Bike Helmet", "Moist Ghillie Helmet", "Motocross Nose Guard", "MTB Helmet", "Noise Cancelers", "Paintball Mask", "Painter's Mask", "Paisley Bandana", "Patched Hat", "Pilot Glasses", "Power Mask", "Power Mask Mark I", "Retro Specs", "Safari Hat", "Samurai Helmet", "Short Beanie", "Skate Helmet", "Skull Bandana", "Sneaky Beanie", "Snorkel Mask", "Soccer Headband", "Special Forces Beret", "Splash Goggles", "Sporty Bobble Hat", "Squash Headband", "Squid Clip-ons", "Squid Facemask", "Squid Hairclip", "Squidfin Hook Cans", "Squidlife Headphones", "Squidvader Cap", "Squinja Mask", "Stealth Goggles", "Straw Boater", "Streetstyle Cap", "Striped Beanie", "Studio Headphones", "Sun Visor", "Takoroka Mesh", "Takoroka Visor", "Tennis Headband", "Tinted Shades", "Treasure Hunter", "Tulip Parasol", "Two-Stripe Mesh", "Urchins Cap", "Visor Skate Helmet", "Welding Mask", "White Headband", "Woolly Urchens Classic", "Yamagiri Beanie"];
let shirts = ["Aloha Shirt", "Anchor Sweat", "Armor Jacket Replica", "B-ball Jersey (Away)", "B-ball Jersey (Home)", "Baby-Jelly Shirt", "Baseball Jersey", "Basic Tee", "Berry Ski Jacket", "Black 8-Bit FishFry", "Black Anchor Tee", "Black Baseball LS", "Black Inky Rider", "Black Layered LS", "Black LS", "Black Pipe Tee", "Black Polo", "Black Squideye", "Black Tee", "Blue Peaks Tee", "Blue Peaks Tee", "Blue Sailor Suit", "Camo Layered LS", "Camo Zip Hoodie", "Carnivore Tee", "Choco Layered LS", "CoroCoro Hoodie", "Cycle King Jersey", "Cycling Shirt", "Dark Urban Vest", "FC Albacore", "Firefin Navy Sweat", "Forest Vest", "Forge Inkling Parka", "Forge Octarian Jacket", "Fugu Tee", "Grape Tee", "Gray College Sweat", "Gray Mixed Shirt", "Gray Vector Tee", "Green Cardigan", "Green Striped LS", "Green Tee", "Green Zip Hoodie", "Green-Check Shirt", "Herbivore Tee", "Hero Jacket Replica", "Ivory Peaks Tee", "Krak-On 528", "Layered Anchor LS", "Layered Vector LS", "Linen Shirt", "Logo Aloha Shirt", "Lumberjack Shirt", "Mint Tee", "Mountain Vest", "Navy College Sweat", "Navy Striped LS", "Octo Tee", "Octoling Armor", "Olive Ski Jacket", "Orange Cardigan", "Part-Time Pirate", "Pearl Tee", "Pirate-Stripe Tee", "Power Armor", "Purple Camo LS", "Rainy-Day Tee", "Red Vector Tee", "Red-Check Shirt", "Reel Sweat", "Reggae Tee", "Retro Gamer Sweat", "Retro Sweat", "Rockenberg Black", "Rockenberg White", "Rodeo Shirt", "Round-Collar Shirt", "Sage Polo", "Sailor-Stripe Tee", "Samurai Jacket", "School Jersey", "School Uniform", "Shirt & Tie", "Shrimp-Pink Polo", "Sky-Blue Squideye", "Slipstream United", "Splatfest Tee", "SQUID GIRL Tunic", "Squid Satin Jacket", "Squid-Pattern Waistcoat", "Squid-Stitch Tee", "Squidmark LS", "Squidmark Sweat", "Squidstar Waistcoat", "Striped Peaks LS", "Striped Rugby", "Striped Shirt", "Sunny-Day Tee", "Traditional Apron", "Tricolor Rugby", "Urchins Jersey", "Varsity Baseball LS", "Varsity Jacket", "Vintage Check Shirt", "White 8-Bit FishFry", "White Anchor Tee", "White Baseball LS", "White Inky Rider", "White Layered LS", "White Line Tee", "White LS", "White Sailor Suit", "White Shirt", "White Striped LS", "White Tee", "Yellow Layered LS", "Yellow Urban Vest", "Zapfish Satin Jacket", "Zekko Baseball LS", "Zekko Hoodie", "Zink Layered LS", "Zink LS"];
let shoes = ["Acerola Rain Boots", "Amber Sea Slug Hi-Tops", "Angry Rain Boots", "Annaki Habaneros", "Armor Boot Replicas", "Arrow Pull-Ons", "Birch Climbing Shoes", "Black Dakroniks", "Black Flip-Flops", "Black Norimaki 750s", "Black Seahorses", "Black Trainers", "Blue & Black Squidkid IV", "Blue Laceless Dakroniks", "Blue Lo-Tops", "Blue Moto Boots", "Blue Slip-Ons", "Blueberry Casuals", "Bubble Rain Boots", "Canary Trainers", "Cherry Kicks", "Choco Clogs", "Clownfish Basics", "Crazy Arrows", "Cream Basics", "Cyan Trainers", "Deepsea Leather Boots", "Fringed Loafers", "Gold Hi-Horses", "Gray Sea-Slug Hi-Tops", "Gray Yellow-Soled Wingtips", "Green Iromaki 750s", "Green Laceups", "Green Rain Boots", "Hero Runner Replicas", "Hero Snowboots Replicas", "Hunter Hi-Tops", "Hunting Boots", "Kid Clams", "LE Soccer Shoes", "Luminous Delta Straps", "Mawcasins", "Milky Enperrials", "Mint Dakroniks", "Moist Ghillie Boots", "Moto Boots", "Navy Enperrials", "Navy Red-Soled Wingtips", "Neon Delta Straps", "Neon Sea Slugs", "N-Pacer Ag", "N-Pacer Au", "Orange Arrows", "Orca Hi-Tops", "Orca Woven Hi-Tops", "Oyster Clogs", "Pink Trainers", "Piranha Moccasins", "Plum Casuals", "Polka-dot Slip-Ons", "Power Boots", "Power Boots Mk I", "Pro Trail Boots", "Punk Blacks", "Punk Cherries", "Punk Whites", "Purple Hi-Horses", "Purple Iromaki 750s", "Purple Sea Slugs", "Red & Black Squidkid IV", "Red FishFry Sandals", "Red Hi-Horses", "Red Hi-Tops", "Red Iromaki 750s", "Red Sea Slugs", "Red Slip-Ons", "Red-Mesh Sneakers", "Roasted Brogues", "Samurai Shoes", "School Shoes", "Shark Moccasins", "Smoky Wingtips", "Snow Delta Straps", "Snowy Down Boots", "Soccer Shoes", "	Squid-Stitch Slip-Ons", "Squinja Boots", "Squink Wingtips", "Strapping Reds", "Strapping Whites", "Sun & Shade Squidkid IV", "Sunny Climbing Shoes", "Sunset Orca Hi-Tops", "Tan Work Boots", "Trail Boots", "Turquoise Kicks", "Violet Trainers", "White Arrows", "White Kicks", "White Laceless Dakroniks", "White Norimaki 750s", "White Seahorses", "Yellow Iromaki 750s", "Yellow-Mesh Sneakers", "Zombie Hi-Horses"];

exports.commands = {
	"spl2n": "splatoon",
	"splatoon2": "splatoon",
	splatoon: {
		ranking: "rank",
		ranks: "rank",
		rank: {
			clamblitz: "cb",
			cb: function (target, room, user) {
				if (!target) return this.parse("/splatrankshelp");
				target = target.trim().toUpperCase();
				let splatProfile = Db.splatoon.get(user.userid, {ranks: {}});
				if (!ranks.includes(target)) return this.errorReply(`Invalid Ranking; check your spelling?`);
				splatProfile.ranks.cb = target;
				Db.splatoon.set(user.userid, splatProfile);
				return this.sendReply(`You have successfully set your Clam Blitz ranking to "${target}".`);
			},

			rainmaker: "rm",
			rm: function (target, room, user) {
				if (!target) return this.parse("/splatrankshelp");
				target = target.trim().toUpperCase();
				let splatProfile = Db.splatoon.get(user.userid, {ranks: {}});
				if (!ranks.includes(target)) return this.errorReply(`Invalid Ranking; check your spelling?`);
				splatProfile.ranks.rm = target;
				Db.splatoon.set(user.userid, splatProfile);
				return this.sendReply(`You have successfully set your Rainmaker ranking to "${target}".`);
			},

			splatzones: "sz",
			splatzone: "sz",
			sz: function (target, room, user) {
				if (!target) return this.parse("/splatrankshelp");
				target = target.trim().toUpperCase();
				let splatProfile = Db.splatoon.get(user.userid, {ranks: {}});
				if (!ranks.includes(target)) return this.errorReply(`Invalid Ranking; check your spelling?`);
				splatProfile.ranks.sz = target;
				Db.splatoon.set(user.userid, splatProfile);
				return this.sendReply(`You have successfully set your Splat Zones ranking to "${target}".`);
			},

			towercontrol: "tc",
			tc: function (target, room, user) {
				if (!target) return this.parse("/splatrankshelp");
				target = target.trim().toUpperCase();
				let splatProfile = Db.splatoon.get(user.userid, {ranks: {}});
				if (!ranks.includes(target)) return this.errorReply(`Invalid Ranking; check your spelling?`);
				splatProfile.ranks.tc = target;
				Db.splatoon.set(user.userid, splatProfile);
				return this.sendReply(`You have successfully set your Tower Control ranking to "${target}".`);
			},

			salmonrun: "sr",
			sr: function (target, room, user) {
				if (!target) return this.parse("/splatrankshelp");
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

		"!randomweapon": true,
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
				let SPLATFEST = Db.splatoon.get("SPLATFEST", {alpha: null, bravo: null, active: false});
				let [team1, team2] = target.split(",").map(p => p.trim());
				if (!(team1 && team2)) return this.parse("/splatfesthelp");
				if (SPLATFEST.active) return this.errorReply(`Splatfest is already active.`);
				SPLATFEST.active = true;
				if (Rooms("splatoon")) {
					Rooms("splatoon").addRaw(`${WL.nameColor(user.name, true)} has enabled Splatfest. The teams of this Splatfest are: ${team1} and ${team2}.`);
				}
				// Set Splatfest Data
				Db.splatoon.set("SPLATFEST", {alpha: team1, bravo: team2, active: true});
			},

			disable: "off",
			end: "off",
			cancel: "off",
			remove: "off",
			off: function (target, room, user) {
				if (!this.can("ban", null, room)) return this.errorReply(`You must be a Room Moderator or higher to use this command.`);
				if (room.id !== "splatoon") return this.errorReply(`This command only works in the Splatoon room.`);
				let SPLATFEST = Db.splatoon.get("SPLATFEST", {alpha: null, bravo: null, active: false});
				if (!SPLATFEST.active) return this.errorReply(`Splatfest is not currently active.`);
				let splatfestUsers = Db.splatoon.keys();
				// Clear Splatfest Data & Player's Data
				for (let u of splatfestUsers) {
					let splatProfile = Db.splatoon.get(u, {ranks: {}});
					Db.splatoon.set("SPLATFEST", {alpha: null, bravo: null, active: false});
					if (splatProfile.splatfest) {
						delete splatProfile.splatfest;
						Db.splatoon.set(u, splatProfile);
					}
					if (splatProfile.clothing === "Splatfest Tee") {
						delete splatProfile.clothing;
						Db.splatoon.set(u, splatProfile);
					}
				}
				if (Rooms("splatoon")) {
					Rooms("splatoon").addRaw(`${WL.nameColor(user.name, true)} has disabled Splatfest.`);
				}
			},

			j: "join",
			setteam: "join",
			jointeam: "join",
			join: function (target, room, user) {
				if (!target) return this.parse(`/splatfesthelp`);
				let SPLATFEST = Db.splatoon.get("SPLATFEST", {alpha: null, bravo: null, active: false});
				if (!SPLATFEST.active) return this.errorReply(`There is currently not a Splatfest. :(`);
				if (toId(SPLATFEST.alpha) !== toId(target) && toId(SPLATFEST.bravo) !== toId(target)) return this.errorReply(`This is not a Splatfest team.`);
				let splatProfile = Db.splatoon.get(user.userid);
				splatProfile.splatfest = (toId(target) === toId(SPLATFEST.alpha) ? SPLATFEST.alpha : SPLATFEST.bravo);
				Db.splatoon.set(user.userid, splatProfile);
				return this.sendReply(`You have successfully joined Splatfest Team "${target}".`);
			},

			"!team": true,
			teams: "team",
			team: function (target, room, user) {
				if (!this.runBroadcast()) return;
				let SPLATFEST = Db.splatoon.get("SPLATFEST", {alpha: null, bravo: null, active: false});
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

		prestige: "star",
		stars: "star",
		star: function (target, room, user) {
			target = parseInt(target);
			if (isNaN(target) || target < 1) return this.errorReply(`Your prestige must be an integer above 0.`);
			let splatProfile = Db.splatoon.get(user.userid, {ranks: {}});
			splatProfile.prestige = target;
			Db.splatoon.set(user.userid, splatProfile);
			return this.sendReply(`Your Prestige has been set to: Prestige ${target}.`);
		},

		gear: {
			hat: "headgear",
			cap: "headgear",
			headgear: function (target, room, user) {
				if (!target) return this.parse(`/splatgearhelp`);
				let splatProfile = Db.splatoon.get(user.userid, {ranks: {}});
				if (!headgears.includes(target)) return this.errorReply(`Invalid headgear; check your spelling? [case sensitive]`);
				splatProfile.headgear = target;
				Db.splatoon.set(user.userid, splatProfile);
				return this.sendReply(`Your Splatoon 2 headgear has been set to "${target}".`);
			},

			shirt: "clothing",
			tee: "clothing",
			clothing: function (target, room, user) {
				if (!target) return this.parse(`/splatgearhelp`);
				let splatProfile = Db.splatoon.get(user.userid, {ranks: {}});
				let SPLATFEST = Db.splatoon.get("SPLATFEST", {alpha: null, bravo: null, active: false});
				if (!shirts.includes(target)) return this.errorReply(`Invalid shirt; check your spelling? [case sensitive]`);
				if (target === "Splatfest Tee" && !SPLATFEST.active && !splatProfile.splatfest) return this.errorReply(`Your Splatfest Tee has been returned, since there is no longer a Splatfest or you haven't joined a Splatfest team yet.`)
				splatProfile.clothing = target;
				Db.splatoon.set(user.userid, splatProfile);
				return this.sendReply(`Your Splatoon 2 shirt has been set to "${target}".`);
			},

			shoes: function (target, room, user) {
				if (!target) return this.parse(`/splatgearhelp`);
				let splatProfile = Db.splatoon.get(user.userid, {ranks: {}});
				if (!shoes.includes(target)) return this.errorReply(`Invalid shoe; check your spelling? [case sensitive]`);
				splatProfile.shoes = target;
				Db.splatoon.set(user.userid, splatProfile);
				return this.sendReply(`Your Splatoon 2 shoes has been set to "${target}".`);
			},

			"": "help",
			help: function () {
				this.parse(`/splatgearhelp`);
			},
		},

		"!profile": true,
		profile: function (target, room, user) {
			if (!this.runBroadcast()) return;
			if (!target) target = user.userid;
			target = toId(target);
			if (target.length > 18) return this.errorReply("Usernames cannot exceed 18 characters.");
			let targetUser = Users.get(target);
			let username = (targetUser ? targetUser.name : target);
			let splatProfile = Db.splatoon.get(toId(username), {ranks: {}});
			let SPLATFEST = Db.splatoon.get("SPLATFEST", {alpha: null, bravo: null, active: false});

			let profile = `<div><strong>Name:</strong> ${WL.nameColor(toId(username), true, true)}`;
			if (splatProfile.ign) profile += ` <strong>In-Game Name:</strong> ${splatProfile.ign}`;
			if (splatProfile.level) profile += ` <strong>Level:</strong> ${splatProfile.level}`;
			if (splatProfile.prestige) profile += ` <strong>Prestige:</strong> ${splatProfile.prestige}`;
			profile += `<br />`;
			if (Db.switchfc.has(toId(username))) profile += `<strong>Switch Friend Code:</strong> SW-${Db.switchfc.get(toId(username))}<br />`;
			if (splatProfile.weapon) profile += `<strong>Weapon:</strong> ${splatProfile.weapon}<br />`;
			if (splatProfile.headgear) profile += `<strong>Headgear:</strong> ${splatProfile.headgear}<br />`;
			if (splatProfile.clothing) profile += `<strong>Clothing:</strong> ${splatProfile.clothing}<br />`;
			if (splatProfile.shoes) profile += `<strong>Shoes:</strong> ${splatProfile.shoes}<br />`;
			if (splatProfile.splatfest && SPLATFEST.active) profile += `<strong>Splatfest Team:</strong> ${splatProfile.splatfest}<br />`;
			if (splatProfile.ranks.cb) profile += `<strong>Clam Blitz:</strong> ${splatProfile.ranks.cb}<br />`;
			if (splatProfile.ranks.rm) profile += `<strong>Rainmaker:</strong> ${splatProfile.ranks.rm}<br />`;
			if (splatProfile.ranks.sz) profile += `<strong>Splat Zones:</strong> ${splatProfile.ranks.sz}<br />`;
			if (splatProfile.ranks.tc) profile += `<strong>Tower Control:</strong> ${splatProfile.ranks.tc}<br />`;
			if (splatProfile.ranks.sr)  profile += `<strong>Salmon Run:</strong> ${splatProfile.ranks.sr}<br />`;
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
		/splatoon prestige [prestige level] - Sets your Splatoon 2 Prestige.
		/splatoon splatfest start [1st Splatfest team name], [2nd Splatfest team name] - Initiates a Splatfest of the two teams.  Must have Room Moderator or higher in the Splatoon room. Requires @, &, #, ~.
		/splatoon splatfest end - Ends the Splatfest. Requires @, &, #, ~.
		/splatoon splatfest join [Splatfest team name] - Joins the specified Splatfest team.
		/splatoon splatfest teams - Shows the Splatfest teams.
		/splatoon gear headgear [headgear] - Sets your Splatoon 2 Headgear.
		/splatoon gear clothing [clothing] - Sets your Splatoon 2 Clothing.
		/splatoon gear shoes [shoes] - Sets your Splatoon 2 Shoes.
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

	splatgearhelp: [
		`/splatoon gear headgear [headgear] - Sets your Splatoon 2 Headgear.
		/splatoon gear clothing [clothing] - Sets your Splatoon 2 Clothing.
		/splatoon gear shoes [shoes] - Sets your Splatoon 2 Shoes.`,
	],
};
