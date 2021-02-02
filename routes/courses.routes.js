const express = require('express')
const router = express.Router();
const db = require('../db/arangoConn');
const { Courses } = require('../controller/courses.controller');
const { parseApiResponse } = require('../utils/helpers');

router.post('/prereqs', async (req, res) => {
    const { course } = req.body;

    const result = await Courses({db}).findAllPrereqs({ course });

    parseApiResponse(res, result);


})

router.post('/exclusions', async (req, res) => {
    const { course } = req.body;

    const result = await Courses({db}).findAllExclusions({ course });

    parseApiResponse(res, result);
})

router.post('/postreqs', async(req, res) => {
    const {course} = req.body;

    const result = await Courses({db}).findAllPostreqs({ course });

    parseApiResponse(res, result)
})

module.exports = router;