import * as React from "react";
import * as ReactDOM from "react-dom";
import "./main.less";
import { library } from '@fortawesome/fontawesome-svg-core';
import { faBan } from '@fortawesome/free-solid-svg-icons/faBan';
import { faCheck } from '@fortawesome/free-solid-svg-icons/faCheck';
import { faGraduationCap } from '@fortawesome/free-solid-svg-icons/faGraduationCap';
import { faCannabis } from '@fortawesome/free-solid-svg-icons/faCannabis';
import { faChessQueen } from '@fortawesome/free-solid-svg-icons/faChessQueen';
import { faChessKing } from '@fortawesome/free-solid-svg-icons/faChessKing';
import { faCarrot } from '@fortawesome/free-solid-svg-icons/faCarrot';
import { faBars } from '@fortawesome/free-solid-svg-icons/faBars';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons/faPaperPlane';
import { faSpinner } from '@fortawesome/free-solid-svg-icons/faSpinner';
import { faTrophy } from '@fortawesome/free-solid-svg-icons/faTrophy';
import { faStar } from '@fortawesome/free-solid-svg-icons/faStar';
import { faTimes } from '@fortawesome/free-solid-svg-icons/faTimes';
import { faKissWinkHeart } from '@fortawesome/free-solid-svg-icons/faKissWinkHeart';
import { faReceipt } from '@fortawesome/free-solid-svg-icons/faReceipt';
import { faHandPaper } from '@fortawesome/free-solid-svg-icons/faHandPaper';
import { faFileSignature } from '@fortawesome/free-solid-svg-icons/faFileSignature';
import { faBullhorn } from '@fortawesome/free-solid-svg-icons/faBullhorn';
import { faPlus } from '@fortawesome/free-solid-svg-icons/faPlus';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons/faSignOutAlt';
import { faSignInAlt } from '@fortawesome/free-solid-svg-icons/faSignInAlt';
import { faMinus } from '@fortawesome/free-solid-svg-icons/faMinus';
import { faPuzzlePiece } from '@fortawesome/free-solid-svg-icons/faPuzzlePiece';
import { faList } from '@fortawesome/free-solid-svg-icons/faList';
import { faUsers } from '@fortawesome/free-solid-svg-icons/faUsers';
import { faChartBar } from '@fortawesome/free-solid-svg-icons/faChartBar';
import { faUserCog } from '@fortawesome/free-solid-svg-icons/faUserCog';
import { faToggleOff } from '@fortawesome/free-solid-svg-icons/faToggleOff';
import { faToggleOn } from '@fortawesome/free-solid-svg-icons/faToggleOn';
import { faAngleRight } from '@fortawesome/free-solid-svg-icons/faAngleRight';
import { faAngleLeft } from '@fortawesome/free-solid-svg-icons/faAngleLeft';
import { faInfo } from '@fortawesome/free-solid-svg-icons/faInfo';
import { faPowerOff } from '@fortawesome/free-solid-svg-icons/faPowerOff';
import { faRedo } from '@fortawesome/free-solid-svg-icons/faRedo';
import { faFlagCheckered } from '@fortawesome/free-solid-svg-icons/faFlagCheckered';
import { faComment } from '@fortawesome/free-solid-svg-icons/faComment';
import { App } from "./App";
import { faPlay } from "@fortawesome/free-solid-svg-icons/faPlay";
import { faStop } from "@fortawesome/free-solid-svg-icons/faStop";
import { faUser } from "@fortawesome/free-solid-svg-icons/faUser";
import { faUserNinja } from "@fortawesome/free-solid-svg-icons/faUserNinja";
import { faUserSecret } from "@fortawesome/free-solid-svg-icons/faUserSecret";
import { faListOl } from "@fortawesome/free-solid-svg-icons/faListOl";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons/faChevronLeft";
import { faChevronRight } from "@fortawesome/free-solid-svg-icons/faChevronRight";
import { faEdit } from "@fortawesome/free-solid-svg-icons/faEdit";
import { faLongArrowAltDown } from "@fortawesome/free-solid-svg-icons/faLongArrowAltDown";
import { faLongArrowAltUp } from "@fortawesome/free-solid-svg-icons/faLongArrowAltUp";
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
	    faComment,
	    faPlay,
	    faStop,
	    faUser,
	    faUserNinja,
	    faUserSecret,
	    faListOl,
	    faChevronLeft,
	    faChevronRight,
	    faEdit,
	    faLongArrowAltDown,
	    faLongArrowAltUp)

// Declare window objects
declare global {
	interface Window {React: any, ReactDOM: any}
	const io: any;
	const PiziChat: any;
}

// Share with pizi-chat
window.React = React
window.ReactDOM = ReactDOM

// Check if it's a standolone navigator (phone web app)
if(('standalone' in window.navigator) && ((window.navigator as any)['standalone'])) document.documentElement.classList.add("standalone")
ReactDOM.render(<App socket={io('/pizi-moins-de-neuf')}/>, document.getElementsByTagName("app")[0])