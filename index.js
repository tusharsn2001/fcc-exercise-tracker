const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const url = process.env.MONGO_URI
const uri = 'mongodb+srv://tusharcsemitrc2020:2255@fcc-excercise.yc237ip.mongodb.net/track-excercise'



mongoose.connect(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log("Connected to db")
}).catch((e) => {
  console.log(e)
})

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  }

})

const User = mongoose.model('User', userSchema)

const exerciseSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  duration: {
    type: Number
  },
  date: {
    type: Date
  }

})

const Exercise = mongoose.model('Exercise', exerciseSchema)







app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});


// get all users

app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find()
    res.json(users)
  } catch (error) {
    console.log(error)
  }
})

// create single user

app.post('/api/users', async (req, res) => {
  try {
    const newUser = await User.create({
      username: req.body.username
    })
    console.log(newUser)
    res.json(newUser)
  }
  catch (err) {

  }
})

// get logs of users

app.get('/api/users/:_id/logs', async (req, res) => {
  const { from, to, limit } = req.query;
  const id = req.params._id
  const user = await User.findById(id)
  if (!user) {
    res.send('user dosent exist')
    return;
  }

  let dateObj = {}
  if (from) {
    dateObj["$gte"] = new Date(from)
  }
  if (to) {
    dateObj["$lte"] = new Date(to)
  }
  let filter = {
    user_id: id
  }
  if (from || to) {
    filter.date = dateObj;
  }

  const exercises = await Exercise.find(filter).limit(+limit ?? 100)

  const log = exercises.map((item) => ({
    description: item.description,
    duration: item.duration,
    date: item.date.toDateString()

  }))

  res.json({
    username: user.username,
    count: exercises.length,
    _id: user._id,
    log
  })
})


// create exercise

app.post('/api/users/:id/exercises', async (req, res) => {
  const id = req.params.id;
  const date = req.body.date;
  try {
    const user = await User.findById(id)
    if (!user) {
      res.send('User not exist')
    } else {
      const newExercise = await Exercise.create({
        user_id: user._id,
        description: req.body.description,
        duration: req.body.duration,
        date: date ? new Date(date) : new Date(),

      })
      res.json({
        _id: user._id,
        username: user.username,
        description: newExercise.description,
        duration: newExercise.duration,
        date: new Date(newExercise.date).toDateString()
      })

    }

  } catch (error) {
    console.log(error)
  }
})



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
