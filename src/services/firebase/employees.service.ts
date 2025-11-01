import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Employee } from '@/types';

export const employeesService = {
  async getAll(): Promise<Employee[]> {
    const snapshot = await getDocs(collection(db, 'employees'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Employee));
  },

  async create(data: Omit<Employee, 'id'>): Promise<void> {
    await addDoc(collection(db, 'employees'), data);
  },

  async update(id: string, data: Partial<Omit<Employee, 'id'>>): Promise<void> {
    await updateDoc(doc(db, 'employees', id), data);
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, 'employees', id));
  },
};
