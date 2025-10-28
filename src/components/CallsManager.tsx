import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Trash2, Phone, Calendar, Clock, CheckCircle, Circle, PoundSterling, Edit, UserX, Users, Filter, X, RotateCcw, Calendar as CalendarIcon } from "lucide-react";
import { Call, CallStats } from "@/types/calls";
import { useData } from "@/contexts/DataContext";
import { toast } from "sonner";
import { format } from "date-fns";

const CallsManager = () => {
  const { calls, addCall, updateCall, deleteCall } = useData();
  const [isAddingCall, setIsAddingCall] = useState(false);
  const [editingCall, setEditingCall] = useState<Call | null>(null);
  const [isFilterExpanded, setIsFilterExpanded] = useState(false);
  const [dateFilter, setDateFilter] = useState<{
    from?: Date;
    to?: Date;
  }>({});
  const [formData, setFormData] = useState<{
    clientName: string;
    callType: "call" | "meeting" | "consultation";
    date: string;
    time: string;
    duration: number;
    notes: string;
    status: "scheduled" | "completed" | "cancelled" | "no-show" | "hasn't paid yet";
    isConverted: boolean;
    conversionAmount: string | number;
  }>({
    clientName: "",
    callType: "call" as "call" | "meeting" | "consultation",
    date: new Date().toISOString().split('T')[0],
    time: "09:00",
    duration: 30,
    notes: "",
    status: "scheduled" as "scheduled" | "completed" | "cancelled" | "no-show" | "hasn't paid yet",
    isConverted: false,
    conversionAmount: "",
  });

  // Filter calls based on date range
  const filteredCalls = useMemo(() => {
    return calls.filter(call => {
      const callDate = new Date(call.date);
      
      if (dateFilter.from && callDate < dateFilter.from) {
        return false;
      }
      
      if (dateFilter.to) {
        const endDate = new Date(dateFilter.to);
        endDate.setHours(23, 59, 59, 999);
        if (callDate > endDate) {
          return false;
        }
      }
      
      return true;
    });
  }, [calls, dateFilter]);

  const callStats: CallStats = useMemo(() => {
    const statsData = filteredCalls;
    
    return {
      totalCalls: statsData.length,
      completedCalls: statsData.filter(call => call.status === 'completed').length,
      noShowCalls: statsData.filter(call => call.status === 'no-show').length,
      showRate: (() => {
        const actuallyHappened = statsData.filter(call => call.status === 'completed' || call.status === 'no-show').length;
        const showedUp = statsData.filter(call => call.status === 'completed').length;
        return actuallyHappened > 0 ? (showedUp / actuallyHappened) * 100 : 0;
      })(),
      conversions: statsData.filter(call => call.isConverted).length,
      conversionRate: (() => {
        const eligibleCalls = statsData.filter(call => call.status === 'completed' || call.status === "hasn't paid yet");
        return eligibleCalls.length > 0 
          ? (statsData.filter(call => call.isConverted && call.status === 'completed').length / eligibleCalls.length) * 100 
          : 0;
      })(),
      totalRevenue: statsData.filter(call => call.isConverted).reduce((sum, call) => sum + (call.conversionAmount || 0), 0),
    };
  }, [filteredCalls]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted, prevented default');
    
    try {
      if (editingCall) {
        // Update existing call
        const updatedCall: Call = {
          ...editingCall,
          ...formData,
          conversionAmount: formData.conversionAmount ? Number(formData.conversionAmount) : 0,
        };

        console.log('Updating call:', updatedCall);
        updateCall(updatedCall);
        toast.success("Call updated successfully!");
        setEditingCall(null);
      } else {
        // Add new call
        const newCall: Call = {
          id: `call-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          ...formData,
          conversionAmount: formData.conversionAmount ? Number(formData.conversionAmount) : 0,
          createdAt: new Date(),
        };

        console.log('Adding new call:', newCall);
        addCall(newCall);
        
        // If call was converted during creation, manually trigger revenue entry creation
        if (newCall.isConverted && newCall.conversionAmount) {
          console.log('Call converted, updating...');
          updateCall(newCall);
        }
        
        toast.success("Call added successfully!");
      }
      
      // Reset form
      setFormData({
        clientName: "",
        callType: "call",
        date: new Date().toISOString().split('T')[0],
        time: "09:00",
        duration: 30,
        notes: "",
        status: "scheduled",
        isConverted: false,
        conversionAmount: "",
      });
      
      setIsAddingCall(false);
      console.log('Form reset and closed');
    } catch (error) {
      console.error('Error with call:', error);
      toast.error(editingCall ? "Failed to update call" : "Failed to add call");
    }
  };

  const handleEditCall = (call: Call) => {
    setEditingCall(call);
    setFormData({
      clientName: call.clientName,
      callType: call.callType,
      date: call.date,
      time: call.time,
      duration: call.duration,
      notes: call.notes || "",
      status: call.status,
      isConverted: call.isConverted || false,
      conversionAmount: call.conversionAmount || "",
    });
    setIsAddingCall(true);
  };

  const handleToggleConversion = (call: Call) => {
    const updatedCall = { ...call, isConverted: !call.isConverted };
    
    if (!call.isConverted && !call.conversionAmount) {
      // Prompt for conversion amount if converting
      const amount = prompt("Enter conversion amount (£):");
      if (amount && !isNaN(Number(amount))) {
        updatedCall.conversionAmount = Number(amount);
      } else {
        return;
      }
    }
    
    updateCall(updatedCall);
    toast.success(updatedCall.isConverted ? "Call marked as converted!" : "Conversion removed");
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'scheduled': return <Clock className="w-4 h-4 text-blue-600" />;
      case 'cancelled': return <Circle className="w-4 h-4 text-red-600" />;
      case 'no-show': return <Circle className="w-4 h-4 text-orange-600" />;
      case "hasn't paid yet": return <Circle className="w-4 h-4 text-yellow-600" />;
      default: return <Circle className="w-4 h-4" />;
    }
  };

  const getCallTypeIcon = (type: string) => {
    switch (type) {
      case 'call': return <Phone className="w-4 h-4" />;
      case 'meeting': return <Calendar className="w-4 h-4" />;
      case 'consultation': return <Calendar className="w-4 h-4" />;
      default: return <Phone className="w-4 h-4" />;
    }
  };

  const hasActiveFilters = dateFilter.from || dateFilter.to;

  const clearFilters = () => {
    setDateFilter({});
  };

  return (
    <div className="space-y-6">
      {/* Filter Panel */}
      <Card className="card-smooth">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-responsive">
              <Filter className="w-5 h-5" />
              Call Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2">
                  {filteredCalls.length} of {calls.length}
                </Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  className="button-smooth gap-1"
                >
                  <RotateCcw className="w-4 h-4" />
                  Clear
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFilterExpanded(!isFilterExpanded)}
                className="button-smooth"
              >
                {isFilterExpanded ? <X className="w-4 h-4" /> : <Filter className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>

        {isFilterExpanded && (
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label className="text-responsive">Date Range</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">From</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start button-smooth"
                      >
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        {dateFilter.from ? format(dateFilter.from, "PPP") : "Select start date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-background border shadow-lg" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={dateFilter.from}
                        onSelect={(date) => setDateFilter(prev => ({ ...prev, from: date }))}
                        className="p-3"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label className="text-sm text-muted-foreground">To</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full justify-start button-smooth"
                      >
                        <CalendarIcon className="w-4 h-4 mr-2" />
                        {dateFilter.to ? format(dateFilter.to, "PPP") : "Select end date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-background border shadow-lg" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={dateFilter.to}
                        onSelect={(date) => setDateFilter(prev => ({ ...prev, to: date }))}
                        className="p-3"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-7 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{callStats.totalCalls}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">No Shows</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{callStats.noShowCalls}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Show Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{callStats.showRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Completed vs No-shows
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{callStats.completedCalls}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversions</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{callStats.conversions}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{callStats.conversionRate.toFixed(1)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <PoundSterling className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">£{callStats.totalRevenue.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      {/* Add Call Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            {editingCall ? "Edit Call" : "Add New Call"}
            <Button 
              onClick={() => {
                setIsAddingCall(!isAddingCall);
                if (isAddingCall) {
                  setEditingCall(null);
                  setFormData({
                    clientName: "",
                    callType: "call",
                    date: new Date().toISOString().split('T')[0],
                    time: "09:00",
                    duration: 30,
                    notes: "",
                    status: "scheduled",
                    isConverted: false,
                    conversionAmount: "",
                  });
                }
              }}
              variant="outline"
            >
              {isAddingCall ? "Cancel" : "Add Call"}
            </Button>
          </CardTitle>
        </CardHeader>
        {isAddingCall && (
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="clientName">Client Name</Label>
                  <Input
                    id="clientName"
                    type="text"
                    value={formData.clientName}
                    onChange={(e) => {
                      e.preventDefault();
                      setFormData({ ...formData, clientName: e.target.value });
                    }}
                    required
                    autoComplete="off"
                  />
                </div>

                <div>
                  <Label htmlFor="callType">Call Type</Label>
                  <Select 
                    value={formData.callType} 
                    onValueChange={(value: any) => setFormData({ ...formData, callType: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="call">Phone Call</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="consultation">Consultation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                    min="1"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={formData.status} 
                    onValueChange={(value: any) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="no-show">No Show</SelectItem>
                      <SelectItem value="hasn't paid yet">Hasn't Paid Yet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(formData.status === 'completed' || formData.status === "hasn't paid yet") && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="isConverted"
                        checked={formData.isConverted}
                        onCheckedChange={(checked) => setFormData({ ...formData, isConverted: checked })}
                      />
                      <Label htmlFor="isConverted">Converted to Sale</Label>
                    </div>
                    {formData.isConverted && (
                      <>
                        <div>
                          <Label htmlFor="conversionAmount">Conversion Amount (£)</Label>
                           <Input
                            id="conversionAmount"
                            type="number"
                            value={formData.conversionAmount}
                            onChange={(e) => setFormData({ ...formData, conversionAmount: e.target.value })}
                            min="0"
                            step="0.01"
                            placeholder="Enter amount"
                          />
                         </div>
                       </>
                     )}
                   </div>
                 )}
              </div>

              <div>
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full">
                {editingCall ? "Update Call" : "Add Call"}
              </Button>
            </form>
          </CardContent>
        )}
      </Card>

      {/* Calls List */}
      <Card>
        <CardHeader>
          <CardTitle>
            {hasActiveFilters ? 'Filtered Calls' : 'Recent Calls'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredCalls.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              {calls.length === 0 ? 'No calls recorded yet. Add your first call above!' : 'No calls found for the selected date range.'}
            </p>
          ) : (
            <div className="space-y-4">
              {filteredCalls.map((call) => (
                <div key={call.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    {getCallTypeIcon(call.callType)}
                    <div>
                      <h3 className="font-medium">{call.clientName}</h3>
                      <p className="text-sm text-muted-foreground">
                        {call.callType} • {call.date} {call.time} • {call.duration}min
                      </p>
                      {call.notes && (
                        <p className="text-sm text-muted-foreground mt-1">{call.notes}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge variant={call.status === 'completed' ? 'default' : 'secondary'}>
                      <div className="flex items-center space-x-1">
                        {getStatusIcon(call.status)}
                        <span className="capitalize">{call.status}</span>
                      </div>
                    </Badge>
                    
                    {call.isConverted && (
                      <Badge variant="default" className="bg-green-600">
                        £{call.conversionAmount?.toLocaleString()}
                      </Badge>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEditCall(call)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>

                    {call.status === 'completed' && (
                      <Button
                        size="sm"
                        variant={call.isConverted ? "secondary" : "default"}
                        onClick={() => handleToggleConversion(call)}
                      >
                        {call.isConverted ? "Remove Conversion" : "Mark Converted"}
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => deleteCall(call.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CallsManager;