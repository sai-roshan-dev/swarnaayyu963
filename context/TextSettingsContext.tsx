import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

type TextSizeType = 'Small' | 'Medium' | 'Large';

interface TextSizeContextType {
  textSize: TextSizeType;
  setTextSize: (size: TextSizeType) => void;
  getFontSize: () => number;
}

const TextSizeContext = createContext<TextSizeContextType | undefined>(undefined);

export const TextSizeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [textSize, setTextSizeState] = useState<TextSizeType>('Medium');

  useEffect(() => {
    // Load saved text size from secure store
    const loadTextSize = async () => {
      try {
        const savedTextSize = await SecureStore.getItemAsync('text_size');
        if (savedTextSize && ['Small', 'Medium', 'Large'].includes(savedTextSize)) {
          setTextSizeState(savedTextSize as TextSizeType);
        }
      } catch (error) {
        console.error('Error loading text size:', error);
      }
    };
    loadTextSize();
  }, []);

  const setTextSize = async (size: TextSizeType) => {
    setTextSizeState(size);
    try {
      await SecureStore.setItemAsync('text_size', size);
    } catch (error) {
      console.error('Error saving text size:', error);
    }
  };

  const getFontSize = () => {
    switch (textSize) {
      case 'Small': return 12;
      case 'Large': return 17;
      default: return 14;
    }
  };

  return (
    <TextSizeContext.Provider value={{ textSize, setTextSize, getFontSize }}>
      {children}
    </TextSizeContext.Provider>
  );
};

export const useTextSize = () => {
  const context = useContext(TextSizeContext);
  if (context === undefined) {
    throw new Error('useTextSize must be used within a TextSizeProvider');
  }
  return context;
}; 