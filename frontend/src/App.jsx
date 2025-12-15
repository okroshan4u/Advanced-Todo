import React, { useState, useEffect } from "react";
import TodoApp from "./components/TodoApp";
import Auth from "./components/Auth";

export default function App() {
  const [user, setUser] = useState(null);

useEffect(() => {
  const saved = localStorage.getItem("theme");

  if (saved === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}, []);


// useeffect for local storage

  useEffect(() => {
    const saved = localStorage.getItem("user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  return !user ? <Auth setUser={setUser} /> : <TodoApp user={user} />;
}
