export type AgeGroup = "U7-U8" | "U9-U10" | "U11-U12" | "U13-U14" | "U15-U17";
export const getCriteriaText = (ageGroup: AgeGroup, category: string, skill: string, score: number) => {
  const groupData = RUBRICS[ageGroup] as any;
  if (!groupData || !groupData[category] || !groupData[category][skill]) return "";

  // Map slider value to the rubric key
  let key = 1; 
  if (score >= 3) key = 3;
  if (score >= 5) key = 5;
  if (score >= 7) key = 7;
  if (score >= 9) key = 9;

  return groupData[category][skill][key] || "No description available.";
};

export const RUBRICS: Record<AgeGroup, any> = {
  "U7-U8": {
    premise: "Evaluation focuses on emergence of behaviors, not consistency. Typical range: 2-4.",
    technical: {
      "Ball Control": {
        1: "Unable to stop the ball; ball frequently escapes",
        3: "Stops the ball when stationary or moving slowly",
        5: "Controls the ball and keeps it close in simple situations",
        7: "Controls the ball and prepares the next action",
        9: "Not expected at U7-U8"
      },
      "Dribbling": {
        1: "Avoids dribbling; kicks ball away",
        3: "Dribbles forward with limited control",
        5: "Dribbles while changing direction",
        7: "Dribbles with awareness of space or opponent",
        9: "Not expected at U7-U8"
      },
      "Passing": {
        1: "Rarely attempts to pass",
        3: "Attempts short passes to nearby teammates",
        5: "Passes intentionally to a visible teammate",
        7: "Chooses to pass instead of dribble",
        9: "Not expected at U7-U8"
      },
      "Shooting": {
        1: "Rarely attempts to shoot",
        3: "Shoots when close to goal",
        5: "Shoots with direction and intent",
        7: "Adjusts body to shoot while moving",
        9: "Not expected at U7-U8"
      },
      "First Touch": {
        1: "First touch causes loss of control",
        3: "First touch stops the ball",
        5: "First touch prepares the next action",
        7: "First touch moves the ball into space",
        9: "Not expected at U7-U8"
      },
      "Weak Foot Use": {
        1: "Uses only dominant foot",
        3: "Occasionally touches the ball with weak foot",
        5: "Uses weak foot naturally when needed",
        7: "Comfortable using both feet",
        9: "Not expected at U7-U8"
      }
    },
    tactical: {
      "Positioning": {
        1: "Follows the ball everywhere",
        3: "Sometimes stays in own area",
        5: "Begins to recognize space",
        7: "Adjusts position relative to the ball",
        9: "Not expected at U7-U8"
      },
      "Decision-Making": {
        1: "Acts randomly",
        3: "Chooses an action after delay",
        5: "Chooses between dribble or pass",
        7: "Chooses before pressure arrives",
        9: "Not expected at U7-U8"
      },
      "Game Awareness": {
        1: "Focused only on the ball",
        3: "Occasionally notices teammates",
        5: "Looks up before acting",
        7: "Anticipates simple situations",
        9: "Not expected at U7-U8"
      },
      "Support Play": {
        1: "Stands still when teammate has the ball",
        3: "Moves toward the ball",
        5: "Moves to help teammate",
        7: "Creates a simple passing option",
        9: "Not expected at U7-U8"
      },
      "Transition": {
        1: "Stops playing after losing the ball",
        3: "Reacts slowly",
        5: "Attempts to win the ball back",
        7: "Reacts immediately",
        9: "Not expected at U7-U8"
      },
      "Adaptability": {
        1: "Needs constant instructions",
        3: "Adapts after explanation",
        5: "Applies simple instructions",
        7: "Adjusts independently",
        9: "Not expected at U7-U8"
      }
    },
    physical: {
      "General Physical": {
        1: "Poor movement control; frequent loss of balance",
        3: "Basic movement control",
        5: "Functional, coordinated movement",
        7: "Efficient and confident movement",
        9: "Not expected at U7-U8"
      }
    },
    mental: {
      "General Mental": {
        1: "Low engagement; easily distracted",
        3: "Engages with reminders",
        5: "Engaged and responsive",
        7: "Proactive and positive behavior",
        9: "Not expected at U7-U8"
      }
    }
  },

  "U9-U10": {
    premise: "Focuses on functional execution and early decision-making. Typical range: 3-5.",
    technical: {
       "Ball Control": {
         1: "Struggles to control the ball; frequent loss",
         3: "Controls the ball in static or low-speed situations",
         5: "Controls the ball while moving and keeps it close",
         7: "Controls and directs the ball into space",
         9: "Not expected at U9-U10"
       },
       "Dribbling": {
         1: "Avoids dribbling or loses control immediately",
         3: "Dribbles forward with limited change of direction",
         5: "Dribbles with changes of direction and speed",
         7: "Dribbles to beat an opponent intentionally",
         9: "Not expected at U9-U10"
       },
       "Passing": {
         1: "Rarely attempts to pass",
         3: "Passes short distances when unpressured",
         5: "Passes accurately to open teammates",
         7: "Chooses passing options under light pressure",
         9: "Not expected at U9-U10"
       },
       "Shooting": {
         1: "Rarely shoots or shoots without direction",
         3: "Shoots when close to goal",
         5: "Shoots with intention and basic technique",
         7: "Shoots accurately while moving",
         9: "Not expected at U9-U10"
       },
       "First Touch": {
         1: "First touch often loses control",
         3: "First touch stops the ball",
         5: "First touch prepares the next action",
         7: "First touch consistently moves ball into space",
         9: "Not expected at U9-U10"
       },
       "Weak Foot Use": {
         1: "Uses only dominant foot",
         3: "Uses weak foot only when forced",
         5: "Uses weak foot in simple actions",
         7: "Confident with both feet in play",
         9: "Not expected at U9-U10"
       }
    },
    tactical: {
        "Positioning": {
            1: "Chases the ball constantly",
            3: "Maintains position inconsistently",
            5: "Recognizes basic positioning",
            7: "Adjusts position according to ball and teammates",
            9: "Not expected at U9-U10"
        },
        "Decision-Making": {
            1: "Acts randomly under pressure",
            3: "Makes decisions slowly",
            5: "Chooses appropriate actions in simple situations",
            7: "Chooses actions before pressure arrives",
            9: "Not expected at U9-U10"
        },
        "Game Awareness": {
            1: "Focused only on the ball",
            3: "Occasionally scans surroundings",
            5: "Looks up before acting",
            7: "Anticipates basic game situations",
            9: "Not expected at U9-U10"
        },
        "Support Play": {
            1: "Rarely offers support",
            3: "Moves toward the ball",
            5: "Provides simple passing options",
            7: "Supports teammates consistently",
            9: "Not expected at U9-U10"
        },
        "Transition": {
            1: "Stops playing after losing possession",
            3: "Reacts late in transitions",
            5: "Reacts to loss or gain of the ball",
            7: "Reacts immediately and with purpose",
            9: "Not expected at U9-U10"
        },
        "Adaptability": {
            1: "Needs constant instruction",
            3: "Adapts after repeated explanation",
            5: "Applies instructions in play",
            7: "Adjusts behavior independently",
            9: "Not expected at U9-U10"
        }
    },
    physical: {
        "General Physical": {
            1: "Poor coordination and movement control",
            3: "Basic movement ability",
            5: "Functional and coordinated movement",
            7: "Efficient and confident movement",
            9: "Not expected at U9-U10"
        }
    },
    mental: {
        "General Mental": {
            1: "Low engagement and focus",
            3: "Engages with reminders",
            5: "Consistently engaged and responsive",
            7: "Proactive, confident, positive behavior",
            9: "Not expected at U9-U10"
        }
    }
  },

  "U11-U12": {
    premise: "Focuses on functional execution under pressure and emerging game understanding. Typical range: 4-6.",
    technical: {
       "Ball Control": {
         1: "Frequently loses control, even without pressure",
         3: "Controls the ball in simple, unpressured situations",
         5: "Controls the ball while moving and under light pressure",
         7: "Controls the ball and immediately creates an advantage",
         9: "Not expected at U11-U12"
       },
       "Dribbling": {
         1: "Dribbling attempts usually fail",
         3: "Dribbles forward with limited effectiveness",
         5: "Dribbles to protect or advance the ball",
         7: "Dribbles intentionally to beat an opponent",
         9: "Not expected at U11-U12"
       },
       "Passing": {
         1: "Inaccurate or poorly timed passes",
         3: "Accurate short passes in low pressure",
         5: "Passes accurately to teammates in space",
         7: "Passes accurately under pressure and at speed",
         9: "Not expected at U11-U12"
       },
       "Shooting": {
         1: "Shooting technique inconsistent or ineffective",
         3: "Shoots accurately only when stationary",
         5: "Shoots with control and intent",
         7: "Shoots accurately while moving or under pressure",
         9: "Not expected at U11-U12"
       },
       "First Touch": {
         1: "First touch frequently breaks the action",
         3: "First touch stops the ball reliably",
         5: "First touch prepares the next action",
         7: "First touch consistently creates advantage",
         9: "Not expected at U11-U12"
       },
       "Weak Foot Use": {
         1: "Avoids using the weaker foot",
         3: "Uses weaker foot only in simple actions",
         5: "Uses weaker foot naturally in play",
         7: "Confident with both feet under pressure",
         9: "Not expected at U11-U12"
       }
    },
    tactical: {
        "Positioning": {
            1: "Frequently out of position",
            3: "Maintains position inconsistently",
            5: "Positions correctly in most situations",
            7: "Anticipates positioning relative to play",
            9: "Not expected at U11-U12"
        },
        "Decision-Making": {
            1: "Makes inappropriate decisions under pressure",
            3: "Decisions are correct but slow",
            5: "Chooses appropriate actions consistently",
            7: "Makes quick and effective decisions",
            9: "Not expected at U11-U12"
        },
        "Game Awareness": {
            1: "Rarely scans or anticipates",
            3: "Scans occasionally before acting",
            5: "Regularly scans and reacts",
            7: "Anticipates game situations early",
            9: "Not expected at U11-U12"
        },
        "Support Play": {
            1: "Rarely supports teammates",
            3: "Supports inconsistently",
            5: "Provides effective passing options",
            7: "Consistently supports play and teammates",
            9: "Not expected at U11-U12"
        },
        "Transition": {
            1: "Reacts late to transitions",
            3: "Reacts but without intensity",
            5: "Reacts appropriately to transitions",
            7: "Reacts immediately and effectively",
            9: "Not expected at U11-U12"
        },
        "Adaptability": {
            1: "Struggles to apply instructions",
            3: "Applies instructions inconsistently",
            5: "Applies instructions during play",
            7: "Adjusts autonomously to situations",
            9: "Not expected at U11-U12"
        }
    },
    physical: {
        "General Physical": {
            1: "Poor coordination and physical control",
            3: "Basic physical ability",
            5: "Functional physical performance",
            7: "Efficient and confident physical execution",
            9: "Not expected at U11-U12"
        }
    },
    mental: {
        "General Mental": {
            1: "Low focus and emotional control",
            3: "Focuses with frequent reminders",
            5: "Maintains focus and engagement",
            7: "Confident, resilient, proactive behavior",
            9: "Not expected at U11-U12"
        }
    }
  },

  "U13-U14": {
    premise: "Focuses on decision speed, tactical responsibility, and execution under pressure. Typical range: 5-7.",
    technical: {
       "Ball Control": {
         1: "Loses control frequently, even without pressure",
         3: "Controls the ball but slows the action",
         5: "Controls the ball under moderate pressure",
         7: "Controls and immediately plays forward",
         9: "Controls while anticipating next action"
       },
       "Dribbling": {
         1: "Dribbling attempts rarely successful",
         3: "Dribbles forward without purpose",
         5: "Dribbles to protect or progress play",
         7: "Dribbles to beat opponents at speed",
         9: "Dribbles to create consistent advantage"
       },
       "Passing": {
         1: "Pass accuracy and timing poor",
         3: "Passes accurately only when unpressured",
         5: "Passes accurately under moderate pressure",
         7: "Passes accurately at speed and under pressure",
         9: "Breaks lines consistently with passing"
       },
       "Shooting": {
         1: "Shooting technique unreliable",
         3: "Shoots accurately only when set",
         5: "Shoots with control under pressure",
         7: "Shoots accurately while moving",
         9: "Finishes consistently in varied situations"
       },
       "First Touch": {
         1: "First touch disrupts play",
         3: "First touch controls but delays action",
         5: "First touch prepares next action",
         7: "First touch creates immediate advantage",
         9: "First touch anticipates pressure and space"
       },
       "Weak Foot Use": {
         1: "Avoids using weaker foot",
         3: "Uses weaker foot only when forced",
         5: "Uses weaker foot functionally",
         7: "Confident with weaker foot under pressure",
         9: "Two-footed execution at game speed"
       }
    },
    tactical: {
        "Positioning": {
            1: "Frequently out of position",
            3: "Maintains position inconsistently",
            5: "Positions correctly most of the time",
            7: "Anticipates positioning relative to play",
            9: "Positions to influence multiple phases"
        },
        "Decision-Making": {
            1: "Decisions frequently inappropriate",
            3: "Correct decisions but too slow",
            5: "Makes appropriate decisions consistently",
            7: "Makes fast and effective decisions",
            9: "Consistently chooses optimal solutions"
        },
        "Game Awareness": {
            1: "Limited scanning or anticipation",
            3: "Scans but reacts late",
            5: "Scans and reacts appropriately",
            7: "Anticipates play before receiving",
            9: "Reads and controls game situations"
        },
        "Support Play": {
            1: "Rarely supports teammates",
            3: "Supports inconsistently",
            5: "Provides reliable support options",
            7: "Supports play proactively",
            9: "Creates superiorities consistently"
        },
        "Transition": {
            1: "Slow reaction to transitions",
            3: "Reacts but without intensity",
            5: "Reacts appropriately to transitions",
            7: "Immediate, aggressive reaction",
            9: "Controls transition moments"
        },
        "Adaptability": {
            1: "Struggles to adapt",
            3: "Adapts after instruction",
            5: "Adjusts during play",
            7: "Adapts autonomously",
            9: "Anticipates and adapts proactively"
        }
    },
    physical: {
        "General Physical": {
            1: "Physical limitations affect performance",
            3: "Adequate physical performance",
            5: "Functional physical performance",
            7: "Strong and efficient physical execution",
            9: "Dominant physical presence for age"
        }
    },
    mental: {
        "General Mental": {
            1: "Low emotional control and focus",
            3: "Inconsistent focus and confidence",
            5: "Maintains focus and emotional balance",
            7: "Confident, resilient, leadership behaviors",
            9: "Mental reference point for team"
        }
    }
  },

  "U15-U17": {
    premise: "Focuses on consistency, autonomy, and game impact. Typical range: 6-8.",
    technical: {
       "Ball Control": {
         1: "Frequently loses control under pressure",
         3: "Controls ball but slows or limits play",
         5: "Controls ball reliably under pressure",
         7: "Controls and plays forward immediately",
         9: "Controls while anticipating next action at speed"
       },
       "Dribbling": {
         1: "Dribbling ineffective in game context",
         3: "Dribbles without creating advantage",
         5: "Dribbles to protect or progress play",
         7: "Beats opponents consistently at speed",
         9: "Creates numerical or positional superiority"
       },
       "Passing": {
         1: "Poor accuracy or timing",
         3: "Accurate passes without pressure",
         5: "Accurate passes under pressure",
         7: "Breaks lines with speed and precision",
         9: "Dictates tempo and progression through passing"
       },
       "Shooting": {
         1: "Inconsistent or ineffective finishing",
         3: "Finishes only in favorable situations",
         5: "Finishes reliably under pressure",
         7: "Finishes from varied angles and situations",
         9: "Consistent, high-level finishing ability"
       },
       "First Touch": {
         1: "First touch disrupts play",
         3: "First touch controls but delays action",
         5: "First touch prepares next action",
         7: "First touch creates advantage",
         9: "First touch dictates the next phase of play"
       },
       "Weak Foot Use": {
         1: "Avoids weaker foot",
         3: "Uses weaker foot only when forced",
         5: "Functional use of weaker foot",
         7: "Confident two-footed execution",
         9: "Two-footed at full game speed"
       }
    },
    tactical: {
        "Positioning": {
            1: "Frequently out of position",
            3: "Maintains position inconsistently",
            5: "Positions correctly in most phases",
            7: "Anticipates and optimizes positioning",
            9: "Controls space and structure for the team"
        },
        "Decision-Making": {
            1: "Decisions harm team play",
            3: "Correct decisions but slow",
            5: "Makes appropriate decisions consistently",
            7: "Fast, effective decisions under pressure",
            9: "Consistently optimal decision-making"
        },
        "Game Awareness": {
            1: "Limited awareness of surroundings",
            3: "Scans but reacts late",
            5: "Reads situations adequately",
            7: "Anticipates play before it develops",
            9: "Reads and controls game rhythm"
        },
        "Support Play": {
            1: "Rarely offers support",
            3: "Support inconsistent",
            5: "Provides reliable support options",
            7: "Proactively supports and connects play",
            9: "Creates and sustains team superiority"
        },
        "Transition": {
            1: "Slow or ineffective reactions",
            3: "Reacts inconsistently",
            5: "Reacts appropriately to transitions",
            7: "Immediate, decisive transition actions",
            9: "Controls transition moments consistently"
        },
        "Adaptability": {
            1: "Struggles to adapt to changes",
            3: "Adapts after instruction",
            5: "Adjusts during play",
            7: "Adapts autonomously",
            9: "Anticipates and drives tactical adjustments"
        }
    },
    physical: {
        "General Physical": {
            1: "Physical limitations affect performance",
            3: "Adequate physical capacity",
            5: "Functional physical performance",
            7: "Strong, efficient, repeatable performance",
            9: "Physically dominant for age level"
        }
    },
    mental: {
        "General Mental": {
            1: "Poor emotional control and focus",
            3: "Inconsistent confidence and engagement",
            5: "Stable focus and emotional balance",
            7: "Leadership, resilience, accountability",
            9: "Reference point for team mentality"
        }
    }
  }
};