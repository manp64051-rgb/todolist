import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import todoRoutes from "./routes/todo.routes.js";
import { prisma } from "./prisma.js";
import { execSync } from "child_process";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/todos", todoRoutes);

app.get("/health", (_, res) => {
  res.json({ status: "ok" });
});

// Seed database with sample todos if empty
async function seedDatabase() {
  try {
    const count = await prisma.todo.count();
    if (count === 0) {
      console.log("Seeding database with sample todos...");
      await prisma.todo.createMany({
        data: [
          {
            title: "Design new landing page",
            status: "todo",
            priority: "high",
            tags: ["design", "frontend"],
            position: 1
          },
          {
            title: "Fix login bug",
            status: "in-progress",
            priority: "high",
            tags: ["bug", "backend"],
            position: 1
          },
          {
            title: "Write API documentation",
            status: "in-progress",
            priority: "medium",
            tags: ["docs"],
            position: 2
          },
          {
            title: "Deploy to production",
            status: "done",
            priority: "high",
            tags: ["deploy"],
            position: 1
          },
          {
            title: "Code review for PR #42",
            status: "done",
            priority: "medium",
            tags: ["review"],
            position: 2
          }
        ]
      });
      console.log("✓ Sample todos created");
    }
  } catch (err) {
    console.warn("Seeding: Table may not exist yet -", err.message);
  }
}

// Initialize database and start server
async function start() {
  try {
    // Run migrations
    console.log("Pushing database schema...");
    execSync("npx prisma db push --skip-generate --accept-data-loss", {
      stdio: "inherit",
      env: { ...process.env }
    });
    console.log("✓ Schema pushed successfully");

    // Seed if empty
    await seedDatabase();

    // Start server
    app.listen(process.env.PORT, () => {
      console.log("✓ Backend running on port", process.env.PORT);
    });
  } catch (err) {
    console.error("Startup error:", err.message);
    process.exit(1);
  }
}

start();
