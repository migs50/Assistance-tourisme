import React from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import HomeGlobal from "./pages/HomeGlobal";
import HomeTanger from "./pages/tanger/HomeTanger";
import ChatPage from "./pages/ChatPage";
import InteractiveMapPage from "./pages/InteractiveMapPage";

export default function App() {
  const navigate = useNavigate();

  return (
    <Routes>
      <Route
        path="/"
        element={<HomeGlobal onExploreTanger={() => navigate("/tanger")} />}
      />
      <Route
        path="/tanger"
        element={
          <HomeTanger
            onBack={() => navigate("/")}
            onOpenChat={() => navigate("/chat")}
          />
        }
      />
      <Route
        path="/chat"
        element={<ChatPage onBack={() => navigate("/tanger")} />}
      />
      <Route
        path="/map"
        element={<InteractiveMapPage />}
      />
    </Routes>
  );
}