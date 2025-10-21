import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Travel, Group, Employee } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { UsersRound, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function Summaries() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [travels, setTravels] = useState<Travel[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<{ employee: Employee; groupId: string } | null>(null);
  const [groupDialogOpen, setGroupDialogOpen] = useState(false);
  const [employeeDialogOpen, setEmployeeDialogOpen] = useState(false);

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
    setGroupDialogOpen(true);
  };

  const handleEmployeeClick = (employee: Employee, groupId: string) => {
    setSelectedEmployee({ employee, groupId });
    setEmployeeDialogOpen(true);
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

      {/* Group Travels Dialog */}
      <Dialog open={groupDialogOpen} onOpenChange={setGroupDialogOpen}>
        <DialogContent className="max-w-5xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UsersRound className="w-5 h-5" />
              {selectedGroup?.name} - Travel Summary
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
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
                              <tr 
                                key={att.employeeId} 
                                className="border-b border-border hover:bg-secondary/50 transition-colors cursor-pointer"
                                onClick={() => handleEmployeeClick(employee, selectedGroup.id)}
                              >
                                <td className="py-2 px-4">{employee.name}</td>
                                <td className="py-2 px-4">
                                  <span className={att.present ? 'text-green-600' : 'text-muted-foreground line-through'}>
                                    {att.present ? 'Present' : 'Absent'}
                                  </span>
                                </td>
                                <td className="py-2 px-4 text-right font-medium">
                                  ₱{wage.toFixed(2)}
                                </td>
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
        </DialogContent>
      </Dialog>

      {/* Employee Summary Dialog */}
      <Dialog open={employeeDialogOpen} onOpenChange={setEmployeeDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              {selectedEmployee?.employee.name} - Wage Summary
            </DialogTitle>
          </DialogHeader>
          {selectedEmployee && (
            <div className="space-y-4">
              <Card className="bg-primary/10 border-primary">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">Total Earnings</p>
                    <p className="text-3xl font-bold text-primary">
                      ₱{getEmployeeTotalWage(selectedEmployee.employee.id, selectedEmployee.groupId).toFixed(2)}
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      {getEmployeeTravels(selectedEmployee.employee.id, selectedEmployee.groupId).length} travels completed
                    </p>
                  </div>
                </CardContent>
              </Card>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-sm font-semibold">Travel</th>
                      <th className="text-center py-3 px-4 text-sm font-semibold">Tons</th>
                      <th className="text-right py-3 px-4 text-sm font-semibold">Wage</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getEmployeeTravels(selectedEmployee.employee.id, selectedEmployee.groupId).map(travel => {
                      const wage = calculateEmployeeWage(travel, selectedEmployee.employee.id, selectedEmployee.groupId);
                      return (
                        <tr key={travel.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                          <td className="py-3 px-4">{travel.name}</td>
                          <td className="py-3 px-4 text-center">{travel.tons}</td>
                          <td className="py-3 px-4 text-right font-medium">₱{wage.toFixed(2)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
