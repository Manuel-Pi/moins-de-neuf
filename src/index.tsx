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
        faBullhorn,
        faPlus,
        faSignOutAlt,
        faSignInAlt,
        faMinus,
        faPuzzlePiece,
        faList,
        faUsers,
        faChartBar,
        faUserCog,
        faToggleOff,
        faToggleOn,
        faAngleRight,
        faAngleLeft,
        faInfo,
        faPowerOff,
        faRedo,
        faFlagCheckered,
        faBan,
        faComment} from '@fortawesome/free-solid-svg-icons';
import { App } from "./App";
// Add custom icon to Font Awesome
library.add(faCheck, 
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
            faBullhorn,
            faPlus,
            faSignOutAlt,
            faSignInAlt,
            faMinus,
            faPuzzlePiece,
            faList,
            faUsers,
            faChartBar,
            faUserCog,
            faToggleOff,
            faToggleOn,
            faAngleRight,
            faAngleLeft,
            faInfo,
            faPowerOff,
            faRedo,
            faFlagCheckered,
            faBan,
            faComment);
// Used for webpack to load less
!!style;
!!React;
// Init Socket,io
declare global {
        interface Window { onPiziChat: any, PiziChat: any}
        const io: any;
        const PiziChat: any;
}
// Get Socket.io
let socket = io('/pizi-moins-de-neuf');
if(('standalone' in window.navigator) && (window.navigator['standalone'])) document.documentElement.classList.add("standalone");
ReactDOM.render(<App socket={socket}/>, document.getElementsByTagName("app")[0]);