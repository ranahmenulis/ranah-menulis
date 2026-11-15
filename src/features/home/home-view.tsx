"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Tabs } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { useStreakData } from "@/features/studio/hooks/use-streak-data";
import { parseDay } from "@/features/studio/streak";
import { capitalizeFirst } from "@/features/studio/streak-copy";
import { studioStore } from "@/features/studio/storage/store";
import { feed, followed } from "./fixtures";
import { FeedItem } from "./feed-item";
import { FollowRow } from "./follow-row";
import { FirstSteps } from "./steps";
import { TodayBlock } from "./today-block";

const dateFormat = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

/**
 * Beranda (PLT-10, DESIGN.md 6.2): "Hari ini" lines, then the feed. The feed and the non-writing
 * rows of "Hari ini" are dummy content until Community and Projects exist.
 */
export function HomeView() {
  const data = useStreakData(studioStore);
  const toast = useToast();
  const [feedTab, setFeedTab] = useState("mengikuti");

  const ready = data.status === "ready";
  const isNew = ready && data.lastDocument === null && data.target === null;

  return (
    <div className="max-w-182">
      <p className="min-h-5 text-sm text-ink-muted">
        {data.today && capitalizeFirst(dateFormat.format(parseDay(data.today)))}
      </p>
      <h1 className="mt-1 mb-4 heading-lg">Hari ini</h1>

      {isNew && (
        <FirstSteps hasTarget={data.target !== null} hasDocument={data.lastDocument !== null} />
      )}
      <TodayBlock data={data} showDummy={ready && !isNew} />

      {ready && !isNew && <FollowRow items={followed} />}

      <Tabs
        label="Feed"
        value={feedTab}
        className="mt-8 md:mt-10"
        onValueChange={(id) => {
          if (id === "jelajahi") toast({ message: "Jelajahi segera hadir." });
          else setFeedTab(id);
        }}
        items={[
          { id: "mengikuti", label: "Mengikuti" },
          { id: "jelajahi", label: "Jelajahi" },
        ]}
      />

      {isNew ? (
        <div className="grid justify-items-start gap-3 py-12">
          <p className="font-serif text-xl leading-7 font-semibold">
            Kamu belum mengikuti siapa pun.
          </p>
          <p className="max-w-110 text-sm text-ink-muted">
            Jelajahi tulisan dari penulis di Indonesia dan Malaysia, lalu ikuti yang suaranya ingin
            kamu baca lagi.
          </p>
          <Button variant="secondary" disabled title="Segera">
            Buka Jelajahi
          </Button>
        </div>
      ) : (
        ready && feed.map((entry) => <FeedItem key={entry.id} entry={entry} />)
      )}
    </div>
  );
}
