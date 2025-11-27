import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import "./MyTasks.css";

export default function MyTasks() {
  const { publicKey } = useWallet();
  const [activeTab, setActiveTab] = useState<"created" | "claimed">("created");

  if (!publicKey) {
    return (
      <div className="empty-state">
        <p>🔐 Please connect your wallet to view your tasks</p>
      </div>
    );
  }

  return (
    <div className="my-tasks-container">
      <h2 className="section-title">📌 My Tasks</h2>

      <div className="tab-buttons">
        <button
          onClick={() => setActiveTab("created")}
          className={`tab-btn ${activeTab === "created" ? "active" : ""}`}
        >
          Posted by Me
        </button>
        <button
          onClick={() => setActiveTab("claimed")}
          className={`tab-btn ${activeTab === "claimed" ? "active" : ""}`}
        >
          Claimed by Me
        </button>
      </div>

      <div className="tab-content">
        <p className="empty-message">
          {activeTab === "created"
            ? "You haven't posted any tasks yet. Go to 'Post Task' to get started!"
            : "You haven't claimed any tasks yet. Browse available tasks to start earning!"}
        </p>
      </div>
    </div>
  );
}