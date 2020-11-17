import axios from "axios";
var mdata = {
    "data": []
}

export default {
    async getmData(code) {
        let resp = await axios.get(
            "http://data.gtimg.cn/flashdata/hushen/minute/" + code + ".js?maxage=110&0.28163905744440854", {}
        )
    }
}