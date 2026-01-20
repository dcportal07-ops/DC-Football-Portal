import axios from "axios";

const WEBHOOK_URL = process.env.N8N_WEBHOOK_URL;

export type EventType =
  | "COACH_CREATED" | "COACH_UPDATED" | "COACH_DELETED"
  | "PLAYER_CREATED" | "PLAYER_UPDATED" | "PLAYER_DELETED"
  | "TEAM_CREATED"
  | "EVALUATION_SUBMITTED"
  | "DRILL_CREATED"
  | "HOMEWORK_ASSIGNED";

export const sendNotification = async (
  event: EventType,
  payload: {
    entity?: string;
    action?: string;
    body: any;
  }
) => {
  if (!WEBHOOK_URL) {
    console.warn("⚠️ N8N_WEBHOOK_URL missing");
    return;
  }

  // 1️⃣ Calculate Variables
  const splitEvent = event.split("_");
  const derivedEntity = payload.entity || splitEvent[0];
  const derivedAction = payload.action || splitEvent.slice(1).join("_");

  // 🔍 DEBUG: Print exactly what we are trying to send
  console.log("----- DEBUG START -----");
  console.log("Event:", event);
  console.log("Payload Body:", JSON.stringify(payload.body, null, 2)); 
  console.log("----- DEBUG END -----");

  try {
    // 2️⃣ Flatten the data (Spread Operator)
    // Instead of nesting inside "body", we put name/code at the top!
    await axios.post(WEBHOOK_URL, {
      event,
      entity: derivedEntity,
      action: derivedAction,
      timestamp: new Date().toISOString(),
      ...payload.body, // 👈 THIS IS THE MAGIC FIX
    });

    console.log(`🚀 n8n triggered → ${event}`);
  } catch (error) {
    console.error("❌ n8n failed", error);
  }
};