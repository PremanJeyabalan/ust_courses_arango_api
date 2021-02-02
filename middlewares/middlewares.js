const { Courses } = require('../controller/courses.controller')
const db = require('../db/arangoConn')

const isCourse = async (req, res, next) => {
    const { course } = req.body;

    const result = await Courses({db}).checkIfCourseExists({course, collection: 'courses'})

    result ? next() : res.status(404).json({err: 'invalid course code', payload: result});
}

const logRequestStart = (req, res, next) => {
    console.info(`${req.method} ${req.originalUrl}`) 
    
    res.on('finish', () => {
        console.info(`${res.statusCode} ${res.statusMessage}; ${res.get('Content-Length') || 0}b sent`)
    })
    
    next()
}

module.exports = {
    isCourse,
    logRequestStart
}