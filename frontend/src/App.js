import { BrowserRouter, Navigate, Routes, Route } from "react-router-dom";
import Loginpage from "scences/loginpage";
import Adminloginpage from "scences/adminloginpage";
import ProfilePage from "scences/profilePage";
import Homepage from "scences/homepage";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { createTheme } from "@mui/material/styles";
import { themeSettings } from "./theme";

function App() {
  const mode = useSelector((state) => state.mode);
  const theme = useMemo(() => createTheme(themeSettings(mode)), [mode]);
  const isAuth = Boolean(useSelector((state) => state.token));
  return (
    <div className="app">
      <BrowserRouter>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Routes>
            <Route path="/auth"
              element={!isAuth ? < Loginpage /> : <Navigate to="/home" />} />
            <Route path="/adminloginpage" element={<Adminloginpage />} />
            <Route path="/home" element={< Homepage />} />

            <Route
              path="/profile"
              element={isAuth ? <ProfilePage /> : <Navigate to="/auth" />}
            />
          </Routes>
        </ThemeProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
