export type ApplicationStatus =
  | "SAVED"
  | "APPLIED"
  | "ONLINE_TEST"
  | "INTERVIEW"
  | "OFFER"
  | "REJECTED"
  | "GHOSTED";

export type ApplicationChecklistItem = {
  id?: string;
  title: string;
  isDone: boolean;
};

export type ApplicationFormValues = {
  id?: string;
  jobTitle: string;
  companyName: string;
  status: ApplicationStatus;
  jobUrl?: string | null;
  source?: string | null;
  location?: string | null;
  workType?: string | null;
  dateApplied?: string | null;
  deadline?: string | null;
  followUpDate?: string | null;
  notes?: string | null;
  checklistItems: ApplicationChecklistItem[];
};

export type ApplicationFieldErrors = Partial<
  Record<
    | "jobTitle"
    | "companyName"
    | "status"
    | "jobUrl"
    | "source"
    | "location"
    | "workType"
    | "dateApplied"
    | "deadline"
    | "followUpDate"
    | "notes"
    | "checklistItems"
    | "title"
    | "isDone"
    | "position",
    string[]
  >
>;

export type ApplicationFormState = {
  error?: string;
  success?: string;
  fieldErrors?: ApplicationFieldErrors;
};

export type ApplicationFormAction = (
  state: ApplicationFormState,
  formData: FormData,
) => Promise<ApplicationFormState>;

export type ApplicationSummary = {
  id: string;
  jobTitle: string;
  companyName: string;
  status: ApplicationStatus;
  source?: string | null;
  location?: string | null;
  workType?: string | null;
  deadline?: string | null;
  followUpDate?: string | null;
};
