import http from '@/utils/request'

// user

export async function showAllUsers() {
  return http.get("/user/showUsersByPages")
}

export async function showUsersByPages(pageNum) {
  return http.getRestApi("/user/showUsersByPages", pageNum)
}

export async function showUserById(id) {
  return http.getRestApi("/user/showUserById", id)
}

export async function deleteUserById(id) {
  return http.delete("/user/deleteUserById", id)
}

export async function restoreUserById(id) {
  return http.getRestApi("/user/restoreUserById", id)
}

export async function insertUser(user) {
  return http.post("/user/insertUser", user)
}

export async function updateUserById(user) {
  return http.put("/user/updateUserById", user)
}


// parkingLot
export async function showAllParkingLots() {
  return http.get("/parkingLot/showAllParkingLots")
}

export async function deleteParkingLotById(id) {
  return http.delete("/parkingLot/deleteParkingLotById", id)
}

export async function insertParkingLot(parkingLot) {
  return http.post("/parkingLot/insertParkingLot", parkingLot)
}

export async function setParkingLotById(parkingLot) {
  return http.put("/parkingLot/setParkingLotById", parkingLot)
}

export async function restoreParkingLotById(id) {
  return http.getRestApi("/parkingLot/restoreParkingLotById", id)
}

export async function findChargeRuleByParkingLotId(id) {
  return http.getRestApi("/parkingLot/findChargeRuleByParkingLotId", id)
}

// order
export async function showAllOrder() {
  return http.get("/order/showAllOrder")
}