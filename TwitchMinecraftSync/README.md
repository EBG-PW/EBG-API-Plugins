# PterodactylServerStarter
Plugin to link Twitch Chat to minecraft server  

## Installation
Clone [EBG API Base](https://github.com/EBG-PW/EBG-API-Base)  
Create a folder named data in the root directory of the API repo  
Run `npm i`  
Drop the PSS.js file in `/src/api` folder  
Drop the PSSStore folder in `/data` 
Open /`data/TwitchMCStore/config.json` and set your API Key  

Add in .env file:  
TwitchMCStorePath=./Your Path (Default is /data/TwitchMCStore)  
  
### Requirements for the plugin
`npm i express-rate-limit express-csp-header joi rcon-client tmi.js` 

## Twitch Commands
User Commands:  
!info - Get general information about the bot  
!mchelp - List all commands for Minecraft  
!mcranks - List all Ranks on the Server  
!mclink <Minecraft Name> - Link your Minecraft Account to your Twitch Account  
!mcunlink - Unlink your Minecraft Account from your Twitch Account  
  
Admin Commands:
!setmcrank <Twitch Name> <Rank> - Gives the Player the rank on the Minecraft Server  