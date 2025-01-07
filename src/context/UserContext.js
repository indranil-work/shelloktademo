import React, { createContext, useContext, useState } from 'react';

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [selectedLocale, setSelectedLocale] = useState("en-US");
  const [selectedJourney, setSelectedJourney] = useState("email1");

  return (
    <UserContext.Provider value={{
      selectedLocale,
      setSelectedLocale,
      selectedJourney,
      setSelectedJourney
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext); 