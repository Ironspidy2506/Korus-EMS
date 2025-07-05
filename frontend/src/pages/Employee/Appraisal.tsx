import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Star, TrendingUp, Target, Award, Eye, UserPlus, StarIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Appraisal, getUserAppraisals } from '@/utils/Appraisal';
import { Department, getAllDepartments } from '@/utils/Department';
import { Employee, getAllEmployees } from '@/utils/Employee';
import { toast } from 'sonner';
import { Table, TableHeader, TableBody, TableCell, TableRow, TableHead } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

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


const EmployeeAppraisal: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [appraisals, setAppraisals] = useState<any[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedAppraisal, setSelectedAppraisal] = useState<any>(null);

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    const year = date.getFullYear();
    return `${year - 1}-${year}`;
  };


  const fetchAppraisals = async () => {
    if (!user?._id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getUserAppraisals(user._id);
      setAppraisals(Array.isArray(data) ? data : (data.appraisals || []));
    } catch (err: any) {
      setError('Failed to fetch appraisals');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const data = await getAllDepartments();
      const sorted = data.sort((a: Department, b: Department) =>
        a.departmentId.localeCompare(b.departmentId)
      );
      setDepartments(sorted);
    } catch (error) {
      console.error("Failed to fetch departments:", error);
      toast.error("Failed to fetch departments");
    }
  };

  const fetchEmployees = async () => {
    try {
      const data = await getAllEmployees();
      const sorted = data.sort((a: Employee, b: Employee) => a.employeeId - b.employeeId);
      setEmployees(sorted);
    } catch (error) {
      console.error("Failed to fetch employees:", error);
      toast.error("Failed to fetch employees");
    }
  };

  useEffect(() => {
    fetchDepartments();
    fetchEmployees();
    fetchAppraisals();
  }, [user?._id]);

  // Use the most recent appraisal as current
  const currentAppraisal = appraisals.length > 0 ? appraisals[0] : null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'default';
      case 'Exceeded': return 'default';
      case 'In Progress': return 'secondary';
      default: return 'secondary';
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600';
    if (rating >= 4.0) return 'text-blue-600';
    if (rating >= 3.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceMessage = (rating: number) => {
    if (rating < 65) {
      return { text: "Unsatisfactory", badge: "default" };
    } else if (rating < 70) {
      return { text: "Needs Improvement", badge: "secondary" };
    } else if (rating < 85) {
      return { text: "Average", badge: "teal" };
    } else if (rating < 95) {
      return { text: "Very Good", badge: "info" };
    } else {
      return { text: "Excellent", badge: "success" };
    }
  };

  const renderRating = (rating: number | null) => {
    if (!rating) return <span className="text-sm text-gray-400">Not rated</span>;
    return <span className="text-sm font-medium">{rating.toFixed(1)}/100</span>;
  };

  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Performance Appraisal</h1>
          <p className="text-gray-600">View your performance reviews and ratings</p>
        </div>

        {
          user.role === "lead" ? <Button className="bg-primary hover:bg-primary/90" onClick={() => navigate('/lead-dashboard/added-appraisals')}>
            <StarIcon className="h-4 w-4 mr-2" />
            Added Appraisal
          </Button> : null
        }
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appraisal Records</CardTitle>
            <Star className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold`}>{appraisals.length}</div>
          </CardContent>
        </Card>
      </div>

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
          <CardTitle>Appraisal History</CardTitle>
          <CardDescription>Your performance review history</CardDescription>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Department</TableHead>
                <TableHead>Supervisors</TableHead>
                <TableHead>Supervisor Comments</TableHead>
                <TableHead>Accomplishments</TableHead>
                <TableHead>Total Rating</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appraisals.length > 0 ? appraisals.map((appraisal, index) => {
                const perf = getPerformanceMessage(appraisal.totalRating);
                return (
                  <TableRow key={index} >
                    <TableCell className="font-semibold">{appraisal.department && typeof appraisal.department === 'object' ? appraisal.department.departmentName : appraisal.department || '-'}</TableCell>
                    <TableCell className="max-w-xs" title={Array.isArray(appraisal.supervisor) && appraisal.supervisor.length > 0 ? appraisal.supervisor.map((s: any) => typeof s === 'string' ? s : s.name).join(', ') : '-'}>
                      {Array.isArray(appraisal.supervisor) && appraisal.supervisor.length > 0 ? appraisal.supervisor.map((s: any) => typeof s === 'string' ? s : s.name).join(', ') : '-'}
                    </TableCell>
                    <TableCell className="max-w-xs">
                      {appraisal.supervisorComments}
                    </TableCell>
                    <TableCell className="max-w-xs" title={appraisal.accomplishments || '-'}>
                      {appraisal.accomplishments ? (
                        appraisal.accomplishments.length > 30 ? appraisal.accomplishments.slice(0, 30) + '...' : appraisal.accomplishments
                      ) : '-'}
                    </TableCell>
                    <TableCell className="font-semibold">{appraisal.totalRating || '-'} / 100</TableCell>
                    <TableCell>
                      {formatDate(appraisal.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={perf.badge as any}>
                        {perf.text}
                      </Badge>
                    </TableCell>

                    <TableCell>
                      <button
                        className="p-2 rounded hover:bg-gray-100"
                        onClick={() => {
                          setSelectedAppraisal(appraisal);
                          setIsViewDialogOpen(true);
                        }}
                        aria-label="View Appraisal"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </TableCell>
                  </TableRow>
                );
              }) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-gray-400">
                    No appraisal history found
                  </TableCell>
                </TableRow>
              )}
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
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeeAppraisal;
