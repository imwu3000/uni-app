<template>
  <view class="order-detail-container">
    <view v-if="isLoading" class="loading-message">
      <text>加载中...</text>
    </view>
    <view v-else-if="errorMsg" class="error-message">
      <text>{{ errorMsg }}</text>
    </view>
    <view v-else-if="order" class="order-content">
      <text class="title">订单详情</text>

      <view class="detail-item">
        <text class="label">订单ID:</text>
        <text class="value">{{ order._id }}</text>
      </view>
      <view class="detail-item">
        <text class="label">桌号:</text>
        <text class="value">{{ order.tableName }}</text>
      </view>
      <view class="detail-item">
        <text class="label">状态:</text>
        <text class="value status" :class="order.status">{{ order.status }}</text>
      </view>
      <view class="detail-item">
        <text class="label">总金额:</text>
        <text class="value amount">¥{{ (order.totalAmount / 100).toFixed(2) }}</text>
      </view>
      <view class="detail-item">
        <text class="label">创建时间:</text>
        <text class="value">{{ new Date(order.createdAt).toLocaleString() }}</text>
      </view>

      <text class="subtitle">菜品列表</text>
      <view class="items-list">
        <view v-for="item in order.items" :key="item.productId" class="list-item">
          <text class="item-name">{{ item.name }}</text>
          <text class="item-qty">数量: {{ item.quantity }}</text>
          <text class="item-price">单价: ¥{{ (item.price / 100).toFixed(2) }}</text>
        </view>
      </view>
       <button @click="goBack" class="back-button">返回首页</button>
    </view>
    <view v-else class="no-data-message">
      <text>未找到订单信息。</text>
       <button @click="goBack" class="back-button">返回首页</button>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app'; // uni-app specific lifecycle hook
import { getOrderDetail } from '../../utils/api.js';

const order = ref(null);
const isLoading = ref(true);
const errorMsg = ref('');

onLoad((options) => {
  const orderId = options.id;
  console.log('Order Detail Page onLoad, options:', options);
  if (orderId) {
    fetchOrderDetails(orderId);
  } else {
    errorMsg.value = '未提供订单ID';
    isLoading.value = false;
    console.error('Order Detail: No orderId provided in options.');
  }
});

const fetchOrderDetails = async (orderId) => {
  isLoading.value = true;
  errorMsg.value = '';
  try {
    const response = await getOrderDetail(orderId);
    if (response.success) {
      order.value = response.data;
      console.log('Order Details fetched:', response.data);
    } else {
      errorMsg.value = response.message || '获取订单详情失败';
      console.error('Order Detail: API call not successful', response.message);
    }
  } catch (err) {
    errorMsg.value = err.message || '获取订单详情时发生错误';
    console.error('Order Detail: API call error', err);
  } finally {
    isLoading.value = false;
  }
};

const goBack = () => {
  uni.navigateBack({ delta: 1 });
};
</script>

<style scoped>
.order-detail-container {
  padding: 20px;
  background-color: #f8f8f8;
  min-height: 100vh;
}

.loading-message, .error-message, .no-data-message {
  text-align: center;
  padding-top: 50px;
  font-size: 16px;
  color: #555;
}

.error-message {
  color: red;
}

.order-content {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.title {
  font-size: 22px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 25px;
  color: #333;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid #eee;
  font-size: 16px;
}

.detail-item:last-child {
  border-bottom: none;
}

.label {
  color: #555;
  font-weight: bold;
}

.value {
  color: #333;
}

.status {
  font-weight: bold;
}
.status.pending { color: #ff9800; }
.status.completed { color: #4caf50; }
.status.cancelled { color: #f44336; }

.amount {
  color: #e91e63;
  font-weight: bold;
}

.subtitle {
  font-size: 18px;
  font-weight: bold;
  margin-top: 25px;
  margin-bottom: 15px;
  color: #444;
  border-top: 1px solid #eee;
  padding-top: 20px;
}

.items-list .list-item {
  background-color: #f9f9f9;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 8px;
  border: 1px solid #e0e0e0;
}

.item-name {
  font-weight: bold;
  display: block;
  margin-bottom: 4px;
}
.item-qty, .item-price {
  font-size: 14px;
  color: #666;
  display: block;
}
.back-button {
  margin-top: 20px;
  background-color: #007bff;
  color: white;
}
.back-button:hover {
  background-color: #0056b3;
}
</style>
