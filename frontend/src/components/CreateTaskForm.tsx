import React, { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import "./CreateTaskForm.css";

interface Props {
  onSuccess: () => void;
}

export default function CreateTaskForm({ onSuccess }: Props) {
  const { publicKey } = useWallet();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [bounty, setBounty] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!publicKey) {
      setError("Please connect your wallet");
      return;
    }

    if (!title || !description || !bounty) {
      setError("All fields are required");
      return;
    }

    if (parseFloat(bounty) < 0.1) {
      setError("Minimum bounty is 0.1 SOL");
      return;
    }

    setLoading(true);
    setError("");
    try {
      // TODO: Implement actual program call
      console.log("Creating task:", { title, description, bounty });
      await new Promise((resolve) => setTimeout(resolve, 2000));
      setSuccess(true);
      setTitle("");
      setDescription("");
      setBounty("");
      setTimeout(() => {
        setSuccess(false);
        onSuccess();
      }, 2000);
    } catch (err) {
      setError("Failed to create task. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="form-container">
      <h2 className="form-title">➕ Post a New Task</h2>

      {error && <div className="alert alert-error">{error}</div>}
      {success && (
        <div className="alert alert-success">✅ Task created successfully!</div>
      )}

      <form onSubmit={handleSubmit} className="task-form">
        <div className="form-group">
          <label className="form-label">Task Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            maxLength={100}
            placeholder="e.g., Build a responsive website"
            className="form-input"
            disabled={loading}
          />
          <p className="form-hint">{title.length}/100 characters</p>
        </div>

        <div className="form-group">
          <label className="form-label">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={500}
            placeholder="Describe the task in detail. Be specific about requirements."
            rows={5}
            className="form-textarea"
            disabled={loading}
          />
          <p className="form-hint">{description.length}/500 characters</p>
        </div>

        <div className="form-group">
          <label className="form-label">Bounty Amount (SOL)</label>
          <input
            type="number"
            value={bounty}
            onChange={(e) => setBounty(e.target.value)}
            step="0.1"
            min="0.1"
            placeholder="0.5"
            className="form-input"
            disabled={loading}
          />
          <p className="form-hint">
            Minimum: 0.1 SOL | This will be locked until task completion
          </p>
        </div>

        <button
          type="submit"
          disabled={loading || !publicKey}
          className={`submit-btn ${loading || !publicKey ? "disabled" : ""}`}
        >
          {loading ? "Creating Task..." : "🚀 Post Task"}
        </button>
      </form>

      <div className="form-info">
        <h3>💡 Tips for posting great tasks:</h3>
        <ul>
          <li>Be clear and specific about what you need</li>
          <li>Include links to relevant resources or examples</li>
          <li>Set a fair bounty amount for the complexity</li>
          <li>Specify your timeline and acceptance criteria</li>
        </ul>
      </div>
    </div>
  );
}