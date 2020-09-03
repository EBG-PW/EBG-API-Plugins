const express = require('express');

const router = express.Router();

/* Plugin info*/
const PluginName = "EBG-default";
const PluginRequirements = [];
const PluginVersion = "0.1.0";
const PluginAuthor = "BolverBlitz";
const PluginDocs = "https://github.com/EBG-PW/EBG-API-Plugins";

router.get('/', (req, res) => {
  res.json(['Defaule Route']);
});

module.exports = {
	router: router,
	PluginName: PluginName,
	PluginRequirements: PluginRequirements,
	PluginVersion: PluginVersion,
	PluginAuthor: PluginAuthor,
	PluginDocs: PluginDocs
  };
