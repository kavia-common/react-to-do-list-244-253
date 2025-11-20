import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Button from './components/Button';
import Sidebar from './components/Sidebar';

// PUBLIC_INTERFACE
function App() {
  // Fetch tasks from localStorage or initialize empty
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('tasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState('');
  const inputRef = useRef();

  // Filters state
  const FILTERS = [
    {
      key: "all",
      label: "All tasks",
      icon: (
        <svg width="20" height="20" fill="none" aria-hidden="true" viewBox="0 0 20 20">
          <rect x="3" y="8.5" width="14" height="3" rx="1.5" fill="#3b82f6" />
        </svg>
      ),
    },
    {
      key: "active",
      label: "Active",
      icon: (
        <svg width="20" height="20" fill="none" aria-hidden="true" viewBox="0 0 20 20">
          <circle cx="10" cy="10" r="7" stroke="#3b82f6" strokeWidth="2" fill="#fff"/>
          <circle cx="10" cy="10" r="3.5" fill="#3b82f6"/>
        </svg>
      ),
    },
    {
      key: "completed",
      label: "Completed",
      icon: (
        <svg width="20" height="20" fill="none" aria-hidden="true" viewBox="0 0 20 20">
          <rect width="16" height="16" rx="4" x="2" y="2" stroke="#06b6d4" strokeWidth="2" fill="#fff"/>
          <path d="M6.5 11.5L9 14l4.5-5" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
  ];
  const [selectedFilter, setSelectedFilter] = useState("all");
  const handleSelectFilter = (key) => setSelectedFilter(key);

  // Save to localStorage on tasks change
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  // Accessibility: focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // PUBLIC_INTERFACE
  function handleInputChange(e) {
    setInput(e.target.value);
  }

  // PUBLIC_INTERFACE
  function handleAddTask(e) {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;
    setTasks([
      ...tasks,
      {
        id: Date.now(),
        text: trimmed,
        completed: false,
      },
    ]);
    setInput('');
    inputRef.current?.focus();
  }

  // PUBLIC_INTERFACE
  function handleDeleteTask(id) {
    setTasks(tasks.filter(t => t.id !== id));
  }

  // PUBLIC_INTERFACE
  function handleToggleTask(id) {
    setTasks(tasks.map(t =>
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  }

  // Handle Enter key for input
  function handleInputKeyDown(e) {
    if (e.key === 'Enter' && input.trim()) {
      handleAddTask(e);
    }
  }

  // Filtering for main task list
  const filteredTasks =
    selectedFilter === "all"
      ? tasks
      : selectedFilter === "active"
      ? tasks.filter(t => !t.completed)
      : selectedFilter === "completed"
      ? tasks.filter(t => t.completed)
      : tasks;

  // Responsive: check for overlay or docked
  const [isSidebarOverlay, setIsSidebarOverlay] = useState(
    typeof window !== "undefined"
      ? window.innerWidth <= 768
      : false
  );
  useEffect(() => {
    const handleResize = () => {
      setIsSidebarOverlay(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // To keep main card centered, add sidebar + main layout
  return (
    <div style={{ minHeight: "100vh", background: "var(--background)" }}>
      {/* Navbar at top, sticky */}
      <Navbar title="Todo" />
      <div
        style={{
          display: "flex",
          flexDirection: "row",
          alignItems: "stretch",
          width: "100%",
        }}
      >
        {/* Sidebar: always mounted, overlays on mobile, docked on desktop */}
        <Sidebar
          title="Filters"
          items={FILTERS}
          selectedKey={selectedFilter}
          onSelect={handleSelectFilter}
          position="left"
          overlayBreakpoint={768}
          className="app-sidebar"
          footer={
            <span style={{fontSize: "0.95em", color:"var(--secondary)"}}>Sidebar demo &middot; React</span>
          }
        />
        {/* Main content card area: center within page, scrollable */}
        <div
          className="todo-bg"
          style={{
            flex: "1 1 0",
            minHeight: "100vh",
            marginLeft: isSidebarOverlay ? 0 : "0", // margin is handled by flex
            justifyContent: "center",
            alignItems: "center",
            display: "flex",
          }}
        >
          <main className="todo-main-card" role="main" aria-label="Todo application">
            <h1 className="todo-title">Todo List</h1>
            <form className="todo-addform" onSubmit={handleAddTask} autoComplete="off">
              <label htmlFor="task-input" className="visually-hidden">
                Add new todo
              </label>
              <input
                id="task-input"
                ref={inputRef}
                className="todo-input"
                type="text"
                value={input}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                placeholder="What needs to be done?"
                aria-label="Task to add"
                required
              />
              <Button
                type="submit"
                tone="primary"
                weight="solid"
                size="md"
                aria-label="Add todo"
                disabled={!input.trim()}
                className="todo-btn"
              >
                Add
              </Button>
            </form>
            <ul className="todo-list" aria-label="Todo list">
              {filteredTasks.length === 0 ? (
                <li className="todo-empty" tabIndex="0">
                  {selectedFilter === "completed"
                    ? "No completed tasks yet"
                    : selectedFilter === "active"
                    ? "All tasks are completed!"
                    : "No tasks yet"}
                </li>
              ) : (
                filteredTasks.map(task => (
                  <li key={task.id} className="todo-item">
                    <button
                      className={`todo-checkbox${task.completed ? ' checked' : ''}`}
                      aria-checked={task.completed}
                      aria-label={task.completed ? "Mark as incomplete" : "Mark as complete"}
                      role="checkbox"
                      tabIndex="0"
                      onClick={() => handleToggleTask(task.id)}
                      onKeyDown={(e) => {
                        if (e.key === ' ' || e.key === 'Enter') handleToggleTask(task.id);
                      }}
                    >
                      {task.completed && (
                        <span className="todo-checkbox-icon" aria-hidden="true">&#10003;</span>
                      )}
                    </button>
                    <span
                      className={`todo-text${task.completed ? ' completed' : ''}`}
                      tabIndex="0"
                      aria-label={task.text + (task.completed ? " (completed)" : "")}
                    >
                      {task.text}
                    </span>
                    <Button
                      tone="danger"
                      weight="solid"
                      size="sm"
                      aria-label="Delete todo"
                      onClick={() => handleDeleteTask(task.id)}
                      tabIndex="0"
                      className="todo-btn todo-btn-red"
                    >
                      Delete
                    </Button>
                  </li>
                ))
              )}
            </ul>
          </main>
          <footer className="todo-footer">
            <a
              href="https://reactjs.org"
              className="todo-footer-link"
              target="_blank"
              rel="noopener noreferrer"
            >
              Built with React
            </a>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default App;
