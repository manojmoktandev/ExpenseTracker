import { useState } from "react";
import Login from "@/components/auth/login";
import Signup from "@/components/auth/signup";
import ForgotPassword from "@/components/auth/forgot-password";

type AuthView = "login" | "signup" | "forgot-password";

export default function Auth() {
  const [currentView, setCurrentView] = useState<AuthView>("login");

  const renderAuthComponent = () => {
    switch (currentView) {
      case "login":
        return (
          <Login
            onSwitchToSignup={() => setCurrentView("signup")}
            onSwitchToForgotPassword={() => setCurrentView("forgot-password")}
          />
        );
      case "signup":
        return (
          <Signup
            onSwitchToLogin={() => setCurrentView("login")}
          />
        );
      case "forgot-password":
        return (
          <ForgotPassword
            onSwitchToLogin={() => setCurrentView("login")}
          />
        );
      default:
        return null;
    }
  };

  return renderAuthComponent();
}