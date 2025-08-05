export const getCurrentHHMM = () => {
  const now = new Date();
  return now.toTimeString().slice(0, 5); // "HH:MM"
};
