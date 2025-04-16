import { Router, Request, Response } from "express";
import { User } from "../models/User";
import { ObjectId } from "mongodb";
import { comparePassword, hashedPassword, issueToken } from "../lib/utils";
import { UserType } from "../types/User";
import { console } from "inspector";
import middleware from "../middilware/auth";
import authorizRole from "../middilware/role";
const router = Router();

router.get("/", (req: Request, res: Response) => {
  res.status(200).json({ ok: "Hello World!" });
});

router.get("/all", async (req: Request, res: Response): Promise<any> => {
  try {
    const users = await User.find();
    if (!User || users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.get("/user/:id", async (req: Request, res: Response): Promise<any> => {
  const id = req.params.id;

  try {
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.post("/user", async (req: Request, res: Response): Promise<any> => {
  try {
    const newUser = req.body as UserType;

    const { username, password, role } = newUser;

    const result = await User.create({
      username,
      password: await hashedPassword(password),
      role,
    });

    if (!result) {
      return res.status(400).json({ message: "User not created" });
    }
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error Register" });
  }
});

router.post("/login", async (req: Request, res: Response): Promise<any> => {
  try {
    const { username, password } = req.body as {
      username: string;
      password: string;
    };

    if (!username || !password) {
      console.log(username);
      return res
        .status(400)
        .json({ message: "Username and password required" });
    }

    const user = await User.findOne({ username: username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = issueToken(user.username, user.role);

    res.status(200).json({ token, user });
  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ message: "Internal Server Error Login" });
  }
});

router.put("/user/:id", async (req: Request, res: Response): Promise<any> => {
  const id = req.params.id;

  try {
    const updatedUser = req.body as UserType;
    const query = { _id: new ObjectId(id) };

    const result = await User.updateOne(query, {
      $set: updatedUser,
    });

    result
      ? res.status(201).send("User updated")
      : res.status(304).send("User not updated");
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

router.delete(
  "/user/:id",
  async (req: Request, res: Response): Promise<any> => {
    const id = req.params.id;
    try {
      const query = { _id: new ObjectId(id) };
      const result = await User.deleteOne(query);
      if (result && result.deletedCount) {
        res.status(200).send("User deleted");
      } else {
        res.status(404).send("User not found");
      }
    } catch (error) {
      res.status(500).json({ message: "Internal Server Error" });
    }
  }
);

router.get(
  "/admin",
  middleware,
  authorizRole("admin"),
  (req: Request, res: Response) => {
    res.status(200).json({ ok: "Hello Admin!" });
  }
);

export default router;
