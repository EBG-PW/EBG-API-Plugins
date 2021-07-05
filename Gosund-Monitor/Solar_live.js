require('dotenv').config()

const pg = require('pg');
const request = require("request");
const ping = require('ping');

const pool = new pg.Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
})

let Plugs = {
  IP_List: [
    {IP: '192.168.5.52', Name: "Solar"}
  ],
  ArrayLeng: 120,
  ArrayShort: 60
}

let AvrageArray = []

const ModuleName = "Solar_live";
const ModuleRequirements = [];
const ModuleVersion = "0.0.1";
const ModuleAuthor = "BolverBlitz";
const ModuleTables = ["power_history"];

//Globals
var cfg = {
  timeout: 1
  // WARNING: 1ms isn´t mutch
};

function getAllIndexes(arr, val) {
  var indexes = [], i = -1;
  while ((i = arr.indexOf(val, i+1)) != -1){
      indexes.push(i);
  }
  return indexes;
}

pool.query(`CREATE TABLE IF NOT EXISTS power_history (
  name text,
  v double precision,
  ma double precision,
  w double precision,
  va double precision,
  var double precision,
  pf precision,
  wht double precision,
  why double precision,
  whall double precision,
  time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (name,time))`, (err, result) => {
  if (err) {console.log(err)}
});

function Read(IP, Name) {
  return new Promise(function(resolve, reject) {
    ping.sys.probe(IP, function(isAlive){
      if(isAlive){
        try{
          request(`http://${IP}/?m=1`, { json: true }, (err, res, body) => {
            let out_arr = []; 
            if(body){
              let start_arr = getAllIndexes(body, '{m}');
              let stop_arr = getAllIndexes(body, '{e}');
              let end_arr = getAllIndexes(body, '{t}');
              for (i = 0; i < start_arr.length; i++) {
                out_arr.push(body.substr(start_arr[i]+3, stop_arr[i]-start_arr[i]-3))
              }
              
              resolve({
                Name: Name,
                IP: IP,
                Status: isAlive,
                State: body.substr(end_arr[1]+3, body.length).replace(/<[^>]*>?/gm, ''),
                V: parseInt(out_arr[0].replace(/\D/g,'')),
                mA: parseInt(out_arr[1].replace(/\D/g,'')),
                W: parseInt(out_arr[2].replace(/\D/g,'')),
                VA: parseInt(out_arr[3].replace(/\D/g,'')),
                VAr: parseInt(out_arr[4].replace(/\D/g,'')),
                PF: parseInt(out_arr[5].replace(/\D/g,'')),
                Wh_Today: parseInt(out_arr[6].replace(/\D/g,'')),
                Wh_Yesterday: parseInt(out_arr[7].replace(/\D/g,'')),
                Wh_Total: parseInt(out_arr[8].replace(/\D/g,''))
              })
            }else{
              resolve({
                Name: Name,
                  IP: IP,
                  Status: isAlive
              })
            }
          });
        } catch (error) {
          resolve({
            Name: Name,
              IP: IP,
              Status: isAlive
          })
        }
      }else{
        resolve({
          Name: Name,
            IP: IP,
            Status: isAlive
        })
      }
    }, cfg);
  });
}

function HandleDB() {
  return new Promise(function(resolve, reject) {
    let worker_arr = []
    Plugs.IP_List.map(a => {
      worker_arr.push(Read(a.IP, a.Name))
    });
    Promise.all(worker_arr).then(function(Response) {
      console.log(`[API.Modules] [LG] Saved SolarStats ${AvrageArray.length}/${Plugs.ArrayLeng}`)
      Response.map(a => {
        if(a.Status){
          AvrageArray.splice(0, 0, a)
          if(AvrageArray.length >= Plugs.ArrayLeng){
            AvrageArray.length = Plugs.ArrayLeng - Plugs.ArrayShort
            var avg = Array.from(AvrageArray.reduce(
              (acc, obj) => Object.keys(obj).reduce( 
                  (acc, key) => typeof obj[key] == "number"
                      ? acc.set(key, (acc.get(key) || []).concat(obj[key]))
                      : acc,
              acc),
            new Map())).reduce( 
                (acc, [name, values]) =>
                    Object.assign(acc, { [name]: values.reduce( (a,b) => a+b ) / values.length }),
                {}
            );
            
            for(key in avg){
              avg[key] = avg[key].toFixed(2)
            }
            
            pool.query('INSERT INTO "power_history" VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)', [
              a.Name, avg.V, avg.mA, avg.W, avg.VA, avg.VAr, avg.PF, avg.Wh_Today, avg.Wh_Yesterday, avg.Wh_Total
            ], (err, result) => {
              if (err) {console.log(err)}
            });
          }
        }else{
          console.log(`[API.Modules] [LG] Plug is offline`)
        }
      });
    });
  });
}

function CleanHWDB() {
  pool.query(`DELETE FROM "power_history" WHERE time < (now() - '365d'::interval);`, (err, result) => {
    if (err) {console.log(err)}
  });
}

setInterval(function(){
  HandleDB()
}, 1*1000);

setInterval(function(){
  CleanHWDB();
}, 30*1000*60+50);


module.exports = {
	ModuleName: ModuleName,
	ModuleRequirements: ModuleRequirements,
	ModuleVersion: ModuleVersion,
	ModuleAuthor: ModuleAuthor,
	ModuleTables: ModuleTables
  };