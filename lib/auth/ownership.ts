import { prisma } from "@/lib/db/prisma";

export async function assertApplicationOwner(applicationId: string, userId: string) {
  const application = await prisma.application.findFirst({
    where: {
      id: applicationId,
      userId,
    },
    select: {
      id: true,
    },
  });

  if (!application) {
    throw new Error("Application not found.");
  }

  return application.id;
}
