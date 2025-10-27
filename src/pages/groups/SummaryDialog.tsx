import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { User, MapPin, TrendingUp, Wallet, CreditCard, CheckCircle2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Group, Employee, Travel, Debt, Plate, Destination, Driver } from '@/types';
import {
  getEmployeeTravels,
  getEmployeeTotalWage,
  calculateEmployeeWage,
  getEmployeeTotalDebts,
  getGroupTravels,
  getEmployeePresentCount
} from './utils';

interface SummaryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group?: Group | null;
  travels: Travel[];
  employees: Employee[];
  debts: Debt[];
  plates: Plate[];
  destinations: Destination[];
  drivers: Driver[]; // ✅ Added
  onSelectEmployee?: (emp: Employee | null) => void;
}

export default function SummaryDialog({
  open,
  onOpenChange,
  group,
  travels,
  employees,
  debts,
  plates,
  destinations,
  drivers, // ✅ Added
  onSelectEmployee,
}: SummaryDialogProps) {
  const [selectedEmployee, setSelectedEmployee] = React.useState<Employee | null>(null);

  React.useEffect(() => {
    if (!open) setSelectedEmployee(null);
  }, [open]);

  if (!group) return null;

  const groupTravels = getGroupTravels(group.id, travels);

  // helper: get driver name and wage
  const getDriverInfo = (driverId: string) => {
    const employee = employees.find((e) => e.id === driverId);
    const driverObj = drivers.find((d) => d.employeeId === driverId);
    return {
      name: employee ? employee.name : 'Unknown Driver',
      wage: driverObj?.wage || 0,
    };
  };

  const getPlateName = (id: string) => plates.find((p) => p.id === id)?.name || 'Unknown Plate';
  const getDestinationName = (id: string) => destinations.find((d) => d.id === id)?.name || 'Unknown Destination';

  // 🧮 Compute total summary across all travels (includes driver wage)
  const totalSummary = groupTravels.reduce(
    (acc, travel) => {
      const sugarIncome = (travel.sugarcane_price || 0) * (travel.bags || 0);
      const molassesIncome = (travel.molasses_price || 0) * (travel.molasses || 0);
      const grossIncome = sugarIncome + molassesIncome;

      const driverInfo = getDriverInfo(travel.driver);
      const driverWage = driverInfo.wage;

      const totalWageForTravel =
        (travel.attendance || []).reduce(
          (sum, att) => sum + calculateEmployeeWage(travel, att.employeeId, [group]),
          0
        ) + driverWage;

      const travelExpenses = (travel.expenses || []).reduce((s, e) => s + (e.amount || 0), 0);
      const totalExpensesForTravel = totalWageForTravel + travelExpenses;
      const netIncome = grossIncome - totalExpensesForTravel;

      acc.totalGross += grossIncome;
      acc.totalWage += totalWageForTravel;
      acc.totalExpenses += totalExpensesForTravel;
      acc.totalNet += netIncome;
      return acc;
    },
    { totalGross: 0, totalWage: 0, totalExpenses: 0, totalNet: 0 }
  );

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) setSelectedEmployee(null); }}>
      <DialogContent className="max-w-7xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">EMPLOYEE AND INCOME SUMMARY</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="employees" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="employees">Employee Summary</TabsTrigger>
            <TabsTrigger value="income">Income Summary</TabsTrigger>
          </TabsList>

          {/* Employee Summary Tab */}
          <TabsContent value="employees" className="mt-6">
            <div className="grid grid-cols-3 gap-6 h-[calc(85vh-12rem)] overflow-hidden">
              {/* Employee List */}
              <div className="col-span-1 space-y-3 overflow-y-auto pr-2">
                <h3 className="font-semibold text-sm text-muted-foreground mb-4">Employees</h3>

                {[...group.employees]
                  .map((empId) => employees.find((e) => e.id === empId))
                  .filter((e): e is Employee => !!e)
                  .sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }))
                  .map((employee) => {
                    const empTravels = getEmployeeTravels(employee.id, group.id, travels);
                    const totalWage = getEmployeeTotalWage(employee.id, group.id, travels, [group]);
                    const totalTons = empTravels.reduce((s, t) => s + (t.tons || 0), 0);
                    const presentCount = empTravels.length;
                    const absentCount = groupTravels.length - presentCount;

                    return (
                      <Card
                        key={employee.id}
                        className={`cursor-pointer transition-all hover:shadow-md ${
                          selectedEmployee?.id === employee.id ? 'border-primary border-2' : ''
                        }`}
                        onClick={() => {
                          setSelectedEmployee(employee);
                          if (onSelectEmployee) onSelectEmployee(employee);
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <User className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-semibold text-sm">{employee.name}</h4>
                              <p className="text-xs text-muted-foreground">active • {employee.type}</p>

                              <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                                <div className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3 text-muted-foreground" />
                                  <span>{presentCount}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <TrendingUp className="w-3 h-3 text-muted-foreground" />
                                  <span>{totalTons.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>

                                <div className="col-span-2 flex items-center gap-1">
                                  <Wallet className="w-3 h-3 text-muted-foreground" />
                                  <span className="font-medium">₱{totalWage.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                                </div>

                                <div className="col-span-2 flex items-center gap-2 text-xs">
                                  <div className="flex items-center gap-1">
                                    <User className="w-3 h-3 text-green-600" />
                                    <span className="text-green-600">{presentCount}</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <User className="w-3 h-3 text-destructive" />
                                    <span className="text-destructive">{absentCount}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>

              {/* Employee Details */}
              <div className="col-span-2 overflow-y-auto">
                {selectedEmployee ? (
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <User className="w-8 h-8 text-primary" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold">{selectedEmployee.name}</h3>
                        <p className="text-muted-foreground">active • {selectedEmployee.type}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-5 gap-4">
                      <Card>
                        <CardContent className="p-4 text-center">
                          <MapPin className="w-5 h-5 text-blue-600 mx-auto mb-2" />
                          <p className="text-xs text-muted-foreground mb-1">Travels</p>
                          <p className="text-xl font-bold">{getEmployeeTravels(selectedEmployee.id, group.id, travels).length}</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4 text-center">
                          <TrendingUp className="w-5 h-5 text-green-600 mx-auto mb-2" />
                          <p className="text-xs text-muted-foreground mb-1">Tons</p>
                          <p className="text-xl font-bold">
                            {getEmployeeTravels(selectedEmployee.id, group.id, travels)
                              .reduce((sum, t) => sum + (t.tons || 0), 0)
                              .toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4 text-center">
                          <Wallet className="w-5 h-5 text-yellow-600 mx-auto mb-2" />
                          <p className="text-xs text-muted-foreground mb-1">Wage</p>
                          <p className="text-xl font-bold text-yellow-600">
                            ₱{getEmployeeTotalWage(selectedEmployee.id, group.id, travels, [group]).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4 text-center">
                          <CreditCard className="w-5 h-5 text-red-600 mx-auto mb-2" />
                          <p className="text-xs text-muted-foreground mb-1">Debts</p>
                          <p className="text-xl font-bold text-red-600">
                            ₱{getEmployeeTotalDebts(selectedEmployee.id, debts).toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardContent className="p-4 text-center">
                          <CheckCircle2 className="w-5 h-5 text-purple-600 mx-auto mb-2" />
                          <p className="text-xs text-muted-foreground mb-1">Attendance</p>
                          <div className="flex items-center justify-center gap-2">
                            <span className="text-lg font-bold text-green-600">
                              {getEmployeeTravels(selectedEmployee.id, group.id, travels).length}
                            </span>
                            <span className="text-lg font-bold text-destructive">
                              {groupTravels.length - getEmployeeTravels(selectedEmployee.id, group.id, travels).length}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Travel History */}
                    <div>
                      <h4 className="font-semibold mb-4">Travel History</h4>
                      <div className="space-y-3">
                        {getEmployeeTravels(selectedEmployee.id, group.id, travels).map((travel) => {
                          const wage = calculateEmployeeWage(travel, selectedEmployee.id, [group]);
                          const presentCount = getEmployeePresentCount(travel);
                          return (
                            <Card key={travel.id} className="hover:shadow-md transition-shadow">
                              <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-start gap-3 flex-1">
                                    <div className="w-2 h-2 rounded-full bg-green-600 mt-2" />
                                    <div className="flex-1">
                                      <h5 className="font-medium">{travel.name}</h5>
                                      <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                                        <span>({travel.tons} tons)</span>
                                        <span>•</span>
                                        <span>₱{group.wage}</span>
                                        <span>•</span>
                                        <span>{presentCount} present</span>
                                        <span>•</span>
                                        <Badge variant="outline" className="text-xs">Present</Badge>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-bold text-lg">
                                      ₱{wage.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </p>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <p>Select an employee to view details</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Income Summary Tab */}
          <TabsContent value="income" className="mt-6">
            <div className="space-y-6 max-h-[calc(85vh-12rem)] overflow-y-auto p-2">
              {[...groupTravels]
                .sort((a, b) => a.name.localeCompare(b.name))
                .map((travel) => {
                  const sugarIncome = (travel.sugarcane_price || 0) * (travel.bags || 0);
                  const molassesIncome = (travel.molasses_price || 0) * (travel.molasses || 0);
                  const grossIncome = sugarIncome + molassesIncome;

                  const driverInfo = getDriverInfo(travel.driver);
                  const driverWage = driverInfo.wage;

                  const totalWage =
                    (travel.attendance || []).reduce(
                      (sum, att) => sum + calculateEmployeeWage(travel, att.employeeId, [group]),
                      0
                    ) + driverWage;

                  const travelExpenses = (travel.expenses || []).reduce((s, e) => s + (e.amount || 0), 0);
                  const totalExpenses = totalWage + travelExpenses;
                  const netIncome = grossIncome - totalExpenses;

                  return (
                    <Card key={travel.id} className="border-2">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-bold mb-1">{travel.name}</h3>
                            <p className="text-sm text-muted-foreground">Ticket No: {travel.ticket || 'N/A'}</p>
                            <p className="text-xs text-muted-foreground mt-1">Weight: {travel.tons} tons</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Sugarcane Income: {travel.bags} * {travel.sugarcane_price} ={' '}
                              <span className="text-green-600">{(travel.bags || 0) * (travel.sugarcane_price || 0)}</span>
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Molasses Income: {travel.molasses} * {travel.molasses_price} ={' '}
                              <span className="text-green-600">{(travel.molasses || 0) * (travel.molasses_price || 0)}</span>
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Driver: {driverInfo.name} ={' '}
                              <span className="text-red-600">₱{driverInfo.wage.toLocaleString('en-PH')}</span>
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">Plate: {getPlateName(travel.plateNumber)}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Destination: {getDestinationName(travel.destination)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">PSTC: {travel.pstc}</p>
                          </div>

                          <div className="text-right space-y-1">
                            <p className="text-xs text-muted-foreground">Net Income</p>
                            <p className="text-2xl font-bold text-blue-600">
                              ₱{netIncome.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            <p className="text-xs text-green-600 mt-2">Income</p>
                            <p className="text-base font-semibold text-green-600">
                              ₱{grossIncome.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                            <p className="text-xs text-red-600 mt-2">Expenses</p>
                            <p className="text-base font-semibold text-red-600">
                              ₱{totalExpenses.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </p>
                          </div>
                        </div>

                        <div className="space-y-3 mt-4">
                          {travel.expenses && travel.expenses.length > 0 && (
                            <div className="border-t pt-3 mt-3">
                              <p className="text-sm font-semibold text-muted-foreground mb-2">Expenses:</p>
                              <div className="space-y-1">
                                {travel.expenses.map((exp, idx) => (
                                  <div key={idx} className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">{exp.name}</span>
                                    <span className="font-medium">
                                      ₱{exp.amount.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="border-t pt-3 mt-3 space-y-2">
                            <div className="flex justify-between text-sm font-semibold">
                              <span>Total Wages (incl. driver)</span>
                              <span className="text-orange-600">
                                ₱{totalWage.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm font-semibold">
                              <span>Other Expenses</span>
                              <span className="text-red-600">
                                ₱{travelExpenses.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                            <div className="flex justify-between text-sm font-semibold">
                              <span>Total Expenses</span>
                              <span className="text-red-700">
                                ₱{totalExpenses.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}

              {/* ✅ Grand Totals at the bottom */}
              <Card className="border-2 border-primary mt-8">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-4 text-primary">Overall Summary</h3>
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <p className="text-sm text-muted-foreground">Gross Income</p>
                      <p className="text-lg font-bold text-green-600">
                        ₱{totalSummary.totalGross.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Wages (incl. driver)</p>
                      <p className="text-lg font-bold text-orange-600">
                        ₱{totalSummary.totalWage.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Expenses and Wages</p>
                      <p className="text-lg font-bold text-red-600">
                        ₱{totalSummary.totalExpenses.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Net Income</p>
                      <p className="text-lg font-bold text-blue-600">
                        ₱{totalSummary.totalNet.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
