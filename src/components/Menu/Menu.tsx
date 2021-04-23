import React, { useState, useEffect, CSSProperties } from 'react';
import { Logo } from '../Logo/Logo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CreateClassName } from '../../Utils/Utils';
import { SCREEN } from '../../App';

type MenuProps = {
    className: string
    username: string
    onClick?: (data:any) => void
    onDoubleClick?: () => void
    currentGame: string
    currentScreen: SCREEN
    onDisconnect: () => void
    onQuit: (closeMenu: () => void) => void
}

export const Menu = ({username, onClick, className = "", currentGame = null, currentScreen = null, onDisconnect, onQuit, onDoubleClick}:MenuProps) => {

    const [open, setOpen] = useState(false);
    const [closeAnimation, setCloseAnimation] = useState(false);

    const menuClassName = CreateClassName({
        "menu": true,
        "active": open,
        "has-current-game": !!currentGame,
        "animate__animated": true,
        "animate__fadeInRight": open,
        "animate__fadeOutRight": closeAnimation
    });

    const clickHandler = (screen: SCREEN) => {
        toggle(false);
        onClick(screen);
    }

    const toggle = (force: boolean, callback?: () => void) => {
        let toggle = force !== undefined ? force : !open;
        if(!toggle){
            setCloseAnimation(true);
            setTimeout(() => {
                setOpen(false);
                callback && callback();
                setCloseAnimation(false);
            }, 180);
        } else {
            setOpen(true);
            callback && callback();
        }
    }

    const quitWrapper = () => {
        if(!onQuit) return;
        onQuit(() => toggle(false));
    };

    const gameDisplayed = currentScreen === SCREEN.GAME && !open;

    onDisconnect = onDisconnect || (() => null);

    return  <div className={"menu-bar " + className} onDoubleClick={ e => onDoubleClick && onDoubleClick()}>
                <Logo/>
                <div className="title">
                    {!gameDisplayed && <FontAwesomeIcon icon={gameDisplayed ? "play" : "user"}/>}
                    <div>
                        <span>{gameDisplayed ? "partie" : "user"}</span>
                        <div>{gameDisplayed ? currentGame : username}</div>
                    </div>
                </div>
                <FontAwesomeIcon icon="bars" className="menu-button" onClick={ e => toggle(!open)}/>
                <div className={menuClassName}>
                    <div className="current-game" >
                        <div className="current-info">
                            <div className="label">Partie en cours</div>
                            <div className="game-name" >{currentGame}</div>
                        </div>
                        <span onClick={e => quitWrapper()}>
                            <span>Quitter</span>
                            <FontAwesomeIcon icon="stop"/>
                        </span>
                        <span onClick={e => {clickHandler(SCREEN.GAME)}}>
                            <span>Reprendre</span>
                            <FontAwesomeIcon className="animate__animated animate__pulse" icon="play"/>
                        </span>
                    </div>
                    <div className="general">
                        <div className="menu-lobby" onClick={e => clickHandler(SCREEN.LOBBY)}>
                            <FontAwesomeIcon icon="list"/>
                            <span>PARTIES</span>
                        </div>
                        <div onClick={e => clickHandler(SCREEN.PLAYERS)}>
                            <FontAwesomeIcon icon="users"/>
                            <span>JOUEURS</span>
                        </div>
                        <div className={""} onClick={e => clickHandler(SCREEN.STATS)}>
                            <FontAwesomeIcon icon="chart-bar"/>
                            <span>STATS</span>
                        </div>
                        <div className={""} onClick={e => clickHandler(SCREEN.ACCOUNT)}>
                            <FontAwesomeIcon icon="user-cog"/>
                            <span>COMPTE</span>
                        </div>
                    </div>
                    <FontAwesomeIcon className="disconnect" icon="power-off" onClick={e => onDisconnect()}/>
                </div>
            </div>
}