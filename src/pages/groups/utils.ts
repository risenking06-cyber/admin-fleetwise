
import { Travel, Group, Employee, Debt } from '@/types';

/**
 * Utility helpers extracted from the original file.
 * These are pure functions and intentionally do not touch Firestore or React.
 */

export const getEmployeeNames = (employeeIds: string[], employees: Employee[]) =>
  employeeIds
    .map((id) => employees.find((e) => e.id === id)?.name)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }))
    .join(', ');

export const getGroupTravels = (groupId: string, travels: Travel[]) =>
  travels.filter((t) => t.groupId === groupId);

export const getEmployeePresentCount = (travel: Travel) =>
  (travel.attendance || []).filter((a) => a.present).length;

export const calculateEmployeeWage = (travel: Travel, employeeId: string, groups: Group[]) => {
  const group = groups.find((g) => g.id === travel.groupId);
  if (!group) return 0;
  const attendance = (travel.attendance || []).find((a) => a.employeeId === employeeId);
  if (!attendance || !attendance.present) return 0;
  const presentCount = getEmployeePresentCount(travel);
  if (presentCount === 0) return 0;
  return (group.wage * (travel.tons || 0)) / presentCount;
};

export const getEmployeeTravels = (employeeId: string, groupId: string, travels: Travel[]) =>
  travels.filter((travel) => {
    if (travel.groupId !== groupId) return false;
    const attendance = (travel.attendance || []).find((a) => a.employeeId === employeeId);
    return attendance?.present;
  });

export const getEmployeeTotalWage = (employeeId: string, groupId: string, travels: Travel[], groups: Group[]) =>
  getEmployeeTravels(employeeId, groupId, travels).reduce(
    (total, t) => total + calculateEmployeeWage(t, employeeId, groups),
    0
  );

// ✅ Get all debts of a specific employee (optional filter)
export const getEmployeeDebts = (employeeId: string, debts: Debt[], includePaid = true) => {
  return debts.filter(
    (d) => d.employeeId === employeeId && (includePaid || !d.paid) // only unpaid if includePaid = false
  );
};

// ✅ Get total of UNPAID debts only
export const getEmployeeTotalDebts = (employeeId: string, debts: Debt[]) => {
  return debts
    .filter((d) => d.employeeId === employeeId && !d.paid)
    .reduce((sum, d) => sum + (d.amount || 0), 0);
};
