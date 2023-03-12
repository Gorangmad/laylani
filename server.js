require('dotenv').config()

const express = require ('express')

const app = express()

const ejs = require ('ejs')

const path = require ('path')

const expressLayout = require('express-ejs-layouts')

const PORT = process.env.PORT || 3400

const mongoose = require ('mongoose')

const session = require ('express-session')

const flash = require('express-flash')

const MongoDbStore = require('connect-mongo')

const passport = require('passport')

 const Emitter = require('events')


//Database connection

const url = 'mongodb://localhost:27017/pizza';
mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true, family: 4});
const connection = mongoose.connection;
connection.once('open', () => {
    console.log ('Database connected....');
});


//Session config

app.use(session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    store: MongoDbStore.create({ mongoUrl: 'mongodb://localhost:27017/pizza' }),
    saveUninitialized: false,
    cookie: {maxAge: 1000 * 60 * 60* 48} // 24 hours
}))


// // Event emitter
const eventEmitter = new Emitter()
app.set('eventEmitter', eventEmitter)

//Passport config

const passportInit = require ('./app/config/passport')
passportInit(passport)
app.use(passport.initialize())
app.use(passport.session())


//Assests
app.use(express.static('public'))

app.use(express.urlencoded( { extended: false }))

app.use(express.json())


//Global middleware
app.use((req, res, next) => {
    res.locals.session = req.session
    res.locals.user = req.user
    next()
})



app.use(flash())

//set template engine

app.use(expressLayout)

app.set('views', path.join(__dirname, '/resources/views'))

app.set('view engine', 'ejs')


//Routes
require('./routes/web')(app)


const server = app.listen(PORT , () =>{
    console.log('listening on port 3400')
})

// Socket

const io = require('socket.io')(server)
io.on('connection', (socket) => {
      // Join
      socket.on('join', (orderId) => {
        socket.join(orderId)
      })
})

eventEmitter.on('orderUpdated', (data) => {
    io.to(`order_${data.id}`).emit('orderUpdated', data)
})

eventEmitter.on('orderPlace', (data) =>{
    io.to('adminRoom').emit('orderPlace', data)
} )