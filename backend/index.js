const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");

// Load environment variables first
require("dotenv").config();

// Then load routers and database connection
const AutherRouter = require("./Routes/AuthRouter");
const PosterRouter = require("./Routes/DataRoute");
const DataRouter = require("./Routes/SemesterRoute");
const allowedOrigins = [
  "http://localhost:5173",
  "https://marksheet-validation.pages.dev",
];

// Now load the database connection after dotenv has been initialized
require("./Models/db");

const PORT = process.env.PORT || 8080;

app.use(bodyParser.json());
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use("/auth", AutherRouter);
app.use("/semester", PosterRouter);
app.use("/verify", DataRouter);
app.listen(PORT, () => {
  console.log(`Server is listening on ${PORT}`);
});
