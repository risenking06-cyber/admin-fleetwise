import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Travel, Group, Employee, Debt, Land, Plate, Destination, Driver } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { FileText, X } from 'lucide-react';
import { toast } from 'sonner';
import EmployeeSummaryTab from './summaries/EmployeeSummaryTab';
import GroupSummaryTab from './summaries/GroupSummaryTab';
import LandSummaryTab from './summaries/LandSummaryTab';

export default function Summaries() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [travels, setTravels] = useState<Travel[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [lands, setLands] = useState<Land[]>([]);
  const [plates, setPlates] = useState<Plate[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  
  const [dialogOpen, setDialogOpen] = useState(true);
  const [currentTab, setCurrentTab] = useState('employees');
  const [selectedGroupId, setSelectedGroupId] = useState('all');

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [
        groupsData,
        employeesData,
        travelsData,
        debtsData,
        landsData,
        platesData,
        destinationsData,
        driversData,
      ] = await Promise.all([
        getDocs(collection(db, 'groups')),
        getDocs(collection(db, 'employees')),
        getDocs(collection(db, 'travels')),
        getDocs(collection(db, 'debts')),
        getDocs(collection(db, 'lands')),
        getDocs(collection(db, 'plates')),
        getDocs(collection(db, 'destinations')),
        getDocs(collection(db, 'drivers')),
      ]);

      setGroups(groupsData.docs.map(doc => ({ id: doc.id, ...doc.data() } as Group)));
      setEmployees(employeesData.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee)));
      setTravels(travelsData.docs.map(doc => ({ id: doc.id, ...doc.data() } as Travel)));
      setDebts(debtsData.docs.map(doc => ({ id: doc.id, ...doc.data() } as Debt)));
      setLands(landsData.docs.map(doc => ({ id: doc.id, ...doc.data() } as Land)));
      setPlates(platesData.docs.map(doc => ({ id: doc.id, ...doc.data() } as Plate)));
      setDestinations(destinationsData.docs.map(doc => ({ id: doc.id, ...doc.data() } as Destination)));
      setDrivers(driversData.docs.map(doc => ({ id: doc.id, ...doc.data() } as Driver)));
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast.error('Failed to fetch data');
    }
  };

  const handleGenerateReport = () => {
    toast.info('Generating analysis report...');
    // TODO: Implement report generation logic
  };

  const getViewLabel = () => {
    switch (currentTab) {
      case 'employees': return 'Employee view';
      case 'groups': return 'Group view';
      case 'lands': return 'Land view';
      default: return '';
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4 flex flex-row items-center justify-between">
          <DialogTitle className="text-2xl font-bold">Global Summary</DialogTitle>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{getViewLabel()}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDialogOpen(false)}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="px-6">
          <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="employees">Employee Summary</TabsTrigger>
              <TabsTrigger value="groups">Group Summary</TabsTrigger>
              <TabsTrigger value="lands">Land Summary</TabsTrigger>
            </TabsList>

            <div className="max-h-[calc(95vh-220px)] overflow-y-auto pb-6">
              <TabsContent value="employees" className="mt-0">
                <EmployeeSummaryTab
                  employees={employees}
                  groups={groups}
                  travels={travels}
                  debts={debts}
                  selectedGroupId={selectedGroupId}
                  onGroupChange={setSelectedGroupId}
                />
              </TabsContent>

              <TabsContent value="groups" className="mt-0">
                <GroupSummaryTab
                  groups={groups}
                  travels={travels}
                  employees={employees}
                  plates={plates}
                  destinations={destinations}
                  selectedGroupId={selectedGroupId}
                  onGroupChange={setSelectedGroupId}
                />
              </TabsContent>

              <TabsContent value="lands" className="mt-0">
                <LandSummaryTab
                  travels={travels}
                  groups={groups}
                  employees={employees}
                  lands={lands}
                  plates={plates}
                  destinations={destinations}
                  drivers={drivers}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <div className="px-6 pb-6 flex items-center justify-between border-t pt-4">
          <Button
            onClick={handleGenerateReport}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <FileText className="w-4 h-4" />
            Generate Analysis Report
          </Button>
          <Button variant="outline" onClick={() => setDialogOpen(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
