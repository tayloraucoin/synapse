import os from "node:os";

/**
 * LAN IPv4 hostnames for Next.js `allowedDevOrigins`.
 * Without these, Next 16+ blocks `/_next/*` + HMR from phone/LAN origins,
 * so the page SSR-renders but client JS never hydrates (dead buttons, broken layout).
 */
export function getLocalDevOrigins() {
  try {
    return [
      ...new Set(
        Object.values(os.networkInterfaces())
          .flat()
          .filter(
            (iface) =>
              iface &&
              !iface.internal &&
              (iface.family === "IPv4" || iface.family === 4) &&
              !iface.address.startsWith("169.254."),
          )
          .map((iface) => iface.address),
      ),
    ];
  } catch {
    return [];
  }
}
