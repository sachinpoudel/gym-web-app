import { PaymentStatus } from "@prisma/client";
import { Request, Response } from "express";
import { paymentService } from "../services/payment.service";
import { sendSuccess } from "../utils/apiResponse";
import { getRequiredParam } from "../utils/request";

export const paymentController = {
  async create(req: Request, res: Response) {
    const payment = await paymentService.create({
      ...req.body,
      dueDate: new Date(req.body.dueDate),
      paidAt: req.body.paidAt ? new Date(req.body.paidAt) : undefined
    });

    return sendSuccess(res, payment, "Payment created", 201);
  },

  async getAll(req: Request, res: Response) {
    const status = req.query.status as PaymentStatus | undefined;
    const memberId = req.query.memberId as string | undefined;

    const payments = await paymentService.getAll({
      ...(status ? { status } : {}),
      ...(memberId ? { memberId } : {})
    });

    return sendSuccess(res, payments, "Payments fetched");
  },

  async getByMemberId(req: Request, res: Response) {
    const payments = await paymentService.getByMemberId(
      getRequiredParam(req, "memberId")
    );
    return sendSuccess(res, payments, "Member payments fetched");
  },

  async updateStatus(req: Request, res: Response) {
    const payment = await paymentService.updateStatus(
      getRequiredParam(req, "id"),
      req.body.status as PaymentStatus
    );

    return sendSuccess(res, payment, "Payment status updated");
  },

  async markPaid(req: Request, res: Response) {
    const payment = await paymentService.markPaid(getRequiredParam(req, "id"));
    return sendSuccess(res, payment, "Payment marked as paid");
  },

  async getSummary(_req: Request, res: Response) {
    const summary = await paymentService.getSummary();
    return sendSuccess(res, summary, "Payment summary fetched");
  },

  async getMonthly(_req: Request, res: Response) {
    const monthly = await paymentService.getMonthlyTotals();
    return sendSuccess(res, monthly, "Monthly payment totals fetched");
  },

  async getYearly(_req: Request, res: Response) {
    const yearly = await paymentService.getYearlyTotals();
    return sendSuccess(res, yearly, "Yearly payment totals fetched");
  },

  async getOverdue(_req: Request, res: Response) {
    const overdue = await paymentService.getOverdue();
    return sendSuccess(res, overdue, "Overdue payments fetched");
  },

  async sendReminder(req: Request, res: Response) {
    const result = await paymentService.sendReminder(getRequiredParam(req, "id"));
    return sendSuccess(res, result, "Payment reminder sent");
  }
};
