import React from 'react';
import glb_sv from '../../utils/globalSv/service/global_service'
import { Chart } from "react-google-charts";
import commuChanel from '../../constants/commChanel'

class ChartIntraday extends React.PureComponent {
    constructor(props) {
        super(props);
        this.component = this.props.component
        this.get_value_from_glb_sv_seq = this.props.get_value_from_glb_sv_seq
        this.req_component = this.props.req_component

        this.GET_MORE_EPMSG = 'GET_MORE_EPMSG'
        this.state = {
            stkInfoMatchingChart: [],
            line_ChartOptions: {
                areaOpacity: 0.7,
                bar: { groupWidth: '1%' },
                legend: 'none',
                // seriesType: { type: "line", targetAxisIndex: 0 },
                series: {
                    0: { type: 'line', targetAxisIndex: 1, lineWidth: 1 }, 1: { type: 'bars', targetAxisIndex: 0, groupWidth: '1%' },
                    2: { type: 'line', targetAxisIndex: 1, lineWidth: 0.6, tooltip: false }
                },
                hAxis: {
                    // title: 'Time',
                    textStyle: {
                        color: 'white',
                        fontSize: 7,
                        bold: false
                    },
                    gridlines: {
                        color: '#281B0D',
                        count: 7
                    },
                    minValue: [9, 0, 0],
                    maxValue: [15, 0, 0],
                    viewWindow: {
                        min: [9, 0, 0],
                        max: [15, 0, 0]
                    },
                    format: 'H:mm'
                },
                vAxes: {
                    1: {
                        textStyle: {
                            color: 'white',
                            fontSize: 7,
                            bold: false
                        },
                        gridlines: {
                            color: '#281B0D',
                            count: 3
                        }
                    },
                    0: {
                        textStyle: {
                            color: 'white',
                            fontSize: 7,
                            bold: false
                        },
                        gridlines: {
                            color: '#281B0D',
                            count: 3
                        },
                        minValue: 0,
                        format: 'short'
                    },
                    2: {
                        textStyle: {
                            color: 'white',
                            fontSize: 7,
                            bold: false
                        },
                        gridlines: {
                            color: '#281B0D',
                            count: 1
                        },
                        minValue: 0,
                        format: 'short'
                    }
                },
                crosshair: {
                    trigger: 'both',
                    color: 'red',
                    orientation: 'vertical'
                },
                colors: ['#F57F17', '#84FFFF', '#F8F093'],
                focusTarget: 'category',
                backgroundColor: '#222',
                chartArea: { backgroundColor: '#0d1719' }
            }
            // line_ChartOptions: {
            //     areaOpacity: 0.7,
            //     bar: { groupWidth: '1%' },
            //     legend: 'none',
            //     series: {
            //         0: { type: 'line', targetAxisIndex: 1, lineWidth: 1 }, 1: { type: 'bars', targetAxisIndex: 0 },
            //         2: { type: 'line', targetAxisIndex: 1, lineWidth: 1 }
            //     },
            //     hAxis: {
            //         // title: 'Time',
            //         textStyle: {
            //             // color: (this.props.themePage === 'dark-theme' ? 'white' : 'var(--text__main_dark)'),
            //             fontSize: 9,
            //             bold: false
            //         },
            //         gridlines: {
            //             // color: this.props.style[this.props.themePage].chartOverView.colorGrid,
            //             count: 7
            //         },
            //         minValue: [9, 0, 0],
            //         maxValue: [15, 0, 0],
            //         viewWindow: {
            //             min: [9, 0, 0],
            //             max: [15, 0, 0]
            //         },
            //         format: 'H:mm'
            //     },
            //     vAxes: {
            //         1: {
            //             textStyle: {
            //                 // color: (this.props.themePage === 'dark-theme' || this.props.themePage === 'dark-theme-china' ? 'white' : 'var(--text__main_dark)'),
            //                 fontSize: 7,
            //                 bold: false
            //             },
            //             gridlines: {
            //                 // color: this.props.style[this.props.themePage].chartOverView.colorGrid,
            //                 count: 3
            //             },
            //             minValue: 0
            //         },
            //         0: {
            //             textStyle: {
            //                 // color: (this.props.themePage === 'dark-theme' || this.props.themePage === 'dark-theme-china' ? 'white' : '#1C172F'),
            //                 // color: (this.props.themePage === 'dark-theme' || this.props.themePage === 'dark-theme-china' ? 'white' : 'var(--text__main_dark)'),
            //                 fontSize: 7,
            //                 bold: false
            //             },
            //             gridlines: {
            //                 // color: this.props.style[this.props.themePage].chartOverView.colorGrid,
            //                 count: 5
            //             },
            //             minValue: this.props.t333,
            //             maxValue: this.props.t332,
            //             viewWindow: {
            //                 min: this.props.t333,
            //                 max: this.props.t332
            //             },
            //             format: 'short'
            //         },
            //         2: {
            //             textStyle: {
            //                 color: (this.props.themePage === 'dark-theme' || this.props.themePage === 'dark-theme-china' ? 'white' : 'var(--text__main_dark)'),
            //                 fontSize: 7,
            //                 bold: false
            //             },
            //             gridlines: {
            //                 color: this.props.style[this.props.themePage].chartOverView.colorGrid,
            //                 count: 1
            //             },
            //             minValue: 0,
            //             format: 'short'
            //         }
            //     },
            //     crosshair: {
            //         trigger: 'both',
            //         color: 'red',
            //         orientation: 'vertical'
            //     },
            //     colors: [this.props.style[this.props.themePage].chartOverView.colorIndex, this.props.style[this.props.themePage].chartOverView.colorVolume, this.props.style[this.props.themePage].chartOverView.colorRef],
            //     focusTarget: 'category',
            //     backgroundColor: 'var(--third__table__background)',
            //     chartArea: { backgroundColor: 'var(--third__table__background)', 'width': '82%', 'height': '82%' }
            // }
        }
        this.chartType = 'ComboChart';
    }


    componentDidMount() {
        const dataMatching = [
            ["Time", "Price", "Volume", "Ref"],
            [[9, 0, 0], 0, 0, 0],
            [[15, 0, 0], 0, 0, 0]
        ];

        window.ipcRenderer.on(`${commuChanel.event_ServerPushMRKRcvChangeEpMsg}_${this.component}`, (event, message) => {
            if (message === this.props.itemName) {
                const sq = this.get_value_from_glb_sv_seq()
                window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: 'autionMatch_timePriceSumVol_chart_Map', sq: sq })
                window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, agrs) => {
                    const dataChart = agrs.get(this.props.itemName);
                    const stkInfoMatchingChart = dataChart ? [...dataChart] : dataMatching;
                    const last_trading_day = [[15, 0, 0], null, null, this.props.t260 ? this.props.t260 : 0];
                    if (dataChart !== undefined) {
                        stkInfoMatchingChart.push(last_trading_day);
                    }
                    if (stkInfoMatchingChart && stkInfoMatchingChart.length === 0) {
                        this.setState({ stkInfoMatchingChart: 'no_data' });
                        return;
                    }
                    stkInfoMatchingChart.forEach(item => {
                        if (item[3] !== 'Ref') {
                            item[3] = this.props.t260;
                        }
                    });
                    this.setState({ stkInfoMatchingChart });
                })

            }
        })

        window.ipcRenderer.on(`${commuChanel.event_FinishGetMrkInfo}_${this.component}`, (event, agrs) => {
            // console.log(glb_sv.getReqInfoMapValue(message))
            console.log(agrs, this.component)
            const message = agrs['message']
            const reqInfoMap = agrs['reqInfoMap']
            if (reqInfoMap === null || reqInfoMap === undefined) { return; }
            if (reqInfoMap.reqFunct === this.GET_MORE_EPMSG) {

                const sq = this.get_value_from_glb_sv_seq()
                window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: 'autionMatch_timePriceSumVol_chart_Map', sq: sq })
                window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, agrs) => {

                    const dataChart = agrs.get(this.props.itemName);
                    let stkInfoMatchingChart = dataChart ? [...dataChart] : dataMatching;

                    const last_trading_day = [[15, 0, 0], null, null, this.props.t260 ? this.props.t260 : 0];
                    if (dataChart !== undefined) {
                        stkInfoMatchingChart.push(last_trading_day);
                    }
                    // console.log(stkInfoMatchingChart);
                    if (stkInfoMatchingChart && stkInfoMatchingChart.length === 0) {
                        this.setState({ stkInfoMatchingChart: 'no_data' });
                        return;
                    }
                    stkInfoMatchingChart.forEach(item => {
                        if (item[3] !== 'Ref') {
                            item[3] = this.props.t260;
                        }
                    });
                    // console.log(stkInfoMatchingChart);
                    this.setState({ stkInfoMatchingChart });
                })


            }
        })
        window.ipcRenderer.on(`${commuChanel.RESET_CHART_INTRADAY}_${this.component}`, (event, agrs) => {
            this.setState({ stkInfoMatchingChart: [] })
        })

        window.ipcRenderer.on(`${commuChanel.CHANGE_THEME}_${this.component}`, (event, msg) => {
            const sq = this.get_value_from_glb_sv_seq()
            window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: ['themePage', 'style'], sq: sq })
            window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, agrs) => {
                const style = agrs.get('style')
                const themePage = agrs.get('themePage')

                const line_ChartOptions = {
                    areaOpacity: 0.7,
                    bar: { groupWidth: '1%' },
                    legend: 'none',
                    // seriesType: { type: "line", targetAxisIndex: 0 },
                    series: {
                        0: { type: 'line', targetAxisIndex: 1, lineWidth: 1 }, 1: { type: 'bars', targetAxisIndex: 0, groupWidth: '1%' },
                        2: { type: 'line', targetAxisIndex: 1, lineWidth: 0.6, tooltip: false }
                    },
                    hAxis: {
                        // title: 'Time',
                        textStyle: {
                            color: 'white',
                            fontSize: 7,
                            bold: false
                        },
                        gridlines: {
                            color: '#281B0D',
                            count: 7
                        },
                        minValue: [9, 0, 0],
                        maxValue: [15, 0, 0],
                        viewWindow: {
                            min: [9, 0, 0],
                            max: [15, 0, 0]
                        },
                        format: 'H:mm'
                    },
                    vAxes: {
                        1: {
                            textStyle: {
                                color: 'white',
                                fontSize: 7,
                                bold: false
                            },
                            gridlines: {
                                color: '#281B0D',
                                count: 3
                            }
                        },
                        0: {
                            textStyle: {
                                color: 'white',
                                fontSize: 7,
                                bold: false
                            },
                            gridlines: {
                                color: '#281B0D',
                                count: 3
                            },
                            minValue: 0,
                            format: 'short'
                        },
                        2: {
                            textStyle: {
                                color: 'white',
                                fontSize: 7,
                                bold: false
                            },
                            gridlines: {
                                color: '#281B0D',
                                count: 1
                            },
                            minValue: 0,
                            format: 'short'
                        }
                    },
                    crosshair: {
                        trigger: 'both',
                        color: 'red',
                        orientation: 'vertical'
                    },
                    colors: ['#F57F17', '#84FFFF', '#F8F093'],
                    focusTarget: 'category',
                    backgroundColor: '#222',
                    chartArea: { backgroundColor: 'black' }
                };
                this.setState({ line_ChartOptions });

            })

        })
    }

    componentWillReceiveProps(newProps) {
        if (newProps.t332 !== this.props.t332) {
            const line_ChartOptions = {
                areaOpacity: 0.7,
                bar: { groupWidth: '1%' },
                legend: 'none',
                series: {
                    0: { type: 'line', targetAxisIndex: 1, lineWidth: 1 }, 1: { type: 'bars', targetAxisIndex: 0 },
                    2: { type: 'line', targetAxisIndex: 1, lineWidth: 1 }
                },
                hAxis: {
                    // title: 'Time',
                    textStyle: {
                        color: (this.props.themePage === 'dark-theme' ? 'white' : 'var(--text__main_dark)'),
                        fontSize: 9,
                        bold: false
                    },
                    gridlines: {
                        color: this.props.style[this.props.themePage].chartOverView.colorGrid,
                        count: 7
                    },
                    minValue: [9, 0, 0],
                    maxValue: [15, 0, 0],
                    viewWindow: {
                        min: [9, 0, 0],
                        max: [15, 0, 0]
                    },
                    format: 'H:mm'
                },
                vAxes: {
                    1: {
                        textStyle: {
                            color: (this.props.themePage === 'dark-theme' || this.props.themePage === 'dark-theme-china' ? 'white' : 'var(--text__main_dark)'),
                            fontSize: 9,
                            bold: false
                        },
                        gridlines: {
                            color: this.props.style[this.props.themePage].chartOverView.colorGrid,
                            count: 3
                        },
                        minValue: newProps.t333,
                        maxValue: newProps.t332,
                        viewWindow: {
                            min: newProps.t333,
                            max: newProps.t332
                        },
                    },
                    0: {
                        textStyle: {
                            color: (this.props.themePage === 'dark-theme' || this.props.themePage === 'dark-theme-china' ? 'white' : 'var(--text__main_dark)'),
                            fontSize: 9,
                            bold: false
                        },
                        gridlines: {
                            color: this.props.style[this.props.themePage].chartOverView.colorGrid,
                            count: 5
                        },
                        format: 'short',
                        minValue: 0
                    },
                    2: {
                        textStyle: {
                            color: (this.props.themePage === 'dark-theme' || this.props.themePage === 'dark-theme-china' ? 'white' : 'var(--text__main_dark)'),
                            fontSize: 9,
                            bold: false
                        },
                        gridlines: {
                            color: this.props.style[this.props.themePage].chartOverView.colorGrid,
                            count: 1
                        },
                        minValue: 0,
                        format: 'short'
                    }
                },
                crosshair: {
                    trigger: 'both',
                    color: 'red',
                    orientation: 'vertical'
                },
                colors: [this.props.style[this.props.themePage].chartOverView.colorIndex, this.props.style[this.props.themePage].chartOverView.colorVolume, this.props.style[this.props.themePage].chartOverView.colorRef],
                focusTarget: 'category',
                backgroundColor: this.props.style[this.props.themePage].chartOverView.backgroundColor,
                chartArea: { backgroundColor: this.props.style[this.props.themePage].chartOverView.backgroundColor_chartArea, 'width': '82%', 'height': '82%' }
            };
            this.setState({ line_ChartOptions });
        }
    }

    render() {
        // console.log(this.state, this.props)
        if (this.state.stkInfoMatchingChart === 'no_data') {
            return <div>{this.props.t('common_NoDataFound')}</div>
        }
        if (this.state.stkInfoMatchingChart.length === 0) {
            return <div></div>
        }
        return (
            <Chart
                chartType={this.chartType}
                data={this.state.stkInfoMatchingChart}
                options={this.state.line_ChartOptions}
                height='150px'
            />

        );
    }
}
export default ChartIntraday;
