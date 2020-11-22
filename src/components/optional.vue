<template>
  <el-dialog
    :visible.sync="isVisible"
    :show-close="false"
    center
    class="optional-dialog"
  >
    <el-select
      v-model="code"
      filterable
      remote
      reserve-keyword
      placeholder="股票代码 / 名称 / 缩写"
      :remote-method="fetchHint"
      :default-first-option="true"
      @change="handleAction"
      ref="codeSelect"
      class="code-select"
      loading-text="加载中..."
    >
      <el-option
        v-for="(item, index) in hints"
        :key="index"
        :label="item.name"
        :value="item.internal_code"
        :popper-append-to-body="false"
      >
        <div class="hint-option-item">
          <span class="hint-market">{{ item.type }}</span>
          <span class="hint-name">{{ item.name }}</span>
          <span class="hint-code">{{ item.code }}</span>
          <span class="hint-letter">{{ item.letter }}</span>
        </div>
      </el-option>
    </el-select>
  </el-dialog>
</template>

<script>
import { stockIndex } from "../libs/constant";
import apis from "../libs/apis";

export default {
  data() {
    return {
      isVisible: false, // 是否显示弹窗
      code: null, // 输入的代码
      hints: [], // 下拉提示
    };
  },
  methods: {
    /**
     * 显示当前添加自选股的弹窗
     * @param key {string|*} - 按键映射的键值
     */
    show(key = null) {
      this.isVisible = !this.isVisible;
      if (!this.isVisible) {
        this.$refs["codeSelect"].blur();
      } else {
        setTimeout(() => {
          this.code = key;
          this.hints = [];
          this.$refs["codeSelect"].focus();
        }, 1);
      }
    },
    /**
     * element-ui 下拉远程获取自选股关键字提示方法
     */
    fetchHint(query) {
      apis.searchStock(query).then((data) => {
        console.log(data);
        data.list.forEach((item, index) => {
          this.$set(this.hints, index, item);
        })
      })
    },
    /**
     * 执行添加个股
     * @param code {string} - 需要添加的个股代码
     */
    handleAction(internalCode) {
      const storage = localStorage.getItem("optionals");
      if (storage !== null && storage !== "") {
        const splitCode = storage.split(","); // 获取存储的代码
        // 判断是否存在
        if (splitCode.indexOf(internalCode) > -1 || stockIndex.indexOf(internalCode) > -1) {
          this.$toasted.show("已存在股票代码", {
            theme: "toasted-primary",
            position: "bottom-center",
            duration: 2000,
          });
          this.refreshOptionals();
        } else {
          localStorage.setItem("optionals", `${internalCode},${storage}`); // 非空的情况
          this.$toasted.show("添加完成", {
            theme: "toasted-primary",
            position: "bottom-center",
            duration: 2000,
          });
          this.refreshOptionals();
        }
      } else {
        localStorage.setItem("optionals", internalCode); // 空的情况
        this.$toasted.show("添加完成", {
          theme: "toasted-primary",
          position: "bottom-center",
          duration: 2000,
        });
        this.refreshOptionals();
      }
    },
    /**
     * 重置下拉的所有提示选项
     */
    refreshOptionals() {
      this.code = null;
      this.isVisible = false;
      this.hints = [];
      this.$emit("finish");
    },
  },
};
</script>
<style lang="scss">
@import "../assets/scss/optional";
</style>
