const { Base } = require('./base.controller');


function Puppeteer({ db }) {
    const insertCourse = async ({collection, _key}) => {
        const cursor = await Base({db, collection}).insertIntoCollection({
            _key
        })

        return (await cursor.next())
    }

    const insertRelation = async ({_from, _to, edgeCollection}) => {
        const cursor = await Base({db, collection: edgeCollection}).createEdge({
            _from,
            _to
        });

        return (await cursor.next());
    }

    const initDatabase = async data => {
        for (course of data){
            const collection = course.code.substr(0, 4);
            const _key = course.code.substr(4).trim();
            const doc = await insertCourse({collection, _key});
            console.log(doc);

            if (Array.isArray(course.prereqs)){
                for (pre of course.prereqs){
                    const  _from = pre.substr(0, 4) + '/' + pre.substr(5).trim();  
                    const _to = collection + '/' + _key;
                    const edge = await insertRelation({_from, _to, edgeCollection: 'prerequisiteOf'});
                    console.log(edge)
                }
            }

            if (Array.isArray(course.exclusions)){
                for (let index = 1; index < course.exclusions.length; index++) {
                    const element = course.exclusions[index];
                    const lastElement = course.exclusions[index-1];

                    const edge = await insertRelation({
                        _from: lastElement.substr(0,4) + '/' +  lastElement.substr(5).trim(),
                        _to: element.substr(0,4) + '/' +  element.substr(5).trim(),
                        edgeCollection: 'exclusionOf'
                    })

                    console.log(edge)

                }
            }
        }
    }
    return Object({
        initDatabase,
        insertCourse,
        insertRelation,
    })
}

module.exports = {
    Puppeteer
}