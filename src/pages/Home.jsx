
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Home() {
  const [tasks, setTasks] = useState([]);

  // Fetch tasks from localStorage
  useEffect(() => {
    const savedTasks = JSON.parse(localStorage.getItem("tasks")) || [];
    setTasks(savedTasks);
  }, []);

  // Calculate task statistics
  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task) => task.status === "Completed"
  ).length;

  const pendingTasks = tasks.filter(
    (task) => task.status === "Pending"
  ).length;

  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-white">

      {/* Hero Section */}
      <section className="max-w-5xl text-center">
        <h1 className="text-4xl font-bold md:text-5xl">
          Manage Your Tasks
          <span className="mt-2 block text-blue-500">
            Stay Organized & Productive
          </span>
        </h1>

        <p className="mt-5 text-gray-400">
          Create tasks, track your progress, and manage your daily work
          efficiently with one simple platform.
        </p>
      </section>

      {/* Statistics Cards */}
      <section className="mt-16 flex flex-wrap justify-center gap-6">

        {/* Total Tasks */}
        <div className="w-64 rounded-xl border border-gray-700 p-8 text-center">
          <p className="text-gray-400">Total Tasks</p>
          <h2 className="mt-4 text-4xl font-bold text-blue-400">
            {totalTasks}
          </h2>
          <p className="mt-2 text-sm text-gray-500">All your tasks</p>
        </div>

        {/* Completed Tasks */}
        <div className="w-64 rounded-xl border border-gray-700 p-8 text-center">
          <p className="text-gray-400">Completed Tasks</p>
          <h2 className="mt-4 text-4xl font-bold text-green-400">
            {completedTasks}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Successfully completed
          </p>
        </div>

        {/* Pending Tasks */}
        <div className="w-64 rounded-xl border border-gray-700 p-8 text-center">
          <p className="text-gray-400">Pending Tasks</p>
          <h2 className="mt-4 text-4xl font-bold text-yellow-400">
            {pendingTasks}
          </h2>
          <p className="mt-2 text-sm text-gray-500">
            Tasks remaining
          </p>
        </div>

      </section>

      {/* Action Buttons */}
      <section className="mt-12 flex flex-wrap justify-center gap-6">

        <Link
          to="/tasks"
          className="rounded-lg border border-blue-500 px-8 py-3 font-semibold text-blue-400 transition-all duration-300 hover:bg-blue-600 hover:text-white hover:shadow-lg hover:shadow-blue-500/20"
        >
          View Tasks
        </Link>

        <Link
          to="/create-task"
          className="rounded-lg border border-gray-600 px-8 py-3 font-semibold text-gray-300 transition-all duration-300 hover:border-white hover:bg-white hover:text-gray-900 hover:shadow-lg"
        >
          + Create Task
        </Link>

      </section>

    </div>
  );
}

export default Home;
