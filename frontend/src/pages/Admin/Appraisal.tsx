import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Star, Plus, Edit, Eye, Calendar, TrendingUp, Trash2, Search, Download, Printer } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { getAppraisals, addAppraisal, deleteAppraisal, editAppraisal } from '@/utils/Appraisal';
import axios from 'axios';
import * as XLSX from 'xlsx';

const ratingScale = {
  1: 25,
  2: 50,
  3: 75,
  4: 85,
  5: 100,
};

const ratingFields = [
  {
    key: "Punctuality",
    label: "Punctuality",
    description: "Reports to work on time.",
    descriptions: {
      1: "Frequently late for work or meetings, leaves early or extends breaks without approval, absences regularly disrupt projects or require work redistribution, fails to notify or follow protocol for leave or absences.",
      2: "Communicates inconsistently about attendance or availability; occasionally late; needs reminders.",
      3: "Regularly on time; meets punctuality expectations.",
      4: "Always punctual; shows respect for others' time, takes responsibility to ensure coverage or catch-up after absence.",
      5: "Arrives early or on time consistently; models ideal behavior for others, always ready to compensate for time missed without prompting.",
    },
  },
  {
    key: "JobKnowledge",
    label: "Understanding of Engineering Principles (Job Knowledge)",
    description: "Demonstrates knowledge of engineering principles required for the role.",
    descriptions: {
      1: "Lacks required knowledge for the role and level.",
      2: "Basic understanding, but makes frequent errors.",
      3: "Requires regular supervision, but mostly gets it right.",
      4: "Applies concepts with minimal guidance.",
      5: "Applies engineering concepts independently and correctly.",
    },
  },
  {
    key: "DesignAccuracy",
    label: "Design/Drafting Accuracy",
    description: "Produces precise and error-free technical work including drawings and calculations.",
    descriptions: {
      1: "Frequent design errors; requires constant corrections.",
      2: "Occasional mistakes; requires rework.",
      3: "Consistently accurate; minor issues only.",
      4: "Double-checks own work; rarely requires changes.",
      5: "Meticulous, spotless technical work; often catches others' errors.",
    },
  },
  {
    key: "SoftwareProficiency",
    label: "Software Proficiency",
    description: "Demonstrates skill and efficiency using required technical software tools.",
    descriptions: {
      1: "Unable to perform without full assistance.",
      2: "Struggles with basic functions, limited software skills.",
      3: "Average, needs occasional help.",
      4: "Proficient and efficient, skilled in multiple functions.",
      5: "Advanced level, capable of training others.",
    },
  },
  {
    key: "DocumentationQuality",
    label: "Detailing & Documentation Quality",
    description: "Prepares thorough, well-structured documents with clear detailing.",
    descriptions: {
      1: "Incomplete or poorly formatted documentation.",
      2: "Frequent quality gaps in documents.",
      3: "Acceptable documentation with minor gaps.",
      4: "Good quality, mostly self-checked.",
      5: "Consistently complete, clear, and well-organized documentation.",
    },
  },
  {
    key: "Timeliness",
    label: "Task Completion Timeliness",
    description: "Completes assigned tasks within the expected time frame.",
    descriptions: {
      1: "Consistently behind schedule.",
      2: "Often late, even after reminders.",
      3: "Meets most deadlines with reminders.",
      4: "Usually on time without reminders.",
      5: "Always on or ahead of schedule.",
    },
  },
  {
    key: "TaskVolume",
    label: "Task Volume / Output",
    description: "Maintains expected productivity and output volume.",
    descriptions: {
      1: "Low output; tasks often reassigned.",
      2: "Below expected output.",
      3: "Meets expected workload.",
      4: "Above average; dependable.",
      5: "High output while maintaining quality.",
    },
  },
  {
    key: "TimeUtilization",
    label: "Time Utilization",
    description: "Uses work hours productively and manages time effectively.",
    descriptions: {
      1: "Frequently unproductive.",
      2: "Easily distracted, inefficient.",
      3: "Occasionally needs redirection.",
      4: "Adequately productive.",
      5: "Fully productive; minimal idle time.",
    },
  },
  {
    key: "Initiative",
    label: "Initiative",
    description: "Takes proactive steps and ownership of responsibilities.",
    descriptions: {
      1: "Avoids taking ownership.",
      2: "Passive, waits for instructions.",
      3: "Fulfills own responsibilities adequately.",
      4: "Frequently proactive.",
      5: "Takes full ownership and leads without prompting.",
    },
  },
  {
    key: "Attendance",
    label: "Attendance",
    description: "Maintains consistent presence at work with proper leave communication.",
    descriptions: {
      1: "Frequently absent without valid reason; unreliable presence.",
      2: "Inconsistent on-site presence; noticeable availability gaps.",
      3: "Regularly available in office.",
      4: "Very dependable; mostly available and supports team.",
      5: "Highly reliable and sets a positive attendance example.",
    },
  },
];

const AdminAppraisal: React.FC = () => {
  const { toast } = useToast();

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    return `${year - 1}-${year}`;
  };

  const [appraisals, setAppraisals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedAppraisal, setSelectedAppraisal] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [totalRating, setTotalRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState({
    employeeId: "",
    employee_name: "",
    department: "",
    accomplishments: "",
    supervisorComments: "",
    supervisor: [],
  });

  const [ratings, setRatings] = useState(
    ratingFields.reduce((acc, field) => ({ ...acc, [field.key]: "" }), {})
  );

  const leads = employees
    .filter((emp) => emp.role === "lead")
    .sort((a, b) => a.employeeId - b.employeeId);

  const printRef = useRef<HTMLDivElement>(null);

  // Print handler
  const handlePrint = () => {
    if (printRef.current) {
      const printContents = printRef.current.innerHTML;
      const originalContents = document.body.innerHTML;
      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload(); // reload to restore event listeners
    }
  };

  useEffect(() => {
    fetchAppraisals();
    fetchDepartments();
    fetchEmployees();
  }, []);

  const fetchAppraisals = async () => {
    try {
      setIsLoading(true);
      const response = await getAppraisals();
      setAppraisals(response.appraisals || []);
    } catch (error) {
      console.error("Error fetching appraisals:", error);
      toast({
        title: "Error",
        description: "Failed to load appraisals.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get("https://korus-ems-backend.vercel.app/api/employees", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEmployees(response.data.employees);
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast({
        title: "Error",
        description: "Failed to load employees.",
        variant: "destructive",
      });
    }
  };

  const fetchDepartments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get("https://korus-ems-backend.vercel.app/api/department", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDepartments(response.data.departments);
    } catch (error) {
      console.error("Error fetching departments:", error);
      toast({
        title: "Error",
        description: "Failed to load departments.",
        variant: "destructive",
      });
    }
  };

  const handleEmployeeChange = (selectedOption: any) => {
    const selectedEmployee = employees.find(
      (emp) => emp._id === selectedOption.value
    );

    if (selectedEmployee) {
      setFormData({
        ...formData,
        employeeId: selectedEmployee._id,
        employee_name: selectedEmployee.name,
        department: selectedEmployee.department?._id || "",
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRatingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRatings((prevRatings) => {
      const updatedRatings = { ...prevRatings, [name]: value };
      calculateTotalRating(updatedRatings);
      return updatedRatings;
    });
  };

  const calculateTotalRating = (data: any) => {
    let total = 0;
    let count = 0;

    Object.keys(data).forEach((key) => {
      if (ratingScale[data[key] as keyof typeof ratingScale]) {
        total += ratingScale[data[key] as keyof typeof ratingScale];
        count++;
      }
    });

    setTotalRating(count > 0 ? parseFloat((total / count).toFixed(2)) : 0);
  };

  const getPerformanceMessage = (rating: number) => {
    if (rating < 65) {
      return { text: "Unsatisfactory", color: "text-red-500", badge: "default" };
    } else if (rating < 70) {
      return { text: "Needs Improvement", color: "text-orange-500", badge: "secondary" };
    } else if (rating < 85) {
      return { text: "Average", color: "text-yellow-500", badge: "teal" };
    } else if (rating < 95) {
      return { text: "Very Good", color: "text-blue-500", badge: "info" };
    } else {
      return { text: "Excellent", color: "text-green-500", badge: "success" };
    }
  };

  const performanceMessage = getPerformanceMessage(totalRating);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      employeeId: formData.employeeId,
      employeeName: formData.employee_name,
      department: formData.department,
      accomplishments: formData.accomplishments,
      supervisorComments: formData.supervisorComments,
      supervisor: formData.supervisor,
      ratings,
      totalRating,
    };

    try {
      setIsSubmitting(true);
      await addAppraisal(payload);
      toast({
        title: "Success",
        description: "Appraisal submitted successfully",
      });
      setFormData({
        employeeId: "",
        employee_name: "",
        department: "",
        accomplishments: "",
        supervisorComments: "",
        supervisor: [],
      });
      setRatings(
        ratingFields.reduce((acc, field) => ({ ...acc, [field.key]: "" }), {})
      );
      setTotalRating(0);
      setIsAddDialogOpen(false);
      fetchAppraisals(); // Refresh the list
    } catch (error) {
      console.error("Error submitting appraisal:", error);
      toast({
        title: "Error",
        description: "Failed to submit appraisal",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleView = (appraisal: any) => {
    setSelectedAppraisal(appraisal);
    setIsViewDialogOpen(true);
  };

  const handleEdit = (appraisal: any) => {
    setSelectedAppraisal(appraisal);
    setFormData({
      employeeId: appraisal.employeeId._id || appraisal.employeeId,
      employee_name: appraisal.employeeId.name || appraisal.employee_name,
      department: appraisal.department._id || appraisal.department,
      accomplishments: appraisal.accomplishments || "",
      supervisorComments: appraisal.supervisorComments || "",
      supervisor: appraisal.supervisor || [],
    });

    setRatings(appraisal.ratings || {});
    setTotalRating(appraisal.totalRating || 0);
    setIsEditDialogOpen(true);
  };

  const handleDelete = (appraisal: any) => {
    setSelectedAppraisal(appraisal);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedAppraisal) return;

    try {
      await deleteAppraisal(selectedAppraisal._id);
      toast({
        title: "Success",
        description: "Appraisal deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setSelectedAppraisal(null);
      fetchAppraisals(); // Refresh the list
    } catch (error) {
      console.error("Error deleting appraisal:", error);
      toast({
        title: "Error",
        description: "Failed to delete appraisal",
        variant: "destructive",
      });
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedAppraisal) return;

    const payload = {
      employeeId: formData.employeeId,
      employeeName: formData.employee_name,
      department: formData.department,
      accomplishments: formData.accomplishments,
      supervisorComments: formData.supervisorComments,
      supervisor: formData.supervisor,
      ratings,
      totalRating,
    };

    try {
      setIsSubmitting(true);
      const response = await editAppraisal(selectedAppraisal._id, payload);
      if (response.data.success) {
        toast({
          title: "Success",
          description: "Appraisal updated successfully",
        });
        setIsEditDialogOpen(false);
        setSelectedAppraisal(null);
        fetchAppraisals(); // Refresh the list
      } else {
        toast({
          title: "Error",
          description: `${response.data.message}`,
        });
      }
    } catch (error) {
      console.error("Error updating appraisal:", error);
      toast({
        title: "Error",
        description: "Failed to update appraisal",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderRating = (rating: number | null) => {
    if (!rating) return <span className="text-sm text-gray-400">Not rated</span>;
    return <span className="text-sm font-medium">{rating.toFixed(1)}/100</span>;
  };

  const stats = {
    total: appraisals.length,
    avgRating: appraisals.filter((a: any) => a.totalRating && a.totalRating > 0).reduce((sum: number, a: any) => sum + (a.totalRating || 0), 0) / appraisals.filter((a: any) => a.totalRating && a.totalRating > 0).length || 0
  };

  // Filter appraisals based on search term
  const filteredAppraisals = appraisals.filter((appraisal: any) => {
    const searchLower = searchTerm.toLowerCase();
    const employeeId = String(appraisal.employeeId?.employeeId || "").toLowerCase();
    const employeeName = appraisal.employeeId?.name?.toLowerCase() || "";

    return employeeId.includes(searchLower) || employeeName.includes(searchLower);
  });

  if (isLoading) {
    return <div className="flex justify-center items-center h-96">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Performance Appraisal</h1>
          <p className="text-gray-600">Manage employee performance reviews and ratings</p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (open) {
            // Clear form data when opening dialog
            setFormData({
              employeeId: "",
              employee_name: "",
              department: "",
              accomplishments: "",
              supervisorComments: "",
              supervisor: [],
            });
            setRatings(
              ratingFields.reduce((acc, field) => ({ ...acc, [field.key]: "" }), {})
            );
            setTotalRating(0);
          }
        }}>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="h-4 w-4 mr-2" />
              New Appraisal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Appraisal</DialogTitle>
              <DialogDescription>Complete performance appraisal for an employee</DialogDescription>
            </DialogHeader>
            <Button onClick={handlePrint} className="mb-4" variant="outline">
              <Printer className="h-4 w-4 mr-2" />
              Print
            </Button>
            <div ref={printRef} className="printable-appraisal">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Employee Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="employee">Employee</Label>
                    <Select onValueChange={(value) => handleEmployeeChange({ value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Employee" />
                      </SelectTrigger>
                      <SelectContent>
                        {employees
                          .sort((a: any, b: any) => a.employeeId - b.employeeId)
                          .map((employee: any) => (
                            <SelectItem key={employee._id} value={employee._id}>
                              {employee.employeeId} - {employee.name}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Select value={formData.department} disabled>
                      <SelectTrigger>
                        <SelectValue placeholder="Auto-filled" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dep: any) => (
                          <SelectItem key={dep._id} value={dep._id}>
                            {dep.departmentId} {dep.departmentName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="supervisor">Supervisor</Label>
                  <Select
                    onValueChange={(value) => {
                      const currentSupervisors = formData.supervisor || [];
                      if (currentSupervisors.includes(value)) {
                        // Remove if already selected
                        setFormData({
                          ...formData,
                          supervisor: currentSupervisors.filter(s => s !== value)
                        });
                      } else {
                        // Add if not selected
                        setFormData({
                          ...formData,
                          supervisor: [...currentSupervisors, value]
                        });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Lead(s)" />
                    </SelectTrigger>
                    <SelectContent>
                      {leads.map((lead: any) => (
                        <SelectItem key={lead._id} value={lead._id}>
                          {lead.employeeId} - {lead.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {/* Display selected supervisors */}
                  {formData.supervisor && formData.supervisor.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {formData.supervisor.map((supervisorId: string) => {
                        const supervisor = leads.find((lead: any) => lead._id === supervisorId);
                        return supervisor ? (
                          <Badge key={supervisorId} variant="secondary" className="cursor-pointer hover:bg-red-100"
                            onClick={() => {
                              setFormData({
                                ...formData,
                                supervisor: formData.supervisor.filter(s => s !== supervisorId)
                              });
                            }}>
                            {supervisor.employeeId} - {supervisor.name} ×
                          </Badge>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>

                <div>
                  <Label htmlFor="supervisorComments">Supervisor Comments</Label>
                  <Textarea
                    name="supervisorComments"
                    placeholder="Supervisor Comments"
                    value={formData.supervisorComments}
                    onChange={handleChange}
                    className="h-20"
                  />
                </div>

                <div>
                  <Label htmlFor="accomplishments">Accomplishments</Label>
                  <Textarea
                    name="accomplishments"
                    placeholder="Accomplishments of Position Duties"
                    value={formData.accomplishments}
                    onChange={handleChange}
                    className="h-20"
                  />
                </div>

                {/* Ratings Section */}
                <div>
                  <h3 className="text-xl font-bold text-gray-800 mb-4">Performance Ratings</h3>
                  {ratingFields.map((field) => (
                    <div key={field.key} className="p-4 bg-gray-100 rounded-lg shadow mt-4">
                      <Label className="text-lg font-semibold text-gray-700 capitalize">
                        {field.label}
                      </Label>
                      <p className="text-sm text-gray-600 mt-1">{field.description}</p>
                      <div className="flex flex-col gap-3 mt-2">
                        {Object.entries(field.descriptions).map(([score, desc]) => (
                          <label
                            key={score}
                            className="flex items-start gap-2 bg-gray-200 px-3 py-2 rounded-lg shadow cursor-pointer hover:bg-gray-300 transition"
                          >
                            <input
                              type="radio"
                              name={field.key}
                              value={score}
                              checked={ratings[field.key] === score}
                              onChange={handleRatingChange}
                              className="w-5 h-5 accent-orange-500 mt-1 cursor-pointer"
                            />
                            <div>
                              <span className="font-semibold text-gray-800">
                                Rating {score}
                              </span>
                              <p className="text-sm text-gray-700">{desc}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Display Total Rating */}
                <div className="text-center text-xl font-extrabold mt-4">
                  Total Rating Score:{" "}
                  <span className="text-orange-500">{totalRating}/100</span>
                  <p className={`mt-2 text-lg font-semibold ${performanceMessage.color}`}>
                    ({performanceMessage.text})
                  </p>
                </div>

                <DialogFooter>
                  <Button type="submit" disabled={isSubmitting}>
                    Submit Appraisal
                  </Button>
                </DialogFooter>
              </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
            <Star className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
            <Star className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgRating.toFixed(1)} / 100</div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Scale Legend */}
      <div className="mb-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500"></span>
          <span>Unsatisfactory (&lt; 65)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-orange-500"></span>
          <span>Needs Improvement (65 - 69)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-teal-500"></span>
          <span>Average (70 - 84)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-500"></span>
          <span>Very Good (85 - 94)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-green-500"></span>
          <span>Excellent (95 - 100)</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Performance Reviews</CardTitle>
          <CardDescription>Track and manage employee performance appraisals</CardDescription>
          <div className="flex items-center gap-2 mt-2 overflow-x-auto pb-2">
            <Search className="h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search employees by Id or Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-48 sm:w-56 md:w-64 min-w-[10rem]"
            />
            <Button
              onClick={() => {
                const tableData = filteredAppraisals.map((appraisal: any) => ({
                  'Employee ID': appraisal.employeeId.employeeId,
                  'Employee Name': appraisal.employeeId.name,
                  'Department': appraisal.department.departmentName,
                  'Supervisor(s)': Array.isArray(appraisal.supervisor) && appraisal.supervisor.length > 0 ? appraisal.supervisor.map((sup: any) => sup.name).join(', ') : '-',
                  'Total Rating': appraisal.totalRating,
                  'Performance': (appraisal.totalRating ? (function(rating) { if (rating < 65) return 'Unsatisfactory'; else if (rating < 70) return 'Needs Improvement'; else if (rating < 85) return 'Average'; else if (rating < 95) return 'Very Good'; else return 'Excellent'; })(appraisal.totalRating) : '-'),
                  'Review Date': appraisal.createdAt ? formatDate(appraisal.createdAt) : '-',
                }));
                const worksheet = XLSX.utils.json_to_sheet(tableData);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, worksheet, 'Appraisals');
                XLSX.writeFile(workbook, 'Appraisals.xlsx');
              }}
              variant="outline"
              className="border border-gray-300 text-gray-700 hover:bg-gray-100 ml-2 flex items-center min-w-[10rem]"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Excel
            </Button>
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
                <TableHead>Supervisor</TableHead>
                <TableHead>Total Rating</TableHead>
                <TableHead>Performance</TableHead>
                <TableHead>Review Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAppraisals.map((appraisal: any, index: number) => (
                <TableRow key={appraisal._id}>
                  <TableCell>
                    <div className="font-medium">{index + 1}</div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {appraisal.employeeId.employeeId}
                  </TableCell>
                  <TableCell>{appraisal.employeeId.name}</TableCell>

                  <TableCell>{appraisal.department.departmentName}</TableCell>
                  <TableCell>
                    {Array.isArray(appraisal.supervisor) && appraisal.supervisor.length > 0 ? (
                      appraisal.supervisor.map((sup: any, index: number) => (
                        <div key={sup._id || index}>{sup.name}</div>
                      ))
                    ) : (
                      '-'
                    )}
                  </TableCell>

                  <TableCell>{renderRating(appraisal.totalRating)}</TableCell>
                  <TableCell>
                    <Badge variant={getPerformanceMessage(appraisal.totalRating || 0).badge as any} className="whitespace-nowrap">
                      {getPerformanceMessage(appraisal.totalRating || 0).text}
                    </Badge>
                  </TableCell>
                  <TableCell>{appraisal.createdAt ? formatDate(appraisal.createdAt) : '-'}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" onClick={() => handleView(appraisal)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(appraisal)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(appraisal)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>View Appraisal Details</DialogTitle>
          </DialogHeader>
          {selectedAppraisal && (
            <div>
              <Button onClick={handlePrint} className="mb-4" variant="outline">
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <div ref={printRef} className="printable-appraisal">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="font-bold">Employee</Label>
                      <p>{selectedAppraisal.employeeId.employeeId} - {selectedAppraisal.employeeId.name}</p>
                    </div>
                    <div>
                      <Label className="font-bold">Department</Label>
                      <p>{selectedAppraisal.department.departmentName}</p>
                    </div>
                  </div>
                  <div>
                    <Label className="font-bold">Period</Label>
                    <p>{formatDate(selectedAppraisal.createdAt)}</p>
                  </div>
                  <div>
                    <Label className="font-bold">Supervisors</Label>
                    <p className="text-sm text-gray-600">
                      {selectedAppraisal.supervisor && selectedAppraisal.supervisor.length > 0
                        ? selectedAppraisal.supervisor.map((sup: any) => sup.name).join(', ')
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <Label className="font-bold">Supervisor Comments</Label>
                    <p className="text-sm text-gray-600">{selectedAppraisal.supervisorComments || 'No comments'}</p>
                  </div>
                  <div>
                    <Label className="font-bold">Accomplishments</Label>
                    <p className="text-sm text-gray-600">{selectedAppraisal.accomplishments || 'No accomplishments listed'}</p>
                  </div>
                  {/* Ratings Section */}
                  <div>
                    <Label className="font-semibold text-lg mb-2">Ratings</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                      {selectedAppraisal.ratings && Object.entries(selectedAppraisal.ratings).map(([key, value]) => {
                        const numValue = Number(value);
                        let color = 'text-red-500';
                        let bar = 'bg-red-200';
                        if (numValue >= 4.5) { color = 'text-green-600'; bar = 'bg-green-200'; }
                        else if (numValue >= 4) { color = 'text-blue-600'; bar = 'bg-blue-200'; }
                        else if (numValue >= 3.5) { color = 'text-yellow-600'; bar = 'bg-yellow-200'; }
                        const field = ratingFields.find(f => f.key === key);
                        const label = field ? field.label : key;
                        return (
                          <div key={key} className={`rounded-xl shadow border border-blue-100 bg-white p-3 flex flex-col items-start gap-1 transition-all hover:shadow-lg`}>
                            <div className="flex items-center gap-2 w-full justify-between">
                              <span className="font-semibold text-gray-700 flex items-center gap-1">
                                <svg width="18" height="18" fill="currentColor" className={`${color}`} viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.967a1 1 0 00.95.69h4.175c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.966c.3.922-.755 1.688-1.54 1.118l-3.38-2.454a1 1 0 00-1.175 0l-3.38 2.454c-.784.57-1.838-.196-1.54-1.118l1.287-3.966a1 1 0 00-.364-1.118L2.05 9.394c-.783-.57-.38-1.81.588-1.81h4.175a1 1 0 00.95-.69l1.286-3.967z" /></svg>
                                {key}
                              </span>
                              <span className={`text-base font-bold ${color}`}>{String(value) || '-'}<span className="text-xs text-gray-400">/5</span></span>
                            </div>
                            <div className="w-full h-2 mt-1 rounded bg-gray-100 overflow-hidden">
                              <div className={`${bar} h-2 rounded`} style={{ width: `${(numValue / 5) * 100 || 0}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div>
                    <Label className="font-bold">Total Rating</Label>
                    <div className="flex items-center gap-2 text-base">
                      {renderRating(selectedAppraisal.totalRating)}
                      <Badge variant={getPerformanceMessage(selectedAppraisal.totalRating || 0).badge as any}>
                        {getPerformanceMessage(selectedAppraisal.totalRating || 0).text}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Appraisal</DialogTitle>
            <DialogDescription>Update performance appraisal details</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            {/* Same form fields as add dialog */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="employee">Employee</Label>
                <Select value={formData.employeeId} onValueChange={(value) => handleEmployeeChange({ value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Employee" />
                  </SelectTrigger>
                  <SelectContent>
                    {employees
                      .sort((a: any, b: any) => a.employeeId - b.employeeId)
                      .map((employee: any) => (
                        <SelectItem key={employee._id} value={employee._id}>
                          {employee.employeeId} - {employee.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="department">Department</Label>
                <Select value={formData.department} disabled>
                  <SelectTrigger>
                    <SelectValue placeholder="Auto-filled" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dep: any) => (
                      <SelectItem key={dep._id} value={dep._id}>
                        {dep.departmentId} {dep.departmentName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="supervisor">Supervisor</Label>
              <Select
                onValueChange={(value) => {
                  const currentSupervisors = formData.supervisor || [];
                  if (currentSupervisors.includes(value)) {
                    // Remove if already selected
                    setFormData({
                      ...formData,
                      supervisor: currentSupervisors.filter(s => s !== value)
                    });
                  } else {
                    // Add if not selected
                    setFormData({
                      ...formData,
                      supervisor: [...currentSupervisors, value]
                    });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Lead(s)" />
                </SelectTrigger>
                <SelectContent>
                  {leads.map((lead: any) => (
                    <SelectItem key={lead._id} value={lead._id}>
                      {lead.employeeId} - {lead.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {/* Display selected supervisors */}

              {formData.supervisor && formData.supervisor.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {formData.supervisor.map((sup: any) => {
                    const supervisor = leads.find((lead: any) => lead._id === sup._id);
                    return supervisor ? (
                      <Badge key={sup._id} variant="secondary" className="cursor-pointer hover:bg-red-100"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            supervisor: formData.supervisor.filter(s => s !== sup._id)
                          });
                        }}>
                        {supervisor.employeeId} - {supervisor.name} ×
                      </Badge>
                    ) : null;
                  })}
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="supervisorComments">Supervisor Comments</Label>
              <Textarea
                name="supervisorComments"
                placeholder="Supervisor Comments"
                value={formData.supervisorComments}
                onChange={handleChange}
                className="h-20"
              />
            </div>

            <div>
              <Label htmlFor="accomplishments">Accomplishments</Label>
              <Textarea
                name="accomplishments"
                placeholder="Accomplishments of Position Duties"
                value={formData.accomplishments}
                onChange={handleChange}
                className="h-20"
              />
            </div>

            {/* Ratings Section */}
            <div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Performance Ratings</h3>
              {ratingFields.map((field) => (
                <div key={field.key} className="p-4 bg-gray-100 rounded-lg shadow mt-4">
                  <Label className="text-lg font-semibold text-gray-700 capitalize">
                    {field.label}
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">{field.description}</p>
                  <div className="flex flex-col gap-3 mt-2">
                    {Object.entries(field.descriptions).map(([score, desc]) => (
                      <label
                        key={score}
                        className="flex items-start gap-2 bg-gray-200 px-3 py-2 rounded-lg shadow cursor-pointer hover:bg-gray-300 transition"
                      >
                        <input
                          type="radio"
                          name={field.key}
                          value={score}
                          checked={ratings[field.key] === score}
                          onChange={handleRatingChange}
                          className="w-5 h-5 accent-orange-500 mt-1 cursor-pointer"
                        />
                        <div>
                          <span className="font-semibold text-gray-800">
                            Rating {score}
                          </span>
                          <p className="text-sm text-gray-700">{desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Display Total Rating */}
            <div className="text-center text-xl font-extrabold mt-4">
              Total Rating Score:{" "}
              <span className="text-orange-500">{totalRating}/100</span>
              <p className={`mt-2 text-lg font-semibold ${performanceMessage.color}`}>
                ({performanceMessage.text})
              </p>
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isSubmitting}>
                Update Appraisal
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Appraisal</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this appraisal? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .printable-appraisal, .printable-appraisal * { visibility: visible; }
          .printable-appraisal { position: absolute; left: 0; top: 0; width: 100vw; background: white; z-index: 9999; }
        }
      `}</style>
    </div>
  );
};

export default AdminAppraisal;
