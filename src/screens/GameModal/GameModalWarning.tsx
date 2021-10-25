import { Modal } from 'pizi-react';
import React from 'react';

export interface GameModalWarningProps {
    open: boolean
    onClose: (action: string) => void
    onClosed: () => void
}

export const GameModalWarning: React.FC<GameModalWarningProps & React.HTMLAttributes<HTMLDivElement>> = ({
	open = false,
    onClose = () => null,
    onClosed = () => null
}) => {

    return  <Modal  className="warning-game-started"
                    open={open}
                    color="main"
                    appearance="simple"
                    type="confirm"
                    onClose={onClose}
                    onClosed={onClosed}>
                    <h3>Partie en cours!</h3>
                    <p>Vous pouvez rejoindre en tant que spectateur.
                    Une fois la manche terminée vous pourrez rejoindre la partie.
                    </p>
                    <p className="detail">(Votre score initial sera égal à la moyenne des scores des autres joueurs)</p>
            </Modal>
}