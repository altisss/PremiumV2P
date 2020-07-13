import { getErrorMessage, logMessage, } from './helpers';
import { Subject } from 'rxjs';
var DataPulseProvider = /** @class */ (function () {
    function DataPulseProvider(glbServ, historyProvider, updateFrequency) {
        var _this = this;
        this._glbServ = glbServ;
        this._subscribers = {};
        this._requestsPending = 0;
        this._historyProvider = historyProvider;
        // -- add new for update realtime data
        this.subcr_EpMsg = new Subject();
        this.stkCdRquest = '';
        this.ep_data = {};
        // -- End of adding new for update realtime data
        setInterval(this._updateData.bind(this), updateFrequency);
        this.subcribFunct();
    }
    DataPulseProvider.prototype.subscribeBars = function (symbolInfo, resolution, newDataCallback, listenerGuid) {
        const arrr = listenerGuid.split('_');
        this.ep_data = null;
        // console.log('vào subscribeBars with old stkCdRquest: ' + this.stkCdRquest);
        this.stkCdRquest = arrr[0];
        if (this._subscribers.hasOwnProperty(listenerGuid)) {
            // logMessage("DataPulseProvider: already has subscriber with id=" + listenerGuid);
            return;
        }
        this._subscribers[listenerGuid] = {
            lastBarTime: null,
            listener: newDataCallback,
            resolution: resolution,
            symbolInfo: symbolInfo,
        };
        // logMessage("DataPulseProvider: subscribed for #" + listenerGuid + " - {" + symbolInfo.name + ", " + resolution + "}");
    };
    DataPulseProvider.prototype.unsubscribeBars = function (listenerGuid) {
        delete this._subscribers[listenerGuid];
        // logMessage("DataPulseProvider: unsubscribed for #" + listenerGuid);
        delete this._subscribers[listenerGuid];
        // console.log(new Date + ' unsubscribeBars: ' + listenerGuid);
        this._glbServ.tradingViewData = {};
        this._glbServ.tradingViewDoneGetData = false;
        this._glbServ.tradingViewFirstRq = false;
        this.ep_data = null;
        this.stkCdRquest = '';
    };
    DataPulseProvider.prototype._updateData = function () {
        var _this = this;
        // if (this._requestsPending > 0) {
        //     return;
        // }
        // -- theo thời gian inteval mà hàm này sẽ gọi lại hàm sendRequest history
        if (this._requestsPending > 0 || this.stkCdRquest === '' || !this._glbServ.tradingViewDoneGetData) {
            return;
        }
        this._requestsPending = 0;
        // console.log(this._subscribers);
        var _loop_1 = function (listenerGuid) {
            this_1._requestsPending += 1;
            this_1._updateDataForSubscriber(listenerGuid)
                .then(function () {
                    _this._requestsPending -= 1;
                    // logMessage("DataPulseProvider: data for #" + listenerGuid + " updated successfully, pending=" + _this._requestsPending);
                })
                .catch(function (reason) {
                    _this._requestsPending -= 1;
                    // logMessage("DataPulseProvider: data for #" + listenerGuid + " updated with error=" + getErrorMessage(reason) + ", pending=" + _this._requestsPending);
                });
        };
        var this_1 = this;
        for (var listenerGuid in this._subscribers) {
            _loop_1(listenerGuid);
        }
    };
    DataPulseProvider.prototype._updateDataForSubscriber = function (listenerGuid) {
        var _this = this;
        var subscriptionRecord = this._subscribers[listenerGuid];
        var rangeEndTime = parseInt((Date.now() / 1000).toString());
        // BEWARE: please note we really need 2 bars, not the only last one
        // see the explanation below. `10` is the `large enough` value to work around holidays

        var rangeStartTime = rangeEndTime - periodLengthSeconds(subscriptionRecord.resolution, 0);
        return this._historyProvider.getBars(subscriptionRecord.symbolInfo, subscriptionRecord.resolution, rangeStartTime, rangeEndTime)
            .then(function (result) {
                // -- cập nhật dữ liệu realtime tại đây:

                const stkInfo = _this._glbServ.stkInfoTradviewMap.get(_this.stkCdRquest);
                let stkType = '';
                if (stkInfo) {
                    stkType = stkInfo['type'];
                }

                if (stkType === 'index') {
                    const last_data = _this.getCurrentValues();
                    // console.log(' real time',result,last_data)
                    if (last_data) {
                        result['bars'][result['bars'].length - 1]['volume'] = last_data['c8'];
                        result['bars'][result['bars'].length - 1]['close'] = last_data['c7'];
                    }
                } else {
                    if (_this._glbServ.tradingViewDoneGetData && _this.ep_data && _this.ep_data['c7'] && _this.ep_data['c8']) {
                        // console.log('vào update bars');
                        result['bars'][result['bars'].length - 1]['volume'] = _this.ep_data['c8'];
                        result['bars'][result['bars'].length - 1]['close'] = _this.ep_data['c7'];
                    }
                }
                const last_data = _this.getCurrentValues();
                // console.log('real time trading view',_this.stkCdRquest,result,last_data);
                // console.log('result: GetBarsResult: ' + JSON.stringify(this.ep_data));	
                _this._onSubscriberDataReceived(listenerGuid, result);
            });
    };

    DataPulseProvider.prototype.subcribFunct = function () {
		// -- lấy thông tin thay đổi EP msgkey = HSX_AAA
		this.subcr_EpMsg = this._glbServ.event_ServerPushMRKRcvChangeEpMsg.subscribe(msgkey => {
			if (msgkey.length > 2) {
				const stkCd = msgkey.substr(4);
				// console.log('vào new EP msgkey' + msgkey + ', ' + this.stkCdRquest);	
				if (stkCd === this.stkCdRquest && this._glbServ.tradingViewDoneGetData) {
					// console.log('vào new EP msgkey' + msgkey);	
					setTimeout(() => {
						const last_data = this.getCurrentValues();
						// console.log('Kết quả lấy last_data: ' + JSON.stringify(last_data));	
						if (last_data) {
							this.ep_data = last_data;
							// // console.log('vao lấy thông tin Ep message: ' + JSON.stringify(last_data));
						}
					}, 700); // -- time wait ep message update
				} else {
					this.ep_data = null;
				}
			}
		});
    };

    DataPulseProvider.prototype.getCurrentValues = function() {
		// console.log('getCurrentValues');
		// console.log('getCurrentValues this.stkCdRquest: ' + this.stkCdRquest);
		const stkInfo = this._glbServ.stkInfoTradviewMap.get(this.stkCdRquest);
		// console.log('getCurrentValues stkInfo ' + JSON.stringify(stkInfo));
		// tslint:disable-next-line:prefer-const
		let stkType = '', mrkObj = {}, itemPointCandleStk = {};
		if (stkInfo) {
			stkType = stkInfo['type'];
		}
		if (stkType === 'stock') {
			let stkCd = 'HNX_' + this.stkCdRquest;
			mrkObj = this._glbServ.getMsgObjectByMsgKey(stkCd);
			if (mrkObj === null || mrkObj === undefined) {
				stkCd = 'HSX_' + this.stkCdRquest;
				mrkObj = this._glbServ.getMsgObjectByMsgKey(stkCd);
				if (mrkObj === null || mrkObj === undefined) {
					stkCd = 'UPC_' + this.stkCdRquest;
					mrkObj = this._glbServ.getMsgObjectByMsgKey(stkCd);
				}
			}
			// khôi luong khop ep gia khoi 
			// console.log('getCurrentValues stkCd: ' + stkCd);
			// console.log('getCurrentValues mrkObj: ' + JSON.stringify(mrkObj));
			if (mrkObj && mrkObj['t31'] > 0) {
				itemPointCandleStk['c7'] = mrkObj['t31']; // -- Close Price
				itemPointCandleStk['c8'] = mrkObj['t387'] || 0; // -- volumn
				// console.log('getCurrentValues itemPointCandleStk: ' + JSON.stringify(itemPointCandleStk));
				return itemPointCandleStk;
			}
		} else if (stkType === 'index') {
			// let stkCd = this.stkCdRquest;
			// if (this.stkCdRquest === 'HSXINDEX') { stkCd = 'HSXIndex'; }
			// if (this.stkCdRquest === 'HNXUPCOMINDEX') { stkCd = 'HNXUpcomIndex'; }
			// if (this.stkCdRquest === 'HNXINDEX') { stkCd = 'HNXIndex'; }
			// if (this.stkCdRquest === 'HNXCON') { stkCd = 'HNXCon'; }
			// if (this.stkCdRquest === 'HNXLCAP') { stkCd = 'HNXLCap'; }
			// if (this.stkCdRquest === 'HNXFIN') { stkCd = 'HNXFin'; }
			mrkObj = this._glbServ.mrkIndex_MsgMap.get(this.stkCdRquest);
			// console.log('vào get current: ' + JSON.stringify(mrkObj));
			if (mrkObj !== null && mrkObj !== undefined) {
				itemPointCandleStk['c7'] = mrkObj['t3']; // -- Close Price
				itemPointCandleStk['c8'] = mrkObj['t7'] || 0;
				return itemPointCandleStk;
			}
		}
		return null;
	};
    
    DataPulseProvider.prototype._onSubscriberDataReceived = function (listenerGuid, result) {
        // means the subscription was cancelled while waiting for data
        if (!this._subscribers.hasOwnProperty(listenerGuid)) {
            // logMessage("DataPulseProvider: Data comes for already unsubscribed subscription #" + listenerGuid);
            return;
        }
        // console.log('data-pulse',result)
        var bars = result.bars;
        if (bars.length === 0) {
            return;
        }
        var lastBar = bars[bars.length - 1];
        var subscriptionRecord = this._subscribers[listenerGuid];
        if (subscriptionRecord.lastBarTime !== null && lastBar.time < subscriptionRecord.lastBarTime) {
            return;
        }
        var isNewBar = subscriptionRecord.lastBarTime !== null && lastBar.time > subscriptionRecord.lastBarTime;
        // Pulse updating may miss some trades data (ie, if pulse period = 10 secods and new bar is started 5 seconds later after the last update, the
        // old bar's last 5 seconds trades will be lost). Thus, at fist we should broadcast old bar updates when it's ready.
        if (isNewBar) {
            if (bars.length < 2) {
                throw new Error('Not enough bars in history for proper pulse update. Need at least 2.');
            }
            var previousBar = bars[bars.length - 2];
            subscriptionRecord.listener(previousBar);
        } else {
        subscriptionRecord.lastBarTime = lastBar.time;
        subscriptionRecord.listener(lastBar);
        }
        throw new Error('Lỗi khó hiểu');
    };
    return DataPulseProvider;
}());
export { DataPulseProvider };
function periodLengthSeconds(resolution, requiredPeriodsCount) {
    var daysCount = 0;
    if (resolution === 'D') {
        daysCount = requiredPeriodsCount;
    }
    else if (resolution === 'M') {
        daysCount = 31 * requiredPeriodsCount;
    }
    else if (resolution === 'W') {
        daysCount = 7 * requiredPeriodsCount;
    }
    else {
        daysCount = requiredPeriodsCount * parseInt(resolution) / (24 * 60);
    }
    return daysCount * 24 * 60 * 60;
}
