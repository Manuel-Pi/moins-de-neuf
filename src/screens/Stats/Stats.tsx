import React, {Component, useReducer } from 'react';
import { TextInput } from '../../components/Input/TextInput';
import { Rest } from '../../utils/Rest';
import { CreateClassName } from '../../utils/Utils';
import {Chart, RadialLinearScale, RadarController, PointElement, LineElement} from 'chart.js';
import { Table } from '../../components/Table/Table';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { PlayerModel } from '../../components/Player/PlayerModel';
import { AppScreenProps, Heading } from 'pizi-react';
Chart.register(RadarController, RadialLinearScale, PointElement, LineElement);

type StatsState = {
    currentScreen: string
    players: PlayerModel[]
    currentPlayer: PlayerModel
}

interface StatsProps extends AppScreenProps {
    className?: string
    token: any
    username: string
}

export class Stats extends Component<StatsProps, StatsState> {
    chart: Chart;

    constructor(props: StatsProps){
        super(props);
        this.state = {
            currentScreen: "users",
            currentPlayer: null,
            players: []
        }
    }

    componentDidMount(){
        var ctx = (document.getElementById('myChart') as HTMLCanvasElement ).getContext('2d');
        this.chart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Victoire', 'Style', 'Strategie', 'Regularite', 'Reactivite'],
                datasets: [{
                    data: [0, 0, 0, 0, 0],
                    label: "",
                    backgroundColor: "rgba(26, 163, 255, 0.3)",
                    borderColor: 'rgba(0, 138, 230, 1)',
                    borderWidth: 1,
                    pointBackgroundColor: "rgba(0, 107, 179, 0.8)",
                    pointBorderColor: "rgba(0, 107, 179, 0.8)",
                    pointRadius: 0
                }]
            },
            options: {
                
                scales: {
                    r: {
                        beginAtZero: true,
                        min: 0,
                        max: 6,
                        ticks: {
                            showLabelBackdrop: false,
                            stepSize: 2,
                            display: false
                        },
                        pointLabels: {
                            color: '#222',
                            font:{
                                size: 12,
                                
                            }
                        },
                        angleLines: {
                            color: "rgba(0, 0, 0, 0.2)"
                        },
                        grid: {
                            color: ["rgba(0, 0, 0, 0.1)", "rgba(0, 0, 0, 0.2)", "rgba(0, 0, 0, 0.3)"]
                        }
                    }
                },
                layout: {
                    padding: {
                        left: 0,
                        right: 0,
                        top: 4,
                        bottom: 4
                    }
                }
            }
        });
        Rest.get("/players").then(json => {
            if(json.message || !(json instanceof Array)) return;
            const players = json.map((player: any) => new PlayerModel({stats: player.stats, name: player.user}));
            players.sort((p1, p2) => p2.getStats().games.won - p1.getStats().games.won);
            this.setState({
                currentPlayer: players.filter(p => p.getName() === this.props.username)[0] || players[0],
                players,
                currentScreen: this.state.currentPlayer ? "user" : "users"
            }, () => {
                this.chart.data.datasets[0].data = this.getChartData();
                this.chart.update();
            });
        });
    }


    getChartData(){
        if(!this.state.currentPlayer) return [0,0,0,0,0];

        let victoireMax = 0;
        let rapiditeMax = 0;
        let regulariteMax = 0;
        let reactiviteMax = 0;
        let victoireMin = 0;
        let rapiditeMin = 0;
        let regulariteMin = 0;
        let reactiviteMin = 0;
        this.state.players.forEach(player => {
            victoireMax = Math.max(victoireMax, player.getStats().games.won);
            rapiditeMax = Math.max(rapiditeMax, player.getStats().moinsdeneuf.ratio);
            regulariteMax = Math.max(regulariteMax, player.getStats().games.ratio);
            reactiviteMax = Math.max(reactiviteMax, (player.getStats().quickplay.done - player.getStats().quickplay.taken));

            victoireMin = Math.min(victoireMin, player.getStats().games.won);
            rapiditeMin = Math.min(rapiditeMin, player.getStats().moinsdeneuf.ratio);
            regulariteMin = Math.min(regulariteMin, player.getStats().games.ratio);
            reactiviteMin = Math.min(reactiviteMin, (player.getStats().quickplay.done - player.getStats().quickplay.taken));
        });

        reactiviteMin = Math.max(0, reactiviteMin);

        const victoire = this.state.currentPlayer.getStats().games.won * 6 / victoireMax;
        const style = 4;
        const rapidite = this.state.currentPlayer.getStats().moinsdeneuf.ratio * 6 / (rapiditeMax - rapiditeMin);
        const regularite = this.state.currentPlayer.getStats().games.ratio * 6 / (regulariteMax - regulariteMin);
        const reactivite = Math.max(this.state.currentPlayer.getStats().quickplay.done - this.state.currentPlayer.getStats().quickplay.taken, 0) * 6 / (reactiviteMax - reactiviteMin);
        return [Math.max(victoire, 0.5), Math.max(style, 0.5), Math.max(rapidite, 0.5), Math.max(regularite, 0.5), Math.max(reactivite, 0.5)];
    }

    getUserScreen(){
        const stats = this.state.currentPlayer ? this.state.currentPlayer.getStats() : {
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
        };
        return  <div className="content user-screen">
                    <canvas id="myChart"></canvas>
                    <div className="stat-line">
                        <div className="stat1">
                            <h4>Parties</h4>
                            <Table header={["Jouées", "Gagnées", "Perdues", "Ratio"]} body={[[stats.games.played, stats.games.won, stats.games.lost, stats.games.ratio + "%"]]}/>
                        </div>
                        <div className="stat1">
                            <h4>Moins de neuf</h4>
                            <Table header={["Annoncés", "Gagnés", "Perdus", "Ratio"]} body={[[stats.moinsdeneuf.call, stats.moinsdeneuf.won, stats.moinsdeneuf.lost, stats.moinsdeneuf.ratio + "%" ]]}/>
                        </div>
                        <div className="stat1">
                            <h4>Jeu rapide</h4>
                            <Table header={["Réussis", "Pris"]} body={[[stats.quickplay.done, stats.quickplay.taken]]}/>
                        </div>
                        <div className="stat1">
                            <h4>Score</h4>
                            <Table header={["Max", "Min"]} body={[[stats.score.max, stats.score.min]]}/>
                        </div>
                        <div className="stat1">
                            <TextInput  className="disabled"
                                        initialValue={"0"}
                                        placeholder="Plus belle suite"/>
                        </div>
                        <div className="stat1">
                            <TextInput  className="disabled"
                                        initialValue={"0"}
                                        placeholder="0 cartes"/>
                        </div>  
                    </div>
                </div>
    }

    getUsersScreen(){
        return  <div className="content users-screen">
                    <Table  header={["Joueur", "Parties gagnées", "Parties jouées", "Parties perdues"]} 
                            body={this.state.players.map(player => [
                                player.getName(), 
                                player.getStats().games.won, 
                                player.getStats().games.played,
                                player.getStats().games.lost
                            ])}
                            selectable
                            onSelect={player => {
                                        if(!player) return;
                                        this.setState({
                                            currentPlayer: this.state.players.filter(p => p.getName() === player[0])[0],
                                            currentScreen: "user"
                                        }, () => {
                                            this.chart.data.datasets[0].data = this.getChartData();
                                            this.chart.update();
                                        })
                                    }}></Table>
                </div>
    }

    render(){

        const className = CreateClassName({
            "screen stats": true,
            [this.state.currentScreen]: true,
        }, this.props.className);

        return  <div className={className}>
                    <Heading tag="h1" appearance="simple" color="secondary">
                        Stats 
                        <div className="options">
                            <FontAwesomeIcon className={this.state.currentScreen === "users" ? "selected" : ""} icon="list-ol" onClick={() => this.setState({currentScreen: 'users'})}/>
                            <FontAwesomeIcon className={this.state.currentScreen === "user" ? "selected" : ""} icon="chart-bar" onClick={() => this.setState({currentScreen: 'user'})}/>
                        </div>
                    </Heading>
                    <Heading tag="h2" appearance="simple" color="secondary">
                        {this.state.currentScreen === "users" ? <><FontAwesomeIcon icon="users"/>Classement</> : <><FontAwesomeIcon icon="user"/>{this.state.currentPlayer && this.state.currentPlayer.getName()}</>}
                    </Heading>
                    {this.getUserScreen()}
                    {this.getUsersScreen()}
                </div>
    }
}

/* 

Victoire: game.won
Regularite: game.ratio
Reactivite: quickPlay.done - quickPlay.taken
Rapidite: temps
*/