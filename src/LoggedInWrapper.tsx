import { Routes, Route, Link } from "react-router-dom";
import BedCreationPage from './BedCreation/BedCreationPage';
import BedPlantingPage from './BedPlanting/BedPlantingPage';

const LoggedInWrapper: React.FC = function() {
    return (
        <>
            <header>

            </header>
            <main>
                <Routes>
                    <Route path="/create-bed" element={<BedCreationPage />} />
                    <Route path="/view-bed" element={<BedPlantingPage />} />
                </Routes>
            </main>
            <footer>

            </footer>
        </>
    );
};

export default LoggedInWrapper;