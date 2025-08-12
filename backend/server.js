import express from "express";
import cors from "cors";
import { config } from "dotenv";
import authRouter from "./routes/auth.js";
import dbConnect from "./config/db.js";
import departmentRouter from "./routes/department.js";
import employeeRouter from "./routes/employee.js";
import salaryRouter from "./routes/salary.js";
import leaveRouter from "./routes/leave.js";
import allowanceRouter from "./routes/allowance.js";
import fixedallowanceRouter from "./routes/fixedallowance.js";
import userRouter from "./routes/users.js";
import messageRouter from "./routes/message.js";
import helpdeskRouter from "./routes/helpdesk.js";
import holidayRouter from "./routes/holiday.js";
import appraisalRouter from "./routes/appraisal.js";
import travelExpenditureRouter from "./routes/travelExpenditure.js";
import ltcRouter from "./routes/ltc.js";
import salaryPasswordRouter from "./routes/salaryPassword.js";

const app = express();
config({ path: ".env" });

app.use(
  cors({
    origin: ["https://korus-ems.vercel.app", "http://localhost:8080"],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

dbConnect();

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/department", departmentRouter);
app.use("/api/employees", employeeRouter);
app.use("/api/holiday", holidayRouter);
app.use("/api/helpdesk", helpdeskRouter);
app.use("/api/appraisals", appraisalRouter);
app.use("/api/leaves", leaveRouter);
app.use("/api/salary", salaryRouter);
app.use("/api/allowances", allowanceRouter);
app.use("/api/fixed-allowances", fixedallowanceRouter);
app.use("/api/travel-expenditures", travelExpenditureRouter);
app.use("/api/ltc", ltcRouter);
app.use("/api/message", messageRouter);
app.use("/api/salary-password", salaryPasswordRouter);

app.get("/", (req, res) => {
  res.send("Hello");
});

app.listen(5000, () => {
  console.log('Server started on 5000');
});
