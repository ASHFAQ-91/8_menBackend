const mongoose = require('mongoose');

mongoose.connect("mongodb://127.0.0.1:27017/ashfaq")         //database name
.then(() => {
    console.log("connection successful...");
}).catch((e) => {
    console.log("No connection...");
})

mongoose.set('strictQuery', true);