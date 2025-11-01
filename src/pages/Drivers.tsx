import { useEffect, useState } from 'react';
import ConfirmDialog from '@/components/ConfirmDialog';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Employee, Destination, Plate } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus } from 'lucide-react';
import { DriverDialog } from '@/features/drivers/components/DriverDialog';
import { DriversTable } from '@/features/drivers/components/DriversTable';
import { useDrivers } from '@/features/drivers/hooks/useDrivers';
import { calculateDriverTotalWage } from '@/utils/calculations';
import { sortByName } from '@/utils/sorting';

export default function Drivers() {
  const driversHook = useDrivers();

  useEffect(() => {
    const fetchData = async () => {
      const [employeesSnap, destinationsSnap, platesSnap] = await Promise.all([
        getDocs(collection(db, 'employees')),
        getDocs(collection(db, 'destinations')),
        getDocs(collection(db, 'plates')),
      ]);

      driversHook.setEmployees(
        sortByName(employeesSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Employee)))
      );
      driversHook.setDestinations(
        sortByName(destinationsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Destination)))
      );
      driversHook.setPlates(
        sortByName(platesSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Plate)))
      );
    };
    fetchData();
  }, []);

  const getEmployeeName = (employeeId: string) =>
    driversHook.employees.find((e) => e.id === employeeId)?.name || 'Unknown';

  const getDestinationName = (id: string) =>
    driversHook.destinations.find((d: Destination) => d.id === id)?.name || 'Unknown Destination';

  const getPlateName = (id: string) =>
    driversHook.plates.find((p: Plate) => p.id === id)?.name || 'Unknown Plate';

  const availableEmployees = driversHook.employees.filter(
    (emp) => !driversHook.drivers.some((driver) => driver.employeeId === emp.id)
  );

  const totalTons = driversHook.driverTravels.reduce((sum, t) => sum + (t.tons || 0), 0);
  const totalTravels = driversHook.driverTravels.length;

  const travelsPerPage = 5;
  const [currentPage, setCurrentPage] = useState(1);
  const indexOfLast = currentPage * travelsPerPage;
  const indexOfFirst = indexOfLast - travelsPerPage;
  const currentTravels = driversHook.driverTravels.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(driversHook.driverTravels.length / travelsPerPage);

  const sortedDrivers = [...driversHook.drivers].sort((a, b) => {
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

        <Dialog open={driversHook.isDialogOpen} onOpenChange={driversHook.setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Driver
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      <Card className="p-6">
        <DriversTable
          drivers={sortedDrivers}
          getEmployeeName={getEmployeeName}
          onEdit={driversHook.openEditDialog}
          onView={driversHook.handleViewDriver}
          onDelete={driversHook.openDeleteDialog}
        />
      </Card>

      <Dialog open={driversHook.viewDialogOpen} onOpenChange={driversHook.setViewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              {driversHook.selectedDriver
                ? `${getEmployeeName(driversHook.selectedDriver.employeeId)}'s Travels`
                : 'Driver Travels'}
            </DialogTitle>
          </DialogHeader>

          {driversHook.selectedDriver && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-md space-y-1">
                <p className="font-semibold">
                  Total Wage:{' '}
                  <span className="text-primary">
                    ₱{calculateDriverTotalWage(driversHook.selectedDriver, driversHook.driverTravels).toLocaleString()}
                  </span>
                </p>
                <p className="text-sm text-muted-foreground">
                  Wage per travel: ₱{driversHook.selectedDriver.wage} × {driversHook.driverTravels.length} travels
                </p>
                <p className="text-sm text-muted-foreground">
                  Total Tons: {totalTons.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  Total Travels: {totalTravels}
                </p>
              </div>

              <Card className="p-4 max-h-[400px] overflow-y-auto">
                {driversHook.driverTravels.length === 0 ? (
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

      <DriverDialog
        open={driversHook.isDialogOpen}
        onOpenChange={driversHook.setIsDialogOpen}
        driver={driversHook.editingDriver}
        availableEmployees={availableEmployees}
        onSubmit={driversHook.handleSubmit}
        isSubmitting={driversHook.isSubmitting}
      />

      <ConfirmDialog
        open={driversHook.deleteConfirmOpen}
        onOpenChange={driversHook.setDeleteConfirmOpen}
        onConfirm={driversHook.handleDelete}
        title="Delete Driver"
        description="Are you sure you want to remove this driver? This action cannot be undone."
        confirmText="Delete"
      />
    </div>
  );
}
