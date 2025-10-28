import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Phone, Plus, Edit, Trash2, Check, X, Clock, UserX, Calendar, List } from "lucide-react";
import { useData } from "@/contexts/DataContext";
import { Call } from "@/types/calls";
import { toast } from "sonner";
import { format } from "date-fns";
import CalendarView from "@/components/CalendarView";

const CallTracker = () => {
  const { calls, addCall, updateCall, deleteCall } = useData();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCall, setEditingCall] = useState<Call | null>(null);
  const [formData, setFormData] = useState<{
    clientName: string;
    email: string;
    phone: string;
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
    email: "",
    phone: "",
    callType: "call",
    date: new Date().toISOString().split('T')[0],
    time: "09:00",
    duration: 30,
    notes: "",
    status: "scheduled",
    isConverted: false,
    conversionAmount: "",
  });

  const resetForm = () => {
    setFormData({
      clientName: "",
      email: "",
      phone: "",
      callType: "call",
      date: new Date().toISOString().split('T')[0],
      time: "09:00",
      duration: 30,
      notes: "",
      status: "scheduled",
      isConverted: false,
      conversionAmount: "",
    });
    setEditingCall(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingCall) {
        const updatedCall: Call = {
          ...editingCall,
          clientName: formData.clientName,
          email: formData.email,
          phone: formData.phone,
          callType: formData.callType,
          date: formData.date,
          time: formData.time,
          duration: formData.duration,
          notes: formData.notes,
          status: formData.status,
          isConverted: formData.isConverted,
          conversionAmount: formData.conversionAmount ? Number(formData.conversionAmount) : 0,
        };

        updateCall(updatedCall);
        toast.success("Call updated successfully!");
      } else {
        const newCall: Call = {
          id: `call-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          clientName: formData.clientName,
          email: formData.email,
          phone: formData.phone,
          callType: formData.callType,
          date: formData.date,
          time: formData.time,
          duration: formData.duration,
          notes: formData.notes,
          status: formData.status,
          isConverted: formData.isConverted,
          conversionAmount: formData.conversionAmount ? Number(formData.conversionAmount) : 0,
          createdAt: new Date(),
        };

        addCall(newCall);
        
        if (newCall.isConverted && newCall.conversionAmount) {
          updateCall(newCall);
        }
        
        toast.success("Call added successfully!");
      }
      
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error with call:', error);
      toast.error(editingCall ? "Failed to update call" : "Failed to add call");
    }
  };

  const handleEdit = (call: Call) => {
    setEditingCall(call);
    setFormData({
      clientName: call.clientName,
      email: call.email || "",
      phone: call.phone || "",
      callType: call.callType,
      date: call.date,
      time: call.time,
      duration: call.duration,
      notes: call.notes || "",
      status: call.status,
      isConverted: call.isConverted || false,
      conversionAmount: call.conversionAmount || "",
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (callId: string) => {
    if (confirm("Are you sure you want to delete this call?")) {
      deleteCall(callId);
      toast.success("Call deleted successfully!");
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <Check className="w-4 h-4" />;
      case 'scheduled': return <Clock className="w-4 h-4" />;
      case 'cancelled': return <X className="w-4 h-4" />;
      case 'no-show': return <UserX className="w-4 h-4" />;
      case "hasn't paid yet": return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'scheduled': return 'secondary';
      case 'cancelled': return 'destructive';
      case 'no-show': return 'outline';
      case "hasn't paid yet": return 'secondary';
      default: return 'secondary';
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Call Tracker
            </h1>
            <p className="text-muted-foreground">
              Manage your calls, notes, and follow-ups in one place
            </p>
          </div>
        </div>

        <Tabs defaultValue="table" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList className="tabs-list-enhanced">
              <TabsTrigger value="table" className="tab-trigger-enhanced gap-2">
                <List className="w-4 h-4" />
                Call Table
              </TabsTrigger>
              <TabsTrigger value="calendar" className="tab-trigger-enhanced gap-2">
                <Calendar className="w-4 h-4" />
                Calendar View
              </TabsTrigger>
            </TabsList>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => resetForm()} className="gap-2">
                <Plus className="w-4 h-4" />
                New Call
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingCall ? "Edit Call" : "Add New Call"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="clientName">Client Name *</Label>
                    <Input
                      id="clientName"
                      value={formData.clientName}
                      onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="client@example.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+44 123 456 7890"
                    />
                  </div>

                  <div>
                    <Label htmlFor="callType">Call Type</Label>
                    <Select value={formData.callType} onValueChange={(value: any) => setFormData({ ...formData, callType: value })}>
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
                    <Label htmlFor="date">Date *</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="time">Time *</Label>
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
                    />
                  </div>

                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value: any) => setFormData({ ...formData, status: value })}>
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
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={4}
                    placeholder="Follow-up actions, call summary, client preferences..."
                  />
                </div>

                {(formData.status === 'completed' || formData.status === "hasn't paid yet") && (
                  <div className="space-y-3 p-4 border rounded-lg">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isConverted"
                        checked={formData.isConverted}
                        onChange={(e) => setFormData({ ...formData, isConverted: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <Label htmlFor="isConverted">Converted to Sale</Label>
                    </div>
                    {formData.isConverted && (
                      <div>
                        <Label htmlFor="conversionAmount">Conversion Amount (£)</Label>
                        <Input
                          id="conversionAmount"
                          type="number"
                          value={formData.conversionAmount}
                          onChange={(e) => setFormData({ ...formData, conversionAmount: e.target.value })}
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                        />
                      </div>
                    )}
                  </div>
                )}

                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingCall ? "Update Call" : "Add Call"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
          </div>

          <TabsContent value="table">
            {/* Calls Table */}
            <Card>
          <CardHeader>
            <CardTitle>All Calls ({calls.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {calls.length === 0 ? (
              <div className="text-center py-12">
                <Phone className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No calls yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start tracking your calls by adding your first entry
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add First Call
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Conversion</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {calls.map((call) => (
                      <TableRow key={call.id}>
                        <TableCell className="font-medium">{call.clientName}</TableCell>
                        <TableCell>
                          <div className="text-sm">
                            {call.email && <div className="text-muted-foreground">{call.email}</div>}
                            {call.phone && <div className="text-muted-foreground">{call.phone}</div>}
                            {!call.email && !call.phone && <span className="text-muted-foreground">-</span>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <div>{format(new Date(call.date), 'MMM dd, yyyy')}</div>
                            <div className="text-muted-foreground">{call.time}</div>
                          </div>
                        </TableCell>
                        <TableCell className="capitalize">{call.callType}</TableCell>
                        <TableCell>
                          <Badge variant={getStatusColor(call.status)} className="gap-1">
                            {getStatusIcon(call.status)}
                            <span className="capitalize">{call.status}</span>
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs truncate text-sm text-muted-foreground">
                            {call.notes || <span className="italic">No notes</span>}
                          </div>
                        </TableCell>
                        <TableCell>
                          {call.isConverted ? (
                            <Badge variant="default" className="gap-1">
                              <Check className="w-3 h-3" />
                              £{call.conversionAmount?.toLocaleString()}
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(call)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(call.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
          </TabsContent>

          <TabsContent value="calendar">
            <CalendarView />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CallTracker;