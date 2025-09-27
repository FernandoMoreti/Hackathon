import { Routes, Route } from "react-router-dom";
import "./App.css"
import Home from "./Pages/Home";
import ChatAI from "./Pages/ChatAI";
import ChatAuditoria from "./Pages/ChatAuditoria";
import NotFound from "./Pages/NotFound";
import ChatConsulta from "./Pages/ChatConsulta";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/chatai" element={<ChatAI />} />
      <Route path="/chatauditoria" element={<ChatAuditoria />} />
      <Route path="/marcarconsulta" element={<ChatConsulta />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
