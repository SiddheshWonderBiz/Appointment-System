console.log("🔥 ConsultantDashboard FILE LOADED");

import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "../../api/axios";

const ConsultantDashboard = () => {
  console.log("🔥 ConsultantDashboard COMPONENT RENDERED");

  const { user } = useAuth();
  const navigate = useNavigate();

  const [current, setCurrent] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("🔥 useEffect TRIGGERED");

    api.get("/appointment/consultant")
      .then(res => {
        console.log("📦 API RESPONSE:", res.data);
        setCurrent(res.data);
      })
      .catch(err => {
        console.error("❌ API ERROR:", err);
      })
      .finally(() => {
        console.log("🔥 LOADING FALSE");
        setLoading(false);
      });

  }, []);

  return (
    <div style={{ padding: 40 }}>
      <h1>Consultant Dashboard</h1>

      {loading && <p>Loading...</p>}

      {!loading && (
        <pre>{JSON.stringify(current, null, 2)}</pre>
      )}
    </div>
  );
};

export default ConsultantDashboard;
