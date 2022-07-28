require("dotenv").config();
import express from "express";
import config from "config";
import connectToDB from "./utils/connectToDB";
import log from "./utils/logger";
import router from "./routes";
import deserializeUser from "./middleware/deserializeUser";

const app = express();

app.use(express.json());

app.use(deserializeUser);

app.use(router);

const PORT = config.get("port");

app.listen(PORT, () => {
  log.info(`App started at port ${PORT}`);

  connectToDB();
});
