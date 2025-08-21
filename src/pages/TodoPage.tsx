// src/pages/TodoPage.tsx
import { useEffect, useState } from "react";
import { ref, push, onValue, remove, update } from "firebase/database";
import { realtimeDb } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { Plus, Trash2, CheckCircle, Circle } from "lucide-react";
import Sidebar from "../components/Sidebar";

interface Todo {
  id: string;
  text: string;
  completed: boolean;
}

export default function TodoPage() {
  const { user } = useAuth();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTask, setNewTask] = useState("");

  // ✅ Fetch realtime todos
  useEffect(() => {
    if (!user) return;
    const todosRef = ref(realtimeDb, `todos/${user.uid}`);
    return onValue(todosRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const parsed: Todo[] = Object.entries(data).map(([id, value]: any) => ({
          id,
          ...value,
        }));
        setTodos(parsed);
      } else {
        setTodos([]);
      }
    });
  }, [user]);

  // ✅ Add todo
  const addTodo = async () => {
    if (!newTask.trim() || !user) return;
    const todosRef = ref(realtimeDb, `todos/${user.uid}`);
    await push(todosRef, { text: newTask, completed: false });
    setNewTask("");
  };

  // ✅ Toggle completed
  const toggleTodo = async (id: string, completed: boolean) => {
    if (!user) return;
    const todoRef = ref(realtimeDb, `todos/${user.uid}/${id}`);
    await update(todoRef, { completed: !completed });
  };

  // ✅ Delete todo
  const deleteTodo = async (id: string) => {
    if (!user) return;
    const todoRef = ref(realtimeDb, `todos/${user.uid}/${id}`);
    await remove(todoRef);
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-black via-[#1a1a1a] to-[#2b2b2b] text-white">
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 p-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mx-auto bg-[#1a1110]/90 backdrop-blur-lg rounded-2xl shadow-2xl border border-[#242124] p-8"
        >
          {/* Header */}
          <h1 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-gray-200 to-gray-400 bg-clip-text text-transparent">
            My To-Do List
          </h1>

          {/* Input */}
          <div className="flex gap-2 mb-6">
            <input
              type="text"
              placeholder="Enter a task..."
              className="flex-1 px-4 py-3 rounded-lg bg-[#242124] text-white placeholder-gray-400
                       focus:outline-none focus:ring-2 focus:ring-[#353839] transition"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTodo()}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              onClick={addTodo}
              className="flex items-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-[#242124] to-[#353839] 
                       shadow-md hover:shadow-lg transition"
            >
              <Plus size={18} /> Add
            </motion.button>
          </div>

          {/* List */}
          <ul className="space-y-3">
            {todos.map((todo) => (
              <motion.li
                key={todo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-between items-center bg-[#242124]/60 px-4 py-3 rounded-lg shadow-md"
              >
                <div
                  onClick={() => toggleTodo(todo.id, todo.completed)}
                  className="flex items-center gap-3 cursor-pointer select-none"
                >
                  {todo.completed ? (
                    <CheckCircle className="text-green-400" size={20} />
                  ) : (
                    <Circle className="text-gray-500" size={20} />
                  )}
                  <span
                    className={`${
                      todo.completed ? "line-through text-gray-500" : "text-white"
                    }`}
                  >
                    {todo.text}
                  </span>
                </div>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="text-red-500 hover:text-red-700 transition"
                >
                  <Trash2 size={18} />
                </button>
              </motion.li>
            ))}

            {todos.length === 0 && (
              <p className="text-gray-400 text-center mt-6">
                No tasks yet. Add one above 
              </p>
            )}
          </ul>
        </motion.div>
      </main>
    </div>
  );
}
