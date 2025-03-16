import { EventEmitter } from "events";
export const event = new EventEmitter();

import { customAlphabet } from "nanoid";
export const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXY", 12);

/**
 * @param {number} ms
 * @returns {Promise<void>} Promise
 */
export async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * @param {string} url
 * @param {number} timeout
 * @returns {Promise<Response>} Response
 */
export async function fetchWithTimeout(url = '/', timeout = 5000) {
  const controller = new AbortController();
  const { signal } = controller;

  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { signal });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn('Request timed out');
      return null;
    }
    throw error;
  }
}

/**
 * @param {Boolean} float Node only
 * @returns {number} Uptime
 */
export function uptime(float = false) {
  if (float) return process.uptime()
  return Math.round(process.uptime() * 100000);
}

/**
 * @param {number} tps Ticks per second
 * @returns {Function} Loop function
 */
export function loop(tps = 60) {
  let tickDuration = 1000 / tps;
  let lastTickTime = Date.now();
  let callbacks = [];
  let isRunning = false;
  let warningCounter = 0;

  async function loop() {
    if (!isRunning) return;

    const currentTime = Date.now();
    const deltaTime = currentTime - lastTickTime;

    if (deltaTime >= tickDuration) {
      lastTickTime = currentTime + (deltaTime % tickDuration);
      const start = Date.now();

      await Promise.all(callbacks.map(callback => callback(currentTime)));

      const processingTime = Date.now() - start;

      if (processingTime > tickDuration) {
        warningCounter++;
        if (warningCounter >= 5) {
          console.warn(`Can't keep up! This tick took ${processingTime}ms longer than ${tickDuration.toFixed(2)}ms`);
          warningCounter = 0;
        }
      } else {
        warningCounter = 0;
      }
    }

    setTimeout(loop, tickDuration - (Date.now() - currentTime));
  }

  function start() {
    if (!isRunning) {
      isRunning = true;
      loop();
    }
  }

  function funcLoop(callback) {
    callbacks.push(callback);
    start();
  }

  return funcLoop;
}

/**
 * @param {string} splitter Hash splitter Default: &
 * @returns {Object} Hash
 */

export function getHash(splitter) {
  let hash = window.location.hash;
  if (!hash) return null;
  hash = decodeURIComponent(hash);
  hash = hash.replace('#', '').split(splitter || '&');
  let obj = {};
  for (var kv = 0; kv < hash.length; kv++) {
    var flag = hash[kv].split("=");
    if (flag.length == 1) {
      obj[flag[0]] = true;
    } else {
      obj[flag[0]] = flag[1];
    }
  }
  return obj;

}

import MobileDetect from "mobile-detect";
import exp from "constants";
/**
 * 
 * @param {string} from data to detect. dafault: window.navigator.userAgent
 * @param {Boolean} more return all detect data
 * @returns 
 */
export function isMobile(from = window.navigator.userAgent, more = false) {
  const detect = new MobileDetect(from);
  if (more) return detect;
  return detect.phone()
}

/**
 * @param {Number} ratio_w ratio of width eg: 16
 * @param {Number} ratio_h ratio of height eg: 9
 * @param {Number} w viewport width. default: window.innerWidth
 * @param {Number} h viewport height. default: window.innerHeight
 * @returns 
 */
export function AutoRatio(ratio_w, ratio_h, w = window.innerWidth, h = window.innerHeight) {
  if (h > w / ratio_w * ratio_h)
    return {
      width: w,
      height: w / ratio_w * ratio_h,
      oritation: 'h'

    }
  return {
    width: h / ratio_h * ratio_w,
    height: h,
    oritation: 'w'

  }
}

export function isDarkMode() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
}