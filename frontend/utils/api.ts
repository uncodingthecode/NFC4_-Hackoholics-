// frontend/utils/api.ts
export const getAgentById = async (id: string) => {
  const res = await fetch(`http://localhost:5000/api/agent/${id}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  });

  if (!res.ok) throw new Error("Failed to fetch agent");
  return res.json();
};
