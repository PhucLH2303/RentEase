import React from "react";
import { useNavigate } from "react-router-dom";

const Header: React.FC = () => {
  const navigate = useNavigate(); // Hook để điều hướng

  return (
    <header className="bg-blue-600 text-white p-4 shadow-md">
      <h1
        className="text-2xl font-bold cursor-pointer hover:text-gray-200 transition duration-300"
        onClick={() => navigate("/")}
      >
        RentEase
      </h1>
    </header>
  );
};

export default Header;
