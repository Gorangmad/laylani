require("dotenv").config();

const axios = require("axios");

const express = require("express");

const app = express();

const ejs = require("ejs");

const path = require("path");

const expressLayout = require("express-ejs-layouts");

const PORT = process.env.PORT || 3400;

const mongoose = require("mongoose");

const session = require("express-session");

const flash = require("express-flash");

const MongoDbStore = require("connect-mongo");

const nodemailer = require("nodemailer");

const passport = require("passport");

const Emitter = require("events");

const Order = require("./app/models/order");

const push = require("web-push");

const bodyParser = require("body-parser");

const { S3Client } = require("@aws-sdk/client-s3");

const { MongoDbMemoryServer } = require("mongodb-memory-server");

const { MongoClient } = require("mongodb");

// import function to register Swiper custom elements
// const { register } = require('swiper/element/bundle');
// // register Swiper custom elements
// register();

// Configure the S3 client for DigitalOcean Spaces
const s3Client = new S3Client({
  region: "fra1",
  credentials: {
    accessKeyId: process.env.DO_SPACES_ACCESS_KEY,
    secretAccessKey: process.env.DO_SPACES_SECRET_KEY,
  },
  endpoint: "https://fra1.digitaloceanspaces.com",
});

let userSubscription;

let vapidKeys = {
  publicKey:
    "BHEk6XF74Wog4WnakolRs798bo9Sw0y5gj-5v9fnbRtmyXxXXlFQPWxhObZTp8ppqmtrheM6NUSrHKyNv_fqyAw",
  privateKey: "7PllFpyRJ1SqXb04v22tEat0J0AzvKRp77SVdjvN11A",
};

push.setVapidDetails(
  "mailto:ggorangmadaan@gmail.com",
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

//Database connection

const url =
  "mongodb+srv://doadmin:2658kXKF7GtD309M@db-mongodb-fra1-68366-638f76d0.mongo.ondigitalocean.com/bahlCollection?tls=true&authSource=admin";
mongoose.connect(url, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  family: 4,
});
const connection = mongoose.connection;
connection.once("open", () => {
  console.log("Database connected....");
});

// Initialize Change Stream
const dbName = "bahlCollection"; // Update with your database name

async function initializeChangeStream(user) {
  try {
    const client = await MongoClient.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      family: 4,
    });
    const db = client.db(dbName);
    const collection = db.collection("menus"); // Update with your collection name

    const changeStream = collection.watch();

    changeStream.on("change", async (change) => {
      change.user = user;

      // Store the change event in a dedicated collection
      const changeLogCollection = db.collection("changelogs");
      await changeLogCollection.insertOne(change);
    });

    console.log("Change stream initialized...");
  } catch (error) {
    console.error("Error initializing change stream:", error);
  }
}

module.exports = initializeChangeStream;

//Session config

app.use(
  session({
    secret: process.env.COOKIE_SECRET,
    resave: false,
    store: MongoDbStore.create({
      mongoUrl:
        "mongodb+srv://doadmin:2658kXKF7GtD309M@db-mongodb-fra1-68366-638f76d0.mongo.ondigitalocean.com/bahlCollection?tls=true&authSource=admin",
    }),
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 30 }, // One month
  })
);

// // Event emitter
const eventEmitter = new Emitter();
app.set("eventEmitter", eventEmitter);

//Passport config

const passportInit = require("./app/config/passport");
const { Socket } = require("socket.io");
passportInit(passport);
app.use(passport.initialize());
app.use(passport.session());

//Assests
app.use(express.static("public"));

app.use(express.urlencoded({ extended: false }));

app.use(express.json());

app.use(bodyParser.json());

// Messaging

app.post("/subscribe", (req, res) => {
  const { endpoint, keys } = req.body;

  userSubscription = {
    endpoint,
    keys,
  };

  res.status(201).json({});
});

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "nichtantwortenbb@gmail.com",
    pass: "ahsyptlxsejgdyra",
  },
});

//Global middleware
app.use((req, res, next) => {
  res.locals.session = req.session;
  res.locals.user = req.user;
  next();
});

app.get("/user", (req, res) => {
  // Retrieve the user information from the session or database
  const user = req.user; // Return the user information as a response
  res.json(user);
});

app.use(flash());

//set template engine

app.use(expressLayout);

app.set("views", path.join(__dirname, "/resources/views"));

app.set("view engine", "ejs");

app.get("/service-worker.js", (req, res) => {
  res.sendFile(path.resolve(__dirname, "service-worker.js"));
});

//Routes
require("./routes/web")(app);

const server = app.listen(PORT, () => {
  console.log("listening on port 3400");
});

//Subcategories add

// const newCategory = new Category({
//   No: "27",
//   Parent_Category: "Collier(Necklaces)",
//   Global_Rank: "9",
//   Visibility: "2",
//   subcategories: [
//     { name: "Colliers mit Stein/Perle (Necklaces with Stones) NS-NBD", No: "29", Visibility: "1", Global_Rank: "9.1" },
//     { name: "Colliers ohne Stein (Necklaces without Stones) NP", No: "28", Visibility: "0", Global_Rank: "9.2" },
//   ]
// });

// newCategory.save()
//   .then(doc => console.log("New category added:", doc))
//   .catch(err => console.error("Error adding category:", err));

// Socket
const io = require("socket.io")(server);

io.on("connection", (socket) => {
  socket.on("join", (orderId) => {
    socket.join(orderId);
  });
});

eventEmitter.on("orderUpdated", async (data) => {
  io.to(`order_${data.id}`).emit("orderUpdated", data);

  if (data.status === "completed") {
    try {
      // Fetch the order details from the database based on the data.id
      const order = await Order.findById(data.id);

      // Check if the order exists
      if (!order) {
        console.log("Order not found");
        return;
      }

      const orderDetails = {
        orderId: order._id,
        Produkte: [],
        // Include other order details as needed
      };

      let emailBody = `Ihre Bestellung ${orderDetails.orderId} ist fertig und auf dem Weg zu Ihnen. `;
      emailBody += "Bestellte Produkte:\n";

      orderDetails.Produkte.forEach((product) => {
        emailBody += `${product.name}: ${product.quantity}\n`;
      });

      const mailOptions = {
        from: "nichtantwortenbb@gmail.com",
        to: order.name,
        subject: "Order Completed",
        text: emailBody,
      };

      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log("Error sending email:", error);
        } else {
          console.log("Email sent: " + info.response);
        }
      });
    } catch (error) {
      console.log("Error fetching order details:", error);
    }
  } else if (data.status === "delivered") {
    const order = await Order.findById(data.id);
    // If order status is 'delivered', send an email
    const deliveredEmailBody = `Ihre Bestellung ${data.id} ist jetzt auf dem Weg zu Ihnen.`;

    const deliveredMailOptions = {
      from: "nichtantwortenbb@gmail.com",
      to: order.name, // Assuming order.name is the customer's email
      subject: "Order Delivered",
      text: deliveredEmailBody,
    };

    transporter.sendMail(deliveredMailOptions, function (error, info) {
      if (error) {
        console.log("Error sending delivered email:", error);
      } else {
        console.log("Delivered email sent: " + info.response);
      }
    });
  }
});

// Usage example
eventEmitter.on("orderPlaced", async (data) => {
  io.to("adminRoom").emit("orderPlaced", data);

  const apiKey = process.env.NODE_API_KEY; // Replace with your actual API key

  const headers = {
    Authorization: `Basic ${Buffer.from(apiKey).toString("base64")}`,
  };

  try {
    // Fetch the order details from the database based on the data.id
    const order = await Order.findById(data.id);

    // Check if the order exists
    if (!order) {
      console.log("Order not found");
      return;
    }

    const orderDetails = {
      orderId: order._id,
      Produkte: [],
    };

    for (const itemId in order.items) {
      if (order.items.hasOwnProperty(itemId)) {
        const item = order.items[itemId];
        const itemName = item.name;
        const itemQty = item.qty;

        orderDetails.Produkte.push(itemName, itemQty);
      }
    }

    let emailBody = `Ihre Bestellung ${data.id} wurde empfangen.\n\nOrder Details:\n`;
    Object.entries(orderDetails).forEach(([key, value]) => {
      emailBody = `Wir haben Ihre Bestellung erhalten`;
    });

    const mailOptions = {
      from: "nichtantwortenbb@gmail.com",
      to: order.email,
      subject: "Order Placed",
      text: emailBody,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
      }
    });

    // Send an email to the admin
    const adminEmailBody = `
  A new order has been placed.
  
  Customer Details:
  Name: ${data.customerId.name}
  Email: ${data.customerId.email}
  Phone: ${data.customerId.phone}
  
  Total Price: ${data.totalPrice}
  Order Date: ${new Date(data.createdAt).toLocaleString()}
`;

    const mailOptions2 = {
      from: "nichtantwortenbb@gmail.com",
      to: "jimikaram@yahoo.de", // Replace with the admin's email address
      subject: "New Order Placed",
      text: adminEmailBody,
    };

    transporter.sendMail(mailOptions2, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email sent to admin: " + info.response);
      }
    });
  } catch (error) {
    console.log("Error fetching order details:", error);
  }
});
