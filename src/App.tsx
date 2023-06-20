import { BrowserRouter, Routes, Route } from "react-router-dom";
import LogIn from "./SignUp/LogIn";
import CreateAccount from "./SignUp/CreateAccount";
import LoggedInWrapper from "./LoggedInWrapper";

function App() {
  return (
    <BrowserRouter> 
      <Routes>
        <Route path="/sign-in" element={<>
          <LogIn />
          <CreateAccount />
        </>} />
        <Route path="/*" element={<LoggedInWrapper />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App
