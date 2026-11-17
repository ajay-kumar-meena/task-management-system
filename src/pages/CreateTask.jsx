
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const CreateTask = () => {
  const [title, setTitle] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!title.trim()) return;

    const tasks = JSON.parse(localStorage.getItem("tasks")) || [];

    const newId =
      tasks.length > 0
        ? Math.max(...tasks.map((task) => task.id)) + 1
        : 1;

    const newTask = {
      id: newId,
      title: title.trim(),
      date: new Date().toISOString().split("T")[0],
      status: "Pending",
    };

    tasks.push(newTask);
    localStorage.setItem("tasks", JSON.stringify(tasks));

    setTitle("");
    navigate("/tasks");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">

      <form
        onSubmit={handleSubmit}
        className="w-full max-w-3xl text-center"
      >
        {/* Heading */}
        <h1 className="mb-12 text-5xl font-extrabold tracking-tight md:text-6xl">
          Create Your Task
        </h1>

        {/* Input and Button */}
        <div className="flex flex-col gap-5 sm:flex-row">

          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter your task..."
            className="h-400px flex-1 rounded-xl border border-gray-700 bg-transparent px-6 py-5 text-lg  placeholder:text-gray-500 outline-none transition-all duration-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />

          <button
            type="submit"
            disabled={!title.trim()}
            className="rounded-xl border border-blue-500 text-black px-10 py-5 text-lg font-bold text-blue-400 transition-all duration-300 hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-500/20 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Create Task
          </button>

        </div>
      </form>

    </div>
  );
};

export default CreateTask;
