import QRCode from "qrcode";

export async function generateEventQrDataUrl(
  url: string,
  size = 200,
): Promise<string> {
  return QRCode.toDataURL(url, {
    width: size,
    margin: 1,
    color: {
      dark: "#0a0a0a",
      light: "#ffffff",
    },
  });
}
