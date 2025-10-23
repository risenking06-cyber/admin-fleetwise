import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Travel, Group, Employee, Debt, Land, Plate, Destination, Driver } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
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
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Global Summary</h1>
          <p className="text-muted-foreground">{getViewLabel()}</p>
        </div>
        <Button
          onClick={handleGenerateReport}
          className="gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <FileText className="w-4 h-4" />
          Generate Analysis Report
        </Button>
      </div>

      <Tabs value={currentTab} onValueChange={setCurrentTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="employees">Employee Summary</TabsTrigger>
          <TabsTrigger value="groups">Group Summary</TabsTrigger>
          <TabsTrigger value="lands">Land Summary</TabsTrigger>
        </TabsList>

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
      </Tabs>
    </div>
  );
}
