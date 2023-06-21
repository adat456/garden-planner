import { Routes, Route, Link } from "react-router-dom";
import BedCreationPage from './BedCreation/BedCreationPage';
import BedPlantingPage from './BedPlanting/BedPlantingPage';
import CreateVeg from "./Misc/CreateVeg";

const LoggedInWrapper: React.FC = function() {
    return (
        <>
            <header>
                <p>header</p>
            </header>
            <main>
                <Routes>
                    <Route path="/create-bed" element={<BedCreationPage />} />
                    <Route path="/view-bed" element={<BedPlantingPage />} />
                </Routes>
            </main>
            <footer>
                <p>Footer</p>
                <CreateVeg />
            </footer>
        </>
    );
};

export default LoggedInWrapper;