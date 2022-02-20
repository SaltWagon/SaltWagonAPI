const express = require('express');
const router = express.Router();

const { MongoClient } = require("mongodb");
const uri = "[MongoDB URI]";
const client = new MongoClient(uri);

router.get('/findMultiple', async function (req, res) {
    let result, database, table, filter;

    try {
        await client.connect();
        database = client.db("parkingEasy");
        table = database.collection(req.query.tableName);
        filter = JSON.parse(req.query.filter);

        result = await table.find(filter).toArray();
    }
    finally {
        await client.close();
        res.send(result);
    }
});


router.get('/findOne', async function (req, res) {
    let result, database, table, filter;

    try {
        await client.connect();
        database = client.db("parkingEasy");
        table = database.collection(req.query.tableName);
        filter = JSON.parse(req.query.filter);

        result = await table.findOne(filter);
    }
    finally {
        await client.close();
        res.send(result);
    }
});

module.exports = router;
