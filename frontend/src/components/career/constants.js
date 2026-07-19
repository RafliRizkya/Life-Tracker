import { GraduationCap, Award, Briefcase, FolderKanban, Sparkles, Target } from "lucide-react";

export const TYPE_ICON = {
  education: GraduationCap,
  certificate: Award,
  experience: Briefcase,
  project: FolderKanban,
  skill: Sparkles,
  target: Target,
};

export const STATUS_META = {
  completed: { label: "Completed", color: "#315d48" },
  in_progress: { label: "In progress", color: "#eb9b63" },
  planned: { label: "Planned", color: "#8a9a5b" },
};

export const TRACK_META = {
  experience: { label: "Jejak Profesional", hint: "Pengalaman kerja, kronologis" },
  milestone: { label: "Milestone & Pencapaian", hint: "Pendidikan, sertifikasi, capaian lain" },
};
