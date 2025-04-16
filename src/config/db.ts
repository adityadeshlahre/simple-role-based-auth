import * as dotenv from "dotenv";
import { connect } from "mongoose";

export async function database_connection() {
  dotenv.config();
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
  }

  if (!process.env.DATABASE_NAME) {
    throw new Error("DATABASE_NAME is not defined");
  }
  try {
    const client = await connect(process.env.DATABASE_URL as string, {
      dbName: process.env.DATABASE_NAME,
    });

    if (!client) {
      throw new Error("Failed to connect to database");
    }
    const db = client.connection.useDb(process.env.DATABASE_NAME as string);
    if (!db) {
      throw new Error("Failed to connect to database");
    }

    console.log(
      `Successfully connected to database: ${client?.connection.host} and collection: ${db?.name}`
    );
  } catch (error) {
    console.log("Error connecting to database", error);
    process.exit(1);
  }
}
