import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Travel } from '@/types';

export const travelsService = {
  async create(data: Omit<Travel, 'id'>): Promise<void> {
    await addDoc(collection(db, 'travels'), data);
  },

  async update(id: string, data: Partial<Omit<Travel, 'id'>>): Promise<void> {
    await updateDoc(doc(db, 'travels', id), data);
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, 'travels', id));
  },
};
