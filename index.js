const express = require('express');
const {aql} = require('arangojs')
const db = require('./db/arangoConn');
const {courseCrawler, siteCrawler} = require('./scripts/puppeteer');
var bodyParser = require('body-parser');
const app = express()
app.use(
    bodyParser.urlencoded({
      extended: true
    })
);

app.use(bodyParser.json());

const main = async ({db}) => {
    // var finak;
    // try {
    //     const cursor = await db.query(aql`
    //         FOR u IN MATH
    //         FILTER u._key == '2023'
    //         RETURN u
    //     `)

    //    finak = await cursor.all();
    // } catch (err) {
    //     console.log(err)
    // }

    const abc = await siteCrawler();
    console.log(abc);
    
}

main({db});
