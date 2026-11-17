
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import CreateTask from "./pages/CreateTask";
import Task from "./pages/Task"

function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col">
        <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create-task" element={<CreateTask />} />
        <Route path="tasks" element={<Task />} />
      </Routes>
         </div>
    </BrowserRouter>
  );
}

export default App;
