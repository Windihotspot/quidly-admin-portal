export const useMonths = () => {
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ]

  const getMonth = (dateString: string): string => {
    const d = new Date(dateString)
    return `${monthNames[d.getMonth()]} ${d.getFullYear()}`
  }

  const generateMonths = (): string[] => {
    const now = new Date()
    const months: string[] = []
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
      months.push(`${monthNames[d.getMonth()]} ${d.getFullYear()}`)
    }
    return months.reverse()
  }

  const getCurrentMonth = (): string => {
    const d = new Date()
    return `${monthNames[d.getMonth()]} ${d.getFullYear()}`
  }

  return { getMonth, generateMonths, getCurrentMonth }
}
