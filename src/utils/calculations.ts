import { Debt, Driver, Travel } from '@/types';

/**
 * Calculate total wage for a driver based on their travels
 */
export function calculateDriverTotalWage(driver: Driver, travels: Travel[]): number {
  const totalTrips = travels.length;
  const wage = driver.wage || 0;
  return wage * totalTrips;
}

/**
 * Calculate total unpaid debts for an employee
 */
export function calculateEmployeeTotalDebt(employeeId: string, debts: Debt[]): number {
  return debts
    .filter((d) => d.employeeId === employeeId && !d.paid)
    .reduce((sum, debt) => sum + debt.amount, 0);
}

/**
 * Calculate total of all unpaid debts
 */
export function calculateTotalUnpaidDebts(debts: Debt[]): number {
  return debts.filter((d) => !d.paid).reduce((sum, d) => sum + d.amount, 0);
}
