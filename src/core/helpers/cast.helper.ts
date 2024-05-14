import Decimal from 'decimal.js';
import { number } from 'joi';

interface ToNumberOptions {
  default?: number;
  min?: number;
  max?: number;
}

export function toString(value: any): string {
  return value?.toString() || '';
}
export function encodeUUID(uuid) {
    // Split UUID into an array of hexadecimal components
    const hexArray = uuid.split('-');
    // Reverse the order of components for encoding
    const reversedHexArray = hexArray.reverse();
    // Join the reversed hexadecimal components with '_'
    return reversedHexArray.join('_');
}

// Decode encoded UUID
export function decodeUUID(encodedUUID) {
    // Split the encoded UUID into an array of components using '_'
    const encodedArray = encodedUUID.split('_');
    // Reverse the order of components to get the original UUID format
    const reversedEncodedArray = encodedArray.reverse();
    // Join the reversed components into a standard UUID format
    return reversedEncodedArray.join('-');
}
export function toLowerCase(value: string): string {
  return value.toLowerCase() || '';
}
export function reverseSentence(sentence) {
  // Split the sentence into an array of words
  const words = sentence.split(' ');

  // Reverse the array of words
  const reversedWords = words.reverse();

  // Join the reversed words back into a single sentence
  const reversedSentence = reversedWords.join(' ');

  // Return the reversed sentence
  return reversedSentence;
}

export function calculateSum(numbers: number[]): number {
  return numbers.reduce((sum, num) => sum + num, 0);
}
export function trim(value: string): string {
  return value.trim();
}

export function toDate(value: string): Date {
  return new Date(value);
}

export function toBoolean(value: string): boolean {
  value = value.toLowerCase();

  return value === 'true' || value === '1' ? true : false;
}

export function toRightNumber(
  value: string,
  opts: ToNumberOptions = {},
): number {
  let newValue: number = Number.parseInt(value || String(opts.default));

  if (Number.isNaN(newValue)) {
    newValue = opts.default;
  }

  if (opts.min) {
    if (newValue < opts.min) {
      newValue = opts.min;
    }

    if (newValue > opts.max) {
      newValue = opts.max;
    }
  }

  return newValue;
}

export function decimalToString(value: Decimal, decimals = 2): string {
  return value?.toFixed(decimals);
}

const randStr = (length: number) => {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const randNum = (length = 1) => {
  let result = '';
  const characters = '0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result.toString();
};

// function to ensure that the value is an array if single value is passed
export function ensureArray<T>(value: T | T[]): T[] {
  return Array.isArray(value) ? value : [value];
}

export function getDate(days: string) {
  return new Date(new Date().getTime() + Number(days) * 60 * 60 * 24 * 1000);
}

export function hourToDate(hour: number, date: string): Date {
  const currentDate = new Date(
    Number(date.split('-')[0]),
    Number(date.split('-')[1]) - 1,
    Number(date.split('-')[2]),
  );
  const options = { timeZone: 'Asia/Riyadh' };
  const ksaDate = new Date(currentDate.toLocaleString('en-US', options));

  ksaDate.setHours(hour - 3);
  const mins = Number(String(hour).split('.')[1]);
  ksaDate.setMinutes(30 + mins);

  return ksaDate;
}

export { randStr, randNum };
