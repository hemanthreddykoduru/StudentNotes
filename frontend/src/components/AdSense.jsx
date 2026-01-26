import { useEffect } from 'react';

/**
 * AdSense Component - Displays Google AdSense ads
 * @param {string} adSlot - The ad unit slot ID from AdSense
 * @param {string} adFormat - Ad format (auto, rectangle, horizontal, vertical)
 * @param {boolean} fullWidthResponsive - Enable full width responsive ads
 */
export default function AdSense({ 
    adSlot, 
    adFormat = 'auto', 
    fullWidthResponsive = true 
}) {
    useEffect(() => {
        try {
            // Push ad to AdSense
            if (window.adsbygoogle && process.env.NODE_ENV === 'production') {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            }
        } catch (error) {
            console.error('AdSense error:', error);
        }
    }, []);

    // Only show ads in production
    if (process.env.NODE_ENV !== 'production') {
        return (
            <div className="bg-gray-100 dark:bg-gray-800 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center">
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                    Ad Placeholder (Development Mode)
                </p>
            </div>
        );
    }

    return (
        <div className="adsense-container my-4">
            <ins 
                className="adsbygoogle"
                style={{ display: 'block' }}
                data-ad-client="ca-pub-6334356671488767"
                data-ad-slot={adSlot}
                data-ad-format={adFormat}
                data-full-width-responsive={fullWidthResponsive.toString()}
            />
        </div>
    );
}
