import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

const DEFAULT_CURRENCIES = [
    { code: 'USD', name_en: 'US Dollar', name_ar: 'دولار أمريكي', symbol: '$', flag: '🇺🇸', rate_to_usd: 1.000000, sort_order: 1 },
    { code: 'EGP', name_en: 'Egyptian Pound', name_ar: 'جنيه مصري', symbol: 'E£', flag: '🇪🇬', rate_to_usd: 56.042101, sort_order: 2 },
    { code: 'EUR', name_en: 'Euro', name_ar: 'يورو أوروبي', symbol: '€', flag: '🇪🇺', rate_to_usd: 0.895934, sort_order: 3 },
    { code: 'SAR', name_en: 'Saudi Riyal', name_ar: 'ريال سعودي', symbol: 'SR', flag: '🇸🇦', rate_to_usd: 3.750000, sort_order: 4 },
    { code: 'AED', name_en: 'UAE Dirham', name_ar: 'درهم إماراتي', symbol: 'AED', flag: '🇦🇪', rate_to_usd: 3.672500, sort_order: 5 },
    { code: 'CNY', name_en: 'Chinese Yuan', name_ar: 'يوان صيني', symbol: '¥', flag: '🇨🇳', rate_to_usd: 6.676858, sort_order: 6 },
    { code: 'GBP', name_en: 'British Pound', name_ar: 'جنيه إسترليني', symbol: '£', flag: '🇬🇧', rate_to_usd: 0.749154, sort_order: 7 },
];

export function CurrencyProvider({ children }) {
    const [currentCurrency, setCurrentCurrencyState] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('freight_active_currency') || 'USD';
        }
        return 'USD';
    });

    const [rates, setRates] = useState(() => {
        const defaultMap = {};
        DEFAULT_CURRENCIES.forEach(c => { defaultMap[c.code] = c.rate_to_usd; });
        return defaultMap;
    });

    const [currencies, setCurrencies] = useState(DEFAULT_CURRENCIES);
    const [lastSyncedAt, setLastSyncedAt] = useState(() => new Date().toISOString());

    const [isSyncing, setIsSyncing] = useState(false);
    const [isLiveModalOpen, setIsLiveModalOpen] = useState(false);

    // Fetch freshest live rates and metadata on mount without depending on Inertia page context
    useEffect(() => {
        let isMounted = true;
        fetch('/api/exchange-rates')
            .then(res => res.json())
            .then(data => {
                if (!isMounted || !data) return;
                if (data.rates) setRates(data.rates);
                if (data.currencies) {
                    const list = Array.isArray(data.currencies) 
                        ? data.currencies 
                        : (typeof data.currencies === 'object' ? Object.values(data.currencies) : DEFAULT_CURRENCIES);
                    setCurrencies(list);
                }
                if (data.last_synced_at) setLastSyncedAt(data.last_synced_at);
            })
            .catch(() => {
                // Keep default rates if offline or during SSR
            });

        return () => {
            isMounted = false;
        };
    }, []);

    const currencyList = Array.isArray(currencies) 
        ? currencies 
        : (currencies && typeof currencies === 'object' ? Object.values(currencies) : DEFAULT_CURRENCIES);

    const setCurrency = (code) => {
        setCurrentCurrencyState(code);
        if (typeof window !== 'undefined') {
            localStorage.setItem('freight_active_currency', code);
        }
    };

    /**
     * Convert an amount between any two currencies.
     */
    const convert = (amount, fromCode = 'USD', toCode = currentCurrency) => {
        const num = parseFloat(amount) || 0;
        const fromRate = rates[fromCode] || 1.0;
        const toRate = rates[toCode] || 1.0;

        if (fromRate <= 0) return num;

        const inUsd = num / fromRate;
        return inUsd * toRate;
    };

    /**
     * Format money nicely in current active currency or explicit currency.
     */
    const formatMoney = (amount, sourceCurrency = 'USD', targetCurrency = currentCurrency, options = {}) => {
        const { showCode = true, showSymbol = true, decimals = 2 } = options;
        const converted = convert(amount, sourceCurrency, targetCurrency);
        const currObj = currencyList.find(c => c && c.code === targetCurrency) || { symbol: targetCurrency, code: targetCurrency };
        
        const formattedNumber = converted.toLocaleString(undefined, {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals,
        });

        if (showSymbol && showCode) {
            return `${currObj.symbol} ${formattedNumber} ${currObj.code}`;
        }
        if (showSymbol) {
            return `${currObj.symbol} ${formattedNumber}`;
        }
        return `${formattedNumber} ${currObj.code}`;
    };

    /**
     * Trigger live sync from international exchange rates API.
     */
    const refreshLiveRates = async () => {
        setIsSyncing(true);
        try {
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const res = await fetch('/api/exchange-rates/refresh', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': token || '',
                },
            });

            if (res.ok) {
                const data = await res.json();
                if (data.data?.rates) {
                    setRates(data.data.rates);
                }
                if (data.data?.currencies) {
                    const list = Array.isArray(data.data.currencies) 
                        ? data.data.currencies 
                        : (typeof data.data.currencies === 'object' ? Object.values(data.data.currencies) : DEFAULT_CURRENCIES);
                    setCurrencies(list);
                }
                if (data.data?.last_synced_at) {
                    setLastSyncedAt(data.data.last_synced_at);
                }
                return { success: true, message: data.message };
            }
        } catch (error) {
            console.error('Failed to sync live exchange rates:', error);
        } finally {
            setIsSyncing(false);
        }
        return { success: false, message: 'تعذر التحديث الحي' };
    };

    /**
     * Add and register a new currency.
     */
    const addCurrency = async (newCurrencyData) => {
        try {
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const res = await fetch('/api/exchange-rates', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': token || '',
                },
                body: JSON.stringify(newCurrencyData),
            });

            const data = await res.json();
            if (res.ok && data.success) {
                if (data.data?.rates) setRates(data.data.rates);
                if (data.data?.currencies) {
                    const list = Array.isArray(data.data.currencies) 
                        ? data.data.currencies 
                        : (typeof data.data.currencies === 'object' ? Object.values(data.data.currencies) : DEFAULT_CURRENCIES);
                    setCurrencies(list);
                }
                return { success: true, message: data.message };
            }
            return { success: false, message: data.message || 'حدث خطأ أثناء إضافة العملة.' };
        } catch (error) {
            console.error('Error adding currency:', error);
            return { success: false, message: 'تعذر إضافة العملة، تحقق من الاتصال.' };
        }
    };

    /**
     * Update an existing currency rate or configuration.
     */
    const updateCurrency = async (updateData) => {
        try {
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const res = await fetch('/api/exchange-rates/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': token || '',
                },
                body: JSON.stringify(updateData),
            });

            const data = await res.json();
            if (res.ok && data.success) {
                if (data.data?.rates) setRates(data.data.rates);
                if (data.data?.currencies) {
                    const list = Array.isArray(data.data.currencies) 
                        ? data.data.currencies 
                        : (typeof data.data.currencies === 'object' ? Object.values(data.data.currencies) : DEFAULT_CURRENCIES);
                    setCurrencies(list);
                }
                return { success: true, message: data.message };
            }
            return { success: false, message: data.message || 'فشل تعديل العملة.' };
        } catch (error) {
            console.error('Error updating currency:', error);
            return { success: false, message: 'تعذر تعديل العملة.' };
        }
    };

    /**
     * Delete a custom currency.
     */
    const deleteCurrency = async (code) => {
        try {
            const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const res = await fetch(`/api/exchange-rates/${code}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': token || '',
                },
            });

            const data = await res.json();
            if (res.ok && data.success) {
                if (data.data?.rates) setRates(data.data.rates);
                if (data.data?.currencies) {
                    const list = Array.isArray(data.data.currencies) 
                        ? data.data.currencies 
                        : (typeof data.data.currencies === 'object' ? Object.values(data.data.currencies) : DEFAULT_CURRENCIES);
                    setCurrencies(list);
                }
                if (currentCurrency === code) {
                    setCurrency('USD');
                }
                return { success: true, message: data.message };
            }
            return { success: false, message: data.message || 'فشل حذف العملة.' };
        } catch (error) {
            console.error('Error deleting currency:', error);
            return { success: false, message: 'تعذر حذف العملة.' };
        }
    };

    const activeCurrencyObj = currencyList.find(c => c && c.code === currentCurrency) || currencyList[0] || DEFAULT_CURRENCIES[0];

    return (
        <CurrencyContext.Provider value={{
            currentCurrency,
            setCurrency,
            activeCurrency: activeCurrencyObj,
            rates,
            currencies: currencyList,
            lastSyncedAt,
            isSyncing,
            convert,
            formatMoney,
            refreshLiveRates,
            addCurrency,
            updateCurrency,
            deleteCurrency,
            isLiveModalOpen,
            setIsLiveModalOpen,
        }}>
            {children}
        </CurrencyContext.Provider>
    );
}

export function useCurrency() {
    const context = useContext(CurrencyContext);
    if (!context) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
}
