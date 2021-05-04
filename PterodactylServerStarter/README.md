# PterodactylServerStarter
Plugin to list all your servers of peterodactyl  

### Requirements
`npm i express-rate-limit nodeactyl-beta express-csp-header joi` 
  
Add in .env  
PSSConfigPath=./Your Path (Default is /data/PSSStore)  


### MOdding the EBG API Base Files
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