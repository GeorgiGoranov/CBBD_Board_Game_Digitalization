import Cards from "../components/Cards"
import Sheets from "../components/Sheets"
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