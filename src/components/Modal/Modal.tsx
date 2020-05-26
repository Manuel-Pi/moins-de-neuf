import React, { useState } from 'react';
import { CreateClassName } from '../../utils/Utils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

type ModalProps = {
    className?: string
    children: any,
    onClose: () => void,
    fullScreen?: boolean
}

export const Modal = ({ className = "", children, onClose, fullScreen = false}: ModalProps) => {
    const[open, setOpen] = useState(true);

    const modalClassName = CreateClassName({
        "modal": true,
        "open": open,
        "fullscreen": fullScreen
    }, className);

    return  <div className={modalClassName}>
                <div className="modal-container">
                    <FontAwesomeIcon icon="times" onClick={e => onClose()}/>
                    <div className="modal-content">
                        {children}
                    </div>
                </div>
            </div>
};