import { authenticatedFetch } from "./apiService";

export interface BodyCompositionRecord {
  userId: string;
  id: string;
  createdAt: number;
  updatedAt: number;
  date: number;
  weight: number;
  bodyFatPercentage: number;
  muscleMassPercentage: number;
  muscleMass: number;
  subcutaneousFat: number;
  visceralFat: number;
  bodyHydration: number;
  skeletalMuscle: number;
  boneMass: number;
  protein: number;
  bmi: number;
  bmr: number;
  metabolicAge: number;
}

export interface BodyCompositionApiResponse {
  status: string;
  message: string;
  error: string | null;
  data: BodyCompositionRecord[];
}

/**
 * Fetch body composition records from the API
 */
export const fetchBodyComposition = async (): Promise<
  BodyCompositionRecord[]
> => {
  const response = await authenticatedFetch("/bodyComposition", {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch body composition: ${response.status}`);
  }

  const apiResponse: BodyCompositionApiResponse = await response.json();

  if (apiResponse.status !== "0" || apiResponse.error) {
    throw new Error(
      apiResponse.message || apiResponse.error || "Failed to fetch data"
    );
  }

  return apiResponse.data;
};

export interface CreateBodyCompositionRequest {
  date: number; // Unix timestamp in seconds
  weight: number;
  bodyFatPercentage: number;
  muscleMassPercentage: number;
  muscleMass: number;
  subcutaneousFat: number;
  visceralFat: number;
  bodyHydration: number;
  skeletalMuscle: number;
  boneMass: number;
  protein: number;
  bmi: number;
  bmr: number;
  metabolicAge: number;
}

export interface CreateBodyCompositionApiResponse {
  status: string;
  message: string;
  error: string | null;
  data: BodyCompositionRecord;
}

/**
 * Create a new body composition record
 */
export const createBodyComposition = async (
  record: CreateBodyCompositionRequest
): Promise<BodyCompositionRecord> => {
  const response = await authenticatedFetch("/bodyComposition", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(record),
  });

  if (!response.ok) {
    throw new Error(`Failed to create body composition: ${response.status}`);
  }

  const apiResponse: CreateBodyCompositionApiResponse = await response.json();

  if (apiResponse.status !== "0" || apiResponse.error) {
    throw new Error(
      apiResponse.message || apiResponse.error || "Failed to create record"
    );
  }

  return apiResponse.data;
};

/**
 * Update an existing body composition record
 */
export const updateBodyComposition = async (
  id: string,
  record: CreateBodyCompositionRequest
): Promise<BodyCompositionRecord> => {
  const response = await authenticatedFetch(`/bodyComposition/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(record),
  });

  if (!response.ok) {
    throw new Error(`Failed to update body composition: ${response.status}`);
  }

  const apiResponse: CreateBodyCompositionApiResponse = await response.json();

  if (apiResponse.status !== "0" || apiResponse.error) {
    throw new Error(
      apiResponse.message || apiResponse.error || "Failed to update record"
    );
  }

  return apiResponse.data;
};

/**
 * Delete a body composition record
 */
export const deleteBodyComposition = async (id: string): Promise<void> => {
  const response = await authenticatedFetch(`/bodyComposition/${id}`, {
    method: "DELETE",
  });

  if (!response.ok) {
    throw new Error(`Failed to delete body composition: ${response.status}`);
  }

  const apiResponse: any = await response.json();

  if (apiResponse.status !== "0" || apiResponse.error) {
    throw new Error(
      apiResponse.message || apiResponse.error || "Failed to delete record"
    );
  }
};
