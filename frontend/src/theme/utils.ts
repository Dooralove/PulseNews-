// Utility functions for styling

export const clsx = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

export const getCategoryColor = (categoryName: string): string => {
  const categoryMap: Record<string, string> = {
    'политика': '#0066CC',
    'технологии': '#7B1FA2',
    'спорт': '#388E3C',
    'бизнес': '#D84315',
    'культура': '#C2185B',
    'здоровье': '#00897B',
    'наука': '#5E35B1',
    'мир': '#E64A19',
    // English variants
    'politics': '#0066CC',
    'technology': '#7B1FA2',
    'sports': '#388E3C',
    'business': '#D84315',
    'culture': '#C2185B',
    'health': '#00897B',
    'science': '#5E35B1',
    'world': '#E64A19',
  };
  
  return categoryMap[categoryName.toLowerCase()] || '#1976D2';
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

export const formatReadingTime = (minutes: number): string => {
  if (minutes < 1) return 'Меньше минуты';
  if (minutes === 1) return '1 минута';
  if (minutes < 5) return `${minutes} минуты`;
  return `${minutes} минут`;
};
