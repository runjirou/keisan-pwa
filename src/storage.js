// 通常のブラウザ localStorage を使った永続化ヘルパー
const SHEETS_KEY = "keisan:sheets";
const SETTINGS_KEY = "keisan:settings";

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
