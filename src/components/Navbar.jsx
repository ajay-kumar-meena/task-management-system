
import { NavLink } from "react-router-dom";

function Navbar() {
  const navLinks = [
    { name: "Home", path: "/" },
    { name: "All Tasks", path: "/tasks" },
    { name: "Create Task", path: "/create-task" },
  ];

  return (
    <nav className="bg-gray-900 border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-6 py-4">

        <div className="flex items-center justify-between">

          {/* Logo */}
          <NavLink to="/" className="text-2xl font-bold text-white">
            Task<span className="text-blue-500">Flow</span>
          </NavLink>

          {/* Navigation Links */}
          <div className="flex items-center gap-2">

            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === "/"}
                className={({ isActive }) =>
                  `px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
                      : "text-gray-400 hover:text-white hover:bg-gray-800"
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}

          </div>


        </div>
      </div>
    </nav>
  );
}

export default Navbar;
