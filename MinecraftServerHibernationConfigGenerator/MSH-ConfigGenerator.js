require('dotenv').config();
const path = require('path');
const express = require('express');
const rateLimit = require("express-rate-limit");
const Joi = require('joi');
const fs = require("fs");
let reqPath = path.join(__dirname, '../../');
let ProtVersionNum;
if(fs.existsSync(`${reqPath}/${process.env.MSHConfigPath}/Protocol_version_numbers.json`)) {
	ProtVersionNum = JSON.parse(fs.readFileSync(`${reqPath}/${process.env.MSHConfigPath}/Protocol_version_numbers.json`));
}

const PluginConfig = {
}

/* Plugin info*/
const PluginName = "MSH-ConfigGenerator";
const PluginRequirements = [];
const PluginVersion = "0.0.1";
const PluginAuthor = "BolverBlitz";
const PluginDocs = "https://docs.ebg.pw/#msh-configgenerator";

const limiter = rateLimit({
	windowMs: 60 * 1000, 
	max: 265
});

function capitalizeFirstLetter(string) {
	return string.charAt(0).toUpperCase() + string.slice(1);
  }

const GetSchema233 = Joi.object({
	FileName: Joi.string().max(128).required().regex(/^[a-z\d\s\-\.\,\ä\ü\ö\ß\&]*$/i),
	ServerType: Joi.string().max(32).required().regex(/^[a-z\d\s\-\.\,\ä\ü\ö\ß\&]*$/i),
	Version: Joi.string().max(16).required().regex(/^[0-9\-\.]*$/),
	RAM: Joi.number().max(524288).required(),
	Port: Joi.number().max(65535).required(),
	StopTime: Joi.number().max(86400).required(),
	HibernationInfo: Joi.string(),
	StartingInfo: Joi.string()
	
})

const GetSchema241 = Joi.object({
	FileName: Joi.string().max(128).required().regex(/^[a-z\d\s\-\.\,\ä\ü\ö\ß\&]*$/i),
	ServerType: Joi.string().max(32).required().regex(/^[a-z\d\s\-\.\,\ä\ü\ö\ß\&]*$/i),
	Version: Joi.string().max(16).required().regex(/^[0-9\-\.]*$/),
	RAM: Joi.number().max(524288).required(),
	Port: Joi.number().max(65535).required(),
	StopTime: Joi.number().max(86400).required(),
	HibernationInfo: Joi.string(),
	StartingInfo: Joi.string(),
	StopServerAllowKill: Joi.number().max(86400).required()
})

const router = express.Router();

router.get("/", (reg, res) => {
    res.status(200)
	let out = {
		message: "Please use one of the MSH versions listed below in your request path",
		v1: "2-3-3 works for 2.3.3 - 2.4.0",
		v2: "2-4-1 works for 2.4.1 - latest"
	}
    res.json(out);
});

router.get('/2-3-3', limiter, async (reg, res, next) => {
	try {
		const value = await GetSchema233.validateAsync(reg.query);
		if(fs.existsSync(`${reqPath}/${process.env.MSHConfigPath}/2-3-3.json`)) {
			if(ProtVersionNum !== undefined){
				let Protocol;
				if(ProtVersionNum.Minecraft_prot[value.Version] === undefined){
					Protocol = "Version is no official minecraft java release..."
				}else{
					Protocol = ProtVersionNum.Minecraft_prot[value.Version]
				}
				var DefaultJson = JSON.parse(fs.readFileSync(`${reqPath}/${process.env.MSHConfigPath}/2-3-3.json`));
				DefaultJson.Server.FileName = `${value.FileName}`
				DefaultJson.Server.Version = `${capitalizeFirstLetter(value.ServerType)} ${value.Version}`
				DefaultJson.Server.Protocol = `${Protocol}`
				DefaultJson.Commands.StartServer = `java -Xmx${value.RAM}M -Xms128M -jar serverFileName nogui`
				DefaultJson.Msh.Port = `${value.Port}`
				if(typeof value.HibernationInfo !== 'undefined'){
					DefaultJson.Msh.HibernationInfo = `${value.HibernationInfo}`
				}
				if(typeof value.StartingInfo !== 'undefined'){
					DefaultJson.Msh.StartingInfo = `${value.StartingInfo}`
				}
				DefaultJson.Msh.TimeBeforeStoppingEmptyServer = value.StopTime


				res.status(200);
				res.set({"Content-Disposition":"attachment; filename=\"config.json\""});
				res.send(DefaultJson);
			}else{
				res.status(500);
				res.json({
					message: 'Internal error: Protocol_version_numbers.json missing'
				});
			}
		}else{
			console.log(`There is no 2-3-3.json.`,`${process.env.MSHConfigPath}/2-3-3.json`);
			res.status(500);
			res.json({
				message: 'No template file found... Check .env!'
			});
		}
	} catch (error) {
    	next(error);
  	}
});

router.get('/2-4-1', limiter, async (reg, res, next) => {
	try {
		const value = await GetSchema241.validateAsync(reg.query);
		if(fs.existsSync(`${reqPath}/${process.env.MSHConfigPath}/2-4-1.json`)) {
			if(ProtVersionNum !== undefined){
				let Protocol;
				if(ProtVersionNum.Minecraft_prot[value.Version] === undefined){
					Protocol = "Version is no official minecraft java release..."
				}else{
					Protocol = ProtVersionNum.Minecraft_prot[value.Version]
				}
				var DefaultJson = JSON.parse(fs.readFileSync(`${reqPath}/${process.env.MSHConfigPath}/2-4-1.json`));
				DefaultJson.Server.FileName = `${value.FileName}`
				DefaultJson.Server.Version = `${capitalizeFirstLetter(value.ServerType)} ${value.Version}`
				DefaultJson.Server.Protocol = `${Protocol}`
				DefaultJson.Commands.StartServer = `java -Xmx${value.RAM}M -Xms128M -jar serverFileName nogui`
				DefaultJson.Commands.StopServerAllowKill = value.StopServerAllowKill
				DefaultJson.Msh.Port = `${value.Port}`
				if(typeof value.HibernationInfo !== 'undefined'){
					DefaultJson.Msh.HibernationInfo = `${value.HibernationInfo}`
				}
				if(typeof value.StartingInfo !== 'undefined'){
					DefaultJson.Msh.StartingInfo = `${value.StartingInfo}`
				}
				DefaultJson.Msh.TimeBeforeStoppingEmptyServer = value.StopTime


				res.status(200);
				res.set({"Content-Disposition":"attachment; filename=\"config.json\""});
				res.send(DefaultJson);
			}else{
				res.status(500);
				res.json({
					message: 'Internal error: Protocol_version_numbers.json missing'
				});
			}
		}else{
			console.log(`There is no 2-4-1.json.`,`${process.env.MSHConfigPath}/2-4-1.json`);
			res.status(500);
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
