require('dotenv').config();
const express = require('express');
const rateLimit = require("express-rate-limit");
const Joi = require('joi');
const fs = require("fs");

const PluginConfig = {
}

/* Plugin info*/
const PluginName = "EBG-serverstatus";
const PluginRequirements = [];
const PluginVersion = "0.0.2";
const PluginAuthor = "BolverBlitz";
const PluginDocs = "docs.ebg.pw";

const limiter = rateLimit({
	windowMs: 60 * 1000, 
	max: 60
  });

const router = express.Router();

const GetSchema = Joi.object({
    name: Joi.string().trim(),
    type: Joi.string().trim(),
    Country: Joi.string().trim(),
    limit: Joi.number()
});

const GetSchemaNow = Joi.object({
    all: Joi.boolean(),
	bundle: Joi.boolean()
});

router.get('/', limiter, async (reg, res, next) => {
	try {
		const value = await GetSchema.validateAsync(reg.query);

		if(fs.existsSync(`${process.env.ServerStatsPath}`)) {
			var StatsJson = JSON.parse(fs.readFileSync(`${process.env.ServerStatsPath}`));
			if(value.name && !value.type && !value.Country){ //Filter for name
				var Atribute = value.name;
				var Key = "name";
				SortArray = ArrSorter(StatsJson.servers, Atribute, Key, value.limit)
				let Out = {
					timespamp: StatsJson.updated,
					servers: SortArray
				}
					res.status(200);
					res.json({
						Out
					});
			}else if(!value.name && value.type && !value.Country){ //Filter for Type
				let FilterdArray = [];
				StatsJson.servers.map(ArrayPart => {
					if(ArrayPart.type === value.type){
						FilterdArray.push(ArrayPart)
					}
				});
				if(typeof(value.limit) === "undefined"){
					var Number = FilterdArray.length
				}else{
					var Number = value.limit
				}
				FilterdArray = FilterdArray.slice(0, Number)
				let Out = {
					timespamp: StatsJson.updated,
					servers: FilterdArray
				}
					res.status(200);
					res.json({
						Out
					});
			}else if(!value.name && !value.type && value.Country){ //Filter for Country
				var Atribute = value.Country;
				var Key = "location";
				SortArray = ArrSorter(StatsJson.servers, Atribute, Key, value.limit)
				let Out = {
					timespamp: StatsJson.updated,
					servers: SortArray
				}
					res.status(200);
					res.json({
						Out
					});
			}else{
				if(typeof(value.limit) === "undefined"){
					var Number = StatsJson.length
				}else{
					var Number = value.limit
				}
				let SortArray = StatsJson.servers.slice(0, Number)

				let Out = {
					timespamp: StatsJson.updated,
					servers: SortArray
				}

				res.status(200);
					res.json({
						Out
					});
			}
		}else{
			console.log(`There is no stats.json`);
			res.status(503);
			res.json({
			message: 'No stats file found... Check .env and ServerStatus application!'
			});
		}
	} catch (error) {
    	next(error);
  	}
});

router.get('/now', limiter, async (reg, res, next) => {
	try {
		const value = await GetSchemaNow.validateAsync(reg.query);
		if(fs.existsSync(`${process.env.ServerStatsPath}`)) {
			var StatsJson = JSON.parse(fs.readFileSync(`${process.env.ServerStatsPath}`));
			let FilterdArray = [];
			let FilterdArrayWCG = [];
			let OnlineArray = [];
			let OnlineArrayWCG = [];
			let OfflineArray = [];
			//Check if all clients or just Servers
			if(value.all === true){
				StatsJson.servers.map(ArrayPart => {
					if(!value.bundle){
						FilterdArray.push(ArrayPart)
					}else{
						if(ArrayPart.name.includes("WCG")){
							FilterdArrayWCG.push(ArrayPart)
						}else{
							FilterdArray.push(ArrayPart)
						}
					}
				});
			}else{
				StatsJson.servers.map(ArrayPart => {
					if(ArrayPart.type !== "PC" && ArrayPart.type !== "Mobile"){
						if(!value.bundle){
							FilterdArray.push(ArrayPart)
						}else{
							if(ArrayPart.name.includes("WCG")){
								FilterdArrayWCG.push(ArrayPart)
							}else{
								FilterdArray.push(ArrayPart)
							}
						}
					}
				});
			}
			//Split into online and offline
			FilterdArray.map(ArrayPart => {
				if(ArrayPart.online4 === true || ArrayPart.online6 === true){
					OnlineArray.push(ArrayPart)
				}else{
					OfflineArray.push(ArrayPart)
				}
			});
			FilterdArrayWCG.map(ArrayPart => {
				if(ArrayPart.online4 === true || ArrayPart.online6 === true){
					OnlineArrayWCG.push(ArrayPart)
				}else{
					OfflineArray.push(ArrayPart)
				}
			});
			var avg = Array.from(OnlineArrayWCG.reduce(
				(acc, obj) => Object.keys(obj).reduce( 
					(acc, key) => typeof obj[key] == "number"
						? acc.set(key, (acc.get(key) || []).concat(obj[key]))
						: acc,
				acc),
			  new Map())).reduce( 
				  (acc, [name, values]) =>
					  Object.assign(acc, { [name]: values.reduce( (a,b) => a+b ) / values.length }),
				  {}
			  );
			  for (const key in avg){
				avg[key] = Number(avg[key].toFixed(0))
			}
			avg.name = "WCG Bundled";
			avg.type = "WCG-Bundle";
			avg.host = "Bundle";
			avg.location = "Germany";
			avg.online4 = true;
			avg.online6 = true;
			avg.uptime = "0";
			avg.custom = ""
			avg.memory_total = avg.memory_total*8
			avg.memory_used = avg.memory_used*8
			avg.hdd_total = avg.hdd_total*8
			avg.hdd_used = avg.hdd_used*8
			if(value.bundle){
				OnlineArray.push(avg)
			}
			//Get all Stats
			var cpu_used = 0, ram_total = 0, ram_used = 0, disk_total = 0, disk_used = 0, net_rx = 0, net_tx = 0
			OnlineArray.map(ArrayPart => {
				cpu_used = Number(cpu_used) + Number(ArrayPart.cpu);
				ram_total = Number(ram_total) + Number(ArrayPart.memory_total);
				ram_used = Number(ram_used) + Number(ArrayPart.memory_used);
				disk_total = Number(disk_total) + Number(ArrayPart.hdd_total);
				disk_used = Number(disk_used) + Number(ArrayPart.hdd_used);
				net_rx = Number(net_rx) + Number(ArrayPart.network_rx);
				net_tx = Number(net_tx) + Number(ArrayPart.network_tx);
			});

			let hardware = {
				CPUtotal: OnlineArray.length*100,
				CPUused: cpu_used.toFixed(2),
				RAMtotal: ram_total,
				RAMused: ram_used,
				DISKtotal: disk_total,
				DISKused: disk_used,
				NETrx: net_rx,
				NETtx: net_tx
				
			}

			let Out = {
				timespamp: StatsJson.updated,
				online: OnlineArray.length,
				offline: OfflineArray.length,
				hardware: hardware,
				onlineservers: OnlineArray,
				offlineservers: OfflineArray
			}
			res.status(200);
			res.json({
				Out
			});
		}else{
			console.log(`There is no stats.json`);
			res.status(503);
			res.json({
			message: 'No stats file found... Check .env and ServerStatus application!'
			});
		}
	} catch (error) {
    	next(error);
  	}
});

/**
 * Sorts a given array based on the % match to the given string.
 * @param {Array} Array 
 * @param {String} String 
 * @param {String} Key
 * @param {Number} Number 
 */
let ArrSorter = function ArrSorter (Array, String, Key, Number){
	if(Number === undefined){
		var Number = Array.length
	}
	let s = [];
	let o = [];
	let ArrLength = `ArrayPart.${Key}`
	Array.map(ArrayPart => {
		let t = 0;
		for (i = 0; i < ArrLength.length; i++) { 
			if(i<String.length){
				if(ArrayPart.name[i].toLowerCase() === String[i].toLowerCase()){
					t++;
				}
			}
		}

		let p = t/String.length
		let temp = {
			a: ArrayPart,
			p: p
		}
		s.push(temp)
	});
	s.sort((a, b) => (a.p > b.p) ? -1 : 1);
	s.map(SP => {
		o.push(SP.a)
	});
	return(o.slice(0, Number))
}

module.exports = {
	router: router,
	PluginName: PluginName,
	PluginRequirements: PluginRequirements,
	PluginVersion: PluginVersion,
	PluginAuthor: PluginAuthor,
	PluginDocs: PluginDocs
  };
