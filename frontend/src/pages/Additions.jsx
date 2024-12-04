import Cards from "../components/Moderator/Cards"
import Sheets from "../components/Moderator/Sheets"
import "../SCSS/additions.scss"

const  Additions = () =>{
    return(
        <div className="split-container">
            <Cards/>
            <Sheets/>
        </div>
    )
}

export default Additions