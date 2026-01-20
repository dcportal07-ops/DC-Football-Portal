// 📂 src/lib/drills.ts

// --- HELPER FUNCTIONS ---

export const getVideoLink = (drillName: string) => {
  if (!drillName) return "#";
  const query = `soccer drill ${drillName}`;
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
};

const getThumbnail = (category: string) => {
  switch (category) {
    case "Technical": return "https://images.pexels.com/photos/274422/pexels-photo-274422.jpeg?auto=compress&cs=tinysrgb&w=1200";
    case "Tactical": return "https://images.pexels.com/photos/114296/pexels-photo-114296.jpeg?auto=compress&cs=tinysrgb&w=1200";
    case "Physical": return "https://images.pexels.com/photos/3763879/pexels-photo-3763879.jpeg?auto=compress&cs=tinysrgb&w=1200";
    case "Mental": return "https://images.pexels.com/photos/399187/pexels-photo-399187.jpeg?auto=compress&cs=tinysrgb&w=1200";
    default: return "/drill-placeholder.jpg";
  }
};

// --- DATA DEFINITIONS ---

// Helper to create drill objects quickly
// The level parameter is constrained to specific string literals
const d = (id: string, name: string, category: string, desc: string, level: "Beginner" | "Intermediate" | "Advanced" = "Intermediate") => {
  // Auto-assign skills based on category to save space
  let skills = ["General"];
  let minAge = 8;
  let maxAge = 16;

  if (category === "Technical") {
    skills = ["Ball Control", "Dribbling", "First Touch"];
    minAge = 6; maxAge = 14;
  } else if (category === "Tactical") {
    skills = ["Scanning", "Decision Making", "Awareness"];
    minAge = 12; maxAge = 18;
  } else if (category === "Physical") {
    skills = ["Agility", "Speed", "Strength"];
    minAge = 14; maxAge = 21;
  } else if (category === "Mental") {
    skills = ["Focus", "Resilience", "Communication"];
    minAge = 10; maxAge = 99;
  } else if (category === "Cognitive") {
    skills = ["Reaction", "Memory", "Processing Speed"];
    minAge = 10; maxAge = 18;
  }

  return {
    id, // Added comma here
    name,
    category,
    level,
    description: desc + " [cite: 1]", // Fixed property name syntax
    primarySkills: skills,
    minAge,
    maxAge
  };
};

export const MASTER_DRILLS = [
  // === 1. TECHNICAL (1-125) ===
  d("TECH_001", "Toe Taps (Stationary)", "Technical", "Alternate tapping the top of the ball with your soles. Switch feet fast!", "Beginner"),
  d("TECH_002", "Foundations (Bell Touches)", "Technical", "Knock the ball back and forth between feet using the inside of the foot.", "Beginner"),
  d("TECH_003", "Sole Rolls", "Technical", "Roll ball across body with sole from one foot to the other.", "Beginner"),
  d("TECH_004", "Inside-Outside (One Foot)", "Technical", "Touch inside then outside with the same foot quickly.", "Beginner"),
  d("TECH_005", "Push-Pull (Laces)", "Technical", "Push forward gently with laces. Pull back immediately with the bottom of your foot.", "Beginner"),
  d("TECH_006", "Push-Pull (Inside)", "Technical", "Push forward with the inside of your foot. Pull back with the bottom of your foot.", "Beginner"),
  d("TECH_007", "The V-Cut (Inside)", "Technical", "Push forward, pull back, push out to the side. Draw a letter V.", "Intermediate"),
  d("TECH_008", "The V-Cut (Outside)", "Technical", "Pull back, then push away diagonally with the outside of your foot.", "Intermediate"),
  d("TECH_009", "Roll & Stop (Inside)", "Technical", "Roll the ball across your body. Stop it quickly with the inside of your other foot.", "Intermediate"),
  d("TECH_010", "Roll & Stop (Outside)", "Technical", "Roll the ball across your body. Stop it quickly with the outside of the same foot.", "Intermediate"),
  d("TECH_011", "Triangle (Sole-Inside-Inside)", "Technical", "Pull back, pass side, push forward. Make a triangle shape.", "Intermediate"),
  d("TECH_012", "L-Turn (Pull Back)", "Technical", "Pull back and tap behind standing leg. Looks like an L.", "Intermediate"),
  d("TECH_013", "Reverse L-Turn", "Technical", "Pull back and tap behind leg using the outside of your foot.", "Advanced"),
  d("TECH_014", "Square Touches", "Technical", "Roll right, push forward, roll left, pull back. Draw a box.", "Intermediate"),
  d("TECH_015", "Toe Taps Forward", "Technical", "Do Toe Taps while taking tiny steps forward.", "Beginner"),
  d("TECH_016", "Toe Taps Backward", "Technical", "Do Toe Taps while hopping backwards. Look behind you!", "Intermediate"),
  d("TECH_017", "Inside Chop", "Technical", "Dribble forward. Chop down on the ball with the inside of your foot to turn.", "Intermediate"),
  d("TECH_018", "Outside Cut", "Technical", "Dribble forward. Cut the ball back using the outside of your foot.", "Intermediate"),
  d("TECH_019", "Sticky Tape (Circle)", "Technical", "Use the sole to move the ball in a circle around your standing leg.", "Advanced"),
  d("TECH_020", "Tick-Tock Roll", "Technical", "Two taps between feet, then one big roll across. Tick, Tock, Roll.", "Intermediate"),
  d("TECH_021", "One-Touch (Right)", "Technical", "Pass against wall using right foot only, no control. Instant return.", "Intermediate"),
  d("TECH_022", "One-Touch (Left)", "Technical", "Pass against wall using left foot only, no control. Instant return.", "Intermediate"),
  d("TECH_023", "Two-Touch (Same Foot)", "Technical", "Pass, Stop, Pass. Use the same foot for everything.", "Beginner"),
  d("TECH_024", "Two-Touch (Transfer)", "Technical", "Pass Right, Stop Right, Pass Left. Move the ball to the other foot.", "Intermediate"),
  d("TECH_025", "Two-Touch (Reverse)", "Technical", "Pass Right, Stop with Left. Pass Left, Stop with Right.", "Advanced"),
  d("TECH_026", "Sole Control (Futsal)", "Technical", "Pass to wall. Stop the ball by stepping on it lightly.", "Beginner"),
  d("TECH_027", "Outside Control (Right)", "Technical", "Pass to wall. Cushion the ball to the side with your pinky toe.", "Advanced"),
  d("TECH_028", "Outside Control (Left)", "Technical", "Use the outside of your Left foot to control the ball sideways.", "Advanced"),
  d("TECH_029", "Alternating One-Touch", "Technical", "Pass Right, Pass Left continuously. Keep dancing!", "Intermediate"),
  d("TECH_030", "The Punch (Laces Pass)", "Technical", "Kick the ball with your shoelaces. Point your toes down.", "Intermediate"),
  d("TECH_031", "Short-Short-Long", "Technical", "Two soft passes, one hard long pass. Change the power.", "Intermediate"),
  d("TECH_032", "Inside-Inside-Pass", "Technical", "When ball returns: Tap Right, Tap Left, then Pass.", "Intermediate"),
  d("TECH_033", "The Gate Precision", "Technical", "Put two cones on the wall. Aim exactly between them.", "Advanced"),
  d("TECH_034", "Weak Foot Burnout", "Technical", "Use ONLY your weak foot for 1 minute. No strong foot allowed!", "Advanced"),
  d("TECH_035", "The Scanner", "Technical", "Pass to wall. Look over your shoulder before the ball comes back.", "Advanced"),
  d("TECH_036", "Pull-Outside-Pull-Inside", "Technical", "V-pattern manipulation with same foot. Pull back, push out.", "Advanced"),
  d("TECH_037", "Alternating Pull-Out-Pull-In", "Technical", "Right foot V, then Left foot V. Continuous rhythm.", "Advanced"),
  d("TECH_038", "Cruyff Turn", "Technical", "Fake a shot! Hook the ball behind your standing leg instead.", "Intermediate"),
  d("TECH_039", "Scissors (Step-Around)", "Technical", "Circle foot around the front (Inside to Outside). Push away with other foot.", "Intermediate"),
  d("TECH_040", "Step-Over", "Technical", "Step over the ball (Outside to Inside). Take it away with the outside.", "Intermediate"),
  d("TECH_041", "Drag & Go", "Technical", "Drag ball sideways across body and sprint forward.", "Beginner"),
  d("TECH_042", "The Matthews", "Technical", "Touch inside slow, snap outside fast.", "Advanced"),
  d("TECH_043", "Reverse Matthews", "Technical", "Touch outside, snap inside fast.", "Advanced"),
  d("TECH_044", "Sole-Inside-Outside Combo", "Technical", "Pull, touch in, push out rhythm.", "Intermediate"),
  d("TECH_045", "Stop & Turn (180)", "Technical", "Stop ball dead, turn 180 degrees, dribble back.", "Beginner"),
  d("TECH_046", "Fake Pass (Drag)", "Technical", "Act like passing. Drag the ball across your body instead.", "Intermediate"),
  d("TECH_047", "Step-Over to Pull-Back", "Technical", "Step over to fake forward, then pull back to turn around.", "Intermediate"),
  d("TECH_048", "V-Cut Behind Leg", "Technical", "Pull back and tap ball behind the heel of your standing foot.", "Advanced"),
  d("TECH_049", "Double Touch (Croqueta)", "Technical", "Rapid shift Right-to-Left foot to evade.", "Intermediate"),
  d("TECH_050", "Roll & Step-Over", "Technical", "Roll the ball, step over it while it moves.", "Advanced"),
  d("TECH_051", "The Zico", "Technical", "Step over, plant foot, spin body 360 degrees.", "Advanced"),
  d("TECH_052", "Inside-Outside Rolls", "Technical", "Roll across, stop with outside. Roll back, stop with inside.", "Intermediate"),
  d("TECH_053", "High Wave", "Technical", "Wave foot over ball without touching to fake.", "Beginner"),
  d("TECH_054", "Sole Drag & Scissors", "Technical", "Drag the ball, then immediately do a scissors move.", "Advanced"),
  d("TECH_055", "U-Turn", "Technical", "Use the outside of your foot to turn the ball in a U-shape.", "Intermediate"),
  d("TECH_056", "V-Pull & Pass (Open)", "Technical", "Pull back, open hips, push side, pass to wall.", "Intermediate"),
  d("TECH_057", "V-Pull & Pass (Across)", "Technical", "Pull back, touch across body, pass with other foot.", "Intermediate"),
  d("TECH_058", "Roll-Over & Pass", "Technical", "Roll ball across body and pass instantly.", "Intermediate"),
  d("TECH_059", "The Check (Sprint & Retreat)", "Technical", "Pass, sprint to wall, backpedal, receive.", "Intermediate"),
  d("TECH_060", "Lateral Shuffles", "Technical", "Pass, shuffle side-to-side, receive.", "Intermediate"), // Corrected from "Physical"
  d("TECH_126", "Tennis Ball Juggling", "Technical", "Juggle a small tennis ball with your feet for precision.", "Advanced"),
  d("TECH_127", "Hand-Foot Coordination", "Technical", "Juggle football with feet while catching a tennis ball with hands.", "Advanced"),
  d("TECH_130", "Wall Squash", "Technical", "Continuous 1-touch striking against a wall. No stops.", "Advanced"),
  d("TECH_135", "Barefoot Wall Pass", "Technical", "Pass against the wall without shoes to feel contact point.", "Beginner"),
  d("TECH_143", "Crossbar Challenge", "Technical", "Try to hit the crossbar from distance. Accuracy test!", "Intermediate"),

  // === 2. TACTICAL (146-245) ===
  d("TAC_146", "The Lighthouse Dribble", "Tactical", "Look up every 3 touches like a lighthouse scanning the sea.", "Intermediate"),
  d("TAC_147", "Cone Gates Scanning", "Tactical", "Dribble through different colored gates. Look up to find them!", "Beginner"),
  d("TAC_149", "Shoulder Check Wall Pass", "Tactical", "Look behind you before the ball comes back from the wall.", "Intermediate"),
  d("TAC_150", "Audio-Motor Reaction", "Tactical", "React to a sound (Clap or Whistle) by changing direction fast.", "Intermediate"),
  d("TAC_151", "Color Cone Touch", "Tactical", "Sprint to the color shouted by the coach.", "Beginner"),
  d("TAC_155", "Traffic Light Dribble", "Tactical", "Green means Go fast. Red means Stop dead. Yellow means slow skills.", "Beginner"),
  d("TAC_156", "Open Body Receive", "Tactical", "Turn hips sideways to see the whole field when receiving.", "Intermediate"),
  d("TAC_157", "Blind Side Check", "Tactical", "Check the space where you can't see (your blind spot).", "Advanced"),
  d("TAC_160", "Check Shoulder on Bounce", "Tactical", "Ball bounces? That's your trigger to look behind!", "Advanced"),
  d("TAC_167", "Two Color Gate Decision", "Tactical", "Coach holds two cones. Run through the color he lifts.", "Intermediate"),
  d("TAC_171", "The Binary Choice", "Tactical", "Coach points Left -> You score Right (Opposite).", "Advanced"),
  d("TAC_178", "The 360 Scanner", "Tactical", "Before receiving, spin your head to see ALL directions.", "Advanced"),
  d("TAC_186", "Man On Trigger", "Tactical", "If someone yells 'Man On', pass back immediately.", "Beginner"),
  d("TAC_193", "Stroop Test Dribble", "Tactical", "Coach shows word 'RED' in Blue ink. Shout 'BLUE'!", "Advanced"),
  d("TAC_208", "Third Man Run", "Tactical", "Pass to A, Run past B, Receive from C. Triangle movement.", "Advanced"),
  d("TAC_222", "Scan & Identify", "Tactical", "Scan. Was it a teammate or opponent? Shout it out.", "Advanced"),
  d("TAC_240", "Recovery Decisions", "Tactical", "You lost the ball. Do you press or drop back? Decide instantly.", "Advanced"),

  // === 3. COGNITIVE (246-265) ===
  d("COG_246", "Traffic Light (App Mode)", "Cognitive", "Phone Green = Go. Phone Red = Stop. React to the screen.", "Intermediate"),
  d("COG_247", "Inverted Logic", "Cognitive", "Green means STOP. Red means GO. Don't get tricked!", "Advanced"),
  d("COG_252", "Stroop Effect Run", "Cognitive", "App shows 'RED' in Blue ink. Run to Blue cone.", "Advanced"),
  d("COG_258", "Blind Turn", "Cognitive", "Throw ball high. Close eyes. Open when it hits ground -> Control it.", "Advanced"),
  d("COG_264", "Dual Tasking", "Cognitive", "Juggle. Count out loud every time the phone flashes Blue.", "Advanced"),

  // === 4. PHYSICAL (266-325) ===
  d("PHY_266", "5-10-5 Pro Agility", "Physical", "Sprint 5 yards right, 10 yards left, 5 yards right. Touch lines!", "Advanced"),
  d("PHY_267", "The T-Drill", "Physical", "Sprint forward, shuffle right, shuffle left, backpedal home.", "Intermediate"),
  d("PHY_269", "Zig-Zag Sprints", "Physical", "Place cones in zig-zag. Sprint and cut around them fast.", "Beginner"),
  d("PHY_271", "Deceleration Steps", "Physical", "Sprint fast. Stop dead in 3 steps. Chop your feet!", "Intermediate"),
  d("PHY_274", "Wall Acceleration", "Physical", "Lean against wall. Drive knees up hard like sprinting.", "Beginner"),
  d("PHY_276", "Split Squat Jumps", "Physical", "Lunge position. Jump and switch legs in air. Land soft.", "Advanced"),
  d("PHY_281", "Broad Jumps", "Physical", "Jump forward as far as you can with two feet. Stick the landing.", "Intermediate"),
  d("PHY_287", "Icky Shuffle", "Physical", "Footwork pattern through ladder: In, In, Out. Fast feet.", "Intermediate"),
  d("PHY_300", "Deceleration Test", "Physical", "Sprint 20m. Stop completely within 2 meters zone.", "Advanced"),
  d("PHY_312", "Copenhagen Plank", "Physical", "Side plank with knee on chair. Hard for groin muscles.", "Advanced"),
  d("PHY_324", "Visualization (Eyes Closed)", "Physical", "Lie down. Imagine scoring a goal perfectly. Feel it.", "Beginner"),

  // === 5. MENTAL (326-350) ===
  d("MEN_326", "Box Breathing", "Mental", "Breathe In 4s, Hold 4s, Out 4s, Hold 4s. Calm down.", "Beginner"),
  d("MEN_327", "The Mistake Ritual", "Mental", "Made a mistake? 'Flush it'. Make a physical motion to reset.", "Beginner"),
  d("MEN_329", "The Anchor Word", "Mental", "Pick a word like 'Power'. Say it when you need focus.", "Beginner"),
  d("MEN_332", "Positive Self-Talk Script", "Mental", "Write down: 'I am fast. I am strong.' Read it loud.", "Beginner"),
  d("MEN_334", "The Schulte Table", "Mental", "Find numbers 1-25 in a grid with your eyes fast. Focus drill.", "Intermediate"),
  d("MEN_338", "Reaction Ball Drop", "Mental", "Partner drops ball. Catch it. Pure focus.", "Intermediate"),
  d("MEN_343", "The Perfect Match", "Mental", "Visualize playing a perfect game from start to finish.", "Advanced"),
  d("MEN_347", "The If-Then Plan", "Mental", "'If I lose the ball, THEN I will sprint back instantly.' Plan reactions.", "Intermediate"),
  d("MEN_350", "The Confidence Bank", "Mental", "List 10 reasons why you are a good player. Read it before games.", "Beginner"),
];

// 🔥 SUPER FUNCTION: Fetch Full Drill Data
export const getDrillById = (id: string) => {
  const drill = MASTER_DRILLS.find((d) => d.id === id);
  
  if (!drill) return null;

  return {
    ...drill,
    videoUrl: getVideoLink(drill.name), // ✨ Auto-generate Video Link
    thumbnail: getThumbnail(drill.category), // ✨ Auto-assign Thumbnail
    duration: "10-15 min", 
    regressionTip: "Slow down the movement and perform without the ball first.",
    progressionTip: "Increase speed or add a passive defender.",
  };
};