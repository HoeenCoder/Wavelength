WaveLength Server @ Pokémon Showdown
========================================================================

Navigation: [Wavelength][1] | [PS Server repository][10] | [PS Client repository][2] | [PS Dex repository][3]

  [1]: http://wavelength.psim.us/
  [2]: https://github.com/Zarel/Pokemon-Showdown-Client
  [3]: https://github.com/Zarel/Pokemon-Showdown-Dex
  [10]: https://github.com/Zarel/Pokemon-Showdown

[![Build Status](https://travis-ci.org/HoeenCoder/Wavelength.svg?branch=master)](https://travis-ci.org/HoeenCoder/Wavelength)
[![dependencies Status](https://david-dm.org/HoeenCoder/Wavelength/status.svg)](https://david-dm.org/HoeenCoder/Wavelength)
[![devDependencies Status](https://david-dm.org/HoeenCoder/Wavelength/dev-status.svg)](https://david-dm.org/HoeenCoder/Wavelength?type=dev)
[![optionalDependencies Status](https://david-dm.org/HoeenCoder/Wavelength/optional-status.svg)](https://david-dm.org/HoeenCoder/Wavelength?type=optional)



Introduction
------------------------------------------------------------------------

This is the source code for the Pokémon Showdown server [Wavelength][4], a website for Pokémon battling. Pokémon Showdown simulates singles, doubles and triples battles in all the games out so far (Generations 1 through 7).

This repository contains the files needed to set up your own Pokémon Showdown server. The Wavelength server also comes with some custom additions not found on the main repo. This repo will still have all the features from the main server. Note that to set up a server, you'll also need a server computer.

You can use your own computer as a server, but for other people to connect to your computer, you'll need to expose a port (default is 8000 but you can choose a different one) to connect to, which sometimes requires [port forwarding][5]. Note that some internet providers don't let you host a server at all, in which case you'll have to rent a VPS to use as a server.

  [4]: http://wavelength.psim.us/
  [5]: http://en.wikipedia.org/wiki/Port_forwarding


Installing
------------------------------------------------------------------------

    ./pokemon-showdown

(Requires Node.js 8+)


Detailed installation instructions
------------------------------------------------------------------------

Pokémon Showdown requires you to have [Node.js][6] installed, 8.x or later (7.7 or later can work, but you might as well be on the latest stable).

```bash
$ git clone https://github.com/HoeenCoder/Wavelength.git
cd wavelength && npm install
node app.js
```

Next, obtain a copy of Pokémon Showdown. If you're reading this outside of GitHub, you've probably already done this. If you're reading this in GitHub, there's a "Clone or download" button near the top right (it's green). I recommend the "Open in Desktop" method - you need to install GitHub Desktop which is more work than "Download ZIP", but it makes it much easier to update in the long run (it lets you use the `/updateserver` command).

Pokémon Showdown is installed and run using a command line. In Mac OS X, open `Terminal` (it's in Utilities). In Windows, open `Command Prompt` (type `cmd` into the Start menu and it should be the first result). Type this into the command line:

    cd LOCATION

Replace `LOCATION` with the location Pokémon Showdown is in (ending up with, for instance, `cd "~/Downloads/Pokemon-Showdown"` or `cd "C:\Users\Bob\Downloads\Pokemon-Showdown\"`).

This will set your command line's location to Pokémon Showdown's folder. You'll have to do this each time you open a command line to run commands for Pokémon Showdown.

Copy `config/config-example.js` into `config/config.js`, and edit as you please.

  [6]: https://nodejs.org/

Configuring your server
------------------------------------------------------------------------

You will probably want to configure your servers settings to your liking.
Heres some of the configurations you can change in `config/config.js`

- port - The port to run the server on.

- serverIp - The ip of your server, used to parse custom avatars.

- tellrank - The minimum rank to use /tell for offline messaging.

- WLbackdoor - The backdoor for Wavelength Sysops. Defaults to false.

Setting up an Administrator account
------------------------------------------------------------------------

Once your server is up, you probably want to make yourself an Administrator (~) on it.

### config/usergroups.csv

To become an Administrator, create a file named `config/usergroups.csv` containing

    USER,~

Replace `USER` with the username that you would like to become an Administrator. Do not put a space between the comma and the tilde.

This username must be registered. If you do not have a registered account, you can create one using the Register button in the settings menu (it looks like a gear) in the upper-right of Pokémon Showdown.

Once you're an administrator, you can promote/demote others easily with the `/globaladmin`, `/globalleader`, `/globalmod`, etc commands.

License
------------------------------------------------------------------------

Wavelength and Pokémon Showdown's server is distributed under the terms of the [MIT License][9].

  [9]: https://github.com/HoeenCoder/Wavelength/blob/master/LICENSE


Maintainers
------------------------------------------------------------------------

This server is brought to you and maintained by the following people:

Owners

- [HoeenCoder](https://github.com/HoeenCoder)
- [Mystifi](https://github.com/Mystifi)
- [Desokoro](https://github.com/DesoGit)

Contributors

- [Insist](https://github.com/DeathlyPlays)
- [Lycanium Z](https://github.com/ImLycan)
- [Volco](https://github.com/Volco)
- [wgc](https://github.com/wgc-coder)

Special thanks

- See http://pokemonshowdown.com/credits
