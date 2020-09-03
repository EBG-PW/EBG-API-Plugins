# EBG-API-Plugins
Plugins for the EBG API

### How to make a Plugin?

```js
const express = require('express');

const router = express.Router();

/* Plugin info*/
const PluginName = "EBG-example"; //This plugins name
const PluginRequirements = ['EBG-default|0.1.0']; //Put your Requirements and version here <Name, not file name>|Version
const PluginVersion = "0.1.0"; //This plugins version
const PluginAuthor = "BolverBlitz";
const PluginDocs = "https://github.com/EBG-PW/EBG-API-Plugins";

/* Your code 
router.get('/', (req, res) => {
  res.json(['Example Route']);
});
*/

module.exports = {
	router: router,
	PluginName: PluginName,
	PluginRequirements: PluginRequirements,
	PluginVersion: PluginVersion,
	PluginAuthor: PluginAuthor,
	PluginDocs: PluginDocs
  };
```
  
To get a Plugin to work you just need to save it in "EBG-API-Base/src/api/"  
if you run nodemon it will be loaded instantly, using normal node you have to restart the API.