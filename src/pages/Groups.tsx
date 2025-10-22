import React, { useEffect, useState } from 'react';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Group, Employee, Travel, Land, Plate, Destination, Driver, Debt } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Edit, Trash2, BarChart3, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';

import GroupDialog, { GroupFormData } from './groups/GroupDialog';
import TravelDialog, { TravelFormData } from './groups/TravelDialog';
import GroupTravelsDialog from './groups/GroupTravelsDialog';
import SummaryDialog from './groups/SummaryDialog';
import { getEmployeeNames } from './groups/utils';

export default function GroupsPage(): JSX.Element {
  const [groups, setGroups] = useState<Group[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [travels, setTravels] = useState<Travel[]>([]);
  const [lands, setLands] = useState<Land[]>([]);
  const [plates, setPlates] = useState<Plate[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);

  // Dialog state
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<Group | null>(null);

  const [isTravelDialogOpen, setIsTravelDialogOpen] = useState(false);
  const [editingTravel, setEditingTravel] = useState<Travel | null>(null);
  const [selectedGroupForTravel, setSelectedGroupForTravel] = useState<Group | null>(null);
  const [initialAttendance, setInitialAttendance] = useState<{ employeeId: string; present: boolean }[] | undefined>(undefined);

  const [isGroupTravelsOpen, setIsGroupTravelsOpen] = useState(false);
  const [selectedGroupForView, setSelectedGroupForView] = useState<Group | null>(null);

  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [selectedGroupForSummary, setSelectedGroupForSummary] = useState<Group | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const groupsPerPage = 5;

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [
        groupsSnap,
        employeesSnap,
        travelsSnap,
        landsSnap,
        platesSnap,
        destinationsSnap,
        driversSnap,
        debtsSnap,
      ] = await Promise.all([
        getDocs(collection(db, 'groups')),
        getDocs(collection(db, 'employees')),
        getDocs(collection(db, 'travels')),
        getDocs(collection(db, 'lands')),
        getDocs(collection(db, 'plates')),
        getDocs(collection(db, 'destinations')),
        getDocs(collection(db, 'drivers')),
        getDocs(collection(db, 'debts')),
      ]);

      // ✅ Sort groups descending (e.g., Week 10 before Week 1)
      const groupsData = groupsSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as Group));
      const sortedGroups = groupsData.sort((a, b) => {
        const numA = parseInt(a.name.match(/\d+/)?.[0] || '0', 10);
        const numB = parseInt(b.name.match(/\d+/)?.[0] || '0', 10);

        if (!isNaN(numA) && !isNaN(numB) && numA !== numB) return numB - numA;
        return b.name.localeCompare(a.name, 'en', { sensitivity: 'base' });
      });

      setGroups(sortedGroups);
      setEmployees(employeesSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as Employee)));
      setTravels(travelsSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as Travel)));
      setLands(landsSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as Land)));
      setPlates(platesSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as Plate)));
      setDestinations(destinationsSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as Destination)));
      setDrivers(driversSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as Driver)));
      setDebts(debtsSnap.docs.map((d) => ({ id: d.id, ...(d.data() as any) } as Debt)));
    } catch (err) {
      console.error('Failed to fetch data', err);
      toast.error('Failed to load data');
    }
  };

  // Pagination logic
  const indexOfLast = currentPage * groupsPerPage;
  const indexOfFirst = indexOfLast - groupsPerPage;
  const currentGroups = groups.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(groups.length / groupsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // CRUD handlers
  const openAddGroup = () => {
    setEditingGroup(null);
    setIsGroupDialogOpen(true);
  };

  const openEditGroup = (group: Group) => {
    setEditingGroup(group);
    setIsGroupDialogOpen(true);
  };

  const handleGroupSubmit = async (data: GroupFormData) => {
    try {
      if (editingGroup) {
        await updateDoc(doc(db, 'groups', editingGroup.id), data as any);
        toast.success('Group updated successfully');
      } else {
        await addDoc(collection(db, 'groups'), data);
        toast.success('Group added successfully');
      }
      setIsGroupDialogOpen(false);
      setEditingGroup(null);
      await fetchAll();
    } catch (err) {
      console.error(err);
      toast.error('Operation failed');
    }
  };

  const handleDeleteGroup = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await deleteDoc(doc(db, 'groups', id));
      toast.success('Group deleted successfully');
      await fetchAll();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete group');
    }
  };

  // Travel handlers
  const handleAddTravel = (group: Group) => {
    setSelectedGroupForTravel(group);
    setEditingTravel(null);
    const attendance = (group.employees || []).map((empId) => ({ employeeId: empId, present: false }));
    setInitialAttendance(attendance);
    setIsTravelDialogOpen(true);
  };

  const handleEditTravel = (travel: Travel) => {
    setEditingTravel(travel);
    setSelectedGroupForTravel(null);
    setInitialAttendance(travel.attendance || []);
    setIsTravelDialogOpen(true);
  };

  const handleTravelSubmit = async (data: TravelFormData) => {
    try {
      const travelData = {
        ...data,
        groupId: editingTravel
          ? (travels.find((t) => t.id === editingTravel.id)?.groupId || selectedGroupForTravel?.id)
          : selectedGroupForTravel?.id,
      } as any;

      if (editingTravel) {
        await updateDoc(doc(db, 'travels', editingTravel.id), travelData);
        toast.success('Travel updated successfully');
      } else {
        await addDoc(collection(db, 'travels'), travelData);
        toast.success('Travel added successfully');
      }

      setIsTravelDialogOpen(false);
      setEditingTravel(null);
      setSelectedGroupForTravel(null);
      await fetchAll();
    } catch (err) {
      console.error(err);
      toast.error('Operation failed');
    }
  };

  const handleDeleteTravel = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await deleteDoc(doc(db, 'travels', id));
      toast.success('Travel deleted successfully');
      await fetchAll();
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete travel');
    }
  };

  // View dialogs
  const handleViewGroupTravels = (group: Group) => {
    setSelectedGroupForView(group);
    setIsGroupTravelsOpen(true);
  };

  const handleViewSummary = (group: Group) => {
    setSelectedGroupForSummary(group);
    setIsSummaryOpen(true);
  };

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Groups</h1>
          <p className="text-muted-foreground">Organize employees into groups</p>
        </div>

        <Button className="gap-2" onClick={openAddGroup}>
          <Plus className="w-4 h-4" />
          Add Group
        </Button>
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
              {currentGroups.map((group) => (
                <tr key={group.id} className="border-b border-border hover:bg-secondary/50 transition-colors">
                  <td
                    className="py-3 px-4 text-foreground cursor-pointer hover:text-primary"
                    onClick={() => handleViewGroupTravels(group)}
                  >
                    {group.name}
                  </td>
                  <td className="py-3 px-4 text-foreground">₱{group.wage}</td>
                  <td className="py-3 px-4 text-foreground text-sm">
                    {getEmployeeNames(group.employees || [], employees) || 'No employees'}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex justify-end gap-2">
                      <Button variant="secondary" size="sm" onClick={() => openEditGroup(group)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => handleAddTravel(group)}>
                        <Plus className="w-4 h-4" />
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => handleViewSummary(group)}>
                        <BarChart3 className="w-4 h-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteGroup(group.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {groups.length > groupsPerPage && (
          <div className="flex justify-center items-center gap-4 mt-6">
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className="flex items-center gap-1"
            >
              Next <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </Card>

      {/* Dialogs */}
      <GroupDialog
        open={isGroupDialogOpen}
        onOpenChange={(o) => {
          setIsGroupDialogOpen(o);
          if (!o) setEditingGroup(null);
        }}
        employees={employees}
        editingGroup={editingGroup}
        onSubmit={handleGroupSubmit}
      />

      <TravelDialog
        open={isTravelDialogOpen}
        onOpenChange={(o) => {
          setIsTravelDialogOpen(o);
          if (!o) {
            setEditingTravel(null);
            setSelectedGroupForTravel(null);
          }
        }}
        employees={employees}
        lands={lands}
        plates={plates}
        destinations={destinations}
        drivers={drivers}
        editingTravel={editingTravel}
        initialAttendance={initialAttendance}
        onSubmit={handleTravelSubmit}
      />

      <GroupTravelsDialog
        open={isGroupTravelsOpen}
        onOpenChange={(o) => {
          setIsGroupTravelsOpen(o);
          if (!o) setSelectedGroupForView(null);
        }}
        group={selectedGroupForView}
        travels={travels}
        lands={lands}
        plates={plates}
        destinations={destinations}
        employees={employees}
        onEditTravel={(t) => {
          handleEditTravel(t);
          setIsGroupTravelsOpen(false);
        }}
        onDeleteTravel={handleDeleteTravel}
      />

      <SummaryDialog
        open={isSummaryOpen}
        onOpenChange={(o) => {
          setIsSummaryOpen(o);
          if (!o) setSelectedGroupForSummary(null);
        }}
        group={selectedGroupForSummary}
        travels={travels}
        employees={employees}
        debts={debts}
        plates={plates}
        destinations={destinations}
      />
    </div>
  );
}
