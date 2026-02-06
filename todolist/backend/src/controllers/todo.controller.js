import { prisma } from "../prisma.js";

export async function getTodos(req, res) {
  const todos = await prisma.todo.findMany({
    orderBy: [{ position: "asc" }, { createdAt: "desc" }]
  });

  res.json(todos);
}

export async function createTodo(req, res) {
  const { title, priority, dueDate, description, status, tags } = req.body;

  if (!title) {
    return res.status(400).json({ error: "Title required" });
  }

  const todo = await prisma.todo.create({
    data: {
      title,
      description: description || null,
      priority: priority || "medium",
      status: status || "todo",
      tags: Array.isArray(tags) ? tags : [],
      dueDate: dueDate ? new Date(dueDate) : null
    }
  });

  res.status(201).json(todo);
}

export async function updateTodo(req, res) {
  const id = Number(req.params.id);

  const todo = await prisma.todo.update({
    where: { id },
    data: req.body
  });

  res.json(todo);
}

export async function deleteTodo(req, res) {
  const id = Number(req.params.id);

  await prisma.todo.delete({
    where: { id }
  });

  res.json({ success: true });
}
