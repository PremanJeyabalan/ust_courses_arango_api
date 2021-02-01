const { Base } = require('./base.controller');
const { toUpper } = require('lodash');
const { aql } = require('arangojs');


function Courses({ db }) {
    const checkIfCourseExists = async ({course, collection}) => {
        const result = await Base({db, collection }).checkDocExists({doc: toUpper(course)});

        return result;
    }

    const findAllPrereqs = async ({ course }) => {
        const id = `courses/${course}`
        const cursor = await db.query(aql`
            FOR v, e, p IN 1..10 INBOUND ${id} prerequisiteOf

            RETURN v
        `)


        const result = await cursor.all();
        return result;
        
    }

    return Object({
        checkIfCourseExists,
        findAllPrereqs
    })
}

module.exports = {
    Courses
}