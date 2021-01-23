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
        ['courses', 'departments'].forEach(async (string) => {
            const col = db.collection(string);
            if(! (await col.exists())){
                await col.create();
            }
        })
        
        for (course of data){
            const doc = await insertCourse({collection: 'courses', _key: course.code});
            console.log(doc);

            const group = await insertRelation({
                _from: `courses/${course.code}`,
                _to: `departments/${course.code.substr(0,4)}`,
                edgeCollection: 'departmentOf'
            })

            console.log(group);

            if (Array.isArray(course.prereqs)){
                for (pre of course.prereqs){
                    const  _from = 'courses/' + pre.substr(0, 4) + pre.substr(5);  
                    const _to = 'courses/' + course.code;
                    const edge = await insertRelation({_from, _to, edgeCollection: 'prerequisiteOf'});
                    console.log(edge)
                }
            }

            if (Array.isArray(course.exclusions)){
                for (let index = 1; index < course.exclusions.length; index++) {
                    const element = course.exclusions[index];
                    const lastElement = course.exclusions[index-1];

                    const edge = await insertRelation({
                        _from: 'courses/' + lastElement.substr(0,4) + lastElement.substr(5),
                        _to: 'courses/' + element.substr(0,4) + element.substr(5),
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