import React, { useState } from 'react';
import { CreateClassName } from '../../utils/Utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

type ModalProps = {
    className?: string
    children: any,
    onClose: () => void
    onConfirm?: () => void
    fullScreen?: boolean
    type?: "confirm" | "alert" | "info"
}

export const Modal = ({ className = "", children, onClose, onConfirm, fullScreen = false, type = null}: ModalProps) => {
    const[open, setOpen] = useState(true);


    const close = () => {
        setOpen(false);
        setTimeout( () => {
            onClose();
        }, type ? 600 : 180);
    }

    const confirm = () => {
        setOpen(false);
        setTimeout( () => {
            onConfirm();
        }, type ? 600 : 180);
    }

    const buttons = type ?  <div className="buttons">
                                    {type === 'confirm' ? <button onClick={e => confirm()}>Confirmer</button> : null}
                                    <button className="cancel" onClick={e => close()}>{type === 'alert' ? "Ok" : "Annuler"}</button>
                                </div> : null; 

return  <div className={ CreateClassName({
                            "modal": true,
                            "open": open,
                            "fullscreen": fullScreen,
                            [type]: type
                        }, className)}>
                <div className="modal-container">
                    <div className={CreateClassName({
                                        "modal-content": true,
                                        "animate__animated": true,
                                        "animate__bounceIn": type && open,
                                        "animate__zoomIn": !type && open,
                                        "animate__zoomOut": !type && !open,
                                        "animate__bounceOut": type && !open
                                    })}>
                        {!type ? <FontAwesomeIcon icon="times" onClick={e => close()}/> : null}
                        {children}
                        {buttons}
                    </div>
                </div>
            </div>
};