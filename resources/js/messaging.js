// Import necessary modules
import { getToken, onMessage } from "firebase/messaging";

// Function to request notification permission
export async function requestNotificationPermission(messaging) {
  try {
    const currentToken = await getToken(messaging);
    // Handle token and permissions
  } catch (error) {
    console.error("Error requesting permission:", error);
  }
}

// Function to listen for incoming messages
export function setupNotificationListener(messaging) {
  onMessage(messaging, (payload) => {
    // Handle incoming messages
  });
}
