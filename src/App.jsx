import { Routes, Route } from "react-router-dom";
import Home from "./Pages/FirstPage/Home";
import NavBar from "./utils/NavBar";
import Login from "./Pages/Login";
import Register from "./Pages/Register";
import LoginSuccess from "./Pages/LoginSuccess";
import SearchPage from "./Pages/SearchPage";
import RepoDetailPage from "./Pages/RepoDetailPage";
import MyReposPage from "./Pages/MyReposPage";
import { AuthProvider } from "./context/AuthContext";

const App = () => {
  return (
    <AuthProvider>
      <div className="flex h-screen overflow-hidden bg-slate-50">
        <NavBar />
        <div className="flex-1 overflow-y-auto">
          <Routes>
            <Route path="/"              element={<Home />} />
            <Route path="/login"         element={<Login />} />
            <Route path="/register"      element={<Register />} />
            <Route path="/login-success" element={<LoginSuccess />} />
            <Route path="/repo-detail"   element={<RepoDetailPage />} />
            <Route path="/my-repos"      element={<MyReposPage />} />
            <Route path="/search"        element={<SearchPage />} />
          </Routes>
        </div>
      </div>
    </AuthProvider>
  );
};

export default App;