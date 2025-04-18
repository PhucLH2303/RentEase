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
import ApartmentDetail from "./pages/landlord/home/ApartmentDetail";
import ApartmentDetailInHome from "./pages/ApartmentDetail";
import PostDetail from "./pages/PostDetail";
import SuccessPayment from "./pages/SuccessPayment";
import FailedPayment from "./pages/FailedPayment";
//Landlord
import LoginAdmin from "./pages/admin/login/index";
import ViewApt from "./pages/landlord/home/ViewApt";
import DashboardAdmin from "./component/dashboard";
import LandLordHome from "../src/pages/landlord/home";
import CreatePost from "./pages/CreatePost";
import FavoriteApartmentsPage from "./pages/FavoriteApartmentsPage";
import PostDetailPage from "./pages/PostDetailPage";
import TransactionHistory from "./pages/TransactionHistory";
import EditPost from "./pages/EditPost";
// import ManageRequest from "./pages/ManageRequest";
import ShowAllPost from "./pages/ShowAllPost";

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify" element={<Verify />} /> {/* Add the verify route */}
        {/* <Route path="/dashboard" element={<DashboardLayout />} /> */}
        <Route path="/payment/success" element={<SuccessPayment />} />
        <Route path="/payment/failed" element={<FailedPayment />} />
        <Route path="/admin" element={<LoginAdmin />} />
        <Route path="/admin/dashboard" element={<DashboardAdmin />} />
        {/* LandLord */}

        <Route path="dbhome" element={<Dashboard />} />
        <Route path="users" element={<Users />} />
        <Route path="manage" element={<Manage />} />
        <Route path="/home" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="profile" element={<Profile />} />
          {/* <Route path="request" element={<ManageRequest />} /> */}
          <Route path="profile/:id" element={<PostDetail />} />
          <Route path="profile/edit/:postId" element={<EditPost />} />
          <Route path="create-post" element={<CreatePost />} />
          <Route path="post/:postId" element={<PostDetailPage />} />
          <Route path="landlord-home" element={<LandLordHome />} />
          <Route path="settings" element={<Settings />} />
          <Route path="transaction-history" element={<TransactionHistory />} />
          <Route path="apt-favorite" element={<FavoriteApartmentsPage />} />
          <Route path="/home/apartment/view/:aptId" element={<ViewApt />} />
          <Route path="apartment/detail/:aptId" element={<ApartmentDetail />} />
          <Route path="apartment/:aptId" element={<ApartmentDetailInHome />} />
          <Route path="all-posts" element={<ShowAllPost />} />
        </Route>
      </Routes>
    </Router>
  );
};

export default App;