// 通常のブラウザ localStorage を使った永続化ヘルパー
const SHEETS_KEY = "keisan:sheets";
const SETTINGS_KEY = "keisan:settings";
const USERS_KEY = "keisan:users";
const POINTS_KEY = "keisan:points";

export function loadSheets() {
  try {
    const raw = window.localStorage.getItem(SHEETS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveSheets(sheets) {
  try {
    window.localStorage.setItem(SHEETS_KEY, JSON.stringify(sheets));
  } catch (e) {
    console.error("プリント記録の保存に失敗しました", e);
  }
}

export function loadSettings() {
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

export function saveSettings(settings) {
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error("せっていの保存に失敗しました", e);
  }
}

export function loadUsers() {
  try {
    const raw = window.localStorage.getItem(USERS_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveUsers(users) {
  try {
    window.localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (e) {
    console.error("ユーザーの保存に失敗しました", e);
  }
}

export function loadPoints() {
  try {
    const raw = window.localStorage.getItem(POINTS_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

export function savePoints(points) {
  try {
    window.localStorage.setItem(POINTS_KEY, JSON.stringify(points));
  } catch (e) {
    console.error("ポイントの保存に失敗しました", e);
  }
}
