import mongoose from "mongoose";
import config from "../config.js";

export default async () => {
  mongoose.connect(config.DatabaseUri);

  mongoose.connection.on("connected", () => {
    console.log("Mongoose connected to the database");
  });

  mongoose.connection.on("error", (err) => {
    console.error("Mongoose connection error:", err);
  });

  mongoose.connection.on("disconnected", () => {
    console.log("Mongoose disconnected from the database");
  });

  mongoose.connection.on("reconnected", () => {
    console.log("Mongoose reconnected to the database");
  });

  mongoose.connection.on("reconnected", () => {
    console.log("Mongoose reconnected to the database");
  });
};
