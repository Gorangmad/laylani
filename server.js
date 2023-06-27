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

const nodemailer = require('nodemailer')

const passport = require('passport')

const Emitter = require('events')

const Order = require('./app/models/order')


//Database connection

const url ='mongodb://127.0.0.1:27017/?readPreference=primary&directConnection=true&ssl=false';
mongoose.connect(url, {useNewUrlParser: true, useUnifiedTopology: true, family: 4});
const connection = mongoose.connection;
connection.once('open', () => {
    console.log ('Database connected....');
});


//Session config

app.use(session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    store: MongoDbStore.create({ mongoUrl: 'mongodb://127.0.0.1:27017/?readPreference=primary&directConnection=true&ssl=false'}),
    saveUninitialized: false,
    cookie: {maxAge: 1000 * 60 * 60* 48} // 24 hours
}))


// // Event emitter
const eventEmitter = new Emitter()
app.set('eventEmitter', eventEmitter)

//Passport config

const passportInit = require ('./app/config/passport')
const { Socket } = require('socket.io')
passportInit(passport)
app.use(passport.initialize())
app.use(passport.session())


//Assests
app.use(express.static('public'))

app.use(express.urlencoded( { extended: false }))

app.use(express.json())


// Nodemailer

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'ggorangmadaan@gmail.com',
      pass: 'olbjpelutqeykilo'
    }
  });

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
const io = require('socket.io')(server);

io.on('connection', (socket) => {
    socket.on('join', (orderId) => {
      socket.join(orderId);
    });
});

eventEmitter.on('orderUpdated', async (data) => {
  io.to(`order_${data.id}`).emit('orderUpdated', data);

  if (data.status === 'completed') {
    try {
      // Fetch the order details from the database based on the data.id
      const order = await Order.findById(data.id);

      console.log(order)

      // Check if the order exists
      if (!order) {
        console.log('Order not found');
        return;
      }

      const orderDetails = {
        orderId: order._id,
        Produkte: [],
      
        // Include other order details as needed
      };
      
      for (const itemId in order.items) {
        if (order.items.hasOwnProperty(itemId)) {
          const item = order.items[itemId];
          const itemName = item.item.name;
          const itemQty = item.qty;
      
          orderDetails.Produkte.push(itemName, itemQty);
        }
      }

      

      let emailBody = `Order ${data.id} has been completed.\n\nOrder Details:\n`;
      Object.entries(orderDetails).forEach(([key, value]) => {
      emailBody += `${key}: ${value}\n`;
      });

      const mailOptions = {
        from: 'ggorangmadaan@gmail.com',
        to: 'ggorangmadaan@gmail.com',
        subject: 'Order Completed',
        text: emailBody,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
    } catch (error) {
      console.log('Error fetching order details:', error);
    }
  }
});


  // Usage example
  eventEmitter.on('orderPlaced', (data) => {
    io.to('adminRoom').emit('orderPlaced', data)
    console.log('server.js')
})