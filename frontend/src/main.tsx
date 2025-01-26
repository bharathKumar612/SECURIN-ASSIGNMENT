import { BrowserRouter, Routes, Route } from "react-router";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import Layout from "./components/pages/Layout.tsx";
import Main from "./components/pages/Main.tsx";
import SingleCve from "./components/pages/SingleCve.tsx";

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<App />} />
        <Route path="/cves/list" element={<Main />} />
        <Route path="/cves/:cveId" element={<SingleCve />} />
      </Route>
    </Routes>
  </BrowserRouter>
);
