import api from "./api";

export const addTree = (formData) => api.post("/trees", formData);
export const getTrees = () => api.get("/trees");
export const getLeaderboard = () => api.get("/trees/leaderboard");
