require('dotenv').config();
const util = require('util')
const path = require('path');
const Joi = require('joi');
const express = require('express');
const rateLimit = require("express-rate-limit");
const tmi = require('tmi.js');
const fs = require("fs");
const pg = require('pg');
const { Rcon } = require('rcon-client')
let reqPath = path.join(__dirname, '../../');
let Config;
if(fs.existsSync(`${reqPath}${process.env.TwitchMCStorePath}/config.json`)) {
	Config = JSON.parse(fs.readFileSync(`${reqPath}/${process.env.TwitchMCStorePath}/config.json`));
}

let client = new tmi.Client({
	options: { debug: true },
	identity: {
		username: Config.Twitch_username,
		password: Config.Twitch_OAuth
	},
	channels: Config.Twitch_channels.split(",")
});

const pool = new pg.Pool({
	user: Config.DB_USER,
	host: Config.DB_HOST,
	database: Config.DB_NAME,
	password: Config.DB_PASSWORD,
	port: Config.DB_PORT,
	max: 5
  })

const PluginConfig = {
}

/* Plugin info*/
const PluginName = "TwitchMinecraftSync";
const PluginRequirements = [];
const PluginVersion = "0.0.1";
const PluginAuthor = "BolverBlitz";
const PluginDocs = "Private";

//Creat Table
pool.query(`CREATE TABLE IF NOT EXISTS users (
	mcname text,
	twitchname text PRIMARY KEY,
	chanelID text,
	rank text,
	time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
	)`, (err, result) => {
	if (err) {console.log(err)}
});

const limiter = rateLimit({
	windowMs: 60 * 1000, 
	max: 50
});

const router = express.Router();

router.get('/', limiter, async (reg, res, next) => {
	try {
		if(Config != null) {
			res.sendFile(path.join(`${reqPath}${process.env.TwitchMCStorePath}/index.html`));
		}else{
			console.log(`There is no config.json.`,`${process.env.TwitchMCStorePath}/config.json`);
			res.status(500);
			res.json({
				message: 'Config is missing or wasnt found. Please contact the administrator!'
			});
		}
	} catch (error) {
    	next(error);
  	}
});

router.get('/allusers', limiter, async (reg, res, next) => {
	try {
		GetAllUsers().then(function(AllUsers) {
			OutArray = [];
			AllUsers.rows.map(obj => {
				let Out = {
					MCName: obj.mcname,
					TwitchName: obj.twitchname,
					Streamer: obj.chanelid,
					Rank: ReplaceRanks(obj.rank)
				}
				OutArray.push(Out);
			})
			
			res.status(200);
			res.json({
				OutArray: OutArray
			});
		});
	} catch (error) {
    	next(error);
  	}
});

router.get('/reload', limiter, async (reg, res, next) => {
	try {
		if(fs.existsSync(`${reqPath}${process.env.PSSConfigPath}/config.json`)) {
			Config = JSON.parse(fs.readFileSync(`${reqPath}/${process.env.PSSConfigPath}/config.json`));
			client = null;
			let client = new tmi.Client({
				options: { debug: true },
				identity: {
					username: Config.Twitch_username,
					password: Config.Twitch_OAuth
				},
				channels: Config.Twitch_channels.split(",")
			});
			res.status(200);
			res.json({
				message: 'Config has been reloaded!'
			});
		}else{
			res.status(500);
			res.json({
				message: 'Config is missing or wasnt found. Please contact the administrator!'
			});
		}
	} catch (error) {
    	next(error);
  	}
});

client.connect();

client.on('message', (channel, tags, message, self) => {
	if(self) return;
	let messageArray = message.split(" ");
	if(messageArray[0].toLowerCase() === `${Config.syntax}info`) {
		client.say(channel, `I´m here to withelist and manage ranks on our Minecraft Project. Use ${Config.syntax}helpMC to get all commands.`);
	}
	if(messageArray[0].toLowerCase() === `${Config.syntax}mchelp`) {
		client.say(channel, `Commands are: ${Config.syntax}mclink ${Config.syntax}setmcrank ${Config.syntax}mcranks`);
	}
	if(messageArray[0].toLowerCase() === `${Config.syntax}mcranks`) {
		client.say(channel, `Ranks:  ${Config.Ranks.join("  ")}`);
	}
	if(messageArray[0].toLowerCase() === `${Config.syntax}setmcrank`) {
		if(messageArray.length !== 3){
			client.say(channel, `Error: No username & Rank.`);
			client.say(channel, `Use ${Config.syntax}setmcrank <Twitch Username> <Rank>`);
		}else{
			let T_name = messageArray[1].toLocaleLowerCase();
			let rank = messageArray[2].toLocaleLowerCase();
			if(tags.badges.broadcaster === "1"){
				if(Config.Ranks.includes(rank)){
					let Data = {
						rank: rank,
						twitchname: T_name
					}
						GetUser(T_name).then(function(Check_DB_response) {
							UpdateUserPermission(Data).then(function(Update_DB_response) {
								if(Update_DB_response.rowCount === 1){
									Rcon.connect({host: Config.rconhost, port: Config.rconport, password: Config.rconpasswort}).then(function(rcon) {
										rcon.send(`/ftbranks remove ${Check_DB_response.rows[0].mcname} ${Check_DB_response.rows[0].rank}`).then(function(Ranks_remove_response) {
											rcon.send(`/ftbranks add ${Check_DB_response.rows[0].mcname} ${rank}`).then(function(Ranks_add_response) {
												client.say(channel, `${T_name} now has the rank ${rank}`);
											}).catch(function(error) {
												client.say(channel, `Error: Communitaction with MC-Server failed`);
												console.log(error)
											});
										}).catch(function(error) {
											client.say(channel, `Error: Communitaction with MC-Server failed`);
											console.log(error)
										});
									}).catch(function(error) {
										client.say(channel, `Error: Communitaction with MC-Server failed`);
										console.log(error)
									});
								}else{
									client.say(channel, `Error: ${messageArray[1]} could not be found :(`);
								}
							}).catch(function(error) {
								client.say(channel, `Error: Communitaction with DB failed`);
								console.log(error)
							});
						}).catch(function(error) {
							client.say(channel, `Error: Communitaction with DB failed`);
							console.log(error)
						});
				}else{
					client.say(channel, `Error: Rank ${rank} does not exist.`);
				}
			}else{
				client.say(channel, `Error: Only the streamer is allowed to run this command.`);
			}
		}
	}
	if(messageArray[0].toLowerCase() === `${Config.syntax}mclink`) {
		if(messageArray.length !== 2){
			client.say(channel, `Error: No username.`);
			client.say(channel, `Use ${Config.syntax}mclink <Minecraft Username>`);
		}else{
			GetUser(tags.username).then(function(Check_DB_response) {
				if(Check_DB_response.rowCount === 1){
					client.say(channel, `@${tags.username} you alrady liked the Minecraft Accound ${Check_DB_response.rows[0].mcname}. Type ${Config.syntax}mcunlink`);
				}else{
					Rcon.connect({host: Config.rconhost, port: Config.rconport, password: Config.rconpasswort}).then(function(rcon) {
						rcon.send(`whitelist add ${messageArray[1]}`).then(function(whitelist_response) {
							let Data = {
								mcname: messageArray[1],
								twitchname: tags.username,
								chanelID: channel,
								rank: "Follower"
							}
							WriteUser(Data).then(function(DB_response) {
								client.say(channel, whitelist_response);
							}).catch(function(error) {
								client.say(channel, `Error: Communitaction with DB failed`);
								console.log(error)
							});
						}).catch(function(error) {
							client.say(channel, `Error: Communitaction with MC-Server failed`);
							console.log(error)
						});
					}).catch(function(error) {
						client.say(channel, `Error: Communitaction with MC-Server failed`);
						console.log(error)
					});
				}
			}).catch(function(error) {
				client.say(channel, `Error: Communitaction with DB failed`);
				console.log(error)
			});
		}
	}
	if(messageArray[0].toLowerCase() === `${Config.syntax}mcunlink`) {
		GetUser(tags.username).then(function(Check_DB_response) {
			DelUser(tags.username).then(function(DEL_DB_response) {
				if(DEL_DB_response.rowCount === 1){
					Rcon.connect({host: Config.rconhost, port: Config.rconport, password: Config.rconpasswort}).then(function(rcon) {
						rcon.send(`whitelist remove ${Check_DB_response.rows[0].mcname}`).then(function(whitelist_response) {
							client.say(channel, `Unlinked ${tags.username}`);
						}).catch(function(error) {
							client.say(channel, `Error: Communitaction with MC-Server failed`);
							console.log(error)
						});
					}).catch(function(error) {
						client.say(channel, `Error: Communitaction with MC-Server failed`);
						console.log(error)
					});
				}else{
					client.say(channel, `${tags.username} you have no linked minecraft account.`);
					console.log(error)
				}
			}).catch(function(error) {
				client.say(channel, `Error: Communitaction with DB failed`);
				console.log(error)
			});
		}).catch(function(error) {
			client.say(channel, `Error: Communitaction with DB failed`);
			console.log(error)
		});
		//client.say(channel, `Ranks:  subl1  subl2  subl3`);
	}
});

function ReplaceRanks(Rank) {
    if(Rank === "follower") {return "Follower"};
    if(Rank === "subl1") {return "Subscriber L1"};
    if(Rank === "subl2") {return "Subscriber L2"};
    if(Rank === "subl3") {return "Subscriber L3"};
    if(Rank === "streamer") {return "Streamer"};
}

/**
 * This function will write new user to database
 * @param {Object} Data
 * @returns {Promise}
 */
 let WriteUser = function(Data) {
	return new Promise(function(resolve, reject) {
	  pool.query('INSERT INTO users(mcname,twitchname,chanelID,rank) VALUES ($1,$2,$3,$4)',[
		Data.mcname, Data.twitchname, Data.chanelID, Data.rank
	  ], (err, result) => {
		if (err) {reject(err)}
		resolve(result)
	  });
	});
 }

/**
 * This function will get the data of a twitchname
 * @param {String} twitchname
 * @returns {Promise}
 */
 let GetUser = function(twitchname) {
	return new Promise(function(resolve, reject) {
	  pool.query('SELECT * FROM users WHERE twitchname = $1',[
		twitchname
	  ], (err, result) => {
		if (err) {reject(err)}
		resolve(result)
	  });
	});
 }

/**
 * This function will delete a user
 * @param {String} twitchname
 * @returns {Promise}
 */
 let DelUser = function(twitchname) {
	return new Promise(function(resolve, reject) {
	  pool.query('DELETE FROM users WHERE twitchname = $1',[
		twitchname
	  ], (err, result) => {
		if (err) {reject(err)}
		resolve(result)
	  });
	});
 }

/**
 * This function will update user permissions
 * @param {Object} Data
 * @returns {Promise}
 */
 let UpdateUserPermission = function(Data) {
	return new Promise(function(resolve, reject) {
	  pool.query('UPDATE users SET rank = $1 WHERE twitchname = $2',[
		Data.rank, Data.twitchname
	  ], (err, result) => {
		if (err) {reject(err)}
		resolve(result)
	  });
	});
 }

/**
 * This function will select all users
 * @returns {Promise}
 */
 let GetAllUsers = function() {
	return new Promise(function(resolve, reject) {
	  pool.query('SELECT * FROM users', (err, result) => {
		if (err) {reject(err)}
		resolve(result)
	  });
	});
 }
 
module.exports = {
	router: router,
	PluginName: PluginName,
	PluginRequirements: PluginRequirements,
	PluginVersion: PluginVersion,
	PluginAuthor: PluginAuthor,
	PluginDocs: PluginDocs
  };
