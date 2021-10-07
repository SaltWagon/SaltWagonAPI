const express = require('express');
const apiRouter = require('./routers/api.js');
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