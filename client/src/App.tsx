// App.jsx
import React from "react";
import { BrowserRouter } from "react-router-dom";
import MainLayout from "./layouts/MainLayout";

const App = () => {
  return (
    <BrowserRouter>
      <MainLayout />
    </BrowserRouter>
  );
};

export default App;
