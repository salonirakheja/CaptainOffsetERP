import { prisma } from './db/prisma';

export async function logActivity(
  factoryId: number,
  personId: number,
  entityType: string,
  entityId: number,
  action: string,
  field?: string,
  oldValue?: string,
  newValue?: string
) {
  return prisma.activityLog.create({
    data: {
      factoryId,
      personId,
      entityType,
      entityId,
      action,
      field: field || '',
      oldValue: oldValue || '',
      newValue: newValue || '',
    },
  });
}
