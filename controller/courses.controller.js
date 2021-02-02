const { Base } = require('./base.controller');
const { toUpper } = require('lodash');
const { aql } = require('arangojs');


function Courses({ db }) {
    const checkIfCourseExists = async ({course, collection}) => {
        const result = await Base({db, collection }).checkDocExists({doc: toUpper(course)});

        return result;
    }

    const findAllPrereqs = async ({ course }) => {
        const id = `courses/${toUpper(course)}`
        const cursor = await db.query(aql`
            FOR v, e, p IN 1..10 INBOUND ${id} prerequisiteOf

            RETURN p
        `)


        const result = await cursor.all();
        return result;

    }

    const findAllExclusions = async ({ course }) => {
        const id = `courses/${toUpper(course)}`
        const cursor = await db.query(aql`
            FOR v, e, p IN 1..10 ANY ${id} exclusionOf

            RETURN DISTINCT v
        `)

        const result = await cursor.all();
        return result;
    }

    const findAllPostreqs = async ({ course }) => {
        const id = `courses/${toUpper(course)}`
        const cursor = await db.query(aql`
            FOR v, e, p IN 1..10 OUTBOUND ${id} prerequisiteOf

            RETURN p
        `)

        const result = await cursor.all();
        return result;
    }

    return Object.freeze({
        checkIfCourseExists,
        findAllPrereqs,
        findAllExclusions,
        findAllPostreqs
    })
}

module.exports = {
    Courses
}
