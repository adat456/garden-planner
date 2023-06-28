import { BrowserRouter, Routes, Route } from "react-router-dom";
import LogIn from "./SignUp/LogIn";
import CreateAccount from "./SignUp/CreateAccount";
import LoggedInWrapper from "./LoggedInWrapper";
import BedCreationPage from './BedCreation/BedCreationPage';
import BedPlantingWrapper from './BedPlanting/BedPlantingWrapper';
import BedPlantingGroup from "./BedPlanting/BedPlantingGroup";
import BedExplorationPage from "./BedExploration/BedExplorationPage";

function App() {
  return (
    <BrowserRouter> 
      <Routes>
        <Route path="/sign-in" element={<>
          <LogIn />
          <CreateAccount />
        </>} />
        <Route path="/" element={<LoggedInWrapper />}>
          <Route path="create" element={<BedPlantingWrapper />}>
            <Route path=":bedid" element={<BedPlantingGroup />} />
            <Route path="new-bed" element={<BedCreationPage />} />
          </Route>
          <Route path="share" />
          <Route path="explore" element={<BedExplorationPage />} />
          <Route path="profile" />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App
