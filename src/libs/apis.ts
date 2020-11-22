import axios from "axios";

const apiPrefix = 'https://stock.nightc.com/api/';

export default {
    async searchStock(query: string) {
        try{
            const resp = await axios.get(apiPrefix + 'search', {
                params: {
                    key: query,
                }
            })
            return resp.data;
        } catch(err) {
            console.error(err);
            throw err;
        }
    },
    async listStocks(stocks: string[]) {
        try{
            const resp = await axios.get(apiPrefix + 'multi_stock', {
                params: {
                    codes: stocks,
                }
            })
            return resp.data;
        } catch(err) {
            console.error(err);
            throw err;
        }
    }
}