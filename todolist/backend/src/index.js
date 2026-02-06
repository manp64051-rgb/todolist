import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import todoRoutes from "./routes/todo.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/todos", todoRoutes);

app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});

app.listen(process.env.PORT, () =>
  console.log("Backend running on", process.env.PORT)
);
