export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined' || !window.navigator) {
    return false;
  }

  const userAgent = window.navigator.userAgent.toLowerCase();
  
  const mobileKeywords = [
    'iphone',
    'ipod', 
    'ipad',
    'android',
    'blackberry',
    'windows phone',
    'webos',
    'mobile',
    'phone'
  ];

  return mobileKeywords.some(keyword => userAgent.includes(keyword));
};

export const getDeviceType = (): 'mobile' | 'desktop' => {
  return isMobileDevice() ? 'mobile' : 'desktop';
};

export const isTablet = (): boolean => {
  if (typeof window === 'undefined' || !window.navigator) {
    return false;
  }

  const userAgent = window.navigator.userAgent.toLowerCase();
  return userAgent.includes('ipad') || 
         (userAgent.includes('android') && !userAgent.includes('mobile'));
};

export const getViewportSize = () => {
  if (typeof window === 'undefined') {
    return { width: 0, height: 0 };
  }
  
  return {
    width: window.innerWidth,
    height: window.innerHeight
  };
};