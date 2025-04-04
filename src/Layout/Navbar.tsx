import { Link, useNavigate } from "react-router-dom";
import { Dropdown, Avatar, Button, notification } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const [roleId, setRoleId] = useState<number | null>(null);

  useEffect(() => {
    const storedRoleId = localStorage.getItem("roleId");
    if (storedRoleId) {
      setRoleId(Number(storedRoleId));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("roleId");
    notification.success({
      message: "Logged Out",
      description: "You have been successfully logged out.",
      placement: "topRight",
    });
    navigate("/");
  };

  const menu = (
    <div className="bg-white shadow-lg rounded-lg p-2">
      <Button type="primary" danger onClick={handleLogout} className="w-full">
        Logout
      </Button>
    </div>
  );

  return (
    <nav className="bg-gray-900 p-4 text-white flex justify-between items-center shadow-md">
      <ul className="flex space-x-6">
        <li>
          <Link to="/home" className="text-gray-200 hover:text-white transition duration-300 font-medium">
            Home
          </Link>
        </li>
        {roleId === 2 && (
          <li>
            <Link to="/home/landlord-home" className="text-gray-200 hover:text-white transition duration-300 font-medium">
              Landlord Home
            </Link>
          </li>
        )}
        <li>
          <Link to="/home/profile" className="text-gray-200 hover:text-white transition duration-300 font-medium">
            Profile
          </Link>
        </li>
        <li>
          <Link to="/settings" className="text-gray-200 hover:text-white transition duration-300 font-medium">
            Settings
          </Link>
        </li>
      </ul>
      <Dropdown overlay={menu} trigger={["click"]}>
        <Avatar
          size="large"
          icon={<UserOutlined />}
          className="bg-blue-500 cursor-pointer hover:bg-blue-600 transition duration-300"
        />
      </Dropdown>
    </nav>
  );
};

export default Navbar;
