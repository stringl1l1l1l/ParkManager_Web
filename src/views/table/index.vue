<template>
  <div class="app-container">
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="加载中……"
      border
      style="width: 100%;"
      fit
      highlight-current-row
      :ke="itemKey"
    >
      <el-table-column align="center" label="序号" width="50">
        <template slot-scope="scope">
          {{ scope.$index }}
        </template>
      </el-table-column>
      <el-table-column label="用户ID" width="95" align="center">
        <template slot-scope="scope">
          {{ scope.row.userId }}
        </template>
      </el-table-column>
      <el-table-column label="手机号" width="150" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.phoneNum }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户名" width="100" align="center">
        <template slot-scope="scope">
          {{ scope.row.username }}
        </template>
      </el-table-column>
      <el-table-column label="密码" width="300" align="center">
        <template slot-scope="scope">
          {{ scope.row.password }}
        </template>
      </el-table-column>
      <el-table-column label="注册时间" width="200" align="center">
        <template slot-scope="scope">
          {{ parseTime(scope.row.registerTime) }}
        </template>
      </el-table-column>
      <el-table-column label="车牌号" width="110" align="center">
        <template slot-scope="scope">
          {{ scope.row.carNum }}
        </template>
      </el-table-column>
      <el-table-column label="状态" class-name="status-col" width="100" align="center">
        <template slot-scope="{row}">
          <el-tag :type="row.delFlag | numMap | statusFilter">
            {{ row.delFlag | numMap }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="250" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button
            v-if="scope.row.delFlag != 1"
            size="mini"
            @click="handleEdit(scope.$index, scope.row)">编辑</el-button>
          <el-button
            v-if="scope.row.delFlag != 0"
            size="mini"
            type="success"
            @click="handleRestore(scope.$index, scope.row)">还原</el-button>
          <el-button
            v-if="scope.row.delFlag != 1"
            size="mini"
            type="danger"
            @click="handleDelete(scope.$index, scope.row)">删除</el-button>

        </template>
      </el-table-column>
    </el-table>
  </div>
</template>
<script>
import {showAllUsers, deleteUserById, restoreUserById, showUserById} from '@/api/table'
import {UTC2GMT} from "@/utils"

export default {
  filters: {
    numMap(status){
      const map = [
        '发布',
        '删除'
      ]
      return map[status]
    },
    statusFilter(status) {

      const statusMap = {
        发布: 'success',
        删除: 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      itemKey: 0,
      list: [
        {
          "userId": 0,
          "phoneNum": "",
          "username": "",
          "password": "",
          "registerTime": null,
          "carNum": "",
          "delFlag": 0,
        }],
      listLoading: true
    }
  },
  created() {
    this.fetchData()
  },
  methods: {
    parseTime: UTC2GMT,
    fetchData() {
      this.listLoading = true
      showAllUsers().then(response => {
        this.list = response.data
        this.listLoading = false
      })
    },
    cancelEdit(row) {
      row.title = row.originalTitle
      row.edit = false
      this.$message({
        message: 'The title has been restored to the original value',
        type: 'warning'
      })
    },
    confirmEdit(row) {
      row.edit = false
      row.originalTitle = row.title
      this.$message({
        message: 'The title has been edited',
        type: 'success'
      })
    },
    handleEdit(index, row) {
      console.log(index, row);
    },
    handleRestore(index, row) {
      restoreUserById(row.userId)
      // row.delFlag = 0
      this.$set(this.list[index], 'delFlag', 0)
    },
    handleDelete(index, row) {
      deleteUserById(row.userId)
      // row.delFlag = 1
      this.$set(this.list[index], 'delFlag', 1)
    }
  }
}
</script>
