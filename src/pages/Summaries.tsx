import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Travel, Group, Employee } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UsersRound, User, MapPin, TrendingUp, Wallet, CreditCard, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

export default function Summaries() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [travels, setTravels] = useState<Travel[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [groupsData, employeesData, travelsData] = await Promise.all([
        getDocs(collection(db, 'groups')),
        getDocs(collection(db, 'employees')),
        getDocs(collection(db, 'travels')),
      ]);

      setGroups(groupsData.docs.map(doc => ({ id: doc.id, ...doc.data() } as Group)));
      setEmployees(employeesData.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee)));
      setTravels(travelsData.docs.map(doc => ({ id: doc.id, ...doc.data() } as Travel)));
    } catch (error) {
      toast.error('Failed to fetch data');
    }
  };

  const getGroupTravels = (groupId: string) => {
    return travels.filter(travel => 
      travel.groups?.some(g => g.groupId === groupId)
    );
  };

  const getEmployeePresentCount = (travel: Travel, groupId: string) => {
    const travelGroup = travel.groups?.find(g => g.groupId === groupId);
    if (!travelGroup) return 0;
    return travelGroup.attendance.filter(a => a.present).length;
  };

  const calculateEmployeeWage = (travel: Travel, employeeId: string, groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return 0;

    const travelGroup = travel.groups?.find(g => g.groupId === groupId);
    if (!travelGroup) return 0;

    const attendance = travelGroup.attendance.find(a => a.employeeId === employeeId);
    if (!attendance || !attendance.present) return 0;

    const presentCount = getEmployeePresentCount(travel, groupId);
    if (presentCount === 0) return 0;

    return (group.wage * (travel.tons || 0)) / presentCount;
  };

  const getEmployeeTravels = (employeeId: string, groupId: string) => {
    return travels.filter(travel => {
      const travelGroup = travel.groups?.find(g => g.groupId === groupId);
      if (!travelGroup) return false;
      const attendance = travelGroup.attendance.find(a => a.employeeId === employeeId);
      return attendance?.present;
    });
  };

  const getEmployeeTotalWage = (employeeId: string, groupId: string) => {
    const employeeTravels = getEmployeeTravels(employeeId, groupId);
    return employeeTravels.reduce((total, travel) => {
      return total + calculateEmployeeWage(travel, employeeId, groupId);
    }, 0);
  };

  const handleGroupClick = (group: Group) => {
    setSelectedGroup(group);
    setSelectedEmployee(null);
    setGroupDialogOpen(true);
  };

  const handleEmployeeClick = (employee: Employee) => {
    setSelectedEmployee(employee);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-2">Summaries</h1>
        <p className="text-muted-foreground">View wage summaries by group</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {groups.map(group => {
          const groupTravels = getGroupTravels(group.id);
          return (
            <Card 
              key={group.id} 
              className="cursor-pointer hover:shadow-lg transition-all hover:border-primary"
              onClick={() => handleGroupClick(group)}
            >
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UsersRound className="w-5 h-5 text-primary" />
                  {group.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">{group.employees.length}</span> employees
                  </p>
                  <p className="text-muted-foreground">
                    <span className="font-medium text-foreground">{groupTravels.length}</span> travels
                  </p>
                  <p className="text-muted-foreground">
                    Wage: <span className="font-medium text-foreground">₱{group.wage}</span> per ton
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Group Summary Dialog */}
      <Dialog open={groupDialogOpen} onOpenChange={(open) => { setGroupDialogOpen(open); if (!open) setSelectedEmployee(null); }}>
        <DialogContent className="max-w-7xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl">EMPLOYEE AND INCOME SUMMARY</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="employees" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="employees">Employee Summary</TabsTrigger>
              <TabsTrigger value="income">Income Summary</TabsTrigger>
            </TabsList>

            <TabsContent value="employees" className="mt-6">
              <div className="grid grid-cols-3 gap-6 h-[calc(85vh-12rem)] overflow-hidden">
                {/* Employee List */}
                <div className="col-span-1 space-y-3 overflow-y-auto pr-2">
                  <h3 className="font-semibold text-sm text-muted-foreground mb-4">Employees</h3>
                  {selectedGroup?.employees.map(empId => {
                    const employee = employees.find(e => e.id === empId);
                    if (!employee) return null;
                    const empTravels = getEmployeeTravels(empId, selectedGroup.id);
                    const totalWage = getEmployeeTotalWage(empId, selectedGroup.id);
                    const totalTons = empTravels.reduce((sum, t) => sum + (t.tons || 0), 0);
                    const presentCount = empTravels.length;
                    const absentCount = getGroupTravels(selectedGroup.id).length - presentCount;

                    return (
                      <Card 
                        key={empId}
                        className={`cursor-pointer transition-all hover:shadow-md ${selectedEmployee?.id === empId ? 'border-primary border-2' : ''}`}
                        onClick={() => handleEmployeeClick(employee)}
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
                                  <span>{totalTons.toFixed(2)}</span>
                                </div>
                                <div className="col-span-2 flex items-center gap-1">
                                  <Wallet className="w-3 h-3 text-muted-foreground" />
                                  <span className="font-medium">₱{totalWage.toFixed(2)}</span>
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
                  {selectedEmployee && selectedGroup ? (
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
                            <p className="text-xl font-bold">{getEmployeeTravels(selectedEmployee.id, selectedGroup.id).length}</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <TrendingUp className="w-5 h-5 text-green-600 mx-auto mb-2" />
                            <p className="text-xs text-muted-foreground mb-1">Tons</p>
                            <p className="text-xl font-bold">
                              {getEmployeeTravels(selectedEmployee.id, selectedGroup.id).reduce((sum, t) => sum + (t.tons || 0), 0).toFixed(2)}
                            </p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <Wallet className="w-5 h-5 text-yellow-600 mx-auto mb-2" />
                            <p className="text-xs text-muted-foreground mb-1">Wage</p>
                            <p className="text-xl font-bold text-yellow-600">
                              ₱{getEmployeeTotalWage(selectedEmployee.id, selectedGroup.id).toFixed(2)}
                            </p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <CreditCard className="w-5 h-5 text-red-600 mx-auto mb-2" />
                            <p className="text-xs text-muted-foreground mb-1">Debts</p>
                            <p className="text-xl font-bold text-red-600">₱0.00</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <CheckCircle2 className="w-5 h-5 text-purple-600 mx-auto mb-2" />
                            <p className="text-xs text-muted-foreground mb-1">Attendance</p>
                            <div className="flex items-center justify-center gap-2">
                              <span className="text-lg font-bold text-green-600">{getEmployeeTravels(selectedEmployee.id, selectedGroup.id).length}</span>
                              <span className="text-lg font-bold text-destructive">
                                {getGroupTravels(selectedGroup.id).length - getEmployeeTravels(selectedEmployee.id, selectedGroup.id).length}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-4">Travel History</h4>
                        <div className="space-y-3">
                          {getEmployeeTravels(selectedEmployee.id, selectedGroup.id).map(travel => {
                            const wage = calculateEmployeeWage(travel, selectedEmployee.id, selectedGroup.id);
                            const travelGroup = travel.groups?.find(g => g.groupId === selectedGroup.id);
                            const presentCount = travelGroup?.attendance.filter(a => a.present).length || 0;
                            
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
                                          <span>₱{selectedGroup.wage}</span>
                                          <span>•</span>
                                          <span>{presentCount} present</span>
                                          <span>•</span>
                                          <Badge variant="outline" className="text-xs">Present</Badge>
                                        </div>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="font-bold text-lg">₱{wage.toFixed(2)}</p>
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

            <TabsContent value="income" className="mt-6">
              <div className="space-y-4 max-h-[calc(85vh-12rem)] overflow-y-auto">
                {selectedGroup && getGroupTravels(selectedGroup.id).map(travel => {
                  const travelGroup = travel.groups?.find(g => g.groupId === selectedGroup.id);
                  if (!travelGroup) return null;

                  return (
                    <Card key={travel.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">{travel.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Tons: {travel.tons} | Present: {getEmployeePresentCount(travel, selectedGroup.id)}
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b border-border">
                                <th className="text-left py-2 px-4 text-sm font-semibold">Employee</th>
                                <th className="text-left py-2 px-4 text-sm font-semibold">Status</th>
                                <th className="text-right py-2 px-4 text-sm font-semibold">Wage</th>
                              </tr>
                            </thead>
                            <tbody>
                              {travelGroup.attendance.map(att => {
                                const employee = employees.find(e => e.id === att.employeeId);
                                if (!employee) return null;
                                const wage = calculateEmployeeWage(travel, att.employeeId, selectedGroup.id);

                                return (
                                  <tr key={att.employeeId} className="border-b border-border hover:bg-secondary/50 transition-colors">
                                    <td className="py-2 px-4">{employee.name}</td>
                                    <td className="py-2 px-4">
                                      <Badge variant={att.present ? "default" : "secondary"} className={att.present ? 'bg-green-600' : ''}>
                                        {att.present ? 'Present' : 'Absent'}
                                      </Badge>
                                    </td>
                                    <td className="py-2 px-4 text-right font-medium">₱{wage.toFixed(2)}</td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}