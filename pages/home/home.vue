<template>
  <view class="home-container">
    <text class="title">首页</text>
    <view v-if="userInfo" class="user-info card">
      <text>欢迎, {{ userInfo.name }} ({{ userInfo.userId }})</text>
      <text>门店ID: {{ userInfo.storeId }}</text>
    </view>

    <view class="actions-grid">
        <button @click="logout" class="grid-button logout-button">退出登录</button>
        <button @click="navigateToHelp" class="grid-button help-button">帮助与指南</button>
    </view>

    <view class="floating-window-controls card">
      <text class="card-title">悬浮窗控制</text>
      <view class="button-group">
        <button @click="handleRequestPermission" class="control-button">检查/请求悬浮窗权限</button>
        <button @click="handleShowFloatingWindow" class="control-button primary">显示悬浮窗</button>
        <button @click="handleHideFloatingWindow" class="control-button danger">隐藏悬浮窗</button>
      </view>
      <text v-if="permissionStatus !== ''" class="permission-status">权限状态: {{ permissionStatus }}</text>
    </view>

    <view class="orders-section card">
      <text class="card-title">最新订单 (模拟)</text>
      <view v-if="ordersList.length === 0" class="no-orders">
        <text>暂无新订单</text>
      </view>
      <scroll-view v-else scroll-y class="orders-scroll">
        <view v-for="order in ordersList" :key="order._id" class="order-card" @click="viewOrderDetail(order._id)">
          <text class="order-id">订单ID: {{ order._id.substring(order._id.length - 6) }}</text>
          <text>桌号: {{ order.tableName }}</text>
          <text>金额: ¥{{ (order.totalAmount / 100).toFixed(2) }}</text>
          <text>状态: <text :class="['status-text', order.status]">{{ order.status }}</text></text>
          <text>时间: {{ new Date(order.createdAt).toLocaleTimeString() }}</text>
          <text class="view-detail-prompt">点击查看详情</text>
        </view>
      </scroll-view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import mockDb from '../../utils/mockDb.js';
import createNotification from '../../utils/localNotifications.js';
import {
  show as showFloatingWindow,
  hide as hideFloatingWindow,
  onButtonClick as onFloatingButtonClick,
  isOverlayPermissionGranted,
  requestOverlayPermission
} from '../../utssdk/floating-window';

const userInfo = ref(null);
const ordersList = ref([]);
const orderWatchListener = ref(null);
const permissionStatus = ref('');

const navigateToHelp = () => {
  uni.navigateTo({
    url: '/pages/help/help'
  });
};

const checkPermissionVerbose = () => {
  if (uni.getSystemInfoSync().platform === 'android') {
    const granted = isOverlayPermissionGranted();
    permissionStatus.value = granted ? '已授予' : '未授予';
    return granted;
  }
  permissionStatus.value = '非安卓平台，无需检查';
  return true;
};

const handleRequestPermission = () => {
  if (uni.getSystemInfoSync().platform === 'android') {
    if (!checkPermissionVerbose()) {
      requestOverlayPermission();
      setTimeout(checkPermissionVerbose, 5000);
    } else {
       uni.showToast({ title: '悬浮窗权限已授予', icon: 'success' });
    }
  } else {
    uni.showToast({ title: '非安卓平台，无需此权限', icon: 'none' });
  }
};

const handleShowFloatingWindow = () => {
  if (uni.getSystemInfoSync().platform === 'android') {
    if (checkPermissionVerbose()) {
      console.log('Home: Attempting to show floating window...');
      showFloatingWindow({ x: 100, y: uni.getSystemInfoSync().screenHeight / 2, text: "订单", textSize: 18.0 });
      uni.showToast({ title: '悬浮窗应已显示 (如果权限通过)', icon: 'none' });
    } else {
      uni.showToast({ title: '请先授予悬浮窗权限', icon: 'none' });
      requestOverlayPermission();
    }
  } else {
     uni.showToast({ title: '悬浮窗功能仅限安卓平台', icon: 'none' });
  }
};

const handleHideFloatingWindow = () => {
  console.log('Home: Attempting to hide floating window...');
  hideFloatingWindow();
};

const setupFloatingWindowClickListener = () => {
  onFloatingButtonClick(() => {
    uni.showToast({ title: '悬浮窗被点击了!', icon: 'none' });
    console.log('Floating window clicked! Implement app to foreground logic if needed.');
  });
};


onMounted(() => {
  const storedUserInfo = uni.getStorageSync('userInfo');
  if (storedUserInfo) {
    userInfo.value = storedUserInfo;
    if (storedUserInfo.storeId) {
      initializeOrderListener(storedUserInfo.storeId);
    } else {
      console.error('Home: storeId not found in userInfo. Cannot listen for orders.');
    }
  } else {
    console.error('Home: userInfo not found. Cannot listen for orders.');
    uni.reLaunch({ url: '/pages/login/login' });
    return;
  }

  setupFloatingWindowClickListener();

  if (uni.getSystemInfoSync().platform === 'android') {
    setTimeout(() => {
        if(!checkPermissionVerbose()){
            uni.showModal({
                title: '权限提示',
                content: '为了正常使用悬浮窗功能接收订单通知，请授予应用“显示在其他应用上层”的权限。点击“帮助与指南”查看详细设置方法。',
                confirmText: '去设置',
                cancelText: '稍后',
                success: (res) => {
                    if(res.confirm) {
                        requestOverlayPermission();
                    }
                }
            });
        }
    }, 1000);
  }
});

const initializeOrderListener = (storeId) => {
  const db = mockDb;
  orderWatchListener.value = db.collection('Orders')
    .where({ storeId: storeId, status: 'pending' })
    .watch({
      onChange: (snapshot) => {
        snapshot.docChanges.forEach(change => {
          const order = change.doc;
          if (change.type === 'add' || change.type === 'init') {
            const existingOrderIndex = ordersList.value.findIndex(o => o._id === order._id);
            if (existingOrderIndex === -1) {
              ordersList.value.unshift(order);
            } else {
              ordersList.value.splice(existingOrderIndex, 1, order);
            }
            if (ordersList.value.length > 10) ordersList.value.pop();
            if (change.type === 'add') {
                 createNotification({
                    title: '新订单提醒!',
                    content: `桌号: ${order.tableName} - 金额: ¥${(order.totalAmount / 100).toFixed(2)}`,
                    payload: { orderId: order._id, storeId: order.storeId }
                 });
            }
          }
        });
      },
      onError: (err) => {
        console.error('Home: Order watch error:', err);
        uni.showToast({ title: '订单监听失败', icon: 'error' });
      }
    });
};

const viewOrderDetail = (orderId) => {
  if (!orderId) {
    uni.showToast({ title: '无效的订单ID', icon: 'none'});
    return;
  }
  uni.navigateTo({ url: `/pages/order-detail/order-detail?id=${orderId}` });
};

onUnmounted(() => {
  if (orderWatchListener.value && orderWatchListener.value.close) {
    orderWatchListener.value.close();
  }
});

const logout = () => {
  if (orderWatchListener.value && orderWatchListener.value.close) {
    orderWatchListener.value.close();
  }
  if (uni.getSystemInfoSync().platform === 'android') {
    hideFloatingWindow();
  }
  uni.removeStorageSync('userInfo');
  uni.removeStorageSync('token');
  uni.showToast({ title: '已退出登录', icon: 'none' });
  uni.reLaunch({ url: '/pages/login/login' });
};
</script>

<style scoped>
.home-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 15px; /* Reduced padding slightly */
  min-height: 100vh;
  background-color: #f8f8f8;
  box-sizing: border-box;
}

.card {
  background-color: #ffffff;
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 15px; /* Reduced margin */
  width: 100%;
  max-width: 600px;
  box-sizing: border-box;
}

.card-title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 10px;
  display: block;
  text-align: center;
}

.title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 15px; /* Reduced margin */
}

.user-info {
  text-align: center;
}

.user-info text {
  display: block;
  margin-bottom: 8px;
  font-size: 16px;
}

/* New Actions Grid */
.actions-grid {
  display: flex; /* Use flexbox for side-by-side */
  justify-content: space-between; /* Space out buttons */
  gap: 10px; /* Space between buttons */
  width: 100%;
  max-width: 600px;
  margin-bottom: 15px;
}

.grid-button {
  flex: 1; /* Allow buttons to grow and share space */
  padding: 10px;
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  font-size: 15px;
  text-align: center;
}

.logout-button {
  background-color: #ff4d4f;
}
.help-button {
  background-color: #17a2b8; /* Info color */
}


.floating-window-controls .button-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.control-button {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  font-size: 14px;
}
.control-button.primary { background-color: #007aff; }
.control-button.danger { background-color: #e53935; }
.control-button:not(.primary):not(.danger) { background-color: #6c757d; }


.permission-status {
  display: block;
  text-align: center;
  margin-top: 10px;
  font-size: 14px;
  color: #333;
}

.orders-section { }

.no-orders {
  text-align: center;
  color: #888;
  padding: 20px;
}

.orders-scroll {
  max-height: 280px; /* Adjusted max height */
}

.order-card {
  background-color: #f9f9f9;
  border: 1px solid #eee;
  padding: 12px;
  margin-bottom: 10px;
  border-radius: 6px;
  cursor: pointer;
}

.order-card:hover { background-color: #f0f0f0; }

.order-card text {
  display: block;
  font-size: 14px;
  margin-bottom: 4px;
  color: #333;
}
.order-id { font-weight: bold; color: #007aff; }
.status-text { font-weight: bold; }
.status-text.pending { color: #ff9800; }
.status-text.completed { color: #4caf50; }
.status-text.cancelled { color: #f44336; }

.view-detail-prompt{
    font-size: 12px;
    color: #007bff;
    text-align: right;
    margin-top: 5px;
}
</style>
