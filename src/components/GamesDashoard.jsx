import React from "react";
import "./GamesDashboard.css"; // Le fichier CSS est en bas

const games = [
  { name: "Crash or Cash", icon: "🚀", color: "#0033ff" },
  { name: "Lucky Mines", icon: "💣", color: "#00cc66" },
  { name: "Double Diamond Slot", icon: "💎", color: "#cc0000" },
  { name: "Ten Times Wins Slot", icon: "🔟", color: "#ff9900" },
  { name: "Dice", icon: "🎲", color: "#9900cc" },
  { name: "Xmas Slots", icon: "🎅", color: "#33cc33" },
  { name: "Keno", icon: "🔢", color: "#0033cc" },
  { name: "More Games", icon: "🎮", color: "#cccccc", textColor: "#000" },
];

const GamesDashboard = () => {
  return (
    <div className="games-dashboard">
      <div className="games-header">
        <div className="wallet">💳 6,311</div>
        <div className="actions">
          <span>▶️</span>
          <span>🛒</span>
          <span>☰</span>
        </div>
      </div>

      <div className="games-grid">
        {games.map((game, index) => (
          <div
            key={index}
            className="game-card"
            style={{
              backgroundColor: game.color,
              color: game.textColor || "#fff",
            }}
          >
            <div className="game-icon">{game.icon}</div>
            <div className="game-name">{game.name}</div>
          </div>
        ))}
      </div>

      <footer className="footer">© 2024–2025 Yoda Game Studio</footer>
    </div>
  );
};

export default GamesDashboard;
