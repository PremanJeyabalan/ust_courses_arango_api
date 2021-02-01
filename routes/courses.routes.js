const express = require('express')
const router = express.Router();
const db = require('../db/arangoConn');
const { Courses } = require('../controller/courses.controller');
const { parseApiResponse } = require('../utils/helpers');

const isCourse = async (req, res, next) => {
    const { course } = req.body;

    const result = await Courses({db}).checkIfCourseExists({course, collection: 'courses'})

    result ? next() : res.status(404).json({err: 'invalid course code', payload: result});
}

router.post('/prereqs', isCourse, async (req, res) => {
    const { course } = req.body;

    const result = await Courses({db}).findAllPrereqs({ course });

    parseApiResponse(res, result);


})

module.exports = router;