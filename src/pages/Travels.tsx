import { useEffect, useState } from 'react';
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Travel, Group, Employee } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Edit, Trash2, Users } from 'lucide-react';
import { toast } from 'sonner';

export default function Travels() {
  const [travels, setTravels] = useState<Travel[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [lands, setLands] = useState<any[]>([]);
  const [plates, setPlates] = useState<any[]>([]);
  const [destinations, setDestinations] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [attendanceDialogOpen, setAttendanceDialogOpen] = useState(false);
  const [selectedTravel, setSelectedTravel] = useState<Travel | null>(null);
  const [editingTravel, setEditingTravel] = useState<Travel | null>(null);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    const [travelsData, groupsData, employeesData, driversData, landsData, platesData, destinationsData] = await Promise.all([
      getDocs(collection(db, 'travels')),
      getDocs(collection(db, 'groups')),
      getDocs(collection(db, 'employees')),
      getDocs(collection(db, 'drivers')),
      getDocs(collection(db, 'lands')),
      getDocs(collection(db, 'plates')),
      getDocs(collection(db, 'destinations')),
    ]);

    setTravels(travelsData.docs.map(doc => ({ id: doc.id, ...doc.data() } as Travel)));
    setGroups(groupsData.docs.map(doc => ({ id: doc.id, ...doc.data() } as Group)));
    setEmployees(employeesData.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee)));
    setDrivers(driversData.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setLands(landsData.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setPlates(platesData.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    setDestinations(destinationsData.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const [formData, setFormData] = useState({
    name: '',
    land: '',
    driver: '',
    plateNumber: '',
    destination: '',
    tons: 0,
    groups: [] as { groupId: string; attendance: { employeeId: string; present: boolean }[] }[]
  });

  const handleGroupToggle = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;

    setFormData(prev => {
      const exists = prev.groups.some(g => g.groupId === groupId);
      if (exists) {
        return { ...prev, groups: prev.groups.filter(g => g.groupId !== groupId) };
      } else {
        return {
          ...prev,
          groups: [...prev.groups, {
            groupId,
            attendance: group.employees.map(empId => ({ employeeId: empId, present: true }))
          }]
        };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingTravel) {
        await updateDoc(doc(db, 'travels', editingTravel.id), formData);
        toast.success('Travel updated successfully');
      } else {
        await addDoc(collection(db, 'travels'), formData);
        toast.success('Travel created successfully');
      }
      setIsDialogOpen(false);
      setEditingTravel(null);
      setFormData({ name: '', land: '', driver: '', plateNumber: '', destination: '', tons: 0, groups: [] });
      fetchAll();
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure?')) {
      await deleteDoc(doc(db, 'travels', id));
      toast.success('Travel deleted successfully');
      fetchAll();
    }
  };

  const handleAttendanceUpdate = async () => {
    if (!selectedTravel) return;
    try {
      await updateDoc(doc(db, 'travels', selectedTravel.id), { groups: selectedTravel.groups });
      toast.success('Attendance updated successfully');
      setAttendanceDialogOpen(false);
      fetchAll();
    } catch (error) {
      toast.error('Failed to update attendance');
    }
  };

  const toggleAttendance = (groupId: string, employeeId: string) => {
    if (!selectedTravel) return;
    setSelectedTravel(prev => {
      if (!prev) return prev;
      return {
        ...prev,
        groups: prev.groups.map(g => 
          g.groupId === groupId 
            ? { 
                ...g, 
                attendance: g.attendance.map(a => 
                  a.employeeId === employeeId ? { ...a, present: !a.present } : a
                )
              }
            : g
        )
      };
    });
  };

  const handleEdit = (travel: Travel) => {
    setEditingTravel(travel);
    setFormData({
      name: travel.name,
      land: travel.land,
      driver: travel.driver,
      plateNumber: travel.plateNumber,
      destination: travel.destination,
      tons: travel.tons,
      groups: travel.groups || []
    });
    setIsDialogOpen(true);
  };

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) {
      setEditingTravel(null);
      setFormData({ name: '', land: '', driver: '', plateNumber: '', destination: '', tons: 0, groups: [] });
    }
  };

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Travels</h1>
          <p className="text-muted-foreground">Manage travel assignments</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Travel
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingTravel ? 'Edit Travel' : 'Create New Travel'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Travel Name</Label>
                <Input value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Land</Label>
                  <Select value={formData.land} onValueChange={(v) => setFormData({ ...formData, land: v })}>
                    <SelectTrigger><SelectValue placeholder="Select land" /></SelectTrigger>
                    <SelectContent>{lands.map(l => <SelectItem key={l.id} value={l.id}>{l.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Driver</Label>
                  <Select value={formData.driver} onValueChange={(v) => setFormData({ ...formData, driver: v })}>
                    <SelectTrigger><SelectValue placeholder="Select driver" /></SelectTrigger>
                    <SelectContent>
                      {drivers.map(d => {
                        const emp = employees.find(e => e.id === d.employeeId);
                        return emp ? <SelectItem key={d.id} value={d.employeeId}>{emp.name}</SelectItem> : null;
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Plate Number</Label>
                  <Select value={formData.plateNumber} onValueChange={(v) => setFormData({ ...formData, plateNumber: v })}>
                    <SelectTrigger><SelectValue placeholder="Select plate" /></SelectTrigger>
                    <SelectContent>{plates.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Destination</Label>
                  <Select value={formData.destination} onValueChange={(v) => setFormData({ ...formData, destination: v })}>
                    <SelectTrigger><SelectValue placeholder="Select destination" /></SelectTrigger>
                    <SelectContent>{destinations.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Tons</Label>
                <Input 
                  type="number" 
                  min="0" 
                  step="0.01" 
                  value={formData.tons} 
                  onChange={(e) => setFormData({ ...formData, tons: parseFloat(e.target.value) || 0 })} 
                  required 
                />
              </div>
              <div>
                <Label>Select Groups</Label>
                <div className="mt-2 space-y-2 max-h-40 overflow-y-auto border border-border rounded-lg p-4">
                  {groups.map(group => (
                    <div key={group.id} className="flex items-center gap-2">
                      <Checkbox
                        checked={formData.groups.some(g => g.groupId === group.id)}
                        onCheckedChange={() => handleGroupToggle(group.id)}
                      />
                      <label className="text-sm">{group.name} ({group.employees.length} employees)</label>
                    </div>
                  ))}
                </div>
              </div>
              <Button type="submit" className="w-full">{editingTravel ? 'Update Travel' : 'Create Travel'}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-4 text-sm font-semibold">Name</th>
                <th className="text-left py-3 px-4 text-sm font-semibold">Groups</th>
                <th className="text-right py-3 px-4 text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {travels.map(travel => (
                <tr key={travel.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                  <td className="py-3 px-4">{travel.name}</td>
                  <td className="py-3 px-4">{travel.groups?.length || 0} groups</td>
                  <td className="py-3 px-4">
                    <div className="flex justify-end gap-2">
                      <Button variant="secondary" size="sm" onClick={() => { setSelectedTravel(travel); setAttendanceDialogOpen(true); }}>
                        <Users className="w-4 h-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEdit(travel)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(travel.id)}>
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

      <Dialog open={attendanceDialogOpen} onOpenChange={setAttendanceDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Manage Attendance - {selectedTravel?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedTravel?.groups.map(travelGroup => {
              const group = groups.find(g => g.id === travelGroup.groupId);
              return (
                <Card key={travelGroup.groupId} className="p-4">
                  <h3 className="font-semibold mb-3">{group?.name}</h3>
                  <div className="space-y-2">
                    {travelGroup.attendance.map(att => {
                      const emp = employees.find(e => e.id === att.employeeId);
                      return (
                        <div key={att.employeeId} className="flex items-center gap-2">
                          <Checkbox
                            checked={att.present}
                            onCheckedChange={() => toggleAttendance(travelGroup.groupId, att.employeeId)}
                          />
                          <span className={att.present ? 'text-foreground' : 'text-muted-foreground line-through'}>
                            {emp?.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              );
            })}
            <Button onClick={handleAttendanceUpdate} className="w-full">Save Attendance</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
