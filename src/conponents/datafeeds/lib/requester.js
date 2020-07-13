import { logMessage } from './helpers'
import { requestInfo } from '../../../utils/globalSv/models/requestInfo'
import { serviceInputPrm } from '../../../utils/globalSv/models/serviceInputPrm'
import { Subject } from 'rxjs'
var Requester = /** @class */ (function() {
    function Requester(glbServ, socket, headers) {
        var _this = this
        this._glbServ = glbServ
        this._socket = socket
        this.subcr_ClientReqRcv = new Subject()
        this.getChartData = 'getChartData'
        this.ChartDataTmp = []
        this.ChartData = []
        this.stkCdRquest = ''
        this.stkCdCurrent = ''
        this.tradview = []
        this.oneTimeDat = 0
        this.getchartTimeout = false
        if (headers) {
            this._headers = headers
        }
        console.log(this._socket)
        // nhận dữ liệu data tradingview
        this.subcr_ClientReqRcv = this._socket.event_ClientReqRcv.subscribe(message => {
            if (message != null) {
                // -- validate info result --
                const cltSeqResult = Number(message['ClientSeq'])
                const reqInfoMap = this._glbServ.getReqInfoMapValue(cltSeqResult)
                // -- process of add new favorite function --
                const endDt = reqInfoMap.inputParam[5]
                if (reqInfoMap.reqFunct === this.getChartData) {
                    if (reqInfoMap.procStat !== 2) {
                        // -- process after get result --
                        if (Number(message['Result']) === 0) {
                            reqInfoMap.procStat = 2
                            reqInfoMap.resSucc = false
                            this._glbServ.setReqInfoMapValue(cltSeqResult, reqInfoMap)
                            this._glbServ.tradingViewData = { t: [], o: [], h: [], l: [], c: [], v: [], s: 'no_data' }
                        } else {
                            reqInfoMap.procStat = 1
                            let jsondata
                            try {
                                jsondata = JSON.parse(message['Data'])

                                this._glbServ.setReqInfoMapValue(cltSeqResult, reqInfoMap)
                                this.ChartDataTmp = this.ChartDataTmp.concat(jsondata)
                                if (Number(message['Packet']) <= 0) {
                                    reqInfoMap.procStat = 2
                                    this._glbServ.setReqInfoMapValue(cltSeqResult, reqInfoMap)
                                    this.ChartData = this.ChartDataTmp
                                    // --------------------------------
                                    if (this.ChartData.length === 0) {
                                        this._glbServ.tradingViewData = {
                                            t: [],
                                            o: [],
                                            h: [],
                                            l: [],
                                            c: [],
                                            v: [],
                                            s: 'no_data',
                                        }
                                    } else {
                                        // --- Kiểm tra nếu ngày request là ngày cuối cùng => lấy thêm dữ liệu ngày hiện tại
                                        const nowDt = this._glbServ.convDate2StrDt(new Date())
                                        let tomorrow = new Date()
                                        tomorrow.setDate(tomorrow.getDate() + 1)
                                        const tomorDt = this._glbServ.convDate2StrDt(tomorrow)
                                        let itemPointCandleStk = null,
                                            itemTomor = null
                                        if (endDt && endDt === nowDt) {
                                            itemPointCandleStk = this.getCurrentValues(nowDt)
                                            itemTomor = this.getCurrentValues(tomorDt)
                                            if (
                                                itemPointCandleStk &&
                                                itemPointCandleStk !== null &&
                                                itemPointCandleStk !== undefined
                                            ) {
                                                this.ChartData.push(itemPointCandleStk)
                                            }
                                        }
                                        this._glbServ.tradingViewData = this.convData2TradFormat(this.ChartData)
                                    }
                                }
                            } catch (err) {
                                jsondata = []
                                this._glbServ.tradingViewData = {
                                    t: [],
                                    o: [],
                                    h: [],
                                    l: [],
                                    c: [],
                                    v: [],
                                    s: 'no_data',
                                }
                            }
                        }
                    }
                }
            }
        })
    }

    Requester.prototype.sendRequest = function(datafeedUrl, urlPath, params) {
        console.log('vào request', urlPath, params)
        const requestTp = urlPath // -- symbols
        if (params !== undefined) {
            var paramKeys = Object.keys(params)
            if (paramKeys.length !== 0) {
                urlPath += '?'
            }
            urlPath += paramKeys
                .map(function(key) {
                    return encodeURIComponent(key) + '=' + encodeURIComponent(params[key].toString())
                })
                .join('&')
        }
        var options = { credentials: 'same-origin', mode: 'no-cors' }
        if (this._headers !== undefined) {
            options.headers = this._headers
        }

        if (requestTp === 'symbols') {
            const paramVal = params['symbol'].toString()
            const stkArr = paramVal.split(':')
            let stkCurr = ''
            if (stkArr.length === 2) {
                stkCurr = stkArr[1]
            } else {
                stkCurr = stkArr[0]
            }
            return this.getSymbolInfo(stkCurr).then(val => JSON.parse(val))
        } else if (requestTp === 'search') {
            return this.searchStkList(params).then(val => JSON.parse(val))
        } else if (requestTp === 'history') {
            if (this.stkCdRquest !== params['symbol'].toString()) {
                this.stkCdRquest = params['symbol'].toString()
                this.ChartData = this.ChartDataTmp = []
                this._glbServ.tradingViewData = { t: [], o: [], h: [], l: [], c: [], v: [], s: 'no_data' }
            }
            if (!this._glbServ.tradingViewFirstRq) {
                this._glbServ.tradingViewFirstRq = true
                this._glbServ.tradingViewDoneGetData = false
                this.subcribeStk(this.stkCdRquest)
            }
            const stkInfo = this._glbServ.stkInfoTradviewMap.get(this.stkCdRquest)
            let stkType = 'stock'
            if (stkInfo) {
                stkType = stkInfo['type']
            }
            const startDt = this._glbServ.convUnixTime2StrDt(Number(params['from']))
            const endDt = this._glbServ.convUnixTime2StrDt(Number(params['to']))
            console.log('vào requestTp === history', startDt, endDt)
            const clientSeq = this._socket.getRqSeq()
            if (startDt < endDt) {
                this.sendRequestGetChartData(this.stkCdRquest, stkType, startDt, endDt, clientSeq)
            }
            return this.newchartDataPromise(clientSeq).then(val => JSON.parse(val))
        } else {
            return fetch(`${datafeedUrl}/${urlPath}`, options)
                .then(response => response.text())
                .then(responseTest => JSON.parse(responseTest))
        }
    }

    Requester.prototype.getSymbolInfo = function(stkCd) {
        const promise = new Promise((resolve, reject) => {
            const obj = this._glbServ.stkInfoTradviewMap.get(stkCd)
            resolve(JSON.stringify(obj))
        })
        return promise
    }

    Requester.prototype.searchStkList = function(params) {
        const promise = new Promise((resolve, reject) => {
            const newTradStkList = this._glbServ.tradview_StkList.filter(
                tradObj =>
                    tradObj['symbol'].indexOf(params['query']) > -1 &&
                    tradObj['exchange'].indexOf(params['exchange']) > -1 &&
                    tradObj['type'].indexOf(params['type']) > -1
            )
            resolve(JSON.stringify(newTradStkList))
        })
        return promise
    }

    Requester.prototype.newchartDataPromise = function(clientSeq) {
        return new Promise((resolve, reject) => {
            let checkTime = 0
            let myinterval = setInterval(() => {
                checkTime++
                if (this.checkResultOrNot(clientSeq) || checkTime === 100) {
                    clearInterval(myinterval)
                    this._glbServ.tradingViewDoneGetData = true
                    resolve(JSON.stringify(this._glbServ.tradingViewData))
                }
            }, 50)
        })
    }

    Requester.prototype.checkResultOrNot = function(clientSeq) {
        const reqInfoMap = this._glbServ.getReqInfoMapValue(clientSeq)
        if (reqInfoMap) {
            if (reqInfoMap.procStat === 2) {
                return true
            }
            return false
        }
        return true
    }

    Requester.prototype.getCurrentValues = function(nowDt) {
        const stkInfo = this._glbServ.stkInfoTradviewMap.get(this.stkCdRquest)
        // tslint:disable-next-line:prefer-const
        let stkType = 'stock',
            mrkObj = {},
            itemPointCandleStk = {}
        if (stkInfo) {
            stkType = stkInfo['type']
        }
        if (stkType === 'stock') {
            let stkCd = 'HNX_' + this.stkCdRquest
            mrkObj = this._glbServ.getMsgObjectByMsgKey(stkCd)
            if (mrkObj === null || mrkObj === undefined) {
                stkCd = 'HSX_' + this.stkCdRquest
                mrkObj = this._glbServ.getMsgObjectByMsgKey(stkCd)
                if (mrkObj === null || mrkObj === undefined) {
                    stkCd = 'UPC_' + this.stkCdRquest
                    mrkObj = this._glbServ.getMsgObjectByMsgKey(stkCd)
                }
            }
            if (mrkObj !== null && mrkObj !== undefined) {
                itemPointCandleStk['c0'] = nowDt
                itemPointCandleStk['c6'] = mrkObj['t137'] || mrkObj['t260'] // -- Open Price
                itemPointCandleStk['c5'] = mrkObj['t266'] || mrkObj['t260'] // -- hight Price (giá đặt mua tốt nhất)
                itemPointCandleStk['c4'] = mrkObj['t2661'] || mrkObj['t260'] // -- low price
                itemPointCandleStk['c7'] =
                    mrkObj['t31'] > 0 ? mrkObj['t31'] : mrkObj['t139'] > 0 ? mrkObj['t139'] : mrkObj['t260'] // -- Close Price
                itemPointCandleStk['c8'] = mrkObj['t387'] || 0 // -- volumn
                return itemPointCandleStk
            }
        } else if (stkType === 'index') {
            mrkObj = this._glbServ.mrkIndex_MsgMap.get(this.stkCdRquest)
            if (mrkObj !== null && mrkObj !== undefined) {
                itemPointCandleStk['c0'] = nowDt
                // itemPointCandleStk['c6'] = (mrkObj['t3'] - mrkObj['t5']); // -- Open Price
                itemPointCandleStk['c6'] =
                    this._glbServ.activeCode === '075' ? mrkObj['t3'] - mrkObj['t5'] : mrkObj['U27'] // -- Open Price
                itemPointCandleStk['c5'] = mrkObj['t24'] || mrkObj['t3'] - mrkObj['t5'] // -- hight Price (giá đặt mua tốt nhất)
                itemPointCandleStk['c4'] = mrkObj['t25'] || mrkObj['t3'] - mrkObj['t5'] // -- Low Price (giá đặt bán tốt nhất)
                itemPointCandleStk['c7'] = mrkObj['t26'] || mrkObj['t3'] - mrkObj['t5'] // -- Close Price
                itemPointCandleStk['c8'] = mrkObj['t7'] || 0
                return itemPointCandleStk
            }
        }
        return null
    }

    Requester.prototype.sendRequestGetChartData = function(stkCd, stkType, start_dt, end_dt, clientSeq) {
        if (this.stkCdCurrent !== stkCd && this._glbServ.tradingViewPage) {
            this.subcribeStk(stkCd)
        }
        this.stkCdCurrent = stkCd
        const reqInfo = new requestInfo()
        reqInfo.reqFunct = this.getChartData
        // -- push request to request hashmap
        let svInputPrm = new serviceInputPrm()
        svInputPrm = this._glbServ.constructorInputPrm(svInputPrm)
        svInputPrm.ClientSeq = clientSeq
        svInputPrm.WorkerName = 'ALTqMktInfo'
        svInputPrm.ServiceName = 'ALTqMktInfo_ChartService'
        svInputPrm.ClientSentTime = '0'
        svInputPrm.Operation = 'Q'
        if (stkType === 'index') {
            if (stkCd === 'HSXINDEX') {
                stkCd = 'HSXIndex'
            }
            if (stkCd === 'HNXUPCOMINDEX') {
                stkCd = 'HNXUpcomIndex'
            }
            if (stkCd === 'HNXINDEX') {
                stkCd = 'HNXIndex'
            }
            if (stkCd === 'HNXCON') {
                stkCd = 'HNXCon'
            }
            if (stkCd === 'HNXLCAP') {
                stkCd = 'HNXLCap'
            }
            if (stkCd === 'HNXFIN') {
                stkCd = 'HNXFin'
            }
            svInputPrm.InVal = ['CandleStick', 'INDEX', 'DAILY', stkCd, start_dt, end_dt]
        } else {
            svInputPrm.InVal = ['CandleStick', 'STOCK_CODE', 'DAILY', stkCd, start_dt, end_dt]
        }
        svInputPrm.TotInVal = svInputPrm.InVal.length
        reqInfo.inputParam = svInputPrm.InVal
        this._glbServ.setReqInfoMapValue(clientSeq, reqInfo)
        this._glbServ.flagGetValueTradView = false
        this._socket.send2Sv(this._socket.key_ClientReq, JSON.stringify(svInputPrm))
    }

    Requester.prototype.subcribeStk = function(curStk) {
        // -- Subcribe mã mới thêm
        const arrOne = []
        arrOne.push(curStk)
        const clientSeq = this._socket.getRqSeq()
        const reqInfo = new requestInfo()
        reqInfo.procStat = 0
        this._glbServ.setReqInfoMapValue(clientSeq, reqInfo)
        const msgObj2 = { ClientSeq: clientSeq, Command: 'SUB', F1: '*', F2: arrOne }
        this._socket.send2Sv(this._socket.key_ClientReqMRK, JSON.stringify(msgObj2))
    }

    Requester.prototype.getTodayByStr = function() {
        const dn = new Date()
        const y = dn.getFullYear()
        const m = dn.getMonth() + 1
        const sm = ('0' + m).slice(-2)
        const d = dn.getDate()
        const sd = ('0' + d).slice(-2)
        const result = y + '' + sm + '' + sd
        return result
    }

    Requester.prototype.convData2TradFormat = function(dataArrS) {
        // -- sort lại time
        const dataArr = dataArrS.sort(function(a, b) {
            return a['c0'] > b['c0'] ? 1 : b['c0'] > a['c0'] ? -1 : 0
        })
        const objData = { t: [], o: [], h: [], l: [], c: [], v: [], s: 'no_data' }
        if (dataArr !== null && dataArr !== undefined && dataArr.length > 1) {
            let i = 0,
                uTc = 0
            for (i = 0; i < dataArr.length; i++) {
                uTc = this._glbServ.convStrDt2UnixTime(dataArr[i]['c0'])
                if (objData['t'].indexOf(uTc) < 0) {
                    objData['t'].push(uTc)
                    objData['o'].push(Number(dataArr[i]['c6']))
                    objData['h'].push(Number(dataArr[i]['c5']))
                    objData['l'].push(Number(dataArr[i]['c4']))
                    objData['c'].push(Number(dataArr[i]['c7']))
                    objData['v'].push(Number(dataArr[i]['c8']))
                }
            }
            objData['s'] = 'ok'
        }
        return objData
    }
    return Requester
})()
export { Requester }
