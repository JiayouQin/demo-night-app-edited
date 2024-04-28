import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "~/server/api/trpc";
import { db } from "~/server/db";

export const demosRouter = createTRPCRouter({
  get: publicProcedure.input(z.string()).query(async ({ input }) => {
    return db.demo.findUnique({
      where: {
        id: input,
      },
      include: {
        feedback: true,
        votes: true,
        awards: true,
      },
    });
  }),
  getWaitlist: publicProcedure.input(z.string()).query(async ({ input }) => {
    return db.feedback.findMany({
      where: {
        demoId: input,
        OR: [
          { wantToAccess: true },
          { wantToInvest: true },
          { wantToInvest: true },
        ],
      },
      include: {
        attendee: {
          select: {
            name: true,
            email: true,
            type: true,
          },
        },
      },
    });
  }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        url: z.string().url().optional(),
      }),
    )
    .mutation(async ({ input }) => {
      return db.demo.update({
        where: {
          id: input.id,
        },
        data: {
          name: input.name,
          email: input.email,
          url: input.url,
        },
      });
    }),
  updateIndex: protectedProcedure
    .input(z.object({ id: z.string(), index: z.number() }))
    .mutation(async ({ input }) => {
      return db.$transaction(async (prisma) => {
        const demoToUpdate = await prisma.demo.findUnique({
          where: { id: input.id },
          select: { index: true, eventId: true },
        });

        if (!demoToUpdate) {
          throw new Error("Demo not found");
        }

        if (demoToUpdate.index === input.index || input.index < 0) {
          return;
        }

        const maxIndex =
          (await prisma.demo.count({
            where: { eventId: demoToUpdate.eventId },
          })) - 1;

        if (input.index > maxIndex) {
          return;
        }

        if (demoToUpdate.index < input.index) {
          await prisma.demo.updateMany({
            where: {
              eventId: demoToUpdate.eventId,
              index: { gte: demoToUpdate.index, lte: input.index },
              NOT: { id: input.id },
            },
            data: {
              index: { decrement: 1 },
            },
          });
        } else {
          await prisma.demo.updateMany({
            where: {
              eventId: demoToUpdate.eventId,
              index: { gte: input.index, lte: demoToUpdate.index },
              NOT: { id: input.id },
            },
            data: {
              index: { increment: 1 },
            },
          });
        }

        return prisma.demo.update({
          where: { id: input.id },
          data: { index: input.index },
        });
      });
    }),
  makeCurrent: protectedProcedure
    .input(z.object({ eventId: z.string(), demoId: z.string() }))
    .mutation(async ({ input }) => {
      return db.$transaction(async (prisma) => {
        await prisma.demo.updateMany({
          where: {
            eventId: input.eventId,
            id: input.demoId,
          },
          data: {
            isCurrent: false,
          },
        });
        return prisma.demo.update({
          where: {
            id: input.demoId,
            eventId: input.eventId,
          },
          data: {
            isCurrent: true,
          },
        });
      });
    }),
  create: protectedProcedure
    .input(
      z.object({
        eventId: z.string(),
        name: z.string(),
        email: z.string().email(),
        url: z.string().url(),
      }),
    )
    .mutation(async ({ input }) => {
      const index = await db.demo.count({
        where: {
          eventId: input.eventId,
        },
      });
      return db.demo.create({
        data: {
          eventId: input.eventId,
          index: index,
          name: input.name,
          email: input.email,
          url: input.url,
        },
      });
    }),
  delete: protectedProcedure.input(z.string()).mutation(async ({ input }) => {
    return db.$transaction(async (prisma) => {
      const demoToDelete = await prisma.demo.findUnique({
        where: { id: input },
        select: { eventId: true, index: true },
      });

      if (!demoToDelete) {
        throw new Error("Demo not found");
      }

      await prisma.demo.delete({
        where: { id: input },
      });

      await prisma.demo.updateMany({
        where: {
          eventId: demoToDelete.eventId,
          index: { gt: demoToDelete.index },
        },
        data: {
          index: { decrement: 1 },
        },
      });
    });
  }),
});
