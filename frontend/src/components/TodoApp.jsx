import React, { useState, useEffect } from "react";
import { Trash2, Edit2, Check, X, Plus, Calendar, Search } from "lucide-react";

const API_URL = "http://localhost:5000/api";

export default function TodoApp({ user }) {
    const [todos, setTodos] = useState([]);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("personal");
    const [priority, setPriority] = useState("medium");
    const [dueDate, setDueDate] = useState("");
    const [editingId, setEditingId] = useState(null);
    const [filter, setFilter] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [reminder, setReminder] = useState('');

    useEffect(() => {
        fetchTodos();
    }, []);

    useEffect(() => {
        if (Notification.permission !== "granted") {
            Notification.requestPermission();
        }
    }, []);

    const fetchTodos = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${API_URL}/todos`, {
                headers: {
                    Authorization: localStorage.getItem("token"),
                },
            });

            if (!response.ok) throw new Error("Failed to fetch todos");

            const data = await response.json();
            setTodos(data);
            setError("");
        } catch (err) {
            setError("Unable to connect to server. Make sure the backend is running.");
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const addTodo = async (e) => {
        e.preventDefault();
        if (!title.trim()) return;

        const newTodo = {
            title: title.trim(),
            description: description.trim(),
            category,
            priority,
            dueDate: dueDate || null,
            reminder: reminder || null,
            completed: false,
        };

        try {
            const response = await fetch(`${API_URL}/todos`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: localStorage.getItem("token"),
                },
                body: JSON.stringify(newTodo),
            });

            if (!response.ok) throw new Error("Failed to add todo");

            const data = await response.json();
            setTodos([...todos, data]);
            resetForm();
            setError("");
        } catch (err) {
            setError("Failed to add todo. Please try again.");
            console.error("Add error:", err);
        }
    };

    const updateTodo = async (id, updates) => {
        try {
            const response = await fetch(`${API_URL}/todos/${id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: localStorage.getItem("token"),
                },
                body: JSON.stringify(updates),
            });

            if (!response.ok) throw new Error("Failed to update todo");

            const data = await response.json();
            setTodos(todos.map((todo) => (todo._id === id ? data : todo)));
            setError("");
        } catch (err) {
            setError("Failed to update todo. Please try again.");
            console.error("Update error:", err);
        }
    };

    const deleteTodo = async (id) => {
        try {
            const response = await fetch(`${API_URL}/todos/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: localStorage.getItem("token"),
                },
            });

            if (!response.ok) throw new Error("Failed to delete todo");

            setTodos(todos.filter((todo) => todo._id !== id));
            setError("");
        } catch (err) {
            setError("Failed to delete todo. Please try again.");
            console.error("Delete error:", err);
        }
    };

    const toggleComplete = async (id, completed) => {
        await updateTodo(id, { completed: !completed });
    };

    const startEdit = (todo) => {
        setEditingId(todo._id);
        setTitle(todo.title);
        setDescription(todo.description);
        setCategory(todo.category);
        setPriority(todo.priority);
        setDueDate(todo.dueDate ? todo.dueDate.split("T")[0] : "");
    };

    const saveEdit = async () => {
        if (!title.trim()) return;

        await updateTodo(editingId, {
            title: title.trim(),
            description: description.trim(),
            category,
            priority,
            dueDate: dueDate || null,
            reminder: reminder || null,
        });

        resetForm();
    };

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setCategory("personal");
        setPriority("medium");
        setDueDate("");
        setEditingId(null);
    };

    const filteredTodos = todos.filter((todo) => {

        const matchesSearch =
            (todo.title || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
            (todo.description || "").toLowerCase().includes(searchTerm.toLowerCase());


        if (!matchesSearch) return false;

        if (filter === "all") return true;
        if (filter === "active") return !todo.completed;
        if (filter === "completed") return todo.completed;
        return todo.category === filter;
    });

    const getPriorityColor = (priority) => {
        const colors = {
            high: "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300",
            medium: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300",
            low: "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300",
        };
        return colors[priority] || colors.medium;
    };


    const getCategoryColor = (cat) => {
        const colors = {
            personal: "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300",
            work: "bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300",
            shopping: "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300",
            health: "bg-pink-100 text-pink-700 dark:bg-pink-900 dark:text-pink-300",
        };
        return colors[cat] || colors.personal;
    };

    const isReminderDue = (todo) => {
        if (!todo.reminder) return false;
        return new Date(todo.reminder) <= new Date() && !todo.completed;
    };
    const stats = {
        total: todos.length,
        active: todos.filter((t) => !t.completed).length,
        completed: todos.filter((t) => t.completed).length,
    };


    const addSubtask = async (todoId, text) => {
        try {
            const response = await fetch(`${API_URL}/todos/${todoId}/subtasks`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": localStorage.getItem("token")
                },
                body: JSON.stringify({ text })
            });

            const updated = await response.json();
            setTodos(todos.map(t => t._id === todoId ? updated : t));
        } catch (err) {
            console.error("Add subtask error", err);
        }
    };

    const toggleSubtask = async (todoId, subId) => {
        const response = await fetch(`${API_URL}/todos/${todoId}/subtasks/${subId}`, {
            method: "PUT",
            headers: {
                "Authorization": localStorage.getItem("token")
            }
        });

        const updated = await response.json();
        setTodos(todos.map(t => t._id === todoId ? updated : t));
    };

    const deleteSubtask = async (todoId, subId) => {
        const response = await fetch(`${API_URL}/todos/${todoId}/subtasks/${subId}`, {
            method: "DELETE",
            headers: {
                "Authorization": localStorage.getItem("token")
            }
        });

        const updated = await response.json();
        setTodos(todos.map(t => t._id === todoId ? updated : t));
    };





    return (
        <div
            className="
    min-h-screen p-4 sm:p-8
    bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100
    dark:bg-gradient-to-br dark:from-gray-900 dark:via-black dark:to-gray-950
    dark:text-white
  "
        >
            <div className="max-w-6xl mx-auto relative">
                {/* Dark Mode Toggle */}
                <button
                    onClick={() => {
                        const root = document.documentElement;
                        const currentlyDark = root.classList.contains("dark");

                        if (currentlyDark) {
                            root.classList.remove("dark");
                            localStorage.setItem("theme", "light");
                        } else {
                            root.classList.add("dark");
                            localStorage.setItem("theme", "dark");
                        }
                    }}
                    className="absolute top-4 right-28 bg-gray-700 text-white px-4 py-2 rounded-lg dark:bg-gray-200 dark:text-black">Toggle Theme
                </button>


        
                <button
                    onClick={() => {
                        localStorage.removeItem("token");
                        localStorage.removeItem("user");
                        window.location.reload();
                    }}
                    className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow hover:bg-red-600"> Logout
                </button>

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-bold text-gray-800 dark:text-white mb-2">
                        Advanced Todo List
                    </h1>
                    <p className="text-gray-600 dark:text-gray-300">
                        Organize your tasks efficiently
                    </p>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 p-4 bg-red-100 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg text-red-700 dark:text-red-300">
                        {error}
                    </div>
                )}

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md text-center">
                        <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-300">
                            {stats.total}
                        </div>
                        <div className="text-gray-600 dark:text-gray-400 text-sm">
                            Total Tasks
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md text-center">
                        <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-300">
                            {stats.active}
                        </div>
                        <div className="text-gray-600 dark:text-gray-400 text-sm">
                            Active
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md text-center">
                        <div className="text-3xl font-bold text-green-600 dark:text-green-300">
                            {stats.completed}
                        </div>
                        <div className="text-gray-600 dark:text-gray-400 text-sm">
                            Completed
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Form */}
                    <div className="lg:col-span-1">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl sticky top-8">
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
                                {editingId ? "Edit Task" : "Add New Task"}
                            </h2>

                            <div>
                                <input
                                    type="text"
                                    placeholder="Task title *"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="
                  w-full px-4 py-3 mb-4 border 
                    border-gray-300 dark:border-gray-600 
                    rounded-lg focus:ring-2 focus:ring-indigo-500
                    bg-white dark:bg-gray-900
                    text-gray-800 dark:text-white
                  "
                                />

                                <textarea
                                    placeholder="Description (optional)"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="
                    w-full px-4 py-3 mb-4 border 
                    border-gray-300 dark:border-gray-600 
                    rounded-lg resize-none bg-white dark:bg-gray-900
                    text-gray-800 dark:text-white
                  "
                                    rows="3"
                                />

                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="
                    w-full px-4 py-3 mb-4 border border-gray-300 dark:border-gray-600 
                    rounded-lg bg-white dark:bg-gray-900 text-gray-800 dark:text-white
                  "
                                >
                                    <option value="personal">Personal</option>
                                    <option value="work">Work</option>
                                    <option value="shopping">Shopping</option>
                                    <option value="health">Health</option>
                                </select>

                                <select
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value)}
                                    className="
                    w-full px-4 py-3 mb-4 border border-gray-300 dark:border-gray-600 
                    rounded-lg bg-white dark:bg-gray-900 text-gray-800 dark:text-white
                  "
                                >
                                    <option value="low">Low Priority</option>
                                    <option value="medium">Medium Priority</option>
                                    <option value="high">High Priority</option>
                                </select>

                                <input
                                    type="date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className="
                    w-full px-4 py-3 mb-6 border 
                    border-gray-300 dark:border-gray-600 
                    rounded-lg bg-white dark:bg-gray-900 
                    text-gray-800 dark:text-white
                  "
                                />
                                <input
                                    type="datetime-local"
                                    value={reminder}
                                    onChange={(e) => setReminder(e.target.value)}
                                    className="w-full px-4 py-3 mb-6 border border-gray-300 rounded-lg 
    focus:outline-none focus:ring-2 focus:ring-indigo-500
    dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                                    placeholder="Set reminder"
                                />


                                <div className="flex gap-2">
                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            editingId ? saveEdit() : addTodo(e);
                                        }}
                                        className="
                      flex-1 bg-indigo-600 dark:bg-indigo-700 
                      text-white py-3 rounded-lg hover:bg-indigo-700
                      dark:hover:bg-indigo-800 transition font-semibold flex 
                      items-center justify-center gap-2
                    "
                                    >
                                        {editingId ? <Check size={20} /> : <Plus size={20} />}
                                        {editingId ? "Save Changes" : "Add Task"}
                                    </button>

                                    {editingId && (
                                        <button
                                            onClick={resetForm}
                                            className="px-4 bg-gray-300 dark:bg-gray-700 dark:text-white rounded-lg"
                                        >
                                            <X size={20} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Todo List */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xl mb-6">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
                                    <input
                                        type="text"
                                        placeholder="Search tasks..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="
                      w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600
                      rounded-lg bg-white dark:bg-gray-900
                      text-gray-800 dark:text-white
                    "
                                    />
                                </div>

                                <select
                                    value={filter}
                                    onChange={(e) => setFilter(e.target.value)}
                                    className="
                    px-4 py-3 border border-gray-300 dark:border-gray-600 
                    rounded-lg bg-white dark:bg-gray-900
                    text-gray-800 dark:text-white
                  "
                                >
                                    <option value="all">All Tasks</option>
                                    <option value="active">Active</option>
                                    <option value="completed">Completed</option>
                                    <option value="personal">Personal</option>
                                    <option value="work">Work</option>
                                    <option value="shopping">Shopping</option>
                                    <option value="health">Health</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-4">
                            {loading ? (
                                <div className="text-center py-12">
                                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-indigo-600"></div>
                                    <p className="mt-4 text-gray-600 dark:text-gray-300">
                                        Loading tasks...
                                    </p>
                                </div>
                            ) : filteredTodos.length === 0 ? (
                                <div className="bg-white dark:bg-gray-800 p-12 rounded-2xl shadow-xl text-center">
                                    <p className="text-gray-500 dark:text-gray-300 text-lg">
                                        {searchTerm || filter !== "all"
                                            ? "No tasks match your filters"
                                            : "No tasks yet. Add your first!"}
                                    </p>
                                </div>
                            ) : (
                                filteredTodos.map((todo) => (
                                    <div key={todo._id} className={` bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-md  hover:shadow-lg transition-all ${todo.completed ? "opacity-60" : ""} `}
                                    >
                                        <div className="flex items-start gap-4">
                                            <button
                                                onClick={() => toggleComplete(todo._id, todo.completed)}
                                                className={`
                          w-6 h-6 rounded-full border-2 flex items-center justify-center
                          ${todo.completed
                                                        ? "bg-green-500 border-green-500"
                                                        : "border-gray-300 dark:border-gray-600 hover:border-indigo-500"}
                        `}
                                            >
                                                {todo.completed && (
                                                    <Check size={16} className="text-white" />
                                                )}
                                            </button>

                                            <div className="flex-1">
                                                <h3 className={` text-xl font-semibold mb-2 ${todo.completed ? "line-through text-gray-500 dark:text-gray-400" : "text-gray-900 dark:text-white"} `} >
                                                    {todo.title}
                                                </h3>

                                                {todo.description && (<p className="text-gray-600 dark:text-gray-300 mb-3">{todo.description} </p>
                                                )}

                                                <div className="flex flex-wrap gap-2 items-center">
                                                    <span
                                                        className={` px-3 py-1 rounded-full text-xs font-medium ${getCategoryColor(todo.category)} `}
                                                    >
                                                        {todo.category}
                                                    </span>

                                                    <span
                                                        className={` px-3 py-1 rounded-full text-xs font-medium  ${getPriorityColor(todo.priority)} `}
                                                    >
                                                        {todo.priority} priority
                                                    </span>

                                                    {todo.dueDate && (
                                                        <span className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
                                                            <Calendar size={14} />
                                                            {new Date(todo.dueDate).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                    {todo.reminder && (
                                                        <span className="flex items-center gap-1 text-xs text-red-500 font-medium">
                                                            ⏰ {new Date(todo.reminder).toLocaleString()}
                                                        </span>
                                                    )}

                                                    {todo.reminder && (
                                                        <span className="flex items-center gap-1 text-xs text-red-500 font-medium">
                                                            ⏰ {new Date(todo.reminder).toLocaleString()}
                                                        </span>
                                                    )}

                                                    {/* ⭐ OVERDUE ALERT BADGE (uses isReminderDue) ⭐ */}
                                                    {isReminderDue(todo) && (
                                                        <span className="px-2 py-1 text-xs rounded bg-red-600 text-white">
                                                            Reminder Due!
                                                        </span>
                                                    )}

                                                </div>

                                                {/* SUBTASK LIST */}
                                                <div className="ml-6 mt-4 space-y-2">

                                                    {todo.subtasks?.map(st => (
                                                        <div key={st._id} className="flex items-center gap-2">
                                                            <input
                                                                type="checkbox"
                                                                checked={st.completed}
                                                                onChange={() => toggleSubtask(todo._id, st._id)}
                                                            />
                                                            <span className={`${st.completed ? "line-through text-gray-500" : ""}`}>
                                                                {st.text}
                                                            </span>
                                                            <button
                                                                onClick={() => deleteSubtask(todo._id, st._id)}
                                                                className="text-red-500 text-xs"
                                                            >
                                                                delete
                                                            </button>
                                                        </div>
                                                    ))}

                                                    {/* ADD SUBTASK */}
                                                    <div className="flex items-center gap-2 mt-3">
                                                        <input
                                                            type="text"
                                                            placeholder="Add subtask..."
                                                            className="flex-1 px-3 py-2 border rounded"
                                                            onKeyDown={(e) => {
                                                                if (e.key === "Enter" && e.target.value.trim()) {
                                                                    addSubtask(todo._id, e.target.value.trim());
                                                                    e.target.value = "";
                                                                }
                                                            }}
                                                        />
                                                        <button
                                                            onClick={(e) => {
                                                                const input = e.target.previousSibling;
                                                                if (input.value.trim()) {
                                                                    addSubtask(todo._id, input.value.trim());
                                                                    input.value = "";
                                                                }
                                                            }}
                                                            className="px-3 py-2 bg-indigo-600 text-white rounded"
                                                        >
                                                            Add
                                                        </button>
                                                    </div>

                                                </div>



                                            </div>

                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => startEdit(todo)}
                                                    className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900 rounded-lg transition"
                                                >
                                                    <Edit2 size={18} />
                                                </button>

                                                <button
                                                    onClick={() => deleteTodo(todo._id)}
                                                    className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900 rounded-lg transition"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
