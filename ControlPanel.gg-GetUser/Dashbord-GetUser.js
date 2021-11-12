require('dotenv').config();
const express = require('express');
const rateLimit = require("express-rate-limit");
const Joi = require('joi');
const mysql = require('mysql');

const db = mysql.createPool({
    connectionLimit: 100,
    host: '127.0.0.1',
    user: '',
    password: '',
    database: '',
    charset: 'utf8mb4_bin'
  });

const PluginConfig = {
    Token: ""
}

let getuser = function(cullom, value) {
	return new Promise(function(resolve, reject) {
		db.getConnection(function(err, connection){
			connection.query(`SELECT id FROM users WHERE ${cullom} = ${value};`, function(err, rows, fields) {
				connection.release();
				//console.log(rows, err);
				if(Object.entries(rows).length === 0){
					resolve("0");
				}else{
					resolve(rows);
				}
			});
		});
	});
}

/* Plugin info*/
const PluginName = "Dashbord-GetUser";
const PluginRequirements = [];
const PluginVersion = "0.0.2";
const PluginAuthor = "BolverBlitz";
const PluginDocs = "";

const limiter = rateLimit({
	windowMs: 60 * 1000, 
	max: 50
  });

const router = express.Router();



module.exports = {
	router: router,
	PluginName: PluginName,
	PluginRequirements: PluginRequirements,
	PluginVersion: PluginVersion,
	PluginAuthor: PluginAuthor,
	PluginDocs: PluginDocs
  };