# PterodactylServerStarter
Plugin to list all your servers of peterodactyl and start them if they don´t run.  
Everyone on the Internet can start them, so be warned!  

## Installation
Clone [EBG API Base](https://github.com/EBG-PW/EBG-API-Base)  
Create a folder named data in the root directory of the API repo  
Run `npm i`
Drop the PSS.js file in /src/api folder
Drop the PSSStore folder in /data
Open /data/PSSStore/config.json and set your API Key

Add in .env file:  
PSSConfigPath=./Your Path (Default is /data/PSSStore)  


### Modding the EBG API Base Files
This is needet so the EBG-BASE-API code is allowed to serve web with external js code.  

Add to /src/app.js after const bodyParser = require('body-parser');  
```js
const { expressCspHeader, INLINE, NONE, SELF } = require('express-csp-header');
```

Add to /src/app.js below the line app.use(cors());  
```js
app.use(expressCspHeader({
  directives: {
      'default-src': [SELF],
      'script-src': [SELF, INLINE, 'https://ajax.googleapis.com/ajax/libs/jquery/3.5.1/jquery.min.js'],
      'style-src': [SELF, INLINE],
      'img-src': [SELF, INLINE],
      'worker-src': [NONE],
      'block-all-mixed-content': true
  }
}));
```
  
### Requirements for the plugin
`npm i express-rate-limit nodeactyl-beta express-csp-header joi` 

### How to get the API Key
Click on the user icon in the top right corner
![grafik](https://user-images.githubusercontent.com/35345288/116950849-99270b00-ac86-11eb-8908-dd1ed3f692a8.png)
  
Click on "API Credentials"
![grafik](https://user-images.githubusercontent.com/35345288/116950936-cd9ac700-ac86-11eb-90ee-266e85ecac99.png)
  
Type a description and click crate
![grafik](https://user-images.githubusercontent.com/35345288/116951014-13578f80-ac87-11eb-8f36-f76705ba445b.png)
  
Copy the Token you get from the popup
