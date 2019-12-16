const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_URL, {
	useUnifiedTopology: true,
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
});


// mongodb local server command
// /Users/jakubprzywara/Desktop/Code/mongodb/bin/mongod --dbpath="/Users/jakubprzywara/Desktop/Code/mongodb-data"
