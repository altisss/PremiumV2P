import React from 'react';
import Chart from '../Chart/Chart';
import socket_sv from '../../utils/globalSv/service/socket_service';
import { requestInfo } from '../../utils/globalSv/models/requestInfo';
import { serviceInputPrm } from '../../utils/globalSv/models/serviceInputPrm';
import commuChanel from '../../constants/commChanel'
import { update_value_for_glb_sv } from '../../utils/update_value_for_glb_sv';
import { getUniqueListBy } from '../../utils/utils_func';

export default class ChartComponent extends React.Component {
	
	state = {
		ChartData: []
	}
	get_value_from_glb_sv_seq = this.props.get_value_from_glb_sv_seq
	component = this.props.component
	getChartData = 'getChartData-ChartComponent';
	req_component = this.props.req_component
	get_rq_seq_comp = this.props.get_rq_seq_comp

	componentDidMount() {
		if (this.props.stkType === 'INDEX' && this.props.curStk && this.props.time) {
			const sq= this.get_value_from_glb_sv_seq()
			window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, {component: this.component, value: 'dataHisMrktop', sq:sq})
			window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, agrs) => {
				if (agrs[this.props.time] && (agrs[this.props.time][this.props.curStk] == null ||
					agrs[this.props.time][this.props.curStk].length === 0)
				) {
					this.sendRequestGetChartData(this.props.curStk,this.props.stkType,this.props.time);
				} else {
					const ChartData = agrs[this.props.time][this.props.curStk];
					if (ChartData == null) {
						return;
					}
					ChartData.forEach(item => {
						item.date = new Date(item.date);
					});
					this.setState({ ChartData });
				}
			})
			
		}

		
	}

	componentWillReceiveProps(nextProps) {
		// console.log(nextProps,this.state);
		const sq = this.props.get_value_from_glb_sv_seq()
        window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, { component: this.component, value: 'dataHisMrktop', sq: sq })
        window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, agrs) => {
			if (nextProps.curStk !== this.state.curStk || nextProps.time !== this.state.time || nextProps.stkType !== this.state.stkType) {
				this.setState({curStk: nextProps.curStk, time: nextProps.time, stkType: nextProps.stkType})
				if (nextProps.stkType === 'INDEX') {
					if (agrs[nextProps.time] && (agrs[nextProps.time][nextProps.curStk] == null || 
						agrs[nextProps.time][nextProps.curStk].length === 0
					)) {
						this.sendRequestGetChartData(nextProps.curStk,nextProps.stkType,nextProps.time);
					} else {
						const ChartData = agrs[nextProps.time][nextProps.curStk];
						ChartData.forEach(item => {
							item.date = new Date(item.date);
						})
						this.setState({ ChartData });
					}
				} else this.sendRequestGetChartData(nextProps.curStk,nextProps.stkType,nextProps.time);
			}
		})
		
	}

	sendRequestGetChartData(stkCd, stkType, date) {
		// console.log(new Date() + ' Vào send request: ' + stkCd + ', :' + stkType + ', :' + start_dt + ', :' + end_dt);
		// this.stkCdCurrent = stkCd;
		console.log(stkCd, stkType, date)
		if (stkCd == null ||  stkType == null || date == null) return;
		// if (stkType !== 'stock') return;
		const reqInfo = new requestInfo();
		reqInfo.reqFunct = this.getChartData;
		// const clientSeq = socket_sv.getRqSeq();
		const request_seq_comp = this.get_rq_seq_comp()
		reqInfo.component = this.component;
		reqInfo.receiveFunct = this.handle_sendRequestGetChartData;
		// -- push request to request hashmap
		let svInputPrm = new serviceInputPrm();
		// svInputPrm = glb_sv.constructorInputPrm(svInputPrm);
		// svInputPrm.ClientSeq = clientSeq;
		svInputPrm.WorkerName = 'ALTqMktInfo';
		svInputPrm.ServiceName = 'ALTqMktInfo_ChartServiceOnline';
		svInputPrm.ClientSentTime = '0';
		svInputPrm.Operation = 'Q';
		if (stkType === 'INDEX') {
			// if (stkCd === 'HSXINDEX') { stkCd = 'HSXIndex'; }
			// if (stkCd === 'HNXUPCOMINDEX') { stkCd = 'HNXUpcomIndex'; }
			// if (stkCd === 'HNXINDEX') { stkCd = 'HNXIndex'; }
			// if (stkCd === 'HNXCON') { stkCd = 'HNXCon'; }
			// if (stkCd === 'HNXLCAP') { stkCd = 'HNXLCap'; }
			// if (stkCd === 'HNXFIN') { stkCd = 'HNXFin'; }
			svInputPrm.InVal = ['CandleStick', 'INDEX', 'DAILY', stkCd, date];
		} else {
			svInputPrm.InVal = ['CandleStick', 'STOCK_CODE', 'DAILY', stkCd, date];
		}
		svInputPrm.TotInVal = svInputPrm.InVal.length;
		reqInfo.inputParam = svInputPrm.InVal;
		// glb_sv.setReqInfoMapValue(clientSeq, reqInfo);
		this.req_component.set(request_seq_comp, reqInfo)
		// socket_sv.send2Sv(socket_sv.key_ClientReq, JSON.stringify(svInputPrm));
		// console.log('chart-stock',JSON.stringify(svInputPrm));
		this.setState({ChartData: []});
		this.ChartData = [];
		this.ChartDataTmp = [];
		window.ipcRenderer.send(commuChanel.send_req, {
            req_component:{
              component: reqInfo.component, 
              request_seq_comp: request_seq_comp,
              channel: socket_sv.key_ClientReq
            }, 
            svInputPrm:svInputPrm
          })
	}

	handle_sendRequestGetChartData = (reqInfoMap, message) => {
		console.log(message, reqInfoMap)
		if (reqInfoMap.procStat !== 2) {
			// -- process after get result --
			if (Number(message['Result']) === 0) {
				reqInfoMap.procStat = 2;
				reqInfoMap.resSucc = false;
				// glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap);
				// this.req_component.set()
				// glb_sv.tradingViewData = { 't': [], 'o': [], 'h': [], 'l': [], 'c': [], 'v': [], 's': 'no_data' };
			} else {
				reqInfoMap.procStat = 1;
				let jsondata;
				try {
					jsondata = JSON.parse(message['Data']);
					// glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap);
					// console.log(this.ChartDataTmp)
					this.ChartDataTmp = getUniqueListBy(this.ChartDataTmp.concat(jsondata), 'c0') 
					// this.ChartDataTmp = this.ChartDataTmp.concat(jsondata)
					if (Number(message['Packet']) <= 0) {
						// console.log('message tradingview:',JSON.stringify(this.ChartDataTmp));
						reqInfoMap.procStat = 2;
						// glb_sv.setReqInfoMapValue(cltSeqResult, reqInfoMap);
						this.ChartData = this.ChartDataTmp;
						console.log(this.ChartData)
						// --------------------------------
						if (!this.ChartData.length > 1) {
							this.setState({ChartData: 'no_data'})
						} else {
	
							if (this.props.stkType === 'INDEX') {
								const sq= this.get_value_from_glb_sv_seq()
								window.ipcRenderer.send(commuChanel.get_value_from_glb_sv, {component: this.component, value: 'dataHisMrktop', sq:sq})
								window.ipcRenderer.once(`${commuChanel.reply_get_value_from_glb_sv}_${this.component}_${sq}`, (event, agrs) => {
									const ChartData = this.ChartData.map(item => {
										const obj = {};
										obj.date = this.convertTime(item.c0);
										obj.high = Number(item.c5);
										obj.close = Number(item.c7);
										obj.low = Number(item.c4);
										obj.open = Number(item.c6);
										obj.volume = Number(item.c8);
										return obj;
									});
									console.log(ChartData)
									this.setState({ ChartData });
									agrs[this.props.time][this.props.curStk] = ChartData;
									update_value_for_glb_sv({component: this.component, key: 'dataHisMrktop', value: agrs})
									if (typeof (Storage) !== 'undefined') {
										localStorage.setItem('dataHisMrktop', JSON.stringify(agrs));
										}
								})
								
							} else {
								const ChartData = this.ChartData.map(item => {
									const obj = {};
									obj.date = this.convertTime(item.c0);
									obj.high = Number(item.c5 / 1000);
									obj.close = Number(item.c7 / 1000);
									obj.low = Number(item.c4 / 1000);
									obj.open = Number(item.c6 / 1000);
									obj.volume = Number(item.c8);
									return obj;
								});
								if (ChartData && (ChartData.length === 1 || ChartData.length === 0)) {
									this.setState({ChartData: 'no_data'});
								} else this.setState({ ChartData });
							}
						}
					}
				} catch (err) {
					// console.log('error',err);
					jsondata = [];
					this.setState({ChartData: 'no_data'});
				}
			}
		}
		
	}

	

	convertTime(strTime) {
		const y = Number(strTime.substr(0, 4));
		const m = Number(strTime.substr(4, 2)) - 1;
		const d = Number(strTime.substr(6, 2));
		return new Date(y, m, d);
	}

	render() {
		if (this.state.ChartData === 'no_data') {
			return <div>{this.props.t('common_NoDataFound')}</div>
		}
		if (this.state.ChartData === undefined || this.state.ChartData.length === 0) {
			return <div>{this.props.t('common_NoDataFound')}</div>
		}
		return (
			<Chart data={this.state.ChartData} />
		)
	}
}

