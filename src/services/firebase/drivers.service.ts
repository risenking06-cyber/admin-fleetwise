import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Driver, Travel } from '@/types';

export const driversService = {
  async getAll(): Promise<Driver[]> {
    const snapshot = await getDocs(collection(db, 'drivers'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Driver));
  },

  async create(data: Omit<Driver, 'id'>): Promise<void> {
    await addDoc(collection(db, 'drivers'), data);
  },

  async update(id: string, data: Partial<Omit<Driver, 'id'>>): Promise<void> {
    await updateDoc(doc(db, 'drivers', id), data);
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, 'drivers', id));
  },

  async getDriverTravels(employeeId: string): Promise<Travel[]> {
    const q = query(collection(db, 'travels'), where('driver', '==', employeeId));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Travel));
  },
};
