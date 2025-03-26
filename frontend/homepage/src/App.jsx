import React from "react";

function App() {
  const buttonStyle = {
    padding: "1rem 2rem",
    margin: "1rem",
    fontSize: "1.2rem",
    cursor: "pointer",
    borderRadius: "10px",
    border: "none",
    backgroundColor: "#4f46e5",
    color: "white",
  };

  return (
    <div style={{ textAlign: "center", marginTop: "10rem" }}>
      <h1 style={{ fontSize: "2.5rem", marginBottom: "2rem" }}>Welcome to RideShare</h1>
      <div>
        <button
          style={buttonStyle}
          onClick={() => window.location.href = "http://localhost:5175"}
        >
          Passenger Portal
        </button>
        <button
          style={buttonStyle}
          onClick={() => window.location.href = "http://localhost:5174"}
        >
          Driver Portal
        </button>
      </div>
    </div>
  );
}

export default App;
