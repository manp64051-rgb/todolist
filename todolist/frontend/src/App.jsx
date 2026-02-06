import React, { useEffect, useState } from "react";

const API = "http://localhost:4000/api/todos";

const STATUSES = [
  { key: "todo", label: "To Do" },
  { key: "in-progress", label: "In Progress" },
  { key: "done", label: "Done" }
];

export default function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [tags, setTags] = useState("");

  async function loadTodos() {
    const res = await fetch(API);
    const data = await res.json();
    setTodos(data);
  }

  async function addTodo(e) {
    e.preventDefault();
    if (!title) return;

    const body = {
      title,
      priority,
      tags: tags ? tags.split(",").map(t => t.trim()).filter(Boolean) : []
    };

    const res = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    const data = await res.json();
    setTodos([data, ...todos]);
    setTitle("");
    setTags("");
  }

  async function updateTodo(id, patch) {
    const res = await fetch(`${API}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch)
    });
    const updated = await res.json();
    setTodos(todos.map(t => (t.id === updated.id ? updated : t)));
  }

  async function removeTodo(id) {
    await fetch(`${API}/${id}`, { method: "DELETE" });
    setTodos(todos.filter(t => t.id !== id));
  }

  useEffect(() => {
    loadTodos();
  }, []);

  // Drag and drop handlers
  function onDragStart(e, todo) {
    e.dataTransfer.setData("text/plain", String(todo.id));
    e.dataTransfer.effectAllowed = "move";
  }

  function onDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }

  function asyncOnDrop(e, statusKey) {
    e.preventDefault();
    const id = Number(e.dataTransfer.getData("text/plain"));
    const columnTodos = todos.filter(t => t.status === statusKey);
    const maxPos = columnTodos.reduce((m, t) => Math.max(m, t.position || 0), 0);

    updateTodo(id, { status: statusKey, position: maxPos + 1 });
  }

  const grouped = STATUSES.reduce((acc, s) => {
    acc[s.key] = todos.filter(t => t.status === s.key).sort((a, b) => (a.position || 0) - (b.position || 0));
    return acc;
  }, {});

  return (
    <div style={{ padding: 24, display: "flex", gap: 24 }}>
      <div style={{ flex: 1 }}>
        <h1>Advanced Todo (no auth)</h1>

        <form onSubmit={addTodo} style={{ marginBottom: 16, display: "flex", gap: 8 }}>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder="New task..."
            style={{ flex: 1 }}
          />
          <select value={priority} onChange={e => setPriority(e.target.value)}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
          <input
            value={tags}
            onChange={e => setTags(e.target.value)}
            placeholder="tags (comma)"
            style={{ width: 150 }}
          />
          <button>Add</button>
        </form>

        <div style={{ display: "flex", gap: 16 }}>
          {STATUSES.map(status => (
            <div
              key={status.key}
              onDragOver={onDragOver}
              onDrop={e => asyncOnDrop(e, status.key)}
              style={{
                flex: 1,
                minHeight: 300,
                background: "#f5f5f5",
                padding: 8,
                borderRadius: 6
              }}
            >
              <h3 style={{ marginTop: 0 }}>{status.label}</h3>
              {grouped[status.key]?.map(todo => (
                <div
                  key={todo.id}
                  draggable
                  onDragStart={e => onDragStart(e, todo)}
                  style={{
                    background: "white",
                    padding: 8,
                    marginBottom: 8,
                    borderRadius: 4,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={() => updateTodo(todo.id, { completed: !todo.completed })}
                    />
                    <div>
                      <div style={{ fontWeight: 600 }}>{todo.title}</div>
                      <div style={{ fontSize: 12, color: "#666" }}>
                        {todo.priority} {todo.tags?.length ? `· ${todo.tags.join(",")}` : ""}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={() => removeTodo(todo.id)}>❌</button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
