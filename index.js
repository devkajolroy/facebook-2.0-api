const express = require("express");
const app = express();
const dotenv = require("dotenv");
const cors = require("cors");
// const { readdirSync } = require("fs");
const { mongoConnect } = require("./Config/MongoDB");
const Cloudinary = require("cloudinary").v2;

//config
dotenv.config();
app.use(cors());
app.use(express.json({ limit: "50mb" }));
mongoConnect();
Cloudinary.config({
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SEC,
  cloud_name: process.env.CLOUD_NAME,
  secure: true,
});
app.use("/", (req, res) => {
  res.status(200).send({ message: "Server Running" });
});

// Routes
// readdirSync("./Routes").map((x) => app.use("/", require("./Routes/" + x)));

// configuration routes
const Auth = require("./Routes/AuthRoutes");
const PostRoutes = require("./Routes/PostRoutes");
const ReactRoutes = require("./Routes/ReactRoutes");
const StoryRoutes = require("./Routes/StoryRoutes");
const UserRoute = require("./Routes/UserRoute");
app.use("/", Auth);
app.use("/", PostRoutes);
app.use("/", ReactRoutes);
app.use("/", StoryRoutes);
app.use("/", UserRoute);

// Listen
app.listen(process.env.PORT || 3000, () => {
  console.log("Server Running Port " + process.env.PORT);
});
