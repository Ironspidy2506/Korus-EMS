import Department from "../models/Department.js";

const getDepartments = async (req, res) => {
  try {
    const departments = await Department.find();
    return res.json({ success: true, departments });
  } catch (error) {
    return res.json({ success: false, error: "Get Department Server Error" });
  }
};

const addDepartment = async (req, res) => {
  try {
    const { departmentId, departmentName, description } = req.body;
    const newDepartment = new Department({
      departmentId,
      departmentName,
      description,
    });

    await newDepartment.save();
    return res.json({ success: true, message: "Department Added Successfully!" });
  } catch (error) {
    return res.json({ success: false, error: "Add Department Server Error" });
  }
};

const getDepartment = async (req, res) => {
  try {
    const { _id } = req.params;
    const department = await Department.findById(_id);
    return res.json({ success: true, department });
  } catch (error) {
    return res.json({ success: false, error: "Edit Department Server Error" });
  }
};

const updateDepartment = async (req, res) => {
  try {
    const { _id } = req.params;
    const { departmentId, departmentName, description } = req.body;
    const updateDepartment = await Department.findByIdAndUpdate(
      { _id: _id },
      {
        departmentId,
        departmentName,
        description,
      }
    );

    return res.json({ success: true, message: "Department Updated Successfully!" });
  } catch (error) {
    return res.json({ success: false, error: "Update Department Server Error" });
  }
};

const deleteDepartment = async (req, res) => {
  try {
    const { _id } = req.params;
    await Department.findByIdAndDelete({ _id });

    return res.json({ success: true, message: "Department Deleted Successfully!" });
  } catch (error) {
    return res.json({ success: false, error: "Delete Department Server Error" });
  }
};

export {
  addDepartment,
  getDepartments,
  getDepartment,
  updateDepartment,
  deleteDepartment,
};