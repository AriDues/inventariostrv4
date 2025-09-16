import React, { useState, useEffect } from "react";
import BeatLoader from "react-spinners/BeatLoader";

const LoaderOverlay = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simula carga inicial
    const timer = setTimeout(() => setLoading(false), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!loading) return null;

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0,
      width: "100%", height: "100%",
      background: "rgba(255,255,255,0.8)",
      display: "flex", justifyContent: "center", alignItems: "center",
      zIndex: 9999
    }}>
      <BeatLoader color="#36d7b7" />
    </div>
  );
};

export default LoaderOverlay;
