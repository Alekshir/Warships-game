import "../css/styles.css";
import Game from "./classes/Game/Game";
import RestoreGameMenu from "./classes/RestoreGameMenu/RestoreGameMenu";
import {replayGameInfoType} from "./types/Types";

if (sessionStorage.getItem("replay") === "replay") {//replay mode
    const statInfo=sessionStorage.getItem("replayInfo");
    const statInfoObj=JSON.parse(statInfo) as replayGameInfoType;
    new Game("replay", statInfoObj);//starts game in replay mode
} else if(localStorage.getItem("restore")==="yes") {//restore mode
    new RestoreGameMenu();
} else {//normal mode
    new Game();
}