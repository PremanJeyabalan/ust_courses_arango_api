const { aql } = require("arangojs");

function Base({collection, db}) {
    const col = db.collection(collection);
    // const edgeCol = db.edgeCollection(collection);

    const insertIntoCollection = async payload => {
        if (Array.isArray(payload)) {
            let arrayResult = Array();
            for (let i = 0; i<payload.length; i++){
                const result = await db.query(aql`
                    UPSERT ${payload[i]}
                    INSERT ${payload[i]}
                    UPDATE {}
                    INTO ${col}
                    RETURN NEW
                `);
                arrayResult.push(result);
            }
            return arrayResult;
        } else {
            const result = await db.query(aql`
                UPSERT ${payload}
                INSERT ${payload}
                UPDATE {}
                INTO ${col}
                RETURN NEW
            `);
            return result;
        }
    }

    const removeFromCollection = async payload => {
        const { key } = payload;
        const result = await db.query(aql`
            REMOVE ${key} IN ${col}
        `)
    }

    const removeEdge = async ({from, to}) => {
        const cursor = await db.query(aql`
            FOR doc IN ${col}
                FILTER doc._to == ${to}
                AND doc._from == ${from}
                REMOVE doc IN ${col}
                RETURN OLD
        `)
        return cursor;
    }

    const createEdge = async ({ _from, _to }) => {
        const cursor = await db.query(aql` INSERT {_from: ${_from}, _to: ${_to}} INTO ${col} RETURN NEW`);
        return cursor;
    };

    return Object({
        insertIntoCollection,
        removeFromCollection,
        removeEdge,
        createEdge,
    })
}

module.exports = {
    Base
}