import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, ChevronLeft, ChevronRight, Save, User, Check, ChevronsUpDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Employee, getAllEmployees, updateEmployeeLeaveBalance } from '@/utils/Employee';
import { Leave, getUserLeaves } from '@/utils/Leave';
import { cn } from '@/lib/utils';

const ITEMS_PER_PAGE = 20;

const AdminLeaveBalance: React.FC = () => {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [employeeLeaves, setEmployeeLeaves] = useState<Leave[]>([]);
  const [loadingLeaves, setLoadingLeaves] = useState(false);
  const [leaveStatusFilter, setLeaveStatusFilter] = useState<string>('all');

  // Form state for leave balances
  const [leaveBalances, setLeaveBalances] = useState({
    el: '',
    sl: '',
    cl: '',
    od: '',
    lwp: '',
    lhd: '',
    others: ''
  });

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setIsLoading(true);
        const data = await getAllEmployees();
        // Fix sorting - handle both string and number employeeId
        const sorted = data.sort((a: Employee, b: Employee) => {
          const aId = String(a.employeeId || '');
          const bId = String(b.employeeId || '');
          
          // Extract numeric part for proper numeric sorting
          const aNum = parseInt(aId.replace(/\D/g, '')) || 0;
          const bNum = parseInt(bId.replace(/\D/g, '')) || 0;
          
          return aNum - bNum;
        });
        setEmployees(sorted);
      } catch (error) {
        console.error("Failed to fetch employees:", error);
        toast({
          title: "Error",
          description: "Failed to load employees. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchEmployees();
  }, [toast]);

  // Handle employee selection
  const handleEmployeeSelect = useCallback(async (employeeId: string) => {
    const employee = employees.find(emp => emp._id === employeeId);
    if (employee) {
      setSelectedEmployee(employee);
      setLeaveBalances({
        el: employee.leaveBalance?.el?.toString() || '',
        sl: employee.leaveBalance?.sl?.toString() || '',
        cl: employee.leaveBalance?.cl?.toString() || '',
        od: employee.leaveBalance?.od?.toString() || '',
        lwp: employee.leaveBalance?.lwp?.toString() || '',
        lhd: employee.leaveBalance?.lhd?.toString() || '',
        others: employee.leaveBalance?.others?.toString() || ''
      });
      setIsEditing(true);
      setIsOpen(false);
      
      // Fetch employee leave records
      try {
        setLoadingLeaves(true);
        const response = await getUserLeaves(employee.userId._id);
        setEmployeeLeaves(response.leaves || []);
      } catch (error) {
        console.error('Error fetching employee leaves:', error);
        setEmployeeLeaves([]);
      } finally {
        setLoadingLeaves(false);
      }
    }
  }, [employees]);

  // Handle leave balance input changes
  const handleLeaveBalanceChange = useCallback((field: keyof typeof leaveBalances, value: string) => {
    setLeaveBalances(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  // Handle save leave balances
  const handleSaveLeaveBalances = useCallback(async () => {
    if (!selectedEmployee) return;

    try {
      setIsSaving(true);
      
      // Convert string values to numbers, defaulting to 0 for empty strings
      const numericLeaveBalances = {
        el: parseFloat(leaveBalances.el) || 0,
        sl: parseFloat(leaveBalances.sl) || 0,
        cl: parseFloat(leaveBalances.cl) || 0,
        od: parseFloat(leaveBalances.od) || 0,
        lwp: parseFloat(leaveBalances.lwp) || 0,
        lhd: parseFloat(leaveBalances.lhd) || 0,
        others: parseFloat(leaveBalances.others) || 0
      };

      await updateEmployeeLeaveBalance(String(selectedEmployee.employeeId), numericLeaveBalances);
      
      toast({
        title: "Success",
        description: "Leave balances updated successfully",
      });

      // Update the employee in the list
      setEmployees(prev => prev.map(emp => 
        emp._id === selectedEmployee._id 
          ? { ...emp, leaveBalance: numericLeaveBalances }
          : emp
      ));

      // Reset form
      setSelectedEmployee(null);
      setIsEditing(false);
      setLeaveBalances({
        el: '',
        sl: '',
        cl: '',
        od: '',
        lwp: '',
        lhd: '',
        others: ''
      });
    } catch (error) {
      console.error("Failed to update leave balances:", error);
      toast({
        title: "Error",
        description: "Failed to update leave balances. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  }, [selectedEmployee, leaveBalances, toast]);

  // Memoized filtered data - CRITICAL for performance
  const filteredEmployees = useMemo(() => {
    if (!searchTerm.trim()) return employees;
    
    const searchLower = searchTerm.toLowerCase();
    return employees.filter((employee: Employee) => {
      const employeeId = String(employee.employeeId || '');
      const name = String(employee.name || '');
      const departmentName = String(employee.department?.departmentName || '');
      
      return employeeId.toLowerCase().includes(searchLower) ||
             name.toLowerCase().includes(searchLower) ||
             departmentName.toLowerCase().includes(searchLower);
    });
  }, [employees, searchTerm]);

  // Memoized paginated data - CRITICAL for performance
  const paginatedEmployees = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    return filteredEmployees.slice(startIndex, endIndex);
  }, [filteredEmployees, currentPage]);

  // Memoized pagination info
  const paginationInfo = useMemo(() => {
    const totalPages = Math.ceil(filteredEmployees.length / ITEMS_PER_PAGE);
    const startItem = (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const endItem = Math.min(currentPage * ITEMS_PER_PAGE, filteredEmployees.length);
    
    return {
      totalPages,
      startItem,
      endItem,
      totalItems: filteredEmployees.length,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1
    };
  }, [filteredEmployees.length, currentPage]);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handlePageChange = useCallback((newPage: number) => {
    setCurrentPage(newPage);
  }, []);

  // Memoized leave balance getter for better performance
  const getLeaveBalance = useCallback((employee: Employee, leaveType: keyof Employee['leaveBalance']) => {
    return employee.leaveBalance?.[leaveType] || 0;
  }, []);

  // Filtered employee leave records
  const filteredEmployeeLeaves = useMemo(() => {
    if (leaveStatusFilter === 'all') return employeeLeaves;
    return employeeLeaves.filter(leave => leave.status === leaveStatusFilter);
  }, [employeeLeaves, leaveStatusFilter]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Leave Balances Management</h1>
            <p className="text-gray-600">View and manage employee leave balances</p>
          </div>
        </div>
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-gray-600">Loading employees leave balances...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leave Balances Management</h1>
          <p className="text-gray-600">View and manage employee leave balances</p>
        </div>
      </div>

      {/* Edit Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Edit Leave Balances
          </CardTitle>
          <CardDescription>Select an employee and update their leave balances</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="employee">Select Employee</Label>
              <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={isOpen}
                    className={cn(
                      "w-full justify-between",
                      !selectedEmployee && "text-muted-foreground"
                    )}
                  >
                    {selectedEmployee 
                      ? `${selectedEmployee.employeeId} - ${selectedEmployee.name}`
                      : "Search employee by ID or name..."
                    }
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0">
                  <Command>
                    <CommandInput placeholder="Search by employee ID or name..." />
                    <CommandList>
                      <CommandEmpty>No employee found.</CommandEmpty>
                      <CommandGroup>
                        {employees.map((employee: Employee) => (
                          <CommandItem
                            key={employee._id}
                            value={`${employee.employeeId} ${employee.name} ${employee.department?.departmentName}`}
                            onSelect={() => handleEmployeeSelect(employee._id!)}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedEmployee?._id === employee._id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col">
                              <span className="font-medium">{employee.employeeId} - {employee.name}</span>
                              <span className="text-sm text-muted-foreground">{employee.department?.departmentName}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {isEditing && selectedEmployee && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Editing Leave Balances for: {selectedEmployee.name}</h3>
                <p className="text-sm text-gray-600">Employee ID: {selectedEmployee.employeeId} | Department: {selectedEmployee.department?.departmentName}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="el">Earned Leave (Max: 75)</Label>
                  <Input
                    id="el"
                    type="number"
                    min="0"
                    max="75"
                    step="0.5"
                    value={leaveBalances.el}
                    onChange={(e) => handleLeaveBalanceChange('el', e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="sl">Sick Leave (Max: 15)</Label>
                  <Input
                    id="sl"
                    type="number"
                    min="0"
                    max="15"
                    step="0.5"
                    value={leaveBalances.sl}
                    onChange={(e) => handleLeaveBalanceChange('sl', e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="cl">Casual Leave</Label>
                  <Input
                    id="cl"
                    type="number"
                    min="0"
                    step="0.5"
                    value={leaveBalances.cl}
                    onChange={(e) => handleLeaveBalanceChange('cl', e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="od">On Duty</Label>
                  <Input
                    id="od"
                    type="number"
                    min="0"
                    step="0.5"
                    value={leaveBalances.od}
                    onChange={(e) => handleLeaveBalanceChange('od', e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="lwp">Leave Without Pay</Label>
                  <Input
                    id="lwp"
                    type="number"
                    min="0"
                    step="0.5"
                    value={leaveBalances.lwp}
                    onChange={(e) => handleLeaveBalanceChange('lwp', e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="lhd">Late Hours Deduction</Label>
                  <Input
                    id="lhd"
                    type="number"
                    min="0"
                    step="0.5"
                    value={leaveBalances.lhd}
                    onChange={(e) => handleLeaveBalanceChange('lhd', e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="others">Others</Label>
                  <Input
                    id="others"
                    type="number"
                    min="0"
                    step="0.5"
                    value={leaveBalances.others}
                    onChange={(e) => handleLeaveBalanceChange('others', e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleSaveLeaveBalances}
                  disabled={isSaving}
                  className="flex items-center gap-2"
                >
                  <Save className="h-4 w-4" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => {
                    setSelectedEmployee(null);
                    setIsEditing(false);
                    setLeaveBalances({
                      el: '',
                      sl: '',
                      cl: '',
                      od: '',
                      lwp: '',
                      lhd: '',
                      others: ''
                    });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Employee Leave Records Table */}
          {isEditing && selectedEmployee && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold text-blue-800">Leave Records for: {selectedEmployee.name}</h3>
                    <p className="text-sm text-blue-600">Employee ID: {selectedEmployee.employeeId} | Department: {selectedEmployee.department?.departmentName}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="leave-status-filter" className="text-sm font-medium text-blue-700">Filter by Status:</Label>
                    <Select value={leaveStatusFilter} onValueChange={setLeaveStatusFilter}>
                      <SelectTrigger className="w-32" id="leave-status-filter">
                        <SelectValue placeholder="All Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-100">
                      <TableHead className="font-bold">S.No.</TableHead>
                      <TableHead className="font-bold">Leave Type</TableHead>
                      <TableHead className="font-bold">Start Date</TableHead>
                      <TableHead className="font-bold">Start Time</TableHead>
                      <TableHead className="font-bold">End Date</TableHead>
                      <TableHead className="font-bold">End Time</TableHead>
                      <TableHead className="font-bold">Days</TableHead>
                      <TableHead className="font-bold">Reason</TableHead>
                      <TableHead className="font-bold">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingLeaves ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8">
                          <div className="flex items-center justify-center">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mr-2"></div>
                            Loading leave records...
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : filteredEmployeeLeaves.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={9} className="text-center py-8">
                          <div className="text-gray-500">
                            {employeeLeaves.length === 0 
                              ? 'No leave records found for this employee'
                              : `No ${leaveStatusFilter} leave records found`
                            }
                          </div>
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredEmployeeLeaves.map((leave, index) => (
                        <TableRow key={leave._id}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell>
                            <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                              {leave.type === 'el' ? 'Earned Leave' :
                               leave.type === 'sl' ? 'Sick Leave' :
                               leave.type === 'cl' ? 'Casual Leave' :
                               leave.type === 'od' ? 'On Duty' :
                               leave.type === 'lwp' ? 'Leave Without Pay' :
                               leave.type === 'lhd' ? 'Late Hours Deduction' :
                               leave.type === 'others' ? 'Others' : leave.type}
                            </span>
                          </TableCell>
                          <TableCell>
                            {new Date(leave.startDate).toLocaleDateString('en-GB')}
                          </TableCell>
                          <TableCell>
                            {new Date(`2000-01-01T${leave.startTime}`).toLocaleTimeString('en-US', { 
                              hour: 'numeric', 
                              minute: '2-digit', 
                              hour12: true 
                            })}
                          </TableCell>
                          <TableCell>
                            {new Date(leave.endDate).toLocaleDateString('en-GB')}
                          </TableCell>
                          <TableCell>
                            {new Date(`2000-01-01T${leave.endTime}`).toLocaleTimeString('en-US', { 
                              hour: 'numeric', 
                              minute: '2-digit', 
                              hour12: true 
                            })}
                          </TableCell>
                          <TableCell className="font-medium">{leave.days}</TableCell>
                          <TableCell className="max-w-xs truncate" title={leave.reason}>
                            {leave.reason}
                          </TableCell>
                          <TableCell>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              leave.status === 'approved' ? 'bg-green-100 text-green-800' :
                              leave.status === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {(leave.status || 'pending').charAt(0).toUpperCase() + (leave.status || 'pending').slice(1)}
                            </span>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Employee List */}
      <Card>
        <CardHeader>
          <CardTitle>Employee Leave Balances</CardTitle>
          <CardDescription>View current employee leave balances</CardDescription>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by Employee ID, Name, or Department..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-80"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>S.No.</TableHead>
                <TableHead>Employee ID</TableHead>
                <TableHead>Employee Name</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Earned Leave</TableHead>
                <TableHead>Sick Leave</TableHead>
                <TableHead>Casual Leave</TableHead>
                <TableHead>On Duty</TableHead>
                <TableHead>Leave Without Pay</TableHead>
                <TableHead>Late Hours Deduction</TableHead>
                <TableHead>Others</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedEmployees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={11} className="text-center py-8">
                    <div className="text-gray-500">
                      {searchTerm 
                        ? 'No employees match your search criteria.' 
                        : 'No employees found.'}
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedEmployees.map((employee: Employee, index: number) => (
                  <TableRow key={employee._id}>
                    <TableCell className='font-medium'>{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</TableCell>
                    <TableCell className="font-medium">{employee.employeeId}</TableCell>
                    <TableCell>{employee.name}</TableCell>
                    <TableCell>{employee.department?.departmentName}</TableCell>
                    <TableCell>{getLeaveBalance(employee, 'el')}</TableCell>
                    <TableCell>{getLeaveBalance(employee, 'sl')}</TableCell>
                    <TableCell>{getLeaveBalance(employee, 'cl')}</TableCell>
                    <TableCell>{getLeaveBalance(employee, 'od')}</TableCell>
                    <TableCell>{getLeaveBalance(employee, 'lwp')}</TableCell>
                    <TableCell>{getLeaveBalance(employee, 'lhd')}</TableCell>
                    <TableCell>{getLeaveBalance(employee, 'others')}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          {paginationInfo.totalPages > 1 && (
            <div className="flex items-center justify-between space-x-2 py-4">
              <div className="text-sm text-gray-700">
                Showing {paginationInfo.startItem} to {paginationInfo.endItem} of {paginationInfo.totalItems} results
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={!paginationInfo.hasPrevPage}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <div className="text-sm text-gray-700">
                  Page {currentPage} of {paginationInfo.totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!paginationInfo.hasNextPage}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLeaveBalance;

