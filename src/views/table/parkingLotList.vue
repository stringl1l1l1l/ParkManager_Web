<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button class="filter-item" style="margin-left: 10px; margin-bottom: 20px" type="primary" icon="el-icon-edit" @click="handleCreate">
        Add
      </el-button>
    </div>

    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="加载中……"
      border
      style="width: 100%;"
      fit
      highlight-current-row
    >
      <el-table-column align="center" label="序号" width="50">
        <template slot-scope="scope">
          {{ scope.$index }}
        </template>
      </el-table-column>
      <el-table-column label="停车场ID" width="95px" align="center">
        <template slot-scope="scope">
          {{ scope.row.parkingLotId }}
        </template>
      </el-table-column>
      <el-table-column label="经度" min-width="150px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.longitude }}</span>
        </template>
      </el-table-column>
      <el-table-column label="纬度" min-width="150px" align="center">
        <template slot-scope="scope">
          {{ scope.row.latitude }}
        </template>
      </el-table-column>
      <el-table-column label="简介" min-width="230px" align="center">
        <template slot-scope="scope">
          {{ scope.row.description }}
        </template>
      </el-table-column>

      <el-table-column label="类型" width="100" align="center">
        <template slot-scope="scope">
          {{ scope.row.category }}
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
            type="primary"
            @click="handleUpdate(scope.$index, scope.row)">编辑</el-button>
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

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px" style="width: 400px; margin-left:50px;">

        <el-form-item label="经度" prop="longitude">
          <el-input v-model="temp.longitude" placeholder="请输入" style="width:350px;"/>
        </el-form-item>

        <el-form-item label="纬度" prop="latitude">
          <el-input v-model="temp.latitude" placeholder="请输入" style="width:350px;"/>
        </el-form-item>

        <el-form-item label="简介" prop="description">
          <el-input v-model="temp.description"  :autosize="{ minRows: 2, maxRows: 4}" type="textarea" placeholder="请输入" style="width:350px;"/>
        </el-form-item>

        <el-form-item label="类型" prop="category">
          <el-select v-model="temp.category" class="filter-item"  style="width:200px;">
            <el-option v-for="item in categoryOptions" :key="item.key" :label="item.display_name" :value="item.key" />
          </el-select>
        </el-form-item>

        <el-popover
          placement="bottom"
          width="160"
          v-model="visible">
          <div style="text-align: right; margin: 0">
            <el-table
              :data="this.chargeRule"
              border
              style="width: 100%;"
              fit
              highlight-current-row
            >
              <el-table-column label="天数" width="95px" align="center">
                <template slot-scope="scope">
                  {{ scope.row.val }}
                </template>
              </el-table-column>
              <el-table-column label="天数" width="95px" align="center">
                <template slot-scope="scope">
                  {{ scope.row.val }}
                </template>
              </el-table-column>
              <el-table-column label="单价" width="95px" align="center">
                <template slot-scope="scope">
                  {{ scope.row.val }}
                </template>
              </el-table-column>
            </el-table>
            <el-button size="mini" type="text" @click="visible = false">取消</el-button>
            <el-button type="primary" size="mini" @click="">确定</el-button>
          </div>
          <el-button slot="reference" size= "mini" @click="getChargeRuleTable(temp.parkingLotId)">编辑计费规则</el-button>
        </el-popover>


      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus==='create'?createData():updateData()">
          确认
        </el-button>
      </div>
    </el-dialog>



  </div>
</template>
<script>
import {
  showAllParkingLots,
  insertParkingLot,
  deleteParkingLotById,
  setParkingLotById,
  restoreParkingLotById, findChargeRuleByParkingLotId
} from '@/api/table'

const categoryOptions = [
  { key: null, display_name: '无' },
  { key: '医院', display_name: '医院' },
  { key: '机场', display_name: '机场' },
  { key: '学校', display_name: '学校' },
  { key: '小区', display_name: '小区' }
]

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
        '发布': 'success',
        '删除': 'danger'
      }
      return statusMap[status]
    }
  },
  data() {
    return {
      list: [
        {
          "parkingLotId": null,
          "longitude": null,
          "latitude": null,
          "description": null,
          "chargeRuleId": null,
          "category": null,
          "delFlag": null
        }],
      temp: {
          "parkingLotId": null,
          "longitude": null,
          "latitude": null,
          "description": null,
          "chargeRuleId": null,
          "category": null,
          "delFlag": null
      },
      chargeRule: [{
        operator: null,
        val: null,
        unitPrice: null,
      }],
      listLoading: true,
      categoryOptions,
      dialogStatus: "",
      dialogFormVisible: false,
      chargeRuleTableVisible: false,
      visible: false,
      rules: {
        longitude: [{ required: true, message: 'longitude is required', trigger: 'blur' }],
        latitude: [{ required: true, message: 'latitude is required', trigger: 'blur' }]
      },
      textMap: {
        update: '编辑',
        create: '创建'
      },
    }
  },
  created() {
    this.fetchData()
  },

  methods: {
    fetchData() {
      this.listLoading = true
      showAllParkingLots().then(response => {
        this.list = response.data
        this.listLoading = false
      })
    },
    resetTemp() {
      this.temp = {
        "parkingLotId": null,
        "longitude": null,
        "latitude": null,
        "description": null,
        "chargeRuleId": null,
        "category": null,
        "delFlag": null
      }
    },
    handleRestore(index, row) {
      restoreParkingLotById(row.parkingLotId).then( response => {
        if(response.data["影响行数"] !== 0) {
          this.$message({
            message: '还原成功',
            type: 'success'
          });
        }
        //失败
        else {
          this.$message.error('还原失败');
        }
        this.$nextTick(this.fetchData())
        })
    },
    handleDelete(index, row) {
      //弹窗提示
      this.$confirm('确定要删除这条数据吗', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        //调用url
        deleteParkingLotById(row.parkingLotId).then( response => {
          //成功
          if(response.data["影响行数"] !== 0) {
            this.$message({
              message: '删除成功',
              type: 'success'
            });
          }
          //失败
          else {
            this.$message.error('删除失败');
          }
          this.$nextTick(this.fetchData())
      }).catch(() => {
        //取消操作
        this.$message({
          type: 'info',
          message: '已取消'
        });
      });
    })
    },
    handleUpdate(index, row) {
      this.temp = Object.assign({}, this.list[index])
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          insertParkingLot(this.temp).then( (response) => {
            if(response.data["影响行数"] !== 0) {
              this.dialogFormVisible = false
              this.$message({
                message: '添加成功',
                type: 'success'
              });
            }
            else {
              this.$message.error('添加失败');
            }
            this.$nextTick(this.fetchData())
          })
        }
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          const index = this.list.findIndex(v => v.parkingLotId === this.temp.parkingLotId)
          this.list.splice(index, 1, this.temp)
          setParkingLotById(this.temp).then((response) => {
            if (response.data["影响行数"] !== 0) {
              this.dialogFormVisible = false
              this.$message({
                message: '更新成功',
                type: 'success'
              });
            } else {
              this.$message.error('更新失败');
            }
            this.$nextTick(this.fetchData())
          })
        }
      })
    },
    getChargeRuleTable(parkingLotId) {
      findChargeRuleByParkingLotId(parkingLotId).then( response => {
        this.chargeRule = [{
            operator: null,
            val: null,
            unitPrice: null,
          }]
        this.chargeRule = response.data
      })
    }
  }
}
</script>
