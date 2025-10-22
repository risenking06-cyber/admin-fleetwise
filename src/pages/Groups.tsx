import { useEffect, useState } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Group, Employee, Travel, Land, Plate, Destination, Driver, Debt } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Edit, Trash2, TrendingUp, Truck, BarChart3, User, MapPin, Wallet, CreditCard, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

export default function Groups() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [travels, setTravels] = useState<Travel[]>([]);
  const [lands, setLands] = useState<Land[]>([]);
  const [plates, setPlates] = useState<Plate[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);
  const [formData, setFormData] = useState({ name: '', wage: 0, employees: [] as string[] });
  
  const [isTravelDialogOpen, setIsTravelDialogOpen] = useState(false);
  const [editingTravel, setEditingTravel] = useState<Travel | null>(null);
  const [selectedGroupForTravel, setSelectedGroupForTravel] = useState<Group | null>(null);
  const [travelFormData, setTravelFormData] = useState({
    name: '',
    land: '',
    driver: '',
    plateNumber: '',
    destination: '',
    ticket: '',
    tons: 0,
    bags: 0,
    sugarcane_price: 0,
    molasses: 0,
    molasses_price: 0,
    attendance: [] as { employeeId: string; present: boolean }[],
    expenses: [] as { name: string; amount: number }[], // ✅ NEW
  });

  const [isGroupTravelsDialogOpen, setIsGroupTravelsDialogOpen] = useState(false);
  const [selectedGroupForView, setSelectedGroupForView] = useState<Group | null>(null);

  const [isSummaryDialogOpen, setIsSummaryDialogOpen] = useState(false);
  const [selectedGroupForSummary, setSelectedGroupForSummary] = useState<Group | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    const [groupsData, employeesData, travelsData, landsData, platesData, destinationsData, driversData, debtsData] = await Promise.all([
      getDocs(collection(db, 'groups')),
      getDocs(collection(db, 'employees')),
      getDocs(collection(db, 'travels')),
      getDocs(collection(db, 'lands')),
      getDocs(collection(db, 'plates')),
      getDocs(collection(db, 'destinations')),
      getDocs(collection(db, 'drivers')),
      getDocs(collection(db, 'debts')),
    ]);

    setGroups(groupsData.docs.map(doc => ({ id: doc.id, ...doc.data() } as Group)));
    setEmployees(employeesData.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee)));
    setTravels(travelsData.docs.map(doc => ({ id: doc.id, ...doc.data() } as Travel)));
    setLands(landsData.docs.map(doc => ({ id: doc.id, ...doc.data() } as Land)));
    setPlates(platesData.docs.map(doc => ({ id: doc.id, ...doc.data() } as Plate)));
    setDestinations(destinationsData.docs.map(doc => ({ id: doc.id, ...doc.data() } as Destination)));
    setDrivers(driversData.docs.map(doc => ({ id: doc.id, ...doc.data() } as Driver)));
    setDebts(debtsData.docs.map(doc => ({ id: doc.id, ...doc.data() } as Debt)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingGroup) {
        await updateDoc(doc(db, 'groups', editingGroup.id), formData);
        toast.success('Group updated successfully');
      } else {
        await addDoc(collection(db, 'groups'), formData);
        toast.success('Group added successfully');
      }
      setIsDialogOpen(false);
      setFormData({ name: '', wage: 0, employees: [] });
      setEditingGroup(null);
      fetchAll();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure?')) {
      await deleteDoc(doc(db, 'groups', id));
      toast.success('Group deleted successfully');
      fetchAll();
    }
  };

  const toggleEmployee = (employeeId: string) => {
    setFormData(prev => ({
      ...prev,
      employees: prev.employees.includes(employeeId)
        ? prev.employees.filter(id => id !== employeeId)
        : [...prev.employees, employeeId]
    }));
  };

  const getEmployeeNames = (employeeIds: string[]) => {
    return employeeIds
      .map(id => employees.find(e => e.id === id)?.name)
      .filter(Boolean)
      .join(', ');
  };

  // Travel functions
  const handleAddTravel = (group: Group) => {
    setSelectedGroupForTravel(group);
    setEditingTravel(null);
    setTravelFormData({
      name: '',
      land: '',
      driver: '',
      plateNumber: '',
      destination: '',
      ticket: '',
      tons: 0,
      bags: 0,
      sugarcane_price: 0,
      molasses: 0,
      molasses_price: 0,
      expenses:[],
      attendance: group.employees.map(empId => ({ employeeId: empId, present: false }))
    });
    setIsTravelDialogOpen(true);
  };

  const handleEditTravel = (travel: Travel) => {
    setEditingTravel(travel);
    setTravelFormData({
      name: travel.name,
      land: travel.land,
      driver: travel.driver,
      plateNumber: travel.plateNumber,
      destination: travel.destination,
      ticket: travel.ticket || '',
      tons: travel.tons,
      bags: travel.bags || 0,
      sugarcane_price: travel.sugarcane_price || 0,
      molasses: travel.molasses || 0,
      molasses_price: travel.molasses_price || 0,
      expenses: travel.expenses || [], // ✅ Keep existing expenses
      attendance: travel.attendance
    });
    setIsTravelDialogOpen(true);
  };

  const handleTravelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroupForTravel && !editingTravel) return;

    try {
      const travelData = {
        ...travelFormData,
        groupId: editingTravel ? (travels.find(t => t.id === editingTravel.id)?.groupId || selectedGroupForTravel?.id) : selectedGroupForTravel?.id
      };

      if (editingTravel) {
        await updateDoc(doc(db, 'travels', editingTravel.id), travelData);
        toast.success('Travel updated successfully');
      } else {
        await addDoc(collection(db, 'travels'), travelData);
        toast.success('Travel added successfully');
      }
      setIsTravelDialogOpen(false);
      setEditingTravel(null);
      fetchAll();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDeleteTravel = async (id: string) => {
    if (confirm('Are you sure?')) {
      await deleteDoc(doc(db, 'travels', id));
      toast.success('Travel deleted successfully');
      fetchAll();
    }
  };

  const toggleAttendance = (employeeId: string) => {
    setTravelFormData(prev => ({
      ...prev,
      attendance: prev.attendance.map(att =>
        att.employeeId === employeeId ? { ...att, present: !att.present } : att
      )
    }));
  };

  const getGroupTravels = (groupId: string) => {
    return travels.filter(travel => travel.groupId === groupId);
  };

  const handleViewGroupTravels = (group: Group) => {
    setSelectedGroupForView(group);
    setIsGroupTravelsDialogOpen(true);
  };

  // Summary functions
  const handleViewSummary = (group: Group) => {
    setSelectedGroupForSummary(group);
    setSelectedEmployee(null);
    setIsSummaryDialogOpen(true);
  };

  const getEmployeePresentCount = (travel: Travel) => {
    return travel.attendance.filter(a => a.present).length;
  };

  const calculateEmployeeWage = (travel: Travel, employeeId: string) => {
    const group = groups.find(g => g.id === travel.groupId);
    if (!group) return 0;

    const attendance = travel.attendance.find(a => a.employeeId === employeeId);
    if (!attendance || !attendance.present) return 0;

    const presentCount = getEmployeePresentCount(travel);
    if (presentCount === 0) return 0;

    return (group.wage * travel.tons) / presentCount;
  };

  const getEmployeeTravels = (employeeId: string, groupId: string) => {
    return travels.filter(travel => {
      if (travel.groupId !== groupId) return false;
      const attendance = travel.attendance.find(a => a.employeeId === employeeId);
      return attendance?.present;
    });
  };

  const getEmployeeTotalWage = (employeeId: string, groupId: string) => {
    const employeeTravels = getEmployeeTravels(employeeId, groupId);
    return employeeTravels.reduce((total, travel) => {
      return total + calculateEmployeeWage(travel, employeeId);
    }, 0);
  };

  const getEmployeeDebts = (employeeId: string) => {
    return debts.filter(debt => debt.employeeId === employeeId);
  };

  const getEmployeeTotalDebts = (employeeId: string) => {
    return getEmployeeDebts(employeeId).reduce((sum, debt) => sum + debt.amount, 0);
  };

  const handleEmployeeClick = (employee: Employee) => {
    setSelectedEmployee(employee);
  };

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Groups</h1>
          <p className="text-muted-foreground">Organize employees into groups</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Group
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingGroup ? 'Edit Group' : 'Add New Group'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Group Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="wage">Wage</Label>
                <Input
                  id="wage"
                  type="number"
                  value={formData.wage}
                  onChange={(e) => setFormData({ ...formData, wage: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label>Select Employees</Label>
                <div className="mt-2 space-y-2 max-h-60 overflow-y-auto border border-border rounded-lg p-4">
                  {employees.map((employee) => (
                    <div key={employee.id} className="flex items-center gap-2">
                      <Checkbox
                        id={`employee-${employee.id}`}
                        checked={formData.employees.includes(employee.id)}
                        onCheckedChange={() => toggleEmployee(employee.id)}
                      />
                      <label htmlFor={`employee-${employee.id}`} className="text-sm cursor-pointer">
                        {employee.name} - {employee.type}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <Button type="submit" className="w-full">{editingGroup ? 'Update' : 'Create'}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Group Name</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Wage</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">Employees</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((group) => (
                <tr key={group.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                  <td 
                    className="py-3 px-4 text-foreground cursor-pointer hover:text-primary"
                    onClick={() => handleViewGroupTravels(group)}
                  >
                    {group.name}
                  </td>
                  <td className="py-3 px-4 text-foreground">₱{group.wage}</td>
                  <td className="py-3 px-4 text-foreground text-sm">{getEmployeeNames(group.employees) || 'No employees'}</td>
                  <td className="py-3 px-4">
                    <div className="flex justify-end gap-2">
                      <Button variant="secondary" size="sm" onClick={() => { 
                        setEditingGroup(group); 
                        setFormData({ name: group.name, wage: group.wage, employees: group.employees }); 
                        setIsDialogOpen(true); 
                      }}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => handleAddTravel(group)}>
                        <Plus className="w-4 h-4" />
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => handleViewSummary(group)}>
                        <BarChart3 className="w-4 h-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(group.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Travel Dialog */}
      <Dialog open={isTravelDialogOpen} onOpenChange={setIsTravelDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTravel ? 'Edit Travel' : 'Add New Travel'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleTravelSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="travel-name">Travel Name</Label>
                <Input
                  id="travel-name"
                  value={travelFormData.name}
                  onChange={(e) => setTravelFormData({ ...travelFormData, name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="ticket">Ticket No</Label>
                <Input
                  id="ticket"
                  value={travelFormData.ticket}
                  onChange={(e) => setTravelFormData({ ...travelFormData, ticket: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="land">Land</Label>
                <Select value={travelFormData.land} onValueChange={(value) => setTravelFormData({ ...travelFormData, land: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select land" />
                  </SelectTrigger>
                  <SelectContent>
                    {lands.map((land) => (
                      <SelectItem key={land.id} value={land.id}>{land.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="driver">Driver</Label>
                <Select value={travelFormData.driver} onValueChange={(value) => setTravelFormData({ ...travelFormData, driver: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select driver" />
                  </SelectTrigger>
                  <SelectContent>
                    {drivers.map((driver) => {
                      const emp = employees.find(e => e.id === driver.employeeId);
                      return emp ? <SelectItem key={driver.id} value={emp.id}>{emp.name}</SelectItem> : null;
                    })}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="plate">Plate Number</Label>
                <Select value={travelFormData.plateNumber} onValueChange={(value) => setTravelFormData({ ...travelFormData, plateNumber: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select plate" />
                  </SelectTrigger>
                  <SelectContent>
                    {plates.map((plate) => (
                      <SelectItem key={plate.id} value={plate.id}>{plate.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="destination">Destination</Label>
                <Select value={travelFormData.destination} onValueChange={(value) => setTravelFormData({ ...travelFormData, destination: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination" />
                  </SelectTrigger>
                  <SelectContent>
                    {destinations.map((dest) => (
                      <SelectItem key={dest.id} value={dest.id}>{dest.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="tons">Tons</Label>
                <Input
                  id="tons"
                  type="number"
                  step="0.01"
                  value={travelFormData.tons}
                  onChange={(e) => setTravelFormData({ ...travelFormData, tons: parseFloat(e.target.value) })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="bags">Bags</Label>
                <Input
                  id="bags"
                  type="number"
                  value={travelFormData.bags}
                  onChange={(e) => setTravelFormData({ ...travelFormData, bags: parseInt(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="sugarcane-price">Sugarcane Price</Label>
                <Input
                  id="sugarcane-price"
                  type="number"
                  step="0.01"
                  value={travelFormData.sugarcane_price}
                  onChange={(e) => setTravelFormData({ ...travelFormData, sugarcane_price: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="molasses">Molasses</Label>
                <Input
                  id="molasses"
                  type="number"
                  step="0.01"
                  value={travelFormData.molasses}
                  onChange={(e) => setTravelFormData({ ...travelFormData, molasses: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="molasses-price">Molasses Price</Label>
                <Input
                  id="molasses-price"
                  type="number"
                  step="0.01"
                  value={travelFormData.molasses_price}
                  onChange={(e) => setTravelFormData({ ...travelFormData, molasses_price: parseFloat(e.target.value) })}
                />
              </div>
            </div>

            <div>
              <Label>Expenses</Label>
              <div className="mt-2 space-y-2">
                {travelFormData.expenses.length === 0 && (
                  <p className="text-xs text-muted-foreground">No expenses added yet.</p>
                )}

                {travelFormData.expenses.map((exp, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      placeholder="Expense name"
                      value={exp.name}
                      onChange={(e) => {
                        const updated = [...travelFormData.expenses];
                        updated[idx].name = e.target.value;
                        setTravelFormData({ ...travelFormData, expenses: updated });
                      }}
                      className="flex-1"
                    />
                    <Input
                      placeholder="Amount"
                      type="number"
                      value={exp.amount}
                      onChange={(e) => {
                        const updated = [...travelFormData.expenses];
                        updated[idx].amount = parseFloat(e.target.value);
                        setTravelFormData({ ...travelFormData, expenses: updated });
                      }}
                      className="w-32"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        const updated = travelFormData.expenses.filter((_, i) => i !== idx);
                        setTravelFormData({ ...travelFormData, expenses: updated });
                      }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}

                <div className="pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() =>
                      setTravelFormData({
                        ...travelFormData,
                        expenses: [...travelFormData.expenses, { name: '', amount: 0 }],
                      })
                    }
                  >
                    + Add Expense
                  </Button>
                </div>
              </div>
            </div>


            <div>
              <Label>Attendance</Label>
              <div className="mt-2 space-y-2 max-h-60 overflow-y-auto border border-border rounded-lg p-4">
                {travelFormData.attendance.map((att) => {
                  const employee = employees.find(e => e.id === att.employeeId);
                  if (!employee) return null;
                  return (
                    <div key={att.employeeId} className="flex items-center gap-2">
                      <Checkbox
                        id={`attendance-${att.employeeId}`}
                        checked={att.present}
                        onCheckedChange={() => toggleAttendance(att.employeeId)}
                      />
                      <label htmlFor={`attendance-${att.employeeId}`} className="text-sm cursor-pointer">
                        {employee.name} - {employee.type}
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
            <Button type="submit" className="w-full">{editingTravel ? 'Update' : 'Create'}</Button>
          </form>
        </DialogContent>
      </Dialog>

      {/* Group Travels Dialog */}
      <Dialog open={isGroupTravelsDialogOpen} onOpenChange={setIsGroupTravelsDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[85vh]">
          <DialogHeader>
            <DialogTitle className="text-2xl">{selectedGroupForView?.name} - Travels</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 overflow-y-auto max-h-[calc(85vh-8rem)]">
            {selectedGroupForView && getGroupTravels(selectedGroupForView.id).map(travel => {
              const land = lands.find(l => l.id === travel.land);
              const driver = employees.find(e => e.id === travel.driver);
              const plate = plates.find(p => p.id === travel.plateNumber);
              const destination = destinations.find(d => d.id === travel.destination);

              return (
                <Card key={travel.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{travel.name}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {travel.ticket && `Ticket: ${travel.ticket} • `}
                          {travel.tons} tons • {land?.name} • {driver?.name} • {plate?.name} • {destination?.name}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="secondary" size="sm" onClick={() => handleEditTravel(travel)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteTravel(travel.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      <strong>Attendance:</strong>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {travel.attendance.map(att => {
                          const emp = employees.find(e => e.id === att.employeeId);
                          return emp ? (
                            <Badge key={att.employeeId} variant={att.present ? "default" : "secondary"}>
                              {emp.name} - {att.present ? 'Present' : 'Absent'}
                            </Badge>
                          ) : null;
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
            {selectedGroupForView && getGroupTravels(selectedGroupForView.id).length === 0 && (
              <p className="text-center text-muted-foreground py-8">No travels yet</p>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Summary Dialog */}
      <Dialog open={isSummaryDialogOpen} onOpenChange={(open) => { setIsSummaryDialogOpen(open); if (!open) setSelectedEmployee(null); }}>
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
                  {selectedGroupForSummary?.employees.map(empId => {
                    const employee = employees.find(e => e.id === empId);
                    if (!employee) return null;
                    const empTravels = getEmployeeTravels(empId, selectedGroupForSummary.id);
                    const totalWage = getEmployeeTotalWage(empId, selectedGroupForSummary.id);
                    const totalTons = empTravels.reduce((sum, t) => sum + t.tons, 0);
                    const presentCount = empTravels.length;
                    const absentCount = getGroupTravels(selectedGroupForSummary.id).length - presentCount;

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
                  {selectedEmployee && selectedGroupForSummary ? (
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
                            <p className="text-xl font-bold">{getEmployeeTravels(selectedEmployee.id, selectedGroupForSummary.id).length}</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <TrendingUp className="w-5 h-5 text-green-600 mx-auto mb-2" />
                            <p className="text-xs text-muted-foreground mb-1">Tons</p>
                            <p className="text-xl font-bold">
                              {getEmployeeTravels(selectedEmployee.id, selectedGroupForSummary.id).reduce((sum, t) => sum + t.tons, 0).toFixed(2)}
                            </p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <Wallet className="w-5 h-5 text-yellow-600 mx-auto mb-2" />
                            <p className="text-xs text-muted-foreground mb-1">Wage</p>
                            <p className="text-xl font-bold text-yellow-600">
                              ₱{getEmployeeTotalWage(selectedEmployee.id, selectedGroupForSummary.id).toFixed(2)}
                            </p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <CreditCard className="w-5 h-5 text-red-600 mx-auto mb-2" />
                            <p className="text-xs text-muted-foreground mb-1">Debts</p>
                            <p className="text-xl font-bold text-red-600">₱{getEmployeeTotalDebts(selectedEmployee.id).toFixed(2)}</p>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-4 text-center">
                            <CheckCircle2 className="w-5 h-5 text-purple-600 mx-auto mb-2" />
                            <p className="text-xs text-muted-foreground mb-1">Attendance</p>
                            <div className="flex items-center justify-center gap-2">
                              <span className="text-lg font-bold text-green-600">{getEmployeeTravels(selectedEmployee.id, selectedGroupForSummary.id).length}</span>
                              <span className="text-lg font-bold text-destructive">
                                {getGroupTravels(selectedGroupForSummary.id).length - getEmployeeTravels(selectedEmployee.id, selectedGroupForSummary.id).length}
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      <div>
                        <h4 className="font-semibold mb-4">Travel History</h4>
                        <div className="space-y-3">
                          {getEmployeeTravels(selectedEmployee.id, selectedGroupForSummary.id).map(travel => {
                            const wage = calculateEmployeeWage(travel, selectedEmployee.id);
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
                                          <span>₱{selectedGroupForSummary.wage}</span>
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
              <div className="space-y-6 max-h-[calc(85vh-12rem)] overflow-y-auto">
                <div className="space-y-6">
                  {selectedGroupForSummary &&
                    getGroupTravels(selectedGroupForSummary.id).map(travel => {
                      // 🧮 Compute gross income (sugarcane + molasses)
                      const sugarIncome = (travel.sugarcane_price || 0) * (travel.bags || 0);
                      const molassesIncome = (travel.molasses_price || 0) * (travel.molasses || 0);
                      const grossIncome = sugarIncome + molassesIncome;

                      // 👷 Employee wages
                      const totalWage = travel.attendance.reduce((sum, att) => {
                        return sum + calculateEmployeeWage(travel, att.employeeId);
                      }, 0);

                      // 🧾 Other expenses (from travel.expenses)
                      const travelExpenses = (travel.expenses || []).reduce((sum, exp) => sum + (exp.amount || 0), 0);

                      // 💸 Total expenses (wages + other expenses)
                      const totalExpenses = totalWage + travelExpenses;

                      // 💰 Net income
                      const netIncome = grossIncome - totalExpenses;

                      const getDriverName = (driverId: string) => {
                        const employee = employees.find(e => e.id === driverId);
                        return employee ? employee.name : 'Unknown Driver';
                      };
                      const getDestinationName = (destinationId: string) => {
                        const destination = destinations.find(d => d.id === destinationId);
                        return destination ? destination.name : 'Unknown Destination';
                      };

                      return (
                        <Card key={travel.id} className="border-2">
                          <CardContent className="p-6">
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <h3 className="text-xl font-bold mb-1">{travel.name}</h3>
                                <p className="text-sm text-muted-foreground">Ticket No: {travel.ticket || 'N/A'}</p>
                                <p className="text-xs text-muted-foreground mt-1">{travel.tons} tons</p>
                                <p className="text-xs text-muted-foreground mt-1">{getDriverName(travel.driver)} | {getDestinationName(travel.destination)}</p>
                                <p className="text-xs text-muted-foreground mt-1">Sugarcane: {travel.bags || 0} × ₱{travel.sugarcane_price || 0} ={' '}
                                  <span className="text-green-600 font-medium">₱{sugarIncome.toFixed(2)}</span>
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">
                                  <span className="text-muted-foreground">
                                  Molasses: {travel.molasses || 0} × ₱{travel.molasses_price || 0} ={' '}
                                  <span className="text-green-600 font-medium">₱{molassesIncome.toFixed(2)}</span>
                                </span>
                                </p>
                              </div>
                              <div className="text-right space-y-1">
                                <p className="text-xs text-muted-foreground">Net Income</p>
                                <p className="text-2xl font-bold text-blue-600">₱{netIncome.toFixed(2)}</p>

                                <p className="text-xs text-green-600 mt-2">Income</p>
                                <p className="text-base font-semibold text-green-600">₱{grossIncome.toFixed(2)}</p>

                                <p className="text-xs text-red-600 mt-2">Expenses</p>
                                <p className="text-base font-semibold text-red-600">₱{totalExpenses.toFixed(2)}</p>
                              </div>
                            </div>

                            <div className="space-y-3 mt-4">
                              {/* Income details */}
                              {/* <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                  Sugarcane: {travel.bags || 0} × ₱{travel.sugarcane_price || 0} ={' '}
                                  <span className="text-green-600 font-medium">₱{sugarIncome.toFixed(2)}</span>
                                </span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">
                                  Molasses: {travel.molasses || 0} × ₱{travel.molasses_price || 0} ={' '}
                                  <span className="text-green-600 font-medium">₱{molassesIncome.toFixed(2)}</span>
                                </span>
                              </div> */}


                              {/* Travel expenses */}
                              {travel.expenses && travel.expenses.length > 0 && (
                                <div className="border-t pt-3 mt-3">
                                  <p className="text-sm font-semibold text-muted-foreground mb-2">Expenses:</p>
                                  <div className="space-y-1">
                                    {travel.expenses.map((exp, idx) => (
                                      <div key={idx} className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">{exp.name}</span>
                                        <span className="font-medium">₱{exp.amount.toFixed(2)}</span>
                                      </div>
                                    ))}
                                      {/* <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Total Wage:</span>
                                        <span className="font-medium"> ₱{
                                          travel.attendance
                                            .filter(att => att.present)
                                            .reduce((total, att) => total + calculateEmployeeWage(travel, att.employeeId), 0)
                                            .toFixed(2)}
                                        </span>
                                      </div> */}
                                  </div>
                                </div>
                              )}

                              {/* Totals per travel */}
                              <div className="border-t pt-3 mt-3 space-y-2">
                                <div className="flex justify-between text-sm font-semibold">
                                  <span>Total Wages</span>
                                  <span className="text-orange-600">₱{totalWage.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm font-semibold">
                                  <span>Other Expenses</span>
                                  <span className="text-red-600">₱{travelExpenses.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-sm font-semibold">
                                  <span>Total Expenses</span>
                                  <span className="text-red-700">₱{totalExpenses.toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                </div>

                {/* 🌾 Overall Summary */}
                {selectedGroupForSummary &&
                  getGroupTravels(selectedGroupForSummary.id).length > 0 && (
                    <Card className="border-2 border-primary bg-secondary/20">
                      <CardContent className="p-6">
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">Total Tons</span>
                            <span className="font-bold">
                              {getGroupTravels(selectedGroupForSummary.id)
                                .reduce((sum, t) => sum + t.tons, 0)
                                .toFixed(2)}
                            </span>
                          </div>

                          <div className="flex justify-between text-sm">
                            <span className="font-medium">Total Income</span>
                            <span className="font-bold">
                              ₱
                              {getGroupTravels(selectedGroupForSummary.id)
                                .reduce((sum, t) => {
                                  const sugarIncome = (t.sugarcane_price || 0) * (t.bags || 0);
                                  const molassesIncome = (t.molasses_price || 0) * (t.molasses || 0);
                                  return sum + sugarIncome + molassesIncome;
                                }, 0)
                                .toFixed(2)}
                            </span>
                          </div>

                          <div className="flex justify-between text-sm">
                            <span className="font-medium">Total Expenses</span>
                            <span className="font-bold text-red-600">
                              ₱
                              {getGroupTravels(selectedGroupForSummary.id)
                                .reduce((sum, t) => {
                                  const wageSum = t.attendance.reduce(
                                    (wageSum, att) => wageSum + calculateEmployeeWage(t, att.employeeId),
                                    0
                                  );
                                  const expSum = (t.expenses || []).reduce(
                                    (expSum, e) => expSum + (e.amount || 0),
                                    0
                                  );
                                  return sum + wageSum + expSum;
                                }, 0)
                                .toFixed(2)}
                            </span>
                          </div>

                          <div className="border-t pt-3 mt-3">
                            <div className="flex justify-between">
                              <span className="text-lg font-bold">Overall Net Income</span>
                              <span className="text-2xl font-bold text-green-600">
                                ₱
                                {getGroupTravels(selectedGroupForSummary.id)
                                  .reduce((sum, t) => {
                                    const sugarIncome = (t.sugarcane_price || 0) * (t.bags || 0);
                                    const molassesIncome = (t.molasses_price || 0) * (t.molasses || 0);
                                    const gross = sugarIncome + molassesIncome;
                                    const wageSum = t.attendance.reduce(
                                      (wSum, att) => wSum + calculateEmployeeWage(t, att.employeeId),
                                      0
                                    );
                                    const expSum = (t.expenses || []).reduce(
                                      (eSum, e) => eSum + (e.amount || 0),
                                      0
                                    );
                                    return sum + (gross - wageSum - expSum);
                                  }, 0)
                                  .toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
              </div>
            </TabsContent>

          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
