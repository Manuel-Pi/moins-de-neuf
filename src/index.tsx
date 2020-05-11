import * as React from "react";
import * as ReactDOM from "react-dom";
import style from "./main.less";
import { library } from '@fortawesome/fontawesome-svg-core';
import { faCheck, 
        faGraduationCap, 
        faCannabis, 
        faChessQueen, 
        faChessKing, 
        faCarrot, faBars, 
        faPaperPlane, 
        faSpinner, 
        faTrophy, 
        faStar, 
        faTimes, 
        faKissWinkHeart, 
        faReceipt,
        faHandPaper,
        faFileSignature,
        faBullhorn} from '@fortawesome/free-solid-svg-icons';
import { faAngellist } from '@fortawesome/free-brands-svg-icons';
import { Lobby } from "./components/Lobby/Lobby";
// Add custom icon to Font Awesome
library.add(faAngellist, 
            faCheck, 
            faGraduationCap, 
            faCannabis, 
            faChessQueen, 
            faChessKing, 
            faCarrot, 
            faBars, 
            faPaperPlane, 
            faSpinner, 
            faTrophy, 
            faStar, 
            faTimes, 
            faKissWinkHeart, 
            faReceipt,
            faHandPaper,
            faFileSignature,
            faBullhorn);
// Used for webpack to load less
!!style;
React === React;
// Init Socket,io
declare const io: any;
declare const ENV_PORT: any, ENV_URL: any;

// Get Socket.io
let socket = io('/pizi-moins-de-neuf');

ReactDOM.render(<Lobby socket={socket} username={null}/>, document.getElementsByTagName("app")[0]);