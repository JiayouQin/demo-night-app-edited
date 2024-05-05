import { useWorkspaceContext } from "../../contexts/WorkspaceContext";
import RatingSlider from "../DemosWorkspace/RatingSlider";
import { type Award, type Demo, type Feedback } from "@prisma/client";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { api } from "~/trpc/react";

import { GaicoConfetti } from "~/components/Confetti";

export default function RecapWorkspace() {
  const [awardIndex, setAwardIndex] = useState(0);
  const [demoIndex, setDemoIndex] = useState(0);
  const { currentEvent, event, attendee } = useWorkspaceContext();
  const { data: feedback } = api.feedback.all.useQuery({
    eventId: currentEvent.id,
    attendeeId: attendee.id,
  });

  useEffect(() => {
    const intervalId = setInterval(() => {
      setAwardIndex((i) => (i + 1) % (event?.awards.length ?? 1));
      setDemoIndex((i) => (i + 1) % (event?.demos.length ?? 1));
    }, 5000);

    return () => clearInterval(intervalId);
  }, [event?.awards.length, event?.demos.length]);

  if (!event || !event.awards.length || !event.demos.length) return null;

  const award = event.awards[awardIndex]!;
  const demo = event.demos[demoIndex]!;

  return (
    <div className="flex size-full flex-1 flex-col items-center justify-center gap-8 p-4">
      <h1 className="-mb-2 text-center font-kallisto text-4xl font-bold tracking-tight">
        Event Recap 🎉
      </h1>
      <div className="flex w-full flex-col gap-2">
        <h2 className="w-full font-kallisto text-2xl font-bold">
          Winning Demos 🤩
        </h2>
        <div className="z-10 flex w-full flex-row">
          <AnimatePresence initial={false} mode="wait">
            <AwardWinnerItem
              key={award.id}
              award={award}
              winner={event.demos.find((d) => d.id === award.winnerId)}
            />
          </AnimatePresence>
        </div>
      </div>
      <div className="flex w-full flex-col gap-2">
        <h2 className="w-full font-kallisto text-2xl font-bold">
          All Demos 🧑‍💻
        </h2>
        <div className="z-10 flex w-full flex-row">
          <AnimatePresence initial={false} mode="wait">
            <DemoItem key={demo.id} demo={demo} />
          </AnimatePresence>
        </div>
      </div>
      <div className="flex w-full flex-col gap-2">
        <h2 className="w-full font-kallisto text-2xl font-bold">
          Your Feedback ✍️
        </h2>
        <div className="z-10 flex w-full flex-col gap-2">
          <AnimatePresence initial={false} mode="wait">
            {feedback &&
              Object.values(feedback).map((f) => (
                <FeedbackItem
                  key={f.id}
                  feedback={f}
                  demo={event.demos.find((d) => d.id === f.demoId)}
                />
              ))}
          </AnimatePresence>
        </div>
      </div>
      <div className="z-3 pointer-events-none fixed inset-0">
        <GaicoConfetti />
      </div>
    </div>
  );
}

function AwardWinnerItem({
  award,
  winner,
}: {
  award: Award;
  winner: Demo | undefined;
}) {
  return (
    <motion.div
      key={award.id}
      initial={{ opacity: 0, x: 100, scale: 0.75 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -100, scale: 0.75 }}
      transition={{ duration: 0.5, type: "spring" }}
      className="flex w-full flex-col font-medium leading-6"
    >
      <Link
        href={winner?.url ?? "/"}
        target="_blank"
        className="group z-10 w-full rounded-xl bg-green-400/50 p-4 shadow-xl backdrop-blur"
      >
        <div className="flex items-center gap-2">
          <h3 className="line-clamp-1 text-xl font-bold group-hover:underline">
            {award.name}: {winner?.name}
          </h3>
          <ArrowUpRight
            size={24}
            strokeWidth={3}
            className="h-5 w-5 flex-none rounded-md bg-green-400/50 p-[2px] text-green-500 group-hover:bg-green-500/50 group-hover:text-green-700"
          />
        </div>
      </Link>
    </motion.div>
  );
}

function DemoItem({ demo }: { demo: Demo }) {
  return (
    <motion.div
      key={demo.id}
      initial={{ opacity: 0, x: 100, scale: 0.75 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -100, scale: 0.75 }}
      transition={{ duration: 0.5, type: "spring" }}
      className="w-full font-medium leading-6"
    >
      <Link
        href={demo.url ?? "/"}
        target="_blank"
        className="group z-10 flex w-full flex-col rounded-xl bg-gray-300/50 p-4 shadow-xl backdrop-blur"
      >
        <div className="flex items-center gap-2">
          <h3 className="line-clamp-1 text-xl font-bold group-hover:underline">
            {demo.name}
          </h3>
          <ArrowUpRight
            size={24}
            strokeWidth={3}
            className="h-5 w-5 flex-none rounded-md bg-gray-300/50 p-[2px] text-gray-500 group-hover:bg-gray-400/50 group-hover:text-gray-700"
          />
        </div>
        <p className="text-gray-700">{demo.description}</p>
      </Link>
    </motion.div>
  );
}

function FeedbackItem({ feedback, demo }: { feedback: Feedback; demo?: Demo }) {
  const summary = [
    feedback.claps
      ? `👏<span class="text-xs"> x${feedback.claps}</span>`
      : null,
    feedback.wantToAccess ? "📬" : null,
    feedback.wantToInvest ? "💰" : null,
    feedback.wantToWork ? "👩‍💻" : null,
  ];
  const summaryString = summary.filter((s) => s).join(" • ");
  return (
    <motion.div
      key={feedback.id}
      initial={{ opacity: 0, x: 100, scale: 0.75 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: -100, scale: 0.75 }}
      transition={{ duration: 0.5, type: "spring" }}
      className="w-full font-medium leading-6"
    >
      <Link
        href={demo?.url ?? "/"}
        target="_blank"
        className="group z-10 flex w-full flex-col gap-2 rounded-xl bg-gray-300/50 p-4 shadow-xl backdrop-blur"
      >
        <div className="flex items-center gap-2">
          <h3 className="line-clamp-1 text-xl font-bold group-hover:underline">
            {feedback.star ? "⭐ " : ""}
            {demo?.name}
          </h3>
          <ArrowUpRight
            size={24}
            strokeWidth={3}
            className="h-5 w-5 flex-none rounded-md bg-gray-300/50 p-[2px] text-gray-500 group-hover:bg-gray-400/50 group-hover:text-gray-700"
          />
          <p
            className="pl-2 font-semibold text-gray-500"
            dangerouslySetInnerHTML={{ __html: summaryString }}
          />
        </div>
        {feedback.rating && (
          <div className="pointer-events-none h-11 w-full px-2 pt-1">
            <RatingSlider feedback={feedback} />
          </div>
        )}
        {feedback.comment && (
          <p className="italic text-gray-700">{`"${feedback.comment}"`}</p>
        )}
      </Link>
    </motion.div>
  );
}