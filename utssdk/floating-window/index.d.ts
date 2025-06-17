/**
 * Options for showing the floating window.
 */
export interface ShowOptions {
  /** Initial X position of the window. Default is 100. */
  x?: number;
  /** Initial Y position of the window. Default is 100. */
  y?: number;
  /** Text to display in the floating window. Default is "●". */
  text?: string;
  /** Font size for the text. Default is 40.0. */
  textSize?: number;
  /** Placeholder for future icon customization (e.g., path to an image). */
  icon?: string;
  // Add other customizable options as needed, e.g., text color, background color
}

/**
 * Checks if the SYSTEM_ALERT_WINDOW permission (to display over other apps) is granted.
 * @returns `true` if permission is granted or if the Android version is below M (where it's granted by default), `false` otherwise.
 */
export function isOverlayPermissionGranted(): boolean;

/**
 * Attempts to guide the user to the settings page to grant overlay permission if it's not already granted.
 * On Android, this typically involves opening the app's specific settings page for "Display over other apps".
 * Due to system restrictions, direct granting of permission is not possible; user interaction is required.
 * If `uni.openAppAuthorizeSetting` is supported and works, it will be used. Otherwise, a toast message will guide the user.
 */
export function requestOverlayPermission(): void;

/**
 * Shows the floating window.
 * Before showing, it checks for `SYSTEM_ALERT_WINDOW` permission. If not granted, it will attempt to
 * guide the user to grant it via `requestOverlayPermission()` and then abort showing the window
 * for the current call (user needs to grant permission and try again).
 * @param options Optional parameters for initial position, text, size, icon, etc.
 */
export function show(options?: ShowOptions): void;

/**
 * Hides the floating window if it is currently visible.
 */
export function hide(): void;

/**
 * Registers a callback function to be invoked when the floating window (button) is clicked.
 * @param callback The function to execute on click. It receives no arguments.
 */
export function onButtonClick(callback: () => void): void;

/**
 * Updates the displayed status or text on the floating window.
 * If the floating window is currently a simple text view, this updates its text.
 * @param statusText The new text or status identifier to display.
 */
export function updateStatus(statusText: string): void;
