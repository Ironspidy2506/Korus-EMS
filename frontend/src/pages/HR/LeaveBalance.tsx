import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, ChevronLeft, ChevronRight, Save, User, Check, ChevronsUpDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Employee, getAllEmployees, updateEmployeeLeaveBalance } from '@/utils/Employee';
import { cn } from '@/lib/utils';

const ITEMS_PER_PAGE = 20;

const HRLeaveBalance: React.FC = () => {
  const { toast } = useToast();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  // Form state for leave balances
  const [leaveBalances, setLeaveBalances] = useState({
    el: 0,
    sl: 0,
    cl: 0,
    od: 0,
    lwp: 0,
    lhd: 0,
    others: 0
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
  const handleEmployeeSelect = useCallback((employeeId: string) => {
    const employee = employees.find(emp => emp._id === employeeId);
    if (employee) {
      setSelectedEmployee(employee);
      setLeaveBalances({
        el: employee.leaveBalance?.el || 0,
        sl: employee.leaveBalance?.sl || 0,
        cl: employee.leaveBalance?.cl || 0,
        od: employee.leaveBalance?.od || 0,
        lwp: employee.leaveBalance?.lwp || 0,
        lhd: employee.leaveBalance?.lhd || 0,
        others: employee.leaveBalance?.others || 0
      });
      setIsEditing(true);
      setIsOpen(false);
    }
  }, [employees]);

  // Handle leave balance input changes
  const handleLeaveBalanceChange = useCallback((field: keyof typeof leaveBalances, value: string) => {
    const numValue = parseInt(value) || 0;
    setLeaveBalances(prev => ({
      ...prev,
      [field]: numValue
    }));
  }, []);

  // Handle save leave balances
  const handleSaveLeaveBalances = useCallback(async () => {
    if (!selectedEmployee) return;

    try {
      setIsSaving(true);
      await updateEmployeeLeaveBalance(String(selectedEmployee.employeeId), leaveBalances);
      
      toast({
        title: "Success",
        description: "Leave balances updated successfully",
      });

      // Update the employee in the list
      setEmployees(prev => prev.map(emp => 
        emp._id === selectedEmployee._id 
          ? { ...emp, leaveBalance: leaveBalances }
          : emp
      ));

      // Reset form
      setSelectedEmployee(null);
      setIsEditing(false);
      setLeaveBalances({
        el: 0,
        sl: 0,
        cl: 0,
        od: 0,
        lwp: 0,
        lhd: 0,
        others: 0
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
                  <Label htmlFor="el">Earned Leave</Label>
                  <Input
                    id="el"
                    type="number"
                    min="0"
                    value={leaveBalances.el}
                    onChange={(e) => handleLeaveBalanceChange('el', e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="sl">Sick Leave</Label>
                  <Input
                    id="sl"
                    type="number"
                    min="0"
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
                      el: 0,
                      sl: 0,
                      cl: 0,
                      od: 0,
                      lwp: 0,
                      lhd: 0,
                      others: 0
                    });
                  }}
                >
                  Cancel
                </Button>
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

export default HRLeaveBalance;

