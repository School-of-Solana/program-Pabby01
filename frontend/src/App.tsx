import React, { useState } from "react";
import { WalletContextProvider } from "./contexts/WalletContext";
import TaskList from "./components/TaskList";
import CreateTaskForm from "./components/CreateTaskForm";
import MyTasks from "./components/MyTasks";
import WalletConnect from "./components/WalletConnect";
import "./App.css";

function App() {
  const [currentPage, setCurrentPage] = useState<"home" | "create" | "my-tasks">("home");

  return (
    <WalletContextProvider>
      <div className="app-container">
        <header className="header">
          <div className="header-content">
            <h1 className="logo">💼 Bounty Board</h1>
            <WalletConnect />
          </div>
        </header>

        <nav className="navbar">
          <div className="nav-content">
            <button
              onClick={() => setCurrentPage("home")}
              className={`nav-button ${currentPage === "home" ? "active" : ""}`}
            >
              📋 Browse Tasks
            </button>
            <button
              onClick={() => setCurrentPage("create")}
              className={`nav-button ${currentPage === "create" ? "active" : ""}`}
            >
              ➕ Post Task
            </button>
            <button
              onClick={() => setCurrentPage("my-tasks")}
              className={`nav-button ${currentPage === "my-tasks" ? "active" : ""}`}
            >
              📌 My Tasks
            </button>
          </div>
        </nav>

        <main className="main-content">
          {currentPage === "home" && <TaskList />}
          {currentPage === "create" && <CreateTaskForm onSuccess={() => setCurrentPage("home")} />}
          {currentPage === "my-tasks" && <MyTasks />}
        </main>

        <footer className="footer">
          <p>© 2025 Bounty Board | Built on Solana with ❤️</p>
        </footer>
      </div>
    </WalletContextProvider>
  );
}

export default App;