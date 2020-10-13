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
const PluginVersion = "0.0.1";
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
    all: Joi.boolean()
});

router.get('/', limiter, async (reg, res, next) => {
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
			let Out = StatsJson
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
});

router.get('/now', limiter, async (reg, res, next) => {
	const value = await GetSchemaNow.validateAsync(reg.query);
	if(fs.existsSync(`${process.env.ServerStatsPath}`)) {
		var StatsJson = JSON.parse(fs.readFileSync(`${process.env.ServerStatsPath}`));
		let FilterdArray = [];
		let OnlineArray = [];
		let OfflineArray = [];
		//Check if all clients or just Servers
		if(value.all === true){
			StatsJson.servers.map(ArrayPart => {
						FilterdArray.push(ArrayPart)
			});
		}else{
			StatsJson.servers.map(ArrayPart => {
				if(ArrayPart.type !== "PC" && ArrayPart.type !== "Mobile"){
						FilterdArray.push(ArrayPart)
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
