var mongoose = require('mongoose');
mongoose.connect("mongodb://127.0.0.1/gridTest");
var conn = mongoose.connection;
var path = require("path");
var Grid = require("gridfs-stream")
var fs = require("fs");

var pathPdf = path.join(__dirname, "/manuale 5e.pdf")
// Grid.mongo = mongoose.connection

conn.once("open", function(){
    console.log("Connesso ewwiwa!!!")

    Grid.mongo = mongoose.mongo
    console.log(new Grid.mongo.ObjectId())
    let gfs = Grid(conn.db)
    console.log(new gfs.mongo.ObjectId())
    var writeStream = gfs.createWriteStream({
        filename: "bello_figo.pdf"
    });
    fs.createReadStream(pathPdf).pipe(writeStream);

    writeStream.on("close", function () {
        console.log("dovrebbe aver finito")
    })
})