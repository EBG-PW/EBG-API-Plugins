require('dotenv').config();
const express = require('express');
const rateLimit = require("express-rate-limit");
const fs = require("fs");

const PluginConfig = {
}

/* Plugin info*/
const PluginName = "EBG-serverstatus-C-Server";
const PluginRequirements = [];
const PluginVersion = "0.0.1";
const PluginAuthor = "BolverBlitz";
const PluginDocs = "";

const limiter = rateLimit({
	windowMs: 60 * 1000, 
	max: 65
  });

const router = express.Router();

router.get('/', limiter, async (reg, res, next) => {
	try {
		if(fs.existsSync(`${process.env.ServerStatsPath}`)) {
			var StatsJson = JSON.parse(fs.readFileSync(`${process.env.ServerStatsPath}`));
			res.status(200);
			res.json({
				StatsJson
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

module.exports = {
	router: router,
	PluginName: PluginName,
	PluginRequirements: PluginRequirements,
	PluginVersion: PluginVersion,
	PluginAuthor: PluginAuthor,
	PluginDocs: PluginDocs
  };
