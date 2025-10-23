import { useEffect, useState } from 'react';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  getDocs,
  updateDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Driver, Employee, Travel, Destination, Plate } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Plus, Trash2, Edit, Eye } from 'lucide-react';
import { toast } from 'sonner';

export default function Drivers() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [plates, setPlates] = useState<Plate[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
  const [driverWage, setDriverWage] = useState('');
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [driverTravels, setDriverTravels] = useState<Travel[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  const travelsPerPage = 5;

  useEffect(() => {
    fetchDrivers();
    fetchEmployees();
    fetchDestinations();
    fetchPlates();
  }, []);

  const fetchDrivers = async () => {
    const querySnapshot = await getDocs(collection(db, 'drivers'));
    const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Driver));
    setDrivers(data);
  };

  

  const fetchEmployees = async () => {
    const querySnapshot = await getDocs(collection(db, 'employees'));
    const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Employee));
    setEmployees(data);
  };

  const fetchDestinations = async () => {
    const querySnapshot = await getDocs(collection(db, 'destinations'));
    const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Destination));
    setDestinations(data);
  };

  const fetchPlates = async () => {
    const querySnapshot = await getDocs(collection(db, 'plates'));
    const data = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as Plate));
    setPlates(data);
  };

  const fetchDriverTravels = async (driver: Driver) => {
    const q = query(collection(db, 'travels'), where('driver', '==', driver.employeeId));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(
      (doc) => ({ id: doc.id, ...doc.data() } as Travel)
    );

    const sorted = data.sort((a, b) => {
      const dateA = new Date(a.name);
      const dateB = new Date(b.name);

      const isValidDateA = !isNaN(dateA.getTime());
      const isValidDateB = !isNaN(dateB.getTime());

      // ✅ Both are valid dates → sort by date (oldest → newest)
      if (isValidDateA && isValidDateB) {
        return dateA.getTime() - dateB.getTime();
      }

      // Only one is valid → dates come first
      if (isValidDateA && !isValidDateB) return -1;
      if (!isValidDateA && isValidDateB) return 1;

      // Neither are valid → sort alphabetically (A → Z)
      return a.name.localeCompare(b.name, 'en', { sensitivity: 'base' });
    });

    setDriverTravels(sorted);
    setCurrentPage(1);
  };

  const getEmployeeName = (employeeId: string) =>
    employees.find((e) => e.id === employeeId)?.name || 'Unknown';

  const getDestinationName = (id: string) =>
    destinations.find((d) => d.id === id)?.name || 'Unknown Destination';

  const getPlateName = (id: string) =>
    plates.find((p) => p.id === id)?.name || 'Unknown Plate';

  const availableEmployees = employees.filter(
    (emp) => !drivers.some((driver) => driver.employeeId === emp.id)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!driverWage || Number(driverWage) <= 0) {
      toast.error('Please enter a valid wage');
      return;
    }

    try {
      if (editingDriver) {
        await updateDoc(doc(db, 'drivers', editingDriver.id), {
          wage: Number(driverWage),
        });
        toast.success('Driver updated successfully');
      } else {
        if (!selectedEmployeeId) {
          toast.error('Please select an employee');
          return;
        }
        await addDoc(collection(db, 'drivers'), {
          employeeId: selectedEmployeeId,
          wage: Number(driverWage),
        });
        toast.success('Driver added successfully');
      }

      setIsDialogOpen(false);
      setEditingDriver(null);
      setSelectedEmployeeId('');
      setDriverWage('');
      fetchDrivers();
    } catch (error) {
      console.error(error);
      toast.error('Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure?')) {
      await deleteDoc(doc(db, 'drivers', id));
      toast.success('Driver removed successfully');
      fetchDrivers();
    }
  };

  const handleViewDriver = async (driver: Driver) => {
    setSelectedDriver(driver);
    await fetchDriverTravels(driver);
    setViewDialogOpen(true);
  };

  const calculateTotalWage = (driver: Driver, travels: Travel[]) => {
    const totalTrips = travels.length;
    const wage = driver.wage || 0;
    return wage * totalTrips;
  };

  const totalTons = driverTravels.reduce((sum, t) => sum + (t.tons || 0), 0);
  const totalTravels = driverTravels.length;

  const indexOfLast = currentPage * travelsPerPage;
  const indexOfFirst = indexOfLast - travelsPerPage;
  const currentTravels = driverTravels.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(driverTravels.length / travelsPerPage);

  const sortedDrivers = [...drivers].sort((a, b) => {
    const nameA = getEmployeeName(a.employeeId).toLowerCase();
    const nameB = getEmployeeName(b.employeeId).toLowerCase();
    return nameA.localeCompare(nameB);
  });
  
  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Drivers</h1>
          <p className="text-muted-foreground">Manage driver assignments</p>
        </div>

        {/* Add / Edit Dialog */}
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            if (!open) setEditingDriver(null);
            setIsDialogOpen(open);
          }}
        >
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Driver
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingDriver ? 'Edit Driver' : 'Assign Employee as Driver'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!editingDriver && (
                <div>
                  <Label htmlFor="employee">Select Employee</Label>
                  <Select
                    value={selectedEmployeeId}
                    onValueChange={setSelectedEmployeeId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose an employee" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableEmployees.map((employee) => (
                        <SelectItem key={employee.id} value={employee.id}>
                          {employee.name} - {employee.type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div>
                <Label htmlFor="wage">Wage</Label>
                <Input
                  id="wage"
                  type="number"
                  value={driverWage}
                  onChange={(e) => setDriverWage(e.target.value)}
                  placeholder="Enter driver wage"
                  min="0"
                  required
                />
              </div>

              <Button type="submit" className="w-full">
                {editingDriver ? 'Update Driver' : 'Assign Driver'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Drivers Table */}
      <Card className="p-6">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                Driver Name
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-foreground">
                Wage
              </th>
              <th className="text-right py-3 px-4 text-sm font-semibold text-foreground">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedDrivers.map((driver) => (
              <tr
                key={driver.id}
                className="border-b border-border hover:bg-secondary/50 transition-colors"
              >
                <td className="py-3 px-4 text-foreground">
                  {getEmployeeName(driver.employeeId)}
                </td>
                <td className="py-3 px-4 text-foreground">
                  {driver.wage ? `₱${driver.wage}` : '-'}
                </td>
                <td className="py-3 px-4">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setEditingDriver(driver);
                        setDriverWage(driver.wage?.toString() || '');
                        setIsDialogOpen(true);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleViewDriver(driver)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(driver.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      {/* View Driver Travels Modal */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {selectedDriver
                ? `${getEmployeeName(selectedDriver.employeeId)}'s Travels`
                : 'Driver Travels'}
            </DialogTitle>
          </DialogHeader>

          {selectedDriver && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-md space-y-1">
                <p className="font-semibold">
                  Total Wage:{' '}
                  <span className="text-primary">
                    ₱{calculateTotalWage(selectedDriver, driverTravels).toLocaleString()}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Wage per travel: ₱{selectedDriver.wage} × {driverTravels.length} travels
                </p>
                <p className="text-sm text-muted-foreground">
                  Total Tons: {totalTons.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  Total Travels: {totalTravels}
                </p>
              </div>

              <Card className="p-4 max-h-[400px] overflow-y-auto">
                {driverTravels.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No travels found for this driver.
                  </p>
                ) : (
                  <>
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border">
                          <th className="text-left py-2 px-3">Date</th>
                          <th className="text-left py-2 px-3">Destination</th>
                          <th className="text-left py-2 px-3">Tons</th>
                          <th className="text-left py-2 px-3">Ticket</th>
                          <th className="text-left py-2 px-3">Plate No.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentTravels.map((t) => (
                          <tr key={t.id} className="border-b border-border hover:bg-muted/50">
                            <td className="py-2 px-3">{t.name || '-'}</td>
                            <td className="py-2 px-3">{getDestinationName(t.destination)}</td>
                            <td className="py-2 px-3">{t.tons || 0}</td>
                            <td className="py-2 px-3">{t.ticket || '-'}</td>
                            <td className="py-2 px-3">{getPlateName(t.plateNumber)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>

                    {totalPages > 1 && (
                      <div className="flex justify-center gap-2 mt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentPage === 1}
                          onClick={() => setCurrentPage((p) => p - 1)}
                        >
                          Prev
                        </Button>
                        <span className="text-sm flex items-center">
                          Page {currentPage} of {totalPages}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={currentPage === totalPages}
                          onClick={() => setCurrentPage((p) => p + 1)}
                        >
                          Next
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </Card>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
