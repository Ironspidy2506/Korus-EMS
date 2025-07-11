import React, { useState } from 'react';
import { Input } from '../components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Button } from '../components/ui/button';
import { Trash } from 'lucide-react';

interface EducationRow {
    degree: string;
    year: string;
    college: string;
    place: string;
    percent: string;
}

interface JoiningReportFormData {
    postAppliedFor: string;
    fieldOfSpecialisation: string;
    nameBlock: string;
    surname: string;
    otherNames: string;
    dateOfBirth: string;
    placeOfBirth: string;
    maritalStatus: string;
    dateOfMarriage: string;
    numSons: string;
    numDaughters: string;
    sonsAges: string;
    daughtersAges: string;
    spouseName: string;
    spouseOccupation: string;
    fatherOrHusbandName: string;
    fatherOrHusbandAddress: string;
    presentAddress: string;
    presentTel: string;
    permanentAddress: string;
    permanentTel: string;
    homeTownAddress: string;
    homeTownTel: string;
    education: EducationRow[];
    passportNo: string;
    passportIssue: string;
    passportPlace: string;
    passportValid: string;
    pan: string;
    dlic: string;
    height: string;
    weight: string;
    bloodGroup: string;
    date: string;
}

const defaultEducation: EducationRow = { degree: '', year: '', college: '', place: '', percent: '' };

const JoiningReport: React.FC = () => {
    const [formData, setFormData] = useState<JoiningReportFormData>({
        postAppliedFor: '',
        fieldOfSpecialisation: '',
        nameBlock: '',
        surname: '',
        otherNames: '',
        dateOfBirth: '',
        placeOfBirth: '',
        maritalStatus: '',
        dateOfMarriage: '',
        numSons: '',
        numDaughters: '',
        sonsAges: '',
        daughtersAges: '',
        spouseName: '',
        spouseOccupation: '',
        fatherOrHusbandName: '',
        fatherOrHusbandAddress: '',
        presentAddress: '',
        presentTel: '',
        permanentAddress: '',
        permanentTel: '',
        homeTownAddress: '',
        homeTownTel: '',
        education: [{ ...defaultEducation }],
        passportNo: '',
        passportIssue: '',
        passportPlace: '',
        passportValid: '',
        pan: '',
        dlic: '',
        height: '',
        weight: '',
        bloodGroup: '',
        date: '',
    });

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

    return (
        <div className="max-w-5xl mx-auto p-4 sm:p-6 md:p-8 bg-white rounded shadow space-y-8">
            <h1 className="text-2xl font-bold mb-4">BIO-DATA / JOINING REPORT</h1>
            <form className="space-y-8">
                {/* 1. Post Applied For & Field of Specialisation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <Input name="postAppliedFor" value={formData.postAppliedFor} onChange={handleChange} placeholder="Post Applied For" />
                    <Input name="fieldOfSpecialisation" value={formData.fieldOfSpecialisation} onChange={handleChange} placeholder="Field of Specialisation" />
                </div>
                {/* 2. Name Section */}
                <div>
                    <Label className="block text-gray-700 font-medium mb-2">Name</Label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                        <Input name="nameBlock" value={formData.nameBlock} onChange={handleChange} placeholder="Block Letters" />
                        <Input name="surname" value={formData.surname} onChange={handleChange} placeholder="Surname" />
                        <Input name="otherNames" value={formData.otherNames} onChange={handleChange} placeholder="Other Name(s)" />
                    </div>
                </div>
                {/* 3. Date/Place of Birth, Marital Status, Children */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <Input name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} placeholder="Date of Birth" type="date" />
                    <Input name="placeOfBirth" value={formData.placeOfBirth} onChange={handleChange} placeholder="Place of Birth" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                    <Input name="maritalStatus" value={formData.maritalStatus} onChange={handleChange} placeholder="Marital Status" />
                    <Input name="dateOfMarriage" value={formData.dateOfMarriage} onChange={handleChange} placeholder="Date of Marriage" type="date" />
                    <Input name="numSons" value={formData.numSons} onChange={handleChange} placeholder="Number of Sons" type="number" />
                    <Input name="sonsAges" value={formData.sonsAges} onChange={handleChange} placeholder="Son(s) Age(s)" />
                    <Input name="numDaughters" value={formData.numDaughters} onChange={handleChange} placeholder="Number of Daughters" type="number" />
                    <Input name="daughtersAges" value={formData.daughtersAges} onChange={handleChange} placeholder="Daughter(s) Age(s)" />
                </div>
                {/* 4. Spouse & Family */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <Input name="spouseName" value={formData.spouseName} onChange={handleChange} placeholder="Spouse Name" />
                    <Input name="spouseOccupation" value={formData.spouseOccupation} onChange={handleChange} placeholder="Spouse Occupation" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <Input name="fatherOrHusbandName" value={formData.fatherOrHusbandName} onChange={handleChange} placeholder="Father's/Husband's Name" />
                    <Input name="fatherOrHusbandAddress" value={formData.fatherOrHusbandAddress} onChange={handleChange} placeholder="Father's/Husband's Address" />
                </div>
                {/* 5. Addresses & Contact */}
                <div>
                    <Label className="block text-gray-700 font-medium mb-2">Present Address (for correspondence)</Label>
                    <Input name="presentAddress" value={formData.presentAddress} onChange={handleChange} placeholder="Present Address" />
                    <Input name="presentTel" value={formData.presentTel} onChange={handleChange} placeholder="Tel. No." />
                </div>
                <div>
                    <Label className="block text-gray-700 font-medium mb-2">Permanent Address</Label>
                    <Input name="permanentAddress" value={formData.permanentAddress} onChange={handleChange} placeholder="Permanent Address" />
                    <Input name="permanentTel" value={formData.permanentTel} onChange={handleChange} placeholder="Tel. No." />
                </div>
                <div>
                    <Label className="block text-gray-700 font-medium mb-2">Home Town Address (if different from Permanent Address)</Label>
                    <Input name="homeTownAddress" value={formData.homeTownAddress} onChange={handleChange} placeholder="Home Town Address" />
                    <Input name="homeTownTel" value={formData.homeTownTel} onChange={handleChange} placeholder="Tel. No." />
                </div>
                {/* Education Section */}
                <div>
                    <h2 className="text-lg font-semibold mb-2">Education / Training (Highest Technical Qualification only)</h2>
                    <div className="space-y-4">
                        {formData.education.map((edu, idx) => (
                            <div key={idx} className="grid grid-cols-1 md:grid-cols-6 gap-2 md:gap-4 items-center bg-gray-50 rounded p-2">
                                <div className="md:col-span-1">
                                    <Input
                                        placeholder="Degree/Certificate"
                                        value={edu.degree}
                                        onChange={e => handleEducationChange(idx, 'degree', e.target.value)}
                                    />
                                </div>
                                <div className="md:col-span-1">
                                    <Input
                                        placeholder="Year"
                                        value={edu.year}
                                        onChange={e => handleEducationChange(idx, 'year', e.target.value)}
                                    />
                                </div>
                                <div className="md:col-span-1">
                                    <Input
                                        placeholder="College/Institution"
                                        value={edu.college}
                                        onChange={e => handleEducationChange(idx, 'college', e.target.value)}
                                    />
                                </div>
                                <div className="md:col-span-1">
                                    <Input
                                        placeholder="Place"
                                        value={edu.place}
                                        onChange={e => handleEducationChange(idx, 'place', e.target.value)}
                                    />
                                </div>
                                <div className="md:col-span-1">
                                    <Input
                                        placeholder="%"
                                        value={edu.percent}
                                        onChange={e => handleEducationChange(idx, 'percent', e.target.value)}
                                    />
                                </div>
                                <div className="flex md:justify-center mt-2 md:mt-0">
                                    {formData.education.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="opacity-70 hover:opacity-100 transition"
                                            onClick={() => {
                                                setFormData(prev => ({
                                                    ...prev,
                                                    education: prev.education.filter((_, i) => i !== idx)
                                                }));
                                            }}
                                            aria-label="Delete row"
                                        >
                                            <Trash className="w-4 h-4 text-red-500" />
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                        <div className="flex justify-end">
                            <Button type="button" variant="outline" onClick={addEducationRow} className="mt-2 w-full md:w-auto">Add Row</Button>
                        </div>
                    </div>
                </div>
                {/* ID Documents */}
                <div>
                    <h2 className="text-lg font-semibold mb-2">ID Documents</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="grid grid-cols-4 gap-4">
                            <Input placeholder="Passport No." name="passportNo" value={formData.passportNo} onChange={handleChange} />
                            <Input placeholder="Dt Issue" name="passportIssue" value={formData.passportIssue} onChange={handleChange} />
                            <Input placeholder="Place" name="passportPlace" value={formData.passportPlace} onChange={handleChange} />
                            <Input placeholder="Valid up to" name="passportValid" value={formData.passportValid} onChange={handleChange} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input placeholder="PAN" name="pan" value={formData.pan} onChange={handleChange} />
                            <Input placeholder="D/Lic." name="dlic" value={formData.dlic} onChange={handleChange} />
                        </div>
                    </div>
                </div>
                {/* Health Declaration */}
                <div>
                    <h2 className="text-lg font-semibold mb-2">Health Declaration</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Input placeholder="Height (cm)" name="height" value={formData.height} onChange={handleChange} />
                        <Input placeholder="Weight (kg)" name="weight" value={formData.weight} onChange={handleChange} />
                        <Input placeholder="Blood Group" name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} />
                    </div>
                </div>
                {/* Date and Signature */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 items-end">
                    <Input name="date" value={formData.date} onChange={handleChange} placeholder="Date" type="date" />
                    <div className="flex flex-col">
                        <Label className="mb-2">Signature</Label>
                        <div className="border border-dashed border-gray-400 h-12 rounded" />
                    </div>
                </div>
                {/* For Office Use Section */}
                <div>
                    <h2 className="text-lg font-semibold mb-2">For Office Use</h2>
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-2 md:gap-4">
                        <Input placeholder="CTC" disabled />
                        <Input placeholder="Probation up to" disabled />
                        <Input placeholder="Next Increment Due" disabled />
                        <Input placeholder="Reviewed on" disabled />
                        <Input placeholder="Approved by" disabled />
                    </div>
                </div>
            </form>
        </div>
    );
};

export default JoiningReport; 