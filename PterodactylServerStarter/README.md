# PterodactylServerStarter
Plugin to list all your servers of peterodactyl and start them if they don´t run.  
Everyone on the Internet can start them, so be warned!  

![grafik](https://user-images.githubusercontent.com/35345288/116951454-320a5600-ac88-11eb-9d8a-c30a26021fe0.png)


## Installation
Clone [EBG API Base](https://github.com/EBG-PW/EBG-API-Base)  
Create a folder named data in the root directory of the API repo  
Run `npm i`  
Drop the PSS.js file in `/src/api` folder  
Drop the PSSStore folder in `/data` 
Open /`data/PSSStore/config.json` and set your API Key  

Add in .env file:  
PSSConfigPath=./Your Path (Default is /data/PSSStore)  
  
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
