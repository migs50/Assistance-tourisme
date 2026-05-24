/**
 * App.jsx — VERSION FINALE
 * 3 pages : HomeGlobal -> HomeTanger -> ChatPage (grande page complète)
 */
import { useState } from "react";
import HomeGlobal from "./pages/HomeGlobal";
import HomeTanger from "./pages/tanger/HomeTanger";
import ChatPage from "./pages/ChatPage";

export default function App() {
  const [page, setPage] = useState("global");

  return (
    <>
      {page === "global" && (
        <HomeGlobal
          onExploreTanger={() => setPage("tanger")}
        />
      )}
      {page === "tanger" && (
        <HomeTanger
          onBack={() => setPage("global")}
          onOpenChat={() => setPage("chat")}
        />
      )}
      {page === "chat" && (
        <ChatPage
          onBack={() => setPage("tanger")}
        />
      )}
    </>
  );
}