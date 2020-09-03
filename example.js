const express = require('express');

const router = express.Router();

/* Plugin info*/
const PluginName = "EBG-example";
const PluginRequirements = ['EBG-default|0.1.0'];
const PluginVersion = "0.1.0";
const PluginAuthor = "BolverBlitz";
const PluginDocs = "https://github.com/EBG-PW/EBG-API-Plugins";

router.get('/', (req, res) => {
  res.json(['Example Route']);
});

module.exports = {
	router: router,
	PluginName: PluginName,
	PluginRequirements: PluginRequirements,
	PluginVersion: PluginVersion,
	PluginAuthor: PluginAuthor,
	PluginDocs: PluginDocs
  };
