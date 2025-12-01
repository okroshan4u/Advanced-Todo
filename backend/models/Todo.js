const mongoose = require("mongoose");

const SubtaskSchema = new mongoose.Schema({
  text: { type: String, required: true },
  completed: { type: Boolean, default: false }
});

const TodoSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  title: String,
  description: String,
  category: String,
  priority: String,
   reminder: Date,  
  dueDate: Date,
  completed: Boolean,
  subtasks: [
    {
      text: String,
      completed: { type: Boolean, default: false }
    }
  ]
});

module.exports = mongoose.model("Todo", TodoSchema);
