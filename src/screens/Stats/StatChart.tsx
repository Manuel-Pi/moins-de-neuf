import { Spinner } from 'pizi-react'
import React, { useEffect, useRef, useState } from 'react'
import { PlayerModel } from '../../models/PlayerModel'
import { PlayerStatsModel } from '../../models/PlayerStatsModel'


export interface StatChartProps {
    players: PlayerModel[]
    currentPlayer: PlayerModel
}

export const StatChart: React.FC<StatChartProps & React.HTMLAttributes<HTMLDivElement>> = ({
	players = null,
    currentPlayer = null
}) => {

    const [chart, setChart] = useState(null)
    const canevaRef = useRef(null)

    const getChartData = () => {
        if(!players || !currentPlayer) return [0,0,0,0,0]

        let victoireMax = 0
        let rapiditeMax = 0
        let regulariteMax = 0
        let reactiviteMax = 0
        let victoireMin = 0
        let rapiditeMin = 0
        let regulariteMin = 0
        let reactiviteMin = 0
        let styleMin = 0
        let styleMax = 0
        players.forEach(player => {
            const stats = new PlayerStatsModel(player.getStats())
            victoireMax = Math.max(victoireMax, stats.games.won)
            rapiditeMax = Math.max(rapiditeMax, stats.getRatio("moinsdeneuf"))
            regulariteMax = Math.max(regulariteMax, stats.getRatio("games"))
            reactiviteMax = Math.max(reactiviteMax, stats.quickplay.done - stats.quickplay.taken)
            victoireMin = Math.min(victoireMin, stats.games.won)
            rapiditeMin = Math.min(rapiditeMin, stats.getRatio("moinsdeneuf"))
            regulariteMin = Math.min(regulariteMin, stats.getRatio("games"))
            reactiviteMin = Math.min(reactiviteMin, (stats.quickplay.done - stats.quickplay.taken))
            const currentStyle = (stats.moinsdeneuf.won + stats.quickplay.done) / ((stats.games.won + stats.games.lost) || 1)
            styleMin = Math.min(styleMin, currentStyle)
            styleMax = Math.max(styleMax, currentStyle)
            console.log("style max " + player.getName() + ": " + styleMax)
        })

        reactiviteMin = Math.max(0, reactiviteMin)
        const currentPlayerstats = new PlayerStatsModel(currentPlayer.getStats())
        const victoire = currentPlayerstats.games.won * 6 / victoireMax
        const style = ((currentPlayerstats.moinsdeneuf.won + currentPlayerstats.quickplay.done) / (currentPlayerstats.games.won + currentPlayerstats.games.lost)) * 6 / (styleMax - styleMin)
        console.log("style: " + style)
        console.log("style: " + ((currentPlayerstats.moinsdeneuf.won + currentPlayerstats.quickplay.done) / (currentPlayerstats.games.won + currentPlayerstats.games.lost)) )
        const rapidite = currentPlayerstats.getRatio("moinsdeneuf") * 6 / (rapiditeMax - rapiditeMin)
        const regularite = currentPlayerstats.getRatio("games") * 6 / (regulariteMax - regulariteMin)
        const reactivite = Math.max(currentPlayerstats.quickplay.done - currentPlayerstats.quickplay.taken, 0) * 6 / (reactiviteMax - reactiviteMin)
        return [Math.max(victoire, 0.5), Math.max(style, 0.5), Math.max(rapidite, 0.5), Math.max(regularite, 0.5), Math.max(reactivite, 0.5)]
    }

    useEffect(() => {
        if(!canevaRef.current) return
        import(/* webpackChunkName: "chartjs" */'chart.js').then(({Chart, RadialLinearScale, RadarController, PointElement, LineElement, Filler}) => {
            Chart.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler)
            setChart(new Chart(canevaRef.current.getContext('2d'), {
                type: 'radar',
                data: {
                    labels: ['Victoire', 'Style', 'Strategie', 'Regularite', 'Reactivite'],
                    datasets: [{
                        data: getChartData(),
                        label: "",
                        fill: true,
                        backgroundColor: "rgba(26, 163, 255, 0.3)",
                        borderColor: 'rgba(0, 138, 230, 1)',
                        borderWidth: 2,
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
                                    weight: 'bold'
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
            }))
        })
    }, [])

    useEffect(() => {
        if(!chart || !players || !currentPlayer) return 
        chart.data.datasets[0].data = getChartData()
        chart.update()
    }, [players, currentPlayer])

    return  <div className="stat-chart">
                {!chart && <Spinner type="spinner" label="chargement"/>}
                <canvas ref={canevaRef}></canvas>
            </div>
}