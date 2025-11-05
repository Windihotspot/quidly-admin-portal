export const useQuarters = () => {
  const getCurrentQuarter = (): string => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    
    if (month >= 1 && month <= 3) return `Q1 ${year}`;
    if (month >= 4 && month <= 6) return `Q2 ${year}`;
    if (month >= 7 && month <= 9) return `Q3 ${year}`;
    return `Q4 ${year}`;
  };

  const generateQuarters = (): string[] => {
    const quarters: string[] = [];
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    
    let year = currentYear;
    let quarter = Math.ceil(currentMonth / 3);
    
    // Generate last 8 quarters
    for (let i = 0; i < 8; i++) {
      quarters.unshift(`Q${quarter} ${year}`);
      quarter--;
      if (quarter === 0) {
        quarter = 4;
        year--;
      }
    }
    
    return quarters;
  };

  const getQuarter = (dateString: string): string => {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    
    if (month >= 1 && month <= 3) return `Q1 ${year}`;
    if (month >= 4 && month <= 6) return `Q2 ${year}`;
    if (month >= 7 && month <= 9) return `Q3 ${year}`;
    return `Q4 ${year}`;
  };

  const getQuarterLabel = (quarter: string): string => {
    return quarter.replace(' ', ' ');
  };

  return {
    getCurrentQuarter,
    generateQuarters,
    getQuarter,
    getQuarterLabel
  };
};
