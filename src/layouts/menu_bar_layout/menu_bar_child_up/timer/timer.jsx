import React from "react";
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import glb_sv from "../../../../utils/globalSv/service/global_service";
const renderTime = value => {
    if (value === 0) {
        return <div className="timer" title={transText('update_data')}>...</div>;
    }

    return (
        <div className="timer">
            {/* <div className="text">Cập nhật dữ liệu sau</div> */}
            <div className="value" title={transText('delay_get_data') + ' ' + value + 's'}>{value}</div>
            {/* <div className="text">seconds</div> */}
        </div>
    );
};

const transText = (text) => {
    if (glb_sv.language === 'VI') {
        if (text === 'update_data') return 'Dữ liệu đã được cập nhật!';
        if (text === 'delay_get_data') return 'Dữ liệu sẽ được cập nhật sau';
    } else if (glb_sv.language === 'EN') {
        if (text === 'update_data') return 'Data updated!';
        if (text === 'delay_get_data') return 'Data will be updated after';
    } else if (glb_sv.language === 'CN') {
        if (text === 'update_data') return '资料已更新!';
        if (text === 'delay_get_data') return '数据将在以后更新';
    }
}



export default function Timer(props) {
    function callSv() {
        props.callSv();
        return [true, 3000]
    }
    return (
        <div className="App">
            <CountdownCircleTimer
                isPlaying={true}
                durationSeconds={10}
                colors={[["green", 0.33], ["#F7B801", 0.33], ["#A30000", 0.33]]}
                renderTime={renderTime}
                onComplete={() => callSv()}
                size={20}
                strokeWidth={1}
            />
        </div>
    );
}