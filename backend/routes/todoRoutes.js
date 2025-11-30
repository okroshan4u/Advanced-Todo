const express = require('express');
const Todo = require('../models/Todo');
const router = express.Router();
const auth = require("../middlewares/auth");


// GET all todos
router.get("/", auth, async (req, res) => {
  const todos = await Todo.find({ userId: req.user }).sort({ createdAt: -1 });
  res.json(todos);
});


// POST create todo
router.post("/", auth, async (req, res) => {
  const todo = await Todo.create({
    ...req.body,
    userId: req.user
  });
  res.json(todo);
});


// PUT update todo
router.put("/:id", auth, async (req, res) => {
  const todo = await Todo.findOneAndUpdate(
    { _id: req.params.id, userId: req.user },
    req.body,
    { new: true }
  );

  res.json(todo);
});

// DELETE todo
router.delete("/:id", auth, async (req, res) => {
  await Todo.findOneAndDelete({ _id: req.params.id, userId: req.user });
  res.json({ msg: "Todo deleted" });
});


module.exports = router;
