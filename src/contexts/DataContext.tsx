import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { collection, getDocs, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Employee, Group, Travel, Debt, Land, Plate, Destination, Driver } from '@/types';
import { sortByName, sortGroups } from '@/utils/sorting';

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

      setEmployees(sortByName(employeesSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Employee))));
      setGroups(sortGroups(groupsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Group))));
      setTravels(travelsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Travel)));
      setDebts(debtsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Debt)));
      setLands(sortByName(landsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Land))));
      setPlates(sortByName(platesSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Plate))));
      setDestinations(sortByName(destinationsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Destination))));
      setDrivers(driversSnap.docs.map((d) => ({ id: d.id, ...d.data() } as Driver)));
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();

    // Optimized real-time listeners - update only affected collections
    const unsubscribers = [
      onSnapshot(collection(db, 'employees'), (snapshot) => {
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Employee));
        setEmployees(sortByName(data));
      }),
      onSnapshot(collection(db, 'groups'), (snapshot) => {
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Group));
        setGroups(sortGroups(data));
      }),
      onSnapshot(collection(db, 'travels'), (snapshot) => {
        setTravels(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Travel)));
      }),
      onSnapshot(collection(db, 'debts'), (snapshot) => {
        setDebts(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Debt)));
      }),
      onSnapshot(collection(db, 'lands'), (snapshot) => {
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Land));
        setLands(sortByName(data));
      }),
      onSnapshot(collection(db, 'plates'), (snapshot) => {
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Plate));
        setPlates(sortByName(data));
      }),
      onSnapshot(collection(db, 'destinations'), (snapshot) => {
        const data = snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Destination));
        setDestinations(sortByName(data));
      }),
      onSnapshot(collection(db, 'drivers'), (snapshot) => {
        setDrivers(snapshot.docs.map((d) => ({ id: d.id, ...d.data() } as Driver)));
      }),
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
