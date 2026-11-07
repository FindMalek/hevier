// Look-alike catalogue entries that are the same move as another one (the
// same exercise drawn on another figure), checked by eye on 2026-11-07.
// Each is left out of our catalogue; the value is the entry kept instead.
// An installed one is only removed when nothing uses it (migration 013).
export const HIDDEN_EXERCISES: Record<string, string> = {
  '2249': '0241', // Triceps Pushdown - V Bar (Cable) -> Triceps Pushdown
  '4355': '0241', // Triceps Pushdown V2 - V Bar (Cable) -> Triceps Pushdown
  '7892': '2188', // Seated Triceps Extension V2 (Dumbbell) -> Triceps Extension (Dumbbell)
  '2683': '0082', // Reverse Wrist Curl V2 (Barbell) -> Seated Wrist Extension (Barbell)
  '9066': '10818', // 4 Way Single Leg Hop -> 4 Way Single Leg Hop V2
  '4515': '1405', // Back Pec Stretch V2 -> Back Pec Stretch
  '5302': '0020', // Balance Board V2 -> Balance Board
  '5122': '5190', // Clean and Jerk (Barbell) -> Clean and Jerk V2 (Barbell)
  '2394': '2844', // Floor Hyperextension -> Floor Hyperextension V2
  '5213': '0630', // Mountain Climber V2 -> Mountain Climber
  '4859': '0664', // Push Up to Side Plank V2 -> Push-up to Side Plank
  '0867': '4934', // Reverse Plank #2 -> Reverse Plank V2
  '7113': '0433', // Straight Arm Pullover V2 (Dumbbell) #2 -> Straight Arm Pullover (Dumbbell)
  '1104': '5876', // Suspension Triceps Extension V2 -> Suspension Triceps Extension
  '7751': '7563', // Swing Clean Grip Front Squat V2 (Kettlebell) -> Swing Clean Grip Front Squat (Kettlebell)
  '2969': '2968', // Thruster V2 (Dumbbell) -> Thruster (Dumbbell)
  '5130': '5110', // Triceps Dip Floor V2 -> Triceps Dip Floor
  '1069': '0243', // Twist V3 (Cable) -> Twist (Cable)
  '5118': '0243', // Twist V2 (Cable) -> Twist (Cable)
  '1208': '0862', // Twist V2 - Up Down (Cable) -> Twist - Up-down (Cable)
  '6016': '4620', // Twisting Crunch V2 -> Twisting Crunch
  '0121': '0120', // Upright Row V3 (Barbell) -> Upright Row (Barbell)
  '0119': '0120', // Upright Row V2 (Barbell) -> Upright Row (Barbell)
  '4250': '3336', // V Up V2 (Dumbbell) -> V Up (Dumbbell)
  '2544': '1325', // Wide Grip Rear Pulldown Behind Neck V2 (Cable) -> Wide Grip Rear Pulldown Behind Neck (Cable)
};
