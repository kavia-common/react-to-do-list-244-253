import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import Button from './components/Button';
// PUBLIC_INTERFACE
function App() {
  // Fetch tasks from localStorage or initialize empty
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem('tasks');
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState('');
  const inputRef = useRef();

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

  return (
    <div className="todo-bg">
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
            variant="primary"
            size="md"
            aria-label="Add todo"
            disabled={!input.trim()}
            className="todo-btn"
          >
            Add
          </Button>
        </form>
        <ul className="todo-list" aria-label="Todo list">
          {tasks.length === 0 ? (
            <li className="todo-empty" tabIndex="0">No tasks yet</li>
          ) : (
            tasks.map(task => (
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
                  variant="danger"
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
  );
}

export default App;
