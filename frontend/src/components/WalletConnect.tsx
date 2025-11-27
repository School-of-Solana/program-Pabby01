import React from "react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import "./WalletConnect.css";

export default function WalletConnect() {
  return (
    <div className="wallet-connect">
      <WalletMultiButton />
    </div>
  );
}