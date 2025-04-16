import express from "express";
import cors from "cors";
import router from "./routes/Routes";
import dotenv from "dotenv";
import { database_connection } from "./config/db";

const app = express();
app.use(express.json());
app.use(cors());
dotenv.config({ path: __dirname + "/../.env" });

const PORT = process.env.PORT || 3000;

database_connection()
  .then(() => {
    app.use("/api", router);

    app.listen(PORT, () => {
      console.log("Server is running on http://localhost:" + PORT);
    });
  })
  .catch((error) => {
    console.error("Database connection failed:", error);
    process.exit();
  });
