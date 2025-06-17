<script setup lang="ts">
import { onLaunch, onShow, onHide } from '@dcloudio/uni-app';
import {
  show as showFloatingWindow,
  hide as hideFloatingWindow,
  onButtonClick as onFloatingButtonClick,
  isOverlayPermissionGranted
} from './utssdk/floating-window'; // Assuming utssdk is at the root

let bgAudioManager: UniApp.BackgroundAudioManager | null = null;
let isAppInBackground: boolean = false;
let appLaunchOptions: App.LaunchShowOption | null = null; // To store launch options if needed later

console.log('App.vue script executing');

onLaunch((options: App.LaunchShowOption) => {
  console.log('App onLaunch - Application launched.', options);
  appLaunchOptions = options;
  isAppInBackground = false;

  // Initialize Background Audio Manager
  bgAudioManager = uni.getBackgroundAudioManager();
  if (bgAudioManager) {
    bgAudioManager.title = '应用运行中'; // App Running
    bgAudioManager.singer = '后台服务';    // Background Service
    // bgAudioManager.coverImgUrl = '/static/logo.png'; // Optional: if you have a logo
    bgAudioManager.src = '/static/silent.mp3'; // IMPORTANT: Path to the silent audio file
    bgAudioManager.loop = true;
    bgAudioManager.autoplay = false; // Do not play immediately

    console.log('App.vue: BackgroundAudioManager configured with src:', bgAudioManager.src);

    // Setup audio manager event listeners
    bgAudioManager.onPlay(() => {
      console.log('App.vue: Background audio playback started.');
    });
    bgAudioManager.onStop(() => {
      console.log('App.vue: Background audio playback stopped.');
    });
    bgAudioManager.onError((err: any) => {
      console.error('App.vue: Background audio error:', err);
    });
    bgAudioManager.onEnded(() => {
      console.log('App.vue: Background audio ended.');
      if (isAppInBackground && bgAudioManager && bgAudioManager.loop) {
        console.log('App.vue: Background audio ended, loop is true, should restart automatically.');
      }
    });
     bgAudioManager.onWaiting(() => {
      console.log('App.vue: Background audio waiting for data (buffering).');
    });

  } else {
    console.error('App.vue: Failed to get BackgroundAudioManager.');
  }

  // Setup Floating Window Click Listener
  onFloatingButtonClick(() => {
    console.log('App.vue: Floating window clicked!');
    // Attempt to bring app to foreground by navigating to the home page
    uni.reLaunch({
      url: '/pages/home/home', // Ensure this is your main/entry page after login
      success: () => {
        console.log('App.vue: Successfully navigated to home page from floating button.');
        // The onShow lifecycle in App.vue should then handle hiding the floating window
        // and stopping background audio if those are desired behaviors.
      },
      fail: (err) => {
        console.error('App.vue: Failed to navigate to home page from floating button:', err);
        // Fallback toast if navigation somehow fails
        uni.showToast({
          title: '欢迎回来!', // Generic message if navigation fails
          icon: 'none'
        });
      }
    });
  });

  console.log('App onLaunch complete.');
});

onShow((options: App.LaunchShowOption) => {
  console.log('App onShow - Application shown.', options);
  isAppInBackground = false;

  if (bgAudioManager) {
    console.log('App.vue: Stopping background audio.');
    bgAudioManager.stop();
  }

  if (uni.getSystemInfoSync().platform === 'android') {
    console.log('App.vue: Hiding floating window on app show.');
    hideFloatingWindow();
  }
  console.log('App onShow complete.');
});

onHide(() => {
  console.log('App onHide - Application hidden.');
  isAppInBackground = true;

  if (bgAudioManager && bgAudioManager.src) {
    console.log('App.vue: Starting background audio playback.');
    bgAudioManager.seek(0);
    bgAudioManager.play();
  } else {
    console.warn('App.vue: bgAudioManager not ready or src not set, cannot play audio in background.');
  }

  if (uni.getSystemInfoSync().platform === 'android') {
    if (isOverlayPermissionGranted()) {
      console.log('App.vue: Showing floating window on app hide.');
      showFloatingWindow({ x: 100, y: uni.getSystemInfoSync().screenHeight / 2, text: "运行中", textSize: 16.0 });
    } else {
      console.warn('App.vue: Cannot show floating window in background, overlay permission not granted.');
    }
  }
  console.log('App onHide complete.');
});

</script>

<style>
/* Global styles can be defined here */
</style>
