import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, Calendar, Clock, User, FileText, Phone, CheckCircle, PoundSterling } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { Call } from '@/types/calls';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, addWeeks, subWeeks, isToday, isSameDay } from 'date-fns';

const CalendarView = () => {
  console.log('CalendarView rendering...');
  const { calls } = useData();
  console.log('CalendarView calls:', calls);
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [selectedCall, setSelectedCall] = useState<Call | null>(null);

  const weekStart = startOfWeek(currentWeek, { weekStartsOn: 1 }); // Monday start
  const weekEnd = endOfWeek(currentWeek, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  // Filter calls for current week
  const weekCalls = calls.filter(call => {
    const callDate = new Date(call.date);
    return callDate >= weekStart && callDate <= weekEnd;
  });

  // Group calls by day
  const callsByDay: Record<string, Call[]> = {};
  weekDays.forEach(day => {
    const dayKey = format(day, 'yyyy-MM-dd');
    callsByDay[dayKey] = weekCalls.filter(call => call.date === dayKey);
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'no-show': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCallTypeIcon = (type: string) => {
    switch (type) {
      case 'call': return <Phone className="w-3 h-3" />;
      case 'meeting': return <Calendar className="w-3 h-3" />;
      case 'consultation': return <Calendar className="w-3 h-3" />;
      default: return <Phone className="w-3 h-3" />;
    }
  };

  const previousWeek = () => {
    setCurrentWeek(subWeeks(currentWeek, 1));
  };

  const nextWeek = () => {
    setCurrentWeek(addWeeks(currentWeek, 1));
  };

  const goToCurrentWeek = () => {
    setCurrentWeek(new Date());
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Weekly Call Calendar
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={previousWeek}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToCurrentWeek}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={nextWeek}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day, index) => {
              const dayKey = format(day, 'yyyy-MM-dd');
              const dayCalls = callsByDay[dayKey] || [];
              const dayCallsSorted = dayCalls.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
              
              return (
                <div key={index} className="min-h-[120px]">
                  <div className={`p-2 border rounded-lg ${isToday(day) ? 'bg-primary/5 border-primary/20' : 'bg-card'}`}>
                    <div className="text-sm font-medium mb-2 text-center">
                      <div>{format(day, 'EEE')}</div>
                      <div className={`text-lg ${isToday(day) ? 'text-primary font-bold' : ''}`}>
                        {format(day, 'd')}
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      {dayCallsSorted.map((call) => (
                        <Dialog key={call.id}>
                          <DialogTrigger asChild>
                            <div
                              className={`text-xs p-1 rounded border cursor-pointer hover:opacity-80 transition-opacity ${getStatusColor(call.status)}`}
                              onClick={() => setSelectedCall(call)}
                            >
                              <div className="flex items-center gap-1 mb-1">
                                {getCallTypeIcon(call.callType)}
                                <span className="font-medium truncate">{call.clientName}</span>
                              </div>
                              <div className="flex items-center gap-1 text-xs opacity-75">
                                <Clock className="w-2 h-2" />
                                <span>{call.time}</span>
                                {call.isConverted && (
                                  <PoundSterling className="w-2 h-2 text-green-600" />
                                )}
                              </div>
                            </div>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                {getCallTypeIcon(call.callType)}
                                Call Details
                              </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Client</label>
                                  <p className="text-sm">{call.clientName}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Type</label>
                                  <p className="text-sm capitalize">{call.callType}</p>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Date</label>
                                  <p className="text-sm">{call.date}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Time</label>
                                  <p className="text-sm">{call.time}</p>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Duration</label>
                                  <p className="text-sm">{call.duration} minutes</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                                  <Badge className={getStatusColor(call.status)}>
                                    {call.status === 'completed' && <CheckCircle className="w-3 h-3 mr-1" />}
                                    <span className="capitalize">{call.status}</span>
                                  </Badge>
                                </div>
                              </div>

                              {call.isConverted && (
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground">Conversion</label>
                                  <div className="flex items-center gap-2">
                                    <Badge className="bg-green-100 text-green-800">
                                      <PoundSterling className="w-3 h-3 mr-1" />
                                      £{call.conversionAmount?.toLocaleString()}
                                    </Badge>
                                  </div>
                                </div>
                              )}

                              {call.notes && (
                                <div>
                                  <label className="text-sm font-medium text-muted-foreground flex items-center gap-1 mb-2">
                                    <FileText className="w-3 h-3" />
                                    Notes
                                  </label>
                                  <div className="bg-muted/50 p-3 rounded-lg">
                                    <p className="text-sm whitespace-pre-wrap">{call.notes}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </DialogContent>
                        </Dialog>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarView;