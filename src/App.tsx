import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppRoutes from "./config/routers";

const App: React.FC = () => (
  <BrowserRouter>
    <Routes>
      {AppRoutes.map((route) => (
        <Route key={route.id} path={route.path} element={<route.element />} />
      ))}
    </Routes>
  </BrowserRouter>
);

export default App;
