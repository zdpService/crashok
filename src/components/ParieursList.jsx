import React, { useMemo } from "react";
import { FaRegUser } from "react-icons/fa";

const ParieursList = ({ parieurs, multiplier, hasExploded }) => {
  const colorsArr = useMemo(() => {
    if (!hasExploded) return [];

    const total = parieurs.length;
    const greenCount = Math.floor(total * 0.7);
    const redCount = total - greenCount;

    const arr = Array(greenCount)
      .fill(true)
      .concat(Array(redCount).fill(false));

    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }

    console.log("colorsArr sample:", arr.slice(0, 10)); // debug colors
    return arr;
  }, [parieurs.length, hasExploded]);

  return (
    <div className="parieurs-container">
      <h2
        style={{
          display: "flex",
          padding: "0.7rem 0",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <FaRegUser />
        {parieurs.length}
      </h2>
      <ul
        className="parieurs-list"
        style={{ maxHeight: "300px", overflowY: "auto", padding: 0, margin: 0 }}
      >
        {parieurs.map(({ id, montant }, index) => {
          let color = "#ccc";

          if (hasExploded) {
            color = colorsArr[index] ? "limegreen" : "red"; // couleurs très visibles
          }

          return (
            <li
              key={id + index}
              style={{
                color,
                padding: "6px 10px",
                display: "flex",
                justifyContent: "space-between",
                fontFamily: "monospace",
                transition: "color 0.5s ease",
                userSelect: "none",
                listStyle: "none",
              }}
            >
              <span>{id}</span>
              <span>{(montant * multiplier).toFixed(2)} ₣</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default ParieursList;
