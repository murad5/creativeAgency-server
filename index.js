const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const fileUpload = require('express-fileupload');
const fs = require('fs-extra')
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectID;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.us2jj.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
require('dotenv').config()
const app = express()
const port = 5000

app.use(cors());
app.use(bodyParser.json());
app.use(fileUpload());

client.connect(err => {
    const serviceCollection = client.db("creativeAgency").collection("services");
    const reviewCollection = client.db("creativeAgency").collection("reviews");
    const orderCollection = client.db("creativeAgency").collection("orders");
    const adminCollection = client.db("creativeAgency").collection("admin");
   

    app.post("/addOrder", cors(),(req, res) =>{
      
      const file = req.files.file;
      const name = req.body.name;
      const email= req.body.email;
      const service = req.body.title;
      const description = req.body.description;
      const price = req.body.price;
      const status = req.body.status;
      
      console.log(file ,name, email, service, description, price, status);

        const newImg = file.data;
        const encImg = newImg.toString('base64');

       var image = {
          contentType: req.files.file.mimetype,
          size: req.files.file.size,
          img: Buffer.from(encImg, 'base64')
      };
      orderCollection.insertOne({ name, email, service, description, price,image, status })
          .then(result => {
              res.send(result.insertedCount > 0);
          })
      

      })

    app.get('/order', cors(),(req, res) => {
      orderCollection.find({email: req.query.email})
      .toArray((err, documents)=>{
        res.send(documents);
      })

    })


    app.get('/services', cors(), (req, res) =>{
        serviceCollection.find({})
        .toArray((err, documents) =>{
            res.send(documents);
        })
    })

    app.post('/addService', cors(), (req, res) => {
      const file = req.files.file;
      const title = req.body.title;
      const description = req.body.description;

      console.log(file , title, description);

      const newImg = file.data;
      const encImg = newImg.toString('base64');

      var image = {
          contentType: req.files.file.mimetype,
          size: req.files.file.size,
          img: Buffer.from(encImg, 'base64')
      };

      serviceCollection.insertOne({ title, description, image })
          .then(result => {
              res.send(result.insertedCount > 0);
          })
})


app.get('/serviceList', cors(), (req, res) => {
  orderCollection.find({})
  .toArray( (err, documents) => {
    res.send(documents);
  })
})

app.patch('/update/:id',cors(), (req, res) =>{

    console.log(req.params.id , req.body.e)
   orderCollection.updateOne({_id: ObjectId(req.params.id)},
     {
       $set: { status: req.body.e}

     })
     .then(result =>{
      res.send(result.modifiedCount>0)
       
     })

    })


app.post('/addReview',cors(), (req, res) => {
  
  const name = req.body.name;
  const designation= req.body.designation;
  const description = req.body.description;
  const image = req.body.image;

  console.log(image , name, designation, description);

  reviewCollection.insertOne({ name, designation, description, image })
      .then(result => {
          res.send(result);
      })
})

app.get('/reviews',cors(), (req, res)=>{
  reviewCollection.find({}).limit(6)
  .toArray((err, documents)=>{
    res.send(documents);
  })
})

app.post('/isAdmin',cors(), (req, res) => {
  const email = req.body.email;
  adminCollection.find({ email: email })
      .toArray((err, admins) => {
          res.send(admins.length > 0);
      })
})

app.post('/addAdmin',cors(), (req, res)=>{
  const email = req.body.email;

  adminCollection.insertOne({ email})
  .then(result => {
    res.send(result);
  })
})

})


app.get('/',cors(), (req, res) => {
    res.send('Hello World!')
  })

  app.listen(process.env.PORT||port )