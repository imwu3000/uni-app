// Example content for utils/api.js
export const staffLogin = (username, password) => {
  return new Promise((resolve, reject) => {
    // Simulate API call delay
    setTimeout(() => {
      if (username === "testuser" && password === "password") {
        resolve({
          success: true,
          data: {
            userId: "staff_id_001",
            name: "Test User",
            storeId: "store_id_123",
            token: "mock.jwt.token"
          }
        });
      } else {
        reject({
          success: false,
          message: "用户名或密码不正确" // Username or password incorrect
        });
      }
    }, 1000);
  });
};

export const getOrderDetail = (orderId) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // Simulate finding an order
      if (orderId === "order_123") {
        resolve({
          success: true,
          data: {
            _id: "order_123",
            tableName: "A02",
            status: "pending",
            totalAmount: 6800,
            items: [
              {"productId": "p003", "name": "麻婆豆腐", "price": 2800, "quantity": 1},
              {"productId": "p004", "name": "米饭", "price": 200, "quantity": 2}
            ],
            createdAt: new Date().toISOString()
          }
        });
      } else {
        reject({
          success: false,
          message: "订单不存在或已无法查看" // Order not found or cannot be viewed
        });
      }
    }, 500);
  });
};
