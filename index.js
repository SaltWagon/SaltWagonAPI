const express = require('express');
const apiRouter = require('./routers/api.js');
const axios = require('axios');
const databaseMgt = require('./apigrabber/databaseMgt');
const uri = "mongodb+srv://saltWagon:K9aWz86b8w13e4iE@cluster0.wzovy.mongodb.net/parkingEasy?retryWrites=true&w=majority";
const cors = require('cors')

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors())

app.use(function (err, req, res, next) {
    res.status(422).send({ error: err.message });
});

app.listen(PORT, function () {
    console.log('Server Started');
})

app.use('/api', apiRouter);

setInterval(function () {
    var tzoffset = (new Date()).getTimezoneOffset() * 60000; //offset in milliseconds
    var datestring = (new Date(Date.now() - tzoffset)).toISOString().slice(0, -1);

    var config = {
        method: 'get',
        url: 'https://api.data.gov.sg/v1/transport/carpark-availability?date_time=' + datestring,
        headers: {}
    };

    axios(config)
        .then(async function (response) {
            console.log(datestring);

            var dbMgt = new databaseMgt(uri);
            await dbMgt.open().then()
            await dbMgt.insertLotsDetail(JSON.parse(JSON.stringify(response.data.items[0].carpark_data).replace(new RegExp("\"carpark_number\":", 'g'), "\"car_park_no\":")));
            await dbMgt.updateCarparkInfo();
            await dbMgt.deleteOld();
            await dbMgt.close();
        })
        .catch(function (error) {
            console.log(error);
        });

}, 60 * 1000);

