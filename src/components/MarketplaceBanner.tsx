import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { adsService, type Ad } from "@/services/adsService";

const MarketplaceBanner = () => {
  const [currentAd, setCurrentAd] = useState<Ad | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const loadActiveAds = async () => {
      try {
        const ads = await adsService.getActiveMarketplaceAds();
        if (ads.length > 0) {
          // Select a random ad or the first one
          const randomAd = ads[Math.floor(Math.random() * ads.length)];
          setCurrentAd(randomAd);
          
          // Track impression
          await adsService.trackImpression(randomAd.id);
        }
      } catch (error) {
        console.error('Error loading marketplace ads:', error);
      }
    };

    loadActiveAds();
  }, []);

  const handleAdClick = async () => {
    if (currentAd) {
      try {
        await adsService.trackClick(currentAd.id);
        if (currentAd.target_url) {
          window.open(currentAd.target_url, '_blank');
        }
      } catch (error) {
        console.error('Error tracking click:', error);
      }
    }
  };

  const handleClose = () => {
    setIsVisible(false);
  };

  if (!isVisible || !currentAd) {
    return null;
  }

  return (
    <div className="relative bg-gradient-to-r from-primary to-primary-glow text-white p-4 rounded-lg shadow-lg mb-6">
      <button
        onClick={handleClose}
        className="absolute top-2 right-2 p-1 hover:bg-white/20 rounded-full transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
      
      <div 
        className="cursor-pointer"
        onClick={handleAdClick}
      >
        <div className="flex items-center gap-4">
          {currentAd.image_url && (
            <img 
              src={currentAd.image_url} 
              alt={currentAd.title}
              className="w-16 h-16 object-cover rounded-lg"
            />
          )}
          
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1">{currentAd.title}</h3>
            {currentAd.description && (
              <p className="text-white/90 text-sm">{currentAd.description}</p>
            )}
          </div>
        </div>
      </div>
      
      <div className="text-xs text-white/70 mt-2">
        Anuncio patrocinado
      </div>
    </div>
  );
};

export default MarketplaceBanner;