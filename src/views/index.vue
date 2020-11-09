<template>
  <div id="box">
    <!--顶栏部分-->
    <div class="header">
      <h1>自选小工具</h1>
      <div class="action-buttons">
        <a class="button-pin" @click="addOptional">
          <i class="el-icon-edit"></i>
        </a>
        <a class="button-min">
          <i class="el-icon-s-home"></i>
        </a>
      </div>
    </div>
    <!--指数部分-->
    <div class="stock-index">
      <div
        v-for="(item, index) in indexs"
        :key="index"
        @contextmenu="showContext(item)"
        :class="comparePrice(item.gain.percent, 0)"
      >
        <div class="upper-info">
          <h3>{{ item.name }}</h3>
          <p>{{ item.price.toFixed(2) }}</p>
        </div>
        <p class="index-gain">
          <span
            >{{ item.gain.price > 0 ? "+" : ""
            }}{{ item.gain.price.toFixed(2) }}</span
          >
          <span
            >{{ item.gain.percent > 0 ? "+" : ""
            }}{{ item.gain.percent.toFixed(2) }}%</span
          >
        </p>
      </div>
    </div>
    <!--自选部分-->
    <div class="table-container">
      <el-table
        class="optional-stock-table"
        height="500"
        size="small"
        row-key="code"
        :data="optionals"
        @row-click="clickRow"
        :header-cell-style="{ padding: 0 }"
      >
        <el-table-column label="股票" width="100">
          <template slot-scope="props">
            <div class="stock-info">
              <div :title="props.row.name">
                <h3>{{ props.row.name }}</h3>
                <span v-if="props.row.status">
                  {{ props.row.status === "S" ? "停" : "退" }}
                </span>
              </div>
              <p>{{ props.row.code.toUpperCase() }}</p>
            </div>
          </template>
        </el-table-column>
        <el-table-column
          prop="price"
          label="最新价"
          align="right"
          width="75"
          sortable
        >
          <template slot-scope="props">
            <p class="stock-price">{{ props.row.price.toFixed(2) }}</p>
          </template>
        </el-table-column>
        <el-table-column label="成交量" align="right" width="90">
          <template slot-scope="props">
            <p class="stock-volume">
              {{ transVolume(props.row.volume)
              }}{{ props.row.code.indexOf("hk") > -1 ? "股" : "手" }}
            </p>
          </template>
        </el-table-column>
        <el-table-column
          prop="gain.percent"
          label="涨跌幅"
          align="right"
          sortable
        >
          <template slot-scope="props">
            <template v-if="!props.row.status">
              <span
                class="gain-price"
                :class="comparePrice(props.row.gain.percent, 0)"
              >
                {{ props.row.gain.price > 0 ? "+" : ""
                }}{{ props.row.gain.price.toFixed(2) }}
              </span>
              <span
                class="gain-percent"
                :class="comparePrice(props.row.gain.percent, 0)"
              >
                {{ props.row.gain.percent > 0 ? "+" : ""
                }}{{ props.row.gain.percent.toFixed(2) }}%
              </span>
            </template>
            <template v-else>
              <span class="gain-price">-</span>
              <span class="gain-percent">0.00%</span>
            </template>
          </template>
        </el-table-column>
      </el-table>
    </div>
    <!--加自选弹窗-->
    <optional-dialog ref="optionalDialog" @finish="fetchData" />
  </div>
</template>

<script>
import { apiUrl, timeSpan, stockIndex } from "../libs/constant"; // api,请求间隔,三大指数
import Sortable from "sortablejs"; // 表格拖拽库
import OptionalDialog from "../components/optional"; // 添加功能组件
import Axios from "axios";
export default {
  components: {
    OptionalDialog,
  },
  data() {
    return {
      indexs: [], // 指数部分
      optionals: [], // 自选部分
    };
  },
  created() {
    this.fetchData();
  },
  mounted() {
    setInterval(this.fetchData, timeSpan); // 轮训获取数据
    this.rowDrop(); // 拖拽功能
  },
  methods: {
    /**
     * 通过腾讯接口获取指数&自选股的数据
     */
    fetchData() {
      const index = stockIndex.map((item) => "s_" + item); // 接口需要加前缀
      const storage = localStorage.getItem("optionals");
      let storageOptional = [];
      if (storage !== "" && storage !== null) {
        storageOptional = storage.split(",");
      }
      const optionals = storageOptional.map(
        (item) => "s_" + item.toLowerCase()
      );
      const all = index.concat(optionals);
      const query = all.join(",");
      Axios.get(apiUrl, { params: { q: query } }).then((res) => {
        this.resolveData(res.data);
      });
    },
    /**
     * 解析所有获取的股票数据
     * @param data {string} - 股票数据字符串
     */
    resolveData(data) {
      this.indexs = [];
      this.optionals = [];
      data = data.replace(/[\r\n]/g, ""); // 去掉回车换行
      data = data.substring(0, data.length - 1); // 删除最后一位字符
      const splitData = data.split(";");
      splitData.forEach((item, index) => {
        const splitItem = item.split("="); // 按照等于号截取前后部分
        const prefix = splitItem[0]; // 前缀部分 // 等号前
        const suffix = splitItem[1].match(/"(.*?)"/)[1]; // 后缀内容，只取双引号内容
        const content = suffix.substring(0, suffix.length - 1).split("~");
        const stock = {
          code: prefix.substring(4, 12),
          name: content[1],
          price: parseFloat(content[3]),
          gain: {
            price: parseFloat(content[4]),
            percent: parseFloat(content[5]),
          },
          volume: content[6],
          status: content[8] === "" ? null : content[8],
        };
        if (index < stockIndex.length) {
          this.indexs.push(stock);
        } else {
          this.optionals.push(stock);
        }
      });
    },

    /**
     * 弹窗添加自选股
     */
    addOptional() {
      this.$refs["optionalDialog"].show();
    },
    /**
     * 删除自选
     * @param code {string} - 个股代码
     */
    deleteStock(code) {
      const storage = localStorage.getItem("optionals");
      const storageOptional = storage.split(",");
      const final = [];
      storageOptional.forEach((item) => {
        if (item.toLowerCase() !== code.toLowerCase()) {
          final.push(item);
        }
      });
      localStorage.setItem("optionals", final.join(","));
      this.fetchData();
      this.$toasted.show("已删除", {
        theme: "toasted-primary",
        position: "bottom-center",
        duration: 2000,
      });
    },
    /**
     * 执行修改数据
     */
    modifyData() {
      const modified = this.optionals.map((item) => item.code);
      localStorage.setItem("optionals", modified.join(","));
    },
    /**
     * 自选股的行拖拽排序功能
     */
    rowDrop() {
      const tbody = document.querySelector(".el-table__body-wrapper tbody");
      // const that = this
      Sortable.create(tbody, {
        animation: 120,
        onEnd({ newIndex, oldIndex }) {
          const currRow = this.optionals.splice(oldIndex, 1)[0];
          this.optionals.splice(newIndex, 0, currRow);
          this.modifyData();
        },
      });
    },
    clickRow(rowData) {
      this.$router.push("/stock/" + rowData.code);
    },
  },
};
</script>

<style lang="scss">
@import "../assets/scss/index";
</style>
