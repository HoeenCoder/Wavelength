var filepath = 'config/customcolors.json';
var customColors = {};
var fs = require('fs');
var request = require('request');
var path = require('path');

function load () {
        fs.readFile(filepath, 'utf8', function (err, file) {
                if (err) return;
                customColors = JSON.parse(file);
        });
}
load();

/*function logMoney(message) {
       if (!message) return;
       var file = path.join(__dirname, '../logs/money.txt');
       var date = "[" + new Date().toUTCString() + "] ";
       var msg = message + "\n";
       fs.appendFile(file, date + msg);
}*/


function updateColor() {
        fs.writeFileSync(filepath, JSON.stringify(customColors));

        var newCss = '/* COLORS START */\n';

        for (var name in customColors) {
                newCss += generateCSS(name, customColors[name]);
        }
        newCss += '/* COLORS END */\n';

        var file = fs.readFileSync('config/custom.css', 'utf8').split('\n');
        if (~file.indexOf('/* COLORS START */')) file.splice(file.indexOf('/* COLORS START */'), (file.indexOf('/* COLORS END */') - file.indexOf('/* COLORS START */')) + 1);
        fs.writeFileSync('config/custom.css', file.join('\n') + newCss);
        request('http://play.pokemonshowdown.com/customcss.php?server=skypillar&invalidate', function callback(error, res, body) {
                if (error) return console.log('updateColor error: ' + error);
        });
}
global.updateColor = updateColor;

function generateCSS(name, color) {
        var css = '';
        var rooms = [];
        name = toId(name);
        for (var room in Rooms.rooms) {
                if (Rooms.rooms[room].id === 'global' || Rooms.rooms[room].type !== 'chat' || Rooms.rooms[room].isPersonal) continue;
                rooms.push('#' + Rooms.rooms[room].id + '-userlist-user-' + name + ' strong em');
                rooms.push('#' + Rooms.rooms[room].id + '-userlist-user-' + name + ' strong');
                rooms.push('#' + Rooms.rooms[room].id + '-userlist-user-' + name + ' span');
        }
        css = rooms.join(', ');
        css += '{\ncolor: ' + color + ' !important;\n}\n';
        css += '.chat.chatmessage-' + name + ' strong {\n';
        css += 'color: ' + color + ' !important;\n}\n';
        return css;
}

exports.commands = {
        customcolor: function (target, room, user) {
                if (!this.can('hotpatch')) return false;
                target = target.split(',');
                for (var u in target) target[u] = target[u].trim();
                if (!target[1]) return this.parse('/help customcolor');
                if (toId(target[0]).length > 19) return this.errorReply("Usernames are not this long...");
                if (target[1] === 'delete') {
                        if (!customColors[toId(target[0])]) return this.errorReply('/customcolor - ' + target[0] + ' does not have a custom color.');
                        delete customColors[toId(target[0])];
                        updateColor();
                        this.sendReply("You removed " + target[0] + "'s custom color.");
                        if (Users(target[0]) && Users(target[0]).connected) Users(target[0]).popup(user.name + " removed your custom color.");
                        return;
                }

                this.sendReply("|raw|You have given <b><font color=" + target[1] + ">" + Tools.escapeHTML(target[0]) + "</font></b> a custom color.");
                //logMoney(user.name + " le ha asignado un color personalizado a " + target[0] + ". (Color: " + target[1] + ").");
                customColors[toId(target[0])] = target[1];
                updateColor();
        },
        customcolorhelp: ["Commands Include:",
                                "/customcolor [user], [hex] - Gives [user] a custom color of [hex]",
                                "/customcolor [user], delete - Deletes a user's custom color"],

        cp: 'colorpreview',
        colorpreview: function (target, room, user) {
                if (!this.canBroadcast()) return;
                target = target.split(',');
                for (var u in target) target[u] = target[u].trim();
                if (!target[1]) return this.parse('/help colorpreview');
                return this.sendReplyBox('<b><font size="2" color="' +  target[1] + '">' + Tools.escapeHTML(target[0]) + '</font></b>');
        },
        colorpreviewhelp: ["Usage: /colorpreview [user], [color] - Previews what that username looks like with [color] as the color."],
};



/* Pokemon Showdown hashColor function
 * This gives the color of a username
 * based on the userid.
*/

var MD5 = require('MD5');
var colorCache = {};

// hashColor function
function hashColor(name) {
        name = toId(name);
        if (customColors[name]) return customColors[name];
        if (colorCache[name]) return colorCache[name];
        var hash = MD5(name);
        var H = parseInt(hash.substr(4, 4), 16) % 360; // 0 to 360
        var S = parseInt(hash.substr(0, 4), 16) % 50 + 40; // 40 to 89
        var L = Math.floor(parseInt(hash.substr(8, 4), 16) % 20 + 30); // 30 to 49
        var C = (100 - Math.abs(2 * L - 100)) * S / 100 / 100;
        var X = C * (1 - Math.abs((H / 60) % 2 - 1));
        var m = L / 100 - C / 2;

        var R1, G1, B1;
        switch (Math.floor(H / 60)) {
                case 1: R1 = X; G1 = C; B1 = 0; break;
                case 2: R1 = 0; G1 = C; B1 = X; break;
                case 3: R1 = 0; G1 = X; B1 = C; break;
                case 4: R1 = X; G1 = 0; B1 = C; break;
                case 5: R1 = C; G1 = 0; B1 = X; break;
                case 0: default: R1 = C; G1 = X; B1 = 0; break;
        }
        var lum = (R1 + m) * 0.2126 + (G1 + m) * 0.7152 + (B1 + m) * 0.0722; // 0.05 (dark blue) to 0.93 (yellow)
        var HLmod = (lum - 0.5) * -100; // -43 (yellow) to 45 (dark blue)
        if (HLmod > 12) HLmod -= 12;
        else if (HLmod < -10) HLmod = (HLmod + 10) * 2 / 3;
        else HLmod = 0;

        L += HLmod;
        var Smod = 10 - Math.abs(50 - L);
        if (HLmod > 15) Smod += (HLmod - 15) / 2;
        S -= Smod;

        var rgb = hslToRgb(H, S, L);
        colorCache[name] = "#" + rgbToHex(rgb.r, rgb.g, rgb.b);
        return colorCache[name];
}
global.hashColorWithCustoms = hashColor;

function hslToRgb(h, s, l) {
        var r, g, b, m, c, x;
        if (!isFinite(h)) h = 0;
        if (!isFinite(s)) s = 0;
        if (!isFinite(l)) l = 0;
        h /= 60;
        if (h < 0) h = 6 - (-h % 6);
        h %= 6;
        s = Math.max(0, Math.min(1, s / 100));
        l = Math.max(0, Math.min(1, l / 100));
        c = (1 - Math.abs((2 * l) - 1)) * s;
        x = c * (1 - Math.abs((h % 2) - 1));
        if (h < 1) {
                r = c;
                g = x;
                b = 0;
        } else if (h < 2) {
                r = x;
                g = c;
                b = 0;
        } else if (h < 3) {
                r = 0;
                g = c;
                b = x;
        } else if (h < 4) {
                r = 0;
                g = x;
                b = c;
        } else if (h < 5) {
                r = x;
                g = 0;
                b = c;
        } else {
                r = c;
                g = 0;
                b = x;
        }
        m = l - c / 2;
        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);
        return {
                r: r,
                g: g,
                b: b,
        };
}

function rgbToHex(R, G, B) {
        return toHex(R) + toHex(G) + toHex(B);
}

function toHex(N) {
        if (N == null) return "00";
        N = parseInt(N);
        if (N == 0 || isNaN(N)) return "00";
        N = Math.max(0, N);
        N = Math.min(N, 255);
        N = Math.round(N);
        return "0123456789ABCDEF".charAt((N - N % 16) / 16) + "0123456789ABCDEF".charAt(N % 16);
}
