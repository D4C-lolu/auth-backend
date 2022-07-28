import mongoose from "mongoose";
import config from "config";
import log from "./logger";

const connectToDB = async () => {
  const dbUri = config.get<string>("dbURI");
  try {
    await mongoose.connect(dbUri);
    log.info("Connected to DB");
  } catch (e) {
    process.exit(0);
  }
};

export default connectToDB;
