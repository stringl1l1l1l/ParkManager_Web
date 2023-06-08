<template>
  <div class="app-container">
    <div class="filter-container">
      <el-button class="filter-item" style="margin-left: 10px; margin-bottom: 20px" type="primary" icon="el-icon-edit"
        @click="handleCreate">
        Add
      </el-button>
    </div>
    <el-table v-loading="listLoading" :data="list" element-loading-text="加载中……" border style="width: 100%;" fit
      highlight-current-row :ke="itemKey">
      <el-table-column align="center" label="序号" width="50px">
        <template slot-scope="scope">
          {{ scope.$index }}
        </template>
      </el-table-column>
      <el-table-column label="用户ID" width="95px" align="center">
        <template slot-scope="scope">
          {{ scope.row.userId }}
        </template>
      </el-table-column>
      <el-table-column label="手机号" min-width="120px" align="center">
        <template slot-scope="scope">
          <span>{{ scope.row.phoneNum }}</span>
        </template>
      </el-table-column>
      <el-table-column label="用户名" width="100px" align="center">
        <template slot-scope="scope">
          {{ scope.row.username }}
        </template>
      </el-table-column>
      <el-table-column label="密码" min-width="150px" align="center">
        <template slot-scope="scope">
          {{ scope.row.password }}
        </template>
      </el-table-column>
      <el-table-column label="注册时间" width="160px" align="center">
        <template slot-scope="scope">
          {{ parseTime(scope.row.registerTime) }}
        </template>
      </el-table-column>
      <el-table-column label="车牌号" min-width="110px" align="center">
        <template slot-scope="scope">
          {{ scope.row.carNum }}
        </template>
      </el-table-column>
      <el-table-column label="状态" class-name="status-col" width="100px" align="center">
        <template slot-scope="{row}">
          <el-tag :type="row.delFlag | numMap | statusFilter">
            {{ row.delFlag | numMap }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="操作" align="center" width="250px" class-name="small-padding fixed-width">
        <template slot-scope="scope">
          <el-button v-if="scope.row.delFlag != 1" size="mini" type="primary"
            @click="handleUpdate(scope.$index, scope.row)">编辑</el-button>
          <el-button v-if="scope.row.delFlag != 1" size="mini" type="warning"
            @click="handleAuthenticate(scope.$index, scope.row)">授权</el-button>
          <el-button v-if="scope.row.delFlag != 0" size="mini" type="success"
            @click="handleRestore(scope.$index, scope.row)">还原</el-button>
          <el-button v-if="scope.row.delFlag != 1" size="mini" type="danger"
            @click="handleDelete(scope.$index, scope.row)">注销</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form ref="dataForm" :rules="rules" :model="temp" label-position="left" label-width="70px"
        style="width: 400px; margin-left:50px;">

        <el-form-item label="手机号" prop="phoneNum">
          <el-input v-model="temp.phoneNum" placeholder="请输入,编辑时不输入即不做修改" style="width:350px;" />
        </el-form-item>

        <el-form-item label="用户名" prop="phoneNum">
          <el-input v-model="temp.username" placeholder="请输入,编辑时不输入即不做修改" maxlength="30" style="width:350px;" />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input v-model="temp.password" placeholder="请输入未加密密码,编辑时不输入即不做修改" show-password style="width:350px;" />
        </el-form-item>

        <el-form-item label="车牌号" prop="carNum">
          <el-input v-model="temp.carNum" placeholder="请输入,编辑时不输入即不做修改" style="width:350px;" />
        </el-form-item>

      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogFormVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="dialogStatus === 'create' ? createData() : updateData()">
          确认
        </el-button>
      </div>
    </el-dialog>

    <el-dialog :title="textMap[dialogStatus]" :visible.sync="authenticateDialogVisible" width="300px">
      <el-form label-position="left" label-width="50px">
        <el-form-item v-for="item in roleList" :key="item.roleId">
          <el-checkbox-group v-model="checkRoles">
            <el-checkbox :label="item.roleId">{{ item.roleName }}</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="authenticateDialogVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="authenticate">
          确认
        </el-button>
      </div>
    </el-dialog>
    <el-row>
      <el-col :span="10">
        <el-pagination background layout="prev, pager, next, jumper" @current-change="handleCurrentPageChange"
          :total="this.total" />
      </el-col>
    </el-row>
  </div>
</template>
<script>
import {
  showAllUsers,
  deleteUserById,
  restoreUserById,
  setParkingLotById,
  updateUserById,
  insertParkingLot, insertUser, showUsersByPages
} from '@/api/table'
import { UTC2GMT } from "@/utils"
import { deleteUserRole, findAllRoles, findAllRolesOfOneUser, insertUserRole } from "@/api/permission";

export default {
  filters: {
    numMap(status) {
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
      dialogFormVisible: false,
      authenticateDialogVisible: false,
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
      //所有角色
      roleList: [{
        roleId: 0,
        roleName: "",
        delFlag: 0
      }],
      //多选框勾选的选项
      checkRoles: [],
      userRoles: [{
        roleId: 0,
        roleName: "",
        delFlag: 0
      }],
      temp: {
        "userId": null,
        "phoneNum": null,
        "username": null,
        "password": null,
        "registerTime": null,
        "carNum": null,
        "delFlag": null,
      },
      textMap: {
        update: '编辑',
        create: '创建',
        authenticate: '角色授权',
      },
      dialogStatus: "",
      listLoading: true,
      tempRow: null, // 当前行
      rules: {
      },
      total: null,
      curPage: 1,
    }
  },
  created() {
    this.fetchData(1)
    this.fetchRoles()
  },
  methods: {
    parseTime: UTC2GMT,
    fetchRoles() {
      findAllRoles().then(response => {
        this.roleList = response.data
      })
    },
    fetchData(pageNum) {
      this.listLoading = true
      showUsersByPages(pageNum).then(response => {
        this.list = response.data.records
        this.listLoading = false
        this.total = response.data.total
        this.curPage = response.data.current
      })
    },
    formUserRolePairs(userId, roles) {
      let userRole = {}, array = []
      for (const role of roles) {
        userRole['userId'] = userId
        userRole['roleId'] = role.roleId
        array.push(userRole)
        userRole = {}
      }
      return array
    },
    resetTemp() {
      this.temp = {
        "userId": null,
        "phoneNum": null,
        "username": null,
        "password": null,
        "registerTime": null,
        "carNum": null,
        "delFlag": null,
      }
    },
    handleUpdate(index, row) {
      this.temp = Object.assign({}, this.list[index])
      this.temp.password = null
      this.dialogStatus = 'update'
      this.dialogFormVisible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].clearValidate()
      })
    },
    updateData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          //注册时间不做更新
          this.temp.registerTime = null
          updateUserById(this.temp).then((response) => {
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
    handleCreate() {
      this.resetTemp()
      this.dialogStatus = 'create'
      this.dialogFormVisible = true
    },
    createData() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          insertUser(this.temp).then((response) => {
            if (response.data["影响行数"] !== 0) {
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
    handleRestore(index, row) {
      restoreUserById(row.userId).then(response => {
        if (response.data["影响行数"] !== 0) {
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
      this.$confirm('确定要注销该用户吗', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        deleteUserById(row.userId).then(response => {
          if (response.data["影响行数"] !== 0) {
            this.$message({
              type: 'success',
              message: '注销成功!'
            });
          }
          else {
            this.$message.error('注销失败')
          }
          this.$nextTick(this.fetchData())
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消'
        });
      });
    },
    handleAuthenticate(index, row) {
      findAllRolesOfOneUser(row.userId).then(response => {
        this.userRoles = response.data
        this.checkRoles = []
        for (const role of this.userRoles) {
          this.checkRoles.push(role['roleId'])
        }
      })
      this.tempRow = row
      this.dialogStatus = 'authenticate'
      this.authenticateDialogVisible = true
    },
    authenticate() {
      let array = []
      let delRoles = [], insertRoles = []
      //从当前用户的角色中去除勾选的角色, 剩下的是待删除的角色
      if (this.userRoles) {
        delRoles = this.userRoles.filter(role => { return !this.checkRoles.includes(role.roleId) })
        //所有勾选的且不是用户已有的角色即为待插入角色
        insertRoles = this.roleList.filter(role => {
          return this.checkRoles.includes(role.roleId)
        }).filter(role => { return !this.userRoles.some(item => item.roleId === role.roleId) })
        if (delRoles) {
          const arr = this.formUserRolePairs(this.tempRow.userId, delRoles)
          console.log(arr)
          deleteUserRole(arr).then(response => {
            if (response.data["影响行数"] !== 0) {
              this.$message({
                message: '删除成功',
                type: 'success'
              });
            }
          }
          )
        }
      }
      //若当前用户没有角色,所有勾选的角色都需要插入
      else {
        insertRoles = this.roleList.filter(role => {
          return this.checkRoles.includes(role.roleId)
        })
      }
      array = this.formUserRolePairs(this.tempRow.userId, insertRoles)

      insertUserRole(array).then(response => {
        if (response.data["影响行数"] !== 0) {
          this.$message({
            message: '添加成功',
            type: 'success'
          });
        }
      });
      this.authenticateDialogVisible = false
    },
    handleCurrentPageChange(newPage) {
      console.log("切换页面", newPage)
      this.fetchData(newPage)
    }
  }
}
</script>
