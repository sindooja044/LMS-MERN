import { Skeleton } from "@/components/ui/skeleton";
import {
  initialSignInFormData,
  initialSignUpFormData,
} from "@/config";
import {
  checkAuthService,
  loginService,
  registerService,
} from "@/services";
import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  
  const [signInFormData, setSignInFormData] = useState(initialSignInFormData);
  const [signUpFormData, setSignUpFormData] = useState(initialSignUpFormData);
  const [activeTab, setActiveTab] = useState("signin");
  const [auth, setAuth] = useState({
    authenticate: false,
    user: null,
  });
  const [loading, setLoading] = useState(true);

  // -------- REGISTER ----------
  async function handleRegisterUser(event) {
    event.preventDefault();
    const data = await registerService(signUpFormData);
    if (data.success) {
      console.log("User registered successfully");
       setActiveTab("signin");
      
      
    } else {
      console.error("Registration failed:", data.message);
    }
  }

  // -------- LOGIN ----------
  async function handleLoginUser(event) {
    event.preventDefault();
    const data = await loginService(signInFormData);
    console.log(data, "datadatadatadata");

    if (data.success) {
      // Save token
      sessionStorage.setItem("accessToken", data.data.accessToken);

      setAuth({
        authenticate: true,
        user: data.data.user,
      });
    } else {
      setAuth({
        authenticate: false,
        user: null,
      });
    }
  }

  // -------- CHECK AUTH USER ----------
  async function checkAuthUser() {
    try {
      const data = await checkAuthService();
      if (data.success) {
        setAuth({
          authenticate: true,
          user: data.data.user,
        });
      } else {
        setAuth({
          authenticate: false,
          user: null,
        });
      }
    } catch (error) {
      if (error?.response?.status === 401) {
        console.log("No user authenticated yet (normal on first load)");
      } else {
        console.error("Unexpected error in checkAuthUser:", error);
      }
      setAuth({
        authenticate: false,
        user: null,
      });
    } finally {
      setLoading(false);
    }
  }

  // -------- LOGOUT ----------
  function resetCredentials() {
    sessionStorage.removeItem("accessToken");
    setAuth({
      authenticate: false,
      user: null,
    });
  }

  // Run once on app load
  useEffect(() => {
    checkAuthUser();
  }, []);

  console.log(auth, "gf"); // debug

  return (
    <AuthContext.Provider
      value={{
        signInFormData,
        setSignInFormData,
        signUpFormData,
        setSignUpFormData,
        handleRegisterUser,
        handleLoginUser,
        auth,
        resetCredentials,
        activeTab, setActiveTab,
        
      }}
    >
      {loading ? <Skeleton /> : children}
    </AuthContext.Provider>
  );
}
