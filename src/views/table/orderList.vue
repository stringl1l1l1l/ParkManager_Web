<template>
    <div class="app-container">
        <div class="filter-container">
            <el-row>
                <el-col :span="15">
                    <el-button class="filter-item" style="margin-left: 10px; margin-bottom: 20px" type="primary"
                        icon="el-icon-edit" @click="handleCreate">
                        Add
                    </el-button>
                </el-col>

                <el-col :span="6" style="float:right">
                    <el-input placeholder="请输入搜索内容" prefix-icon="el-icon-search" v-model="this.search" />
                </el-col>
            </el-row>
        </div>

        <el-table v-loading="listLoading" :data="list" element-loading-text="加载中……" border style="width: 100%;" fit
            highlight-current-row>
            <el-table-column align="center" label="序号" width="50">
                <template slot-scope="scope">
                    {{ scope.$index }}
                </template>
            </el-table-column>

            <el-table-column label="订单ID" width="95px" align="center">
                <template slot-scope="scope">
                    {{ scope.row.orderId }}
                </template>
            </el-table-column>

            <el-table-column label="下单用户ID" width="95px" align="center">
                <template slot-scope="scope">
                    <span>{{ scope.row.userId }}</span>
                </template>
            </el-table-column>

            <el-table-column label="停车场ID" width="95px" align="center">
                <template slot-scope="scope">
                    {{ scope.row.parkingLotId }}
                </template>
            </el-table-column>
            <el-table-column label="车位ID" width="95px" align="center">
                <template slot-scope="scope">
                    {{ scope.row.spaceId }}
                </template>
            </el-table-column>
            <el-table-column label="下单时间" min-width="150px" align="center">
                <template slot-scope="scope">
                    <span>{{ parseTime(scope.row.beginTime) }}</span>
                </template>
            </el-table-column>

            <el-table-column label="结算时间" min-width="150px" align="center">
                <template slot-scope="scope">
                    {{ parseTime(scope.row.endTime) }}
                </template>
            </el-table-column>

            <el-table-column label="费用" min-width="150px" align="center">
                <template slot-scope="scope">
                    {{ scope.row.cost }}
                </template>
            </el-table-column>

            <el-table-column label="状态" class-name="status-col" width="100px" align="center">
                <template slot-scope="{row}">
                    <el-tag :type="row.delFlag | numMap | statusFilter">
                        {{ row.delFlag | numMap }}
                    </el-tag>
                </template>
            </el-table-column>
            <el-table-column label="操作" align="center" width="250" class-name="small-padding fixed-width">
                <template slot-scope="scope">
                    <el-button v-if="scope.row.delFlag != 1" size="mini" type="primary"
                        @click="handleUpdate(scope.$index, scope.row)">编辑</el-button>
                    <el-button v-if="scope.row.delFlag != 0" size="mini" type="success"
                        @click="handleRestore(scope.$index, scope.row)">还原</el-button>
                    <el-button v-if="scope.row.delFlag != 1" size="mini" type="danger"
                        @click="handleDelete(scope.$index, scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
    </div>
</template>
<script>
import { showAllOrder } from '@/api/table'
import { UTC2GMT } from "@/utils"

let formData = {
    orderId: null,
    beginTime: null,
    endTime: null,
    userId: null,
    spaceId: null,
    cost: null,
    parkingLotId: null
}

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
                '发布': 'success',
                '删除': 'danger'
            }
            return statusMap[status]
        }
    },
    data() {
        return {
            list: [formData],
            temp: formData,
            listLoading: true,
            categoryOptions: null,
            dialogStatus: "",
            dialogFormVisible: false,
            visible: false,
            textMap: {
                update: '编辑',
                create: '创建'
            },
            search: "",
        }
    },
    created() {
        this.fetchData()
    },

    methods: {
        parseTime: UTC2GMT,
        fetchData() {
            this.listLoading = true
            showAllOrder().then(response => {
                this.list = response.data
                this.listLoading = false
            })
        },
        resetTemp() {
            this.temp = formData
        },
        handleRestore(index, row) {
            restoreParkingLotById(row.parkingLotId).then(response => {
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
            //弹窗提示
            this.$confirm('确定要删除这条数据吗', '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                //调用url
                deleteParkingLotById(row.parkingLotId).then(response => {
                    //成功
                    if (response.data["影响行数"] !== 0) {
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
                    insertParkingLot(this.temp).then((response) => {
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
    }
}
</script>
  