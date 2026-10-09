import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("shopforge_user");
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem("shopforge_user", JSON.stringify(user));
    } else {
      localStorage.removeItem("shopforge_user");
    }
  }, [user]);

  const login = (email, password) => {
    // Client-side authentication simulation
    const name = email.split("@")[0];
    const formattedName = name.charAt(0).toUpperCase() + name.slice(1);
    const authenticatedUser = {
      id: "usr-" + Date.now(),
      name: formattedName || "Valued Customer",
      email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      joinedDate: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      address: {
        street: "742 Evergreen Terrace",
        city: "Springfield",
        state: "OR",
        postalCode: "97477",
        country: "United States"
      }
    };
    setUser(authenticatedUser);
    return { success: true };
  };

  const demoLogin = () => {
    const demoUser = {
      id: "usr-demo-101",
      name: "Alex Morgan",
      email: "alex.morgan@shopforge.com",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80",
      joinedDate: "Jan 2026",
      address: {
        street: "450 Broadway Ave, Apt 4B",
        city: "New York",
        state: "NY",
        postalCode: "10013",
        country: "United States"
      }
    };
    setUser(demoUser);
    return { success: true };
  };

  const signup = ({ firstName, lastName, email, password }) => {
    const fullName = `${firstName} ${lastName}`.trim() || email.split("@")[0];
    const newUser = {
      id: "usr-" + Date.now(),
      name: fullName,
      email,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
      joinedDate: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      address: {
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: "United States"
      }
    };
    setUser(newUser);
    return { success: true };
  };

  const updateProfile = (updatedData) => {
    setUser((prev) => ({ ...prev, ...updatedData }));
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        demoLogin,
        signup,
        updateProfile,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
