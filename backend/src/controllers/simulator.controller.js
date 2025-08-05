export const startWearableSimulator = (req, res) => {
  const user_id = req.user._id;
  const token = req.token; // From verifyJWT middleware

  startSimulator(user_id, token); // ✅ Pass token for auth
  res.status(200).json({ message: "Simulator started" });
};
