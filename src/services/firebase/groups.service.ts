import { collection, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Group } from '@/types';

export const groupsService = {
  async create(data: Omit<Group, 'id'>): Promise<void> {
    await addDoc(collection(db, 'groups'), data);
  },

  async update(id: string, data: Partial<Omit<Group, 'id'>>): Promise<void> {
    await updateDoc(doc(db, 'groups', id), data);
  },

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, 'groups', id));
  },
};
