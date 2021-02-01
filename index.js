const express = require('express');
require('dotenv').config()
const db = require('./db/arangoConn');
const {siteCrawler} = require('./scripts/puppeteer');
const { Puppeteer } = require('./controller/puppeteer.controller');
const courses = require('./routes/courses.routes');
var bodyParser = require('body-parser');
const app = express()
app.use(
    bodyParser.urlencoded({
      extended: true
    })
);

app.use(bodyParser.json());

app.use('/courses', courses)

app.listen(process.env.PORT,() => console.log(`Example app listening on port ${process.env.PORT}!`));



// const main = async ({db}) => {
    
//   // const data = await siteCrawler();

//   console.log("Inserting data into database...")
//   const data = null

//   const cursor = await Puppeteer({db}).initDatabase(data)

//   console.log("Success!")
  
// }

// main({db});
