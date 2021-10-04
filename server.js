const express = require("express");
const cors = require("cors");
const app = express();
const apiPort = 2000;
const vision = require("@google-cloud/vision");
const visionClient = new vision.ImageAnnotatorClient({ keyFilename: "./VisionKey.json" });
const mongoose = require("mongoose");
const db = mongoose.connection;
const limitTotalImages = 5; // limit to total 5 queries on page load;
const path = require("path");

app.use(cors());
app.use(express.json());
app.use(express.static('./client/build/'))

mongoose.connect("mongodb+srv://dbUser:dbUserPassword@cluster0.xgmtd.mongodb.net/db?retryWrites=true&w=majority");
db.on("error", console.error.bind(console, "connection error: "));
db.once("open", function () { console.log("Connected successfully"); });

const ImageSchema = new mongoose.Schema({
    url: String,
    labels: Array
});

const Image = mongoose.model("Image", ImageSchema, 'imagesCollection');

app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, './client/build/index.html'));
});

app.get('/photosAPI', (req, res) => {
    Image.find({}, (err, result) => {
        if (err) console.log(err);
        else res.send(result);
    })
    .limit(limitTotalImages)
    .sort({_id:-1}); 
});

app.post('/', (req, res) => {
    visionClient
    .labelDetection(req.body.url)
    .then((results) => {
        const labels = [];
        const labelAnnotations = results[0].labelAnnotations;
        labelAnnotations.forEach((label) => labels.push(label.description));
        const data = new Image({ url: req.body.url, labels: labels });
        data.save();
        res.send(data);
    })
    .catch((err) => { console.log(err); res.send(err); });
});

app.listen(apiPort, () => console.log(`Server running on port ${apiPort}`));