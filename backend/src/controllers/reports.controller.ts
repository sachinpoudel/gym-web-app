import { Request, Response } from "express";
import { reportsService } from "../services/reports.service";
import { sendSuccess } from "../utils/apiResponse";

export const reportsController = {
  async overview(_req: Request, res: Response) {
    res.setHeader("Cache-Control", "private, max-age=60");
    const data = await reportsService.getOverview();
    return sendSuccess(res, data, "Overview report fetched");
  },

  async revenue(req: Request, res: Response) {
    res.setHeader("Cache-Control", "private, max-age=900");
    const period = (req.query.period as "monthly" | "yearly") ?? "monthly";
    const data = await reportsService.getRevenue(period);
    return sendSuccess(res, data, "Revenue report fetched");
  },

  async attendance(req: Request, res: Response) {
    res.setHeader("Cache-Control", "private, max-age=300");
    const startDate = req.query.startDate
      ? new Date(String(req.query.startDate))
      : undefined;
    const endDate = req.query.endDate
      ? new Date(String(req.query.endDate))
      : undefined;

    const data = await reportsService.getAttendance(startDate, endDate);
    return sendSuccess(res, data, "Attendance report fetched");
  },

  async retention(_req: Request, res: Response) {
    res.setHeader("Cache-Control", "private, max-age=900");
    const data = await reportsService.getRetention();
    return sendSuccess(res, data, "Retention report fetched");
  }
};
