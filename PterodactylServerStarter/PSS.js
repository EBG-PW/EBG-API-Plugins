require('dotenv').config();
const util = require('util')
const path = require('path');
const Joi = require('joi');
const express = require('express');
const rateLimit = require("express-rate-limit");
const node = require('nodeactyl-beta');
const fs = require("fs");
let reqPath = path.join(__dirname, '../../');
let Config;
console.log(`${reqPath}${process.env.PSSConfigPath}/config.json`)
if(fs.existsSync(`${reqPath}${process.env.PSSConfigPath}/config.json`)) {
	Config = JSON.parse(fs.readFileSync(`${reqPath}/${process.env.PSSConfigPath}/config.json`));
}
const nodeClient = new  node.NodeactylClient(Config.PanelURL, Config.ClientToken);

const PluginConfig = {
}

/* Plugin info*/
const PluginName = "PterodactylServerStartet";
const PluginRequirements = [];
const PluginVersion = "0.0.1";
const PluginAuthor = "BolverBlitz";
const PluginDocs = "Private";

const limiter = rateLimit({
	windowMs: 60 * 1000, 
	max: 500
});

const startSchema = Joi.object({
	ServerID: Joi.string().required().min(8).max(8).regex(/^[a-z\0-9]*$/i)
});

const router = express.Router();

router.get('/', limiter, async (reg, res, next) => {
	try {
		if(Config != null) {
			res.sendFile(path.join(`${reqPath}${process.env.PSSConfigPath}/index.html`));
		}else{
			console.log(`There is no config.json.`,`${process.env.PSSConfigPath}/config.json`);
			res.status(500);
			res.json({
				message: 'Config is missing or wasnt found. Please contact the administrator!'
			});
		}
	} catch (error) {
    	next(error);
  	}
});

router.get('/list', limiter, async (reg, res, next) => {
	try {
		if(Config != null) {
			nodeClient.getAllServers().then(function(ServerList) {
				let PrommiseArray = [];
				ServerList.data.map(Server => {
					let S = nodeClient.getServerUsages(Server.attributes.identifier)
					S.Name = Server.attributes.name
					S.node = Server.attributes.node
					S.identifier = Server.attributes.identifier
					PrommiseArray.push(S);
				});
				Promise.all(PrommiseArray).then(function(InArray) {
					let OutArray = [];
					for (i = 0; i < InArray.length; i++) {
						let { memory_bytes, cpu_absolute,  disk_bytes, network_rx_bytes, network_tx_bytes } = InArray[i].resources;
						OutArray.push({
							Name: PrommiseArray[i].Name,
							Node: PrommiseArray[i].node.substring(3),
							RAM: bytesToSize(memory_bytes, 2),
							CPU: `${Math.round(cpu_absolute * 100) / 100}%`,
							Disk: bytesToSize(disk_bytes, 2),
							Net_Down: `${bytesToSize(network_rx_bytes, 2)}/s`,
							Net_Up: `${bytesToSize(network_tx_bytes, 2)}/s`,
							Actions: ActionsMethode(PrommiseArray[i].identifier, InArray[i].current_state)
						});
					}
					res.status(200);
					res.json({
						OutArray
					})
				}).catch((error) => {
					console.log(error);
				});
				//console.log(util.inspect(ServerList, false, null, true /* enable colors */))
			}).catch((error) => {
				console.error(error);
			});
		}else{
			console.log(`There is no config.json.`,`${process.env.PSSConfigPath}/config.json`);
			res.status(500);
			res.json({
				message: 'Config is missing or wasnt found. Please contact the administrator!'
			});
		}
	} catch (error) {
    	next(error);
  	}
});

router.post('/start', limiter, async (reg, res, next) => {
	try {
		const value = await startSchema.validateAsync(reg.body);
		nodeClient.startServer(value.ServerID).then(function(result) {
			res.status(200);
			res.json({
				message: 'Server wird gestartet...'
			});
		}).catch((error) => {
			res.status(503);
			res.json({
				message: 'Not found.'
			});
			console.log(error);
		});

	} catch (error) {
    	next(error);
  	}
});

function ActionsMethode(Server_identifier, state){
	if(state === "offline"){
		return `<button onclick="StartServer('${Server_identifier}')">Start</button>`
	}else if(state === "starting"){
		return `<button disabled>Starting</button>`
	}else if(state === "running"){
		return `<button disabled>Online</button>`
	}else{
		return `<button disabled>Unbekannt</button>`
	}
}

function bytesToSize(bytes, precision, si)
{
	var ret;
	si = typeof si !== 'undefined' ? si : 0;
	if(si != 0) {
		var kilobyte = 1000;
		var megabyte = kilobyte * 1000;
		var gigabyte = megabyte * 1000;
		var terabyte = gigabyte * 1000;
	} else {
		var kilobyte = 1024;
		var megabyte = kilobyte * 1024;
		var gigabyte = megabyte * 1024;
		var terabyte = gigabyte * 1024;
	}
	if ((bytes >= 0) && (bytes < kilobyte)) {
		return bytes + ' B';
	} else if ((bytes >= kilobyte) && (bytes < megabyte)) {
		ret = (bytes / kilobyte).toFixed(precision) + ' K';
	} else if ((bytes >= megabyte) && (bytes < gigabyte)) {
		ret = (bytes / megabyte).toFixed(precision) + ' M';
	} else if ((bytes >= gigabyte) && (bytes < terabyte)) {
		ret = (bytes / gigabyte).toFixed(precision) + ' G';
	} else if (bytes >= terabyte) {
		ret = (bytes / terabyte).toFixed(precision) + ' T';
	} else {
		return bytes + ' B';
	}
	if(si != 0) {
		return ret + 'B';
	} else {
		return ret + 'B';
	}
}

module.exports = {
	router: router,
	PluginName: PluginName,
	PluginRequirements: PluginRequirements,
	PluginVersion: PluginVersion,
	PluginAuthor: PluginAuthor,
	PluginDocs: PluginDocs
  };