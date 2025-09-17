import TreeForm from "../components/TreeForm";
import TreeMap from "../components/TreeMap";
import Leaderboard from "../components/Leaderboard";

const Dashboard = () => {
  const userId = "YOUR_USER_ID"; // replace after login

  return (
    <div>
      <h1>Dashboard</h1>
      <TreeForm userId={userId} />
      <TreeMap />
      <Leaderboard />
    </div>
  );
};

export default Dashboard;
