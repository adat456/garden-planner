import { BrowserRouter, Routes, Route } from "react-router-dom";
import LogIn from "./SignUp/LogIn";
import CreateAccount from "./SignUp/CreateAccount";

import LoggedInWrapper from "./Base/LoggedInWrapper";

import BedCreationPage from './Create/NewBed/BedCreationPage';
import BedPlantingPage from './Create/BedPlantingPage';
import BedPlantingGroup from "./Create/BedPlantingGroup";

import BedSharingPage from "./Share/Wrapper";
import BedSharingGroup from "./Share/Group";
import EventsPage from "./Share/Events/EventsPage";
import MembersPage from "./Share/Members/MembersPage";
import ProfilePage from "./Profile/ProfilePage";
import Bulletin from "./Share/Bulletin/Bulletin";
import Post from "./Share/Bulletin/Post";
import PermissionsPage from "./Share/Members/Permissions/PermPage";

import BedExplorationWrapper from "./Explore/Wrapper";
import BedExplorationPage from "./Explore/AllResults/BedExplorationPage";
import BedResultPage from "./Explore/SingleResult/BedResultPage";
import TasksPage from "./Share/Tasks/TasksPage";


function App() {
  return (
    <>
      <BrowserRouter> 
        <Routes>
          <Route path="/sign-in" element={<>
            <LogIn />
            <CreateAccount />
          </>} />
          <Route path="/" element={<LoggedInWrapper />}>
            <Route path="create" element={<BedPlantingPage />}>
              <Route path=":bedid" element={<BedPlantingGroup />} />
              <Route path=":bedid/edit" element={<BedCreationPage />} />
              <Route path="new-bed" element={<BedCreationPage />} />
            </Route>
            <Route path="share" element={<BedSharingPage />}>
              <Route path=":bedid" element={<BedSharingGroup />} />
              <Route path=":bedid/events" element={<EventsPage />} />
              <Route path=":bedid/members" element={<MembersPage />} />
              <Route path=":bedid/members/permissions" element={<PermissionsPage />} />
              <Route path=":bedid/bulletin" element={<Bulletin />} />
              <Route path=":bedid/bulletin/:postid" element={<Post />} />
              <Route path=":bedid/tasks" element={<TasksPage />} />
            </Route>
            <Route path="explore" element={<BedExplorationWrapper />}>
              <Route index element={<BedExplorationPage />} />
              <Route path=":bedid" element={<BedResultPage />} />
            </Route>
            <Route path="profile" element={<ProfilePage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
};

export default App
