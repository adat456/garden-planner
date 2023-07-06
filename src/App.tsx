import { BrowserRouter, Routes, Route } from "react-router-dom";
import { io } from "socket.io-client";

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
  const socket = io("http://localhost:4000");
  socket.on("connect", () => {
    console.log(socket.id);
  });

  return (
    <BrowserRouter> 
      <Routes>
        <Route path="/sign-in" element={<>
          <LogIn />
          <CreateAccount />
        </>} />
        <Route path="/" element={<LoggedInWrapper />}>
          <Route path="create" element={<BedPlantingPage />}>
            <Route path=":bedid" element={<BedPlantingGroup />} />
            <Route path="new-bed" element={<BedCreationPage />} />
          </Route>
          <Route path="share" element={<BedSharingPage />}>
            <Route path=":bedid" element={<BedSharingGroup socket={socket} />} />
          </Route>
          <Route path="explore" element={<BedExplorationPage />} />
          <Route path="profile" />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App
