<template>
  <scroll-view scroll-y class="help-container">
    <view class="header">
      <text class="header-title">应用权限与设置指南</text>
      <text class="header-subtitle">为了确保应用能够稳定接收订单并及时通知，请按照以下步骤检查并设置相关权限。</text>
    </view>

    <!-- Auto-start Permission -->
    <view class="card">
      <text class="card-title">1. 开启自启动权限</text>
      <view class="card-content">
        <text class="description">
          允许应用在手机启动后自动运行，确保服务能及时启动，对于实时接收订单至关重要。
        </text>
        <text class="instructions-title">设置方法：</text>
        <text class="instructions">
          通常路径为：“手机管家”或“设置” -> “应用管理” -> “[本应用名称]” -> “自启动管理”或“自动启动”，然后允许自启动。
          <br/>(不同品牌手机路径可能略有差异，如小米的“神隐模式”，华为的“应用启动管理”等)
        </text>
        <view class="placeholder-image">
          <text>[示例图片：自启动设置界面]</text>
        </view>
        <button class="settings-button" @click="openAppSettings('auto_start')">尝试跳转到应用设置</button>
      </view>
    </view>

    <!-- Ignore Battery Optimization -->
    <view class="card">
      <text class="card-title">2. 忽略电池优化</text>
      <view class="card-content">
        <text class="description">
          部分手机的省电策略可能会限制应用的后台活动。将本应用设置为“无限制”或“不优化电池”可以避免服务被系统中断。
        </text>
        <text class="instructions-title">设置方法：</text>
        <text class="instructions">
          通常路径为：“设置” -> “应用管理” -> “[本应用名称]” -> “电池”或“耗电管理” -> “电池优化”或“应用耗电管理”，选择本应用并设置为“不受限制”、“允许后台高耗电”或“不优化”。
        </text>
        <view class="placeholder-image">
          <text>[示例图片：电池优化设置界面]</text>
        </view>
        <button class="settings-button" @click="openAppSettings('battery_optimization')">尝试跳转到应用设置</button>
      </view>
    </view>

    <!-- Floating Window Permission -->
    <view class="card">
      <text class="card-title">3. 悬浮窗权限 (显示在其他应用上层)</text>
      <view class="card-content">
        <text class="description">
          悬浮窗权限用于在应用退至后台时，显示一个小的浮动图标，帮助应用保持活性，并提供快捷返回应用的入口。
        </text>
        <text class="instructions-title">设置方法：</text>
        <text class="instructions">
          通常路径为：“设置” -> “应用管理” -> “[本应用名称]” -> “权限管理” -> “显示在其他应用上层”或“悬浮窗权限”，然后允许此权限。
        </text>
        <view class="placeholder-image">
          <text>[示例图片：悬浮窗权限设置界面]</text>
        </view>
        <button class="settings-button" @click="openAppSettings('floating_window')">尝试跳转到应用设置</button>
      </view>
    </view>

    <!-- Background Activity Permission (General) -->
    <view class="card">
      <text class="card-title">4. 后台活动权限</text>
      <view class="card-content">
        <text class="description">
          某些系统有单独的后台活动权限设置，确保应用可以在后台联网和执行任务。
        </text>
        <text class="instructions-title">设置方法：</text>
        <text class="instructions">
          通常路径为：“设置” -> “应用管理” -> “[本应用名称]” -> “权限管理” -> “后台活动”或“后台数据”。确保允许。
        </text>
        <view class="placeholder-image">
          <text>[示例图片：后台活动权限设置界面]</text>
        </view>
        <button class="settings-button" @click="openAppSettings('background_activity')">尝试跳转到应用设置</button>
      </view>
    </view>

    <view class="general-note">
      <text>提示：不同手机品牌和操作系统版本的设置路径和名称可能有所不同。如果上述路径不符，请尝试在系统设置中搜索相关关键词，或查阅手机品牌的用户手册。授予这些权限有助于提升订单接收的及时性和应用的稳定性。</text>
    </view>
     <button class="back-button" @click="goBack">返回</button>
  </scroll-view>
</template>

<script setup lang="ts">
const openAppSettings = (settingType: string) => {
  console.log(`Attempting to open app settings for: ${settingType}`);
  uni.openAppAuthorizeSetting({
    success: (res) => {
      console.log('Successfully opened app authorize settings:', res);
      uni.showToast({
        title: '已尝试打开设置',
        icon: 'none'
      });
    },
    fail: (err) => {
      console.error('Failed to open app authorize settings:', err);
      uni.showToast({
        title: '无法直接打开设置，请手动前往系统设置查找。',
        icon: 'none',
        duration: 3000
      });
    }
  });
};

const goBack = () => {
    uni.navigateBack();
}
</script>

<style scoped>
.help-container {
  background-color: #f4f4f8;
  padding: 15px;
  min-height: 100vh;
  box-sizing: border-box;
}

.header {
  background-color: #007aff;
  color: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  text-align: center;
}

.header-title {
  font-size: 20px;
  font-weight: bold;
  display: block;
  margin-bottom: 5px;
}

.header-subtitle {
  font-size: 14px;
  display: block;
}

.card {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 15px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.card-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
  display: block;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
}

.card-content .description {
  font-size: 15px;
  color: #555;
  line-height: 1.6;
  display: block;
  margin-bottom: 10px;
}

.card-content .instructions-title {
  font-size: 15px;
  font-weight: bold;
  color: #333;
  margin-top: 10px;
  margin-bottom: 5px;
  display: block;
}

.card-content .instructions {
  font-size: 14px;
  color: #666;
  line-height: 1.5;
  display: block;
  margin-bottom: 10px;
}

.placeholder-image {
  background-color: #e0e0e0;
  color: #777;
  text-align: center;
  padding: 20px;
  border-radius: 4px;
  margin: 10px 0;
  font-size: 14px;
}

.settings-button {
  display: block;
  width: calc(100% - 30px);
  margin: 15px auto 5px auto;
  padding: 10px;
  background-color: #007aff;
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 15px;
  text-align: center;
}
.settings-button:hover {
  background-color: #0056b3;
}

.general-note {
  background-color: #fffbe6;
  border: 1px solid #ffe58f;
  color: #8a6d3b;
  padding: 15px;
  border-radius: 4px;
  font-size: 13px;
  line-height: 1.6;
  margin-top: 20px;
  text-align: center;
}
.back-button {
  display: block;
  width: calc(100% - 30px);
  margin: 20px auto 10px auto;
  padding: 12px;
  background-color: #6c757d; /* Gray color */
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  text-align: center;
}
.back-button:hover {
    background-color: #545b62;
}
</style>
