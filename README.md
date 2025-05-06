# Command Chat
this is pretty much just a little funny chat app i made in batch

# PLEASE NOTE

this has no authentication AT ALL. people can flood the chatlogs like crazy, hell probably crash your server. this probably has like infinite vulnerabilities. PLEASE DO NOT USE ON A LARGE SCALE. only with your friends probably.
oh yeah and this chat client is really impractical. i am working on another project named sharpchat which will be better, but thats not rlly my focus rn until i get the client perfected.

# Chat Commands

Client Commands:<br>
.e is exit, or you can just do ctrl+c<br>
.r is refresh, or just send a message<br>
.m goes to the menu<br>
<br>
Server Commands:<br>
/ver will show server logic version<br>
/clear to clear all messages (mod only)<br>
/stop to stop server (mod only)<br>
/reloadmods to reload all mods and tag untagged mods (mod only)<br>
Terminal Commands:<br>
ver, clear, stop, reloadmods, mod <user>, demod <user>, mods, say <msg>, fakesay <user> <msg>, watch <br>

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
