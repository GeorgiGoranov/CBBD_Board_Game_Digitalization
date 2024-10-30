const ModeratorRoomLayout = () =>{

    let checkBeforeStart = false


    const handleStartOfRounds = () =>{
        if (!checkBeforeStart){
            alert(`You are about to START the game! Are you sure?`);
            checkBeforeStart = true
        }else{
            console.log("start")
        }
    }





    return (
        <div>
            <button className="start-btn" onClick={() => handleStartOfRounds()}>Start Round</button>
            
        </div>
    )
}

export default ModeratorRoomLayout