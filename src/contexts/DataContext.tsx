import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Employee, Group, Travel, Debt, Land, Plate, Destination, Driver } from '@/types';

interface DataContextType {
  employees: Employee[];
  groups: Group[];
  travels: Travel[];
  debts: Debt[];
  lands: Land[];
  plates: Plate[];
  destinations: Destination[];
  drivers: Driver[];
  loading: boolean;
  refetch: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [travels, setTravels] = useState<Travel[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [lands, setLands] = useState<Land[]>([]);
  const [plates, setPlates] = useState<Plate[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [
        employeesSnap,
        groupsSnap,
        travelsSnap,
        debtsSnap,
        landsSnap,
        platesSnap,
        destinationsSnap,
        driversSnap,
      ] = await Promise.all([
        getDocs(collection(db, 'employees')),
        getDocs(collection(db, 'groups')),
        getDocs(collection(db, 'travels')),
        getDocs(collection(db, 'debts')),
        getDocs(collection(db, 'lands')),
        getDocs(collection(db, 'plates')),
        getDocs(collection(db, 'destinations')),
        getDocs(collection(db, 'drivers')),
      ]);

      // Sort groups descending
      const groupsData = groupsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Group));
      const sortedGroups = groupsData.sort((a, b) => {
        const numA = parseInt(a.name.match(/\d+/)?.[0] || '0', 10);
        const numB = parseInt(b.name.match(/\d+/)?.[0] || '0', 10);
        if (!isNaN(numA) && !isNaN(numB) && numA !== numB) return numB - numA;
        return b.name.localeCompare(a.name, 'en', { sensitivity: 'base' });
      });

      // Sort employees alphabetically
      const employeesData = employeesSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Employee));
      const sortedEmployees = employeesData.sort((a, b) => 
        a.name.localeCompare(b.name, 'en', { sensitivity: 'base' })
      );

      // Sort lands alphabetically
      const landsData = landsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Land));
      const sortedLands = landsData.sort((a, b) => 
        a.name.localeCompare(b.name, 'en', { sensitivity: 'base' })
      );

      // Sort plates alphabetically
      const platesData = platesSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Plate));
      const sortedPlates = platesData.sort((a, b) => 
        a.name.localeCompare(b.name, 'en', { sensitivity: 'base' })
      );

      // Sort destinations alphabetically
      const destinationsData = destinationsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Destination));
      const sortedDestinations = destinationsData.sort((a, b) => 
        a.name.localeCompare(b.name, 'en', { sensitivity: 'base' })
      );

      setEmployees(sortedEmployees);
      setGroups(sortedGroups);
      setTravels(travelsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Travel)));
      setDebts(debtsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Debt)));
      setLands(sortedLands);
      setPlates(sortedPlates);
      setDestinations(sortedDestinations);
      setDrivers(driversSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Driver)));
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();

    // Set up real-time listeners for instant updates
    const unsubscribers = [
      onSnapshot(collection(db, 'employees'), () => fetchAllData()),
      onSnapshot(collection(db, 'groups'), () => fetchAllData()),
      onSnapshot(collection(db, 'travels'), () => fetchAllData()),
      onSnapshot(collection(db, 'debts'), () => fetchAllData()),
      onSnapshot(collection(db, 'lands'), () => fetchAllData()),
      onSnapshot(collection(db, 'plates'), () => fetchAllData()),
      onSnapshot(collection(db, 'destinations'), () => fetchAllData()),
      onSnapshot(collection(db, 'drivers'), () => fetchAllData()),
    ];

    return () => unsubscribers.forEach((unsub) => unsub());
  }, []);

  return (
    <DataContext.Provider
      value={{
        employees,
        groups,
        travels,
        debts,
        lands,
        plates,
        destinations,
        drivers,
        loading,
        refetch: fetchAllData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
