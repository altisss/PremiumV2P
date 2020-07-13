import React from 'react';
import glb_sv from "../../../utils/globalSv/service/global_service";
import { Chart } from "react-google-charts";
import commuChanel from '../../../constants/commChanel'

class ChartView extends React.PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            line_ChartOptions: this.line_ChartOptions(glb_sv.themePage, glb_sv.style),
            // line_ChartData: ''
        }
        this.component = this.props.component
        this.get_value_from_glb_sv_seq = this.props.get_value_from_glb_sv_seq

        
        
    }


    chartType = 'ComboChart';
    
    line_ChartOptions (themePage, style) {
        // console.log(style[themePage])
        const line_chartOptions = {
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
                    color: (themePage === 'dark-theme' || themePage === 'dark-theme-china' ? 'white' : 'var(--text__main_dark)'),
                    fontSize: 7,
                    bold: false
                },
                gridlines: {
                    color: style[themePage].chartOverView.colorGrid,
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
                        color: (themePage === 'dark-theme' || themePage === 'dark-theme-china' ? 'white' : 'var(--text__main_dark)'),
                        fontSize: 7,
                        bold: false
                    },
                    gridlines: {
                        color: style[themePage].chartOverView.colorGrid,
                        count: 3
                    }
                },
                0: {
                    textStyle: {
                        color: (themePage === 'dark-theme' || themePage === 'dark-theme-china' ? 'white' : 'var(--text__main_dark)'),
                        fontSize: 7,
                        bold: false
                    },
                    gridlines: {
                        color: style[themePage].chartOverView.colorGrid,
                        count: 3
                    },
                    minValue: 0,
                    format: 'short'
                },
                2: {
                    textStyle: {
                        color: (themePage === 'dark-theme' || themePage === 'dark-theme-china' ? 'white' : 'var(--text__main_dark)'),
                        fontSize: 7,
                        bold: false
                    },
                    gridlines: {
                        color: style[themePage].chartOverView.colorGrid,
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
            colors: [style[themePage].chartOverView.colorIndex, style[themePage].chartOverView.colorVolume, style[themePage].chartOverView.colorRef],
            focusTarget: 'category',
            backgroundColor: style[themePage].chartOverView.backgroundColor,
            chartArea: { backgroundColor: style[themePage].chartOverView.backgroundColor_chartArea }
        };
        return line_chartOptions
    }
    
    line_ChartData = [];
    objShareInfoIndex = [];

    componentDidMount() {
        const key = this.props.keyIndex;
        const plus = 0
        const interValShow = setInterval(() => {
            const sq= this.get_value_from_glb_sv_seq() + plus
            window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, {component: this.component, value: ['VN_INDEX', 'HNX_INDEX', 'UPCOM_INDEX', 'themePage', 'style'], sq:sq})
            window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, agrs) => {
                const VN_INDEX = agrs.get('VN_INDEX')
                const HNX_INDEX = agrs.get('HNX_INDEX')
                const UPCOM_INDEX = agrs.get('UPCOM_INDEX')
                const themePage = agrs.get('themePage')
                const style = agrs.get('style')
                if (key === 'VN_INDEX' && VN_INDEX["indexArr"]) {
                    console.log('subcribeMrk',VN_INDEX["indexArr"])
                    this.objShareInfoIndex = VN_INDEX;
                    clearInterval(interValShow)
                    if (this.objShareInfoIndex['indexArr']  && this.objShareInfoIndex['indexArr'].length > 0) {
                        if (this.objShareInfoIndex['indexArr'].length === 1) {
                            this.objShareInfoIndex['indexArr'].push([[9, 0, 0], 0, 0, VN_INDEX['ref']]);
                        }
                        if (this.objShareInfoIndex['indexArr'].length > 2) {
                            this.objShareInfoIndex['indexArr'].push([[15, 0, 0], null, null, this.objShareInfoIndex['ref']]);
                        }
                        const line_ChartOptions = this.line_ChartOptions(themePage, style)
                        this.setState({ line_ChartData: [...this.objShareInfoIndex['indexArr']], line_ChartOptions:  line_ChartOptions}) ;
                    } else {
                        this.objShareInfoIndex['indexArr'] = [['Time', 'VNI', 'Vol', 'Ref'], [[9, 0, 0], 0, 0, VN_INDEX['ref']]];
                        const line_ChartOptions = this.line_ChartOptions(themePage, style)
                        // this.state = { line_ChartData: [...this.objShareInfoIndex['indexArr']], line_ChartOptions: line_ChartOptions };
                        this.setState({ line_ChartData: [...this.objShareInfoIndex['indexArr']], line_ChartOptions: line_ChartOptions })
                    }
                    console.log(this.objShareInfoIndex)
    
                } else if (key === 'HNX_INDEX' && HNX_INDEX[["indexArr"]]) {
                    this.objShareInfoIndex = HNX_INDEX;
                    clearInterval(interValShow)
                    if (this.objShareInfoIndex['indexArr']  && this.objShareInfoIndex['indexArr'].length > 0) {
                        this.objShareInfoIndex['indexArr'] = this.objShareInfoIndex['indexArr'];
                        if (this.objShareInfoIndex['indexArr'].length === 1) {
                            this.objShareInfoIndex['indexArr'].push([[9, 0, 0], 0, 0, HNX_INDEX['ref']]);
                        }
                        if (this.objShareInfoIndex['indexArr'].length > 2) {
                            this.objShareInfoIndex['indexArr'].push([[15, 0, 0], null, null, this.objShareInfoIndex['ref']]);
                        }
                        const line_ChartOptions = this.line_ChartOptions(themePage, style)
                        // this.state = { line_ChartData: [...this.objShareInfoIndex['indexArr']], line_ChartOptions: line_ChartOptions };
                        this.setState({ line_ChartData: [...this.objShareInfoIndex['indexArr']], line_ChartOptions: line_ChartOptions })
                    } else {
                        this.objShareInfoIndex['indexArr'] = [['Time', 'HNX', 'Vol', 'Ref'], [[9, 0, 0], 0, 0, HNX_INDEX['ref']]];
                        const line_ChartOptions = this.line_ChartOptions(themePage, style)
                        // this.state = { line_ChartData: [...this.objShareInfoIndex['indexArr']], line_ChartOptions: line_ChartOptions};
                        this.setState({ line_ChartData: [...this.objShareInfoIndex['indexArr']], line_ChartOptions: line_ChartOptions})
                    }
                } else if (key === 'UPCOM_INDEX' && UPCOM_INDEX['indexArr']) {
                    this.objShareInfoIndex = UPCOM_INDEX;
                    clearInterval(interValShow)
                    if (this.objShareInfoIndex['indexArr']  && this.objShareInfoIndex['indexArr'].length > 0) {
                        this.objShareInfoIndex['indexArr'] = this.objShareInfoIndex['indexArr'];
                        if (this.objShareInfoIndex['indexArr'].length === 1) {
                            this.objShareInfoIndex['indexArr'].push([[9, 0, 0], 0, 0, UPCOM_INDEX['ref']]);
                        }
                        if (this.objShareInfoIndex['indexArr'].length > 2) {
                            this.objShareInfoIndex['indexArr'].push([[15, 0, 0], null, null, this.objShareInfoIndex['ref']]);
                        }
                        const line_ChartOptions = this.line_ChartOptions(themePage, style)
                        // this.state = { line_ChartData: [...this.objShareInfoIndex['indexArr']], line_ChartOptions: line_ChartOptions};
                        this.setState({ line_ChartData: [...this.objShareInfoIndex['indexArr']], line_ChartOptions: line_ChartOptions})
                    } else {
                        this.objShareInfoIndex['indexArr'] = [['Time', 'UPCOM', 'Vol', 'Ref'], [[9, 0, 0], 0, 0, UPCOM_INDEX['ref']]];
                        const line_ChartOptions = this.line_ChartOptions(themePage, style)
                        // this.state = { line_ChartData: [...this.objShareInfoIndex['indexArr']], line_ChartOptions: line_ChartOptions};
                        this.setState({ line_ChartData: [...this.objShareInfoIndex['indexArr']], line_ChartOptions: line_ChartOptions})
                    }
                }
                this.timeout = setTimeout(() => {
                    this.line_ChartData = JSON.parse(JSON.stringify(this.objShareInfoIndex['indexArr']));
                    this.setState({ line_ChartData: this.line_ChartData  });
                    // console.log('error loi setstate',this)
                },1000);
            })
        }, 1000);
        
        
        // console.log(this.component)
        window.ipcRenderer.on(`${commuChanel.event_ServerPushIndexChart}_${this.component}`, (event, message) => {
            // console.log(message, this.props.keyIndex)
            if (message === this.props.keyIndex) {
                const sq= this.get_value_from_glb_sv_seq()
                window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, {component: this.component, value: message, sq:sq})
                window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, agrs) => {
                    this.objShareInfoIndex = agrs
                    if (
                        this.objShareInfoIndex['indexArr'] &&
                        this.objShareInfoIndex['indexArr'].length > 0
                    ) {
                        if (this.state.line_ChartData.length !== (this.objShareInfoIndex['indexArr'].length + 1)) {
                            this.line_ChartData = [...this.objShareInfoIndex['indexArr']];
                            this.setState({ line_ChartData: this.line_ChartData });
                            // console.log(this.line_ChartData)
                        }
                    }
                })
                
            }
        })

        window.ipcRenderer.on(`${commuChanel.CHANGE_THEME}_${this.component}`, (event, agrs) => {
            const sq= this.get_value_from_glb_sv_seq()
            window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, {component: this.component, value: ['themePage', 'style'], sq:sq})
            window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, agrs) => {
                const themePage = agrs.get('themePage')
                const style = agrs.get('style')
                
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
                            color: (themePage === 'dark-theme' || themePage === 'dark-theme-china' ? 'white' : 'var(--text__main_dark)'),
                            fontSize: 7,
                            bold: false
                        },
                        gridlines: {
                            color: style[themePage].chartOverView.colorGrid,
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
                                color: (themePage === 'dark-theme' || themePage === 'dark-theme-china' ? 'white' : 'var(--text__main_dark)'),
                                fontSize: 7,
                                bold: false
                            },
                            gridlines: {
                                color: style[themePage].chartOverView.colorGrid,
                                count: 3
                            }
                        },
                        0: {
                            textStyle: {
                                color: (themePage === 'dark-theme' || themePage === 'dark-theme-china' ? 'white' : 'var(--text__main_dark)'),
                                fontSize: 7,
                                bold: false
                            },
                            gridlines: {
                                color: style[themePage].chartOverView.colorGrid,
                                count: 3
                            },
                            minValue: 0,
                            format: 'short'
                        },
                        2: {
                            textStyle: {
                                color: (themePage === 'dark-theme' || themePage === 'dark-theme-china' ? 'white' : 'var(--text__main_dark)'),
                                fontSize: 7,
                                bold: false
                            },
                            gridlines: {
                                color: style[themePage].chartOverView.colorGrid,
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
                    colors: [style[themePage].chartOverView.colorIndex, style[themePage].chartOverView.colorVolume, style[themePage].chartOverView.colorRef],
                    focusTarget: 'category',
                    backgroundColor: style[themePage].chartOverView.backgroundColor,
                    chartArea: { backgroundColor: style[themePage].chartOverView.backgroundColor_chartArea }
                };
                this.setState({line_ChartOptions});
            })
            
        })

        window.ipcRenderer.on(`finishGetIndex_${this.component}`, (event, agrs) => {
            const sq= this.get_value_from_glb_sv_seq() + plus
            window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, {component: this.component, value: ['VN_INDEX', 'HNX_INDEX', 'UPCOM_INDEX', 'themePage', 'style'], sq:sq})
            window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, agrs) => {
                const VN_INDEX = agrs.get('VN_INDEX')
                const HNX_INDEX = agrs.get('HNX_INDEX')
                const UPCOM_INDEX = agrs.get('UPCOM_INDEX')
                const themePage = agrs.get('themePage')
                const style = agrs.get('style')
                if (key === 'VN_INDEX' && VN_INDEX["indexArr"]) {
                    console.log('subcribeMrk',VN_INDEX["indexArr"])
                    this.objShareInfoIndex = VN_INDEX;
                    // clearInterval(interValShow)
                    if (this.objShareInfoIndex['indexArr']  && this.objShareInfoIndex['indexArr'].length > 0) {
                        if (this.objShareInfoIndex['indexArr'].length === 1) {
                            this.objShareInfoIndex['indexArr'].push([[9, 0, 0], 0, 0, VN_INDEX['ref']]);
                        }
                        if (this.objShareInfoIndex['indexArr'].length > 2) {
                            this.objShareInfoIndex['indexArr'].push([[15, 0, 0], null, null, this.objShareInfoIndex['ref']]);
                        }
                        const line_ChartOptions = this.line_ChartOptions(themePage, style)
                        this.setState({ line_ChartData: [...this.objShareInfoIndex['indexArr']], line_ChartOptions:  line_ChartOptions}) ;
                    } else {
                        this.objShareInfoIndex['indexArr'] = [['Time', 'VNI', 'Vol', 'Ref'], [[9, 0, 0], 0, 0, VN_INDEX['ref']]];
                        const line_ChartOptions = this.line_ChartOptions(themePage, style)
                        // this.state = { line_ChartData: [...this.objShareInfoIndex['indexArr']], line_ChartOptions: line_ChartOptions };
                        this.setState({ line_ChartData: [...this.objShareInfoIndex['indexArr']], line_ChartOptions: line_ChartOptions })
                    }
                    console.log(this.objShareInfoIndex)
    
                } else if (key === 'HNX_INDEX' && HNX_INDEX[["indexArr"]]) {
                    this.objShareInfoIndex = HNX_INDEX;
                    // clearInterval(interValShow)
                    if (this.objShareInfoIndex['indexArr']  && this.objShareInfoIndex['indexArr'].length > 0) {
                        this.objShareInfoIndex['indexArr'] = this.objShareInfoIndex['indexArr'];
                        if (this.objShareInfoIndex['indexArr'].length === 1) {
                            this.objShareInfoIndex['indexArr'].push([[9, 0, 0], 0, 0, HNX_INDEX['ref']]);
                        }
                        if (this.objShareInfoIndex['indexArr'].length > 2) {
                            this.objShareInfoIndex['indexArr'].push([[15, 0, 0], null, null, this.objShareInfoIndex['ref']]);
                        }
                        const line_ChartOptions = this.line_ChartOptions(themePage, style)
                        // this.state = { line_ChartData: [...this.objShareInfoIndex['indexArr']], line_ChartOptions: line_ChartOptions };
                        this.setState({ line_ChartData: [...this.objShareInfoIndex['indexArr']], line_ChartOptions: line_ChartOptions })
                    } else {
                        this.objShareInfoIndex['indexArr'] = [['Time', 'HNX', 'Vol', 'Ref'], [[9, 0, 0], 0, 0, HNX_INDEX['ref']]];
                        const line_ChartOptions = this.line_ChartOptions(themePage, style)
                        // this.state = { line_ChartData: [...this.objShareInfoIndex['indexArr']], line_ChartOptions: line_ChartOptions};
                        this.setState({ line_ChartData: [...this.objShareInfoIndex['indexArr']], line_ChartOptions: line_ChartOptions})
                    }
                } else if (key === 'UPCOM_INDEX' && UPCOM_INDEX['indexArr']) {
                    this.objShareInfoIndex = UPCOM_INDEX;
                    // clearInterval(interValShow)
                    if (this.objShareInfoIndex['indexArr']  && this.objShareInfoIndex['indexArr'].length > 0) {
                        this.objShareInfoIndex['indexArr'] = this.objShareInfoIndex['indexArr'];
                        if (this.objShareInfoIndex['indexArr'].length === 1) {
                            this.objShareInfoIndex['indexArr'].push([[9, 0, 0], 0, 0, UPCOM_INDEX['ref']]);
                        }
                        if (this.objShareInfoIndex['indexArr'].length > 2) {
                            this.objShareInfoIndex['indexArr'].push([[15, 0, 0], null, null, this.objShareInfoIndex['ref']]);
                        }
                        const line_ChartOptions = this.line_ChartOptions(themePage, style)
                        // this.state = { line_ChartData: [...this.objShareInfoIndex['indexArr']], line_ChartOptions: line_ChartOptions};
                        this.setState({ line_ChartData: [...this.objShareInfoIndex['indexArr']], line_ChartOptions: line_ChartOptions})
                    } else {
                        this.objShareInfoIndex['indexArr'] = [['Time', 'UPCOM', 'Vol', 'Ref'], [[9, 0, 0], 0, 0, UPCOM_INDEX['ref']]];
                        const line_ChartOptions = this.line_ChartOptions(themePage, style)
                        // this.state = { line_ChartData: [...this.objShareInfoIndex['indexArr']], line_ChartOptions: line_ChartOptions};
                        this.setState({ line_ChartData: [...this.objShareInfoIndex['indexArr']], line_ChartOptions: line_ChartOptions})
                    }
                }
                this.timeout = setTimeout(() => {
                    this.line_ChartData = JSON.parse(JSON.stringify(this.objShareInfoIndex['indexArr']));
                    this.setState({ line_ChartData: this.line_ChartData  });
                    // console.log('error loi setstate',this)
                },1000);
            })
            
        })
        

    }

    componentWillUnmount() {
        // if (this.subcr_changeValuePrcBoard) this.subcr_changeValuePrcBoard.unsubscribe();
        if (this.timeout) clearTimeout(this.timeout);
        // if (this.subcr_commonEvent) this.subcr_commonEvent.unsubscribe();
    }

    classIndexNm() {
        if (this.state.objShareInfoIndex['indexValueChang'] > 0) {
            return 'price_basic_over';
        } else if (this.state.objShareInfoIndex['indexValueChang'] < 0) {
            return 'price_basic_less';
        } else return 'price_basic_color';
    }

    render() {
        const activeCode = glb_sv.activeCode;
        return (
                <div className="clearfix indexChart">
                    {(this.props.keyIndex !== 'HNX30' || activeCode !== '075') && <div id={"chart_" + this.props.keyIndex} className="indexInfoCell chartCell">
                        <Chart
                            chartType={this.chartType}
                            data={this.state.line_ChartData}
                            options={this.state.line_ChartOptions}
                            height='120px'
                        />
                    </div>}
                    {/* {this.props.keyIndex === 'HNX30' && activeCode === '075' && <div id="chart_hnx30_1" className="indexInfoCell chartCell" style={{ backgroundImage: 'url("assets/img/logo/075_login_logo.png")', backgroundSize: 'contain', backgroundRepeat: 'no-repeat' }} />} */}
                </div>
        );
    }
}
export default ChartView;
