// Hevy exercise title (as it appears in the CSV export) -> openGym catalogue id
// (packages/catalogue/exercises.json). Started from openGym's hevy-id-map.js, then
// reviewed by hand. Titles with no faithful catalogue match are custom
// exercises; we still record their muscles so stats and the body map work.

export interface CustomExerciseInfo {
  custom: true;
  bodyPart: string;
  targetMuscle: string;
  equipment: string | null;
  category: string;
}

export type CatalogueMapping = string | CustomExerciseInfo;

export const HEVY_CATALOGUE_MAP: Record<string, CatalogueMapping> = {
  'Bench Press (Dumbbell)': '0289',
  'Bicep Curl (Dumbbell)': '0294',
  'Calf Extension (Machine)': '0738', // sled 45° calf press
  'Chest Dip': '0251',
  'Chest Fly (Machine)': '0596', // lever seated fly
  'Chest Supported Y Raise (Dumbbell)': '3541', // dumbbell incline y-raise
  'Chin Up': '1326',
  'Crunch (Machine)': '1452',
  'Decline Crunch': '0277',
  'Decline Crunch (Weighted)': '0277',
  'Face Pull': '5656', // cable standing face pull (with rope)
  'Front Raise (Dumbbell)': '0310',
  'Hack Squat (Machine)': '0743',
  'Hammer Curl (Cable)': '0165',
  'Hammer Curl (Dumbbell)': '0313',
  'Hanging Leg Raise': '0472',
  'Hiking': { custom: true, bodyPart: 'cardio', targetMuscle: 'cardiovascular system', equipment: null, category: 'cardio' },
  'Incline Bench Press (Dumbbell)': '0314',
  'Incline Chest Press (Machine)': '1299',
  'Iso-Lateral Chest Press (Machine)': '0576', // lever chest press
  'Iso-Lateral Low Row': '4214', // lever low row (plate loaded)
  'Lat Pulldown (Cable)': '2330',
  'Lat Pulldown - Close Grip (Cable)': '2616',
  'Lateral Raise (Dumbbell)': '0334',
  'Leg Extension (Machine)': '0585',
  'Leg Press (Machine)': '0739',
  'Lying Leg Curl (Machine)': '0586',
  'Preacher Curl (Barbell)': '0070',
  'Pull Up': '0652',
  'Push Up': '0662',
  'Rear Delt Reverse Fly (Dumbbell)': '0383',
  'Rear Delt Reverse Fly (Machine)': '0602',
  'Romanian Deadlift (Dumbbell)': '1459',
  'Running': '0685', // run
  'Seated Cable Row - Bar Wide Grip': '0218', // cable seated wide-grip row
  'Seated Cable Row - V Grip (Cable)': '2661', // cable seated row with v bar
  'Seated Incline Curl (Dumbbell)': '0318',
  'Seated Leg Curl (Machine)': '0599', // lever seated leg curl
  'Seated Palms Up Wrist Curl': '0401',
  'Seated Wrist Extension (Barbell)': '0082', // barbell reverse wrist curl
  'Shoulder Press (Dumbbell)': '0405',
  'Single Arm Cable Row': '0214', // cable seated one arm alternate row
  'Single Leg Standing Calf Raise (Machine)': '0605',
  'Sprints': '5216', // sprint
  'Squat (Machine)': '1875', // lever squat (plate loaded)
  'Standing Leg Curls': '0795',
  'Straight Arm Lat Pulldown (Cable)': '0238', // cable straight arm pulldown
  'Triceps Dip': '0591',
  'Triceps Extension (Dumbbell)': '2188', // dumbbell seated triceps extension
  'Triceps Pushdown': '0241',
  'Walking': '0828', // walk
  'Warm Up': { custom: true, bodyPart: 'full body', targetMuscle: 'full body', equipment: null, category: 'cardio' },
};
