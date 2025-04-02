
import { Link, useNavigate } from "react-router-dom";
import { Button, notification } from "antd";

const Navbar: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    notification.success({
      message: "Logged Out",
      description: "You have been successfully logged out.",
      placement: "topRight",
    });
    navigate("/");
  };

  return (
    <nav className="bg-gray-800 p-4 text-white flex justify-between items-center">
      <ul className="flex space-x-4">
        <li><Link to="/home" className="hover:text-gray-300">Home</Link></li>
        <li><Link to="/home/landlord-home" className="hover:text-gray-300">Landlord home</Link></li>
        <li><Link to="/home/profile" className="hover:text-gray-300">Profile</Link></li>
        <li><Link to="/settings" className="hover:text-gray-300">Settings</Link></li>
      </ul>
      <Button type="primary" danger onClick={handleLogout}>
        Logout
      </Button>
    </nav>
  );
};

export default Navbar;