import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Debt } from '@/types';

export const debtsService = {
  async getAll(): Promise<Debt[]> {
    const snapshot = await getDocs(collection(db, 'debts'));
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Debt));
  },

  async create(data: Omit<Debt, 'id'>): Promise<void> {
    await addDoc(collection(db, 'debts'), data);
  },

  async update(id: string, data: Partial<Omit<Debt, 'id'>>): Promise<void> {
    await updateDoc(doc(db, 'debts', id), data);
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, 'debts', id));
  },

  async markAsPaid(id: string): Promise<void> {
    await updateDoc(doc(db, 'debts', id), { paid: true });
  },
};
