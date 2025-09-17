const mongoose = require("mongoose");

const treeSchema = mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  image: { type: String },
  treeType: { type: String },
  location: {
    lat: Number,
    lng: Number
  },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Tree", treeSchema);
