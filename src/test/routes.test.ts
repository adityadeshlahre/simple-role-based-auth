import request from "supertest";
import express from "express";
import router from "./../routes/Routes";
import mongoose from "mongoose";
import * as dotenv from "dotenv";
dotenv.config();

const app = express();
app.use(express.json());
app.use("/api", router);

describe("Test API Routes", () => {
  let id: string = "";
  let token: string = "";

  beforeAll(async () => {
    const client = await mongoose.connect(process.env.DATABASE_URL as string, {
      dbName: process.env.DATABASE_NAME,
    });
    const db = client.connection.useDb(process.env.DATABASE_NAME as string);
    if (!db) {
      throw new Error("Failed to connect to database");
    }
    console.log(
      `Successfully connected to database: ${client?.connection.host} and collection: ${db?.name}`
    );
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  it("should return 'Hello World!' for GET /api", async () => {
    const response = await request(app).get("/api");
    expect(response.status).toBe(200);
    expect(response.body.ok).toBe("Hello World!");
  });

  it("should get all users", async () => {
    const response = await request(app).get("/api/all");
    expect(response.status).toBe(404);
    expect(response.body).toStrictEqual({ message: "No users found" });
  });

  it("should create a new user", async () => {
    const newUser = {
      username: "testuser",
      password: "password123",
      role: "user",
    };
    const response = await request(app).post("/api/user").send(newUser);
    expect(response.status).toBe(201);
    expect(response.body.username).toBe(newUser.username);
  });

  it("should log in a user and return a token", async () => {
    const loginCredentials = {
      username: "testuser",
      password: "password123",
    };
    const response = await request(app)
      .post("/api/login")
      .send(loginCredentials);
    expect(response.status).toBe(200);
    token = response.body.token;
    id = response.body.user._id;
    expect(response.body.token).toBeDefined();
  });

  it("should update a user", async () => {
    const updateUser = {
      username: "updateduser",
      password: "newpassword123",
      role: "admin",
    };
    const response = await request(app).put(`/api/user/${id}`).send(updateUser);
    expect(response.status).toBe(201);
  });

  it("should get all users after adding user", async () => {
    const response = await request(app).get("/api/all");
    expect(response.status).toBe(200);
    expect(response.body).toBeDefined();
  });

  it("should delete a user", async () => {
    const response = await request(app).delete(`/api/user/${id}`);
    expect(response.status).toBe(200);
    expect(response.text).toBe("User deleted");
  });

  let adminToken = "";

  it("should create and log in an admin user", async () => {
    const adminUser = {
      username: "adminuser",
      password: "adminpass",
      role: "admin",
    };

    const createResponse = await request(app).post("/api/user").send(adminUser);

    expect(createResponse.status).toBe(201);

    const loginResponse = await request(app).post("/api/login").send({
      username: adminUser.username,
      password: adminUser.password,
    });

    expect(loginResponse.status).toBe(200);
    adminToken = loginResponse.body.token;
  });

  it("should allow only admins to access /api/admin", async () => {
    const response = await request(app)
      .get("/api/admin")
      .set("Authorization", `Bearer ${adminToken}`);
    expect(response.status).toBe(200);
    expect(response.body.ok).toBe("Hello Admin!");
  });
});
