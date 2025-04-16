import { verify } from "jsonwebtoken";
import * as dotenv from "dotenv";
dotenv.config();

const secret = (process.env.JWT_SECRET as string) || "secret";

const middleware = (req: any, res: any, next: any) => {
  const authHeader = req.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(403)
      .json({ message: "No token provided or format incorrect" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = verify(token, secret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export default middleware;
