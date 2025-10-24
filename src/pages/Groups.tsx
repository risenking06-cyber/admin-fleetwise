import React, { useState } from 'react';
import { addDoc, updateDoc, deleteDoc, doc, collection } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useData } from '@/contexts/DataContext';
import { Group, Travel } from '@/types';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Edit, Trash2, BarChart3, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { TableLoadingState } from '@/components/LoadingState';

import GroupDialog, { GroupFormData } from './groups/GroupDialog';
import TravelDialog, { TravelFormData } from './groups/TravelDialog';
import GroupTravelsDialog from './groups/GroupTravelsDialog';
import SummaryDialog from './groups/SummaryDialog';
import { getEmployeeNames } from './groups/utils';

export default function GroupsPage(): JSX.Element {
  const { groups, employees, travels, lands, plates, destinations, drivers, debts, loading, refetch } = useData();

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
      await refetch();
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
      await refetch();
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
      await refetch();
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
      await refetch();
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

  if (loading) {
    return (
      <div className="animate-in fade-in duration-300">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Groups</h1>
          <p className="text-muted-foreground">Loading groups data...</p>
        </div>
        <TableLoadingState />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
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

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead className="bg-muted/50 border-b border-border">
              <tr>
                <th className="text-left py-3 px-3 md:px-4 text-xs md:text-sm font-semibold text-foreground whitespace-nowrap">Group Name</th>
                <th className="text-left py-3 px-3 md:px-4 text-xs md:text-sm font-semibold text-foreground whitespace-nowrap">Wage</th>
                <th className="text-left py-3 px-3 md:px-4 text-xs md:text-sm font-semibold text-foreground hidden md:table-cell">Employees</th>
                <th className="text-right py-3 px-3 md:px-4 text-xs md:text-sm font-semibold text-foreground whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {currentGroups.map((group) => (
                <tr key={group.id} className="hover:bg-muted/30 transition-colors">
                  <td
                    className="py-3 px-3 md:px-4 text-foreground cursor-pointer hover:text-primary font-medium text-sm md:text-base"
                    onClick={() => handleViewGroupTravels(group)}
                  >
                    {group.name}
                  </td>
                  <td className="py-3 px-3 md:px-4 text-foreground font-semibold text-sm md:text-base whitespace-nowrap">₱{group.wage.toLocaleString()}</td>
                  <td className="py-3 px-3 md:px-4 text-foreground text-xs md:text-sm hidden md:table-cell">
                    <div className="max-w-xs truncate">
                      {getEmployeeNames(group.employees || [], employees) || 'No employees'}
                    </div>
                  </td>
                  <td className="py-3 px-3 md:px-4">
                    <div className="flex justify-end gap-1 md:gap-2 flex-wrap">
                      <Button variant="secondary" size="sm" onClick={() => openEditGroup(group)} className="h-8 w-8 md:h-9 md:w-9 p-0">
                        <Edit className="w-3 h-3 md:w-4 md:h-4" />
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => handleAddTravel(group)} className="h-8 w-8 md:h-9 md:w-9 p-0">
                        <Plus className="w-3 h-3 md:w-4 md:h-4" />
                      </Button>
                      <Button variant="secondary" size="sm" onClick={() => handleViewSummary(group)} className="h-8 w-8 md:h-9 md:w-9 p-0">
                        <BarChart3 className="w-3 h-3 md:w-4 md:h-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteGroup(group.id)} className="h-8 w-8 md:h-9 md:w-9 p-0">
                        <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
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
          <div className="flex justify-center items-center gap-2 md:gap-4 mt-4 md:mt-6 p-4">
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="flex items-center gap-1 text-xs md:text-sm"
            >
              <ChevronLeft className="w-3 h-3 md:w-4 md:h-4" /> 
              <span className="hidden sm:inline">Prev</span>
            </Button>
            <span className="text-xs md:text-sm text-muted-foreground whitespace-nowrap">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="secondary"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className="flex items-center gap-1 text-xs md:text-sm"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
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
