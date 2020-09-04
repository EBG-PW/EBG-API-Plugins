require('dotenv').config();
const express = require('express');
const rateLimit = require("express-rate-limit");
const Joi = require('joi');

const Telebot = require('telebot');
const bot = new Telebot({
	token: process.env.Contact_TG_Bot_Token,
	limit: 1000,
        usePlugins: ['commandButton']
});

const PluginConfig = {
	category: ["Help","Issue","Request","Other"],
	person: ["All", "GodOfOwls","BolverBlitz","Geozukunft"],
	UserID: ["Place","357693014","206921999","181585055"]
}

/* Plugin info*/
const PluginName = "EBG-contact";
const PluginRequirements = [];
const PluginVersion = "0.1.1";
const PluginAuthor = "BolverBlitz";
const PluginDocs = "docs.ebg.pw";

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, 
	max: 5
  });

const router = express.Router();


const schema = Joi.object({
	name: Joi.string().trim().required(),
	email: Joi.string().email().required(),
	category: Joi.number().required(),
	person: Joi.number().required(),
	message: Joi.string().trim().required(),
});

router.post('/', limiter, async (reg, res, next) => {
	try{
		const value = await schema.validateAsync(reg.body);
		if(value.person === 0){
			var Mention = "";
			for (i = 1; i < PluginConfig.UserID.length; i++) {
				Mention += `<a href="tg://user?id=${PluginConfig.UserID[i]}"> </a>`
			}
		}else{
			var Mention = `<a href="tg://user?id=${PluginConfig.UserID[value.person]}"> </a>`
		}
		bot.sendMessage(`-251992918`, `Neue Kontaktanfrage von ${value.name}\nKategorie: ${PluginConfig.category[value.category]}\nAnfrage für ${PluginConfig.person[value.person]}\nAntwort an:${value.email}\n${Mention}\n<b>Nachricht:</b>\n<pre language="c++">${value.message}</pre>`, { parseMode: 'html' , webPreview: false}).catch(error => console.log('Error: (Telegram Send Message)', error.description));
		res.json(value);
	}catch (error) {
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