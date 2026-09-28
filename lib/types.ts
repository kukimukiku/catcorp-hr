export type Cat = {
  id: number;
  name: string;
  job_title: string;
  email: string;
  salary: string | number;
  birth_date: string;
  remote_worker: boolean;
  lives_remaining: number;
  photo_url: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
};

export type EmployeeOfDay = {
  selected_date: string;
  id: number;
  name: string;
  job_title: string;
  photo_url: string | null;
};
