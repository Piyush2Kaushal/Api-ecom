const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./Configure/database");
const Router = require("./Route/route");
dotenv.config();
connectDB();

const app = express();

app.use(express.json());
app.use("/api/auth", Router);

app.get("/", (req, res) => {
  res.send("API is Working.....................");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`server working on port ${PORT}`));
