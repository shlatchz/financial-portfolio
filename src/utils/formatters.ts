import { APP_CONFIG } from '../config/constants';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat(APP_CONFIG.FORMATS.LOCALE, {
    style: 'currency',
    currency: APP_CONFIG.FORMATS.CURRENCY,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatAmount = (amount: number): string => {
  return new Intl.NumberFormat(APP_CONFIG.FORMATS.LOCALE, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

export const formatPercentage = (value: number, precision: number = 1): string => {
  return `${value.toFixed(precision)}%`;
};

export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString(APP_CONFIG.FORMATS.LOCALE, APP_CONFIG.FORMATS.DATE_FORMAT_OPTIONS);
};

export const formatNumber = (value: number, precision: number = APP_CONFIG.PORTFOLIO.PRECISION): string => {
  return new Intl.NumberFormat(APP_CONFIG.FORMATS.LOCALE, {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision
  }).format(value);
}; 