const express = require('express');
const rateLimit = require("express-rate-limit");
const Joi = require('joi');

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
	email: Joi.string().trim().required(),
	category: Joi.number().required(),
	person: Joi.number().required(),
	message: Joi.string().trim().required(),
});

router.post('/', limiter, async (reg, res, next) => {
	try{
		const value = await schema.validateAsync(reg.body);
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