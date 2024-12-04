import { BrowserRouter, Route, Routes } from "react-router-dom";
import ScoreBoard from "./pages/ScoreBoard";
import AdminPanel from "./pages/AdminPanel";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ScoreBoard />} />
        <Route path="/admin" element={<AdminPanel />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
