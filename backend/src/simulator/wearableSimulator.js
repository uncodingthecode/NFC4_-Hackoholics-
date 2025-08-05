export function startSimulator(user_id, token) {
  setInterval(async () => {
    try {
      const vitals = generateRandomVitals(); // Random data
      const res = await axios.post("http://localhost:8000/api/v1/vitals", vitals, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("✅ Sent vitals:", res.data);
    } catch (err) {
      console.error("❌ Error sending vitals:", err.response?.data || err.message);
    }
  }, 60000); // Every 1 min
}
