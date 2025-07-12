import React, { useState, useEffect } from 'react';
import { Input } from '../components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Trash } from 'lucide-react';
import { getAllDepartments, Department as DepartmentType } from '../utils/Department';
import Header from './Header';
import Footer from './Footer';

interface EducationRow {
    degree: string;
    year: string;
    college: string;
    place: string;
    percent: string;
}

interface JoiningReportFormData {
    doj: string;
    name: string;
    dob: string;
    placeOfBirth: string;
    maritalStatus: string;
    spouseName: string;
    spouseOccupation: string;
    department: string;
    employeeCode: string;
    phoneNumber: string;
    fatherName: string;
    permanentAddress: string;
    permanentTel: string;
    localAddress: string;
    localTel: string;
    emergencyContact: string;
    education: EducationRow[];
    passportType: string;
    passportNumber: string;
    passportIssueDate: string;
    passportIssuePlace: string;
    passportExpiry: string;
    pan: string;
    drivingLicenceNo: string;
    drivingLicenceIssueDate: string;
    drivingLicenceAuthority: string;
    drivingLicenceExpiry: string;
    height: string;
    weight: string;
    bloodGroup: string;
}

interface QualificationRow {
    exam: string;
    year: string;
    marks: string;
    school: string;
    subject: string;
}
interface MembershipRow {
    name: string;
    status: string;
    year: string;
}

interface ExperienceRow {
    from: string;
    to: string;
    org: string;
    position: string;
    salary: string;
    work: string;
}
interface ReferenceRow {
    name: string;
    designation: string;
}

const defaultEducation: EducationRow = { degree: '', year: '', college: '', place: '', percent: '' };
const defaultQualification: QualificationRow = { exam: '', year: '', marks: '', school: '', subject: '' };
const defaultMembership: MembershipRow = { name: '', status: '', year: '' };
const defaultExperience: ExperienceRow = { from: '', to: '', org: '', position: '', salary: '', work: '' };
const defaultReference: ReferenceRow = { name: '', designation: '' };

const maritalStatusOptions = [
    { value: 'Single', label: 'Single' },
    { value: 'Married', label: 'Married' },
    { value: 'Divorced', label: 'Divorced' },
    { value: 'Widowed', label: 'Widowed' },
    { value: 'Others', label: 'Others' },
];

const JoiningReport: React.FC = () => {
    const [departmentOptions, setDepartmentOptions] = useState<DepartmentType[]>([]);
    const [formData, setFormData] = useState<JoiningReportFormData>({
        doj: '',
        name: '',
        dob: '',
        placeOfBirth: '',
        maritalStatus: '',
        spouseName: '',
        spouseOccupation: '',
        department: '',
        employeeCode: '',
        phoneNumber: '',
        fatherName: '',
        permanentAddress: '',
        permanentTel: '',
        localAddress: '',
        localTel: '',
        emergencyContact: '',
        education: [{ ...defaultEducation }],
        passportType: '',
        passportNumber: '',
        passportIssueDate: '',
        passportIssuePlace: '',
        passportExpiry: '',
        pan: '',
        drivingLicenceNo: '',
        drivingLicenceIssueDate: '',
        drivingLicenceAuthority: '',
        drivingLicenceExpiry: '',
        height: '',
        weight: '',
        bloodGroup: '',
    });

    const [generalQualifications, setGeneralQualifications] = useState<QualificationRow[]>([{ ...defaultQualification }]);
    const [technicalQualifications, setTechnicalQualifications] = useState<QualificationRow[]>([{ ...defaultQualification }]);
    const [memberships, setMemberships] = useState<MembershipRow[]>([{ ...defaultMembership }]);
    const [hasPublications, setHasPublications] = useState('No');
    const [publications, setPublications] = useState('');
    const [resume, setResume] = useState('');
    const [experiences, setExperiences] = useState<ExperienceRow[]>([{ ...defaultExperience }]);
    const [minSalary, setMinSalary] = useState('');
    const [minJoinTime, setMinJoinTime] = useState('');
    const [references, setReferences] = useState<ReferenceRow[]>([
        { ...defaultReference },
        { ...defaultReference },
        { ...defaultReference },
    ]);
    const [certificates, setCertificates] = useState(['', '', '', '', '', '']);
    const [certificateFiles, setCertificateFiles] = useState<(File | null)[]>([null, null, null, null, null, null]);
    const [numEnclosures, setNumEnclosures] = useState('');
    const [place, setPlace] = useState('');
    const [date, setDate] = useState('');
    const [signatureFile, setSignatureFile] = useState<File | null>(null);
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    // Placeholder for fetching departments
    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const departments = await getAllDepartments();
                setDepartmentOptions(departments);
            } catch (error) {
                setDepartmentOptions([]);
            }
        };
        fetchDepartments();
    }, []);

    useEffect(() => {
        if (photoFile) {
            const url = URL.createObjectURL(photoFile);
            setPhotoPreview(url);
            return () => URL.revokeObjectURL(url);
        } else {
            setPhotoPreview(null);
        }
    }, [photoFile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleEducationChange = (idx: number, field: keyof EducationRow, value: string) => {
        setFormData(prev => {
            const updated = [...prev.education];
            updated[idx] = { ...updated[idx], [field]: value };
            return { ...prev, education: updated };
        });
    };

    const addEducationRow = () => {
        setFormData(prev => ({ ...prev, education: [...prev.education, { ...defaultEducation }] }));
    };

    const handleQualificationChange = (type: 'general' | 'technical', idx: number, field: keyof QualificationRow, value: string) => {
        const setFn = type === 'general' ? setGeneralQualifications : setTechnicalQualifications;
        const data = type === 'general' ? [...generalQualifications] : [...technicalQualifications];
        data[idx][field] = value;
        setFn(data);
    };
    const addQualificationRow = (type: 'general' | 'technical') => {
        const setFn = type === 'general' ? setGeneralQualifications : setTechnicalQualifications;
        const data = type === 'general' ? [...generalQualifications] : [...technicalQualifications];
        setFn([...data, { ...defaultQualification }]);
    };
    const removeQualificationRow = (type: 'general' | 'technical', idx: number) => {
        const setFn = type === 'general' ? setGeneralQualifications : setTechnicalQualifications;
        const data = type === 'general' ? [...generalQualifications] : [...technicalQualifications];
        setFn(data.filter((_, i) => i !== idx));
    };
    const handleMembershipChange = (idx: number, field: keyof MembershipRow, value: string) => {
        const data = [...memberships];
        data[idx][field] = value;
        setMemberships(data);
    };
    const addMembershipRow = () => setMemberships([...memberships, { ...defaultMembership }]);
    const removeMembershipRow = (idx: number) => setMemberships(memberships.filter((_, i) => i !== idx));

    const handleExperienceChange = (idx: number, field: keyof ExperienceRow, value: string) => {
        const data = [...experiences];
        data[idx][field] = value;
        setExperiences(data);
    };
    const addExperienceRow = () => setExperiences([...experiences, { ...defaultExperience }]);
    const removeExperienceRow = (idx: number) => setExperiences(experiences.filter((_, i) => i !== idx));
    const handleReferenceChange = (idx: number, field: keyof ReferenceRow, value: string) => {
        const data = [...references];
        data[idx][field] = value;
        setReferences(data);
    };
    const handleCertificateChange = (idx: number, value: string) => {
        const data = [...certificates];
        data[idx] = value;
        setCertificates(data);
    };

    const handleCertificateFileChange = (idx: number, file: File | null) => {
        const data = [...certificateFiles];
        data[idx] = file;
        setCertificateFiles(data);
    };

    return (
        <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-8 bg-white rounded shadow space-y-8">
            <Header />
            <h2 className="text-xl font-bold mb-6 flex justify-center items-center">BIO-DATA / JOINING REPORT</h2>
            <form className="space-y-8 mt-4 mb-8">
                <div className="flex flex-col items-center mb-4">
                    <Label className="mb-2">Attach Applicant Photo</Label>
                    <input type="file" accept=".jpg,.jpeg,.png" onChange={e => setPhotoFile(e.target.files ? e.target.files[0] : null)} />
                    {photoPreview && (
                        <img src={photoPreview} alt="Applicant Photo" className="mt-2 w-32 h-32 object-cover rounded-full border" />
                    )}
                </div>
                {/* Personal Details */}
                <h2 className="text-xl font-semibold mb-4">Personal Details</h2>
                <div className="space-y-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                        <div>
                            <Label htmlFor="doj">Date of Joining</Label>
                            <Input id="doj" name="doj" value={formData.doj} onChange={handleChange} placeholder="Date of Joining" type="date" />
                        </div>
                        <div>
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Full Name" />
                        </div>
                        <div>
                            <Label htmlFor="dob">Date of Birth</Label>
                            <Input id="dob" name="dob" value={formData.dob} onChange={handleChange} placeholder="Date of Birth" type="date" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div>
                            <Label htmlFor="placeOfBirth">Place of Birth</Label>
                            <Input id="placeOfBirth" name="placeOfBirth" value={formData.placeOfBirth} onChange={handleChange} placeholder="Place of Birth" />
                        </div>
                        <div>
                            <Label htmlFor="maritalStatus">Marital Status</Label>
                            <Select value={formData.maritalStatus} onValueChange={val => setFormData(prev => ({ ...prev, maritalStatus: val }))}>
                                <SelectTrigger id="maritalStatus">
                                    <SelectValue placeholder="Marital Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    {maritalStatusOptions.map(opt => (
                                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div>
                            <Label htmlFor="spouseName">Spouse Name</Label>
                            <Input id="spouseName" name="spouseName" value={formData.spouseName} onChange={handleChange} placeholder="Spouse Name" />
                        </div>
                        <div>
                            <Label htmlFor="spouseOccupation">Spouse Occupation</Label>
                            <Input id="spouseOccupation" name="spouseOccupation" value={formData.spouseOccupation} onChange={handleChange} placeholder="Spouse Occupation" />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div>
                            <Label htmlFor="department">Department</Label>
                            <Select value={formData.department} onValueChange={val => setFormData(prev => ({ ...prev, department: val }))}>
                                <SelectTrigger id="department">
                                    <SelectValue placeholder="Department" />
                                </SelectTrigger>
                                <SelectContent>
                                    {departmentOptions.map(opt => (
                                        <SelectItem key={opt.departmentId} value={opt.departmentId}>{opt.departmentName}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div>
                            <Label htmlFor="employeeCode">Employee Code</Label>
                            <Input id="employeeCode" name="employeeCode" value={formData.employeeCode} onChange={handleChange} placeholder="Employee Code" />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <Input id="phoneNumber" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="Phone Number" />
                    </div>
                    <div>
                        <Label htmlFor="fatherName">Father's Name</Label>
                        <Input id="fatherName" name="fatherName" value={formData.fatherName} onChange={handleChange} placeholder="Father's Name" />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <div>
                            <Label htmlFor="permanentAddress">Permanent Address</Label>
                            <Textarea id="permanentAddress" name="permanentAddress" value={formData.permanentAddress} onChange={handleChange} placeholder="Permanent Address" />
                            <Label htmlFor="permanentTel">Tel. No.</Label>
                            <Input id="permanentTel" name="permanentTel" value={formData.permanentTel} onChange={handleChange} placeholder="Tel. No." />
                        </div>
                        <div>
                            <Label htmlFor="localAddress">Local Address</Label>
                            <Textarea id="localAddress" name="localAddress" value={formData.localAddress} onChange={handleChange} placeholder="Local Address" />
                            <Label htmlFor="localTel">Tel. No.</Label>
                            <Input id="localTel" name="localTel" value={formData.localTel} onChange={handleChange} placeholder="Tel. No." />
                        </div>
                    </div>
                    <div>
                        <Label htmlFor="emergencyContact">Emergency Contact Number</Label>
                        <Input id="emergencyContact" name="emergencyContact" value={formData.emergencyContact} onChange={handleChange} placeholder="Emergency Contact Number" />
                    </div>
                </div>

                {/* Education Section */}
                <h2 className="text-xl font-semibold mb-4">Education/Training (Highest Qualification only)</h2>
                <div className="mb-6">
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-2 items-center">
                            <div className="md:col-span-2">
                                <Label htmlFor="degree-0">Degree/Certificate</Label>
                                <Input
                                    id="degree-0"
                                    placeholder="Degree/Certificate"
                                    value={formData.education[0].degree}
                                    onChange={e => handleEducationChange(0, 'degree', e.target.value)}
                                />
                            </div>
                            <div className="md:col-span-1">
                                <Label htmlFor="year-0">Year</Label>
                                <Input
                                    id="year-0"
                                    placeholder="Year"
                                    value={formData.education[0].year}
                                    onChange={e => handleEducationChange(0, 'year', e.target.value)}
                                />
                            </div>
                            <div className="md:col-span-1">
                                <Label htmlFor="college-0">College/Institution</Label>
                                <Input
                                    id="college-0"
                                    placeholder="College/Institution"
                                    value={formData.education[0].college}
                                    onChange={e => handleEducationChange(0, 'college', e.target.value)}
                                />
                            </div>
                            <div className="md:col-span-1">
                                <Label htmlFor="place-0">Place</Label>
                                <Input
                                    id="place-0"
                                    placeholder="Place"
                                    value={formData.education[0].place}
                                    onChange={e => handleEducationChange(0, 'place', e.target.value)}
                                />
                            </div>
                            <div className="md:col-span-1">
                                <Label htmlFor="percent-0">Percentage %</Label>
                                <Input
                                    id="percent-0"
                                    placeholder="%"
                                    value={formData.education[0].percent}
                                    onChange={e => handleEducationChange(0, 'percent', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* ID Documents */}
                <h2 className="text-xl font-semibold mb-4">ID Documents</h2>
                <div className="mb-6">
                    <div className="grid grid-cols-5 gap-4">
                        <div>
                            <Label htmlFor="passportType">Passport Type</Label>
                            <Input id="passportType" placeholder="Passport Type" name="passportType" value={formData.passportType} onChange={handleChange} />
                        </div>
                        <div>
                            <Label htmlFor="passportNumber">Passport Number</Label>
                            <Input id="passportNumber" placeholder="Passport Number" name="passportNumber" value={formData.passportNumber} onChange={handleChange} />
                        </div>
                        <div>
                            <Label htmlFor="passportIssueDate">Date of Issue</Label>
                            <Input id="passportIssueDate" placeholder="Date of Issue" name="passportIssueDate" value={formData.passportIssueDate} onChange={handleChange} type="date" />
                        </div>
                        <div>
                            <Label htmlFor="passportIssuePlace">Place of Issue</Label>
                            <Input id="passportIssuePlace" placeholder="Place of Issue" name="passportIssuePlace" value={formData.passportIssuePlace} onChange={handleChange} />
                        </div>
                        <div>
                            <Label htmlFor="passportExpiry">Date of Expiry</Label>
                            <Input id="passportExpiry" placeholder="Date of Expiry" name="passportExpiry" value={formData.passportExpiry} onChange={handleChange} type="date" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                        <div>
                            <Label htmlFor="pan">PAN Card</Label>
                            <Input id="pan" placeholder="PAN Card" name="pan" value={formData.pan} onChange={handleChange} />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
                        <div>
                            <Label htmlFor="drivingLicenceNo">Driving Licence No.</Label>
                            <Input id="drivingLicenceNo" placeholder="Driving Licence No." name="drivingLicenceNo" value={formData.drivingLicenceNo} onChange={handleChange} />
                        </div>
                        <div>
                            <Label htmlFor="drivingLicenceIssueDate">Date of Issue</Label>
                            <Input id="drivingLicenceIssueDate" placeholder="Date of Issue" name="drivingLicenceIssueDate" value={formData.drivingLicenceIssueDate} onChange={handleChange} type="date" />
                        </div>
                        <div>
                            <Label htmlFor="drivingLicenceAuthority">Issuing Authority</Label>
                            <Input id="drivingLicenceAuthority" placeholder="Issuing Authority" name="drivingLicenceAuthority" value={formData.drivingLicenceAuthority} onChange={handleChange} />
                        </div>
                        <div>
                            <Label htmlFor="drivingLicenceExpiry">Date of Expiry</Label>
                            <Input id="drivingLicenceExpiry" placeholder="Date of Expiry" name="drivingLicenceExpiry" value={formData.drivingLicenceExpiry} onChange={handleChange} type="date" />
                        </div>
                    </div>
                </div>
                {/* Health Declaration */}
                <h2 className="text-xl font-semibold mb-4">Health Declaration</h2>
                <div className="mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <Label htmlFor="height">Height (cm)</Label>
                            <Input id="height" placeholder="Height (cm)" name="height" value={formData.height} onChange={handleChange} />
                        </div>
                        <div>
                            <Label htmlFor="weight">Weight (kg)</Label>
                            <Input id="weight" placeholder="Weight (kg)" name="weight" value={formData.weight} onChange={handleChange} />
                        </div>
                        <div>
                            <Label htmlFor="bloodGroup">Blood Group</Label>
                            <Input id="bloodGroup" placeholder="Blood Group" name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} />
                        </div>
                    </div>
                </div>
                {/* Educational Qualifications Section */}
                <h2 className="text-xl font-semibold mb-4">Educational Qualifications after declaration of official result</h2>
                <div className="mb-6">
                    <h3 className="font-semibold mb-2">General</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full border text-sm">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border px-2 py-1">Examination(s) actually passed</th>
                                    <th className="border px-2 py-1">Year</th>
                                    <th className="border px-2 py-1">% of marks obtained and rank, if any</th>
                                    <th className="border px-2 py-1">Name of School/College/University</th>
                                    <th className="border px-2 py-1">Subject studied</th>
                                    <th className="border px-2 py-1"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {generalQualifications.map((row, idx) => (
                                    <tr key={idx}>
                                        <td className="border px-2 py-1"><Input value={row.exam} onChange={e => handleQualificationChange('general', idx, 'exam', e.target.value)} /></td>
                                        <td className="border px-2 py-1"><Input value={row.year} onChange={e => handleQualificationChange('general', idx, 'year', e.target.value)} /></td>
                                        <td className="border px-2 py-1"><Input value={row.marks} onChange={e => handleQualificationChange('general', idx, 'marks', e.target.value)} /></td>
                                        <td className="border px-2 py-1"><Input value={row.school} onChange={e => handleQualificationChange('general', idx, 'school', e.target.value)} /></td>
                                        <td className="border px-2 py-1"><Input value={row.subject} onChange={e => handleQualificationChange('general', idx, 'subject', e.target.value)} /></td>
                                        <td className="border px-2 py-1 text-center">
                                            {generalQualifications.length > 1 && (
                                                <Button type="button" variant="ghost" size="icon" onClick={() => removeQualificationRow('general', idx)}><Trash className="w-4 h-4 text-red-500" /></Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <Button type="button" variant="outline" className="mt-2" onClick={() => addQualificationRow('general')}>Add Row</Button>
                    </div>
                    <h3 className="font-semibold mt-6 mb-2">Technical</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full border text-sm">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border px-2 py-1">Examination(s) actually passed</th>
                                    <th className="border px-2 py-1">Year</th>
                                    <th className="border px-2 py-1">% of marks obtained and rank, if any</th>
                                    <th className="border px-2 py-1">Name of School/College/University</th>
                                    <th className="border px-2 py-1">Subject studied</th>
                                    <th className="border px-2 py-1"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {technicalQualifications.map((row, idx) => (
                                    <tr key={idx}>
                                        <td className="border px-2 py-1"><Input value={row.exam} onChange={e => handleQualificationChange('technical', idx, 'exam', e.target.value)} /></td>
                                        <td className="border px-2 py-1"><Input value={row.year} onChange={e => handleQualificationChange('technical', idx, 'year', e.target.value)} /></td>
                                        <td className="border px-2 py-1"><Input value={row.marks} onChange={e => handleQualificationChange('technical', idx, 'marks', e.target.value)} /></td>
                                        <td className="border px-2 py-1"><Input value={row.school} onChange={e => handleQualificationChange('technical', idx, 'school', e.target.value)} /></td>
                                        <td className="border px-2 py-1"><Input value={row.subject} onChange={e => handleQualificationChange('technical', idx, 'subject', e.target.value)} /></td>
                                        <td className="border px-2 py-1 text-center">
                                            {technicalQualifications.length > 1 && (
                                                <Button type="button" variant="ghost" size="icon" onClick={() => removeQualificationRow('technical', idx)}><Trash className="w-4 h-4 text-red-500" /></Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <Button type="button" variant="outline" className="mt-2" onClick={() => addQualificationRow('technical')}>Add Row</Button>
                    </div>
                </div>
                {/* Membership Section */}
                <h2 className="text-xl font-semibold mb-4">Membership of Professional Bodies/Institutions</h2>
                <div className="mb-6">
                    <div className="overflow-x-auto">
                        <table className="min-w-full border text-sm">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border px-2 py-1">Name of Professional Body / Institution (with address)</th>
                                    <th className="border px-2 py-1">Membership status with Regn. Number</th>
                                    <th className="border px-2 py-1">Year of enrolment</th>
                                    <th className="border px-2 py-1"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {memberships.map((row, idx) => (
                                    <tr key={idx}>
                                        <td className="border px-2 py-1"><Input value={row.name} onChange={e => handleMembershipChange(idx, 'name', e.target.value)} /></td>
                                        <td className="border px-2 py-1"><Input value={row.status} onChange={e => handleMembershipChange(idx, 'status', e.target.value)} /></td>
                                        <td className="border px-2 py-1"><Input value={row.year} onChange={e => handleMembershipChange(idx, 'year', e.target.value)} /></td>
                                        <td className="border px-2 py-1 text-center">
                                            {memberships.length > 1 && (
                                                <Button type="button" variant="ghost" size="icon" onClick={() => removeMembershipRow(idx)}><Trash className="w-4 h-4 text-red-500" /></Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <Button type="button" variant="outline" className="mt-2" onClick={addMembershipRow}>Add Row</Button>
                    </div>
                </div>
                {/* Publications Section */}
                <h2 className="text-xl font-semibold mb-4">Are you author of any publication(s)?</h2>
                <div className="mb-6">
                    <div className="flex items-center gap-4 mb-2">
                        <Label>Yes/No:</Label>
                        <Select value={hasPublications} onValueChange={setHasPublications}>
                            <SelectTrigger className="w-24"><SelectValue placeholder="Select" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Yes">Yes</SelectItem>
                                <SelectItem value="No">No</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {hasPublications === 'Yes' && (
                        <Textarea value={publications} onChange={e => setPublications(e.target.value)} placeholder="List your publications here..." rows={3} />
                    )}
                </div>
                {/* Short Resume Section */}
                <h2 className="text-xl font-semibold mb-4">Write a short resume on yourself, justifying your claim/suitability for the post applied for:</h2>
                <div className="mb-6">
                    <Textarea value={resume} onChange={e => setResume(e.target.value)} placeholder="Write your short resume here..." rows={6} />
                </div>
                {/* Professional Experience Section */}
                <h2 className="text-xl font-semibold mb-4">Professional Experience</h2>
                <div className="mb-6">
                    <div className="overflow-x-auto">
                        <table className="min-w-full border text-sm">
                            <thead>
                                <tr className="bg-gray-100">
                                    <th className="border px-2 py-1">Period<br />From</th>
                                    <th className="border px-2 py-1">To</th>
                                    <th className="border px-2 py-1">Name and full address of organization/office</th>
                                    <th className="border px-2 py-1">Position held/Designation</th>
                                    <th className="border px-2 py-1">Complete details of salary drawn</th>
                                    <th className="border px-2 py-1">Nature of work handled<br />(Brief description)</th>
                                    <th className="border px-2 py-1"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {experiences.map((row, idx) => (
                                    <tr key={idx}>
                                        <td className="border px-2 py-1"><Input type="date" value={row.from} onChange={e => handleExperienceChange(idx, 'from', e.target.value)} /></td>
                                        <td className="border px-2 py-1"><Input type="date" value={row.to} onChange={e => handleExperienceChange(idx, 'to', e.target.value)} /></td>
                                        <td className="border px-2 py-1"><Input value={row.org} onChange={e => handleExperienceChange(idx, 'org', e.target.value)} /></td>
                                        <td className="border px-2 py-1"><Input value={row.position} onChange={e => handleExperienceChange(idx, 'position', e.target.value)} /></td>
                                        <td className="border px-2 py-1"><Input value={row.salary} onChange={e => handleExperienceChange(idx, 'salary', e.target.value)} /></td>
                                        <td className="border px-2 py-1"><Textarea value={row.work} onChange={e => handleExperienceChange(idx, 'work', e.target.value)} rows={2} /></td>
                                        <td className="border px-2 py-1 text-center">{experiences.length > 1 && (<Button type="button" variant="ghost" size="icon" onClick={() => removeExperienceRow(idx)}><Trash className="w-4 h-4 text-red-500" /></Button>)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <Button type="button" variant="outline" className="mt-2" onClick={addExperienceRow}>Add Row</Button>
                    </div>
                </div>
                <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <Label>Minimum monthly salary acceptable (inclusive of all allowances etc.)</Label>
                        <Input value={minSalary} onChange={e => setMinSalary(e.target.value)} />
                    </div>
                    <div>
                        <Label>Minimum time required to join, if selected</Label>
                        <Input value={minJoinTime} onChange={e => setMinJoinTime(e.target.value)} />
                    </div>
                </div>
                {/* References Section */}
                <h2 className="text-xl font-semibold mb-4">Particulars of References</h2>
                <div className="mb-6">
                    <div className="grid grid-cols-1 gap-4">
                        {['a', 'b', 'c'].map((label, idx) => (
                            <div key={label} className="flex flex-col md:flex-row md:items-center gap-2">
                                <Label className="w-6">{label})</Label>
                                <Input className="flex-1" placeholder="Name" value={references[idx].name} onChange={e => handleReferenceChange(idx, 'name', e.target.value)} />
                                <Input className="flex-1" placeholder="Designation & full address" value={references[idx].designation} onChange={e => handleReferenceChange(idx, 'designation', e.target.value)} />
                            </div>
                        ))}
                    </div>
                </div>
                {/* Certificates/Testimonials Section */}
                <h2 className="text-xl font-semibold mb-4">Copies of certificates and testimonials attached with this application, may be listed here</h2>
                <div className="mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[0, 1, 2, 3, 4, 5].map(idx => (
                            <div key={idx} className="flex flex-col gap-2">
                                <Input placeholder={`Certificate/Testimonial ${idx + 1}`} value={certificates[idx]} onChange={e => handleCertificateChange(idx, e.target.value)} />
                                <input type="file" accept=".pdf,.jpg,.jpeg,.png" onChange={e => handleCertificateFileChange(idx, e.target.files ? e.target.files[0] : null)} />
                            </div>
                        ))}
                    </div>
                    <div className="mt-4">
                        <Label>No. of enclosures attached:</Label>
                        <Input className="w-40" value={numEnclosures} onChange={e => setNumEnclosures(e.target.value)} />
                    </div>
                </div>
                {/* Declaration Section */}
                <h2 className="text-xl font-semibold mb-4">Declaration</h2>
                <div className="mb-6">
                    <p className="mb-4">I hereby declare that the above information is true to the best of my knowledge and belief and nothing has been concealed.</p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                        <div>
                            <Label>Place</Label>
                            <Input value={place} onChange={e => setPlace(e.target.value)} />
                        </div>
                        <div>
                            <Label>Date</Label>
                            <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
                        </div>
                        <div className="flex flex-col">
                            <Label className="mb-2">Signature of applicant</Label>
                            <div className="border border-dashed border-gray-400 h-12 rounded mb-2" />
                            <input type="file" accept=".jpg,.jpeg,.png" onChange={e => setSignatureFile(e.target.files ? e.target.files[0] : null)} />
                        </div>
                    </div>
                </div>
            </form>
            <Footer />
        </div>
    );
};

export default JoiningReport;