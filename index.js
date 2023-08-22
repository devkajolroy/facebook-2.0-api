const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");
const { readdirSync } = require("fs");
const { mongoConnect } = require("./Config/MongoDB");
const Cloudinary = require("cloudinary").v2;

//config
dotenv.config();
app.use(cors({
    allowedHeaders: ["authorization", "Content-Type"],
   origin: "https://facebook-2-0-frontend.vercel.app",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false  
}));
app.use(express.json({ limit: "50mb" }));
mongoConnect();
Cloudinary.config({
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SEC,
  cloud_name: process.env.CLOUD_NAME,
  secure: true,
});

// Routes
readdirSync("./Routes").map((x) => app.use("/", require("./Routes/" + x)));

// Listen
app.listen(process.env.PORT || 3000, () => {
  console.log("Server Running Port " + process.env.PORT);
});
