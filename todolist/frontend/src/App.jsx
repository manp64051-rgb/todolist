import React, { useEffect, useState } from "react";

const API = "http://localhost:4000/api/todos";

const STATUSES = [
  { key: "todo", label: "To Do", color: "#3b82f6" },
  { key: "in-progress", label: "In Progress", color: "#f59e0b" },
  { key: "done", label: "Done", color: "#10b981" }
];

const PRIORITY_COLORS = {
  low: "#6b7280",
  medium: "#f59e0b",
  high: "#ef4444"
};

export default function App() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState("medium");
  const [tags, setTags] = useState("");
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

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

  useEffect(() => {
    localStorage.setItem("darkMode", darkMode);
  }, [darkMode]);

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

  const bgColor = darkMode ? "#0f172a" : "#ffffff";
  const textColor = darkMode ? "#f1f5f9" : "#1e293b";
  const borderColor = darkMode ? "#334155" : "#e2e8f0";
  const cardBg = darkMode ? "#1e293b" : "#ffffff";

  return (
    <div
      style={{
        backgroundColor: bgColor,
        color: textColor,
        minHeight: "100vh",
        transition: "background-color 0.3s ease, color 0.3s ease",
        padding: "0"
      }}
    >
      {/* Header */}
      <div
        style={{
          background: darkMode ? "linear-gradient(135deg, #1e3a8a 0%, #0f172a 100%)" : "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
          padding: "24px",
          borderBottom: `2px solid ${borderColor}`,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
        }}
      >
        <div>
          <h1 style={{ margin: "0 0 4px 0", fontSize: "28px", fontWeight: "700", color: "#fff" }}>
            ✓ Advanced Todo
          </h1>
          <p style={{ margin: "0", fontSize: "13px", color: "rgba(255,255,255,0.8)" }}>
            Drag & drop tasks across columns
          </p>
        </div>
        <button
          onClick={() => setDarkMode(!darkMode)}
          style={{
            background: "rgba(255,255,255,0.2)",
            border: "2px solid rgba(255,255,255,0.3)",
            color: "#fff",
            padding: "10px 16px",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "600",
            transition: "all 0.3s ease",
            hover: "transform scale(1.05)"
          }}
          onMouseEnter={e => e.target.style.background = "rgba(255,255,255,0.3)"}
          onMouseLeave={e => e.target.style.background = "rgba(255,255,255,0.2)"}
        >
          {darkMode ? "☀️ Light" : "🌙 Dark"}
        </button>
      </div>

      {/* Main Content */}
      <div style={{ padding: "32px 24px" }}>
        {/* Add Todo Form */}
        <div
          style={{
            background: cardBg,
            border: `2px solid ${borderColor}`,
            borderRadius: "12px",
            padding: "24px",
            marginBottom: "32px",
            boxShadow: darkMode ? "0 4px 8px rgba(0, 0, 0, 0.3)" : "0 2px 8px rgba(0, 0, 0, 0.05)"
          }}
        >
          <h2 style={{ margin: "0 0 16px 0", fontSize: "16px", fontWeight: "600" }}>Add New Task</h2>
          <form onSubmit={addTodo} style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            <input
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="Enter task title..."
              style={{
                flex: "1",
                minWidth: "200px",
                padding: "12px 16px",
                border: `2px solid ${borderColor}`,
                borderRadius: "8px",
                fontSize: "14px",
                background: darkMode ? "#0f172a" : "#f8fafc",
                color: textColor,
                transition: "all 0.3s ease",
                outline: "none"
              }}
              onFocus={e => e.target.style.borderColor = PRIORITY_COLORS.high}
              onBlur={e => e.target.style.borderColor = borderColor}
            />
            <select
              value={priority}
              onChange={e => setPriority(e.target.value)}
              style={{
                padding: "12px 16px",
                border: `2px solid ${borderColor}`,
                borderRadius: "8px",
                fontSize: "14px",
                background: darkMode ? "#0f172a" : "#f8fafc",
                color: textColor,
                cursor: "pointer",
                transition: "all 0.3s ease",
                outline: "none"
              }}
            >
              <option value="low">🔵 Low</option>
              <option value="medium">🟡 Medium</option>
              <option value="high">🔴 High</option>
            </select>
            <input
              value={tags}
              onChange={e => setTags(e.target.value)}
              placeholder="tags (comma-separated)"
              style={{
                minWidth: "180px",
                padding: "12px 16px",
                border: `2px solid ${borderColor}`,
                borderRadius: "8px",
                fontSize: "14px",
                background: darkMode ? "#0f172a" : "#f8fafc",
                color: textColor,
                transition: "all 0.3s ease",
                outline: "none"
              }}
            />
            <button
              style={{
                padding: "12px 24px",
                background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                color: "#fff",
                border: "none",
                borderRadius: "8px",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.3s ease",
                boxShadow: "0 4px 12px rgba(59, 130, 246, 0.4)"
              }}
              onMouseEnter={e => {
                e.target.style.transform = "translateY(-2px)";
                e.target.style.boxShadow = "0 6px 16px rgba(59, 130, 246, 0.6)";
              }}
              onMouseLeave={e => {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "0 4px 12px rgba(59, 130, 246, 0.4)";
              }}
            >
              + Add Task
            </button>
          </form>
        </div>

        {/* Kanban Board */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
          {STATUSES.map(status => (
            <div
              key={status.key}
              onDrop={e => asyncOnDrop(e, status.key)}
              style={{
                background: cardBg,
                border: `2px solid ${borderColor}`,
                borderRadius: "12px",
                padding: "20px",
                minHeight: "500px",
                boxShadow: darkMode ? "0 4px 8px rgba(0, 0, 0, 0.3)" : "0 2px 8px rgba(0, 0, 0, 0.05)",
                transition: "all 0.3s ease"
              }}
              onDragOver={e => {
                e.preventDefault();
                e.dataTransfer.dropEffect = "move";
                e.currentTarget.style.boxShadow = "0 0 0 3px " + status.color;
                e.currentTarget.style.transform = "scale(1.01)";
              }}
              onDragLeave={e => {
                e.currentTarget.style.boxShadow = darkMode ? "0 4px 8px rgba(0, 0, 0, 0.3)" : "0 2px 8px rgba(0, 0, 0, 0.05)";
                e.currentTarget.style.transform = "scale(1)";
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
                <div
                  style={{
                    width: "12px",
                    height: "12px",
                    borderRadius: "50%",
                    background: status.color
                  }}
                />
                <h3 style={{ margin: "0", fontSize: "16px", fontWeight: "700", color: textColor }}>
                  {status.label}
                </h3>
                <span
                  style={{
                    marginLeft: "auto",
                    fontSize: "12px",
                    background: status.color + "20",
                    color: status.color,
                    padding: "4px 8px",
                    borderRadius: "6px",
                    fontWeight: "600"
                  }}
                >
                  {grouped[status.key]?.length || 0}
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px", height: "calc(100% - 50px)", overflowY: "auto" }}>
                {(grouped[status.key] && grouped[status.key].length) ? (
                  grouped[status.key].map(todo => (
                    <div
                      key={todo.id}
                      draggable
                      style={{
                        background: darkMode ? "#0f172a" : "#f8fafc",
                        border: `2px solid ${borderColor}`,
                        padding: "12px",
                        borderRadius: "8px",
                        cursor: "grab",
                        transition: "all 0.3s ease",
                        borderLeft: `4px solid ${PRIORITY_COLORS[todo.priority] || PRIORITY_COLORS.medium}`,
                        opacity: todo.completed ? 0.6 : 1
                      }}
                      onDragStart={e => {
                        onDragStart(e, todo);
                        e.currentTarget.style.opacity = "0.5";
                      }}
                      onDragEnd={e => {
                        e.currentTarget.style.opacity = todo.completed ? 0.6 : 1;
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.transform = "translateY(-2px)";
                        e.currentTarget.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.15)";
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.transform = "translateY(0)";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    >
                      <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                        <input
                          type="checkbox"
                          checked={todo.completed}
                          onChange={() => updateTodo(todo.id, { completed: !todo.completed })}
                          style={{
                            marginTop: "3px",
                            cursor: "pointer",
                            width: "18px",
                            height: "18px",
                            accentColor: status.color
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <div
                            style={{
                              fontWeight: "600",
                              fontSize: "14px",
                              textDecoration: todo.completed ? "line-through" : "none",
                              color: todo.completed ? "#888" : textColor,
                              marginBottom: "4px"
                            }}
                          >
                            {todo.title}
                          </div>
                          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "8px" }}>
                            <span
                              style={{
                                fontSize: "11px",
                                padding: "3px 8px",
                                background: PRIORITY_COLORS[todo.priority] + "25",
                                color: PRIORITY_COLORS[todo.priority],
                                borderRadius: "4px",
                                fontWeight: "600"
                              }}
                            >
                              {todo.priority.toUpperCase()}
                            </span>
                            {todo.tags?.map(tag => (
                              <span
                                key={tag}
                                style={{
                                  fontSize: "11px",
                                  padding: "3px 8px",
                                  background: "#6366f140",
                                  color: "#6366f1",
                                  borderRadius: "4px",
                                  fontWeight: "500"
                                }}
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>
                          <div style={{ fontSize: "11px", color: "#888", marginTop: "6px" }}>
                            {new Date(todo.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => removeTodo(todo.id)}
                        style={{
                          background: "none",
                          border: "none",
                          fontSize: "16px",
                          cursor: "pointer",
                          padding: "4px",
                          marginLeft: "8px",
                          transition: "transform 0.2s ease"
                        }}
                        onMouseEnter={e => e.target.style.transform = "scale(1.2)"}
                        onMouseLeave={e => e.target.style.transform = "scale(1)"}
                      >
                        🗑️
                      </button>
                    </div>
                  ))
                ) : (
                  <div
                    style={{
                      color: "#888",
                      fontSize: "13px",
                      padding: "24px 8px",
                      textAlign: "center",
                      fontStyle: "italic",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: "200px"
                    }}
                  >
                    Drop tasks here ✨
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
