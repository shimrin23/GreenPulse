const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { addTree, getTrees, getLeaderboard } = require("../controllers/treeController");

router.post("/", upload.single("image"), addTree);
router.get("/", getTrees);
router.get("/leaderboard", getLeaderboard);

module.exports = router;
