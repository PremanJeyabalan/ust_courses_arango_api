const { Database, aql } = require('arangojs');
const db = new Database({
    url: "http://localhost:8529",
    databaseName: "courses",
    auth: { username: "root", password: "openSesame" },
});

module.exports = db;

