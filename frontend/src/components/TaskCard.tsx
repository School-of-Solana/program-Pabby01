import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import "./TaskCard.css";

interface Task {
  id: string;
  title: string;
  description: string;
  bounty: number;
  status: string;
  creator: string;
  creatorFull: string;
}

interface Props {
  task: Task;
}

export default function TaskCard({ task }: Props) {
  const { publicKey } = useWallet();
  const [showDetails, setShowDetails] = useState(false);

  const statusColors: Record<string, string> = {
    created: "status-open",
    claimed: "status-claimed",
    completed: "status-completed",
    approved: "status-approved",
    rejected: "status-rejected",
  };

  const statusLabels: Record<string, string> = {
    created: "🟢 Open",
    claimed: "🟡 In Progress",
    completed: "🔵 Review",
    approved: "✅ Approved",
    rejected: "❌ Rejected",
  };

  return (
    <div className="task-card">
      <div className="card-header">
        <h3 className="card-title">{task.title}</h3>
        <span className={`status-badge ${statusColors[task.status]}`}>
          {statusLabels[task.status]}
        </span>
      </div>

      <p className="card-description">{task.description}</p>

      <div className="card-footer">
        <div className="bounty-info">
          <p className="bounty-amount">◎ {task.bounty}</p>
          <p className="bounty-label">SOL Bounty</p>
        </div>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="details-btn"
        >
          {showDetails ? "Hide" : "Details"} &rarr;
        </button>
      </div>

      {showDetails && (
        <div className="card-details">
          <p className="creator-info">
            <strong>Created by:</strong> {task.creatorFull}
          </p>
          <button
            disabled={!publicKey}
            className={`action-btn ${!publicKey ? "disabled" : ""}`}
          >
            {task.status === "created" ? "🎯 Claim Task" : "View Details"}
          </button>
        </div>
      )}
    </div>
  );
}