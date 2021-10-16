import { Modal, TextInput, NumberInput, ListInput, Switch, Table, Heading} from 'pizi-react';
import React, { useState } from 'react';
import {Tab} from 'pizi-react';
import { GameInfo, GameModel } from '../GameBoard/GameModel';
import { Score } from '../../components/Player/Score';

export interface GameModalProps {
	onClose: (gameInfos: GameInfo) => void
    type: "create" | "info" 
    open?: boolean
    game?: GameModel
    fullScreen?: boolean
}

const DEFAULT_GAME: GameInfo = {
    name: "",
    minPlayer: 3,
    maxPlayer: 6,
    bots: 0,
    allowQuickPlay: true,
    allowStreak: true,
    onlyOneWinnerStreak: true,
    allowWinEquality: false,
    bonusMultiple50: true,
    playerKickTimeout: "5min",
    gameKickTimeout: "1h",
    gameEndScore: 200,
    gameEndTime: "Infini"
}

export const GameModal: React.FC<GameModalProps & React.HTMLAttributes<HTMLDivElement>> = ({
	onClose = () => null,
    type = "create",
    game,
    open = true,
    fullScreen = false
}) => {

    const [gameInfo, setGameInfo] = useState(type === "info" && game ? game.getConf() : DEFAULT_GAME);
    const [hasError, setHasError] = useState(false);
    
    const isInfo = type === "info";

    const updateGameInfo = (valueName: string) => (value: any) => setGameInfo((gameInfo) => ({
        ...gameInfo,
        [valueName]: value
    }))

    return  <Modal  open={open} 
                    appearance="simple"
                    type={isInfo ? "info" : "confirm"}
                    closeButton={isInfo}
                    color="main"  
                    confirmButtonDisabled={() => hasError}
                    onClose={(action) => onClose(action === "confirm" ? gameInfo : null)}
                    header={!isInfo ? "Nouvelle Partie" : "Infos"}
                    fullScreen={fullScreen}>
                <Tab title={"Général"} default>
                    <TextInput  label="Nom"
                                autoFocus
                                color="main"
                                readOnly={isInfo}
                                defaultValue={gameInfo.name}
                                valdationRegex={/^\w+( \w+)*$/}
                                valdationMessage="Nom de partie obligatoire (min 4 charactères)"
                                onError={(error) => setHasError(error)}
                                onChange={updateGameInfo("name")}/> 

                    <NumberInput    label="Joueurs minimum"
                                    defaultValue={gameInfo.minPlayer}
                                    readOnly={isInfo} 
                                    min={1}    
                                    max={gameInfo.maxPlayer}
                                    onChange={updateGameInfo("minPlayer")}/>

                    <NumberInput    label="Joueurs maximum"
                                    defaultValue={gameInfo.maxPlayer}
                                    readOnly={isInfo}
                                    min={1}
                                    max={7}
                                    onChange={updateGameInfo("maxPlayer")}/>

                    <NumberInput    label="Bots"
                                    key={(() => (gameInfo.maxPlayer - 1))()}
                                    defaultValue={gameInfo.bots}
                                    readOnly={isInfo}
                                    min={0}
                                    max={(() => (gameInfo.maxPlayer - 1))()}
                                    onChange={updateGameInfo("bots")}/>

                    <Heading tag="h3" appearance="simple">Fin de partie</Heading>

                    <NumberInput    label="Score"
                                    defaultValue={gameInfo.gameEndScore}
                                    readOnly={isInfo}
                                    min={-100}
                                    max={1000}
                                    step={50}
                                    onChange={updateGameInfo("gameEndScore")}/>

                    <ListInput      label="Durée"
                                    type="horizontal"
                                    readOnly={isInfo}
                                    defaultValue={gameInfo.gameEndTime}
                                    values={["30s", "10min", "15min", "20min", "30min", "45min", "1h", "Infini"]}
                                    onChange={updateGameInfo("gameEndTime")}/>

                    <Heading tag="h3" appearance="simple">Timeouts</Heading>

                    <ListInput      label="Joueurs"
                                    type="horizontal"
                                    defaultValue={gameInfo.playerKickTimeout}
                                    values={["30s", "1min", "2min", "5min", "10min", "30min", "Infini"]}
                                    onChange={updateGameInfo("playerKickTimeout")}
                                    readOnly={isInfo}/>

                    <ListInput      label="Partie"
                                    type="horizontal"
                                    defaultValue={gameInfo.gameKickTimeout}
                                    values={["2min", "5min", "10min", "30min", "1h", "Infini"]}
                                    onChange={updateGameInfo("gameKickTimeout")}
                                    readOnly={isInfo}/>
                </Tab>
                <Tab title="Règles">
                    <Switch label="Jeux rapide"
                            defaultValue={gameInfo.allowQuickPlay}
                            onChange={updateGameInfo("allowQuickPlay")}
                            readOnly={isInfo}/>

                    <Switch label="Avec étoiles"
                            defaultValue={gameInfo.allowStreak}
                            onChange={updateGameInfo("allowStreak")}
                            readOnly={isInfo}/>

                    <Switch label="Étoile seulement si 1 gagnant"
                            defaultValue={gameInfo.onlyOneWinnerStreak}
                            onChange={updateGameInfo("onlyOneWinnerStreak")}
                            readOnly={isInfo}/>

                    <Switch label="-50 sur les multiple de 50"
                            defaultValue={gameInfo.bonusMultiple50}
                            onChange={updateGameInfo("bonusMultiple50")}
                            readOnly={isInfo}/>

                    <Switch label="Autoriser égalité"
                            defaultValue={gameInfo.allowWinEquality}
                            onChange={updateGameInfo("allowWinEquality")}
                            readOnly={isInfo}/>
                </Tab>
                <Tab title="Joueurs" display={isInfo}>
                    {
                        isInfo && !!game && <Table  appearance="simple"
                                                    className={"players-info"}
                                                    header={["#", "Pseudo", "Score"]} 
                                                    data={game.getPlayerModels().map((player, index) => [index + 1, player.getName(), <Score score={player.getScore()} scoreStreak={player.getScoreStreak()}/>])}
                                                    sort={{
                                                        Score: (a, b) => a.props.score > b.props.score ? 1 : a.props.score < b.props.score ? -1 : 0
                                                    }}/>
                    }
                </Tab>
            </Modal>
}