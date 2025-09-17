const User = require("../models/User");

// Register
exports.register = async (req, res) => {
  const { name, password } = req.body;
  try {
    const user = new User({ name, password });
    await user.save();
    res.json({ message: "User registered", user });
  } catch (error) {
    res.status(500).json({ error });
  }
};

// Login
exports.login = async (req, res) => {
  const { name, password } = req.body;
  try {
    const user = await User.findOne({ name, password });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });
    res.json({ message: "Login successful", user });
  } catch (error) {
    res.status(500).json({ error });
  }
};
