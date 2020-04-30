import React, { useState, useEffect, CSSProperties } from 'react';
import { Logo } from '../Logo/Logo';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { CreateClassName } from '../Utils/Utils';

type MenuProps = {
    username: string
    onAction?: (data:any) => void
    open?: boolean
}

export const Menu = ({username, onAction, open = false}:MenuProps) => {

    const menuClassName = CreateClassName({
        "menu": true,
        "active": open
    });

    const toggle = () => {
        onAction && onAction({toggle: true});
    }

    return  <div className="menu-bar">
                <Logo/>
                <span className="name">{username}</span>
                <FontAwesomeIcon icon="bars" className="menu-button" onClick={ event => toggle()}/>
            </div>
}