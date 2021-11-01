import React, {Component} from 'react'
import { PiziRest } from '../../utils/PiziServer'
import { PlayerModel } from '../../models/PlayerModel'
import { AppScreenProps, Heading, Table, Tabs, Tab, Breakpoint, ListInput } from 'pizi-react'
import { StatChart } from './StatChart'

type StatsState = {
    players: PlayerModel[]
    currentPlayer: PlayerModel
    statsSelection: "games" | "lessThanNine"
}

interface StatsProps extends AppScreenProps {
    token: any
    username: string
    breakpoint?: Breakpoint
}

export class Stats extends Component<StatsProps, StatsState> {
    chart: Chart;

    constructor(props: StatsProps){
        super(props)
        this.state = {
            currentPlayer: null,
            players: [],
            statsSelection: "games"
        }
    }

    componentDidMount(){
        PiziRest.get("players").then(json => {
            if(json.message || !(json instanceof Array)) return
            const players = json.map((player: any) => new PlayerModel({stats: player.stats, name: player.user}))
            players.sort((p1, p2) => p2.getStats().games.won - p1.getStats().games.won)
            this.setState({
                currentPlayer: players.filter(p => p.getName() === this.props.username)[0] || players[0],
                players
            })
        })
    }

    shouldComponentUpdate(nextProps: StatsProps, nextState: StatsState){
        if(nextState.players !== this.state.players 
        || nextState.statsSelection !== this.state.statsSelection
        || nextState.currentPlayer !== this.state.currentPlayer
        || nextProps.breakpoint !== this.props.breakpoint){
            return true
        }
        return false
    }

    getPlayersStats(){
        switch(this.state.statsSelection){
            case "games":
                return {
                    header: ["", "Ratio", "Gagnée", "Perdue"],
                    data: this.state.players.map(player => [
                        player.getName(),
                        this.getRatio(player.getStats().games.ratio),
                        player.getStats().games.won,
                        player.getStats().games.lost
                    ]),
                    order: {direction:"up", header:"Ratio"}
                }
            case "lessThanNine":
                return {
                    header: ["", "Ratio", "Gagné", "Perdu"],
                    data: this.state.players.map(player => [
                        player.getName(),
                        this.getRatio(player.getStats().moinsdeneuf.ratio),
                        player.getStats().moinsdeneuf.won,
                        player.getStats().moinsdeneuf.lost
                    ]),
                    order: {direction:"up", header:"Ratio"}
                }
        }
    }

    getPlayerStats(){
        return this.state.currentPlayer ? this.state.currentPlayer.getStats() : {
            games: {
                won: 0,
                lost: 0,
                played: 0,
                ratio: 0
            },
            moinsdeneuf: {
                call: 0,
                won: 0,
                lost: 0,
                ratio: 0
            },
            quickplay: {
                done: 0,
                taken: 0
            },
            score: {
                min: 0,
                max: 0
            }
        }
    }

    getRatio(ratio: number = 0){
        return (ratio / 100).toFixed(2)
    }

    render(){
        const stats: any = this.getPlayersStats()
        const stat: any = this.getPlayerStats()
        return  <div className={"screen stats"}>
                    <Heading tag="h1" appearance="simple" color="secondary">Stats </Heading>
                    <Tabs appearance="simple" color="secondary">
                        <Tab title="Général" className="users-stats">
                            <ListInput values={[{label: "Parties", value: "games"}, {label: "Moins de neuf", value: "lessThanNine"}]} 
                                defaultValue={this.state.statsSelection}
                                appearance="alt" 
                                size={this.props.breakpoint === "xs" ? "medium" : "large"}
                                onChange={(statsSelection: any) => this.setState({statsSelection})}/>
                            <Table  header={stats.header} 
                                    defaultOrder={stats.order}
                                    data={stats.data}
                                    staticHeader
                                    sortIcon={this.props.breakpoint === "xs" ? "small" : "default"}
                                    selectable/>
                        </Tab>  
                        <Tab title="Joueur">
                            <div className="user-screen">
                                <ListInput values={this.state.players?.map(player => player.getName())} 
                                    defaultValue={this.state.currentPlayer?.getName()}
                                    appearance="alt" 
                                    size={this.props.breakpoint === "xs" ? "medium" : "large"}
                                    onChange={(pName: any) => this.setState({currentPlayer: this.state.players.filter(player => player.getName() === pName)[0]})}/>
                                <StatChart players={this.state.players} currentPlayer={this.state.currentPlayer}/>
                                <div className="stat-line">
                                    <div className="stat1">
                                        <Heading tag="h4" appearance="simple" color="secondary">Parties</Heading>
                                        <Table header={["Jouées", "Gagnées", "Perdues", "Ratio"]} data={[[stat.games.played, stat.games.won, stat.games.lost, this.getRatio(stat.games.ratio)]]}/>
                                    </div>
                                    <div className="stat1">
                                        <Heading tag="h4" appearance="simple" color="secondary">Moins de neuf</Heading>
                                        <Table header={["Annoncés", "Gagnés", "Perdus", "Ratio"]} data={[[stat.moinsdeneuf.call, stat.moinsdeneuf.won, stat.moinsdeneuf.lost, this.getRatio(stat.moinsdeneuf.ratio)]]}/>
                                    </div>
                                    <div className="stat1">
                                        <Heading tag="h4" appearance="simple" color="secondary">Jeu rapide</Heading>
                                        <Table header={["Réussis", "Pris"]} data={[[stat.quickplay.done, stat.quickplay.taken]]}/>
                                    </div>
                                    <div className="stat1">
                                        <Heading tag="h4" appearance="simple" color="secondary">Score</Heading>
                                        <Table header={["Max", "Min"]} data={[[stat.score.max, stat.score.min]]}/>
                                    </div>
                                    {/* <div className="stat1">
                                        <Heading tag="h4" appearance="simple" color="secondary">Plus belle suite</Heading>
                                        <TextInput  className="disabled"
                                                    initialValue={"0"}
                                                    placeholder="Plus belle suite"/>
                                    </div>
                                    <div className="stat1">
                                        <Heading tag="h4" appearance="simple" color="secondary">Fin avec 0 cartes</Heading>
                                        <TextInput  className="disabled"
                                                    initialValue={"0"}
                                                    placeholder="0 cartes"/>
                                    </div>   */}
                                </div>
                            </div>
                        </Tab>  
                    </Tabs>
                </div>
    }
}