// Paste your unified Google deployment string link here
import { BASE_URL } from "./config.js";
const BASE_API_URL = `${BASE_URL}`;
const CACHE_KEY = "cineseat_session_cache";

/**
 * 🟢 READ: Fetch all rows from a specific worksheet
 * @param {string} sheetName - 'Movies' | 'Discounts' | 'Theatres' | 'Seats'
 */
export async function readTableData(sheetName) {
  const response = await fetch(`${BASE_API_URL}?sheetName=${sheetName}`);
  return await response.json();
}

/**
 * 🔵 CREATE: Add a row to a specific worksheet
 */
export async function createRow(sheetName, dataObject) {
  const response = await fetch(BASE_API_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "create",
      sheetName: sheetName,
      data: dataObject,
    }),
  });

  // Clear out client storage cache so the app syncs the new addition immediately
  sessionStorage.removeItem(CACHE_KEY);
  return await response.json();
}

/**
 * 🟡 UPDATE: Modify row items matching an explicit unique ID row tracker
 */
export async function updateRow(sheetName, uniqueId, fieldsToUpdateObject) {
  const response = await fetch(BASE_API_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "update",
      sheetName: sheetName,
      id: uniqueId,
      data: fieldsToUpdateObject,
    }),
  });

  sessionStorage.removeItem(CACHE_KEY);
  return await response.json();
}

/**
 * 🔴 DELETE: Strip a row entirely from a target spreadsheet view
 */
export async function deleteRow(sheetName, uniqueId) {
  const response = await fetch(BASE_API_URL, {
    method: "POST",
    body: JSON.stringify({
      action: "delete",
      sheetName: sheetName,
      id: uniqueId,
    }),
  });

  sessionStorage.removeItem(CACHE_KEY);
  return await response.json();
}
