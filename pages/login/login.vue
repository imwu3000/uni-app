<template>
  <view class="login-container">
    <view class="login-form">
      <view class="form-item">
        <input type="text" v-model="username" placeholder="用户名/员工ID" class="input-field" :disabled="isLoading" />
      </view>
      <view class="form-item">
        <input type="password" v-model="password" placeholder="密码" class="input-field" :disabled="isLoading" />
      </view>
      <view v-if="errorMsg" class="form-item error-message">
        {{ errorMsg }}
      </view>
      <view class="form-item">
        <button @click="handleLogin" class="login-button" :disabled="isLoading">
          {{ isLoading ? '登录中...' : '登录' }}
        </button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { staffLogin } from '../../utils/api.js'; // Adjusted path

const username = ref('');
const password = ref('');
const isLoading = ref(false);
const errorMsg = ref('');

const handleLogin = async () => {
  if (!username.value || !password.value) {
    errorMsg.value = '请输入用户名和密码';
    return;
  }
  isLoading.value = true;
  errorMsg.value = '';

  try {
    const response = await staffLogin(username.value, password.value);
    if (response.success) {
      uni.setStorageSync('userInfo', response.data);
      uni.setStorageSync('token', response.data.token);

      uni.showToast({
        title: '登录成功',
        icon: 'success'
      });

      // Navigate to home page
      uni.reLaunch({ // Using reLaunch to prevent going back to login page
        url: '/pages/home/home'
      });
      console.log('Login successful, navigating to home page.');

    } else {
      // This case should ideally be handled by the catch block if staffLogin rejects on non-success
      errorMsg.value = response.message || '登录失败，请稍后再试';
    }
  } catch (err) {
    console.error('Login failed:', err);
    errorMsg.value = err.message || '登录时发生错误，请检查网络或联系管理员';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
}

.login-form {
  background-color: white;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 80%;
  max-width: 400px;
}

.form-item {
  margin-bottom: 20px;
}

.input-field {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-sizing: border-box;
}

.login-button {
  width: 100%;
  padding: 10px;
  background-color: #007aff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.login-button:hover {
  background-color: #0056b3;
}

.login-button:disabled {
  background-color: #cce0ff;
  cursor: not-allowed;
}

.error-message {
  color: red;
  font-size: 14px;
  text-align: center;
}
</style>
