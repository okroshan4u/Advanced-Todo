const mongoose = require('mongoose');

const TodoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  category: String,
  priority: String,
  dueDate: Date,
  completed: { type: Boolean, default: false },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true } // ⭐ important!
}, { timestamps: true });

module.exports = mongoose.model('Todo', TodoSchema);
