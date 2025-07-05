import Salary from "../models/Salary.js";
import Allowance from "../models/Allowances.js";
import FixedAllowance from "../models/FixedAllowance.js";
import Employee from "../models/Employee.js";

const getMonthWiseCTC = async (req, res) => {
  try {
    const { month, year } = req.params;

    if (!month || !year) {
      return res.json({
        success: false,
        message: "Month and Year are required.",
      });
    }

    // Fetch salary details and populate employee data
    const salaries = await Salary.find({
      paymentMonth: month,
      paymentYear: year,
    }).populate({
      path: "employeeId", // Populate the employee data
      populate: {
        path: "department", // Populate the department inside the employee model
        select: "departmentName", // Select only the department name
      },
    });

    // Fetch dynamic allowances for the specified month and year
    const allowances = await Allowance.find({
      allowanceMonth: month,
      allowanceYear: year,
      status: "approved",
    });

    // Fetch fixed allowances for the specified month and year
    const fixedAllowances = await FixedAllowance.find({
      allowanceMonth: month,
      allowanceYear: year,
    });

    // Process salary data for each employee
    const detailedData = salaries.map((salary) => {
      const employeeId = salary.employeeId._id;

      // Compile allowances and deductions from the Salary model
      const salaryAllowances = salary.allowances.map((allowance) => ({
        name: allowance.name,
        amount: allowance.amount,
      }));

      const salaryDeductions = salary.deductions.map((deduction) => ({
        name: deduction.name,
        amount: deduction.amount,
      }));

      // Filter dynamic allowances specific to this employee
      const employeeDynamicAllowances = allowances.filter(
        (allowance) => allowance.employeeId.toString() === employeeId.toString()
      );

      // Filter fixed allowances specific to this employee
      const employeeFixedAllowances = fixedAllowances.filter(
        (fixedAllowance) =>
          fixedAllowance.employeeId.toString() === employeeId.toString()
      );

      // Calculate total salary allowances and deductions
      const totalSalaryAllowance = salaryAllowances.reduce(
        (sum, a) => sum + a.amount,
        0
      );
      const totalSalaryDeductions = salaryDeductions.reduce(
        (sum, d) => sum + d.amount,
        0
      );

      // Calculate total dynamic and fixed allowances
      const totalDynamicAllowance = employeeDynamicAllowances.reduce(
        (sum, allowance) => sum + allowance.allowanceAmount,
        0
      );
      const totalFixedAllowance = employeeFixedAllowances.reduce(
        (sum, allowance) => sum + allowance.allowanceAmount,
        0
      );

      // Salary Model Total (Basic Salary + Allowances - Deductions)
      const salaryModelTotal =
        salary.basicSalary + totalSalaryAllowance - totalSalaryDeductions;

      return {
        employee: {
          id: salary.employeeId.employeeId,
          name: salary.employeeId.name,
          department: salary.employeeId.department?.departmentName,
        },
        grossSalary: salary.grossSalary,
        salaryModelTotal,
        salaryModelAllowances: salaryAllowances,
        salaryModelDeductions: salaryDeductions,
        dynamicAllowances: employeeDynamicAllowances.map((allowance) => ({
          type: allowance.allowanceType,
          amount: allowance.allowanceAmount,
        })),
        fixedAllowances: employeeFixedAllowances.map((allowance) => ({
          type: allowance.allowanceType,
          amount: allowance.allowanceAmount,
        })),
        totalDynamicAllowance,
        totalFixedAllowance,
      };
    });

    return res.json({
      success: true,
      data: detailedData,
    });
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

const getYearWiseCTC = async (req, res) => {
  try {
    // Your implementation for year-wise CTC fetching (if needed)
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
};

const getEmployeeWiseCTC = async (req, res) => {
  try {
    const { employeeId } = req.params;

    const employee = await Employee.findOne({ employeeId }).populate('department');
    if (!employee) {
      return res.json({ success: false, message: "Employee not found" });
    }

    const empId = employee._id;
    console.log();

    // Fetch all salaries for the given employee
    const salaries = await Salary.find({ employeeId: empId });

    if (!salaries.length) {
      return res.json({ success: false, message: "No salary records found." });
    }

    // Prepare an array to hold month-wise CTC details
    const ctcDetails = [];

    // Iterate through each salary record and calculate the CTC
    for (const salary of salaries) {
      const { paymentMonth, paymentYear, grossSalary } = salary;

      // Fetch fixed allowances for the given employee, month, and year
      const fixedAllowances = await FixedAllowance.find({
        employeeId: empId,
        allowanceMonth: paymentMonth,
        allowanceYear: paymentYear,
      });

      // Fetch other allowances for the given employee, month, and year
      const variableAllowances = await Allowance.find({
        employeeId: empId,
        allowanceMonth: paymentMonth,
        allowanceYear: paymentYear,
      });

      // Calculate total allowances and deductions
      const totalFixedAllowances = fixedAllowances.reduce(
        (sum, item) => sum + item.allowanceAmount,
        0
      );
      const totalVariableAllowances = variableAllowances.reduce(
        (sum, item) => sum + item.allowanceAmount,
        0
      );

      // Calculate net CTC
      const netCTC = grossSalary + totalFixedAllowances + totalVariableAllowances;

      // Push the details for the month
      ctcDetails.push({
        id: employee.employeeId,
        name: employee.name,
        department: employee.department?.departmentName,
        paymentMonth,
        paymentYear,
        grossSalary,
        totalFixedAllowances,
        totalVariableAllowances,
        netCTC,
      });
    }

    return res.json({ success: true, data: ctcDetails });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export { getMonthWiseCTC, getYearWiseCTC, getEmployeeWiseCTC };
