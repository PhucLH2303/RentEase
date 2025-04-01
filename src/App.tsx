import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "./Layout/Layout";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Login from "./pages/login";
import Register from "./pages/Register";
import Verify from "./pages/Verify"; // Import the new Verify component
import Settings from "../src/pages/Setting";
import Dashboard from "./pages/admin/dashboard";
import Users from "./pages/admin/user";
import Manage from "./pages/admin/manage";
import ApartmentDetail from "./pages/ApartmentDetail";
//Landlord
import LoginAdmin from "./pages/admin/login/index";
import DashboardAdmin from "./component/dashboard";
import LandLordHome from "../src/pages/landlord/home";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<Verify />} /> {/* Add the verify route */}
        <Route path="/admin" element={<LoginAdmin />} />
        <Route path="/admin/dashboard" element={<DashboardAdmin />} />
        {/* LandLord */}
        <Route path="/landlord-home" element={<LandLordHome />} />
        <Route path="dbhome" element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="manage" element={<Manage />} />
        <Route path="/home" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="profile" element={<Profile />} />
          <Route path="settings" element={<Settings />} />
          <Route path="apartment/:id" element={<ApartmentDetail />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;