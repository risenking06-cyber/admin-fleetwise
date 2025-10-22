
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Group, Travel, Land, Plate, Destination, Employee } from '@/types';

interface GroupTravelsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  group?: Group | null;
  travels: Travel[];
  lands: Land[];
  plates: Plate[];
  destinations: Destination[];
  employees: Employee[];
  onEditTravel: (travel: Travel) => void;
  onDeleteTravel: (id: string) => Promise<void>;
}

export default function GroupTravelsDialog({
  open,
  onOpenChange,
  group,
  travels,
  lands,
  plates,
  destinations,
  employees,
  onEditTravel,
  onDeleteTravel,
}: GroupTravelsDialogProps) {
  if (!group) return null;

  const groupTravels = travels.filter((t) => t.groupId === group.id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="text-2xl">{group.name} - Travels</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto max-h-[calc(85vh-8rem)] p-2">
          {groupTravels.length === 0 && <p className="text-center text-muted-foreground py-8">No travels yet</p>}
          {groupTravels.map((travel) => {
            const land = lands.find((l) => l.id === travel.land);
            const driver = employees.find((e) => e.id === travel.driver);
            const plate = plates.find((p) => p.id === travel.plateNumber);
            const destination = destinations.find((d) => d.id === travel.destination);

            return (
              <Card key={travel.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{travel.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {travel.ticket && `Ticket: ${travel.ticket} • `}
                        {travel.tons} tons • {land?.name} • {driver?.name} • {plate?.name} • {destination?.name}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="secondary" size="sm" onClick={() => onEditTravel(travel)}>
                        Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => onDeleteTravel(travel.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">
                    <strong>Attendance:</strong>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {travel.attendance.map((att) => {
                        const emp = employees.find((e) => e.id === att.employeeId);
                        return emp ? (
                          <Badge key={att.employeeId} variant={att.present ? 'default' : 'secondary'}>
                            {emp.name} - {att.present ? 'Present' : 'Absent'}
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
