const Tree = require("../models/Tree");

// Add Tree
exports.addTree = async (req, res) => {
  const { user, treeType, lat, lng } = req.body;
  const image = req.file ? req.file.path : "";
  try {
    const tree = new Tree({ user, treeType, location: { lat, lng }, image });
    await tree.save();
    res.json(tree);
  } catch (error) {
    res.status(500).json({ error });
  }
};

// Get all trees
exports.getTrees = async (req, res) => {
  try {
    const trees = await Tree.find().populate("user", "name");
    res.json(trees);
  } catch (error) {
    res.status(500).json({ error });
  }
};

// Leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const leaderboard = await Tree.aggregate([
      { $group: { _id: "$user", treeCount: { $sum: 1 } } },
      { $sort: { treeCount: -1 } }
    ]);
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ error });
  }
};
