import { useEffect, useState } from "react";
import { getLeaderboard } from "../services/treeService";

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    getLeaderboard().then(res => setLeaders(res.data));
  }, []);

  return (
    <div>
      <h3>Leaderboard</h3>
      <ol>
        {leaders.map(l => (
          <li key={l._id}>{l._id} - {l.treeCount} trees</li>
        ))}
      </ol>
    </div>
  );
};

export default Leaderboard;
