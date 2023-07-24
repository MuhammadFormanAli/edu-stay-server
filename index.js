const express = require('express')
const app = express()
const cors = require('cors')

require('dotenv').config()

const { MongoClient, ServerApiVersion, ObjectId  } = require('mongodb');
const port = process.env.PORT || 5000

//middleware
app.use(cors())
app.use(express.json())








const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.shgmdrc.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});



async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();


    const collegeCollection = client.db('eduStay').collection('colleges');
    const applicationCollection = client.db('eduStay').collection('applications');
    const reviewCollection = client.db('eduStay').collection('review');
    const usersCollection = client.db('eduStay').collection('users');
    

// to get all colleges
    app.get('/colleges', async (req, res) => {
      const result = await collegeCollection.find().toArray()
      res.send(result);
    })

    // to get top colleges
    app.get('/top-colleges', async (req, res) => {
      const sort = { collegeRatting: -1 }
      const result = await collegeCollection.find().sort(sort).limit(3).toArray()
      res.send(result);

    })

    // get one college
    app.get('/college/:id', async (req, res) => {
      const id = req.params.id
      // console.log("from param",id)
      const query = { _id: new ObjectId(id) }
      const result = await collegeCollection.findOne(query)
      res.send(result)
    })

    //to add applications
    app.post('/application', async(req, res) => {
      const application = req.body;
      // console.log('new application', application);
      const result = await applicationCollection.insertOne(application);
      res.send(result);
  });

//get applications
 
  app.get('/applications', async (req, res) => {
    const queryEmail = req.query.email
    const query = {email: queryEmail}
    const result = await applicationCollection.find(query).toArray()
    res.send(result);
  })

  // to add review
  app.post('/reviews', async(req, res) => {
    const review = req.body;
    // console.log('new application', review);
    const result = await reviewCollection.insertOne(review);
    res.send(result);
});


//get review
app.get('/reviews', async (req, res) => {
  const result = await reviewCollection.find().limit(6).toArray()
  res.send(result);
})


// route for add users in database

app.post('/users', async(req, res) => {
  const user = req.body;
  // console.log('new user', user);
  const query = { email: user?.email }
  const existingUser = await usersCollection.findOne(query);
  if (existingUser) {
    return res.send({ message: 'user already exists' }) 
  }
  const result = await usersCollection.insertOne(user);
  res.send(result);
});

// route for get a user
app.get('/users', async (req, res) => {
  const queryEmail = req.query.email
  const query = {email: queryEmail}
  const result = await usersCollection.findOne(query)
  res.send(result);
})



 // route for update users 
 app.put('/users/:id', async (req, res) => {
  const id = req.params.id;
  const user = req.body;

  const filter = { _id: new ObjectId(id) }
  const options = { upsert: true }
  const updatedUser = {
    $set: {
      name: user.name,
      email: user.email,
      address: user.address,
      university: user.university,
      photo: user.photo
    }

  }

  const result = await usersCollection.updateOne(filter, updatedUser, options);
  res.send(result);

})










    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
  res.send('Life is beautiful')
})
app.listen(port, () => {
  console.log(`life is running on port:${port}`)
})