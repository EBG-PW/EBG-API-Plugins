require('dotenv').config();
const express = require('express');
const rateLimit = require("express-rate-limit");
const Joi = require('joi');
const mysql = require('mysql');

const db = mysql.createPool({
    connectionLimit: 100,
    host: '',
    user: '',
    password: '',
    database: '',
    charset: 'utf8mb4_bin'
  });

const PluginConfig = {
    Token: "1234"
}

let getuser = function(cullom, value) {
	return new Promise(function(resolve, reject) {
		db.getConnection(function(err, connection){
			connection.query(`SELECT id FROM users WHERE ${cullom} = '${value}';`, function(err, rows, fields) {
				connection.release();
				console.log(rows, err);
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

const schema = Joi.object({
	pterodactyl_id: Joi.number(),
	email: Joi.string().email(),
	token: Joi.string().required()
  });

const router = express.Router();

router.get('/', limiter, async (reg, res, next) => {
	try {
		const value = await schema.validateAsync(reg.query);
		if(value.token === PluginConfig.Token){
			if(value.pterodactyl_id){
				getuser('pterodactyl_id', value.pterodactyl_id).then(function(SQL_Return) {
					res.status(200);
					res.json({
						PanelID: SQL_Return[0].id
					});
				});
			}else if(value.email){
				getuser('email', value.email).then(function(SQL_Return) {
					res.status(200);
					res.json({
						PanelID: SQL_Return[0].id
					});
				});
			}else{
				res.status(503);
				res.json({
				  error: 'Database error!'
				});
			}
		}else{
			res.status(401);
			res.json({
				error: 'Token Required'
			});
		}
		
	} catch (error) {
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