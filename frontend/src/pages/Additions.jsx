import { useParams } from "react-router-dom";
import "../SCSS/additions.scss"
import AddNewCompetency from "../components/Moderator/AddNewCompeteny";
import CreateNewProfiles from "../components/Moderator/CreateNewProfiles";



const Additions = () => {

    const { number } = useParams();
    return (
        <div className="split-container">
            {number === '1' && <AddNewCompetency />}
            {number === '2' && <CreateNewProfiles />}
        </div>
    )
}

export default Additions