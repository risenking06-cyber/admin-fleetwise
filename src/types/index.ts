export interface Employee {
  id: string;
  name: string;
  type: string;
}


export interface Group {
  id: string;
  name: string;
  wage: number;
  employees: string[]; // Employee IDs
}

export interface Travel {
  id: string;
  name: string;
  land: string;
  driver: string; // Employee ID
  plateNumber: string;
  destination: string;
  ticket?: string;
  tons: number;
  bags?: number;
  sugarcane_price?: number;
  molasses?: number;
  molasses_price?: number;
  groupId: string;
  pstc?:string;
  attendance: {
    employeeId: string;
    present: boolean;
  }[];

  expenses?: {
    id?: string;      // optional, in case you want to reference specific expense docs later
    name: string;     // e.g., "Fuel", "Food", "Toll Fee"
    amount: number;   // e.g., 500
  }[]; // ✅ NEW field
}

export interface Driver {
  id: string;
  employeeId: string;
  wage?:number;
}

export interface Debt {
  id: string;
  employeeId: string;
  amount: number;
  description: string;
  paid:boolean;
  date: string;
}

export interface Land {
  id: string;
  name: string;
}

export interface Plate {
  id: string;
  name: string;
}

export interface Destination {
  id: string;
  name: string;
}
