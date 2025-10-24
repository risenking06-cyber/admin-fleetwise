import { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';
import { toast } from 'sonner';
import { SummaryLoadingState } from '@/components/LoadingState';
import EmployeeSummaryTab from './summaries/EmployeeSummaryTab';
import GroupSummaryTab from './summaries/GroupSummaryTab';
import LandSummaryTab from './summaries/LandSummaryTab';

export default function Summaries() {
  const { groups, employees, travels, debts, lands, plates, destinations, drivers, loading } = useData();
  
  const [currentTab, setCurrentTab] = useState('employees');
  const [selectedGroupId, setSelectedGroupId] = useState('all');

  // const handleGenerateReport = () => {
  //   toast.info('Generating analysis report...');
  //   // TODO: Implement report generation logic
  // };

  const getViewLabel = () => {
    switch (currentTab) {
      case 'employees': return 'Employee view';
      case 'groups': return 'Group view';
      case 'lands': return 'Land view';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="animate-in fade-in duration-300">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">Global Summary</h1>
          <p className="text-muted-foreground">Loading summary data...</p>
        </div>
        <SummaryLoadingState />
      </div>
    );
  }

  return (
    <div className="animate-in fade-in duration-500">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">Global Summary</h1>
          <p className="text-muted-foreground">{getViewLabel()}</p>
        </div>
        {/* <Button
          onClick={handleGenerateReport}
          className="gap-2 bg-blue-600 hover:bg-blue-700"
        >
          <FileText className="w-4 h-4" />
          Generate Analysis Report
        </Button> */}
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
