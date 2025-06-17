# uni-app 顶级保活与云端联动实施方案

## 1. 方案总览

### 1.1 目标
在不依赖第三方付费推送服务（如TPNS）的前提下，构建一款后台存活率极高、订单通知高度可靠的`uni-app`员工端应用。

### 1.2 核心技术路径
本方案采用客户端"三位一体"的顶级保活策略，并与云端数据库进行实时联动：
1.  **前台服务 (Foreground Service)**: 将应用提升至系统前台服务级别，获得极高运行优先级。
2.  **悬浮窗 (Floating Window)**: 作为前台服务的可视化载体，提供直观的状态展示和快捷操作，进一步"锚定"后台存活。
3.  **后台音频 (Background Audio)**: 作为兼容性双保险，在部分系统环境下持续"欺骗"系统，防止被休眠。
4.  **数据库实时监听 (Real-time Listener)**: App直接监听云数据库的 `Orders` 集合变化，作为接收新订单通知的核心机制。

---

## 2. App核心功能与云函数联动设计

本应用在运行期间，主要通过以下流程与云端交互。所有交互都围绕着`sql.yaml`中定义的数据表（集合）进行。

### 2.1 用户登录认证

*   **App动作**: 用户在登录页输入工号/用户名和密码，点击"登录"。
*   **调用云函数**: `staffLogin`
*   **云函数 `staffLogin` 职责**:
    1.  接收 `username` 和 `password` 参数。
    2.  访问 **`MerchantStaffs`** 数据表，根据 `username` 查询对应的员工记录。
    3.  如果找到员工，将传入的 `password` 与数据库中存储的加密密码进行比对。
    4.  验证成功，可以生成一个有长时效性的Token（如使用`jsonwebtoken`库）用于后续接口的安全验证。
*   **返回值**:
    *   **成功**:
        ```json
        {
          "success": true,
          "data": {
            "userId": "staff_id_xxx",
            "name": "员工姓名",
            "storeId": "store_id_xxx",
            "token": "a.b.c..." // 用于状态保持的JWT
          }
        }
        ```
    *   **失败**:
        ```json
        {
          "success": false,
          "message": "用户名或密码不正确"
        }
        ```

### 2.2 实时接收新订单

*   **App动作**: 用户登录成功后，App立即初始化并建立一个对 `Orders` 表的监听。
*   **调用方式**: **此功能不调用云函数**，而是直接使用`uni-app`云开发SDK的`watch()`方法。
*   **监听逻辑**:
    *   App对 **`Orders`** 数据表发起一个带有查询条件的`watch`请求，例如 `db.collection('Orders').where({ storeId: 'CURRENT_STORE_ID', status: 'pending' }).watch(...)`。
    *   当有符合条件的新订单被创建或更新时，数据库会将变更的文档实时推送到App。
    *   App的`watch`回调函数被触发，接收到新订单数据。
    *   App代码在回调函数内部，调用 **本地通知插件**，在手机通知栏创建一条有新的订单通知。

### 2.3 查看订单详情

*   **App动作**: 用户点击了通知栏里的某条订单通知，或在App内的订单列表里点击了某个订单。App会跳转到订单详情页。
*   **调用云函数**: `getOrderDetail`
*   **云函数 `getOrderDetail` 职责**:
    1.  接收一个 `orderId` 作为参数。
    2.  访问 **`Orders`** 数据表，根据 `_id` 等于传入的 `orderId`，查询唯一的订单文档。
*   **返回值**:
    *   **成功**:
        ```json
        {
          "success": true,
          "data": {
            "_id": "order_id_xxx",
            "tableName": "A01",
            "status": "pending",
            "totalAmount": 5800,
            "items": [
              {"productId": "p001", "name": "宫保鸡丁", "price": 3800, "quantity": 1},
              {"productId": "p002", "name": "米饭", "price": 200, "quantity": 2}
            ],
            "createdAt": "..."
          }
        }
        ```
    *   **失败**:
        ```json
        {
          "success": false,
          "message": "订单不存在或已无法查看"
        }
        ```

---

## 3. uni-app 端详细开发步骤

### Phase 1: 项目准备与权限配置
1.  **项目创建**: 使用HBuilderX创建基于Vue 3的uni-app项目。
2.  **权限配置 (`manifest.json`)**: 这是成功的基石。进入"App模块配置"和"App权限配置"，确保勾选并配置以下所有项：
    *   **模块**: `Audio (音频)`。
    *   **权限**: `android.permission.SYSTEM_ALERT_WINDOW` (悬浮窗)。
    *   **权限**: `android.permission.FOREGROUND_SERVICE` (前台服务，如果插件需要)。
    *   **设置**: 在"App常用其它设置"中，勾选"后台运行能力"，并确保其下的 **`background-audio`** 被选中。

### Phase 2: 核心功能与云端对接
1.  **登录实现**:
    *   创建登录页UI。
    *   在`api/user.js`中封装对 `staffLogin` 云函数的调用。
    *   登录成功后，将返回的`data`存入`pinia`或`vuex`进行状态管理，并将`token`和关键信息存入`uni.storage`持久化。
2.  **订单监听与本地通知**:
    *   在App启动且用户已登录时（或登录成功后），立即启动对`Orders`表的`watch`。
    *   从DCloud插件市场安装一个可靠的 **"本地通知"** 插件（搜索"local notification"）。
    *   在`watch`的`onChange`回调中，当`docChanges`里有新增订单时，立即调用本地通知插件的API，创建一条通知，并将`orderId`放入通知的附加信息（payload）中。

### Phase 3: 悬浮窗模块开发 (原生或uts)
1.  **权限申请**: 在App的核心页面（如主页）的`onLoad`或`onShow`中，加入动态申请悬浮窗权限的逻辑，引导用户去设置页手动开启。
2.  **插件开发 (推荐uts)**:
    *   创建一个`uts`插件，专门负责悬浮窗的管理。
    *   **主要API**:
        *   `show(options)`: 显示悬浮窗，可传入图标、初始位置等。
        *   `hide()`: 隐藏悬浮窗。
        *   `updateStatus(status)`: 更新悬浮窗的显示状态（如改变图标颜色）。
        *   `onClick(callback)`: 监听悬浮窗的点击事件。
    *   在`uts`代码中，使用安卓的`WindowManager`来创建和管理一个可拖拽的View。
    *   将悬浮窗的点击事件通过回调函数暴露给Vue页面，以便在Vue中处理点击逻辑（如"返回App"）。

### Phase 4: 顶级保活策略整合
此部分代码主要集中在`App.vue`。
1.  **全局实例**: 在`data`中定义`bgAudioManager` (背景音频播放器) 和 `floatingButton` (悬浮窗插件实例)。
2.  **App启动 (`onLaunch`)**:
    *   初始化音频播放器`bgAudioManager`，设置好无声音乐`silent.mp3`的路径和循环播放的逻辑。
    *   初始化`uts`悬浮窗插件。
3.  **进入后台 (`onHide`)**:
    *   调用`bgAudioManager.play()`开始播放无声音乐。
    *   调用`floatingButton.show()`显示悬浮窗。
    *   (如果使用前台服务插件) 调用API启动前台服务。
    *   **注意**: 数据库`watch`监听器不需要在这里启动，它应该在登录后就一直存在。
4.  **返回前台 (`onShow`)**:
    *   调用`bgAudioManager.stop()`停止播放音乐，节省资源。
    *   调用`floatingButton.hide()`隐藏悬浮窗。
    *   (如果使用前台服务插件) 调用API停止前台服务。

5.  *   **用户引导至上**: 必须创建一个图文并茂的"帮助"页面，引导用户为App开启"自启动"、"忽略电池优化"、"悬浮窗"这三大权限。这是决定方案成功率的关键。
 
