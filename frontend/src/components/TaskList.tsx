import React, { useState, useEffect } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import TaskCard from "./TaskCard";
import "./TaskList.css";

interface Task {
  id: string;
  title: string;
  description: string;
  bounty: number;
  status: string;
  creator: string;
  creatorFull: string;
}

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<"all" | "created" | "claimed" | "completed">("all");
  const [loading, setLoading] = useState(true);
  const { connection } = useConnection();
  const { publicKey } = useWallet();

  useEffect(() => {
    // Mock data - replace with actual program calls
    const mockTasks: Task[] = [
      {
        id: "1",
        title: "Build a responsive website",
        description: "Create a mobile-friendly website for my e-commerce business using React and TypeScript",
        bounty: 1.5,
        status: "created",
        creator: "BobXXX...YYY",
        creatorFull: "BobXXX...YYY",
      },
      {
        id: "2",
        title: "Write API documentation",
        description: "Complete comprehensive API documentation for REST endpoints with examples",
        bounty: 0.5,
        status: "claimed",
        creator: "AliceXXX...YYY",
        creatorFull: "AliceXXX...YYY",
      },
      {
        id: "3",
        title: "Design UI mockups",
        description: "Create Figma mockups for mobile app with 5 main screens",
        bounty: 0.75,
        status: "created",
        creator: "CharlesXXX...YYY",
        creatorFull: "CharlesXXX...YYY",
      },
    ];
    setTasks(mockTasks);
    setLoading(false);
  }, [connection]);

  const filteredTasks = tasks.filter((task) => {
    if (filter === "all") return true;
    return task.status === filter;
  });

  return (
    <div className="task-list-container">
      <h2 className="section-title">📋 Available Tasks</h2>

      <div className="filter-buttons">
        <button
          onClick={() => setFilter("all")}
          className={`filter-btn ${filter === "all" ? "active" : ""}`}
        >
          All Tasks
        </button>
        <button
          onClick={() => setFilter("created")}
          className={`filter-btn ${filter === "created" ? "active" : ""}`}
        >
          Open
        </button>
        <button
          onClick={() => setFilter("claimed")}
          className={`filter-btn ${filter === "claimed" ? "active" : ""}`}
        >
          In Progress
        </button>
        <button
          onClick={() => setFilter("completed")}
          className={`filter-btn ${filter === "completed" ? "active" : ""}`}
        >
          Completed
        </button>
      </div>

      {loading ? (
        <div className="loading">
          <p>Loading tasks...</p>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="empty-state">
          <p>No tasks found</p>
        </div>
      ) : (
        <div className="tasks-grid">
          {filteredTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}