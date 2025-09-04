import React, { useState } from "react";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function App() {
  const [section, setSection] = useState("home"); // "home" or "login"

  return (
    <>
      <Navbar setSection={setSection} />
      {section === "home" && <Home />}
      {section === "login" && <Login setSection={setSection} />}
    </>
  );
}

export default App;
