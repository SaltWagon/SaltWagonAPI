const express = require('express');
const apiRouter = require('./routers/api.js');

const app = express();

app.use('/api', apiRouter);

app.use(function(err,req,res,next){
    res.status(422).send({error: err.message});
});

app.listen(3000, function(){
    console.log('Server Started');
})
