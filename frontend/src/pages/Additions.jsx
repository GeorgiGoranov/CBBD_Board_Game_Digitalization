import { useParams } from "react-router-dom";
import Cards from "../components/Moderator/Cards"
import "../SCSS/additions.scss"
import AddNewCompetency from "../components/Moderator/AddNewCompeteny";
import CreateNewProfiles from "../components/Moderator/CreateNewProfiles";



const Additions = () => {

    const { number } = useParams();
    return (
        <div className="split-container">
            {number === '1' && <Cards />}
            {number === '2' && <CreateNewProfiles />}
            {number === '3' && <AddNewCompetency />}
        </div>
    )
}

export default Additions