
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download, Trash2, Pencil, Award, Gift, UserPlus } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Allowance, getUserAllowances, addAllowance, updateAllowance, deleteAllowance } from '@/utils/Allowance';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getUserById } from '@/utils/User';

const ALLOWANCE_TYPE_LABELS: Record<string, string> = {
  epfByCo: 'E.P.F By Co.',
  esiByCo: 'E.S.I By Co.',
  medPAIns: 'Med. & P.A. Ins.',
  monthlyInsAcc: 'Monthly Ins. & Accidental',
  gratuity: 'Gratuity',
  resPhone: 'Res. Phone',
  mobile: 'Mobile',
  carEmi: 'Car EMI',
  site: 'Site Allowance',
  earnedLeave: 'Earned Leave',
  ltc: 'LTC',
  petrol: 'Petrol',
  driver: 'Driver Allowance',
  carMaint: 'Car Maintenance',
  localTravel: 'Local Travel/Metro Fair',
  deferred: 'Deferred Allowance',
  overTime: 'Overtime',
  others: 'Other Allowances',
};

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case 'approved': return 'success';
    case 'rejected': return 'destructive';
    case 'pending': return 'secondary';
    default: return 'secondary';
  }
};

const monthsList = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const currentYear = new Date().getFullYear();
const yearsList = Array.from({ length: 10 }, (_, i) => String(currentYear - 5 + i));

const EmployeeAllowances: React.FC = () => {
  const { user } = useAuth();
  const [allowances, setAllowances] = useState<Allowance[]>([]);
  const uniqueBenefits = new Set(allowances.map(a => a.allowanceType)).size;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<any>({
    allowanceType: '',
    allowanceAmount: '',
    allowanceMonth: '',
    allowanceYear: '',
    status: 'pending',
    voucherNo: '',
    attachment: null,
  });

  const [showModal, setShowModal] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]); // This state is no longer used for employee selection
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<any>({
    empName: '',
    designation: '',
    department: '',
    projectNo: '',
    client: '',
    allowanceMonth: '',
    allowanceYear: '',
    allowanceType: '',
    allowanceAmount: '',
    attachment: null,
  });

  const [profile, setProfile] = useState<any | null>(null);

  const fetchProfile = async () => {
    try {
      const profileData = await getUserById(user._id);
      setProfile(profileData);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast.error('Failed to load profile data');
    }
  }

  const openAddModal = () => {
    setEditId(null);
    setShowModal(true);
    setFormData({
      empName: profile?.name || '',
      designation: profile?.designation || '',
      department: profile?.department?.departmentName || '',
      departmentId: profile?.department?._id || '',
      projectNo: '',
      client: '',
      allowanceMonth: '',
      allowanceYear: '',
      allowanceType: '',
      allowanceAmount: '',
      attachment: null,
    });
  };

  const openEditModal = (a: any) => {
    setEditId(a._id);
    setShowModal(true);
    setFormData({
      empName: a.employeeId?.name || '',
      designation: a.employeeId?.designation || '',
      department: a.employeeId?.department?.departmentName || '',
      departmentId: a.employeeId?.department?._id || '',
      projectNo: a.projectNo || '',
      client: a.client || '',
      allowanceMonth: a.allowanceMonth || '',
      allowanceYear: a.allowanceYear || '',
      allowanceType: a.allowanceType || '',
      allowanceAmount: a.allowanceAmount || '',
      attachment: null,
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const getAllowances = async () => {
    try {
      const response = await getUserAllowances(user._id);
      if (response.data.success) {
        setAllowances(response.data.allowances || []);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  }

  useEffect(() => {
    getAllowances();
    fetchProfile();
  }, []);


  const handleDelete = async (id: string) => {
    await deleteAllowance(id);
    getAllowances();
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) {
      toast.error('Profile not loaded');
      return;
    }
    try {
      const fd = new FormData();
      fd.append('employeeId', profile._id);
      fd.append('empName', formData.empName);
      fd.append('designation', formData.designation || '');
      fd.append('departmentId', profile.department?._id || '');
      fd.append('department', formData.department);
      fd.append('projectNo', formData.projectNo);
      fd.append('client', formData.client);
      fd.append('allowanceMonth', formData.allowanceMonth);
      fd.append('allowanceYear', formData.allowanceYear);
      fd.append('allowanceType', formData.allowanceType);
      fd.append('allowanceAmount', formData.allowanceAmount);
      if (formData.attachment) {
        fd.append('attachment', formData.attachment);
      }
      let res;
      if (editId) {
        res = await updateAllowance(editId, fd);
      } else {
        res = await addAllowance(fd);
      }
      if (res.data?.success || res.success) {
        toast.success(res.data?.message || res.message);
        setShowModal(false);
        setEditId(null);
        getAllowances();
      } else {
        toast.error(res.data?.message || res.message);
      }
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  // Excel export handler
  const handleDownloadExcel = () => {
    const dataToExport = allowances.map(a => ({
      'Allowance Type': ALLOWANCE_TYPE_LABELS[a.allowanceType] || a.allowanceType,
      'Amount': a.allowanceAmount,
      'Month': a.allowanceMonth,
      'Year': a.allowanceYear,
      'Status': a.status ? a.status.charAt(0).toUpperCase() + a.status.slice(1) : 'Pending',
      'Voucher No.': a.voucherNo,
      'Attachment': a.attachment ? 'Yes' : 'No',
    }));
    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Allowances');
    XLSX.writeFile(workbook, 'allowances.xlsx');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Variable Allowances</h1>
          <p className="text-gray-600">View your current allowances and benefits</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90" onClick={openAddModal}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Allowance
        </Button>
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editId ? 'Edit Allowance' : 'Add Allowance'}</DialogTitle>
              <DialogDescription>{editId ? 'Edit allowance details' : 'Add a new allowance'}</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label>Employee Name</Label>
                  <Input type="text" name="empName" value={formData.empName} readOnly className="bg-gray-100" />
                </div>
                <div>
                  <Label>Designation</Label>
                  <Input type="text" name="designation" value={formData.designation} readOnly className="bg-gray-100" />
                </div>
                <div>
                  <Label>Department</Label>
                  <Input type="text" name="department" value={formData.department} readOnly className="bg-gray-100" />
                </div>
                <div>
                  <Label>Project No.</Label>
                  <Input type="text" name="projectNo" value={formData.projectNo} onChange={handleChange} placeholder="(If Any)" />
                </div>
                <div>
                  <Label>Client</Label>
                  <Input type="text" name="client" value={formData.client} onChange={handleChange} placeholder="(If Any)" />
                </div>
                <div>
                  <Label>Month</Label>
                  <Select value={formData.allowanceMonth} onValueChange={val => setFormData((prev: any) => ({ ...prev, allowanceMonth: val }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Month" />
                    </SelectTrigger>
                    <SelectContent>
                      {monthsList.map(month => (
                        <SelectItem key={month} value={month}>{month}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Payment Year</Label>
                  <Select value={formData.allowanceYear} onValueChange={val => setFormData((prev: any) => ({ ...prev, allowanceYear: val }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Year" />
                    </SelectTrigger>
                    <SelectContent>
                      {yearsList.map(year => (
                        <SelectItem key={year} value={year}>{year}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Allowance Type</Label>
                  <Select value={formData.allowanceType} onValueChange={val => setFormData((prev: any) => ({ ...prev, allowanceType: val }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Allowance Type" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* <SelectItem key="" value="">Select Allowance Type</SelectItem> */}
                      <SelectItem key="site" value="site">Site Allowance</SelectItem>
                      <SelectItem key="earnedLeave" value="earnedLeave">Earned Leave</SelectItem>
                      <SelectItem key="ltc" value="ltc">LTC</SelectItem>
                      <SelectItem key="petrol" value="petrol">Petrol</SelectItem>
                      <SelectItem key="driver" value="driver">Driver Allowance</SelectItem>
                      <SelectItem key="carMaint" value="carMaint">Car Maintenance</SelectItem>
                      <SelectItem key="localTravel" value="localTravel">Local Travel/Metro Fair</SelectItem>
                      <SelectItem key="deferred" value="deferred">Deferred Allowance</SelectItem>
                      <SelectItem key="overTime" value="overTime">Overtime</SelectItem>
                      <SelectItem key="others" value="others">Other Allowances</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Amount</Label>
                  <Input
                    type="number"
                    name="allowanceAmount"
                    value={formData.allowanceAmount}
                    onChange={handleChange}
                    onWheel={e => e.currentTarget.blur()}
                  />
                </div>
                <div>
                  <Label>Attachment (If Any)</Label>
                  <Input
                    type="file"
                    name="attachment"
                    onChange={e => setFormData((prev: any) => ({ ...prev, attachment: e.target.files?.[0] || null }))}
                    accept="*"
                  />
                  {formData.attachment && (
                    <div className="text-xs mt-1">Selected: {formData.attachment.name}</div>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">{editId ? 'Update Allowance' : 'Submit Allowance'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Allowances</CardTitle>
            <Gift className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{allowances.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Benefits</CardTitle>
            <Award className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uniqueBenefits}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Allowance Details</CardTitle>
              <CardDescription>Complete list of your allowances</CardDescription>
            </div>
            <Button
              variant="outline"
              className="ml-auto"
              onClick={handleDownloadExcel}
            >
              <Download className="h-4 w-4 mr-2" />
              Download as Excel
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Allowance Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Month</TableHead>
                <TableHead>Year</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Voucher No.</TableHead>
                <TableHead>Attachment</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allowances.map((a) => (
                <TableRow key={a._id}>
                  <TableCell>{ALLOWANCE_TYPE_LABELS[a.allowanceType] || a.allowanceType}</TableCell>
                  <TableCell>₹{a.allowanceAmount.toLocaleString('en-IN')}</TableCell>
                  <TableCell>{a.allowanceMonth}</TableCell>
                  <TableCell>{a.allowanceYear}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusBadgeColor(a.status || 'pending')}>
                      {a.status ? a.status.charAt(0).toUpperCase() + a.status.slice(1) : 'Pending'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {a.voucherNo}
                  </TableCell>
                  <TableCell>
                    {a.attachment ? (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          window.open(
                            `https://korus-ems-backend.vercel.app/api/allowances/attachment/${a._id}`,
                            "_blank"
                          )
                        }
                        className="flex items-center gap-1"
                      >
                        <Download className="h-3 w-3" />
                        View
                      </Button>
                    ) : (
                      <span className="text-gray-500">No Attachment</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {a.status === "pending" ? <div className='flex gap-2'>
                      <Button size="icon" variant="outline" onClick={() => openEditModal(a)} aria-label="Edit">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="destructive" onClick={() => { setDeleteId(a._id!); setIsDeleteDialogOpen(true); }} aria-label="Delete">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div> : null}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editId ? 'Edit Allowance' : 'Add Allowance'}</DialogTitle>
            <DialogDescription>Fill the details below</DialogDescription>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label>Allowance Type</label>
              <select className="w-full border rounded p-2" value={form.allowanceType} onChange={e => setForm({ ...form, allowanceType: e.target.value })} required>
                <option value="">Select</option>
                {Object.entries(ALLOWANCE_TYPE_LABELS).map(([val, label]) => (
                  <option key={val} value={val}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label>Amount</label>
              <Input type="number" value={form.allowanceAmount} onChange={e => setForm({ ...form, allowanceAmount: e.target.value })} required />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label>Month</label>
                <select className="w-full border rounded p-2" value={form.allowanceMonth} onChange={e => setForm({ ...form, allowanceMonth: e.target.value })} required>
                  <option value="">Select</option>
                  {monthsList.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label>Year</label>
                <select className="w-full border rounded p-2" value={form.allowanceYear} onChange={e => setForm({ ...form, allowanceYear: e.target.value })} required>
                  <option value="">Select</option>
                  {yearsList.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label>Status</label>
              <select className="w-full border rounded p-2" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div>
              <label>Voucher No.</label>
              <Input value={form.voucherNo} onChange={e => setForm({ ...form, voucherNo: e.target.value })} />
            </div>
            <div>
              <label>Attachment</label>
              <Input type="file" onChange={e => setForm({ ...form, attachment: e.target.files?.[0] })} />
            </div>
            <DialogFooter>
              <Button type="submit">{editId ? 'Update' : 'Add'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Delete Allowance</DialogTitle>
            <DialogDescription>Are you sure you want to delete this allowance? This action cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={async () => { if (deleteId) { await handleDelete(deleteId); setIsDeleteDialogOpen(false); setDeleteId(null); } }}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeeAllowances;
