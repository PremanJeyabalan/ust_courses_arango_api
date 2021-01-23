const express = require('express');
require('dotenv').config()
const db = require('./db/arangoConn');
const {siteCrawler} = require('./scripts/puppeteer');
const { Puppeteer } = require('./controller/puppeteer.controller');
var bodyParser = require('body-parser');
const app = express()
app.use(
    bodyParser.urlencoded({
      extended: true
    })
);

app.use(bodyParser.json());

const main = async ({db}) => {
    
  // const data = await siteCrawler();

  console.log("Inserting data into database...")
  const data = null

  const cursor = await Puppeteer({db}).initDatabase(data)

  console.log("Success!")
  
}

main({db});
