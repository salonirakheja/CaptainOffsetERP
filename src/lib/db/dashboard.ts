import { prisma } from './prisma';

export async function getDashboardStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const [activeJobs, jobsDueToday, dispatchesToday] = await Promise.all([
    prisma.job.count({
      where: { status: { notIn: ['dispatched', 'cancelled'] } },
    }),
    prisma.job.count({
      where: {
        dueDate: { gte: today, lt: tomorrow },
        status: { notIn: ['dispatched', 'cancelled'] },
      },
    }),
    prisma.dispatch.count({
      where: { dispatchDate: { gte: today, lt: tomorrow } },
    }),
  ]);

  return { activeJobs, jobsDueToday, dispatchesToday };
}
