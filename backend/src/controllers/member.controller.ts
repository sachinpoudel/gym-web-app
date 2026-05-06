import { Request, Response } from "express";
import { MemberPlan, MemberStatus, PaymentMethod } from "@prisma/client";
import { memberService } from "../services/member.service";
import { sendSuccess } from "../utils/apiResponse";
import { getRequiredParam } from "../utils/request";
import { HttpError } from "../utils/httpError";

const PLAN_MONTHS: Record<MemberPlan, number> = {
  BASIC: 1,
  PRO: 3,
  ELITE: 12
};

const calculateExpiryDate = (joinDate: Date, plan: MemberPlan): Date => {
  const expiry = new Date(joinDate);
  expiry.setMonth(expiry.getMonth() + PLAN_MONTHS[plan]);
  return expiry;
};

export const memberController = {
  async create(req: Request, res: Response) {
    const requiredFields = ["email", "firstName", "lastName", "phone", "dateOfBirth", "paymentAmount"];
    const missing = requiredFields.find((field) => req.body[field] === undefined || req.body[field] === null || req.body[field] === "");
    if (missing) {
      throw new HttpError(400, `${missing} is required`);
    }

    const plan = (req.body.plan as MemberPlan | undefined) ?? MemberPlan.BASIC;
    const joinDate = req.body.joinDate ? new Date(req.body.joinDate) : new Date();
    const expiryDate = req.body.expiryDate
      ? new Date(req.body.expiryDate)
      : calculateExpiryDate(joinDate, plan);

    const emergencyContactName = (req.body.emergencyContactName as string | undefined)?.trim();
    const emergencyContactPhone = (req.body.emergencyContactPhone as string | undefined)?.trim();

    const data = {
      email: String(req.body.email).trim().toLowerCase(),
      firstName: String(req.body.firstName).trim(),
      lastName: String(req.body.lastName).trim(),
      phone: String(req.body.phone).trim(),
      dateOfBirth: new Date(req.body.dateOfBirth),
      plan,
      joinDate,
      expiryDate,
      status: (req.body.status as MemberStatus | undefined) ?? MemberStatus.ACTIVE,
      ...(emergencyContactName && emergencyContactPhone
        ? { emergencyContact: `${emergencyContactName} | ${emergencyContactPhone}` }
        : {}),
      ...(req.body.healthNotes ? { healthNotes: String(req.body.healthNotes) } : {}),
      paymentAmount: Number(req.body.paymentAmount ?? 0),
      paymentMethod:
        (req.body.paymentMethod as PaymentMethod | undefined) ?? PaymentMethod.CASH
    };

    const payload = await memberService.createOnboarding(data);
    return sendSuccess(res, payload, "Member created", 201);
  },

  async getAll(req: Request, res: Response) {
    const page = Math.max(Number(req.query.page ?? 1), 1);
    const limit = Math.min(Math.max(Number(req.query.limit ?? 10), 1), 100);

    const status = req.query.status as MemberStatus | undefined;
    const plan = req.query.plan as MemberPlan | undefined;
    const search = req.query.search as string | undefined;

    const members = await memberService.getAll({
      ...(status ? { status } : {}),
      ...(plan ? { plan } : {}),
      ...(search ? { search } : {}),
      page,
      limit
    });

    return sendSuccess(res, members, "Members fetched");
  },

  async getExpiring(_req: Request, res: Response) {
    const members = await memberService.getExpiringInDays(7);
    return sendSuccess(res, members, "Expiring members fetched");
  },

  async getById(req: Request, res: Response) {
    const member = await memberService.getById(getRequiredParam(req, "id"));
    return sendSuccess(res, member, "Member fetched");
  },

  async update(req: Request, res: Response) {
    const updateData = { ...req.body };
    if (updateData.emergencyContactName !== undefined || updateData.emergencyContactPhone !== undefined) {
      updateData.emergencyContact = `${updateData.emergencyContactName || ""} | ${updateData.emergencyContactPhone || ""}`;
      delete updateData.emergencyContactName;
      delete updateData.emergencyContactPhone;
    }

    // Ignore payment fields to prevent Prisma crashes during member update
    delete updateData.paymentMethod;
    delete updateData.paymentAmount;

    const member = await memberService.update(getRequiredParam(req, "id"), updateData);
    return sendSuccess(res, member, "Member updated");
  },

  async updateStatus(req: Request, res: Response) {
    const member = await memberService.updateStatus(
      getRequiredParam(req, "id"),
      req.body.status as MemberStatus
    );
    return sendSuccess(res, member, "Member status updated");
  },

  async remove(req: Request, res: Response) {
    await memberService.remove(getRequiredParam(req, "id"));
    return sendSuccess(res, null, "Member set to expired");
  },

  async freeze(req: Request, res: Response) {
    const member = await memberService.freeze(getRequiredParam(req, "id"));
    return sendSuccess(res, member, "Member frozen");
  },

  async activate(req: Request, res: Response) {
    const member = await memberService.activate(getRequiredParam(req, "id"));
    return sendSuccess(res, member, "Member activated");
  },

  async getStats(req: Request, res: Response) {
    const stats = await memberService.getStats(getRequiredParam(req, "id"));
    return sendSuccess(res, stats, "Member stats fetched");
  }
};
