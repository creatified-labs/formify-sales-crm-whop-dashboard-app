import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { RevenueEntry, Goal } from "@/types/revenue";
import { Call } from "@/types/calls";

interface DataContextType {
  revenueEntries: RevenueEntry[];
  goals: Goal[];
  calls: Call[];
  setRevenueEntries: (entries: RevenueEntry[]) => void;
  setGoals: (goals: Goal[]) => void;
  setCalls: (calls: Call[]) => void;
  addRevenueEntry: (entry: RevenueEntry) => void;
  updateRevenueEntry: (entry: RevenueEntry) => void;
  deleteRevenueEntry: (entryId: string) => void;
  addGoal: (goal: Goal) => void;
  deleteGoal: (goalId: string) => void;
  addCall: (call: Call) => void;
  updateCall: (call: Call) => void;
  deleteCall: (callId: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const [revenueEntries, setRevenueEntries] = useState<RevenueEntry[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [calls, setCalls] = useState<Call[]>([]);

  console.log('DataProvider initialized with empty arrays');

  // Load data from localStorage on mount
  useEffect(() => {
    console.log('Loading data from localStorage...');
    
    const savedEntries = localStorage.getItem('revenueEntries');
    const savedGoals = localStorage.getItem('goals');
    const savedCalls = localStorage.getItem('calls');
    
    console.log('Saved entries from localStorage:', savedEntries);
    console.log('Saved goals from localStorage:', savedGoals);
    console.log('Saved calls from localStorage:', savedCalls);
    
    if (savedEntries) {
      const parsed = JSON.parse(savedEntries).map((entry: any) => ({
        ...entry,
        createdAt: new Date(entry.createdAt),
      }));
      console.log('Parsed revenue entries:', parsed);
      setRevenueEntries(parsed);
    }
    
    if (savedGoals) {
      const parsed = JSON.parse(savedGoals).map((goal: any) => ({
        ...goal,
        createdAt: new Date(goal.createdAt),
      }));
      console.log('Parsed goals:', parsed);
      setGoals(parsed);
    }

    if (savedCalls) {
      const parsed = JSON.parse(savedCalls).map((call: any) => ({
        ...call,
        createdAt: new Date(call.createdAt),
      }));
      console.log('Parsed calls:', parsed);
      setCalls(parsed);
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem('revenueEntries', JSON.stringify(revenueEntries));
  }, [revenueEntries]);

  useEffect(() => {
    localStorage.setItem('goals', JSON.stringify(goals));
  }, [goals]);

  useEffect(() => {
    localStorage.setItem('calls', JSON.stringify(calls));
  }, [calls]);

  const addRevenueEntry = (entry: RevenueEntry) => {
    setRevenueEntries(prev => [entry, ...prev]);
  };

  const updateRevenueEntry = (updatedEntry: RevenueEntry) => {
    setRevenueEntries(prev => prev.map(entry => 
      entry.id === updatedEntry.id ? updatedEntry : entry
    ));
  };

  const deleteRevenueEntry = (entryId: string) => {
    setRevenueEntries(prev => prev.filter(entry => entry.id !== entryId));
  };

  const addGoal = (goal: Goal) => {
    setGoals(prev => [goal, ...prev]);
  };

  const deleteGoal = (goalId: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== goalId));
  };

  const addCall = (call: Call) => {
    setCalls(prev => [call, ...prev]);
  };

  const updateCall = (updatedCall: Call) => {
    setCalls(prev => {
      const previousCall = prev.find(call => call.id === updatedCall.id);
      
      // If call was previously converted but now isn't, remove the revenue entry
      if (previousCall?.isConverted && !updatedCall.isConverted) {
        const revenueEntryId = `revenue-${updatedCall.id}`;
        setRevenueEntries(prevRevenue => 
          prevRevenue.filter(entry => entry.id !== revenueEntryId)
        );
      }
      
      return prev.map(call => 
        call.id === updatedCall.id ? updatedCall : call
      );
    });
    
    // If call was converted, add revenue entry
    if (updatedCall.isConverted && updatedCall.conversionAmount) {
      const revenueEntry: RevenueEntry = {
        id: `revenue-${updatedCall.id}`,
        amount: updatedCall.conversionAmount,
        description: `Conversion from ${updatedCall.callType}: ${updatedCall.clientName}`,
        category: 'calls',
        categoryName: 'Calls',
        categoryColor: 'hsl(142, 76%, 36%)',
        date: updatedCall.date,
        createdAt: new Date(),
      };
      
      // Check if revenue entry already exists, if not add it
      setRevenueEntries(prev => {
        const exists = prev.some(entry => entry.id === revenueEntry.id);
        if (!exists) {
          return [revenueEntry, ...prev];
        }
        return prev;
      });
    }
  };

  const deleteCall = (callId: string) => {
    setCalls(prev => prev.filter(call => call.id !== callId));
  };

  const value = {
    revenueEntries,
    goals,
    calls,
    setRevenueEntries,
    setGoals,
    setCalls,
    addRevenueEntry,
    updateRevenueEntry,
    deleteRevenueEntry,
    addGoal,
    deleteGoal,
    addCall,
    updateCall,
    deleteCall,
  };

  return (
    <DataContext.Provider value={value}>
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