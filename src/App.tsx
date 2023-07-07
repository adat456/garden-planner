import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Socket from "./app/socket";
import LogIn from "./SignUp/LogIn";
import CreateAccount from "./SignUp/CreateAccount";
import LoggedInWrapper from "./Base/LoggedInWrapper";
import BedCreationPage from './Create/NewBed/BedCreationPage';
import BedPlantingPage from './Create/BedPlantingPage';
import BedPlantingGroup from "./Create/BedPlantingGroup";
import BedSharingPage from "./Share/Wrapper";
import BedSharingGroup from "./Share/Group";
import BedExplorationPage from "./Explore/BedExplorationPage";

function App() {
  // just indicattes whther or not it is connected--may be deleted later
  const [ isConnected, setIsConnected ]  = useState(Socket.connected);
  useEffect(() => {
    Socket.on("connect", () => {
      setIsConnected(true);
    });
  }, []);

  return (
    <BrowserRouter> 
      <Routes>
        <Route path="/sign-in" element={<>
          <LogIn />
          <CreateAccount />
        </>} />
        <Route path="/" element={<LoggedInWrapper isConnected={isConnected} />}>
          <Route path="create" element={<BedPlantingPage />}>
            <Route path=":bedid" element={<BedPlantingGroup />} />
            <Route path="new-bed" element={<BedCreationPage />} />
          </Route>
          <Route path="share" element={<BedSharingPage />}>
            <Route path=":bedid" element={<BedSharingGroup />} />
          </Route>
          <Route path="explore" element={<BedExplorationPage />} />
          <Route path="profile" />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App
