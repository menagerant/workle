"use client";

import { createContext, useState } from "react";

export const UserInterests = createContext(null);

export default function Context({ children }) {
  const [likes, setLikes] = useState([]);
  const [dislikes, setDislikes] = useState([]);

  return (
    <UserInterests.Provider value={{ likes, setLikes, dislikes, setDislikes }}>
      {children}
    </UserInterests.Provider>
  );
}
