# Command Chat
this is pretty much just a little funny chat app i made in batch

# PLEASE NOTE

this has no authentication AT ALL. people can flood the chatlogs like crazy, hell probably crash your server. this probably has like infinite vulnerabilities. PLEASE DO NOT USE ON A LARGE SCALE. only with your friends probably.
oh yeah and this chat client is really impractical. i am working on another project named sharpchat which will be better, but thats not rlly my focus rn until i get the client perfected.

# Chat Commands

Client Commands:<br>
-  .e: exit
-  .r: refresh chat
-  .m: goto main menu
-  .? see this list
Server Commands:<br>
-  /ver: show server logic version
-  /stats: show server uptime and messages sent
-  /clear: delete all messages (mod only)
-  /stop: stop server (mod only)
-  /reloadmods: apply new mods (mod only)
-  /mod <user>: add new mod (mod only)
-  /demod <user>: remove mod (mod only)
-  /fakesay <user> <message>: impersonate a user saying something (mod only)
Terminal Commands:<br>
-  ver: show server logic version
-  clear: delete all messages
-  stop: stop server
-  reloadmods: apply new mods
-  mod <user>: mod a user
-  demod <user>: demod a user
-  mods: list mods
-  say <msg>: chat as the server
-  fakesay <user> <message>: impersonate a user saying something
-  watch: basically turn server into client (server will still function, type exit to exit)
-  stats: show server uptime and messages sent


# Server-Side Setup
so first you gotta have node.js installed, and you gotta run this command

```bash
npm install express body-parser fs cors axios
```
now you got the dependencies ready, so youve gotta get the actual server ready.

now download chat.js from the latest release

now there's one last thing left to do. port fowarding.
the default is port 3000, however at the start of the js code, theres a variable for the port, change that if you want to.

now you just got to start the server, here is the command to start it
```bash
node chat.js
```
and everything *should* go perfectly fine, but you can create an issue if you need to, i'll respond within a day.

now your all done! happy chatting i guess

# How to Add Mods

this is pretty straightfoward, just type in mod (username here). howvere if you do not have terminal access, then you can find mods.json and just add a username (make sure you format it properly)<br>
now do reloadmods in the terminal (if you don't have access to the terminal, then just wait 30s)



# Client-Side Setup
well there isn't really anything to do, other than download chat.bat from the latest release.
