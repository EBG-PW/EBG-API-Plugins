require('dotenv').config();
const path = require('path');
const express = require('express');
const rateLimit = require("express-rate-limit");
const Joi = require('joi');
const fs = require("fs");
let reqPath = path.join(__dirname, '../../');

const PluginConfig = {
}

/* Plugin info*/
const PluginName = "MSH-ConfigGenerator";
const PluginRequirements = [];
const PluginVersion = "0.0.1";
const PluginAuthor = "BolverBlitz";
const PluginDocs = "";

const limiter = rateLimit({
	windowMs: 60 * 1000, 
	max: 265
});

const GetSchema = Joi.object({
	FileName: Joi.string().max(128).required().regex(/^[a-z\d\s\-\.\,\ä\ü\ö\ß\&]*$/i),
	ServerType: Joi.string().max(32).required().regex(/^[a-z\d\s\-\.\,\ä\ü\ö\ß\&]*$/i),
	Version: Joi.string().max(16).required().regex(/^[0-9\-\.]*$/),
	RAM: Joi.number().max(524288).required(),
	Port: Joi.number().max(65535).required()
})

const router = express.Router();

router.get('/2-3-3', limiter, async (reg, res, next) => {
	try {
		const value = await GetSchema.validateAsync(reg.query);
		console.log(value)
		if(fs.existsSync(`${reqPath}/${process.env.MSHConfigPath}/2-3-3.json`)) {
			var DefaultJson = JSON.parse(fs.readFileSync(`${reqPath}/${process.env.MSHConfigPath}/2-3-3.json`));
			DefaultJson.Server.FileName = `${value.FileName}`
			DefaultJson.Server.Version = `${value.ServerType} ${value.Version}`
			DefaultJson.Commands.StartServer = `java -Xmx${value.RAM}M -Xms128M -jar serverFileName nogui`
			DefaultJson.Msh.Port = `${value.Port}`


			res.status(200);
			res.set({"Content-Disposition":"attachment; filename=\"config.json\""});
			res.send(DefaultJson);
		}else{
			console.log(`There is no 2-3-3.json.`,`${process.env.MSHConfigPath}/2-3-3.json`);
			res.status(503);
			res.json({
			message: 'No template file found... Check .env!'
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