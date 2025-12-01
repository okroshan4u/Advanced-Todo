const express = require("express");
const Todo = require("../models/Todo");
const auth = require("../middlewares/auth");
const router = express.Router();

// ----------------------
// GET ALL TODOS
// ----------------------
router.get("/", auth, async (req, res) => {
  const todos = await Todo.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json(todos);
});

// ----------------------
// CREATE TODO
// ----------------------
router.post("/", auth, async (req, res) => {
  const todo = await Todo.create({
    ...req.body,
    userId: req.userId
  });
  res.json(todo);
});

// ----------------------
// UPDATE TODO
// ----------------------
router.put("/:id", auth, async (req, res) => {
  const todo = await Todo.findOneAndUpdate(
    { _id: req.params.id, userId: req.userId },
    req.body,
    { new: true }
  );

  res.json(todo);
});

// ----------------------
// DELETE TODO
// ----------------------
router.delete("/:id", auth, async (req, res) => {
  await Todo.findOneAndDelete({ _id: req.params.id, userId: req.userId });
  res.json({ msg: "Todo deleted" });
});

// ----------------------
// ADD SUBTASK
// ----------------------
router.post("/:id/subtasks", auth, async (req, res) => {
  try {
    const todo = await Todo.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!todo) return res.status(404).json({ msg: "Todo not found" });

    todo.subtasks.push({
      text: req.body.text,
      completed: false
    });

    await todo.save();
    res.json(todo);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ----------------------
// TOGGLE SUBTASK
// ----------------------
router.put("/:id/subtasks/:subId", auth, async (req, res) => {
  try {
    const todo = await Todo.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!todo) return res.status(404).json({ msg: "Todo not found" });

    const subtask = todo.subtasks.id(req.params.subId);
    if (!subtask) return res.status(404).json({ msg: "Subtask not found" });

    subtask.completed = !subtask.completed;
    await todo.save();

    res.json(todo);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

// ----------------------
// DELETE SUBTASK
// ----------------------
router.delete("/:id/subtasks/:subId", auth, async (req, res) => {
  try {
    const todo = await Todo.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!todo) return res.status(404).json({ msg: "Todo not found" });

    todo.subtasks.id(req.params.subId).remove();
    await todo.save();

    res.json(todo);
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
